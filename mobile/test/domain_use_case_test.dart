import 'package:flutter_test/flutter_test.dart';
import 'package:career_radar_universal/domain/models/career_passport.dart';
import 'package:career_radar_universal/domain/models/hard_filters.dart';
import 'package:career_radar_universal/domain/models/job_posting.dart';
import 'package:career_radar_universal/domain/use_cases/calculate_market_value_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/evaluate_hard_filters_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/match_job_fit_use_case.dart';
import 'package:career_radar_universal/domain/use_cases/scan_labor_risk_use_case.dart';

void main() {
  group('Domain Use Cases Tests', () {
    const passport = CareerPassport(
      canonicalRole: '인사기획 / HRBP',
      totalYears: 7,
      baseSalary: 5500,
      fixedAllowance: 500,
      commuteToleranceMinutes: 50,
      hardFilters: HardFilters(
        onlyPermanent: true,
        onlyCapitalArea: true,
        maxCommuteMinutes: 60,
      ),
    );

    final deloitteJob = JobPosting(
      id: 'deloitte-5200',
      company: '딜로이트 안진',
      title: '인재부 채용팀 대리~과장급',
      canonicalRole: 'HR',
      occupation: 'HR',
      industry: '회계컨설팅',
      location: '서울 영등포구 여의도',
      commuteMinutes: 45,
      salaryMinManwon: 6000,
      salaryMaxManwon: 8000,
      salaryDisplay: '회사 내규에 따름',
      salaryTier: 'B',
      minYears: 3,
      maxYears: 10,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: const ['정규직', 'Big4 회계법인'],
      pros: const ['전문성'],
      gaps: const [],
      sourceName: '딜로이트 공식 채용관',
      jobUrl: 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5200',
      sourceCategory: SourceCategory.consulting,
    );

    test('MatchJobFitUseCase computes high fit score for aligned HR role', () {
      final useCase = MatchJobFitUseCase();
      final result = useCase.execute(passport, deloitteJob);

      expect(result.totalScore, greaterThanOrEqualTo(85));
      expect(result.roleFit, equals(100));
      expect(result.seniorityFit, equals(100));
      expect(result.commuteFit, equals(100));
    });

    test('EvaluateHardFiltersUseCase correctly keeps permanent capital job', () {
      final useCase = EvaluateHardFiltersUseCase();
      final result = useCase.execute(passport, deloitteJob);

      expect(result.isExcluded, isFalse);
      expect(result.reasons, isEmpty);
    });

    test('EvaluateHardFiltersUseCase flags non-permanent contract position', () {
      final contractJob = JobPosting(
        id: 'job-contract',
        company: '테스트사',
        title: '계약직 채용',
        canonicalRole: 'HR',
        occupation: 'HR',
        industry: 'IT',
        location: '서울 강남',
        commuteMinutes: 30,
        salaryMinManwon: 4000,
        salaryMaxManwon: 5000,
        salaryDisplay: '4000',
        salaryTier: 'C',
        minYears: 1,
        maxYears: 3,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: const ['계약직 1년'],
        pros: const [],
        gaps: const [],
        sourceName: '포털',
        jobUrl: 'https://example.com',
        sourceCategory: SourceCategory.consulting,
      );

      final useCase = EvaluateHardFiltersUseCase();
      final result = useCase.execute(passport, contractJob);

      expect(result.isExcluded, isTrue);
      expect(result.reasons, contains('비정규직/계약직 배제'));
    });

    test('CalculateMarketValueUseCase produces calibrated P10-P90 percentiles', () {
      final useCase = CalculateMarketValueUseCase();
      final result = useCase.execute(7);

      expect(result.years, equals(7));
      expect(result.p10, lessThan(result.p25));
      expect(result.p25, lessThan(result.p50));
      expect(result.p50, lessThan(result.p75));
      expect(result.p75, lessThan(result.p90));
      expect(result.rangeDisplay, contains('~'));
    });

    test('ScanLaborRiskUseCase flags 포괄임금 and 퇴직금 분할', () {
      final useCase = ScanLaborRiskUseCase();
      const riskyContract = '''
제5조: 월 급여에 포괄임금 고정연장근로수당 30시간분 및 퇴직금 분할지급액 40만 원이 포함되어 있다.
중도 퇴사 시 위약금 300만 원을 배상하여야 한다.
''';

      final result = useCase.execute(riskyContract);

      expect(result.isClean, isFalse);
      expect(result.riskScore, greaterThanOrEqualTo(70));
      expect(result.items.any((i) => i.title.contains('포괄임금')), isTrue);
      expect(result.items.any((i) => i.title.contains('퇴직금')), isTrue);
      expect(result.items.any((i) => i.title.contains('위약 예정')), isTrue);
    });
  });
}
