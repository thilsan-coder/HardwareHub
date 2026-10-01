import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConstants {
  static const String appName = 'HardwareHub';
  static const String appTagline = 'Hardware Shop Management Suite';

  // Default API URLs:
  // Android Emulator uses 10.0.2.2 to connect to host PC localhost:8000
  // Windows / macOS / Web / iOS uses 127.0.0.1:8000
  static String get defaultBaseUrl {
    if (kIsWeb) return 'http://127.0.0.1:8000/api/v1';
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8000/api/v1';
      }
    } catch (_) {}
    return 'http://127.0.0.1:8000/api/v1';
  }

  static const List<String> categories = [
    'Hand Tools',
    'Power Tools',
    'Plumbing',
    'Electrical',
    'Fasteners',
    'Paints',
    'Building Materials',
    'Safety',
    'General',
  ];
}
