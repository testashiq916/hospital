import '../models/appointment.dart';
import '../models/paginated_response.dart';
import 'api_client.dart';

class AppointmentService {
  AppointmentService(this._client);

  final ApiClient _client;

  Future<PaginatedResponse<Appointment>> list({
    required int patientId,
    String? status,
    int page = 1,
  }) async {
    final json = await _client.get('/appointments', query: {
      'patient_id': patientId,
      'status': status,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<Appointment>.fromJson(json, Appointment.fromJson);
  }

  Future<Appointment> show(int id) async {
    final json = await _client.get('/appointments/$id');
    return Appointment.fromJson(json);
  }

  /// Books an appointment. `appointmentTime` must be `HH:mm` or `HH:mm:ss`.
  /// Returns the created [Appointment], which carries the allocated
  /// `token_number`/`queue_number` the confirmation screen displays.
  Future<Appointment> book({
    required int hospitalId,
    required int patientId,
    required int doctorId,
    required DateTime appointmentDate,
    required String appointmentTime,
    String appointmentType = 'opd',
    String? reason,
    bool isTeleconsultation = false,
  }) async {
    final dateStr =
        '${appointmentDate.year.toString().padLeft(4, '0')}-'
        '${appointmentDate.month.toString().padLeft(2, '0')}-'
        '${appointmentDate.day.toString().padLeft(2, '0')}';

    final json = await _client.post('/appointments', body: {
      'hospital_id': hospitalId,
      'patient_id': patientId,
      'doctor_id': doctorId,
      'appointment_date': dateStr,
      'appointment_time': appointmentTime,
      'appointment_type': appointmentType,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
      'is_teleconsultation': isTeleconsultation,
    });
    return Appointment.fromJson(json);
  }

  Future<Appointment> cancel(int id, {String? reason}) async {
    final json = await _client.post(
      '/appointments/$id/cancel',
      body: {if (reason != null && reason.isNotEmpty) 'reason': reason},
    );
    return Appointment.fromJson(json);
  }
}
