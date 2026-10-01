class AppConstants {
  static const String appName = 'HardwareHub';
  static const String appTagline = 'Hardware Shop Management Suite';

  // Default API URLs:
  // USB Reverse Tunnel / Localhost: http://127.0.0.1:8000/api/v1
  // Wi-Fi LAN: http://192.168.1.13:8000/api/v1
  static String get defaultBaseUrl => 'http://127.0.0.1:8000/api/v1';

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
