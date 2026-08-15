import 'package:flutter/foundation.dart';

import '../models/appointment.dart';
import '../services/api_client.dart';
import '../services/appointment_service.dart';

class AppointmentProvider extends ChangeNotifier {
  AppointmentProvider(ApiClient client) : _service = AppointmentService(client);

  final AppointmentService _service;

  bool isLoading = false;
  String? error;
  List<Appointment> appointments = [];

  List<Appointment> get upcoming =>
      appointments.where((a) => a.isUpcoming).toList()
        ..sort((a, b) => (a.appointmentDate ?? DateTime(2100))
            .compareTo(b.appointmentDate ?? DateTime(2100)));

  List<Appointment> get history =>
      appointments.where((a) => !a.isUpcoming).toList()
        ..sort((a, b) => (b.appointmentDate ?? DateTime(2000))
            .compareTo(a.appointmentDate ?? DateTime(2000)));

  Future<void> load(int patientId) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final page = await _service.list(patientId: patientId, page: 1);
      appointments = page.data;
    } on ApiException catch (e) {
      error = e.displayMessage;
    } catch (e) {
      error = 'Failed to load appointments: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<Appointment> book({
    required int hospitalId,
    required int patientId,
    required int doctorId,
    required DateTime date,
    required String time,
    String? reason,
    String appointmentType = 'opd',
    bool isTeleconsultation = false,
  }) async {
    final appointment = await _service.book(
      hospitalId: hospitalId,
      patientId: patientId,
      doctorId: doctorId,
      appointmentDate: date,
      appointmentTime: time,
      reason: reason,
      appointmentType: appointmentType,
      isTeleconsultation: isTeleconsultation,
    );
    appointments = [appointment, ...appointments];
    notifyListeners();
    return appointment;
  }

  Future<void> cancel(int appointmentId, {String? reason}) async {
    final updated = await _service.cancel(appointmentId, reason: reason);
    appointments = appointments
        .map((a) => a.id == updated.id ? updated : a)
        .toList();
    notifyListeners();
  }
}
