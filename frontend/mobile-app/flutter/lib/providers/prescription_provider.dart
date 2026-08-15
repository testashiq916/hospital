import 'package:flutter/foundation.dart';

import '../models/prescription.dart';
import '../services/api_client.dart';
import '../services/prescription_service.dart';

class PrescriptionProvider extends ChangeNotifier {
  PrescriptionProvider(ApiClient client)
      : _service = PrescriptionService(client);

  final PrescriptionService _service;

  bool isLoading = false;
  String? error;
  List<Prescription> prescriptions = [];

  Future<void> load(int patientId) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final page = await _service.list(patientId: patientId);
      prescriptions = page.data;
    } on ApiException catch (e) {
      error = e.displayMessage;
    } catch (e) {
      error = 'Failed to load prescriptions: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<Prescription> loadDetail(int id) => _service.show(id);
}
