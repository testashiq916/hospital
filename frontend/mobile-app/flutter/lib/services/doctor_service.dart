import '../models/doctor.dart';
import '../models/hospital.dart';
import '../models/paginated_response.dart';
import 'api_client.dart';

class DoctorService {
  DoctorService(this._client);

  final ApiClient _client;

  Future<List<Department>> departments({int? hospitalId}) async {
    final json = await _client.get(
      '/departments',
      query: {'hospital_id': hospitalId, 'per_page': 100},
    );
    final page = PaginatedResponse<Department>.fromJson(
      json,
      Department.fromJson,
    );
    return page.data;
  }

  Future<List<Doctor>> doctors({int? hospitalId}) async {
    final json = await _client.get(
      '/doctors',
      query: {'hospital_id': hospitalId, 'per_page': 100},
    );
    final page = PaginatedResponse<Doctor>.fromJson(json, Doctor.fromJson);
    return page.data;
  }

  Future<List<DoctorSchedule>> schedules(int doctorId) async {
    final json = await _client.get(
      '/doctor-schedules',
      query: {'doctor_id': doctorId, 'per_page': 50},
    );
    final page = PaginatedResponse<DoctorSchedule>.fromJson(
      json,
      DoctorSchedule.fromJson,
    );
    return page.data;
  }
}
