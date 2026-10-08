const fs = require('fs');
let matcher = fs.readFileSync('src/lib/matcher.ts', 'utf-8');
const startIndex = matcher.indexOf('export const EXPANDED_SKILL_GAP_TRACKS: SkillGapTrack[]');
const endIndex = matcher.indexOf('];', startIndex) + 2;

if (startIndex !== -1 && endIndex !== -1) {
  const prefix = matcher.slice(0, startIndex);
  const suffix = matcher.slice(endIndex);
  
  const dynamicFunctionStr = `
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
  const expectedSalaryRange = \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원 (+15~25% 프리미엄)\`;

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
          { company: '토스', title: 'People Data Analyst (신입)', location: '서울 강남구', role: 'HR Data Analyst', salary: \`\${Math.round(minPremium * 1.1).toLocaleString()}만 원~\`, url: '#' },
          { company: '무신사', title: 'HR Data Assistant', location: '서울 성동구', role: 'HR Data', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' },
          { company: '당근마켓', title: 'People Ops Data (Junior)', location: '서울 서초구', role: 'People Ops Data', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' }
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
          { company: '구글코리아', title: 'HR Coordinator (Contract/Entry)', location: '서울 강남구', role: 'Global HR', salary: \`\${maxPremium.toLocaleString()}만 원~\`, url: '#' },
          { company: '아마존웹서비시즈', title: 'Recruiting Coordinator', location: '서울 강남구', role: 'Global TA', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' },
          { company: '나이키코리아', title: 'HR Assistant', location: '서울 강남구', role: 'Global HR', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' }
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
          { company: '우아한형제들', title: 'People Ops Assistant', location: '서울 송파구', role: 'HR Ops', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' },
          { company: '야놀자', title: 'HR Admin & System Assistant', location: '서울 강남구', role: 'HR System', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' },
          { company: '크래프톤', title: 'HR Assistant', location: '서울 강남구', role: 'HR System', salary: \`\${minPremium.toLocaleString()}만 원~\`, url: '#' }
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
          { company: '쿠팡 (Coupang)', title: 'People Analytics Specialist', location: '서울 송파구 신천', role: 'HR Data Analytics', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://www.coupang.jobs/kr/' },
          { company: '토스 (비바리퍼블리카)', title: 'People Data Partner', location: '서울 강남구 역삼', role: 'People Operations', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://toss.im/career/jobs' },
          { company: 'SK하이닉스', title: '피플사이언스 데이터 분석가', location: '경기도 분당/이천', role: 'HR Analytics', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://www.skcareers.com' }
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
          { company: 'Google Korea', title: 'HR Business Partner', location: '서울 강남구 역삼', role: 'Global HR', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://careers.google.com/locations/seoul/' },
          { company: 'Amazon Web Services (AWS)', title: 'Senior Recruiter (Tech)', location: '서울 강남구 역삼', role: 'Global TA', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://www.amazon.jobs/content/locations/south-korea/seoul' }
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
          { company: '삼성전자 DX부문', title: 'People AX (AI Transformation) 혁신 PM', location: '경기도 수원 화성', role: 'HR Tech / AX', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://www.samsungcareers.com' },
          { company: 'LG CNS', title: '생성형 AI 기반 HR 솔루션 기획자', location: '서울 강서구 마곡', role: 'HR DX Consultant', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://careers.lg.com' },
          { company: 'CJ ENM', title: 'HR Digital Transformation & Systems', location: '서울 마포구 상암', role: 'HR Tech Lead', salary: \`\${minPremium.toLocaleString()} ~ \${maxPremium.toLocaleString()}만 원\`, url: 'https://recruit.cj.net' }
        ]
      }
    ];
  }
}
`;

  matcher = prefix + dynamicFunctionStr + suffix;
  fs.writeFileSync('src/lib/matcher.ts', matcher, 'utf-8');
  console.log('Successfully replaced constant with dynamic function.');
} else {
  console.log('Could not find EXPANDED_SKILL_GAP_TRACKS');
}
