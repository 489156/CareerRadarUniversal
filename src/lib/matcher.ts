import { CareerPassport, JobPosting, DynamicMatchScore } from "./types";

export const MOCK_JOB_DATABASE: JobPosting[] = [
  {
    id: "job-1",
    company: "현대모비스 계열",
    title: "HR 전략 및 조직문화 기획 경력직 (5~8년)",
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
    pros: ["노무사 및 노무관리 실무 7년 전문성 완벽 일치", "글로벌 상장사 RSU(양도제한조건부주식) 보상 수혜"],
    gaps: ["군포에서 잠실까지 편도 65분으로 통근 피로도 높음 (잠실역 2/8호선)", "24/7 물류 운영 특성에 따른 비정기 이슈 대응"],
    rawText: `[Job Description]\n- 대규모 현장 및 사무직 임직원 대상 노무 컴플라이언스 총괄\n- 노사협의회 운영 및 노무 분쟁 예방 시스템 고도화\n\n[Compensation]\n- 포괄임금제 적용 (월 고정OT 20시간 산입)\n- Coupang, Inc. (NYSE: CPNG) 주식 보상 패키지 지급`,
    sourceName: "LinkedIn Jobs (2026)",
  }
];

export function calculateDynamicJobMatch(passport: CareerPassport, job: JobPosting): DynamicMatchScore {
  const matchedReasons: string[] = [];
  const gapReasons: string[] = [];

  // 1. Role/Ontology Match (40% weight)
  let roleFit = 60;
  const pRole = (passport.canonicalRole || "").toLowerCase();
  const jRole = (job.canonicalRole || "").toLowerCase();
  const jTitle = (job.title || "").toLowerCase();

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
    seniorityFit = 85; // 오버스펙인 경우 약간의 감점 또는 인정
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
