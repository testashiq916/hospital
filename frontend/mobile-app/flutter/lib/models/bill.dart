import '../utils/json_helpers.dart';

class BillItem {
  final int id;
  final String description;
  final double quantity;
  final double unitPrice;
  final double total;

  const BillItem({
    required this.id,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });

  factory BillItem.fromJson(Map<String, dynamic> json) {
    return BillItem(
      id: (json['id'] as num).toInt(),
      description: (json['description'] ?? '').toString(),
      quantity: asDouble(json['quantity']) ?? 1,
      // unit_price/total are Eloquent `decimal:2` casts -> JSON strings.
      unitPrice: asDouble(json['unit_price']) ?? 0,
      total: asDouble(json['total']) ?? 0,
    );
  }
}

class Payment {
  final int id;
  final String paymentCode;
  final int billId;
  final double amount;
  final String paymentMethod;
  final String status;
  final DateTime? paymentDate;

  const Payment({
    required this.id,
    required this.paymentCode,
    required this.billId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.paymentDate,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: (json['id'] as num).toInt(),
      paymentCode: (json['payment_id'] ?? '').toString(),
      billId: asInt(json['bill_id']) ?? 0,
      // amount is a `decimal:2` cast -> JSON string.
      amount: asDouble(json['amount']) ?? 0,
      paymentMethod: (json['payment_method'] ?? 'cash').toString(),
      status: (json['status'] ?? 'success').toString(),
      paymentDate: json['payment_date'] != null
          ? DateTime.tryParse(json['payment_date'].toString())
          : null,
    );
  }
}

class HospitalBill {
  final int id;
  final String billCode;
  final int patientId;
  final DateTime? billDate;
  final String billType;
  final double totalAmount;
  final double paidAmount;
  final double balanceAmount;
  final String paymentStatus;
  final List<BillItem> items;
  final List<Payment> payments;

  const HospitalBill({
    required this.id,
    required this.billCode,
    required this.patientId,
    this.billDate,
    this.billType = 'opd',
    required this.totalAmount,
    required this.paidAmount,
    required this.balanceAmount,
    required this.paymentStatus,
    this.items = const [],
    this.payments = const [],
  });

  factory HospitalBill.fromJson(Map<String, dynamic> json) {
    final rawItems = (json['items'] as List?) ?? const [];
    final rawPayments = (json['payments'] as List?) ?? const [];
    return HospitalBill(
      id: (json['id'] as num).toInt(),
      billCode: (json['bill_id'] ?? '').toString(),
      patientId: asInt(json['patient_id']) ?? 0,
      billDate: json['bill_date'] != null
          ? DateTime.tryParse(json['bill_date'].toString())
          : null,
      billType: (json['bill_type'] ?? 'opd').toString(),
      // total_amount/paid_amount/balance_amount are `decimal:2` casts ->
      // JSON strings, not numbers.
      totalAmount: asDouble(json['total_amount']) ?? 0,
      paidAmount: asDouble(json['paid_amount']) ?? 0,
      balanceAmount: asDouble(json['balance_amount']) ?? 0,
      paymentStatus: (json['payment_status'] ?? 'unpaid').toString(),
      items: rawItems
          .whereType<Map>()
          .map((e) => BillItem.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      payments: rawPayments
          .whereType<Map>()
          .map((e) => Payment.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }
}
