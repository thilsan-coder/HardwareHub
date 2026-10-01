import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Exact Web Aesthetic: Deep Slate Header + Crisp Slate-50 Body + Indigo & Emerald Highlights
  static const Color primary = Color(0xFF4F46E5);      // Indigo 600
  static const Color primaryDark = Color(0xFF3730A3);  // Indigo 800
  static const Color primaryLight = Color(0xFFEEF2FF); // Indigo 50
  static const Color primaryBorder = Color(0xFFC7D2FE); // Indigo 200

  // Slate Hierarchy
  static const Color slate950 = Color(0xFF020617);
  static const Color slate900 = Color(0xFF0F172A); // App Bar & Dark Headers
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate200 = Color(0xFFE2E8F0); // Card Borders
  static const Color slate100 = Color(0xFFF1F5F9); // Sub-headers & pills
  static const Color slate50 = Color(0xFFF8FAFC);  // Page Background

  // Vivid Status Accents
  static const Color success = Color(0xFF10B981);    // Emerald 500
  static const Color successBg = Color(0xFFECFDF5);  // Emerald 50
  static const Color successBorder = Color(0xFFA7F3D0);
  
  static const Color warning = Color(0xFFF59E0B);    // Amber 500
  static const Color warningBg = Color(0xFFFFFBEB);  // Amber 50
  static const Color warningBorder = Color(0xFFFDE68A);

  static const Color danger = Color(0xFFEF4444);     // Red 500
  static const Color dangerBg = Color(0xFFFEF2F2);   // Red 50
  static const Color dangerBorder = Color(0xFFFECACA);

  static const Color purple = Color(0xFF8B5CF6);
  static const Color purpleBg = Color(0xFFF5F3FF);

  // Cross-Widget Theme Aliases
  static const Color textWhite = Colors.white;
  static const Color textMuted = slate500;
  static const Color textDim = slate400;
  static const Color bgDark = slate900;
  static const Color bgSurface = slate50;
  static const Color bgCard = Colors.white;
  static const Color borderSlate = slate200;

  // Gradient Presets matching Web Banner
  static const LinearGradient headerGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient indigoGradient = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get webMatchedTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: slate50,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: slate900,
        surface: Colors.white,
        onSurface: slate900,
        error: danger,
      ),
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: primary,
        selectionColor: primaryLight,
        selectionHandleColor: primary,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).apply(
        bodyColor: slate900,
        displayColor: slate900,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: slate900,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 17,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: slate200, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 2,
          shadowColor: primary.withAlpha(80),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: slate50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: slate400, fontSize: 13, fontWeight: FontWeight.normal),
        labelStyle: const TextStyle(color: slate700, fontSize: 13, fontWeight: FontWeight.w600),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: danger),
        ),
      ),
    );
  }

  static ThemeData get lightTheme => webMatchedTheme;
  static ThemeData get darkTheme => webMatchedTheme;
}
