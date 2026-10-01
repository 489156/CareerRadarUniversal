import 'dart:math';
import '../models/career_passport.dart';
import '../models/job_posting.dart';
import '../models/match_score.dart';

class MatchJobFitUseCase {
  DynamicMatchScore execute(CareerPassport passport, JobPosting job) {
    final matchedReasons = <String>[];
    final gapReasons = <String>[];

    // 1. Role/Ontology Match (40% weight)
    int roleFit = 60;
    final pRole = passport.canonicalRole.toLowerCase();
    final jRole = job.canonicalRole.toLowerCase();

    if (pRole.contains('인사') || pRole.contains('hr') || pRole.contains('people')) {
      if (job.occupation == 'HR') {
        roleFit = 85;
        matchedReasons.add('직군 일치: ${job.occupation} 전문 분야');
        if (jRole.contains('planning') ||
            jRole.contains('strategy') ||
            jRole.contains('generalist') ||
            jRole.contains('hrbp') ||
            jRole.contains('기획') ||
            jRole.contains('hr') ||
            jRole.contains('인사')) {
          roleFit = 100;
          matchedReasons.add('온톨로지 정규화 직무 완벽 매칭: ${job.canonicalRole}');
        }
      } else {
        roleFit = 50;
        gapReasons.add('희망 직무(${passport.canonicalRole})와 타깃 직무(${job.canonicalRole}) 간 전이 필요');
      }
    } else {
      if (job.occupation == passport.occupation.code) {
        roleFit = 85;
        matchedReasons.add('직군 일치: ${job.occupation}');
      }
    }

    // 2. Seniority / Experience Match (25% weight)
    int seniorityFit = 70;
    final years = passport.totalYears;
    if (years >= job.minYears && years <= job.maxYears) {
      seniorityFit = 100;
      matchedReasons.add('요구 연차(${job.minYears}~${job.maxYears}년)에 내 경력(${years}년차) 최적 부합');
    } else if (years < job.minYears) {
      final diff = job.minYears - years;
      seniorityFit = max(30, 100 - diff * 25);
      gapReasons.add('최소 요구 연차(${job.minYears}년) 대비 ${diff}년 부족');
    } else {
      seniorityFit = 85;
      matchedReasons.add('충분한 경력 연차 보유 (${years}년차)');
    }

    // 3. Commute / Location Match (20% weight)
    int commuteFit = 100;
    final tol = passport.commuteToleranceMinutes > 0 ? passport.commuteToleranceMinutes : 60;
    if (job.commuteMinutes <= tol) {
      commuteFit = 100;
      matchedReasons.add('편도 통근 ${job.commuteMinutes}분 (허용 기준 ${tol}분 이내 안심 통근권)');
    } else {
      final over = job.commuteMinutes - tol;
      commuteFit = max(20, 100 - over * 3);
      gapReasons.add('편도 통근 ${job.commuteMinutes}분 (허용 기준 ${tol}분 대비 +${over}분 초과)');
    }

    // 4. Salary / Compensation Match (15% weight)
    int salaryFit = 75;
    final currentTotal = passport.totalGuaranteedCash;
    if (job.salaryMaxManwon >= (currentTotal * 1.08).round()) {
      salaryFit = 100;
      matchedReasons.add('현재 보상(${currentTotal}만 원) 대비 8~25% 인상 구간 형성');
    } else if (job.salaryMaxManwon >= currentTotal) {
      salaryFit = 85;
      matchedReasons.add('현재 보상 수준 유지 및 유사 조건 협상 가능');
    } else {
      salaryFit = 50;
      gapReasons.add('공고 최대 연봉(${job.salaryMaxManwon}만 원)이 현재 보상보다 낮음');
    }

    // Composite Total Score
    final totalScore = (roleFit * 0.4 +
            seniorityFit * 0.25 +
            commuteFit * 0.20 +
            salaryFit * 0.15)
        .round();

    final verdict = totalScore >= 88
        ? MatchVerdict.high
        : totalScore >= 70
            ? MatchVerdict.medium
            : MatchVerdict.low;

    return DynamicMatchScore(
      totalScore: totalScore,
      roleFit: roleFit,
      seniorityFit: seniorityFit,
      commuteFit: commuteFit,
      salaryFit: salaryFit,
      verdict: verdict,
      matchedReasons: matchedReasons,
      gapReasons: gapReasons,
    );
  }
}
