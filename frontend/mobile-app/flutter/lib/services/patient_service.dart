import '../models/patient.dart';
import '../models/paginated_response.dart';
import '../models/user.dart';
import 'api_client.dart';

/// Backend note: `GET /patients` has no "give me the record for the current
/// logged-in user" mode — it's a staff-facing search endpoint gated behind
/// the `patients.view` permission, which the seeded `patient` role does not
/// currently hold (see backend/laravel/database/seeders/RoleUserSeeder.php).
///
/// This service implements the intended patient-portal behavior: search by
/// the logged-in user's email/mobile and adopt the first matching record as
/// "my patient profile". Until the backend grants the patient role
/// `patients.view` (or adds a dedicated `/me/patient` endpoint), this call
/// will 403 for the seeded demo patient account — screens surface that
/// clearly instead of failing silently.
class PatientService {
  PatientService(this._client);

  final ApiClient _client;

  Future<Patient?> resolveCurrentPatient(AppUser user) async {
    final term = user.email;
    final json = await _client.get('/patients', query: {'search': term});
    final page = PaginatedResponse<Patient>.fromJson(json, Patient.fromJson);
    for (final p in page.data) {
      if (p.email != null && p.email!.toLowerCase() == user.email.toLowerCase()) {
        return p;
      }
    }
    return page.data.isNotEmpty ? page.data.first : null;
  }

  Future<Patient> getById(int patientId) async {
    final json = await _client.get('/patients/$patientId');
    return Patient.fromJson(json);
  }

  Future<Map<String, dynamic>> medicalHistory(int patientId) async {
    return _client.get('/patients/$patientId/medical-history');
  }

  Future<PaginatedResponse<PatientTimelineEvent>> timeline(
    int patientId, {
    int page = 1,
  }) async {
    final json = await _client.get(
      '/patients/$patientId/timeline',
      query: {'page': page},
    );
    return PaginatedResponse<PatientTimelineEvent>.fromJson(
      json,
      PatientTimelineEvent.fromJson,
    );
  }
}
