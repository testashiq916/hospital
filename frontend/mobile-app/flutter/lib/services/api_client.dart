import 'package:dio/dio.dart';

import '../config/api_config.dart';
import 'storage_service.dart';

/// Raised for any non-2xx API response, carrying enough detail for screens
/// to show a useful message (Laravel validation errors come back as
/// `{ message, errors: { field: [messages] } }`).
class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final Map<String, List<String>>? fieldErrors;

  ApiException(this.message, {this.statusCode, this.fieldErrors});

  /// Flattens field errors (if any) under the top-level message — handy for
  /// a single-line SnackBar.
  String get displayMessage {
    if (fieldErrors != null && fieldErrors!.isNotEmpty) {
      final first = fieldErrors!.values.first;
      if (first.isNotEmpty) return first.first;
    }
    return message;
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Thin wrapper around [Dio] that centralizes base URL, JSON headers, the
/// Sanctum bearer token, and error normalization into [ApiException].
///
/// Deliberately framework-light: no code generation, no retrofit-style
/// annotations, so it stays easy to read for anyone new to the project.
class ApiClient {
  ApiClient({StorageService? storage}) : _storage = storage ?? StorageService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        headers: const {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Base URL can change at runtime (Profile > API settings), so
          // re-read it on every request instead of freezing it at
          // construction time.
          options.baseUrl = ApiConfig.baseUrl;
          final token = await _storage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  late final Dio _dio;
  final StorageService _storage;

  /// Called by AuthProvider when a 401 is observed, so the whole app can
  /// fall back to the login screen without every screen having to check.
  void Function()? onUnauthorized;

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    return _send(() => _dio.get(path, queryParameters: _clean(query)));
  }

  Future<Map<String, dynamic>> post(String path, {Object? body}) async {
    return _send(() => _dio.post(path, data: body));
  }

  Future<Map<String, dynamic>> put(String path, {Object? body}) async {
    return _send(() => _dio.put(path, data: body));
  }

  Future<Map<String, dynamic>> patch(String path, {Object? body}) async {
    return _send(() => _dio.patch(path, data: body));
  }

  Future<Map<String, dynamic>> delete(String path) async {
    return _send(() => _dio.delete(path));
  }

  Map<String, dynamic>? _clean(Map<String, dynamic>? query) {
    if (query == null) return null;
    final out = <String, dynamic>{};
    query.forEach((key, value) {
      if (value != null) out[key] = value;
    });
    return out;
  }

  Future<Map<String, dynamic>> _send(
    Future<Response> Function() request,
  ) async {
    try {
      final response = await request();
      final data = response.data;
      if (data is Map<String, dynamic>) return data;
      if (data is List) return {'data': data};
      return <String, dynamic>{};
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  ApiException _mapError(DioException e) {
    final response = e.response;
    if (response == null) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        return ApiException(
          'Could not reach the server at ${ApiConfig.baseUrl}. '
          'Check the API base URL in Profile > Settings and that the '
          'backend is running.',
        );
      }
      return ApiException(e.message ?? 'Network error');
    }

    final status = response.statusCode;
    final body = response.data;

    if (status == 401) {
      onUnauthorized?.call();
      return ApiException('Session expired. Please log in again.',
          statusCode: 401);
    }

    if (status == 403) {
      return ApiException(
        'Your account does not have permission to do this yet. '
        '(The demo patient role may need this permission enabled by a '
        'hospital admin.)',
        statusCode: 403,
      );
    }

    String message = 'Something went wrong.';
    Map<String, List<String>>? fieldErrors;

    if (body is Map<String, dynamic>) {
      message = (body['message'] ?? message).toString();
      final errors = body['errors'];
      if (errors is Map) {
        fieldErrors = errors.map(
          (key, value) => MapEntry(
            key.toString(),
            (value as List).map((v) => v.toString()).toList(),
          ),
        );
      }
    }

    return ApiException(message, statusCode: status, fieldErrors: fieldErrors);
  }
}
