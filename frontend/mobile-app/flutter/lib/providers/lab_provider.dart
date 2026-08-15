import 'package:flutter/foundation.dart';

import '../models/lab_report.dart';
import '../services/api_client.dart';
import '../services/lab_service.dart';

class LabProvider extends ChangeNotifier {
  LabProvider(ApiClient client) : _service = LabService(client);

  final LabService _service;

  bool isLoading = false;
  String? error;
  List<LabReport> reports = [];

  Future<void> load(int patientId) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final page = await _service.reports(patientId: patientId);
      reports = page.data;
    } on ApiException catch (e) {
      error = e.displayMessage;
    } catch (e) {
      error = 'Failed to load lab reports: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<LabReport> loadDetail(int id) => _service.report(id);
}
