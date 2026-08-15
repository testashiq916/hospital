class AppRole {
  final int? id;
  final String? name;
  final String? slug;
  final List<String> permissions;

  const AppRole({this.id, this.name, this.slug, this.permissions = const []});

  factory AppRole.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const AppRole();
    final perms = (json['permissions'] as List?) ?? const [];
    return AppRole(
      id: (json['id'] as num?)?.toInt(),
      name: json['name'] as String?,
      slug: json['slug'] as String?,
      permissions: perms
          .whereType<Map>()
          .map((p) => (p['slug'] ?? '').toString())
          .where((s) => s.isNotEmpty)
          .toList(),
    );
  }
}

/// The authenticated account (`users` table row) — not to be confused with
/// [Patient], the clinical record. A patient-role login has both: a `User`
/// for auth, and (ideally) a linked `Patient` row resolved separately.
class AppUser {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String? mobile;
  final int? companyId;
  final int? hospitalId;
  final AppRole role;

  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.mobile,
    this.companyId,
    this.hospitalId,
    this.role = const AppRole(),
  });

  String get name => '$firstName $lastName'.trim();

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: (json['id'] as num).toInt(),
      firstName: (json['first_name'] ?? '').toString(),
      lastName: (json['last_name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      mobile: json['mobile'] as String?,
      companyId: (json['company_id'] as num?)?.toInt(),
      hospitalId: (json['hospital_id'] as num?)?.toInt(),
      role: AppRole.fromJson(json['role'] as Map<String, dynamic>?),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'mobile': mobile,
        'company_id': companyId,
        'hospital_id': hospitalId,
      };
}
