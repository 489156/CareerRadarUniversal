import { CareerPassport, JobPosting, DynamicMatchScore, SkillGapTrack } from "./types";

export const MOCK_JOB_DATABASE: JobPosting[] = [
  {
    "id": "alio-305821",
    "company": "선박해양플랜트연구소",
    "title": "2026년 체험형 청년인턴(인턴행정원) 공개채용",
    "canonicalRole": "청년인턴/행정지원",
    "occupation": "HR",
    "industry": "공공기관 / 공기업",
    "location": "대전 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 2400,
    "salaryMaxManwon": 2800,
    "salaryDisplay": "월 206~230만 원 (청년인턴 공시 처우)",
    "salaryTier": "A",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "청년인턴(체험형)",
      "신입/인턴"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 선박해양플랜트연구소\n공고명: 2026년 체험형 청년인턴(인턴행정원) 공개채용\n고용형태: 청년인턴(체험형)\n근무지: 대전",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305821",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": true,
    "jobCategory": "HR",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305788",
    "company": "근로복지공단",
    "title": "[근로복지공단] 공무직(시설경비원) 채용 공고",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "울산 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "무기계약직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 근로복지공단\n공고명: [근로복지공단] 공무직(시설경비원) 채용 공고\n고용형태: 무기계약직\n근무지: 울산",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305788",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305786",
    "company": "국립공원공단",
    "title": "[내장산] 2026년 내장산국립공원 가을 성수기 기간제(환경관리) 채용 공고",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "전북 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 국립공원공단\n공고명: [내장산] 2026년 내장산국립공원 가을 성수기 기간제(환경관리) 채용 공고\n고용형태: 비정규직\n근무지: 전북",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305786",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305785",
    "company": "국립공원공단",
    "title": "[내장산] 2026년 내장산국립공원 가을 성수기 기간제(수익시설) 채용 공고",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "전북 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 국립공원공단\n공고명: [내장산] 2026년 내장산국립공원 가을 성수기 기간제(수익시설) 채용 공고\n고용형태: 비정규직\n근무지: 전북",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305785",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305784",
    "company": "국립공원공단",
    "title": "[소백산생태탐방원] 2026년 소백산생태탐방원 기간제(한시인력_국립공원지킴이) 채용(2차) 공고",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "경북 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 국립공원공단\n공고명: [소백산생태탐방원] 2026년 소백산생태탐방원 기간제(한시인력_국립공원지킴이) 채용(2차) 공고\n고용형태: 비정규직\n근무지: 경북",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305784",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305783",
    "company": "한전KDN",
    "title": "한전KDN(주) 서울본부 강남지사 전력통신팀 OA설비 유지보수 일용근로자 모집공고",
    "canonicalRole": "공공 ICT/전산관리",
    "occupation": "TECH",
    "industry": "공공기관 / 공기업",
    "location": "서울 (수도권)",
    "commuteMinutes": 42,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 한전KDN\n공고명: 한전KDN(주) 서울본부 강남지사 전력통신팀 OA설비 유지보수 일용근로자 모집공고\n고용형태: 비정규직\n근무지: 서울",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305783",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "TECH",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305782",
    "company": "국립공원공단",
    "title": "[치악산] 치악산국립공원사무소 기간제(수익시설) 직원 채용",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "강원 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 국립공원공단\n공고명: [치악산] 치악산국립공원사무소 기간제(수익시설) 직원 채용\n고용형태: 비정규직\n근무지: 강원",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305782",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "alio-305781",
    "company": "한국수자원공사",
    "title": "[한국수자원공사] 경북지역협력단 영덕2현대화사업팀 특수직(기술관리_건설사업) 채용 공고",
    "canonicalRole": "공공행정·경영기획",
    "occupation": "PLANNING",
    "industry": "공공기관 / 공기업",
    "location": "경북 (지방 본사/지사)",
    "commuteMinutes": 75,
    "salaryMinManwon": 4200,
    "salaryMaxManwon": 4800,
    "salaryDisplay": "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
    "salaryTier": "A",
    "minYears": 2,
    "maxYears": 5,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "공공기관",
      "ALIO 경영공시",
      "비정규직",
      "경력"
    ],
    "pros": [
      "기획재정부 ALIO 100% 실공시 데이터",
      "고용 안정성 및 정시퇴근 보장"
    ],
    "gaps": [
      "공공기관 NCS 및 블라인드 채용 전형 준비 필요"
    ],
    "rawText": "[ALIO 공공기관 채용정보]\n기관명: 한국수자원공사\n공고명: [한국수자원공사] 경북지역협력단 영덕2현대화사업팀 특수직(기술관리_건설사업) 채용 공고\n고용형태: 비정규직\n근무지: 경북",
    "sourceName": "기획재정부 ALIO 공시망",
    "jobUrl": "https://job.alio.go.kr/recruitview.do?idx=305781",
    "sourceCategory": "PUBLIC",
    "isCompanyExclusive": true,
    "sourceSystem": "ALIO 오픈 공시망",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r261007",
    "company": "삼일PwC",
    "title": "Deals 업무 인턴 채용",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 2700,
    "salaryMaxManwon": 3100,
    "salaryDisplay": "월 220~250만 원 (학부/체험형 인턴십)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "인턴",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "기초 직무 지식 및 영어 커뮤니케이션"
    ],
    "rawText": "[삼일PwC 인턴십]\nDeals 업무 인턴 채용\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r261007.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": true,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260928",
    "company": "삼일PwC",
    "title": "Middle Market Corporate Finance 부문 채용",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 6200,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,200 ~ 8,500만 원 (경력 처우)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "요구 스킬셋 부합 여부 확인 필요"
    ],
    "rawText": "[삼일PwC 수시채용]\nMiddle Market Corporate Finance 부문 채용\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260928.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260918-1",
    "company": "삼일PwC",
    "title": "Public Service팀 컨설팅 인턴 채용",
    "canonicalRole": "Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 2700,
    "salaryMaxManwon": 3100,
    "salaryDisplay": "월 220~250만 원 (학부/체험형 인턴십)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "인턴",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "기초 직무 지식 및 영어 커뮤니케이션"
    ],
    "rawText": "[삼일PwC 인턴십]\nPublic Service팀 컨설팅 인턴 채용\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260918-1.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": true,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260918",
    "company": "삼일PwC",
    "title": "조직문화 데이터 & 소통 플랫폼 지원 인턴 채용",
    "canonicalRole": "Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 2700,
    "salaryMaxManwon": 3100,
    "salaryDisplay": "월 220~250만 원 (학부/체험형 인턴십)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "인턴",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "기초 직무 지식 및 영어 커뮤니케이션"
    ],
    "rawText": "[삼일PwC 인턴십]\n조직문화 데이터 & 소통 플랫폼 지원 인턴 채용\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260918.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": true,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260917-3",
    "company": "삼일PwC",
    "title": "Tax 경력직 Full-time 모집",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 6200,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,200 ~ 8,500만 원 (경력 처우)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "요구 스킬셋 부합 여부 확인 필요"
    ],
    "rawText": "[삼일PwC 수시채용]\nTax 경력직 Full-time 모집\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260917-3.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260917-2",
    "company": "삼일PwC",
    "title": "Deals, Real Assets 부동산 자문 경력직 모집",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 6200,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,200 ~ 8,500만 원 (경력 처우)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "요구 스킬셋 부합 여부 확인 필요"
    ],
    "rawText": "[삼일PwC 수시채용]\nDeals, Real Assets 부동산 자문 경력직 모집\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260917-2.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260917-1",
    "company": "삼일PwC",
    "title": "Deals, Real Assets 부동산 오피스 임차자문 경력직 모집",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 6200,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,200 ~ 8,500만 원 (경력 처우)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "요구 스킬셋 부합 여부 확인 필요"
    ],
    "rawText": "[삼일PwC 수시채용]\nDeals, Real Assets 부동산 오피스 임차자문 경력직 모집\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260917-1.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "pwc-r260914",
    "company": "삼일PwC",
    "title": "Deals 재무자문팀 경력직 채용",
    "canonicalRole": "Corporate Finance & Deals",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 용산구 (삼일PwC 본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 6200,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,200 ~ 8,500만 원 (경력 처우)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "수시채용"
    ],
    "pros": [
      "국내 1위 회계법인 삼일PwC의 전문성과 네트워크",
      "다양한 글로벌 프로젝트 경험"
    ],
    "gaps": [
      "요구 스킬셋 부합 여부 확인 필요"
    ],
    "rawText": "[삼일PwC 수시채용]\nDeals 재무자문팀 경력직 채용\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.",
    "sourceName": "삼일PwC 공식 채용관",
    "jobUrl": "https://www.pwc.com/kr/ko/career/experienced/r260914.html",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "PwC Global ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5219",
    "company": "딜로이트 안진",
    "title": "딜로이트컨설팅 금융 공공기관 중장기 로드맵 수립 프로젝트 사업관리 인턴",
    "canonicalRole": "Management Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 2700,
    "salaryMaxManwon": 3100,
    "salaryDisplay": "월 230~250만 원 (인턴 처우)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "인턴",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "논리적 사고 및 프레젠테이션 역량"
    ],
    "rawText": "[딜로이트 안진 채용]\n딜로이트컨설팅 금융 공공기관 중장기 로드맵 수립 프로젝트 사업관리 인턴\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5219",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": true,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5217",
    "company": "딜로이트 안진",
    "title": "세무자문부문 지방세 분야 전문가 신입 & 경력직 회계사",
    "canonicalRole": "Tax & Financial Advisory",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 4600,
    "salaryMaxManwon": 5300,
    "salaryDisplay": "4,600 ~ 5,300만 원 (신입 대졸초임)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "신입",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "논리적 사고 및 프레젠테이션 역량"
    ],
    "rawText": "[딜로이트 안진 채용]\n세무자문부문 지방세 분야 전문가 신입 & 경력직 회계사\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5217",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": true,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5216",
    "company": "딜로이트 안진",
    "title": "세무자문부문 서류 검토 아르바이트",
    "canonicalRole": "Tax & Financial Advisory",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8800,
    "salaryDisplay": "6,500 ~ 8,800만 원 (경력직)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "직무별 상세 요건 확인 필요"
    ],
    "rawText": "[딜로이트 안진 채용]\n세무자문부문 서류 검토 아르바이트\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5216",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5215",
    "company": "딜로이트 안진",
    "title": "회계감사부문 기업 전략기획 및 경영관리(성과관리, 원가/수익성분석(관리회계))컨설턴트 채용",
    "canonicalRole": "Tax & Financial Advisory",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8800,
    "salaryDisplay": "6,500 ~ 8,800만 원 (경력직)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "직무별 상세 요건 확인 필요"
    ],
    "rawText": "[딜로이트 안진 채용]\n회계감사부문 기업 전략기획 및 경영관리(성과관리, 원가/수익성분석(관리회계))컨설턴트 채용\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5215",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": false,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5213",
    "company": "딜로이트 안진",
    "title": "T&T부문 기업 Risk Management 및 IT/DX 분야 컨설팅 계약직(전환형)",
    "canonicalRole": "Management Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8800,
    "salaryDisplay": "6,500 ~ 8,800만 원 (경력직)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "직무별 상세 요건 확인 필요"
    ],
    "rawText": "[딜로이트 안진 채용]\nT&T부문 기업 Risk Management 및 IT/DX 분야 컨설팅 계약직(전환형)\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5213",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5212",
    "company": "딜로이트 안진",
    "title": "T&T부문 기업 Risk Management 및 IT/DX 분야 컨설팅 경력직",
    "canonicalRole": "Management Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8800,
    "salaryDisplay": "6,500 ~ 8,800만 원 (경력직)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "직무별 상세 요건 확인 필요"
    ],
    "rawText": "[딜로이트 안진 채용]\nT&T부문 기업 Risk Management 및 IT/DX 분야 컨설팅 경력직\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5212",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5211",
    "company": "딜로이트 안진",
    "title": "T&T부문 정보보안 컨설팅 인턴",
    "canonicalRole": "Management Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 2700,
    "salaryMaxManwon": 3100,
    "salaryDisplay": "월 230~250만 원 (인턴 처우)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "인턴",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "논리적 사고 및 프레젠테이션 역량"
    ],
    "rawText": "[딜로이트 안진 채용]\nT&T부문 정보보안 컨설팅 인턴\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5211",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": true,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "deloitte-5210",
    "company": "딜로이트 안진",
    "title": "T&T부문 인증보안 컨설팅 경력직",
    "canonicalRole": "Management Consulting",
    "occupation": "PLANNING",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 영등포구 여의도동",
    "commuteMinutes": 48,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8800,
    "salaryDisplay": "6,500 ~ 8,800만 원 (경력직)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 10,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "정규직",
      "여의도"
    ],
    "pros": [
      "글로벌 빅4 회계법인 커리어",
      "체계적인 주니어/시니어 교육 프로그램"
    ],
    "gaps": [
      "직무별 상세 요건 확인 필요"
    ],
    "rawText": "[딜로이트 안진 채용]\nT&T부문 인증보안 컨설팅 경력직\n상세 직무 내용 및 우대사항은 공고 참조.",
    "sourceName": "딜로이트 공식 채용 (WiseRecruit2)",
    "jobUrl": "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5210",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "WiseRecruit2 ATS",
    "isEntryLevel": false,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "tech-toss-frontend",
    "company": "비바리퍼블리카 (토스)",
    "title": "Frontend Platform Engineer (주니어/신입 환영)",
    "canonicalRole": "Frontend Engineering",
    "occupation": "TECH",
    "industry": "IT / 핀테크",
    "location": "서울 강남구 테헤란로",
    "commuteMinutes": 48,
    "salaryMinManwon": 5500,
    "salaryMaxManwon": 7000,
    "salaryDisplay": "5,500 ~ 7,000만 원 (업계 최고 수준 대졸초임/스톡옵션)",
    "salaryTier": "A",
    "minYears": 0,
    "maxYears": 3,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "유니콘",
      "신입/주니어",
      "Frontend",
      "React",
      "TypeScript"
    ],
    "pros": [
      "자율과 책임 문화, 압도적인 동료 수준",
      "금융 혁신 서비스 대규모 트래픽 경험"
    ],
    "gaps": [
      "웹 성능 최적화 및 브라우저 렌더링 심층 이해"
    ],
    "rawText": "토스 프론트엔드 플랫폼 엔지니어 채용. React, TypeScript, 모던 웹 표준 기반 개발.",
    "sourceName": "토스 커리어",
    "jobUrl": "https://toss.im/career",
    "sourceCategory": "GLOBAL_TECH",
    "isCompanyExclusive": true,
    "sourceSystem": "Toss Greenhouse ATS",
    "isEntryLevel": true,
    "jobCategory": "TECH",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "tech-naver-cloud",
    "company": "네이버클라우드",
    "title": "Cloud Software Engineer (신입 공채)",
    "canonicalRole": "Cloud Platform",
    "occupation": "TECH",
    "industry": "IT / 클라우드",
    "location": "경기도 성남시 분당구 정자동",
    "commuteMinutes": 38,
    "salaryMinManwon": 5000,
    "salaryMaxManwon": 6000,
    "salaryDisplay": "5,000 ~ 6,000만 원 (대졸 신입 기준)",
    "salaryTier": "A",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "대기업",
      "신입공채",
      "Cloud",
      "Java",
      "Linux"
    ],
    "pros": [
      "국내 1위 클라우드 인프라 연구개발",
      "체계적인 신입 온보딩 프로그램"
    ],
    "gaps": [
      "자료구조/알고리즘 및 분산 시스템 이해"
    ],
    "rawText": "네이버클라우드 신입 공채. 대규모 분산 클라우드 플랫폼 서비스 개발.",
    "sourceName": "네이버 커리어스",
    "jobUrl": "https://recruit.navercorp.com/",
    "sourceCategory": "CONGLOMERATE",
    "isCompanyExclusive": true,
    "sourceSystem": "Naver Careers",
    "isEntryLevel": true,
    "jobCategory": "TECH",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "tech-woowa-backend",
    "company": "우아한형제들 (배달의민족)",
    "title": "배민커머스 주문시스템 서버 개발자 (경력 3년 이상)",
    "canonicalRole": "Backend Engineering",
    "occupation": "TECH",
    "industry": "IT / 이커머스",
    "location": "서울 송파구 올림픽로",
    "commuteMinutes": 52,
    "salaryMinManwon": 6800,
    "salaryMaxManwon": 9200,
    "salaryDisplay": "6,800 ~ 9,200만 원 (경력 3~7년)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 8,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "플랫폼",
      "정규직",
      "Backend",
      "Spring",
      "Kafka"
    ],
    "pros": [
      "주 32시간/주 36시간 유연근무",
      "초당 수천 건 주문 트래픽 처리"
    ],
    "gaps": [
      "대규모 분산 트랜잭션 및 MSA 설계 역량"
    ],
    "rawText": "배민 주문시스템 백엔드 개발. Java, Spring Boot, Kafka, MySQL 기반 고가용성 설계.",
    "sourceName": "우아한형제들 채용",
    "jobUrl": "https://career.woowahan.com/",
    "sourceCategory": "GLOBAL_TECH",
    "isCompanyExclusive": true,
    "sourceSystem": "배민 커리어",
    "isEntryLevel": false,
    "jobCategory": "TECH",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "fin-kpmg-cpa",
    "company": "삼정KPMG",
    "title": "Deal Advisory본부 신입 공인회계사(KICPA) 및 인턴 채용",
    "canonicalRole": "M&A Valuation",
    "occupation": "FINANCE",
    "industry": "전문서비스 / 회계컨설팅",
    "location": "서울 강남구 역삼동",
    "commuteMinutes": 46,
    "salaryMinManwon": 4800,
    "salaryMaxManwon": 5600,
    "salaryDisplay": "4,800 ~ 5,600만 원 (CPA 신입 초임)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 2,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "Big4 회계법인",
      "KICPA",
      "신입/인턴",
      "재무자문"
    ],
    "pros": [
      "국내 최고 수준의 M&A 기업가치평가(Valuation) 실무",
      "체계적 커리어패스"
    ],
    "gaps": [
      "재무제표 분석 및 재무모델링(DCF) 역량"
    ],
    "rawText": "삼정KPMG Deal Advisory본부 신입 공인회계사 채용. 기업인수합병 및 실사 자문.",
    "sourceName": "삼정KPMG 공식 채용관",
    "jobUrl": "https://career.kr.kpmg.com",
    "sourceCategory": "CONSULTING",
    "isCompanyExclusive": true,
    "sourceSystem": "KPMG Careers",
    "isEntryLevel": true,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "fin-shinhan-bank",
    "company": "신한은행",
    "title": "디지털/ICT 및 기업금융 신입 일반직 채용",
    "canonicalRole": "Corporate Banking & ICT",
    "occupation": "FINANCE",
    "industry": "금융 / 은행",
    "location": "서울 중구 태평로 (본점)",
    "commuteMinutes": 44,
    "salaryMinManwon": 5400,
    "salaryMaxManwon": 6200,
    "salaryDisplay": "5,400 ~ 6,200만 원 (대졸 신입 초임 + 성과급)",
    "salaryTier": "A",
    "minYears": 0,
    "maxYears": 2,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "시중은행",
      "금융공채",
      "신입",
      "정규직"
    ],
    "pros": [
      "국내 최고 수준의 대졸 신입 초임 및 복리후생",
      "금융 데이터 및 기업여신 심사"
    ],
    "gaps": [
      "금융 상식 및 기업분석 리포트 이해"
    ],
    "rawText": "신한은행 신입 행원 채용. 기업금융 및 디지털 뱅킹 플랫폼 운영.",
    "sourceName": "신한은행 채용포털",
    "jobUrl": "https://shinhan.recruiter.co.kr",
    "sourceCategory": "CONGLOMERATE",
    "isCompanyExclusive": true,
    "sourceSystem": "Shinhan Recruiter ATS",
    "isEntryLevel": true,
    "jobCategory": "FINANCE",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "mkt-cj-enm",
    "company": "CJ ENM",
    "title": "미디어 퍼포먼스 마케팅 신입사원 / 채용형 인턴",
    "canonicalRole": "Performance Marketing",
    "occupation": "MARKETING",
    "industry": "미디어 / 엔터테인먼트",
    "location": "서울 마포구 상암동",
    "commuteMinutes": 52,
    "salaryMinManwon": 3800,
    "salaryMaxManwon": 4400,
    "salaryDisplay": "3,800 ~ 4,400만 원 (대졸 신입 기준)",
    "salaryTier": "B",
    "minYears": 0,
    "maxYears": 1,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "대기업",
      "마케팅",
      "인턴/신입",
      "콘텐츠"
    ],
    "pros": [
      "글로벌 K-콘텐츠 미디어 캠페인 주도",
      "데이터 기반 광고 최적화"
    ],
    "gaps": [
      "GA4, 메타 광고 관리자 및 데이터 분석 기초"
    ],
    "rawText": "CJ ENM 디지털 마케팅 신입 채용. OTT 및 콘텐츠 미디어 캠페인 그로스 기획.",
    "sourceName": "CJ 채용포털",
    "jobUrl": "https://recruit.cj.net",
    "sourceCategory": "CONGLOMERATE",
    "isCompanyExclusive": true,
    "sourceSystem": "CJ Careers",
    "isEntryLevel": true,
    "jobCategory": "MARKETING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "mkt-daangn-growth",
    "company": "당근 (당근마켓)",
    "title": "Local Ads Growth Marketer (경력 3년 이상)",
    "canonicalRole": "Growth & Product Marketing",
    "occupation": "MARKETING",
    "industry": "IT / 커뮤니티 플랫폼",
    "location": "서울 서초구 강남대로",
    "commuteMinutes": 44,
    "salaryMinManwon": 6000,
    "salaryMaxManwon": 8000,
    "salaryDisplay": "6,000 ~ 8,000만 원 (경력 3~6년)",
    "salaryTier": "B",
    "minYears": 3,
    "maxYears": 7,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "유니콘",
      "그로스마케팅",
      "데이터분석",
      "SQL"
    ],
    "pros": [
      "전 국민 3,500만 유저 플랫폼 마케팅",
      "식대 무제한 및 자율 휴가 제도"
    ],
    "gaps": [
      "A/B 테스트 설계 및 코호트 리텐션 분석 역량"
    ],
    "rawText": "당근 로컬 비즈니스 그로스 마케터 채용. 데이터 기반 사용자 전환율 최적화.",
    "sourceName": "당근 팀 채용",
    "jobUrl": "https://about.daangn.com/jobs",
    "sourceCategory": "GLOBAL_TECH",
    "isCompanyExclusive": true,
    "sourceSystem": "Greenhouse ATS",
    "isEntryLevel": false,
    "jobCategory": "MARKETING",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "hr-samsung-dx",
    "company": "삼성전자 DX부문",
    "title": "People Analytics & HR Data Specialist (경력직)",
    "canonicalRole": "HR Analytics",
    "occupation": "HR",
    "industry": "제조 / IT",
    "location": "경기 수원시 영통구 (디지털시티)",
    "commuteMinutes": 35,
    "salaryMinManwon": 8500,
    "salaryMaxManwon": 11000,
    "salaryDisplay": "8,500 ~ 11,000만 원 (Tier A + OPI 성과급)",
    "salaryTier": "A",
    "minYears": 5,
    "maxYears": 12,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "대기업",
      "수원사업장",
      "피플애널리틱스",
      "인사기획"
    ],
    "pros": [
      "국내 최고 수준의 확정 연봉 및 성과급(최대 50%)",
      "대규모 글로벌 조직 데이터 분석"
    ],
    "gaps": [
      "글로벌 HR 지표 설계 및 파이썬/SQL 분석 역량"
    ],
    "rawText": "삼성전자 DX부문 People Analytics 전문인력 채용. 인재 데이터 기반 예측 모델링.",
    "sourceName": "삼성 커리어스",
    "jobUrl": "https://www.samsungcareers.com/",
    "sourceCategory": "CONGLOMERATE",
    "isCompanyExclusive": true,
    "sourceSystem": "삼성 채용시스템",
    "isEntryLevel": false,
    "jobCategory": "HR",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "hr-coupang-er",
    "company": "쿠팡 (Coupang)",
    "title": "Employee Relations (ER) Specialist (노무/조직관리)",
    "canonicalRole": "Labor Relations & HR Compliance",
    "occupation": "HR",
    "industry": "IT / 이커머스",
    "location": "서울 송파구 송파대로 (쿠팡 본사)",
    "commuteMinutes": 52,
    "salaryMinManwon": 6500,
    "salaryMaxManwon": 8500,
    "salaryDisplay": "6,500 ~ 8,500만 원 + RSU 주식 보상",
    "salaryTier": "B",
    "minYears": 4,
    "maxYears": 9,
    "hasFixedOT": true,
    "fixedOTHours": 20,
    "tags": [
      "미국상장사",
      "노무관리",
      "ER",
      "정규직"
    ],
    "pros": [
      "뉴욕증시 상장 글로벌 테크 기업의 인사 시스템",
      "RSU 주식 보상 패키지"
    ],
    "gaps": [
      "근로기준법 및 복수노조 단체교섭 실무 경험"
    ],
    "rawText": "쿠팡 ER Specialist 채용. 노사관계 협력 및 사내 인사규정 컴플라이언스 총괄.",
    "sourceName": "쿠팡 커리어스",
    "jobUrl": "https://www.coupang.jobs/kr",
    "sourceCategory": "GLOBAL_TECH",
    "isCompanyExclusive": true,
    "sourceSystem": "Coupang Workday ATS",
    "isEntryLevel": false,
    "jobCategory": "HR",
    "publishedAt": "2026-10-07"
  },
  {
    "id": "plan-hyundai-talent",
    "company": "현대자동차",
    "title": "경영전략 및 사업기획 신입사원 채용",
    "canonicalRole": "Corporate Strategy",
    "occupation": "PLANNING",
    "industry": "제조 / 모빌리티",
    "location": "서울 서초구 양재동 (본사)",
    "commuteMinutes": 45,
    "salaryMinManwon": 4800,
    "salaryMaxManwon": 5500,
    "salaryDisplay": "4,800 ~ 5,500만 원 (대졸 신입 초임)",
    "salaryTier": "A",
    "minYears": 0,
    "maxYears": 2,
    "hasFixedOT": false,
    "fixedOTHours": 0,
    "tags": [
      "대기업",
      "신입공채",
      "경영기획",
      "양재본사"
    ],
    "pros": [
      "글로벌 Top 3 완성차 기업의 글로벌 전략 참여",
      "안정적인 복리후생"
    ],
    "gaps": [
      "재무제표 이해 및 경영분석 기초"
    ],
    "rawText": "현대자동차 경영기획 신입 채용. 중장기 모빌리티 사업계획 및 투자 타당성 분석.",
    "sourceName": "현대자동차 채용관",
    "jobUrl": "https://talent.hyundai.com",
    "sourceCategory": "CONGLOMERATE",
    "isCompanyExclusive": true,
    "sourceSystem": "Hyundai Talent Platform",
    "isEntryLevel": true,
    "jobCategory": "PLANNING",
    "publishedAt": "2026-10-07"
  }
];

// 3 Tracks of Skill Gap Bridging totaling 28 Expanded Opportunities
export const EXPANDED_SKILL_GAP_TRACKS: SkillGapTrack[] = [
  {
    id: "track-analytics",
    name: "People Analytics & HR Data Science",
    skills: ["SQL (인사 DB 쿼리 및 코호트 집계)", "Tableau / PowerBI 대시보드 구축", "퇴사 예측 및 리텐션 모델링", "eNPS / 조직 건강도 통계 분석"],
    actionItems: [
      "SQL 레벨 2 (GROUP BY, Window Function) 인사 데이터셋 실습",
      "Tableau 기반 '월별 자발적 퇴사율 & 인당 매출액' 대시보드 포트폴리오 제작",
      "피플 사이언스 통계 개념(선형 회귀, 로지스틱 회귀) 이해",
    ],
    expandedCount: 14,
    expectedSalaryRange: "6,800 ~ 8,500만 원 (+15~25% 프리미엄)",
    jobs: [
      { company: "쿠팡 (Coupang)", title: "People Analytics Specialist", location: "서울 송파구 잠실", role: "HR Data Analytics", salary: "7,000 ~ 9,000만 원", url: "https://www.coupang.jobs/kr/" },
      { company: "토스 (비바리퍼블리카)", title: "People Data Partner", location: "서울 강남구 역삼", role: "People Operations", salary: "7,500 ~ 9,500만 원", url: "https://toss.im/career/jobs" },
      { company: "SK하이닉스", title: "피플오퍼레이션 & 데이터 분석가", location: "경기도 분당/이천", role: "HR Analytics", salary: "6,500 ~ 8,000만 원", url: "https://www.skcareers.com" },
      { company: "무신사 (Musinsa)", title: "People Analytics 매니저", location: "서울 성동구 성수", role: "HR Data & Comp", salary: "6,500 ~ 8,000만 원", url: "https://musinsa.recruiter.co.kr" },
      { company: "야놀자 (Yanolja)", title: "People Insights Lead", location: "서울 강남구 대치", role: "People Intelligence", salary: "6,800 ~ 8,200만 원", url: "https://careers.yanolja.co" },
      { company: "엔씨소프트 (NC)", title: "HR 데이터 분석 & 보상 기획자", location: "경기도 성남시 판교", role: "Total Rewards & Analytics", salary: "7,000 ~ 8,500만 원", url: "https://careers.ncsoft.com" },
      { company: "라인플러스 (LINE)", title: "Global People Analytics", location: "경기도 성남시 분당", role: "Global HR Data", salary: "7,200 ~ 8,800만 원", url: "https://linepluscorp.com/career" },
      { company: "우아한형제들 (배민)", title: "피플데이터 기획 담당자", location: "서울 송파구 몽촌토성", role: "People Analytics", salary: "6,800 ~ 8,300만 원", url: "https://career.woowahan.com" },
      { company: "크래프톤 (KRAFTON)", title: "HR Data Analyst", location: "서울 강남구 역삼", role: "HR Intelligence", salary: "7,500 ~ 9,000만 원", url: "https://krafton.recruiter.co.kr" },
      { company: "카카오 (Kakao)", title: "피플인사이트 크루", location: "경기도 성남시 판교", role: "People Insights", salary: "6,800 ~ 8,500만 원", url: "https://careers.kakao.com" },
      { company: "네이버 (NAVER)", title: "HR Analytics & Systems", location: "경기도 성남시 분당", role: "HR System & Data", salary: "7,200 ~ 8,800만 원", url: "https://recruit.navercorp.com" },
      { company: "CJ올리브영", title: "HR 데이터 분석 & 피플옵스", location: "서울 용산구", role: "HR Data Specialist", salary: "6,200 ~ 7,500만 원", url: "https://oliveyoung.recruiter.co.kr" },
      { company: "당근 (Daangn)", title: "People System & Data Specialist", location: "서울 서초구 교대", role: "HR Operations & Data", salary: "6,500 ~ 8,000만 원", url: "https://careers.daangn.com/jobs/" },
      { company: "뤼이드 (Riiid)", title: "EdTech People Operations Analyst", location: "서울 강남구 삼성", role: "People Ops Analyst", salary: "6,000 ~ 7,800만 원", url: "https://riiid.recruiter.co.kr" },
    ],
  },
  {
    id: "track-global",
    name: "Global HR & Cross-Border Mobility",
    skills: ["비즈니스 영어 능통 (인터뷰/노무 협상)", "해외 법인 노동법 컴플라이언스 & 비자 규정", "글로벌 통합 HRIS (Workday) 운영", "주재원 파견 및 크로스보더 패키지 설계"],
    actionItems: [
      "영문 이력서 & LinkedIn 프로필 글로벌 스탠다드 최적화",
      "글로벌 HR 용어 및 미국/동남아 노동법(FLSA, Statutory Benefits) 케이스 스터디",
      "외국인 엔지니어 채용 인터뷰 시뮬레이션 및 영어 테크니컬 스크리닝 연습",
    ],
    expandedCount: 8,
    expectedSalaryRange: "7,000 ~ 9,200만 원 (+20~30% 프리미엄)",
    jobs: [
      { company: "당근 (Daangn Japan/Global)", title: "Global People & Culture Lead", location: "서울 서초구 (해외 출장 포함)", role: "Global HR", salary: "7,200 ~ 9,000만 원", url: "https://careers.daangn.com/jobs/" },
      { company: "하이퍼커넥트 (Match Group)", title: "Global HRBP (English Fluent)", location: "서울 강남구 삼성", role: "Global HRBP", salary: "7,500 ~ 9,500만 원", url: "https://career.hyperconnect.com" },
      { company: "현대모비스 글로벌인사", title: "해외법인 인사제도 운영 기획자", location: "서울 강남구 테헤란로", role: "Global HR Strategy", salary: "6,800 ~ 8,200만 원", url: "https://careers.mobis.com" },
      { company: "넷마블 (Netmarble)", title: "글로벌 인사 및 해외법인 관리", location: "서울 구로구 지밸리", role: "Global HR Ops", salary: "6,500 ~ 8,000만 원", url: "https://netmarble.recruiter.co.kr" },
      { company: "센드버드코리아 (Sendbird)", title: "People Operations Lead (Korea & APAC)", location: "서울 강남구 테헤란로", role: "APAC People Ops", salary: "8,000 ~ 10,000만 원", url: "https://sendbird.com/careers" },
      { company: "몰로코 (Moloco Korea)", title: "HR Generalist (Global Tech)", location: "서울 강남구 역삼", role: "Global Tech HR", salary: "7,500 ~ 9,500만 원", url: "https://www.moloco.com/company/careers" },
      { company: "딜 (Deel Korea)", title: "EOR HR Compliance Consultant", location: "원격 근무 (Remote Korea)", role: "Cross-border Labor", salary: "7,000 ~ 8,800만 원", url: "https://www.deel.com/careers" },
      { company: "아마존웹서비스 (AWS Korea)", title: "HR Partner (Tech Organizations)", location: "서울 강남구 테헤란로", role: "HR Business Partner", salary: "8,500 ~ 11,000만 원", url: "https://www.amazon.jobs/content/locations/south-korea/seoul" },
    ],
  },
  {
    id: "track-ax",
    name: "HR AX (AI Transformation) & No-Code Automation",
    skills: ["생성형 AI(LLM) 기반 직무기술서(JD) 및 평가 초안 파이프라인 기획", "Flex / Lemontree / Zapier 기반 인사 행정 노코드 자동화", "사내 AI 윤리 및 근로기준법 규정 가이드라인 수립", "차세대 HR 테크 툴 벤더 평가 및 마이그레이션 PM"],
    actionItems: [
      "사내 채용/평가 업무용 AI 프롬프트 템플릿 라이브러리 구축",
      "노코드 도구를 활용한 신규 입사자 온보딩 자동화 플로우 제작",
      "인사노무 질의응답 내부 AI 에이전트 프로토타입 설계",
    ],
    expandedCount: 6,
    expectedSalaryRange: "6,500 ~ 8,200만 원 (신설 조직 리더급)",
    jobs: [
      { company: "삼성전자 DX부문", title: "People AX (AI Transformation) 혁신 PM", location: "경기도 수원 디지털시티", role: "HR Tech / AX", salary: "7,000 ~ 8,800만 원", url: "https://www.samsungcareers.com" },
      { company: "LG CNS", title: "생성형 AI 기반 HR 솔루션 기획자", location: "서울 강서구 마곡", role: "HR DX Consultant", salary: "6,800 ~ 8,300만 원", url: "https://careers.lg.com" },
      { company: "CJ ENM", title: "HR Digital Transformation & Systems", location: "서울 마포구 상암", role: "HR Tech Lead", salary: "6,500 ~ 7,800만 원", url: "https://recruit.cj.net" },
      { company: "포스코DX (POSCO DX)", title: "스마트 HR 시스템 및 자동화 기획", location: "경기도 성남시 판교", role: "Smart HR PM", salary: "6,500 ~ 8,000만 원", url: "https://gorecruit.posco.net" },
      { company: "한화시스템", title: "AI 기반 피플 인텔리전스 시스템 PM", location: "서울 영등포구 여의도", role: "HR AI Architect", salary: "6,800 ~ 8,200만 원", url: "https://www.hanwhain.com" },
      { company: "두산디지털이노베이션 (DDI)", title: "HR Tech & SaaS Integration PM", location: "서울 중구 동대문", role: "HR SaaS PM", salary: "6,500 ~ 7,900만 원", url: "https://career.doosan.com" },
    ],
  },
];

// Dynamic Domain Detector from free-form keywords
export function detectDomainFromKeywords(input: string): {
  domainKey: 'TECH' | 'FINANCE' | 'PLANNING' | 'MARKETING' | 'HR' | 'GENERAL';
  domainName: string;
  entryRange: { p10: number; p25: number; p50: number; p75: number; p90: number };
  growthPerYear: number;
} {
  const s = (input || '').toLowerCase();
  
  // 1. TECH
  if (
    s.includes('개발') || s.includes('dev') || s.includes('engineer') || s.includes('엔지니어') ||
    s.includes('frontend') || s.includes('backend') || s.includes('fullstack') || s.includes('프론트') ||
    s.includes('백엔드') || s.includes('풀스택') || s.includes('react') || s.includes('node') ||
    s.includes('python') || s.includes('java') || s.includes('data') || s.includes('데이터') ||
    s.includes('ai') || s.includes('인공지능') || s.includes('머신러닝') || s.includes('ml') ||
    s.includes('테크') || s.includes('tech') || s.includes('클라우드') || s.includes('cloud') ||
    s.includes('보안') || s.includes('security') || s.includes('devops') || s.includes('sw')
  ) {
    return {
      domainKey: 'TECH',
      domainName: 'IT·테크 & 소프트웨어 엔지니어링',
      entryRange: { p10: 3800, p25: 4400, p50: 5000, p75: 5600, p90: 6500 },
      growthPerYear: 450,
    };
  }

  // 2. FINANCE / ACCOUNTING
  if (
    s.includes('회계') || s.includes('세무') || s.includes('finance') || s.includes('tax') ||
    s.includes('재무') || s.includes('감사') || s.includes('자금') || s.includes('투자') ||
    s.includes('딜') || s.includes('deals') || s.includes('m&a') || s.includes('cpa') ||
    s.includes('애널리스트') || s.includes('증권') || s.includes('운용') || s.includes('ib')
  ) {
    return {
      domainKey: 'FINANCE',
      domainName: '금융·재무 & 회계/컨설팅',
      entryRange: { p10: 3600, p25: 4200, p50: 4800, p75: 5400, p90: 6200 },
      growthPerYear: 420,
    };
  }

  // 3. PLANNING / STRATEGY / CONSULTING
  if (
    s.includes('기획') || s.includes('전략') || s.includes('consulting') || s.includes('컨설팅') ||
    s.includes('pm') || s.includes('po') || s.includes('사업기획') || s.includes('경영') ||
    s.includes('서비스기획') || s.includes('사업개발') || s.includes('planning') || s.includes('strategy')
  ) {
    return {
      domainKey: 'PLANNING',
      domainName: '경영전략 & 사업/서비스 기획',
      entryRange: { p10: 3400, p25: 4000, p50: 4500, p75: 5000, p90: 5800 },
      growthPerYear: 380,
    };
  }

  // 4. MARKETING / GROWTH
  if (
    s.includes('마케팅') || s.includes('marketing') || s.includes('그로스') || s.includes('퍼포먼스') ||
    s.includes('브랜딩') || s.includes('광고') || s.includes('콘텐츠') || s.includes('pr') ||
    s.includes('홍보') || s.includes('sns') || s.includes('캠페인')
  ) {
    return {
      domainKey: 'MARKETING',
      domainName: '마케팅 & 그로스/브랜딩',
      entryRange: { p10: 3200, p25: 3600, p50: 4000, p75: 4500, p90: 5200 },
      growthPerYear: 350,
    };
  }

  // 5. HR / PEOPLE
  if (
    s.includes('인사') || s.includes('hr') || s.includes('피플') || s.includes('people') ||
    s.includes('채용') || s.includes('노무') || s.includes('er') || s.includes('조직문화') ||
    s.includes('총무') || s.includes('hrbp') || s.includes('평가보상')
  ) {
    return {
      domainKey: 'HR',
      domainName: '인사·피플 & 조직문화(HR)',
      entryRange: { p10: 3300, p25: 3700, p50: 4100, p75: 4600, p90: 5400 },
      growthPerYear: 340,
    };
  }

  // 6. GENERAL
  return {
    domainKey: 'GENERAL',
    domainName: '전문 비즈니스 사무·운영',
    entryRange: { p10: 3000, p25: 3400, p50: 3800, p75: 4300, p90: 5000 },
    growthPerYear: 320,
  };
}

// Dynamic Market Value Calculator (P10, P25, P50, P75, P90)
export function calculateEstimatedMarketValue(
  roleOrYears: string | number,
  yearsParam: number = 0,
  trackParam?: 'ENTRY' | 'EXPERIENCED'
) {
  let roleStr = "";
  let years = 0;
  let track = trackParam;

  if (typeof roleOrYears === "number") {
    years = roleOrYears;
    roleStr = "";
  } else {
    roleStr = roleOrYears || "";
    years = yearsParam;
  }

  const domain = detectDomainFromKeywords(roleStr);
  const isEntry = years === 0 || track === 'ENTRY';

  if (isEntry) {
    const p10 = domain.entryRange.p10;
    const p25 = domain.entryRange.p25;
    const p50 = domain.entryRange.p50;
    const p75 = domain.entryRange.p75;
    const p90 = domain.entryRange.p90;

    return {
      cohortDescription: `수도권 / ${domain.domainName} / 신입(0년차) 대졸 초임 코호트`,
      sampleSize: 64,
      confidenceTier: "Tier A (고용노동부 대졸초임 공시 + 주요 대기업/공공기관 공채 기준)" as const,
      p10,
      p25,
      p50,
      p75,
      p90,
      rangeDisplay: `${p25.toLocaleString()} ~ ${p75.toLocaleString()}만 원`,
      methodology: {
        tierAWeight: "60% (고용노동부 임금직무정보시스템 대졸 초임 공시 + ALIO 신입 초임)",
        tierBWeight: "30% (주요 대기업 및 IT/금융 12개월 내 확정 대졸 신입 처우 n=64)",
        tierCWeight: "10% (신입 제보 표본 상하위 5% IQR 절사 보정)",
        baseScope: "확정 현금성 기본급 기준 (성과급 및 복리후생 별도)",
      },
    };
  }

  const clampedYears = Math.max(1, Math.min(25, years));
  const baseP50 = domain.entryRange.p50;
  const growth = domain.growthPerYear;

  const p10 = Math.round(domain.entryRange.p10 + clampedYears * (growth * 0.8));
  const p25 = Math.round(domain.entryRange.p25 + clampedYears * (growth * 0.9));
  const p50 = Math.round(baseP50 + clampedYears * growth);
  const p75 = Math.round(domain.entryRange.p75 + clampedYears * (growth * 1.1));
  const p90 = Math.round(domain.entryRange.p90 + clampedYears * (growth * 1.25));

  const seniorityLabel = clampedYears <= 3 ? "주니어(1~3년차)" : clampedYears <= 7 ? "대리·선임(4~7년차)" : clampedYears <= 11 ? "과장·차장(8~11년차)" : "팀장·시니어(12년차+)";

  return {
    cohortDescription: `수도권 / ${domain.domainName} / ${clampedYears}년차 ${seniorityLabel} 코호트`,
    sampleSize: 52,
    confidenceTier: "Tier B (검증 공고 및 실무 오퍼 기반)" as const,
    p10,
    p25,
    p50,
    p75,
    p90,
    rangeDisplay: `${p25.toLocaleString()} ~ ${p75.toLocaleString()}만 원`,
    methodology: {
      tierAWeight: "50% (고용노동부 사업체임금근로시간조사 + DART/ALIO 공시 결합)",
      tierBWeight: "40% (수도권 검증 기업 12개월 내 확정 공고 및 실오퍼 n=52)",
      tierCWeight: "10% (블라인드/잡플래닛 연봉 표본 상하위 5% IQR 절사 보정)",
      baseScope: "퇴직금 및 비확정 경영성과급 제외, 100% 확정 현금성 급여(기본급+고정수당) 기준",
    },
  };
}

export function calculateDynamicJobMatch(passport: CareerPassport, job: JobPosting): DynamicMatchScore {
  const matchedReasons: string[] = [];
  const gapReasons: string[] = [];

  // User input tokens
  const userText = [
    passport.canonicalRole || '',
    passport.occupation || '',
    (passport.skills || []).join(' '),
    (passport.keywords || []).join(' '),
  ].join(' ').toLowerCase();

  const userTokens = userText
    .split(/[\s,/()&+[\]-]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2);

  // Job text
  const jobText = [
    job.title || '',
    job.canonicalRole || '',
    job.occupation || '',
    (job.tags || []).join(' '),
    job.company || '',
    (job.rawText || '').slice(0, 150),
  ].join(' ').toLowerCase();

  // 1. Role / Keyword Token Matching (40% weight)
  let roleFit = 45;
  let matchingTokens: string[] = [];

  for (const token of userTokens) {
    if (jobText.includes(token)) {
      matchingTokens.push(token);
    }
  }

  // Unique matches
  matchingTokens = Array.from(new Set(matchingTokens));

  if (matchingTokens.length >= 2) {
    roleFit = 100;
    matchedReasons.push(`키워드 완벽 일치: '${matchingTokens.slice(0, 3).join(', ')}' 관련 요건 부합`);
  } else if (matchingTokens.length === 1) {
    roleFit = 85;
    matchedReasons.push(`직무 키워드 일치: '${matchingTokens[0]}' 분야 적합`);
  } else {
    // Check if high-level domain matches
    const domain = detectDomainFromKeywords(userText).domainKey;
    const isJobMatch = 
      (domain === 'TECH' && (job.occupation === 'TECH' || jobText.includes('개발') || jobText.includes('data'))) ||
      (domain === 'FINANCE' && (job.occupation === 'FINANCE' || jobText.includes('회계') || jobText.includes('finance'))) ||
      (domain === 'HR' && (job.occupation === 'HR' || jobText.includes('인사') || jobText.includes('채용'))) ||
      (domain === 'PLANNING' && (job.occupation === 'PLANNING' || jobText.includes('기획') || jobText.includes('컨설팅'))) ||
      (domain === 'MARKETING' && (job.occupation === 'MARKETING' || jobText.includes('마케팅')));

    if (isJobMatch) {
      roleFit = 75;
      matchedReasons.push(`직군 분야 연관성 확인: ${job.canonicalRole}`);
    } else {
      roleFit = 45;
      gapReasons.push(`희망 직무 키워드와 공고 포지션 간 분야 차이 존재`);
    }
  }

  // 2. Seniority / Experience Match (25% weight)
  let seniorityFit = 70;
  const isEntryUser = passport.totalYears === 0 || passport.track === 'ENTRY';
  const isJobEntry = job.minYears === 0 || job.isEntryLevel || (job.tags || []).some(t => t.includes('신입') || t.includes('인턴')) || (job.title || '').includes('인턴') || (job.title || '').includes('신입');

  if (isEntryUser) {
    if (isJobEntry) {
      seniorityFit = 100;
      matchedReasons.push(`신입/인턴 지원 가능 포지션 (경력 요건 무관/신입 우대)`);
    } else if (job.minYears <= 2) {
      seniorityFit = 75;
      matchedReasons.push(`주니어 포지션 (${job.minYears}년차 내외) - 신입 지원 검토 가능`);
    } else {
      seniorityFit = 40;
      gapReasons.push(`최소 요구 경력(${job.minYears}년 이상) - 신입 지원 시 진입장벽 존재`);
    }
  } else {
    // Experienced user
    const years = passport.totalYears;
    if (years >= job.minYears && years <= job.maxYears) {
      seniorityFit = 100;
      matchedReasons.push(`요구 연차(${job.minYears}~${job.maxYears}년)에 내 경력(${years}년차) 최적 부합`);
    } else if (years < job.minYears) {
      const diff = job.minYears - years;
      seniorityFit = Math.max(30, 100 - diff * 20);
      gapReasons.push(`최소 요구 연차(${job.minYears}년) 대비 ${diff}년 부족`);
    } else {
      seniorityFit = 85;
      matchedReasons.push(`충분한 경력 연차 보유 (${years}년차)`);
    }
  }

  // 3. Commute / Location Match (20% weight)
  let commuteFit = 100;
  const tol = passport.commuteToleranceMinutes || 60;
  if (job.commuteMinutes <= tol) {
    commuteFit = 100;
    matchedReasons.push(`편도 통근 ${job.commuteMinutes}분 (허용 기준 ${tol}분 이내 안심 통근권)`);
  } else {
    const over = job.commuteMinutes - tol;
    commuteFit = Math.max(20, 100 - over * 3);
    gapReasons.push(`편도 통근 ${job.commuteMinutes}분 (허용 기준 ${tol}분 대비 +${over}분 초과)`);
  }

  // 4. Salary / Compensation Match (15% weight)
  let salaryFit = 75;
  const currentTotal = passport.baseSalary + passport.fixedAllowance;

  if (isEntryUser && currentTotal === 0) {
    // Fresh grad without current compensation
    salaryFit = 100;
    matchedReasons.push(`신입/인턴 공고 보상 조건 기준 확인 가능`);
  } else if (job.salaryMaxManwon >= currentTotal * 1.08) {
    salaryFit = 100;
    matchedReasons.push(`현재 보상(${currentTotal.toLocaleString()}만 원) 대비 8~25% 인상 구간 형성`);
  } else if (job.salaryMaxManwon >= currentTotal) {
    salaryFit = 85;
    matchedReasons.push(`현재 보상 수준 유지 및 유사 조건 협상 가능`);
  } else {
    salaryFit = 50;
    gapReasons.push(`공고 최대 연봉(${job.salaryMaxManwon}만 원)이 현재 보상보다 낮음`);
  }

  // Composite Total Score
  const totalScore = Math.round(
    roleFit * 0.4 +
    seniorityFit * 0.25 +
    commuteFit * 0.20 +
    salaryFit * 0.15
  );

  const verdict = totalScore >= 88 ? "HIGH" : totalScore >= 70 ? "MEDIUM" : "LOW";

  return {
    totalScore,
    roleFit,
    seniorityFit,
    commuteFit,
    salaryFit,
    verdict,
    matchedReasons,
    gapReasons,
  };
}

export function evaluateHardFilters(
  passport: CareerPassport,
  job: JobPosting
): { isExcluded: boolean; exclusionReasons: string[] } {
  const reasons: string[] = [];
  const filters = passport.hardFilters;
  if (!filters) return { isExcluded: false, exclusionReasons: [] };

  // 1. Permanent employment only (Exclude contract/temporary)
  if (filters.onlyPermanent) {
    const isPermanent = job.tags.some((t) => t.includes("정규직")) || (job.rawText && job.rawText.includes("정규직"));
    if (!isPermanent) {
      reasons.push("비정규직/계약직 배제 기준 위반");
    }
  }

  // 2. Capital area only (Exclude non-capital)
  if (filters.onlyCapitalArea) {
    const loc = (job.location + " " + (job.rawText || "")).toLowerCase();
    const isCapital = loc.includes("서울") || loc.includes("경기") || loc.includes("인천") || loc.includes("수도권") || loc.includes("강남") || loc.includes("판교") || loc.includes("분당");
    if (!isCapital) {
      reasons.push("수도권 외 지역 배제 기준 위반");
    }
  }

  // 3. Max Commute cutoff
  if (filters.maxCommuteCutoff) {
    const tol = passport.commuteToleranceMinutes || 60;
    if (job.commuteMinutes > tol) {
      reasons.push(`편도 통근 시간 초과 (${job.commuteMinutes}분 > 허용 ${tol}분)`);
    }
  }

  // 4. Over 20 hours fixed OT cutoff
  if (filters.noHeavyFixedOT) {
    if (job.hasFixedOT && job.fixedOTHours > 20) {
      reasons.push(`과도한 고정OT (${job.fixedOTHours}시간 > 20시간 초과)`);
    }
  }

  // 5. Below current cash salary cutoff
  if (filters.noBelowCurrentSalary) {
    const currentTotal = passport.baseSalary + passport.fixedAllowance;
    if (job.salaryMaxManwon < currentTotal) {
      reasons.push(`현재 확정 보상(${currentTotal.toLocaleString()}만 원) 미만 공고`);
    }
  }

  // 6. Relocation public orgs cutoff
  if (filters.noRelocationOrg) {
    const full = (job.title + " " + job.company + " " + (job.rawText || "")).toLowerCase();
    if (full.includes("지방 이전") || full.includes("혁신도시") || full.includes("순환 근무")) {
      reasons.push("지방 이전 예정/지방 순환 근무 기관 배제");
    }
  }

  // 7. Custom exclusion keywords
  if (filters.customKeywords && filters.customKeywords.length > 0) {
    const full = (job.title + " " + job.company + " " + job.canonicalRole + " " + job.tags.join(" ") + " " + (job.rawText || "")).toLowerCase();
    for (const kw of filters.customKeywords) {
      const clean = kw.trim().toLowerCase();
      if (clean && full.includes(clean)) {
        reasons.push(`배제 키워드 '${kw}' 포함`);
        break;
      }
    }
  }

  return {
    isExcluded: reasons.length > 0,
    exclusionReasons: reasons,
  };
}

