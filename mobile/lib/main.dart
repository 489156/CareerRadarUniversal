import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'data/repositories/job_repository.dart';
import 'data/repositories/passport_repository.dart';
import 'data/services/job_api_service.dart';
import 'data/services/local_storage_service.dart';
import 'domain/use_cases/calculate_market_value_use_case.dart';
import 'domain/use_cases/evaluate_hard_filters_use_case.dart';
import 'domain/use_cases/match_job_fit_use_case.dart';
import 'domain/use_cases/scan_labor_risk_use_case.dart';
import 'ui/features/passport/view_models/passport_view_model.dart';
import 'ui/features/radar/view_models/radar_view_model.dart';
import 'ui/features/scanner/view_models/scanner_view_model.dart';
import 'ui/main_navigation_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Services
  final jobApiService = JobApiService();
  final localStorageService = LocalStorageService();

  // 2. Repositories
  final jobRepository = JobRepository(apiService: jobApiService);
  final passportRepository = PassportRepository(storageService: localStorageService);

  // 3. Use Cases
  final matchJobFitUseCase = MatchJobFitUseCase();
  final evaluateHardFiltersUseCase = EvaluateHardFiltersUseCase();
  final calculateMarketValueUseCase = CalculateMarketValueUseCase();
  final scanLaborRiskUseCase = ScanLaborRiskUseCase();

  // 4. ViewModels
  final passportViewModel = PassportViewModel(
    passportRepository: passportRepository,
    calculateMarketValueUseCase: calculateMarketValueUseCase,
  );

  final radarViewModel = RadarViewModel(
    jobRepository: jobRepository,
    passportViewModel: passportViewModel,
    matchJobFitUseCase: matchJobFitUseCase,
    evaluateHardFiltersUseCase: evaluateHardFiltersUseCase,
  );

  final scannerViewModel = ScannerViewModel(
    scanLaborRiskUseCase: scanLaborRiskUseCase,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: passportViewModel),
        ChangeNotifierProvider.value(value: radarViewModel),
        ChangeNotifierProvider.value(value: scannerViewModel),
      ],
      child: const CareerRadarApp(),
    ),
  );
}

class CareerRadarApp extends StatelessWidget {
  const CareerRadarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Career Radar Universal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}
