import 'package:flutter/foundation.dart';
import '../../../../data/repositories/passport_repository.dart';
import '../../../../domain/models/career_passport.dart';
import '../../../../domain/models/hard_filters.dart';
import '../../../../domain/use_cases/calculate_market_value_use_case.dart';

class PassportViewModel extends ChangeNotifier {
  final PassportRepository _passportRepository;
  final CalculateMarketValueUseCase _calculateMarketValueUseCase;

  CareerPassport _passport = const CareerPassport();
  bool _isLoading = false;
  MarketValueResult? _marketValue;

  PassportViewModel({
    required PassportRepository passportRepository,
    required CalculateMarketValueUseCase calculateMarketValueUseCase,
  })  : _passportRepository = passportRepository,
        _calculateMarketValueUseCase = calculateMarketValueUseCase {
    loadPassport();
  }

  CareerPassport get passport => _passport;
  bool get isLoading => _isLoading;
  MarketValueResult? get marketValue => _marketValue;

  Future<void> loadPassport() async {
    _isLoading = true;
    notifyListeners();

    try {
      _passport = await _passportRepository.getPassport();
      _marketValue = _calculateMarketValueUseCase.execute(_passport.totalYears);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updatePassport(CareerPassport updated) async {
    _passport = updated;
    _marketValue = _calculateMarketValueUseCase.execute(updated.totalYears);
    notifyListeners();
    await _passportRepository.savePassport(updated);
  }

  Future<void> updateHardFilters(HardFilters newFilters) async {
    final updated = _passport.copyWith(hardFilters: newFilters);
    await updatePassport(updated);
  }
}
