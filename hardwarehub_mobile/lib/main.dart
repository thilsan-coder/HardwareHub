import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'config/theme.dart';
import 'screens/home_dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.bgDark,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const HardwareHubApp());
}

class HardwareHubApp extends StatelessWidget {
  const HardwareHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HardwareHub',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.webMatchedTheme,
      darkTheme: AppTheme.webMatchedTheme,
      themeMode: ThemeMode.light,
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Brief splash delay
    await Future.delayed(const Duration(milliseconds: 600));

    final isLoggedIn = await AuthService().isLoggedIn();

    if (!mounted) return;

    if (isLoggedIn) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeDashboardScreen()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withAlpha(150),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.inventory_2_rounded,
                size: 54,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'HardwareHub',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: AppTheme.textWhite,
                letterSpacing: -0.6,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enterprise Product & Inventory Management',
              style: TextStyle(
                fontSize: 13,
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 40),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                color: AppTheme.primaryLight,
                strokeWidth: 2.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
