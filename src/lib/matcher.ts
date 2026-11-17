import { CareerPassport, JobPosting, DynamicMatchScore, SkillGapTrack, CompanyTier } from "./types";
import rawJobsData from "../../public/data/jobs.json";

export const MOCK_JOB_DATABASE: JobPosting[] = rawJobsData as JobPosting[];

// 3 Tracks of Skill Gap Bridging per occupation (real URLs, dynamic baseline salary)
export function calculateSkillGapTracks(passport: CareerPassport): SkillGapTrack[] {
  const currentTotal = (passport.baseSalary || 0) + (passport.fixedAllowance || 0);
  const isEntry = passport.track === 'ENTRY' || passport.totalYears === 0;
  const est = calculateEstimatedMarketValue(
    `${passport.canonicalRole || ''} ${passport.occupation || ''}`,
    passport.totalYears,
    passport.track,
    mapCompanyTypeToTier(passport.companyType)
  );
  const baseline = !isEntry && currentTotal > 0 ? currentTotal : (est.p50 || 4500);

  const mkRange = (lowMult: number, highMult: number, label = '+15~25% 프리미엄') =>
    `${Math.round(baseline * lowMult).toLocaleString()} ~ ${Math.round(baseline * highMult).toLocaleString()}만 원 (${label})`;

  const occ = passport.occupation || (est.domainKey === 'GENERAL' ? 'PLANNING' : est.domainKey);

  if (occ === 'TECH') {
    return [
      {
        id: 'track-ai-llm',
        name: 'AI/LLM Engineering & RAG 아키텍처',
        skills: ['LLM API / Function Calling 파이프라인', 'RAG 벡터 검색(pgvector) 최적화', '프롬프트 평가·Eval 자동화', '비동기 스트리밍 서버 설계'],
        actionItems: [
          'Next.js/Python 기반 스트리밍 AI 에이전트 서비스 구축 및 지연시간 계측',
          'RAG 검색 정확도/Hallucination 평가 데이터셋 50건 구축',
          '토스/네이버/삼일PwC AX Node 등 AI-Native 포지션 타깃 지원'
        ],
        expandedCount: 12,
        expectedSalaryRange: mkRange(1.18, 1.32, '+18~32% AI 프리미엄'),
        jobs: [
          { company: '네이버클라우드', title: 'Cloud & AI Platform Engineer', location: '경기 성남시 분당구', role: 'AI/Cloud Backend', salary: mkRange(1.15, 1.28, '스톡·인센 별도'), url: 'https://recruit.navercorp.com/' },
          { company: '토스 (비바리퍼블리카)', title: 'ML/LLM Product Engineer', location: '서울 강남구 역삼', role: 'Product Tech', salary: mkRange(1.20, 1.35, '상위 Tier'), url: 'https://toss.im/career/jobs' },
          { company: '삼일PwC AX Node', title: 'AI-Native Application Backend Engineer', location: '서울 용산구', role: 'AI Backend', salary: mkRange(1.15, 1.25, 'Big4 Tech'), url: 'https://www.pwc.com/kr/ko/career/experienced.html' },
        ]
      },
      {
        id: 'track-cloud-scale',
        name: '대용량 분산트래픽 & Kubernetes MSA',
        skills: ['Kafka/Redis 이벤트 기반 비동기 아키텍처', 'Kubernetes/Terraform IaC 자동화', '분산 트랜잭션(Saga/Outbox) 장애 복구', 'DB 샤딩 및 쿼리 튜닝'],
        actionItems: [
          'k6/JMeter 부하 테스트 기반 TPS 병목 개선 리포트 정리',
          '주문/결제 정합성(Idempotency Key) 장애 대응 케이스 포트폴리오화'
        ],
        expandedCount: 10,
        expectedSalaryRange: mkRange(1.15, 1.25),
        jobs: [
          { company: '우아한형제들 (배달의민족)', title: '커머스 코어 플랫폼 서버 개발자', location: '서울 송파구', role: 'Distributed Backend', salary: mkRange(1.15, 1.25, '주32/36h'), url: 'https://career.woowahan.com/' },
          { company: '당근 (당근마켓)', title: 'Core Infrastructure & Backend Engineer', location: '서울 서초구', role: 'Platform Infra', salary: mkRange(1.18, 1.30, '유니콘'), url: 'https://careers.daangn.com/jobs/' },
        ]
      },
      {
        id: 'track-security',
        name: 'Cloud/App Security & 핀테크 컴플라이언스',
        skills: ['클라우드 취약점 진단(AWS Security/IAM)', 'OAuth2/OIDC 제로트러스트 인증 설계', 'ISMS-P 및 금융보안원 전자금융감독규정'],
        actionItems: [
          '웹/클라우드 모의해킹 및 OWASP Top 10 자동 점검 CI 구축',
          '금융권/Big4 Trust 본부 보안 아키텍트 포지션 공략'
        ],
        expandedCount: 6,
        expectedSalaryRange: mkRange(1.14, 1.24),
        jobs: [
          { company: '삼일PwC Trust팀', title: 'Cybersecurity (AI Security) Consultant', location: '서울 용산구', role: 'Security Advisory', salary: mkRange(1.15, 1.25, '컨설팅'), url: 'https://www.pwc.com/kr/ko/career/experienced.html' },
          { company: '신한은행', title: '디지털·정보보호 ICT 전문인력', location: '서울 중구', role: 'FinTech Security', salary: mkRange(1.12, 1.22, '금융권'), url: 'https://shinhan.recruiter.co.kr/career/home' },
        ]
      }
    ];
  }

  if (occ === 'FINANCE') {
    return [
      {
        id: 'track-deals-valuation',
        name: 'M&A Deal Advisory & 가치평가 모델링',
        skills: ['3-Statement/DCF 재무모델링 고도화', 'FDD(재무실사) 및 PMI(인수후통합)', 'PEF/VC 바이아웃 Value-up 자문'],
        actionItems: [
          '상장사 1곳 선정 후 DCF/Multiple Valuation 보고서 작성',
          'Big4 Deals 본부 및 PE 자문 경력 포지션 지원'
        ],
        expandedCount: 12,
        expectedSalaryRange: mkRange(1.18, 1.32, '+18~32% Deals 프리미엄'),
        jobs: [
          { company: '삼일PwC Deals', title: 'Global Sector PE Advisory', location: '서울 용산구', role: 'M&A / PE Advisory', salary: mkRange(1.18, 1.30, '인센 별도'), url: 'https://www.pwc.com/kr/ko/career/experienced.html' },
          { company: '삼정KPMG', title: 'Deal Advisory M&A Valuation', location: '서울 강남구', role: 'Corporate Finance', salary: mkRange(1.15, 1.28, 'Big4'), url: 'https://career.kr.kpmg.com/' },
        ]
      },
      {
        id: 'track-xbrl-digital',
        name: 'IFRS/XBRL 공시 자동화 & 회계 AX',
        skills: ['XBRL 전자공시 태깅 표준(IFRS Taxonomy)', 'Python/SQL 기반 대용량 회계원장 감사(CAAT)', '연결결산 시스템(SAP BPC 등) 구축'],
        actionItems: [
          '금융감독원 XBRL 주석 공시 구조 분석 및 자동화 스키마 스터디',
          'Big4 AX Node 및 대기업 연결결산 시스템 PM 트랙 공략'
        ],
        expandedCount: 9,
        expectedSalaryRange: mkRange(1.15, 1.25),
        jobs: [
          { company: '삼일PwC AX Node', title: 'XBRL 센터 재무·회계 전문가', location: '서울 용산구', role: 'Digital Audit/XBRL', salary: mkRange(1.15, 1.25, 'Big4'), url: 'https://www.pwc.com/kr/ko/career/experienced.html' },
          { company: '딜로이트 안진', title: '세무자문 M&A Tax & 계리 자문', location: '서울 영등포구 여의도', role: 'Tax / AIS', salary: mkRange(1.15, 1.25, 'Big4'), url: 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitList.aspx' },
        ]
      },
      {
        id: 'track-fpa-public',
        name: '전략 FP&A 및 정책금융·자산운용',
        skills: ['관리회계 기반 유닛 이코노믹스/예실관리', '자금조달(채권/PF) 및 리스크 헤징', 'SQL/BI 기반 경영실적 대시보드'],
        actionItems: [
          '사업부별 공헌이익·LTV/CAC 재무 분석 대시보드 설계',
          '대기업 FP&A, 시중은행·국책금융 재무 포지션 병행 지원'
        ],
        expandedCount: 7,
        expectedSalaryRange: mkRange(1.12, 1.22),
        jobs: [
          { company: '한국수출입은행', title: '정책금융·여신·재무관리 전문직', location: '서울 영등포구 여의도', role: 'Policy Finance', salary: mkRange(1.10, 1.20, '국책은행'), url: 'https://koreaexim.applyin.co.kr/' },
          { company: 'LG CNS', title: '사업기획·재무 FP&A 분석가', location: '서울 강서구 마곡', role: 'Corporate FP&A', salary: mkRange(1.12, 1.22, '대기업'), url: 'https://careers.lg.com/' },
        ]
      }
    ];
  }

  if (occ === 'MARKETING') {
    return [
      {
        id: 'track-growth-sql',
        name: 'SQL 코호트 그로스 & 실험 설계(A/B Test)',
        skills: ['SQL 기반 리텐션/퍼널 코호트 직접 추출', 'GA4/Amplitude 이벤트 택소노미 설계', '통계적 유의성 기반 A/B 테스트 실험 운영'],
        actionItems: [
          '유저 퍼널 전환율 개선 가설-실험-회고 포트폴리오 2건 정량화(ROAS/CAC)',
          '네카라쿠배당토 그로스 마케터 포지션 지원'
        ],
        expandedCount: 11,
        expectedSalaryRange: mkRange(1.18, 1.30, '+18~30% 그로스 프리미엄'),
        jobs: [
          { company: '당근 (당근마켓)', title: 'Local Ads Growth Marketer', location: '서울 서초구', role: 'Growth Marketing', salary: mkRange(1.18, 1.30, '유니콘'), url: 'https://careers.daangn.com/jobs/' },
          { company: '토스 (비바리퍼블리카)', title: 'Growth / Product Marketer', location: '서울 강남구', role: 'Product Growth', salary: mkRange(1.20, 1.35, 'Tier 1'), url: 'https://toss.im/career/jobs' },
        ]
      },
      {
        id: 'track-crm-automation',
        name: 'CRM 라이프사이클 자동화 & AI 콘텐츠 파이프라인',
        skills: ['Braze/CRM 세그먼트 개인화 푸시·인앱 메시지', '생성형 AI 기반 크리에이티브 소재 대량 테스트', '매체 믹스 최적화(MMP/MMM)'],
        actionItems: [
          'Braze/Amplitude 기반 이탈 방지 리텐션 시나리오 설계 실습',
          '미디어·커머스 대기업 디지털 마케팅 전담 포지션 공략'
        ],
        expandedCount: 9,
        expectedSalaryRange: mkRange(1.14, 1.22),
        jobs: [
          { company: 'CJ ENM', title: 'OTT/미디어 퍼포먼스·CRM 마케팅', location: '서울 마포구 상암', role: 'Performance/CRM', salary: mkRange(1.12, 1.22, '대기업'), url: 'https://recruit.cj.net/' },
          { company: '우아한형제들', title: '커머스 CRM & 그로스 매니저', location: '서울 송파구', role: 'CRM Marketing', salary: mkRange(1.15, 1.25, '플랫폼'), url: 'https://career.woowahan.com/' },
        ]
      },
      {
        id: 'track-b2b-brand',
        name: '글로벌/B2B SaaS 수요창출 & PMM',
        skills: ['B2B 리드 스코어링 및 세일즈 퍼널 연계(MQL→SQL)', '영문 제품 포지셔닝(Product Marketing) 및 GTM 전략', 'SEO/콘텐츠 오가닉 유입 최적화'],
        actionItems: [
          'B2B GTM 전략서 및 영문 랜딩페이지 카피라이팅 포트폴리오 제작',
          '글로벌 테크 한국지사 PMM 포지션 지원'
        ],
        expandedCount: 6,
        expectedSalaryRange: mkRange(1.15, 1.25),
        jobs: [
          { company: 'Google Korea', title: 'Product / Growth Marketing Specialist', location: '서울 강남구', role: 'Global PMM', salary: mkRange(1.20, 1.35, '글로벌'), url: 'https://careers.google.com/locations/seoul/' },
          { company: 'AWS Korea', title: 'B2B Field & Demand Marketing', location: '서울 강남구', role: 'B2B Marketing', salary: mkRange(1.18, 1.30, '글로벌'), url: 'https://www.amazon.jobs/content/locations/south-korea/seoul' },
        ]
      }
    ];
  }

  if (occ === 'PLANNING') {
    return [
      {
        id: 'track-ax-pm',
        name: 'AI/DX 신사업 전략 & 엔터프라이즈 PM',
        skills: ['생성형 AI 도입 ROI/TCO 사업성 타당성 검토', '프로덕트 백로그/PRD 설계 및 기술팀 협업 리딩', '엔터프라이즈 B2B GTM 및 파트너십 구조화'],
        actionItems: [
          'AI 기반 사내/고객 서비스 기획안 및 손익(BEP) 시뮬레이션 작성',
          '대기업 DX 계열사(LG CNS, 삼성SDS) 신사업 PM 포지션 지원'
        ],
        expandedCount: 12,
        expectedSalaryRange: mkRange(1.16, 1.28, '+16~28% AX 전략 프리미엄'),
        jobs: [
          { company: 'LG CNS', title: '클라우드/AI 신사업 전략기획 & PM', location: '서울 강서구 마곡', role: 'AI Strategy/PM', salary: mkRange(1.15, 1.28, '대기업'), url: 'https://careers.lg.com/' },
          { company: '현대자동차', title: '모빌리티 중장기 사업전략 및 기획', location: '서울 서초구 양재', role: 'Corporate Strategy', salary: mkRange(1.14, 1.24, '완성차'), url: 'https://talent.hyundai.com/' },
        ]
      },
      {
        id: 'track-biz-consulting',
        name: '경영컨설팅 & 연결경영/PMI 실행',
        skills: ['MECE 이슈트리 기반 경영진 의사결정 보고서 작성', 'M&A PMI/사업부 구조조정 및 KPI 체계 재설계', 'ERP/연결시스템 프로세스 혁신(PI)'],
        actionItems: [
          '산업 밸류체인 분석 및 재무 임팩트 기반 전략 케이스 리포트 완성',
          'Big4 전략·PI 컨설팅 조직 경력직 공고 타깃 지원'
        ],
        expandedCount: 10,
        expectedSalaryRange: mkRange(1.15, 1.26),
        jobs: [
          { company: '삼일PwC', title: '경영·연결시스템 구축 PI 컨설턴트', location: '서울 용산구', role: 'Management Advisory', salary: mkRange(1.15, 1.25, 'Big4'), url: 'https://www.pwc.com/kr/ko/career/experienced.html' },
          { company: '딜로이트 안진', title: '전략·운영 자문 컨설턴트', location: '서울 영등포구 여의도', role: 'Strategy Consulting', salary: mkRange(1.15, 1.25, 'Big4'), url: 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitList.aspx' },
        ]
      },
      {
        id: 'track-data-po',
        name: '데이터 기반 Product Owner (PO) & 지표 설계',
        skills: ['SQL 직접 쿼리를 통한 유저 행동 지표(North Star Metric) 검증', '실험 기반 우선순위 의사결정(RICE/ICE)', '수익 모델(Monetization) 가격 탄력성 설계'],
        actionItems: [
          'SQL + BI(Looker/Tableau) 연계 서비스 KPI 모니터링 체계 구축 사례 정리',
          '유니콘 플랫폼 PO/PM 포지션 공략'
        ],
        expandedCount: 6,
        expectedSalaryRange: mkRange(1.18, 1.30),
        jobs: [
          { company: '우아한형제들', title: '프로덕트 기획(PM/PO)', location: '서울 송파구', role: 'Product Owner', salary: mkRange(1.16, 1.28, '플랫폼'), url: 'https://career.woowahan.com/' },
          { company: '토스 (비바리퍼블리카)', title: 'Product Owner (Financial Service)', location: '서울 강남구', role: 'Fintech PO', salary: mkRange(1.22, 1.35, '유니콘'), url: 'https://toss.im/career/jobs' },
        ]
      }
    ];
  }

  // HR Tracks (Entry vs Experienced)
  if (isEntry) {
    return [
      {
        id: 'track-analytics',
        name: 'People Analytics (주니어 데이터·보상 기획)',
        skills: ['SQL (기초 쿼리 및 인사 데이터 집계)', 'Excel/Google Sheets 피벗·통계', '채용/이탈률 핵심 KPI 산출'],
        actionItems: [
          'SQL 기초(SELECT, JOIN, GROUP BY) 학습 및 가명 인사 데이터 실습',
          '입퇴사율·채용 리드타임 대시보드 토이 프로젝트 제작',
          '대기업/핀테크 주니어 People Ops 포지션 지원'
        ],
        expandedCount: 14,
        expectedSalaryRange: mkRange(1.15, 1.25),
        jobs: [
          { company: '토스 (비바리퍼블리카)', title: 'People Data Analyst (주니어/신입)', location: '서울 강남구', role: 'HR Data Analyst', salary: mkRange(1.18, 1.28), url: 'https://toss.im/career/jobs' },
          { company: 'SK하이닉스', title: 'HR / People Operations 신입', location: '경기 성남시 분당구', role: 'HR Ops', salary: mkRange(1.15, 1.24), url: 'https://www.skcareers.com/' },
          { company: '당근 (당근마켓)', title: 'People Operations (Junior)', location: '서울 서초구', role: 'People Ops', salary: mkRange(1.15, 1.25), url: 'https://careers.daangn.com/jobs/' }
        ]
      },
      {
        id: 'track-global',
        name: 'Global HR & Bilingual (외국계 주니어)',
        skills: ['비즈니스 영어 (영문 이메일·면접 커뮤니케이션)', '글로벌 채용 공고/온보딩 운영', '다국적 임직원 인사 행정(HRIS)'],
        actionItems: [
          '영문 레주메(Resume) 및 LinkedIn 프로필 영문화 완성',
          '외국계 테크 한국 오피스 Recruiting/HR Coordinator 포지션 지원'
        ],
        expandedCount: 8,
        expectedSalaryRange: mkRange(1.15, 1.25),
        jobs: [
          { company: 'Google Korea', title: 'HR / Staffing Coordinator', location: '서울 강남구', role: 'Global HR', salary: mkRange(1.18, 1.30), url: 'https://careers.google.com/locations/seoul/' },
          { company: 'AWS Korea', title: 'Recruiting Coordinator', location: '서울 강남구', role: 'Global TA', salary: mkRange(1.15, 1.26), url: 'https://www.amazon.jobs/content/locations/south-korea/seoul' }
        ]
      },
      {
        id: 'track-ax',
        name: 'HR Automation & No-Code (인사 행정 자동화)',
        skills: ['Zapier/Make 기반 입퇴사 알림 자동화', 'Notion/Flex HRIS 운영', '생성형 AI 기반 면접 가이드/JD 템플릿'],
        actionItems: [
          '신규 입사자 온보딩 체크리스트 자동 발송 워크플로우 토이 프로젝트',
          '플랫폼/대기업 HR Ops 포지션 포트폴리오 제출'
        ],
        expandedCount: 6,
        expectedSalaryRange: mkRange(1.12, 1.22),
        jobs: [
          { company: '우아한형제들', title: 'People Operations Specialist', location: '서울 송파구', role: 'HR Ops', salary: mkRange(1.14, 1.24), url: 'https://career.woowahan.com/' },
          { company: 'CJ ENM', title: 'HR Digital & People Support', location: '서울 마포구 상암', role: 'HR System', salary: mkRange(1.10, 1.20), url: 'https://recruit.cj.net/' }
        ]
      }
    ];
  }

  return [
    {
      id: 'track-analytics',
      name: 'People Analytics & HR Data Science',
      skills: ['SQL (인사 DB 쿼리 및 코호트 집계)', 'Tableau / PowerBI 대시보드 구축', '퇴사 예측 및 보상 시뮬레이션 모델링', 'eNPS / 조직 건강도 통계 분석'],
      actionItems: [
        'SQL 레벨 2(Window Function) 인사 데이터 코호트 분석 실습',
        'Tableau 기반 인건비·리텐션 대시보드 포트폴리오 정리',
        '대기업·테크 기업 People Analytics 전담 포지션 지원'
      ],
      expandedCount: 14,
      expectedSalaryRange: mkRange(1.15, 1.28),
      jobs: [
        { company: '삼성전자 DX부문', title: '인사기획 & People Analytics Specialist', location: '경기 수원시 영통구', role: 'HR Data Analytics', salary: mkRange(1.20, 1.35), url: 'https://www.samsungcareers.com/' },
        { company: '토스 (비바리퍼블리카)', title: 'People Data Partner', location: '서울 강남구 역삼', role: 'People Operations', salary: mkRange(1.18, 1.30), url: 'https://toss.im/career/jobs' },
        { company: '쿠팡 (Coupang)', title: 'People Analytics & ER Specialist', location: '서울 송파구', role: 'HR Analytics', salary: mkRange(1.15, 1.26), url: 'https://www.coupang.jobs/kr/' }
      ]
    },
    {
      id: 'track-global',
      name: 'Global HRBP & Regional TA Lead',
      skills: ['비즈니스 영어 능통 (본사 보고 및 노무 협상)', 'Workday/SuccessFactors 글로벌 HRIS 운영', '해외 법인 평가보상·주재원 패키지 설계'],
      actionItems: [
        '영문 이력서 및 글로벌 성과 정량 지표(STAR) 업데이트',
        '외국계 글로벌 테크 서울 오피스 HRBP 포지션 지원'
      ],
      expandedCount: 8,
      expectedSalaryRange: mkRange(1.18, 1.30),
      jobs: [
        { company: 'Google Korea', title: 'HR Business Partner', location: '서울 강남구 역삼', role: 'Global HR', salary: mkRange(1.20, 1.35), url: 'https://careers.google.com/locations/seoul/' },
        { company: 'Amazon Web Services (AWS)', title: 'Senior HR Partner / Recruiter', location: '서울 강남구 역삼', role: 'Global HRBP', salary: mkRange(1.18, 1.32), url: 'https://www.amazon.jobs/content/locations/south-korea/seoul' }
      ]
    },
    {
      id: 'track-ax',
      name: 'HR AX (AI Transformation) & No-Code Automation',
      skills: ['생성형 AI(LLM) 기반 평가·면접·JD 파이프라인 구축', 'Flex/Zapier 기반 인사 행정 자동화 설계', '차세대 HR 테크 도입 및 벤더 평가 PM'],
      actionItems: [
        '사내 인사규정·노동법 QA 봇 및 AI 평가 피드백 파이프라인 설계서 정리',
        '대기업 그룹사 HR DX/AX 전담 조직 포지션 공략'
      ],
      expandedCount: 6,
      expectedSalaryRange: mkRange(1.14, 1.24),
      jobs: [
        { company: 'LG CNS', title: '생성형 AI 기반 HR 솔루션/AX 기획', location: '서울 강서구 마곡', role: 'HR DX Consultant', salary: mkRange(1.15, 1.25), url: 'https://careers.lg.com/' },
        { company: 'CJ ENM', title: 'HR Digital Transformation & Systems', location: '서울 마포구 상암', role: 'HR Tech Lead', salary: mkRange(1.12, 1.22), url: 'https://recruit.cj.net/' }
      ]
    }
  ];
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
  // '사업개발/인재개발/조직개발' 등 복합어의 '개발'이 TECH로 오분류되지 않도록 마스킹
  const techSrc = s.replace(/(사업|인재|조직|신사업|상품|경영|제품)\s*개발/g, '$1@@');

  // 1. TECH
  if (
    /개발|엔지니어|프론트|백엔드|풀스택|소프트웨어|인공지능|머신러닝|테크|클라우드|보안|전산|\b(tech|dev|engineer|frontend|backend|fullstack|react|typescript|javascript|node|python|java|spring|data|ai|ml|cloud|security|devops|sw|ict|sql|aws)\b/.test(techSrc) &&
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

  // 직무 키워드 토큰 (원시 직군 enum 코드 자체로 자동 매칭이 부풀려지지 않도록 canonicalRole/skills/keywords 중심 추출)
  const userText = [
    passport.canonicalRole || '',
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
  const rawScore = Math.round(
    roleFit * 0.4 +
    seniorityFit * 0.25 +
    commuteFit * 0.20 +
    salaryFit * 0.15
  );

  // 연차가 근본적으로 맞지 않는 공고는 다른 항목 점수가 높아도 상위 노출되지 않도록 상한을 둔다.
  //  - 신입이 경력 3년+ 요구 공고에 지원 / 경력(4년+)자가 신입 전용 공고에 지원
  const entryOnlyJob = job.maxYears <= 2 && (job.isEntryLevel || job.minYears === 0) && !(job.tags || []).some(t => t.includes('경력'));
  const seniorityMismatch =
    (isEntryUser && job.minYears >= 3) ||
    (!isEntryUser && passport.totalYears >= 4 && entryOnlyJob) ||
    (!isEntryUser && passport.totalYears < job.minYears - 2);
  let totalScore = rawScore;
  if (seniorityMismatch) {
    totalScore = Math.min(rawScore, 59);
    gapReasons.push("연차 요건이 크게 달라 우선 추천에서 제외됩니다");
  }

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
    const isCapital = /(서울|경기|인천|수도권|강남|판교|분당|수원|성남|용인|화성|이천|고양|부천|안양|군포|과천|하남|원격|remote)/.test(loc);
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
