import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/models/career_passport.dart';

class LocalStorageService {
  static const _passportKey = 'career_passport_data';

  Future<void> savePassport(CareerPassport passport) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(passport.toJson());
    await prefs.setString(_passportKey, jsonString);
  }

  Future<CareerPassport?> getPassport() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_passportKey);
    if (jsonString == null) return null;
    try {
      final map = jsonDecode(jsonString) as Map<String, dynamic>;
      return CareerPassport.fromJson(map);
    } catch (_) {
      return null;
    }
  }
}
