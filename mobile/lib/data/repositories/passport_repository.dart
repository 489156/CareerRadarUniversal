import '../../domain/models/career_passport.dart';
import '../services/local_storage_service.dart';

class PassportRepository {
  final LocalStorageService _storageService;
  CareerPassport? _cachedPassport;

  PassportRepository({required LocalStorageService storageService})
      : _storageService = storageService;

  Future<CareerPassport> getPassport() async {
    if (_cachedPassport != null) return _cachedPassport!;
    final loaded = await _storageService.getPassport();
    _cachedPassport = loaded ?? const CareerPassport();
    return _cachedPassport!;
  }

  Future<void> savePassport(CareerPassport passport) async {
    _cachedPassport = passport;
    await _storageService.savePassport(passport);
  }
}
