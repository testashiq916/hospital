class PrescriptionItem {
  final int id;
  final String medicineName;
  final int quantity;
  final String? dosage;
  final String? frequency;
  final String? duration;
  final String? instructions;
  final String? route;

  const PrescriptionItem({
    required this.id,
    required this.medicineName,
    required this.quantity,
    this.dosage,
    this.frequency,
    this.duration,
    this.instructions,
    this.route,
  });

  factory PrescriptionItem.fromJson(Map<String, dynamic> json) {
    final medicine = json['medicine'];
    return PrescriptionItem(
      id: (json['id'] as num).toInt(),
      medicineName: medicine is Map
          ? (medicine['name'] ?? 'Medicine').toString()
          : 'Medicine',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      dosage: json['dosage'] as String?,
      frequency: json['frequency'] as String?,
      duration: json['duration'] as String?,
      instructions: json['instructions'] as String?,
      route: json['route'] as String?,
    );
  }
}

class Prescription {
  final int id;
  final String prescriptionCode;
  final int patientId;
  final int doctorId;
  final String? doctorName;
  final DateTime? prescriptionDate;
  final String? diagnosis;
  final String? notes;
  final bool isActive;
  final String status;
  final List<PrescriptionItem> items;

  const Prescription({
    required this.id,
    required this.prescriptionCode,
    required this.patientId,
    required this.doctorId,
    this.doctorName,
    this.prescriptionDate,
    this.diagnosis,
    this.notes,
    this.isActive = true,
    this.status = 'active',
    this.items = const [],
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    String? doctorName;
    final doctorJson = json['doctor'];
    if (doctorJson is Map) {
      final first = (doctorJson['first_name'] ?? '').toString();
      final last = (doctorJson['last_name'] ?? '').toString();
      doctorName = (doctorJson['name'] ?? '$first $last').toString().trim();
    }
    final rawItems = (json['items'] as List?) ?? const [];
    return Prescription(
      id: (json['id'] as num).toInt(),
      prescriptionCode: (json['prescription_id'] ?? '').toString(),
      patientId: (json['patient_id'] as num?)?.toInt() ?? 0,
      doctorId: (json['doctor_id'] as num?)?.toInt() ?? 0,
      doctorName: doctorName,
      prescriptionDate: json['prescription_date'] != null
          ? DateTime.tryParse(json['prescription_date'].toString())
          : null,
      diagnosis: json['diagnosis'] as String?,
      notes: json['notes'] as String?,
      isActive: json['is_active'] == true,
      status: (json['status'] ?? 'active').toString(),
      items: rawItems
          .whereType<Map>()
          .map((e) => PrescriptionItem.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }
}
