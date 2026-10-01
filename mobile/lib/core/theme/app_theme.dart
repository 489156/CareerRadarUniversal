import 'package:flutter/material.dart';

class AppTheme {
  // Dark palette inspired by Career Radar Universal
  static const Color darkBackground = Color(0xFF080B11);
  static const Color surface = Color(0xFF0D1322);
  static const Color card = Color(0xFF121A2D);
  static const Color cardElevated = Color(0xFF18233C);
  static const Color border = Color(0xFF233252);

  // Accent & Brand Colors
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryHover = Color(0xFF4F46E5);
  static const Color accent = Color(0xFF38BDF8);
  static const Color emerald = Color(0xFF10B981);
  static const Color amber = Color(0xFFF59E0B);
  static const Color rose = Color(0xFFF43F5E);

  // Text Colors
  static const Color textWhite = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textDark = Color(0xFF64748B);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        error: rose,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBackground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          color: textWhite,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: textWhite),
      ),
      cardTheme: CardThemeData(
        color: card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border, width: 1),
        ),
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkBackground,
        selectedItemColor: primary,
        unselectedItemColor: textDark,
        type: BottomNavigationBarType.fixed,
        elevation: 10,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardElevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: const TextStyle(color: textDark, fontSize: 13),
        labelStyle: const TextStyle(color: textMuted, fontSize: 13),
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 20),
        titleMedium: TextStyle(color: textWhite, fontWeight: FontWeight.w600, fontSize: 16),
        bodyLarge: TextStyle(color: textWhite, fontSize: 14),
        bodyMedium: TextStyle(color: textMuted, fontSize: 13),
        bodySmall: TextStyle(color: textDark, fontSize: 11),
      ),
    );
  }
}
