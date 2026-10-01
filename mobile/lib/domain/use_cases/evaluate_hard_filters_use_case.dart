import '../models/career_passport.dart';
import '../models/job_posting.dart';

class HardFilterResult {
  final bool isExcluded;
  final List<String> reasons;

  const HardFilterResult({required this.isExcluded, required this.reasons});
}

class EvaluateHardFiltersUseCase {
  HardFilterResult execute(CareerPassport passport, JobPosting job) {
    final reasons = <String>[];
    final filters = passport.hardFilters;

    // 1. Permanent employment only (Exclude contract/intern)
    if (filters.onlyPermanent) {
      final isPerm = job.tags.any((t) => t.contains('정규직')) ||
          (job.rawText != null && job.rawText!.contains('정규직'));
      if (!isPerm) {
        reasons.add('비정규직/계약직 배제');
      }
    }

    // 2. Capital area only (Exclude non-capital)
    if (filters.onlyCapitalArea) {
      final loc = '${job.location} ${job.rawText ?? ''}'.toLowerCase();
      final isCapital = loc.contains('서울') ||
          loc.contains('경기') ||
          loc.contains('인천') ||
          loc.contains('수도권') ||
          loc.contains('강남') ||
          loc.contains('판교') ||
          loc.contains('분당') ||
          loc.contains('용산') ||
          loc.contains('여의도');
      if (!isCapital) {
        reasons.add('수도권 외 지역 배제');
      }
    }

    // 3. Minimum salary threshold
    if (filters.minSalaryManwon != null && filters.minSalaryManwon! > 0) {
      if (job.salaryMaxManwon < filters.minSalaryManwon!) {
        reasons.add('최소 희망 연봉 미달 (${job.salaryMaxManwon}만 < ${filters.minSalaryManwon}만)');
      }
    }

    // 4. Maximum commute minutes
    if (filters.maxCommuteMinutes != null && filters.maxCommuteMinutes! > 0) {
      if (job.commuteMinutes > filters.maxCommuteMinutes!) {
        reasons.add('최대 통근시간 초과 (${job.commuteMinutes}분 > ${filters.maxCommuteMinutes}분)');
      }
    }

    // 5. Excessive fixed overtime cutoff
    if (filters.noHeavyFixedOT) {
      if (job.hasFixedOT && job.fixedOTHours > 20) {
        reasons.add('과도한 고정OT 포괄임금 (${job.fixedOTHours}시간 > 20시간 초과)');
      }
    }

    // 6. Custom keyword exclusion
    if (filters.customKeywords.isNotEmpty) {
      final searchable =
          '${job.company} ${job.title} ${job.canonicalRole} ${job.tags.join(" ")} ${job.rawText ?? ""}'
              .toLowerCase();
      for (final kw in filters.customKeywords) {
        final clean = kw.trim().toLowerCase();
        if (clean.isNotEmpty && searchable.contains(clean)) {
          reasons.add('배제 키워드 "$kw" 포함');
          break;
        }
      }
    }

    return HardFilterResult(
      isExcluded: reasons.isNotEmpty,
      reasons: reasons,
    );
  }
}
