import '../utils/json_helpers.dart';

class LabOrderItem {
  final int id;
  final String testName;
  final double? result;
  final String? resultText;
  final double? rangeLow;
  final double? rangeHigh;
  final String? unit;
  final String? remarks;

  const LabOrderItem({
    required this.id,
    required this.testName,
    this.result,
    this.resultText,
    this.rangeLow,
    this.rangeHigh,
    this.unit,
    this.remarks,
  });

  bool get isAbnormal {
    if (result == null) return false;
    if (rangeLow != null && result! < rangeLow!) return true;
    if (rangeHigh != null && result! > rangeHigh!) return true;
    return false;
  }

  factory LabOrderItem.fromJson(Map<String, dynamic> json) {
    final test = json['lab_test'];
    return LabOrderItem(
      id: (json['id'] as num).toInt(),
      testName: test is Map ? (test['name'] ?? 'Test').toString() : 'Test',
      // result/range_low/range_high are `decimal:2` casts -> JSON strings.
      result: asDouble(json['result']),
      resultText: json['result_text'] as String?,
      rangeLow: asDouble(json['range_low']),
      rangeHigh: asDouble(json['range_high']),
      unit: json['unit'] as String?,
      remarks: json['remarks'] as String?,
    );
  }
}

class LabOrder {
  final int id;
  final String orderCode;
  final int patientId;
  final String status;
  final DateTime? orderDate;
  final List<LabOrderItem> items;

  const LabOrder({
    required this.id,
    required this.orderCode,
    required this.patientId,
    required this.status,
    this.orderDate,
    this.items = const [],
  });

  factory LabOrder.fromJson(Map<String, dynamic> json) {
    final rawItems = (json['items'] as List?) ?? const [];
    return LabOrder(
      id: (json['id'] as num).toInt(),
      orderCode: (json['order_id'] ?? '').toString(),
      patientId: (json['patient_id'] as num?)?.toInt() ?? 0,
      status: (json['status'] ?? 'pending').toString(),
      orderDate: json['order_date'] != null
          ? DateTime.tryParse(json['order_date'].toString())
          : null,
      items: rawItems
          .whereType<Map>()
          .map((e) => LabOrderItem.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }
}

class LabReport {
  final int id;
  final String reportCode;
  final int patientId;
  final int? labOrderId;
  final DateTime? reportDate;
  final String reportTitle;
  final String? clinicalInterpretation;
  final String? recommendation;
  final bool isVerified;
  final String status;
  final LabOrder? labOrder;

  const LabReport({
    required this.id,
    required this.reportCode,
    required this.patientId,
    this.labOrderId,
    this.reportDate,
    required this.reportTitle,
    this.clinicalInterpretation,
    this.recommendation,
    this.isVerified = false,
    this.status = 'pending',
    this.labOrder,
  });

  factory LabReport.fromJson(Map<String, dynamic> json) {
    final orderJson = json['lab_order'];
    return LabReport(
      id: (json['id'] as num).toInt(),
      reportCode: (json['report_id'] ?? '').toString(),
      patientId: (json['patient_id'] as num?)?.toInt() ?? 0,
      labOrderId: (json['lab_order_id'] as num?)?.toInt(),
      reportDate: json['report_date'] != null
          ? DateTime.tryParse(json['report_date'].toString())
          : null,
      reportTitle: (json['report_title'] ?? 'Lab Report').toString(),
      clinicalInterpretation: json['clinical_interpretation'] as String?,
      recommendation: json['recommendation'] as String?,
      isVerified: json['is_verified'] == true,
      status: (json['status'] ?? 'pending').toString(),
      labOrder: orderJson is Map
          ? LabOrder.fromJson(Map<String, dynamic>.from(orderJson))
          : null,
    );
  }
}
