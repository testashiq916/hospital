import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/patient.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/patient_service.dart';
import '../services/storage_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// Owns the session: token lifecycle, the logged-in [AppUser], and the
/// resolved [Patient] record linked to that user (best-effort — see
/// `PatientService` for why this can legitimately come back null against
/// the current seed data).
class AuthProvider extends ChangeNotifier {
  AuthProvider({ApiClient? client, StorageService? storage})
      : _storage = storage ?? StorageService(),
        _client = client ?? ApiClient(storage: storage) {
    _authService = AuthService(_client);
    _patientService = PatientService(_client);
    _client.onUnauthorized = _handleUnauthorized;
  }

  final ApiClient _client;
  final StorageService _storage;
  late final AuthService _authService;
  late final PatientService _patientService;

  AuthStatus status = AuthStatus.unknown;
  AppUser? user;
  Patient? patient;
  String? patientResolutionError;
  bool isLoading = false;
  String? errorMessage;

  ApiClient get client => _client;

  Future<void> bootstrap() async {
    final token = await _storage.readToken();
    if (token == null || token.isEmpty) {
      status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }
    try {
      user = await _authService.me();
      await _storage.saveUser(user!);
      status = AuthStatus.authenticated;
      notifyListeners();
      unawaited(_resolvePatient());
    } catch (_) {
      await _storage.clearAll();
      status = AuthStatus.unauthenticated;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password, {String? companyCode}) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      final (token, loggedInUser) = await _authService.login(
        email: email,
        password: password,
        companyCode: companyCode,
      );
      await _storage.saveToken(token);
      await _storage.saveUser(loggedInUser);
      user = loggedInUser;
      status = AuthStatus.authenticated;
      isLoading = false;
      notifyListeners();
      unawaited(_resolvePatient());
      return true;
    } on ApiException catch (e) {
      errorMessage = e.displayMessage;
      isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      errorMessage = 'Unexpected error: $e';
      isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _resolvePatient() async {
    if (user == null) return;
    try {
      final resolved = await _patientService.resolveCurrentPatient(user!);
      patient = resolved;
      patientResolutionError = resolved == null
          ? 'No patient profile is linked to this account yet.'
          : null;
      await _storage.savePatientId(resolved?.id);
    } on ApiException catch (e) {
      patient = null;
      patientResolutionError = e.displayMessage;
    } catch (e) {
      patient = null;
      patientResolutionError = 'Could not load your patient profile: $e';
    }
    notifyListeners();
  }

  Future<void> retryPatientResolution() => _resolvePatient();

  Future<void> logout() async {
    try {
      await _authService.logout();
    } catch (_) {
      // Best-effort server-side revoke; local wipe proceeds regardless.
    }
    await _storage.clearAll();
    user = null;
    patient = null;
    patientResolutionError = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void _handleUnauthorized() {
    if (status != AuthStatus.authenticated) return;
    _storage.clearAll();
    user = null;
    patient = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
