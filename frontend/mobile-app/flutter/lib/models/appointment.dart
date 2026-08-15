class Appointment {
  final int id;
  final String appointmentCode; // appointment_id e.g. APT-2026-XXXX
  final int patientId;
  final int doctorId;
  final String? doctorName;
  final String? patientName;
  final DateTime? appointmentDate;
  final String appointmentTime; // 'HH:mm:ss'
  final String? endTime;
  final String appointmentType;
  final String status;
  final int? tokenNumber;
  final int? queueNumber;
  final int? estimatedWaitTime;
  final String? reason;
  final String? notes;
  final bool isEmergency;
  final bool isTeleconsultation;
  final String? teleconsultationLink;
  final String? cancelledReason;

  const Appointment({
    required this.id,
    required this.appointmentCode,
    required this.patientId,
    required this.doctorId,
    this.doctorName,
    this.patientName,
    this.appointmentDate,
    required this.appointmentTime,
    this.endTime,
    this.appointmentType = 'opd',
    this.status = 'scheduled',
    this.tokenNumber,
    this.queueNumber,
    this.estimatedWaitTime,
    this.reason,
    this.notes,
    this.isEmergency = false,
    this.isTeleconsultation = false,
    this.teleconsultationLink,
    this.cancelledReason,
  });

  bool get isUpcoming =>
      !['completed', 'cancelled', 'no_show'].contains(status);

  factory Appointment.fromJson(Map<String, dynamic> json) {
    String? doctorName;
    final doctorJson = json['doctor'];
    if (doctorJson is Map) {
      final first = (doctorJson['first_name'] ?? '').toString();
      final last = (doctorJson['last_name'] ?? '').toString();
      doctorName = (doctorJson['name'] ?? '$first $last').toString().trim();
    }
    String? patientName;
    final patientJson = json['patient'];
    if (patientJson is Map) {
      final first = (patientJson['first_name'] ?? '').toString();
      final last = (patientJson['last_name'] ?? '').toString();
      patientName = '$first $last'.trim();
    }

    return Appointment(
      id: (json['id'] as num).toInt(),
      appointmentCode: (json['appointment_id'] ?? '').toString(),
      patientId: (json['patient_id'] as num).toInt(),
      doctorId: (json['doctor_id'] as num).toInt(),
      doctorName: doctorName,
      patientName: patientName,
      appointmentDate: json['appointment_date'] != null
          ? DateTime.tryParse(json['appointment_date'].toString())
          : null,
      appointmentTime: (json['appointment_time'] ?? '00:00:00').toString(),
      endTime: json['end_time'] as String?,
      appointmentType: (json['appointment_type'] ?? 'opd').toString(),
      status: (json['status'] ?? 'scheduled').toString(),
      tokenNumber: (json['token_number'] as num?)?.toInt(),
      queueNumber: (json['queue_number'] as num?)?.toInt(),
      estimatedWaitTime: (json['estimated_wait_time'] as num?)?.toInt(),
      reason: json['reason'] as String?,
      notes: json['notes'] as String?,
      isEmergency: json['is_emergency'] == true,
      isTeleconsultation: json['is_teleconsultation'] == true,
      teleconsultationLink: json['teleconsultation_link'] as String?,
      cancelledReason: json['cancelled_reason'] as String?,
    );
  }
}

class QueueToken {
  final int id;
  final int tokenNumber;
  final String queueStatus;
  final DateTime? queueDate;
  final DateTime? calledAt;
  final DateTime? startedAt;
  final DateTime? completedAt;

  const QueueToken({
    required this.id,
    required this.tokenNumber,
    required this.queueStatus,
    this.queueDate,
    this.calledAt,
    this.startedAt,
    this.completedAt,
  });

  factory QueueToken.fromJson(Map<String, dynamic> json) {
    return QueueToken(
      id: (json['id'] as num).toInt(),
      tokenNumber: (json['token_number'] as num?)?.toInt() ?? 0,
      queueStatus: (json['queue_status'] ?? 'waiting').toString(),
      queueDate: json['queue_date'] != null
          ? DateTime.tryParse(json['queue_date'].toString())
          : null,
      calledAt: json['called_at'] != null
          ? DateTime.tryParse(json['called_at'].toString())
          : null,
      startedAt: json['started_at'] != null
          ? DateTime.tryParse(json['started_at'].toString())
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.tryParse(json['completed_at'].toString())
          : null,
    );
  }
}
