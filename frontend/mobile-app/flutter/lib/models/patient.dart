class Patient {
  final int id;
  final String patientCode; // patients.patient_id, e.g. PT-2026-XXXX
  final String firstName;
  final String lastName;
  final String? gender;
  final DateTime? dateOfBirth;
  final int? age;
  final String? bloodGroup;
  final String? email;
  final String? mobile;
  final String? address;
  final String? allergies;
  final String? chronicDiseases;
  final String? medications;
  final String? familyHistory;
  final String? emergencyContactName;
  final String? emergencyContactPhone;

  const Patient({
    required this.id,
    required this.patientCode,
    required this.firstName,
    required this.lastName,
    this.gender,
    this.dateOfBirth,
    this.age,
    this.bloodGroup,
    this.email,
    this.mobile,
    this.address,
    this.allergies,
    this.chronicDiseases,
    this.medications,
    this.familyHistory,
    this.emergencyContactName,
    this.emergencyContactPhone,
  });

  String get fullName => '$firstName $lastName'.trim();

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: (json['id'] as num).toInt(),
      patientCode: (json['patient_id'] ?? '').toString(),
      firstName: (json['first_name'] ?? '').toString(),
      lastName: (json['last_name'] ?? '').toString(),
      gender: json['gender'] as String?,
      dateOfBirth: _parseDate(json['date_of_birth']),
      age: (json['age'] as num?)?.toInt(),
      bloodGroup: json['blood_group'] as String?,
      email: json['email'] as String?,
      mobile: json['mobile'] as String?,
      address: json['address'] as String?,
      allergies: json['allergies'] as String?,
      chronicDiseases: json['chronic_diseases'] as String?,
      medications: json['medications'] as String?,
      familyHistory: json['family_history'] as String?,
      emergencyContactName: json['emergency_contact_name'] as String?,
      emergencyContactPhone: json['emergency_contact_phone'] as String?,
    );
  }
}

DateTime? _parseDate(dynamic value) {
  if (value == null) return null;
  return DateTime.tryParse(value.toString());
}

class PatientTimelineEvent {
  final int id;
  final String eventType;
  final String? description;
  final DateTime? eventDate;

  const PatientTimelineEvent({
    required this.id,
    required this.eventType,
    this.description,
    this.eventDate,
  });

  factory PatientTimelineEvent.fromJson(Map<String, dynamic> json) {
    return PatientTimelineEvent(
      id: (json['id'] as num).toInt(),
      eventType: (json['event_type'] ?? 'event').toString(),
      description: json['description'] as String?,
      eventDate: _parseDate(json['event_date']),
    );
  }
}
