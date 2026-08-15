import 'package:flutter/foundation.dart';

import '../models/bill.dart';
import '../services/api_client.dart';
import '../services/billing_service.dart';

class BillingProvider extends ChangeNotifier {
  BillingProvider(ApiClient client) : _service = BillingService(client);

  final BillingService _service;

  bool isLoading = false;
  String? error;
  List<HospitalBill> bills = [];

  double get totalOutstanding =>
      bills.fold(0, (sum, b) => sum + b.balanceAmount);

  Future<void> load(int patientId) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final page = await _service.bills(patientId: patientId);
      bills = page.data;
    } on ApiException catch (e) {
      error = e.displayMessage;
    } catch (e) {
      error = 'Failed to load bills: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<HospitalBill> loadDetail(int id) => _service.bill(id);

  Future<Payment> pay({
    required int billId,
    required double amount,
    required String paymentMethod,
    String? notes,
  }) async {
    final payment = await _service.pay(
      billId: billId,
      amount: amount,
      paymentMethod: paymentMethod,
      notes: notes,
    );
    // Refresh the affected bill's paid/balance figures locally so the list
    // reflects the payment immediately without a full reload.
    bills = bills.map((b) {
      if (b.id != billId) return b;
      final newPaid = b.paidAmount + amount;
      final newBalance = (b.totalAmount - newPaid).clamp(0, double.infinity);
      return HospitalBill(
        id: b.id,
        billCode: b.billCode,
        patientId: b.patientId,
        billDate: b.billDate,
        billType: b.billType,
        totalAmount: b.totalAmount,
        paidAmount: newPaid,
        balanceAmount: newBalance.toDouble(),
        paymentStatus: newBalance <= 0 ? 'paid' : 'partial',
        items: b.items,
        payments: b.payments,
      );
    }).toList();
    notifyListeners();
    return payment;
  }
}
