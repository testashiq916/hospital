import '../utils/json_helpers.dart';

class Doctor {
  final int id;
  final String name;
  final String? specialization;
  final String? qualification;
  final String? designation;
  final int? hospitalId;

  const Doctor({
    required this.id,
    required this.name,
    this.specialization,
    this.qualification,
    this.designation,
    this.hospitalId,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    final first = (json['first_name'] ?? '').toString();
    final last = (json['last_name'] ?? '').toString();
    final composed = '$first $last'.trim();
    return Doctor(
      id: (json['id'] as num).toInt(),
      name: (json['name'] ?? (composed.isEmpty ? 'Doctor' : composed))
          .toString(),
      specialization: json['specialization'] as String?,
      qualification: json['qualification'] as String?,
      designation: json['designation'] as String?,
      hospitalId: (json['hospital_id'] as num?)?.toInt(),
    );
  }
}

class DoctorSchedule {
  final int id;
  final int doctorId;
  final String dayOfWeek; // 'monday' .. 'sunday'
  final String startTime; // 'HH:mm:ss'
  final String endTime;
  final int slotDuration; // minutes
  final int maxPatients;
  final bool isAvailable;
  final double? consultationFee;
  final String? location;

  const DoctorSchedule({
    required this.id,
    required this.doctorId,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.slotDuration,
    required this.maxPatients,
    required this.isAvailable,
    this.consultationFee,
    this.location,
  });

  factory DoctorSchedule.fromJson(Map<String, dynamic> json) {
    return DoctorSchedule(
      id: (json['id'] as num).toInt(),
      doctorId: (json['doctor_id'] as num).toInt(),
      dayOfWeek: (json['day_of_week'] ?? '').toString(),
      startTime: (json['start_time'] ?? '09:00:00').toString(),
      endTime: (json['end_time'] ?? '17:00:00').toString(),
      slotDuration: (json['slot_duration'] as num?)?.toInt() ?? 15,
      maxPatients: (json['max_patients'] as num?)?.toInt() ?? 20,
      isAvailable: json['is_available'] == true,
      // consultation_fee is a `decimal:2` cast -> JSON string.
      consultationFee: asDouble(json['consultation_fee']),
      location: json['location'] as String?,
    );
  }
}
