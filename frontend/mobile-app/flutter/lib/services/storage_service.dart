import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/api_config.dart';
import '../models/user.dart';

/// Thin persistence layer.
///
/// The Sanctum bearer token is the one truly sensitive value, so it lives in
/// `flutter_secure_storage` (Keychain on iOS, EncryptedSharedPreferences /
/// Keystore-backed on Android). Everything else (cached user JSON, the
/// configurable API base URL, the resolved patient id) is convenience data
/// and lives in plain SharedPreferences.
class StorageService {
  final FlutterSecureStorage _secure = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveToken(String token) =>
      _secure.write(key: ApiConfig.secureStorageTokenKey, value: token);

  Future<String?> readToken() =>
      _secure.read(key: ApiConfig.secureStorageTokenKey);

  Future<void> clearToken() =>
      _secure.delete(key: ApiConfig.secureStorageTokenKey);

  Future<void> saveUser(AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConfig.prefsUserKey, jsonEncode(user.toJson()));
  }

  Future<Map<String, dynamic>?> readUserJson() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(ApiConfig.prefsUserKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConfig.prefsUserKey);
  }

  Future<void> savePatientId(int? patientId) async {
    final prefs = await SharedPreferences.getInstance();
    if (patientId == null) {
      await prefs.remove(ApiConfig.prefsPatientIdKey);
    } else {
      await prefs.setInt(ApiConfig.prefsPatientIdKey, patientId);
    }
  }

  Future<int?> readPatientId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(ApiConfig.prefsPatientIdKey);
  }

  Future<void> saveBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConfig.prefsBaseUrlKey, url);
  }

  Future<String?> readBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(ApiConfig.prefsBaseUrlKey);
  }

  /// Full logout wipe.
  Future<void> clearAll() async {
    await clearToken();
    await clearUser();
    await savePatientId(null);
  }
}
