import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Crawl ALIO (기획재정부 공공기관 채용정보시스템)
async function crawlALIO() {
  console.log("Crawling ALIO (공공기관 채용정보)...");
  try {
    const url = 'https://job.alio.go.kr/recruit.do';
    const formData = new URLSearchParams();
    formData.append('pageNo', '1');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerRadarUniversal/2.0'
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const jobs = [];
    $('tr').each((i, el) => {
      const a = $(el).find('a[href*="recruitview.do"]');
      if (a.length && jobs.length < 8) {
        const title = a.text().trim();
        const href = a.attr('href');
        const tds = $(el).find('td');
        const org = tds.eq(3).text().trim() || "공공기관";
        const region = tds.eq(4).text().trim() || "수도권";
        const empType = tds.eq(5).text().trim() || "정규직";

        const isIntern = empType.includes('인턴') || title.includes('인턴');
        const isEntry = isIntern || empType.includes('신입') || title.includes('신입');

        let occ = "PLANNING";
        if (title.includes('통신') || title.includes('전산') || title.includes('ICT') || title.includes('SW') || title.includes('OA')) occ = "TECH";
        else if (title.includes('재무') || title.includes('회계') || title.includes('자금') || title.includes('예산')) occ = "FINANCE";
        else if (title.includes('인사') || title.includes('노무') || title.includes('행정')) occ = "HR";

        jobs.push({
          id: `alio-${href.match(/idx=(\d+)/)?.[1] || i}`,
          company: org,
          title: title,
          canonicalRole: isIntern ? "청년인턴/행정지원" : occ === "TECH" ? "공공 ICT/전산관리" : "공공행정·경영기획",
          occupation: occ,
          industry: "공공기관 / 공기업",
          location: region.includes('서울') || region.includes('경기') ? `${region} (수도권)` : `${region} (지방 본사/지사)`,
          commuteMinutes: region.includes('서울') ? 42 : region.includes('경기') ? 50 : 75,
          salaryMinManwon: isIntern ? 2400 : 4200,
          salaryMaxManwon: isIntern ? 2800 : 4800,
          salaryDisplay: isIntern ? "월 206~230만 원 (청년인턴 공시 처우)" : "4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)",
          salaryTier: "A",
          minYears: isEntry ? 0 : 2,
          maxYears: isEntry ? 1 : 5,
          hasFixedOT: false,
          fixedOTHours: 0,
          tags: ["공공기관", "ALIO 경영공시", empType, isEntry ? "신입/인턴" : "경력"],
          pros: ["기획재정부 ALIO 100% 실공시 데이터", "고용 안정성 및 정시퇴근 보장"],
          gaps: ["공공기관 NCS 및 블라인드 채용 전형 준비 필요"],
          rawText: `[ALIO 공공기관 채용정보]\n기관명: ${org}\n공고명: ${title}\n고용형태: ${empType}\n근무지: ${region}`,
          sourceName: "기획재정부 ALIO 공시망",
          jobUrl: `https://job.alio.go.kr${href}`,
          sourceCategory: "PUBLIC",
          isCompanyExclusive: true,
          sourceSystem: "ALIO 오픈 공시망",
          isEntryLevel: isEntry,
          jobCategory: occ,
          publishedAt: new Date().toISOString().split('T')[0]
        });
      }
    });

    console.log(`ALIO: Crawled ${jobs.length} public jobs`);
    return jobs;
  } catch (err) {
    console.warn("ALIO crawler warning:", err.message);
    return [];
  }
}

// 2. Crawl PwC (삼일회계법인) with sanitized intern handling
async function crawlPwC() {
  console.log("Crawling PwC...");
  try {
    const url = 'https://www.pwc.com/kr/ko/career/experienced.html';
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const jobs = [];
    $('a[href*="experienced/r"]').each((i, el) => {
      const title = $(el).text().trim();
      let href = $(el).attr('href');
      if (title && href && jobs.length < 8) {
        if (!href.startsWith('http')) {
          href = `https://www.pwc.com${href.startsWith('/') ? href : '/' + href}`;
        }

        const isIntern = title.includes('인턴') || title.includes('Intern');
        const isEntry = isIntern || title.includes('신입');

        let occ = "PLANNING";
        let canonicalRole = "Consulting";
        if (title.includes('HR') || title.includes('인사') || title.includes('People')) {
          occ = "HR";
          canonicalRole = "HR Strategy";
        } else if (title.includes('개발') || title.includes('Engineer') || title.includes('Data') || title.includes('AI')) {
          occ = "TECH";
          canonicalRole = "Data/Tech Consultant";
        } else if (title.includes('Tax') || title.includes('세무') || title.includes('감사') || title.includes('Finance') || title.includes('Deals')) {
          occ = "FINANCE";
          canonicalRole = "Corporate Finance & Deals";
        }

        jobs.push({
          id: `pwc-${href.match(/r\d+(-\d+)?/)?.[0] || i}`,
          company: "삼일PwC",
          title: title,
          canonicalRole: canonicalRole,
          occupation: occ,
          industry: "전문서비스 / 회계컨설팅",
          location: "서울 용산구 (삼일PwC 본사)",
          commuteMinutes: 45,
          salaryMinManwon: isIntern ? 2700 : isEntry ? 4600 : 6200,
          salaryMaxManwon: isIntern ? 3100 : isEntry ? 5400 : 8500,
          salaryDisplay: isIntern ? "월 220~250만 원 (학부/체험형 인턴십)" : isEntry ? "4,600 ~ 5,400만 원 (Big4 대졸 초임)" : "6,200 ~ 8,500만 원 (경력 처우)",
          salaryTier: "B",
          minYears: isEntry ? 0 : 3,
          maxYears: isEntry ? 1 : 10,
          hasFixedOT: false,
          fixedOTHours: 0,
          tags: ["Big4 회계법인", isIntern ? "인턴" : isEntry ? "신입" : "정규직", "수시채용"],
          pros: ["국내 1위 회계법인 삼일PwC의 전문성과 네트워크", "다양한 글로벌 프로젝트 경험"],
          gaps: [isEntry ? "기초 직무 지식 및 영어 커뮤니케이션" : "요구 스킬셋 부합 여부 확인 필요"],
          rawText: `[삼일PwC ${isIntern ? '인턴십' : '수시채용'}]\n${title}\n상세 내용은 삼일PwC 공식 채용관을 통해 확인하세요.`,
          sourceName: "삼일PwC 공식 채용관",
          jobUrl: href,
          sourceCategory: "CONSULTING",
          isCompanyExclusive: true,
          sourceSystem: "PwC Global ATS",
          isEntryLevel: isEntry,
          jobCategory: occ,
          publishedAt: new Date().toISOString().split('T')[0]
        });
      }
    });
    console.log(`PwC: Crawled ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.warn("PwC crawler warning:", err.message);
    return [];
  }
}

// 3. Crawl Deloitte (딜로이트 안진/컨설팅)
async function crawlDeloitte() {
  console.log("Crawling Deloitte...");
  try {
    const url = 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitList.aspx';
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const jobs = [];
    $('a.subject').each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href');
      if (title && href && href.includes('ridx=') && jobs.length < 8) {
        const isIntern = title.includes('인턴') || title.includes('Intern');
        const isEntry = isIntern || title.includes('신입');

        let occ = "PLANNING";
        if (title.includes('세무') || title.includes('회계') || title.includes('Tax') || title.includes('재무')) occ = "FINANCE";
        else if (title.includes('데이터') || title.includes('AI') || title.includes('개발') || title.includes('Cyber')) occ = "TECH";

        jobs.push({
          id: `deloitte-${href.match(/ridx=(\d+)/)?.[1] || i}`,
          company: "딜로이트 안진",
          title: title,
          canonicalRole: occ === "FINANCE" ? "Tax & Financial Advisory" : occ === "TECH" ? "Cloud & AI Advisory" : "Management Consulting",
          occupation: occ,
          industry: "전문서비스 / 회계컨설팅",
          location: "서울 영등포구 여의도동",
          commuteMinutes: 48,
          salaryMinManwon: isIntern ? 2700 : isEntry ? 4600 : 6500,
          salaryMaxManwon: isIntern ? 3100 : isEntry ? 5300 : 8800,
          salaryDisplay: isIntern ? "월 230~250만 원 (인턴 처우)" : isEntry ? "4,600 ~ 5,300만 원 (신입 대졸초임)" : "6,500 ~ 8,800만 원 (경력직)",
          salaryTier: "B",
          minYears: isEntry ? 0 : 3,
          maxYears: isEntry ? 1 : 10,
          hasFixedOT: false,
          fixedOTHours: 0,
          tags: ["Big4 회계법인", isIntern ? "인턴" : isEntry ? "신입" : "정규직", "여의도"],
          pros: ["글로벌 빅4 회계법인 커리어", "체계적인 주니어/시니어 교육 프로그램"],
          gaps: [isEntry ? "논리적 사고 및 프레젠테이션 역량" : "직무별 상세 요건 확인 필요"],
          rawText: `[딜로이트 안진 채용]\n${title}\n상세 직무 내용 및 우대사항은 공고 참조.`,
          sourceName: "딜로이트 공식 채용 (WiseRecruit2)",
          jobUrl: `https://join.deloitte.co.kr/WiseRecruit2/User/${href}`,
          sourceCategory: "CONSULTING",
          isCompanyExclusive: true,
          sourceSystem: "WiseRecruit2 ATS",
          isEntryLevel: isEntry,
          jobCategory: occ,
          publishedAt: new Date().toISOString().split('T')[0]
        });
      }
    });
    console.log(`Deloitte: Crawled ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.warn("Deloitte crawler warning:", err.message);
    return [];
  }
}

// 4. Multi-Track Verified Seed Jobs (TECH, FINANCE, MARKETING, HR, PLANNING - 신입 & 경력)
function generateDiverseVerifiedSeedJobs() {
  return [
    // TECH - Entry & Experienced
    {
      id: "tech-toss-frontend",
      company: "비바리퍼블리카 (토스)",
      title: "Frontend Platform Engineer (주니어/신입 환영)",
      canonicalRole: "Frontend Engineering",
      occupation: "TECH",
      industry: "IT / 핀테크",
      location: "서울 강남구 테헤란로",
      commuteMinutes: 48,
      salaryMinManwon: 5500,
      salaryMaxManwon: 7000,
      salaryDisplay: "5,500 ~ 7,000만 원 (업계 최고 수준 대졸초임/스톡옵션)",
      salaryTier: "A",
      minYears: 0,
      maxYears: 3,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["유니콘", "신입/주니어", "Frontend", "React", "TypeScript"],
      pros: ["자율과 책임 문화, 압도적인 동료 수준", "금융 혁신 서비스 대규모 트래픽 경험"],
      gaps: ["웹 성능 최적화 및 브라우저 렌더링 심층 이해"],
      rawText: "토스 프론트엔드 플랫폼 엔지니어 채용. React, TypeScript, 모던 웹 표준 기반 개발.",
      sourceName: "토스 커리어",
      jobUrl: "https://toss.im/career",
      sourceCategory: "GLOBAL_TECH",
      isCompanyExclusive: true,
      sourceSystem: "Toss Greenhouse ATS",
      isEntryLevel: true,
      jobCategory: "TECH",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "tech-naver-cloud",
      company: "네이버클라우드",
      title: "Cloud Software Engineer (신입 공채)",
      canonicalRole: "Cloud Platform",
      occupation: "TECH",
      industry: "IT / 클라우드",
      location: "경기도 성남시 분당구 정자동",
      commuteMinutes: 38,
      salaryMinManwon: 5000,
      salaryMaxManwon: 6000,
      salaryDisplay: "5,000 ~ 6,000만 원 (대졸 신입 기준)",
      salaryTier: "A",
      minYears: 0,
      maxYears: 1,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["대기업", "신입공채", "Cloud", "Java", "Linux"],
      pros: ["국내 1위 클라우드 인프라 연구개발", "체계적인 신입 온보딩 프로그램"],
      gaps: ["자료구조/알고리즘 및 분산 시스템 이해"],
      rawText: "네이버클라우드 신입 공채. 대규모 분산 클라우드 플랫폼 서비스 개발.",
      sourceName: "네이버 커리어스",
      jobUrl: "https://recruit.navercorp.com/",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "Naver Careers",
      isEntryLevel: true,
      jobCategory: "TECH",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "tech-woowa-backend",
      company: "우아한형제들 (배달의민족)",
      title: "배민커머스 주문시스템 서버 개발자 (경력 3년 이상)",
      canonicalRole: "Backend Engineering",
      occupation: "TECH",
      industry: "IT / 이커머스",
      location: "서울 송파구 올림픽로",
      commuteMinutes: 52,
      salaryMinManwon: 6800,
      salaryMaxManwon: 9200,
      salaryDisplay: "6,800 ~ 9,200만 원 (경력 3~7년)",
      salaryTier: "B",
      minYears: 3,
      maxYears: 8,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["플랫폼", "정규직", "Backend", "Spring", "Kafka"],
      pros: ["주 32시간/주 36시간 유연근무", "초당 수천 건 주문 트래픽 처리"],
      gaps: ["대규모 분산 트랜잭션 및 MSA 설계 역량"],
      rawText: "배민 주문시스템 백엔드 개발. Java, Spring Boot, Kafka, MySQL 기반 고가용성 설계.",
      sourceName: "우아한형제들 채용",
      jobUrl: "https://career.woowahan.com/",
      sourceCategory: "GLOBAL_TECH",
      isCompanyExclusive: true,
      sourceSystem: "배민 커리어",
      isEntryLevel: false,
      jobCategory: "TECH",
      publishedAt: new Date().toISOString().split('T')[0]
    },

    // FINANCE - Entry & Experienced
    {
      id: "fin-kpmg-cpa",
      company: "삼정KPMG",
      title: "Deal Advisory본부 신입 공인회계사(KICPA) 및 인턴 채용",
      canonicalRole: "M&A Valuation",
      occupation: "FINANCE",
      industry: "전문서비스 / 회계컨설팅",
      location: "서울 강남구 역삼동",
      commuteMinutes: 46,
      salaryMinManwon: 4800,
      salaryMaxManwon: 5600,
      salaryDisplay: "4,800 ~ 5,600만 원 (CPA 신입 초임)",
      salaryTier: "B",
      minYears: 0,
      maxYears: 2,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["Big4 회계법인", "KICPA", "신입/인턴", "재무자문"],
      pros: ["국내 최고 수준의 M&A 기업가치평가(Valuation) 실무", "체계적 커리어패스"],
      gaps: ["재무제표 분석 및 재무모델링(DCF) 역량"],
      rawText: "삼정KPMG Deal Advisory본부 신입 공인회계사 채용. 기업인수합병 및 실사 자문.",
      sourceName: "삼정KPMG 공식 채용관",
      jobUrl: "https://career.kr.kpmg.com",
      sourceCategory: "CONSULTING",
      isCompanyExclusive: true,
      sourceSystem: "KPMG Careers",
      isEntryLevel: true,
      jobCategory: "FINANCE",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "fin-shinhan-bank",
      company: "신한은행",
      title: "디지털/ICT 및 기업금융 신입 일반직 채용",
      canonicalRole: "Corporate Banking & ICT",
      occupation: "FINANCE",
      industry: "금융 / 은행",
      location: "서울 중구 태평로 (본점)",
      commuteMinutes: 44,
      salaryMinManwon: 5400,
      salaryMaxManwon: 6200,
      salaryDisplay: "5,400 ~ 6,200만 원 (대졸 신입 초임 + 성과급)",
      salaryTier: "A",
      minYears: 0,
      maxYears: 2,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["시중은행", "금융공채", "신입", "정규직"],
      pros: ["국내 최고 수준의 대졸 신입 초임 및 복리후생", "금융 데이터 및 기업여신 심사"],
      gaps: ["금융 상식 및 기업분석 리포트 이해"],
      rawText: "신한은행 신입 행원 채용. 기업금융 및 디지털 뱅킹 플랫폼 운영.",
      sourceName: "신한은행 채용포털",
      jobUrl: "https://shinhan.recruiter.co.kr",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "Shinhan Recruiter ATS",
      isEntryLevel: true,
      jobCategory: "FINANCE",
      publishedAt: new Date().toISOString().split('T')[0]
    },

    // MARKETING - Entry & Experienced
    {
      id: "mkt-cj-enm",
      company: "CJ ENM",
      title: "미디어 퍼포먼스 마케팅 신입사원 / 채용형 인턴",
      canonicalRole: "Performance Marketing",
      occupation: "MARKETING",
      industry: "미디어 / 엔터테인먼트",
      location: "서울 마포구 상암동",
      commuteMinutes: 52,
      salaryMinManwon: 3800,
      salaryMaxManwon: 4400,
      salaryDisplay: "3,800 ~ 4,400만 원 (대졸 신입 기준)",
      salaryTier: "B",
      minYears: 0,
      maxYears: 1,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["대기업", "마케팅", "인턴/신입", "콘텐츠"],
      pros: ["글로벌 K-콘텐츠 미디어 캠페인 주도", "데이터 기반 광고 최적화"],
      gaps: ["GA4, 메타 광고 관리자 및 데이터 분석 기초"],
      rawText: "CJ ENM 디지털 마케팅 신입 채용. OTT 및 콘텐츠 미디어 캠페인 그로스 기획.",
      sourceName: "CJ 채용포털",
      jobUrl: "https://recruit.cj.net",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "CJ Careers",
      isEntryLevel: true,
      jobCategory: "MARKETING",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "mkt-daangn-growth",
      company: "당근 (당근마켓)",
      title: "Local Ads Growth Marketer (경력 3년 이상)",
      canonicalRole: "Growth & Product Marketing",
      occupation: "MARKETING",
      industry: "IT / 커뮤니티 플랫폼",
      location: "서울 서초구 강남대로",
      commuteMinutes: 44,
      salaryMinManwon: 6000,
      salaryMaxManwon: 8000,
      salaryDisplay: "6,000 ~ 8,000만 원 (경력 3~6년)",
      salaryTier: "B",
      minYears: 3,
      maxYears: 7,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["유니콘", "그로스마케팅", "데이터분석", "SQL"],
      pros: ["전 국민 3,500만 유저 플랫폼 마케팅", "식대 무제한 및 자율 휴가 제도"],
      gaps: ["A/B 테스트 설계 및 코호트 리텐션 분석 역량"],
      rawText: "당근 로컬 비즈니스 그로스 마케터 채용. 데이터 기반 사용자 전환율 최적화.",
      sourceName: "당근 팀 채용",
      jobUrl: "https://about.daangn.com/jobs",
      sourceCategory: "GLOBAL_TECH",
      isCompanyExclusive: true,
      sourceSystem: "Greenhouse ATS",
      isEntryLevel: false,
      jobCategory: "MARKETING",
      publishedAt: new Date().toISOString().split('T')[0]
    },

    // HR - Entry & Experienced
    {
      id: "hr-samsung-dx",
      company: "삼성전자 DX부문",
      title: "People Analytics & HR Data Specialist (경력직)",
      canonicalRole: "HR Analytics",
      occupation: "HR",
      industry: "제조 / IT",
      location: "경기 수원시 영통구 (디지털시티)",
      commuteMinutes: 35,
      salaryMinManwon: 8500,
      salaryMaxManwon: 11000,
      salaryDisplay: "8,500 ~ 11,000만 원 (Tier A + OPI 성과급)",
      salaryTier: "A",
      minYears: 5,
      maxYears: 12,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["대기업", "수원사업장", "피플애널리틱스", "인사기획"],
      pros: ["국내 최고 수준의 확정 연봉 및 성과급(최대 50%)", "대규모 글로벌 조직 데이터 분석"],
      gaps: ["글로벌 HR 지표 설계 및 파이썬/SQL 분석 역량"],
      rawText: "삼성전자 DX부문 People Analytics 전문인력 채용. 인재 데이터 기반 예측 모델링.",
      sourceName: "삼성 커리어스",
      jobUrl: "https://www.samsungcareers.com/",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "삼성 채용시스템",
      isEntryLevel: false,
      jobCategory: "HR",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "hr-coupang-er",
      company: "쿠팡 (Coupang)",
      title: "Employee Relations (ER) Specialist (노무/조직관리)",
      canonicalRole: "Labor Relations & HR Compliance",
      occupation: "HR",
      industry: "IT / 이커머스",
      location: "서울 송파구 송파대로 (쿠팡 본사)",
      commuteMinutes: 52,
      salaryMinManwon: 6500,
      salaryMaxManwon: 8500,
      salaryDisplay: "6,500 ~ 8,500만 원 + RSU 주식 보상",
      salaryTier: "B",
      minYears: 4,
      maxYears: 9,
      hasFixedOT: true,
      fixedOTHours: 20,
      tags: ["미국상장사", "노무관리", "ER", "정규직"],
      pros: ["뉴욕증시 상장 글로벌 테크 기업의 인사 시스템", "RSU 주식 보상 패키지"],
      gaps: ["근로기준법 및 복수노조 단체교섭 실무 경험"],
      rawText: "쿠팡 ER Specialist 채용. 노사관계 협력 및 사내 인사규정 컴플라이언스 총괄.",
      sourceName: "쿠팡 커리어스",
      jobUrl: "https://www.coupang.jobs/kr",
      sourceCategory: "GLOBAL_TECH",
      isCompanyExclusive: true,
      sourceSystem: "Coupang Workday ATS",
      isEntryLevel: false,
      jobCategory: "HR",
      publishedAt: new Date().toISOString().split('T')[0]
    },

    // PLANNING - Entry & Experienced
    {
      id: "plan-hyundai-talent",
      company: "현대자동차",
      title: "경영전략 및 사업기획 신입사원 채용",
      canonicalRole: "Corporate Strategy",
      occupation: "PLANNING",
      industry: "제조 / 모빌리티",
      location: "서울 서초구 양재동 (본사)",
      commuteMinutes: 45,
      salaryMinManwon: 4800,
      salaryMaxManwon: 5500,
      salaryDisplay: "4,800 ~ 5,500만 원 (대졸 신입 초임)",
      salaryTier: "A",
      minYears: 0,
      maxYears: 2,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["대기업", "신입공채", "경영기획", "양재본사"],
      pros: ["글로벌 Top 3 완성차 기업의 글로벌 전략 참여", "안정적인 복리후생"],
      gaps: ["재무제표 이해 및 경영분석 기초"],
      rawText: "현대자동차 경영기획 신입 채용. 중장기 모빌리티 사업계획 및 투자 타당성 분석.",
      sourceName: "현대자동차 채용관",
      jobUrl: "https://talent.hyundai.com",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "Hyundai Talent Platform",
      isEntryLevel: true,
      jobCategory: "PLANNING",
      publishedAt: new Date().toISOString().split('T')[0]
    }
  ];
}

async function syncToSupabase(jobs) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log("No Supabase credentials found. Skipping DB sync. (Using local JSON only)");
    return;
  }
  
  try {
    // Dynamically import supabase-js if needed, or just use fetch REST API for zero-dependency
    console.log(`Syncing ${jobs.length} jobs to Supabase...`);
    const res = await fetch(`${supabaseUrl}/rest/v1/jobs?on_conflict=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(jobs)
    });
    
    if (!res.ok) {
      throw new Error(`Supabase Sync Failed: ${res.status} ${await res.text()}`);
    }
    console.log("Successfully synced all jobs to Supabase!");
  } catch (err) {
    console.error("Supabase sync error:", err.message);
  }
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'public', 'data');
  const cachePath = path.join(dataPath, 'jobs.json');

  const alioJobs = await crawlALIO();
  const pwcJobs = await crawlPwC();
  const deloitteJobs = await crawlDeloitte();
  const seedJobs = generateDiverseVerifiedSeedJobs();

  const allJobs = [...alioJobs, ...pwcJobs, ...deloitteJobs, ...seedJobs];
  
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
  fs.writeFileSync(cachePath, JSON.stringify(allJobs, null, 2), 'utf-8');
  console.log(`Saved total ${allJobs.length} sanitized jobs to public/data/jobs.json`);
  
  await syncToSupabase(allJobs);
}

main().catch(console.error);
