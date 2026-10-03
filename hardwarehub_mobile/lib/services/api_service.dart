import 'dart:async';
import 'dart:convert';
import 'dart:io';
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

  // In-memory cache for the currently verified working backend URL
  static String? _workingBaseUrl;

  // Known candidate URLs (USB ADB reverse, current Wi-Fi LAN, previous LAN, Emulator)
  static final List<String> _candidateDefaults = [
    'http://192.168.1.3:8000/api/v1',
    'http://127.0.0.1:8000/api/v1',
    'http://192.168.1.13:8000/api/v1',
    'http://10.0.2.2:8000/api/v1',
    'http://localhost:8000/api/v1',
  ];

  Future<List<String>> _getCandidateUrls() async {
    final list = <String>[];

    // 1. If we already found a working URL in this app session, prioritize it
    if (_workingBaseUrl != null && _workingBaseUrl!.isNotEmpty) {
      list.add(_workingBaseUrl!);
    }

    // 2. Add saved preference URL
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_keyBaseUrl);
    if (saved != null && saved.trim().isNotEmpty) {
      if (!list.contains(saved.trim())) {
        list.add(saved.trim());
      }
    }

    // 3. Add default candidates
    for (final url in _candidateDefaults) {
      if (!list.contains(url)) {
        list.add(url);
      }
    }

    return list;
  }

  Future<String> getBaseUrl() async {
    if (_workingBaseUrl != null && _workingBaseUrl!.isNotEmpty) {
      return _workingBaseUrl!;
    }
    final prefs = await SharedPreferences.getInstance();
    final custom = prefs.getString(_keyBaseUrl);
    if (custom != null && custom.isNotEmpty) {
      return custom;
    }
    return AppConstants.defaultBaseUrl;
  }

  Future<void> setBaseUrl(String url) async {
    final cleanUrl = url.trim();
    _workingBaseUrl = cleanUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, cleanUrl);
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

  /// Multi-URL Fast Fallback Engine
  /// Rapidly connects to the active backend across Wi-Fi or USB without waiting or dropping requests.
  Future<ApiResponse> _executeWithAutoFallback(
    Future<http.Response> Function(String baseUrl) requestFn,
  ) async {
    final candidates = await _getCandidateUrls();
    Object? lastError;

    for (int i = 0; i < candidates.length; i++) {
      final candidate = candidates[i];
      // Fast probe: 3.5s per candidate so fallback happens immediately if USB/Wi-Fi is switched
      final timeoutDuration = const Duration(milliseconds: 3500);
      try {
        final response = await requestFn(candidate).timeout(timeoutDuration);

        // If we received any valid HTTP response from the server (even 4xx or 2xx),
        // it means the host is alive and reachable!
        _workingBaseUrl = candidate;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_keyBaseUrl, candidate);

        return _processResponse(response);
      } on SocketException catch (e) {
        lastError = e;
        continue;
      } on TimeoutException catch (e) {
        lastError = e;
        continue;
      } on http.ClientException catch (e) {
        lastError = e;
        continue;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    return ApiResponse(
      success: false,
      statusCode: 0,
      message: 'Network Error: Backend unreachable (${lastError ?? "Timeout"}). Please ensure "php artisan serve" is running on PC.',
    );
  }

  Future<ApiResponse> get(String endpoint, {bool requireAuth = true}) async {
    return _executeWithAutoFallback((baseUrl) async {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);
      return http.get(uri, headers: headers);
    });
  }

  Future<ApiResponse> post(String endpoint, Map<String, dynamic> body, {bool requireAuth = true}) async {
    return _executeWithAutoFallback((baseUrl) async {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);
      return http.post(uri, headers: headers, body: jsonEncode(body));
    });
  }

  Future<ApiResponse> put(String endpoint, Map<String, dynamic> body, {bool requireAuth = true}) async {
    return _executeWithAutoFallback((baseUrl) async {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);
      return http.put(uri, headers: headers, body: jsonEncode(body));
    });
  }

  Future<ApiResponse> delete(String endpoint, {bool requireAuth = true}) async {
    return _executeWithAutoFallback((baseUrl) async {
      final uri = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders(requireAuth: requireAuth);
      return http.delete(uri, headers: headers);
    });
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
