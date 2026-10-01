import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class ApiResponse {
  final bool success;
  final int statusCode;
  final dynamic data;
  final String? message;
  final Map<String, dynamic>? validationErrors;

  ApiResponse({
    required this.success,
    required this.statusCode,
    this.data,
    this.message,
    this.validationErrors,
  });
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String _keyToken = 'auth_token';
  static const String _keyBaseUrl = 'custom_base_url';

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBaseUrl) ?? AppConstants.defaultBaseUrl;
  }

  Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, url.trim());
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyToken);
  }

  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
  }

  Future<Map<String, String>> _getHeaders({bool requireAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      final token = await getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<ApiResponse> get(String endpoint, {bool requireAuth = true}) async {
    try {
      final baseUrl = await getBaseUrl();
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);

      final response = await http.get(uri, headers: headers).timeout(
            const Duration(seconds: 15),
          );

      return _processResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 0,
        message: 'Network Error: Please verify server connection at ${await getBaseUrl()}',
      );
    }
  }

  Future<ApiResponse> post(String endpoint, Map<String, dynamic> body, {bool requireAuth = true}) async {
    try {
      final baseUrl = await getBaseUrl();
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);

      final response = await http
          .post(uri, headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 15));

      return _processResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 0,
        message: 'Network Error: Could not reach backend server ($e)',
      );
    }
  }

  Future<ApiResponse> put(String endpoint, Map<String, dynamic> body, {bool requireAuth = true}) async {
    try {
      final baseUrl = await getBaseUrl();
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);

      final response = await http
          .put(uri, headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 15));

      return _processResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 0,
        message: 'Network Error: Could not reach backend server ($e)',
      );
    }
  }

  Future<ApiResponse> delete(String endpoint, {bool requireAuth = true}) async {
    try {
      final baseUrl = await getBaseUrl();
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);

      final response = await http.delete(uri, headers: headers).timeout(
            const Duration(seconds: 15),
          );

      return _processResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 0,
        message: 'Network Error: Could not reach backend server ($e)',
      );
    }
  }

  ApiResponse _processResponse(http.Response response) {
    try {
      final dynamic decoded = jsonDecode(response.body);
      final isSuccess = response.statusCode >= 200 && response.statusCode < 300;

      String? msg;
      Map<String, dynamic>? validationErrors;

      if (decoded is Map<String, dynamic>) {
        msg = decoded['message'] ?? decoded['error'];
        if (decoded['errors'] is Map<String, dynamic>) {
          validationErrors = decoded['errors'];
        }
      }

      return ApiResponse(
        success: isSuccess,
        statusCode: response.statusCode,
        data: decoded,
        message: msg ?? (isSuccess ? 'Success' : 'Request failed (${response.statusCode})'),
        validationErrors: validationErrors,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: response.statusCode,
        message: 'Invalid server response (${response.statusCode})',
      );
    }
  }
}
