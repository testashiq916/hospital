/// Central place for API connectivity settings.
///
/// The base URL is intentionally mutable at runtime (not just a compile-time
/// constant) so a build can be pointed at a staging/production API without a
/// rebuild — see [ApiConfig.setBaseUrl]. It is seeded from
/// [defaultBaseUrl] and persisted via SharedPreferences by
/// `StorageService`.
class ApiConfig {
  ApiConfig._();

  /// Matches `docs/api-overview.md`: Laravel served locally with
  /// `php artisan serve` on port 8000, versioned API under `/api/v1`.
  ///
  /// Notes for real devices/emulators (localhost does not mean the same
  /// thing as it does on a desktop browser):
  ///  - Android emulator: use `http://10.0.2.2:8000/api/v1`
  ///  - iOS simulator: `http://localhost:8000/api/v1` works as-is
  ///  - Physical device: use your machine's LAN IP, e.g.
  ///    `http://192.168.1.20:8000/api/v1`
  ///
  /// Change this in-app from Profile > Settings > API Base URL, or edit the
  /// default below before building.
  static const String defaultBaseUrl = 'http://localhost:8000/api/v1';

  static String _baseUrl = defaultBaseUrl;

  static String get baseUrl => _baseUrl;

  static void setBaseUrl(String url) {
    if (url.trim().isEmpty) return;
    _baseUrl = url.trim().endsWith('/')
        ? url.trim().substring(0, url.trim().length - 1)
        : url.trim();
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);

  static const String secureStorageTokenKey = 'hms_auth_token';
  static const String prefsUserKey = 'hms_current_user';
  static const String prefsBaseUrlKey = 'hms_api_base_url';
  static const String prefsPatientIdKey = 'hms_linked_patient_id';
}
