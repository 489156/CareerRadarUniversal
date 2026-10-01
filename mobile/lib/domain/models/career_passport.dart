import 'hard_filters.dart';

enum OccupationType { hr, planning, tech, marketing, finance }

extension OccupationTypeExtension on OccupationType {
  String get label {
    switch (this) {
      case OccupationType.hr:
        return '인사 / HR';
      case OccupationType.planning:
        return '전략 / 기획 / PM';
      case OccupationType.tech:
        return 'IT / 소프트웨어 개발';
      case OccupationType.marketing:
        return '마케팅 / 그로스';
      case OccupationType.finance:
        return '재무 / 회계 / 투자';
    }
  }

  String get code {
    switch (this) {
      case OccupationType.hr:
        return 'HR';
      case OccupationType.planning:
        return 'PLANNING';
      case OccupationType.tech:
        return 'TECH';
      case OccupationType.marketing:
        return 'MARKETING';
      case OccupationType.finance:
        return 'FINANCE';
    }
  }

  static OccupationType fromCode(String code) {
    switch (code.toUpperCase()) {
      case 'HR':
        return OccupationType.hr;
      case 'PLANNING':
        return OccupationType.planning;
      case 'TECH':
        return OccupationType.tech;
      case 'MARKETING':
        return OccupationType.marketing;
      case 'FINANCE':
        return OccupationType.finance;
      default:
        return OccupationType.hr;
    }
  }
}

class CareerPassport {
  final String id;
  final OccupationType occupation;
  final String canonicalRole;
  final int totalYears;
  final String companyType;
  final int baseSalary; // 만 원 단위
  final int fixedAllowance; // 만 원 단위
  final int variableBonus; // 만 원 단위
  final bool hasFixedOT;
  final String homeLocation;
  final int commuteToleranceMinutes;
  final List<String> skills;
  final HardFilters hardFilters;
  final String updatedAt;

  const CareerPassport({
    this.id = 'passport-local',
    this.occupation = OccupationType.hr,
    this.canonicalRole = '인사기획 / HRBP',
    this.totalYears = 7,
    this.companyType = '중견기업',
    this.baseSalary = 5400,
    this.fixedAllowance = 400,
    this.variableBonus = 600,
    this.hasFixedOT = false,
    this.homeLocation = '서울 동작구 (노량진/상도)',
    this.commuteToleranceMinutes = 50,
    this.skills = const [
      '평가/보상체계 기획',
      'HRBP',
      '노사협의회 운영',
      'HRIS 운영',
      '취업규칙 개정',
      '조직진단',
    ],
    this.hardFilters = const HardFilters(),
    this.updatedAt = '2026-09-30',
  });

  int get totalGuaranteedCash => baseSalary + fixedAllowance;

  CareerPassport copyWith({
    String? id,
    OccupationType? occupation,
    String? canonicalRole,
    int? totalYears,
    String? companyType,
    int? baseSalary,
    int? fixedAllowance,
    int? variableBonus,
    bool? hasFixedOT,
    String? homeLocation,
    int? commuteToleranceMinutes,
    List<String>? skills,
    HardFilters? hardFilters,
    String? updatedAt,
  }) {
    return CareerPassport(
      id: id ?? this.id,
      occupation: occupation ?? this.occupation,
      canonicalRole: canonicalRole ?? this.canonicalRole,
      totalYears: totalYears ?? this.totalYears,
      companyType: companyType ?? this.companyType,
      baseSalary: baseSalary ?? this.baseSalary,
      fixedAllowance: fixedAllowance ?? this.fixedAllowance,
      variableBonus: variableBonus ?? this.variableBonus,
      hasFixedOT: hasFixedOT ?? this.hasFixedOT,
      homeLocation: homeLocation ?? this.homeLocation,
      commuteToleranceMinutes:
          commuteToleranceMinutes ?? this.commuteToleranceMinutes,
      skills: skills ?? this.skills,
      hardFilters: hardFilters ?? this.hardFilters,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'occupation': occupation.code,
      'canonicalRole': canonicalRole,
      'totalYears': totalYears,
      'companyType': companyType,
      'baseSalary': baseSalary,
      'fixedAllowance': fixedAllowance,
      'variableBonus': variableBonus,
      'hasFixedOT': hasFixedOT,
      'homeLocation': homeLocation,
      'commuteToleranceMinutes': commuteToleranceMinutes,
      'skills': skills,
      'hardFilters': hardFilters.toJson(),
      'updatedAt': updatedAt,
    };
  }

  factory CareerPassport.fromJson(Map<String, dynamic> json) {
    return CareerPassport(
      id: json['id'] as String? ?? 'passport-local',
      occupation: OccupationTypeExtension.fromCode(
          json['occupation'] as String? ?? 'HR'),
      canonicalRole: json['canonicalRole'] as String? ?? '인사기획 / HRBP',
      totalYears: (json['totalYears'] as num?)?.toInt() ?? 7,
      companyType: json['companyType'] as String? ?? '중견기업',
      baseSalary: (json['baseSalary'] as num?)?.toInt() ?? 5400,
      fixedAllowance: (json['fixedAllowance'] as num?)?.toInt() ?? 400,
      variableBonus: (json['variableBonus'] as num?)?.toInt() ?? 600,
      hasFixedOT: json['hasFixedOT'] as bool? ?? false,
      homeLocation: json['homeLocation'] as String? ?? '서울 동작구',
      commuteToleranceMinutes:
          (json['commuteToleranceMinutes'] as num?)?.toInt() ?? 50,
      skills: (json['skills'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      hardFilters: json['hardFilters'] != null
          ? HardFilters.fromJson(json['hardFilters'] as Map<String, dynamic>)
          : const HardFilters(),
      updatedAt: json['updatedAt'] as String? ?? '2026-09-30',
    );
  }
}
