class Department {
  final int id;
  final String name;
  final String? code;
  final String? description;

  const Department({
    required this.id,
    required this.name,
    this.code,
    this.description,
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: (json['id'] as num).toInt(),
      name: (json['name'] ?? '').toString(),
      code: json['code'] as String?,
      description: json['description'] as String?,
    );
  }
}

class Hospital {
  final int id;
  final String name;
  final String? city;

  const Hospital({required this.id, required this.name, this.city});

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: (json['id'] as num).toInt(),
      name: (json['name'] ?? '').toString(),
      city: json['city'] as String?,
    );
  }
}
