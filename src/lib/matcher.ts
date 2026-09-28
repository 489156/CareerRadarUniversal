import { CareerPassport, JobPosting, DynamicMatchScore, SkillGapTrack } from "./types";

export const MOCK_JOB_DATABASE: JobPosting[] = [
  {
    id: "job-1",
    company: "현대모비스 계열",
    title: "HR 전략 및 조직문화 기획 경력직 (5~9년)",
    canonicalRole: "HR Planning & Strategy",
    occupation: "HR",
    industry: "제조 / 모빌리티",
    location: "서울시 강남구 테헤란로 (군포 금정/산본역 기준 45분)",
    commuteMinutes: 45,
    salaryMinManwon: 6200,
    salaryMaxManwon: 7200,
    salaryDisplay: "6,200 ~ 7,200만 원 (Tier B 통계)",
    salaryTier: "B",
    minYears: 5,
    maxYears: 9,
    hasFixedOT: true,
    fixedOTHours: 20,
    tags: ["대기업 계열", "정규직", "수도권", "성과급 별도 (평균 15%)"],
    pros: ["인사기획 5년 이상 경력 요건 완벽 부합", "군포/수도권 남부에서 1회 환승 통근 권역", "상장 대기업 네임밸류 및 복지"],
    gaps: ["외국어(영어) 비즈니스 커뮤니케이션 역량 우대", "글로벌 법인 인사 정책 수립 경험 우대"],
    rawText: `[담당업무]\n- 중장기 인사제도 기획 및 조직문화 혁신 프로그램 운영\n- 임금체계 및 직무급 개편 프로젝트 PM\n- 핵심인재 육성 및 평가제도 고도화\n\n[지원자격]\n- 4년제 대졸 이상 (상경/사회과학 계열 우대)\n- 인사기획 또는 제도설계 경력 5년 이상 9년 이하\n\n[근무조건]\n- 고용형태: 정규직\n- 급여수준: 회사 내규 (고정 연장근로 20시간 포함된 포괄임금제, 경영성과급 별도 지급)\n- 근무지: 서울시 강남구 테헤란로 (2호선 선릉/역삼 인근)`,
    sourceName: "사람인 대기업 공채",
    jobUrl: "https://talent.hyundaimobis.com",
  },
  {
    id: "job-2",
    company: "DN오토모티브",
    title: "경영지원본부 인사기획·노무 대졸신입/주니어",
    canonicalRole: "HR Generalist",
    occupation: "HR",
    industry: "글로벌 제조",
    location: "서울 및 경기 사업장 (군포에서 40분)",
    commuteMinutes: 40,
    salaryMinManwon: 5400,
    salaryMaxManwon: 5400,
    salaryDisplay: "공고 명시 5,400만 원 (Tier A 초봉)",
    salaryTier: "A",
    minYears: 0,
    maxYears: 4,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["공식연봉명시", "Tier A", "비포괄 임금", "초봉 5400"],
    pros: ["2026 공채 공고에 명시된 확실한 초봉 5,400만원", "비포괄 임금 체계로 야근 시 추가 수당 실비 지급", "제조업 기반 안정적 재무구조"],
    gaps: ["시니어급보다는 신입/주니어 채용 위주", "경력직 전형 시 개별 호봉 협상 필수"],
    rawText: `[모집부문]\n- 경영지원 / 인사총무 (대졸 신입 및 경력)\n\n[처우조건]\n- 정규직 대졸 신입사원 연봉 5,400만 원 (공고 명시)\n- 고정OT 없음 (초과근로수당 법정 1.5배 정산)\n- 퇴직연금(DC형) 별도 운영, 4대보험, 중식 제공`,
    sourceName: "공식 채용공고 (2026)",
    jobUrl: "https://dnautomotive.recruiter.co.kr",
  },
  {
    id: "job-3",
    company: "토스 계열 핀테크",
    title: "People Partner (HRBP) 경력직",
    canonicalRole: "HR Business Partner",
    occupation: "HR",
    industry: "IT / 핀테크",
    location: "서울 강남구 역삼 (군포에서 48분)",
    commuteMinutes: 48,
    salaryMinManwon: 6800,
    salaryMaxManwon: 8800,
    salaryDisplay: "6,800 ~ 8,800만 원 + RSU/스톡옵션 (Tier B)",
    salaryTier: "B",
    minYears: 4,
    maxYears: 10,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["IT 유니콘", "주2일 재택", "비포괄 🌟", "스톡옵션"],
    pros: ["비포괄 임금제 (분 단위 시간외근로 1.5배 실비 정산)", "주 2일 자율 재택근무로 통근 피로도 40% 절감", "업계 최고 수준의 실질 시급 형성"],
    gaps: ["빠른 조직 변경 및 자율성과 압박에 대한 적응력 요구", "People Analytics / 데이터 기반 인사 분석 프로젝트 경험 우대"],
    rawText: `[Role & Responsibilities]\n- 사일로 조직 내 People Partner로서 조직 건강도 진단 및 피플 솔루션 제공\n- 평가, 보상, 조직문화, 온보딩 프로세스 주도\n- 조직 갈등 해결 및 핵심 인재 리텐션 전략 수립\n\n[Conditions]\n- 고용형태: 정규직\n- 비포괄 임금제 운영 (법정 연장근로수당 100% 별도 정산)\n- 주 2일 하이브리드 재택근무`,
    sourceName: "기업 공식 Career Page",
    jobUrl: "https://toss.im/career/jobs",
  },
  {
    id: "job-4",
    company: "한국수출입은행 (국책금융)",
    title: "인사기획 및 노사협력 전문위원 (공무수행)",
    canonicalRole: "HR Planning & Labor",
    occupation: "HR",
    industry: "공공금융",
    location: "서울 영등포구 여의도동 (군포에서 42분)",
    commuteMinutes: 42,
    salaryMinManwon: 4650,
    salaryMaxManwon: 6200,
    salaryDisplay: "ALIO 공시 4,650만 원 (Tier A 신입초임 기준)",
    salaryTier: "A",
    minYears: 3,
    maxYears: 10,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["공공기관", "ALIO 공시", "최고 고용안정", "정규직"],
    pros: ["ALIO 공시 기준 기본급/고정수당 투명성 100%", "노사협력 및 취업규칙 개정 전문성 완벽 일치", "군포 금정/산본에서 1호선 신길/여의도 급행 통근 우수"],
    gaps: ["공공기관 기재부 가이드라인에 따른 엄격한 총인건비 인상률 상한(1~2%)", "공무원 수준의 보고서 서식 및 행정 감사 절차"],
    rawText: `[담당직무]\n- 공공기관 노사관계 관리 및 단체협약 개정 실무\n- 직무중심 보수체계 개편 및 성과평가 운영\n\n[보수조건]\n- 공공기관 경영정보시스템(ALIO) 공시 기준 적용\n- 법정 초과근로수당 실비 지급 (고정OT 없음)\n- 공무원연금에 준하는 복지 포인트 및 자녀 학자금 지원`,
    sourceName: "ALIO 공공기관 경영공시 (2026)",
    jobUrl: "https://koreaexim.recruiter.co.kr",
  },
  {
    id: "job-5",
    company: "SK하이닉스 피플옵스",
    title: "피플오퍼레이션 & HR 데이터 분석가",
    canonicalRole: "People Operations & Analytics",
    occupation: "HR",
    industry: "반도체 / 테크",
    location: "경기도 이천 / 분당 캠퍼스 (통근버스 운행, 군포 55분)",
    commuteMinutes: 55,
    salaryMinManwon: 6500,
    salaryMaxManwon: 8000,
    salaryDisplay: "6,500 ~ 8,000만 원 + PS성과급 (Tier B)",
    salaryTier: "B",
    minYears: 4,
    maxYears: 9,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["대기업", "초고액 성과급", "통근버스 지원", "복지 최상"],
    pros: ["PS(초과이익분배금) 연간 최대 기본급의 50% 지급 이력", "수도권 전 지역 통근 셔틀버스망 완비", "선진 피플옵스 시스템 구축 경험 확보"],
    gaps: ["분당/이천 사업장 출퇴근 피로도", "SQL 및 데이터 대시보드(BI) 분석 역량 테스트 필수"],
    rawText: `[담당업무]\n- 임직원 피플 데이터 분석 및 인사 대시보드 구축\n- 승진, 평가, 보상 프로세스 운영 자동화\n\n[처우]\n- 업계 최고 수준 기본급 및 실적 연동 경영성과급(PS/PI) 별도\n- 주 40시간 유연근무제 (비포괄 임금)`,
    sourceName: "잡코리아 대기업관",
    jobUrl: "https://www.skcareers.com",
  },
  {
    id: "job-6",
    company: "당근마켓 (당근)",
    title: "People & Culture Lead / 매니저",
    canonicalRole: "People & Culture",
    occupation: "HR",
    industry: "IT / 플랫폼",
    location: "서울 서초구 교대역 (군포에서 38분)",
    commuteMinutes: 38,
    salaryMinManwon: 6000,
    salaryMaxManwon: 7800,
    salaryDisplay: "6,000 ~ 7,800만 원 (Tier B 제보)",
    salaryTier: "B",
    minYears: 5,
    maxYears: 10,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["IT 유니콘", "군포 통근 38분", "자율 휴가제", "비포괄"],
    pros: ["군포에서 사당/교대 4호선 직결로 편도 38분 쾌속 통근", "수평적 소통 문화 및 직무 자율성 보장", "비포괄 임금 체계"],
    gaps: ["정형화된 HR 제도보다는 기민한 조직문제 해결력(Problem Solving) 중점 검증"],
    rawText: `[주요업무]\n- 당근의 미션과 문화에 부합하는 피플 전략 기획 및 실행\n- 임직원 컬처 코드 전파 및 커뮤니케이션 조율\n\n[근무환경]\n- 서초구 교대역 도보 3분\n- 무제한 자율 휴가 및 최신 장비 지원`,
    sourceName: "원티드 (Wanted)",
    jobUrl: "https://about.daangn.com/jobs",
  },
  {
    id: "job-7",
    company: "신용보증기금 (KODIT)",
    title: "경영기획 및 조직혁신 전문위원",
    canonicalRole: "Strategy & Planning",
    occupation: "PLANNING",
    industry: "정책금융",
    location: "서울 마포구 공덕동 (군포에서 46분)",
    commuteMinutes: 46,
    salaryMinManwon: 4900,
    salaryMaxManwon: 6400,
    salaryDisplay: "ALIO 공시 4,900만 원 (Tier A 신입초임 기준)",
    salaryTier: "A",
    minYears: 3,
    maxYears: 8,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["공공기관", "ALIO 공시", "여의도/공덕 권역", "안정성"],
    pros: ["금융공기업 최고 수준의 신입 초임 및 복지", "조직진단 및 중장기 경영계획 수립 경험 부합"],
    gaps: ["공공기관 경영평가(경평) 보고서 대응 시즌 초과근무 발생"],
    rawText: `[주요직무]\n- 중소기업 금융지원 정책 기획 및 조직진단\n- 경영혁신 과제 발굴 및 정부 경영평가 대응`,
    sourceName: "ALIO (2026)",
    jobUrl: "https://kodit.recruiter.co.kr",
  },
  {
    id: "job-8",
    company: "쿠팡 (Coupang)",
    title: "Senior HR Specialist (노무/ER 및 근로복지)",
    canonicalRole: "Employee Relations & Labor",
    occupation: "HR",
    industry: "이커머스 / 물류",
    location: "서울 송파구 잠실 (군포에서 65분)",
    commuteMinutes: 65,
    salaryMinManwon: 6500,
    salaryMaxManwon: 8500,
    salaryDisplay: "6,500 ~ 8,500만 원 + RSU (Tier B)",
    salaryTier: "B",
    minYears: 5,
    maxYears: 10,
    hasFixedOT: true,
    fixedOTHours: 20,
    tags: ["미국 상장사", "RSU 주식 보상", "고연봉", "노무전문"],
    pros: ["노무관리 및 취업규칙 개정 전문성 완벽 일치", "Coupang, Inc. 주식(RSU) 보상 패키지 수혜", "글로벌 상장사 커리어 가치"],
    gaps: ["군포에서 편도 65분으로 통근 피로도 높음 (잠실역)", "포괄임금(월 20시간 고정OT) 포함"],
    rawText: `[Job Description]\n- 대규모 현장 및 사무직 임직원 대상 노무 컴플라이언스 총괄\n- 노사협의회 운영 및 노무 분쟁 예방 시스템 고도화\n\n[Compensation]\n- 포괄임금제 적용 (월 고정OT 20시간 산입)\n- Coupang, Inc. (NYSE: CPNG) 주식 보상 패키지 지급`,
    sourceName: "Coupang Career 공식",
    jobUrl: "https://www.coupang.jobs",
  },
  {
    id: "job-deloitte-ta",
    company: "딜로이트 안진회계법인",
    title: "인재부 Talent-Acquisition(채용팀) 대리/과장급 채용",
    canonicalRole: "Talent Acquisition & Recruiting",
    occupation: "HR",
    industry: "전문서비스 / 회계컨설팅",
    location: "서울 영등포구 여의도동 (군포 금정/산본역 기준 48분)",
    commuteMinutes: 48,
    salaryMinManwon: 6300,
    salaryMaxManwon: 7500,
    salaryDisplay: "6,300 ~ 7,500만 원 (대리/과장급 Tier B 통계)",
    salaryTier: "B",
    minYears: 8,
    maxYears: 12,
    hasFixedOT: false,
    fixedOTHours: 0,
    tags: ["Big4 회계법인", "정규직", "여의도", "글로벌 펌", "AI 채용솔루션"],
    pros: [
      "군포에서 1호선 신길/여의도 급행 또는 4/9호선으로 편도 48분 쾌속 통근 (60분 허용 권역 완벽 부합)",
      "대리/과장급 처우로 현재 확정 보상(5,800만 원) 대비 +10~25% 보상 상승 기대",
      "채용 프로세스 디지털 전환(AI) 및 Dashboard 운영 업무가 보유 AX 스킬셋과 일치",
      "글로벌 빅4 회계법인 인재부(Talent) 경력 개발 가치",
    ],
    gaps: [
      "공고상 요구 경력 '8년 이상' 대비 1년 미달 (현재 7년차, 서류/면접 시 직무 성과 중심 어필 필요)",
      "필수 자격 요건: Business English Fluency (글로벌 스킬 갭 보완 필요)",
      "인사기획(제도/평가/보상) 중심 경력 대비 Talent Acquisition(채용/다이렉트 소싱) 업무 비중 높음",
    ],
    rawText: `[인재부 Talent-Acquisition(채용팀) 대리/과장급 채용 - 딜로이트 안진회계법인]\n\n[담당업무]\n- 수시(신입/경력)채용 진행 및 전략 수립\n- 채용 브랜딩 컨텐츠 기획 및 운영\n- 핵심 인재 발굴 및 후보자 파이프라인 구축\n- 채용 프로세스 디지털 전환 및 IT 솔루션(AI) 도입 지원\n- SAP(SF) 시스템 활용하여 Dashboard 운영\n\n[응시자격]\n- 500인 이상 사업장에서 채용/인사 업무 경력 8년 이상 보유자\n- 대학교(학사)졸 이상\n- 채용 전 과정 운영 경험자 및 Compliance 이해력 우수자\n- Business English Fluency 및 Global Talent Standards 역량 보유자\n\n[우대사항]\n- Professional Firm 인사 운영 경험자 / Success Factor 사용 경험자\n- LinkedIn 등 활용 Direct Sourcing 경험자\n\n[근무조건]\n- 고용형태: 정규직\n- 근무지역: 서울 여의도\n- 급여조건: 회사 내규에 따름 (면접 후 결정)`,
    sourceName: "딜로이트 공식 채용 (WiseRecruit2)",
    jobUrl: "https://join.deloitte.co.kr/WiseRecruit2/User/RecruitView.aspx?ridx=5200",
  },
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
      { company: "쿠팡 (Coupang)", title: "People Analytics Specialist", location: "서울 송파구 잠실", role: "HR Data Analytics", salary: "7,000 ~ 9,000만 원", url: "https://www.coupang.jobs" },
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
      { company: "당근 (Daangn)", title: "People System & Data Specialist", location: "서울 서초구 교대", role: "HR Operations & Data", salary: "6,500 ~ 8,000만 원", url: "https://about.daangn.com/jobs" },
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
      { company: "당근 (Daangn Japan/Global)", title: "Global People & Culture Lead", location: "서울 서초구 (해외 출장 포함)", role: "Global HR", salary: "7,200 ~ 9,000만 원", url: "https://about.daangn.com/jobs" },
      { company: "하이퍼커넥트 (Match Group)", title: "Global HRBP (English Fluent)", location: "서울 강남구 삼성", role: "Global HRBP", salary: "7,500 ~ 9,500만 원", url: "https://career.hyperconnect.com" },
      { company: "현대모비스 글로벌인사", title: "해외법인 인사제도 운영 기획자", location: "서울 강남구 테헤란로", role: "Global HR Strategy", salary: "6,800 ~ 8,200만 원", url: "https://talent.hyundaimobis.com" },
      { company: "넷마블 (Netmarble)", title: "글로벌 인사 및 해외법인 관리", location: "서울 구로구 지밸리", role: "Global HR Ops", salary: "6,500 ~ 8,000만 원", url: "https://netmarble.recruiter.co.kr" },
      { company: "센드버드코리아 (Sendbird)", title: "People Operations Lead (Korea & APAC)", location: "서울 강남구 테헤란로", role: "APAC People Ops", salary: "8,000 ~ 10,000만 원", url: "https://sendbird.com/careers" },
      { company: "몰로코 (Moloco Korea)", title: "HR Generalist (Global Tech)", location: "서울 강남구 역삼", role: "Global Tech HR", salary: "7,500 ~ 9,500만 원", url: "https://www.moloco.com/careers" },
      { company: "딜 (Deel Korea)", title: "EOR HR Compliance Consultant", location: "원격 근무 (Remote Korea)", role: "Cross-border Labor", salary: "7,000 ~ 8,800만 원", url: "https://www.deel.com/careers" },
      { company: "아마존웹서비스 (AWS Korea)", title: "HR Partner (Tech Organizations)", location: "서울 강남구 테헤란로", role: "HR Business Partner", salary: "8,500 ~ 11,000만 원", url: "https://www.amazon.jobs" },
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

// Dynamic Market Value Calculator (P10, P25, P50, P75, P90)
export function calculateEstimatedMarketValue(totalYears: number) {
  const clampedYears = Math.max(1, Math.min(25, totalYears));
  const p10 = Math.round(3200 + clampedYears * 280);
  const p25 = Math.round(3600 + clampedYears * 300);
  const p50 = Math.round(3900 + clampedYears * 335);
  const p75 = Math.round(4200 + clampedYears * 370);
  const p90 = Math.round(4700 + clampedYears * 415);

  return {
    cohortDescription: `수도권 / 인사기획(HR Planning) / ${clampedYears}년차 대리·과장급 코호트`,
    sampleSize: 47,
    confidenceTier: "Tier B (검증 공고 및 실무 오퍼 기반)" as const,
    p10,
    p25,
    p50,
    p75,
    p90,
    rangeDisplay: `${p25.toLocaleString()} ~ ${p75.toLocaleString()}만 원`,
    methodology: {
      tierAWeight: "50% (고용노동부 사업체임금근로시간조사 + DART/ALIO 공시 결합)",
      tierBWeight: "40% (수도권 8개 검증 기업 포함 12개월 내 확정 공고 및 실오퍼 n=47)",
      tierCWeight: "10% (블라인드/잡플래닛 연봉 표본 상하위 5% IQR 절사 보정)",
      baseScope: "퇴직금 및 비확정 경영성과급 제외, 100% 확정 현금성 급여(기본급+고정수당) 기준",
    },
  };
}

export function calculateDynamicJobMatch(passport: CareerPassport, job: JobPosting): DynamicMatchScore {
  const matchedReasons: string[] = [];
  const gapReasons: string[] = [];

  // 1. Role/Ontology Match (40% weight)
  let roleFit = 60;
  const pRole = (passport.canonicalRole || "").toLowerCase();
  const jRole = (job.canonicalRole || "").toLowerCase();

  if (pRole.includes("인사") || pRole.includes("hr") || pRole.includes("people")) {
    if (job.occupation === "HR") {
      roleFit = 85;
      matchedReasons.push(`직군 일치: ${job.occupation} 전문 분야`);
      if (jRole.includes("planning") || jRole.includes("strategy") || jRole.includes("generalist")) {
        roleFit = 100;
        matchedReasons.push(`온톨로지 정규화 직무 완벽 매칭: ${job.canonicalRole}`);
      }
    } else {
      roleFit = 50;
      gapReasons.push(`희망 직무(${passport.canonicalRole})와 타깃 직무(${job.canonicalRole}) 간 전이 필요`);
    }
  }

  // 2. Seniority / Experience Match (25% weight)
  let seniorityFit = 70;
  const years = passport.totalYears;
  if (years >= job.minYears && years <= job.maxYears) {
    seniorityFit = 100;
    matchedReasons.push(`요구 연차(${job.minYears}~${job.maxYears}년)에 내 경력(${years}년차) 최적 부합`);
  } else if (years < job.minYears) {
    const diff = job.minYears - years;
    seniorityFit = Math.max(30, 100 - diff * 25);
    gapReasons.push(`최소 요구 연차(${job.minYears}년) 대비 ${diff}년 부족`);
  } else {
    seniorityFit = 85;
    matchedReasons.push(`충분한 경력 연차 보유 (${years}년차)`);
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
  if (job.salaryMaxManwon >= currentTotal * 1.08) {
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

