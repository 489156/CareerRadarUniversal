class LaborRiskItem {
  final String level; // DANGER, WARNING, INFO
  final String title;
  final String description;

  const LaborRiskItem({
    required this.level,
    required this.title,
    required this.description,
  });
}

class LaborRiskResult {
  final bool isClean;
  final int riskScore; // 0 (Clean) ~ 100 (High Risk)
  final List<LaborRiskItem> items;

  const LaborRiskResult({
    required this.isClean,
    required this.riskScore,
    required this.items,
  });
}

class ScanLaborRiskUseCase {
  LaborRiskResult execute(String text) {
    final lower = text.toLowerCase();
    final items = <LaborRiskItem>[];
    int score = 0;

    // 1. 포괄임금제 고정 연장근로 체크
    if (lower.contains('포괄임금') ||
        lower.contains('연장근로수당 포함') ||
        lower.contains('고정연장') ||
        lower.contains('시간외수당 포함')) {
      score += 40;
      items.add(const LaborRiskItem(
        level: 'DANGER',
        title: '포괄임금제(고정 OT) 조항 감지',
        description: '실제 연장·야간 근로시간과 무관하게 일정 시간 수당을 기본급에 산입하여 실근로시간 대비 임금 체불 위험이 있습니다.',
      ));
    }

    // 2. 퇴직금 월급 분할 지급 (위법)
    if (lower.contains('퇴직금 포함') || lower.contains('퇴직금 분할')) {
      score += 50;
      items.add(const LaborRiskItem(
        level: 'DANGER',
        title: '퇴직금 월할 분할지급 약정 (근로자퇴직급여보장법 위반)',
        description: '퇴직 전 월급여에 퇴직금을 미리 쪼개어 지급하는 약정은 대법원 판례상 무효이며 퇴직 시 전액 재청구 대상입니다.',
      ));
    }

    // 3. 과도한 위약금 / 손해배상 예정
    if (lower.contains('위약금') ||
        lower.contains('의무재직') ||
        lower.contains('교육비 반환') ||
        lower.contains('배상하여야')) {
      score += 35;
      items.add(const LaborRiskItem(
        level: 'WARNING',
        title: '위약 예정 금지 위반 의심 조항 (근로기준법 제20조)',
        description: '중도 퇴사 시 일정 금액을 위약금으로 정하거나 교육비 명목으로 과도한 반환을 강제하는 조항은 법적 효력이 제한됩니다.',
      ));
    }

    // 4. 수습기간 일괄 70% 감액
    if (lower.contains('수습') && (lower.contains('70%') || lower.contains('80%'))) {
      score += 25;
      items.add(const LaborRiskItem(
        level: 'WARNING',
        title: '수습기간 임금 과도 감액 규정',
        description: '단순노무직이 아닌 경우에도 최저임금법상 수습 3개월간 최대 10% 감액(90% 지급)만 허용되며, 과도한 감액은 불리합니다.',
      ));
    }

    // 5. 비합리적 비밀유지/경업금지
    if (lower.contains('경업금지') || lower.contains('동종업계')) {
      score += 20;
      items.add(const LaborRiskItem(
        level: 'INFO',
        title: '퇴사 후 경업금지 약정 확인 필요',
        description: '보상 대가 없는 일방적 1~2년 동종업계 이직 제한은 헌법상 직업선택의 자유 침해로 무효화될 가능성이 높습니다.',
      ));
    }

    return LaborRiskResult(
      isClean: items.isEmpty,
      riskScore: score > 100 ? 100 : score,
      items: items,
    );
  }
}
