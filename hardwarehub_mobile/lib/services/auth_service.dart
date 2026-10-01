import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _api = ApiService();
  static const String _keyUser = 'auth_user_json';

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  Future<bool> isLoggedIn() async {
    final token = await _api.getToken();
    if (token == null || token.isEmpty) return false;

    // Load cached user
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_keyUser);
    if (userJson != null) {
      try {
        _currentUser = UserModel.fromJson(jsonDecode(userJson));
      } catch (_) {}
    }

    return true;
  }

  Future<ApiResponse> login(String email, String password) async {
    final res = await _api.post(
      '/auth/login',
      {
        'email': email.trim(),
        'password': password,
        'device_name': 'HardwareHub Flutter App',
      },
      requireAuth: false,
    );

    if (res.success && res.data != null) {
      final token = res.data['access_token'];
      if (token != null) {
        await _api.setToken(token);
      }

      if (res.data['user'] != null) {
        _currentUser = UserModel.fromJson(res.data['user']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_keyUser, jsonEncode(_currentUser!.toJson()));
      }
    }

    return res;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout', {});
    } catch (_) {}

    await _api.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUser);
    _currentUser = null;
  }

  Future<UserModel?> fetchCurrentUser() async {
    final res = await _api.get('/auth/me');
    if (res.success && res.data != null && res.data['user'] != null) {
      _currentUser = UserModel.fromJson(res.data['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyUser, jsonEncode(_currentUser!.toJson()));
      return _currentUser;
    }
    return _currentUser;
  }
}
