import 'dart:convert';
import 'package:flutter/services.dart';
import '../../domain/models/job_posting.dart';

class JobApiService {
  Future<List<JobPosting>> fetchAllJobs() async {
    try {
      final jsonString =
          await rootBundle.loadString('assets/data/jobs.json');
      final list = jsonDecode(jsonString) as List<dynamic>;
      return list
          .map((item) => JobPosting.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Fallback: return default core list if asset loading fails
      return _fallbackJobs;
    }
  }

  static final List<JobPosting> _fallbackJobs = [
    JobPosting(
      id: 'deloitte-5200',
      company: '딜로이트 안진',
      title: '인재부 Talent-Acquisition(채용팀) 대리~과장급 채용',
      canonicalRole: 'HR',
      occupation: 'HR',
      industry: '전문서비스 / 회계컨설팅',
      location: '서울 영등포구 여의도동 (딜로이트 본사)',
      commuteMinutes: 45,
      salaryMinManwon: 6000,
      salaryMaxManwon: 8000,
      salaryDisplay: '회사 내규에 따름',
      salaryTier: 'B',
      minYears: 3,
      maxYears: 10,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: const ['Big4 회계법인', '정규직', '수시채용', '인재부', '여의도'],
      pros: const ['글로벌 Top-tier 딜로이트 안진의 인사 전문성', '다양한 프로젝트 및 채용 기회'],
      gaps: const ['요구 스킬셋 부합 여부 확인 필요'],
      rawText: '[딜로이트 안진 채용]\n인재부 Talent-Acquisition(채용팀) 대리~과장급 채용\n상세 직무 내용 및 우대사항은 공고 참조.',
      sourceName: '딜로이트 공식 채용 (WiseRecruit2)',
      jobUrl: 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5200',
      sourceCategory: SourceCategory.consulting,
      isCompanyExclusive: true,
      sourceSystem: 'Deloitte WiseRecruit2',
      publishedAt: '2026-09-28',
    ),
    JobPosting(
      id: 'pwc-r260928',
      company: '삼일PwC',
      title: 'Middle Market Corporate Finance 부문 채용',
      canonicalRole: 'Consulting',
      occupation: 'PLANNING',
      industry: '전문서비스 / 회계컨설팅',
      location: '서울 용산구 (삼일PwC 본사)',
      commuteMinutes: 45,
      salaryMinManwon: 6000,
      salaryMaxManwon: 8000,
      salaryDisplay: '회사 내규에 따름',
      salaryTier: 'B',
      minYears: 3,
      maxYears: 10,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: const ['Big4 회계법인', '정규직', '수시채용'],
      pros: const ['국내 1위 회계법인 삼일PwC의 전문성과 네트워크', '다양한 프로젝트 경험'],
      gaps: const ['요구 스킬셋 부합 여부 확인 필요'],
      rawText: '[삼일PwC 수시채용]\nMiddle Market Corporate Finance 부문 채용',
      sourceName: '삼일PwC 공식 채용관',
      jobUrl: 'https://www.pwc.com/kr/ko/career/experienced/r260928.html',
      sourceCategory: SourceCategory.consulting,
      isCompanyExclusive: true,
      sourceSystem: 'PwC Global ATS',
      publishedAt: '2026-09-28',
    ),
  ];
}
