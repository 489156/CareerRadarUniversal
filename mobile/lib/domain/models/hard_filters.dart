class HardFilters {
  final bool onlyPermanent;
  final bool onlyCapitalArea;
  final bool maxCommuteCutoff;
  final bool noHeavyFixedOT;
  final bool noBelowCurrentSalary;
  final bool noRelocationOrg;
  final int? minSalaryManwon;
  final int? maxCommuteMinutes;
  final List<String> customKeywords;

  const HardFilters({
    this.onlyPermanent = true,
    this.onlyCapitalArea = true,
    this.maxCommuteCutoff = false,
    this.noHeavyFixedOT = true,
    this.noBelowCurrentSalary = true,
    this.noRelocationOrg = true,
    this.minSalaryManwon,
    this.maxCommuteMinutes = 60,
    this.customKeywords = const [],
  });

  HardFilters copyWith({
    bool? onlyPermanent,
    bool? onlyCapitalArea,
    bool? maxCommuteCutoff,
    bool? noHeavyFixedOT,
    bool? noBelowCurrentSalary,
    bool? noRelocationOrg,
    int? minSalaryManwon,
    int? maxCommuteMinutes,
    List<String>? customKeywords,
  }) {
    return HardFilters(
      onlyPermanent: onlyPermanent ?? this.onlyPermanent,
      onlyCapitalArea: onlyCapitalArea ?? this.onlyCapitalArea,
      maxCommuteCutoff: maxCommuteCutoff ?? this.maxCommuteCutoff,
      noHeavyFixedOT: noHeavyFixedOT ?? this.noHeavyFixedOT,
      noBelowCurrentSalary: noBelowCurrentSalary ?? this.noBelowCurrentSalary,
      noRelocationOrg: noRelocationOrg ?? this.noRelocationOrg,
      minSalaryManwon: minSalaryManwon ?? this.minSalaryManwon,
      maxCommuteMinutes: maxCommuteMinutes ?? this.maxCommuteMinutes,
      customKeywords: customKeywords ?? this.customKeywords,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'onlyPermanent': onlyPermanent,
      'onlyCapitalArea': onlyCapitalArea,
      'maxCommuteCutoff': maxCommuteCutoff,
      'noHeavyFixedOT': noHeavyFixedOT,
      'noBelowCurrentSalary': noBelowCurrentSalary,
      'noRelocationOrg': noRelocationOrg,
      'minSalaryManwon': minSalaryManwon,
      'maxCommuteMinutes': maxCommuteMinutes,
      'customKeywords': customKeywords,
    };
  }

  factory HardFilters.fromJson(Map<String, dynamic> json) {
    return HardFilters(
      onlyPermanent: json['onlyPermanent'] as bool? ?? true,
      onlyCapitalArea: json['onlyCapitalArea'] as bool? ?? true,
      maxCommuteCutoff: json['maxCommuteCutoff'] as bool? ?? false,
      noHeavyFixedOT: json['noHeavyFixedOT'] as bool? ?? true,
      noBelowCurrentSalary: json['noBelowCurrentSalary'] as bool? ?? true,
      noRelocationOrg: json['noRelocationOrg'] as bool? ?? true,
      minSalaryManwon: (json['minSalaryManwon'] as num?)?.toInt(),
      maxCommuteMinutes: (json['maxCommuteMinutes'] as num?)?.toInt() ?? 60,
      customKeywords: (json['customKeywords'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }
}
