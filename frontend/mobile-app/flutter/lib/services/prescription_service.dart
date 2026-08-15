import '../models/paginated_response.dart';
import '../models/prescription.dart';
import 'api_client.dart';

class PrescriptionService {
  PrescriptionService(this._client);

  final ApiClient _client;

  Future<PaginatedResponse<Prescription>> list({
    required int patientId,
    int page = 1,
  }) async {
    final json = await _client.get('/prescriptions', query: {
      'patient_id': patientId,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<Prescription>.fromJson(
      json,
      Prescription.fromJson,
    );
  }

  Future<Prescription> show(int id) async {
    final json = await _client.get('/prescriptions/$id');
    return Prescription.fromJson(json);
  }
}
