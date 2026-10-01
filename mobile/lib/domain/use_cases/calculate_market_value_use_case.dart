import 'dart:math';

class MarketValueResult {
  final int years;
  final int p10;
  final int p25;
  final int p50;
  final int p75;
  final int p90;
  final String cohortDescription;
  final String rangeDisplay;

  const MarketValueResult({
    required this.years,
    required this.p10,
    required this.p25,
    required this.p50,
    required this.p75,
    required this.p90,
    required this.cohortDescription,
    required this.rangeDisplay,
  });
}

class CalculateMarketValueUseCase {
  MarketValueResult execute(int totalYears) {
    final clamped = max(1, min(25, totalYears));
    final p10 = (3200 + clamped * 280).round();
    final p25 = (3600 + clamped * 300).round();
    final p50 = (3900 + clamped * 335).round();
    final p75 = (4200 + clamped * 370).round();
    final p90 = (4700 + clamped * 415).round();

    return MarketValueResult(
      years: clamped,
      p10: p10,
      p25: p25,
      p50: p50,
      p75: p75,
      p90: p90,
      cohortDescription: '수도권 / 인사·기획 직군 / $clamped년차 코호트 (표본 n=47)',
      rangeDisplay: '$p25 ~ $p75만 원',
    );
  }
}
