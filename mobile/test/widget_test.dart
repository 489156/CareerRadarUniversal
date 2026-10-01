import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:career_radar_universal/core/theme/app_theme.dart';
import 'package:career_radar_universal/data/repositories/job_repository.dart';
import 'package:career_radar_universal/data/repositories/passport_repository.dart';
import 'package:career_radar_universal/data/services/job_api_service.dart';
import 'package:career_radar_universal/data/services/local_storage_service.dart';
import 'package:career_radar_universal/domain/use_cases/calculate_market_value_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/evaluate_hard_filters_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/match_job_fit_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/scan_labor_risk_use_case.dart';
import 'package:career_radar_universal/ui/features/passport/view_models/passport_view_model.dart';
import 'package:career_radar_universal/ui/features/radar/view_models/radar_view_model.dart';
import 'package:career_radar_universal/ui/features/scanner/view_models/scanner_view_model.dart';
import 'package:career_radar_universal/ui/main_navigation_shell.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('App renders MainNavigationShell with 3 tabs',
      (WidgetTester tester) async {
    final passportVM = PassportViewModel(
      passportRepository: PassportRepository(storageService: LocalStorageService()),
      calculateMarketValueUseCase: CalculateMarketValueUseCase(),
    );

    final radarVM = RadarViewModel(
      jobRepository: JobRepository(apiService: JobApiService()),
      passportViewModel: passportVM,
      matchJobFitUseCase: MatchJobFitUseCase(),
      evaluateHardFiltersUseCase: EvaluateHardFiltersUseCase(),
    );

    final scannerVM = ScannerViewModel(
      scanLaborRiskUseCase: ScanLaborRiskUseCase(),
    );

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: passportVM),
          ChangeNotifierProvider.value(value: radarVM),
          ChangeNotifierProvider.value(value: scannerVM),
        ],
        child: MaterialApp(
          theme: AppTheme.darkTheme,
          home: const MainNavigationShell(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('레이더'), findsOneWidget);
    expect(find.text('패스포트'), findsOneWidget);
    expect(find.text('리스크 진단'), findsOneWidget);
  });
}
