import { CareerPassport, JobPosting, DynamicMatchScore, SkillGapTrack, CompanyTier } from "./types";
import rawJobsData from "../../public/data/jobs.json";

export const MOCK_JOB_DATABASE: JobPosting[] = rawJobsData as JobPosting[];

// 3 Tracks of Skill Gap Bridging totaling 28 Expanded Opportunities

export function calculateSkillGapTracks(passport: import('./types').CareerPassport): import('./types').SkillGapTrack[] {
  const currentTotal = passport.baseSalary + passport.fixedAllowance;
  let baseline = currentTotal;
  const isEntry = passport.track === 'ENTRY' || passport.totalYears === 0;

  if (baseline === 0 || isEntry) {
    const est = calculateEstimatedMarketValue(passport.canonicalRole || '일반', passport.totalYears, passport.track);
    baseline = est.p50 || 4000;
  }

  // 15% ~ 25% premium
  const minPremium = Math.round(baseline * 1.15);
  const maxPremium = Math.round(baseline * 1.25);
  const expectedSalaryRange = `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원 (+15~25% 프리미엄)`;

  if (isEntry) {
    return [
      {
        id: 'track-analytics',
        name: 'People Analytics (Junior Data Analyst)',
        skills: ['SQL (기초)', 'Excel/Google Sheets (고급)', 'HR 데이터 기초'],
        actionItems: [
          'SQL 기초 (SELECT, JOIN, GROUP BY) 학습',
          '데이터 기반의 HR 지표(입퇴사율, 휴가사용율) 대시보드 토이 프로젝트',
          '데이터 분석가(주니어) 포지션 지원 전략 수립'
        ],
        expandedCount: 14,
        expectedSalaryRange,
        jobs: [
          { company: '토스', title: 'People Data Analyst (신입)', location: '서울 강남구', role: 'HR Data Analyst', salary: `${Math.round(minPremium * 1.1).toLocaleString()}만 원~`, url: '#' },
          { company: '무신사', title: 'HR Data Assistant', location: '서울 성동구', role: 'HR Data', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' },
          { company: '당근마켓', title: 'People Ops Data (Junior)', location: '서울 서초구', role: 'People Ops Data', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' }
        ]
      },
      {
        id: 'track-global',
        name: 'Global HR & Bilingual (Junior)',
        skills: ['비즈니스 영어 (작문/회화)', '글로벌 커뮤니케이션', '이문화 이해'],
        actionItems: [
          '비즈니스 영어 이메일/문서 작성 능력 확보',
          '외국계 기업 주니어 HR / 어드민 포지션 탐색',
          '영어 면접 대비 및 영문 이력서(Resume) 구축'
        ],
        expandedCount: 8,
        expectedSalaryRange,
        jobs: [
          { company: '구글코리아', title: 'HR Coordinator (Contract/Entry)', location: '서울 강남구', role: 'Global HR', salary: `${maxPremium.toLocaleString()}만 원~`, url: '#' },
          { company: '아마존웹서비시즈', title: 'Recruiting Coordinator', location: '서울 강남구', role: 'Global TA', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' },
          { company: '나이키코리아', title: 'HR Assistant', location: '서울 강남구', role: 'Global HR', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' }
        ]
      },
      {
        id: 'track-ax',
        name: 'HR Automation (Junior)',
        skills: ['Zapier / Make 활용', '노션(Notion) 고급 활용', '업무 자동화 툴 이해'],
        actionItems: [
          'Zapier를 활용한 온보딩 메일 자동화 실습',
          '노션을 활용한 사내 위키/게시판 구축 토이 프로젝트',
          '스타트업/IT기업의 People Ops (자동화 우대) 포지션 공략'
        ],
        expandedCount: 6,
        expectedSalaryRange,
        jobs: [
          { company: '우아한형제들', title: 'People Ops Assistant', location: '서울 송파구', role: 'HR Ops', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' },
          { company: '야놀자', title: 'HR Admin & System Assistant', location: '서울 강남구', role: 'HR System', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' },
          { company: '크래프톤', title: 'HR Assistant', location: '서울 강남구', role: 'HR System', salary: `${minPremium.toLocaleString()}만 원~`, url: '#' }
        ]
      }
    ];
  } else {
    // Experienced Tracks
    return [
      {
        id: 'track-analytics',
        name: 'People Analytics & HR Data Science',
        skills: ['SQL (인사 DB 쿼리 및 코호트 집계)', 'Tableau / PowerBI 대시보드 구축', '퇴사 예측 및 리텐션 모델링', 'eNPS / 조직 건강도 통계 분석'],
        actionItems: [
          'SQL 레벨 2 (GROUP BY, Window Function) 인사 데이터셋 실습',
          'Tableau 기반 대시보드 시각화',
          '피플 사이언스 통계 개념 이해'
        ],
        expandedCount: 14,
        expectedSalaryRange,
        jobs: [
          { company: '쿠팡 (Coupang)', title: 'People Analytics Specialist', location: '서울 송파구 신천', role: 'HR Data Analytics', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://www.coupang.jobs/kr/' },
          { company: '토스 (비바리퍼블리카)', title: 'People Data Partner', location: '서울 강남구 역삼', role: 'People Operations', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://toss.im/career/jobs' },
          { company: 'SK하이닉스', title: '피플사이언스 데이터 분석가', location: '경기도 분당/이천', role: 'HR Analytics', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://www.skcareers.com' }
        ]
      },
      {
        id: 'track-global',
        name: 'Global HRBP & Regional TA Lead',
        skills: ['비즈니스 영어 능통 (원어민 수준 커뮤니케이션)', 'APAC / Global 리전 법인 설립 및 HR 세팅 경험', 'Cross-border 채용 및 글로벌 평가 보상 구조화', '다국적 조직문화(DE&I) 구축'],
        actionItems: [
          '영문 이력서 및 링크드인 프로필 최적화',
          '글로벌 기업의 APAC 리전 HR 정책 리서치',
          '외국계 헤드헌터 네트워킹 구축'
        ],
        expandedCount: 8,
        expectedSalaryRange,
        jobs: [
          { company: 'Google Korea', title: 'HR Business Partner', location: '서울 강남구 역삼', role: 'Global HR', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://careers.google.com/locations/seoul/' },
          { company: 'Amazon Web Services (AWS)', title: 'Senior Recruiter (Tech)', location: '서울 강남구 역삼', role: 'Global TA', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://www.amazon.jobs/content/locations/south-korea/seoul' }
        ]
      },
      {
        id: 'track-ax',
        name: 'HR AX (AI Transformation) & No-Code Automation',
        skills: ['생성형 AI(LLM) 기반 직무기술서(JD) 초안 파이프라인 기획', 'Flex / Zapier 기반 인사 행정 노코드 자동화', '차세대 HR 테크 시스템 마이그레이션 PM'],
        actionItems: [
          '사내 채용/평가 업무용 AI 프롬프트 템플릿 구축',
          '노코드 도구를 활용한 신규 입사자 온보딩 자동화 설계',
          '인사노무 질의응답 챗봇 도입 프로젝트 기획'
        ],
        expandedCount: 6,
        expectedSalaryRange,
        jobs: [
          { company: '삼성전자 DX부문', title: 'People AX (AI Transformation) 혁신 PM', location: '경기도 수원 화성', role: 'HR Tech / AX', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://www.samsungcareers.com' },
          { company: 'LG CNS', title: '생성형 AI 기반 HR 솔루션 기획자', location: '서울 강서구 마곡', role: 'HR DX Consultant', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://careers.lg.com' },
          { company: 'CJ ENM', title: 'HR Digital Transformation & Systems', location: '서울 마포구 상암', role: 'HR Tech Lead', salary: `${minPremium.toLocaleString()} ~ ${maxPremium.toLocaleString()}만 원`, url: 'https://recruit.cj.net' }
        ]
      }
    ];
  }
}


export function mapCompanyTypeToTier(companyType?: string): CompanyTier | undefined {
  if (!companyType) return undefined;
  const s = companyType.toLowerCase();
  if (s.includes("tier_1") || s.includes("빅테크") || s.includes("유니콘") || s.includes("글로벌")) {
    return "TIER_1_BIGTECH";
  }
  if (s.includes("tier_2") || s.includes("대기업")) {
    return "TIER_2_CONGLOMERATE";
  }
  if (s.includes("tier_3") || s.includes("금융") || s.includes("공공") || s.includes("공기업")) {
    return "TIER_3_FINANCE_PUBLIC";
  }
  if (s.includes("tier_4") || s.includes("스타트업") || s.includes("중소")) {
    return "TIER_4_SME_STARTUP";
  }
  return undefined;
}

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
    /개발|엔지니어|프론트|백엔드|풀스택|소프트웨어|인공지능|머신러닝|테크|클라우드|보안|전산|\b(tech|dev|engineer|frontend|backend|fullstack|react|typescript|javascript|node|python|java|spring|data|ai|ml|cloud|security|devops|sw|ict|sql|aws)\b/.test(s) &&
    !/people analytics|피플애널리틱스|인사기획|노무|마케팅|그로스|퍼포먼스|브랜딩|\b(marketing|growth)\b/.test(s)
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
    /회계|세무|재무|감사|자금|투자|가치평가|계리|애널리스트|증권|운용|은행|여신|공시|\b(finance|tax|deals|m&a|cpa|kicpa|ib|cfa|aicpa|xbrl|valuation)\b/.test(s)
  ) {
    return {
      domainKey: 'FINANCE',
      domainName: '금융·재무 & 회계/컨설팅',
      entryRange: { p10: 3600, p25: 4200, p50: 4800, p75: 5400, p90: 6200 },
      growthPerYear: 420,
    };
  }

  // 3. MARKETING / GROWTH
  if (
    /마케팅|그로스|퍼포먼스|브랜딩|광고|콘텐츠|홍보|캠페인|미디어|\b(marketing|growth|pr|sns|crm|ga4|seo)\b/.test(s)
  ) {
    return {
      domainKey: 'MARKETING',
      domainName: '마케팅 & 그로스/브랜딩',
      entryRange: { p10: 3200, p25: 3600, p50: 4000, p75: 4500, p90: 5200 },
      growthPerYear: 350,
    };
  }

  // 4. HR / PEOPLE
  if (
    /인사|피플|채용|노무|노사|조직문화|총무|평가|보상|인재개발|교육|\b(hr|people|er|hrbp|hrd|hrm|recruiter|talent)\b/.test(s)
  ) {
    return {
      domainKey: 'HR',
      domainName: '인사·피플 & 조직문화(HR)',
      entryRange: { p10: 3300, p25: 3700, p50: 4100, p75: 4600, p90: 5400 },
      growthPerYear: 340,
    };
  }

  // 5. PLANNING / STRATEGY / CONSULTING
  if (
    /기획|전략|컨설팅|사업기획|경영|서비스기획|사업개발|프로덕트|신사업|\b(planning|strategy|consulting|pm|po)\b/.test(s)
  ) {
    return {
      domainKey: 'PLANNING',
      domainName: '경영전략 & 사업/서비스 기획',
      entryRange: { p10: 3400, p25: 4000, p50: 4500, p75: 5000, p90: 5800 },
      growthPerYear: 380,
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
  trackParam?: 'ENTRY' | 'EXPERIENCED',
  tierParam?: CompanyTier
) {
  let roleStr = "";
  let years = 0;
  const track = trackParam;

  if (typeof roleOrYears === "number") {
    years = roleOrYears;
    roleStr = "";
  } else {
    roleStr = roleOrYears || "";
    years = yearsParam;
  }

  const domain = detectDomainFromKeywords(roleStr);
  const isEntry = years === 0 || track === 'ENTRY';

  let multiplier = 1.0;
  let tierDesc = "일반 중견기업 (표준)";
  if (tierParam === 'TIER_1_BIGTECH') { multiplier = 1.4; tierDesc = "Tier 1 (빅테크/유니콘)"; }
  else if (tierParam === 'TIER_2_CONGLOMERATE') { multiplier = 1.25; tierDesc = "Tier 2 (주요 대기업)"; }
  else if (tierParam === 'TIER_3_FINANCE_PUBLIC') { multiplier = 1.15; tierDesc = "Tier 3 (금융/공기업)"; }
  else if (tierParam === 'TIER_4_SME_STARTUP') { multiplier = 0.9; tierDesc = "Tier 4 (스타트업/중소)"; }

  if (isEntry) {
    const p10 = Math.round(domain.entryRange.p10 * multiplier);
    const p25 = Math.round(domain.entryRange.p25 * multiplier);
    const p50 = Math.round(domain.entryRange.p50 * multiplier);
    const p75 = Math.round(domain.entryRange.p75 * multiplier);
    const p90 = Math.round(domain.entryRange.p90 * multiplier);

    return {
      cohortDescription: `${tierDesc} / ${domain.domainName} / 신입(0년차) 대졸초임 코호트`,
      domainKey: domain.domainKey,
      domainName: domain.domainName,
      tierDesc,
      sampleSize: 128,
      confidenceTier: "Tier A (다차원 코호트 매트릭스 적용)" as const,
      p10, p25, p50, p75, p90,
      rangeDisplay: `${p25.toLocaleString()} ~ ${p75.toLocaleString()}만 원`,
      methodology: {
        tierAWeight: "40% (기업 Tier 별 초임 편차 가중치 적용)",
        tierBWeight: "40% (고용노동부 직무별 임금 통계)",
        tierCWeight: "20% (블라인드/잡플래닛 실시간 데이터 보정)",
        baseScope: "확정 기본급 및 고정 수당 (성과급 제외)",
      },
    };
  }

  const clampedYears = Math.max(1, Math.min(25, years));
  const baseP50 = domain.entryRange.p50 * multiplier;
  const growth = domain.growthPerYear * Math.max(1.0, (multiplier - 0.1));

  const p10 = Math.round((domain.entryRange.p10 * multiplier) + clampedYears * (growth * 0.8));
  const p25 = Math.round((domain.entryRange.p25 * multiplier) + clampedYears * (growth * 0.9));
  const p50 = Math.round(baseP50 + clampedYears * growth);
  const p75 = Math.round((domain.entryRange.p75 * multiplier) + clampedYears * (growth * 1.1));
  const p90 = Math.round((domain.entryRange.p90 * multiplier) + clampedYears * (growth * 1.25));

  const seniorityLabel = clampedYears <= 3 ? "주니어(1~3년차)" : clampedYears <= 7 ? "대리·선임(4~7년차)" : clampedYears <= 11 ? "과장·차장(8~11년차)" : "팀장·시니어(12년차+)";

  return {
    cohortDescription: `${tierDesc} / ${domain.domainName} / ${clampedYears}년차 ${seniorityLabel}`,
    domainKey: domain.domainKey,
    domainName: domain.domainName,
    tierDesc,
    sampleSize: 256,
    confidenceTier: "Tier B (다차원 코호트 매트릭스 적용)" as const,
    p10, p25, p50, p75, p90,
    rangeDisplay: `${p25.toLocaleString()} ~ ${p75.toLocaleString()}만 원`,
    methodology: {
      tierAWeight: "50% (기업 Tier 별 연차 상승률 곱연산 적용)",
      tierBWeight: "30% (산업군 평균 임금 상승률)",
      tierCWeight: "20% (실시간 채용 공고 오퍼 데이터)",
      baseScope: "퇴직금 및 경영성과급 제외 확정 기본급",
    },
  };
}

export function calculateDynamicJobMatch(passport: CareerPassport, job: JobPosting): DynamicMatchScore {
  const matchedReasons: string[] = [];
  const gapReasons: string[] = [];

  const STOP_TOKENS = new Set([
    "신입", "경력", "인턴", "신입공채", "공채", "채용", "주니어", "시니어",
    "정규직", "수시채용", "공개채용", "신입사원", "경력직", "planning"
  ]);

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
    .filter(t => t.length >= 2 && !STOP_TOKENS.has(t));

  // Job text
  const jobText = [
    job.title || '',
    job.canonicalRole || '',
    job.occupation || '',
    (job.tags || []).join(' '),
    job.company || '',
    
  ].join(' ').toLowerCase();

  // 1. Role / Keyword Token Matching (40% weight)
  const isSameOccupation = Boolean(passport.occupation && job.occupation === passport.occupation);
  let roleFit = 45;
  let matchingTokens: string[] = [];

  for (const token of userTokens) {
    if (jobText.includes(token)) {
      matchingTokens.push(token);
    }
  }

  // Unique matches
  matchingTokens = Array.from(new Set(matchingTokens));

  if (isSameOccupation && matchingTokens.length >= 2) {
    roleFit = 100;
    matchedReasons.push(`직군 및 핵심 키워드 완벽 일치: '${matchingTokens.slice(0, 3).join(', ')}' 요건 부합`);
  } else if (isSameOccupation && matchingTokens.length === 1) {
    roleFit = 92;
    matchedReasons.push(`동일 직군(${job.occupation}) 및 키워드('${matchingTokens[0]}') 부합`);
  } else if (isSameOccupation) {
    roleFit = 82;
    matchedReasons.push(`희망 직군(${job.occupation}) 내 유관 포지션: ${job.canonicalRole}`);
  } else if (matchingTokens.length >= 2) {
    roleFit = 72;
    matchedReasons.push(`인접 직군 내 유관 스킬('${matchingTokens.slice(0, 2).join(', ')}') 보유`);
    gapReasons.push(`희망 직군(${passport.occupation})과 공고 직군(${job.occupation}) 간 차이 존재`);
  } else if (matchingTokens.length === 1) {
    roleFit = 60;
    matchedReasons.push(`일부 연관 키워드('${matchingTokens[0]}') 포함`);
    gapReasons.push(`희망 직군(${passport.occupation})과 공고 직군(${job.occupation}) 간 차이 존재`);
  } else {
    roleFit = 40;
    gapReasons.push(`희망 직무 키워드와 공고 포지션 간 분야 차이 존재`);
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

  const isEntryUser = passport.track === "ENTRY" || passport.totalYears === 0;

  // 1. Permanent employment only (Exclude explicit contract/temporary roles)
  if (filters.onlyPermanent) {
    const fullText = `${job.title} ${(job.tags || []).join(" ")} ${job.rawText || ""}`;
    const hasExplicitNonPermanent = /비정규직|계약직|기간제|파견직|일용|아르바이트|위촉/.test(fullText);
    const isInternOnly =
      !isEntryUser &&
      ((job.tags || []).some((t) => t.includes("인턴")) || /체험형|인턴십/.test(fullText)) &&
      !(job.tags || []).some((t) => t.includes("정규직") || t.includes("신입공채"));

    if (hasExplicitNonPermanent || isInternOnly) {
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
  if (filters.noBelowCurrentSalary && !isEntryUser) {
    const currentTotal = passport.baseSalary + passport.fixedAllowance;
    if (currentTotal > 0 && job.salaryMaxManwon < currentTotal) {
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
      if (!clean) continue;
      // 신입/인턴 모드일 때는 '인턴' 배제 키워드가 남아있더라도 자동 무시
      if (isEntryUser && clean === "인턴") continue;
      if (full.includes(clean)) {
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
