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
      quantity: (json['quantity'] as num?)?.toDouble() ?? 1,
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num?)?.toDouble() ?? 0,
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
      billId: (json['bill_id'] as num?)?.toInt() ?? 0,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
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
      patientId: (json['patient_id'] as num?)?.toInt() ?? 0,
      billDate: json['bill_date'] != null
          ? DateTime.tryParse(json['bill_date'].toString())
          : null,
      billType: (json['bill_type'] ?? 'opd').toString(),
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0,
      paidAmount: (json['paid_amount'] as num?)?.toDouble() ?? 0,
      balanceAmount: (json['balance_amount'] as num?)?.toDouble() ?? 0,
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
