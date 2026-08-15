import '../models/bill.dart';
import '../models/paginated_response.dart';
import 'api_client.dart';

class BillingService {
  BillingService(this._client);

  final ApiClient _client;

  Future<PaginatedResponse<HospitalBill>> bills({
    required int patientId,
    String? paymentStatus,
    int page = 1,
  }) async {
    final json = await _client.get('/bills', query: {
      'patient_id': patientId,
      'payment_status': paymentStatus,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<HospitalBill>.fromJson(
      json,
      HospitalBill.fromJson,
    );
  }

  Future<HospitalBill> bill(int id) async {
    final json = await _client.get('/bills/$id');
    return HospitalBill.fromJson(json);
  }

  Future<PaginatedResponse<Payment>> payments({
    required int patientId,
    int page = 1,
  }) async {
    final json = await _client.get('/payments', query: {
      'patient_id': patientId,
      'page': page,
      'per_page': 20,
    });
    return PaginatedResponse<Payment>.fromJson(json, Payment.fromJson);
  }

  /// Records a payment against a bill via `POST /payments`.
  ///
  /// There is no real payment gateway wired up (no Stripe/Razorpay SDK) —
  /// this directly calls the same endpoint the front-desk billing screen
  /// would call after a gateway callback. The "Pay Now" UI simulates the
  /// gateway step (a fixed 1.2s "processing" delay + a card-style form)
  /// purely for UX; no card data is transmitted or stored. See the app's
  /// README for details.
  Future<Payment> pay({
    required int billId,
    required double amount,
    required String paymentMethod,
    String? notes,
  }) async {
    final json = await _client.post('/payments', body: {
      'bill_id': billId,
      'amount': amount,
      'payment_method': paymentMethod,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });
    return Payment.fromJson(json);
  }
}
