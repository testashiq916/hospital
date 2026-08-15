import '../models/lab_report.dart';
import '../models/paginated_response.dart';
import 'api_client.dart';

class LabService {
  LabService(this._client);

  final ApiClient _client;

  Future<PaginatedResponse<LabReport>> reports({
    required int patientId,
    int page = 1,
  }) async {
    final json = await _client.get('/lab-reports', query: {
      'patient_id': patientId,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<LabReport>.fromJson(json, LabReport.fromJson);
  }

  Future<LabReport> report(int id) async {
    final json = await _client.get('/lab-reports/$id');
    return LabReport.fromJson(json);
  }

  Future<PaginatedResponse<LabOrder>> orders({
    required int patientId,
    String? status,
    int page = 1,
  }) async {
    final json = await _client.get('/lab-orders', query: {
      'patient_id': patientId,
      'status': status,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<LabOrder>.fromJson(json, LabOrder.fromJson);
  }
}
