import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  AuthService(this._client);

  final ApiClient _client;

  /// POST /api/v1/auth/login -> { message, token, user }
  Future<(String token, AppUser user)> login({
    required String email,
    required String password,
    String? companyCode,
  }) async {
    final json = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
      if (companyCode != null && companyCode.isNotEmpty)
        'company_code': companyCode,
    });
    final token = (json['token'] ?? '').toString();
    final user = AppUser.fromJson(json['user'] as Map<String, dynamic>);
    return (token, user);
  }

  /// POST /api/v1/auth/register — self-service "sign up your hospital"
  /// flow. Included for completeness; the patient app's primary entry
  /// point is login against an existing seeded tenant.
  Future<(String token, AppUser user)> register({
    required String companyName,
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? mobile,
  }) async {
    final json = await _client.post('/auth/register', body: {
      'company_name': companyName,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'password': password,
      'password_confirmation': password,
      if (mobile != null) 'mobile': mobile,
    });
    final token = (json['token'] ?? '').toString();
    final user = AppUser.fromJson(json['user'] as Map<String, dynamic>);
    return (token, user);
  }

  Future<AppUser> me() async {
    final json = await _client.get('/auth/me');
    return AppUser.fromJson(json);
  }

  Future<void> logout() async {
    await _client.post('/auth/logout');
  }
}
