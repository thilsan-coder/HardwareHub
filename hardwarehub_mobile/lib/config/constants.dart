class AppConstants {
  static const String appName = 'HardwareHub';
  static const String appTagline = 'Hardware Shop Management Suite';

  // Default API URLs:
  // Active Wi-Fi LAN: http://192.168.1.3:8000/api/v1
  // USB Reverse Tunnel / Localhost: http://127.0.0.1:8000/api/v1
  static String get defaultBaseUrl => 'http://192.168.1.3:8000/api/v1';

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
