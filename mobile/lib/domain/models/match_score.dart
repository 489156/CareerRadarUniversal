enum MatchVerdict { high, medium, low }

class DynamicMatchScore {
  final int totalScore;
  final int roleFit;
  final int seniorityFit;
  final int commuteFit;
  final int salaryFit;
  final MatchVerdict verdict;
  final List<String> matchedReasons;
  final List<String> gapReasons;

  const DynamicMatchScore({
    required this.totalScore,
    required this.roleFit,
    required this.seniorityFit,
    required this.commuteFit,
    required this.salaryFit,
    required this.verdict,
    required this.matchedReasons,
    required this.gapReasons,
  });

  String get verdictLabel {
    switch (verdict) {
      case MatchVerdict.high:
        return '최적 적합 (Tier 1)';
      case MatchVerdict.medium:
        return '전략 지원 (Tier 2)';
      case MatchVerdict.low:
        return '조건 불일치 (Tier 3)';
    }
  }
}
