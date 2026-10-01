enum SourceCategory {
  consulting,
  publicSector,
  conglomerate,
  globalTech,
  aggregator,
}

extension SourceCategoryExtension on SourceCategory {
  String get label {
    switch (this) {
      case SourceCategory.consulting:
        return '회계/컨설팅 (Big4)';
      case SourceCategory.publicSector:
        return '공공기관 / 공기업';
      case SourceCategory.conglomerate:
        return '대기업 / 그룹사';
      case SourceCategory.globalTech:
        return '글로벌 테크';
      case SourceCategory.aggregator:
        return '일반 채용포털';
    }
  }

  String get code {
    switch (this) {
      case SourceCategory.consulting:
        return 'CONSULTING';
      case SourceCategory.publicSector:
        return 'PUBLIC';
      case SourceCategory.conglomerate:
        return 'CONGLOMERATE';
      case SourceCategory.globalTech:
        return 'GLOBAL_TECH';
      case SourceCategory.aggregator:
        return 'AGGREGATOR';
    }
  }

  static SourceCategory fromCode(String? code) {
    switch (code?.toUpperCase()) {
      case 'CONSULTING':
        return SourceCategory.consulting;
      case 'PUBLIC':
        return SourceCategory.publicSector;
      case 'CONGLOMERATE':
        return SourceCategory.conglomerate;
      case 'GLOBAL_TECH':
        return SourceCategory.globalTech;
      default:
        return SourceCategory.consulting;
    }
  }
}

class JobPosting {
  final String id;
  final String company;
  final String title;
  final String canonicalRole;
  final String occupation;
  final String industry;
  final String location;
  final int commuteMinutes;
  final int salaryMinManwon;
  final int salaryMaxManwon;
  final String salaryDisplay;
  final String salaryTier;
  final int minYears;
  final int maxYears;
  final bool hasFixedOT;
  final int fixedOTHours;
  final List<String> tags;
  final List<String> pros;
  final List<String> gaps;
  final String? rawText;
  final String sourceName;
  final String jobUrl;
  final SourceCategory sourceCategory;
  final bool isCompanyExclusive;
  final String? sourceSystem;
  final String? publishedAt;

  const JobPosting({
    required this.id,
    required this.company,
    required this.title,
    required this.canonicalRole,
    required this.occupation,
    required this.industry,
    required this.location,
    required this.commuteMinutes,
    required this.salaryMinManwon,
    required this.salaryMaxManwon,
    required this.salaryDisplay,
    required this.salaryTier,
    required this.minYears,
    required this.maxYears,
    required this.hasFixedOT,
    required this.fixedOTHours,
    required this.tags,
    required this.pros,
    required this.gaps,
    this.rawText,
    required this.sourceName,
    required this.jobUrl,
    required this.sourceCategory,
    this.isCompanyExclusive = false,
    this.sourceSystem,
    this.publishedAt,
  });

  factory JobPosting.fromJson(Map<String, dynamic> json) {
    return JobPosting(
      id: json['id'] as String? ?? '',
      company: json['company'] as String? ?? '',
      title: json['title'] as String? ?? '',
      canonicalRole: json['canonicalRole'] as String? ?? 'Generalist',
      occupation: json['occupation'] as String? ?? 'PLANNING',
      industry: json['industry'] as String? ?? '전문서비스',
      location: json['location'] as String? ?? '서울',
      commuteMinutes: (json['commuteMinutes'] as num?)?.toInt() ?? 45,
      salaryMinManwon: (json['salaryMinManwon'] as num?)?.toInt() ?? 5000,
      salaryMaxManwon: (json['salaryMaxManwon'] as num?)?.toInt() ?? 8000,
      salaryDisplay: json['salaryDisplay'] as String? ?? '회사 내규에 따름',
      salaryTier: json['salaryTier'] as String? ?? 'B',
      minYears: (json['minYears'] as num?)?.toInt() ?? 3,
      maxYears: (json['maxYears'] as num?)?.toInt() ?? 10,
      hasFixedOT: json['hasFixedOT'] as bool? ?? false,
      fixedOTHours: (json['fixedOTHours'] as num?)?.toInt() ?? 0,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      pros: (json['pros'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      gaps: (json['gaps'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      rawText: json['rawText'] as String?,
      sourceName: json['sourceName'] as String? ?? '공식 채용관',
      jobUrl: json['jobUrl'] as String? ?? '',
      sourceCategory:
          SourceCategoryExtension.fromCode(json['sourceCategory'] as String?),
      isCompanyExclusive: json['isCompanyExclusive'] as bool? ?? false,
      sourceSystem: json['sourceSystem'] as String?,
      publishedAt: json['publishedAt'] as String?,
    );
  }
}
