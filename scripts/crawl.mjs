import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NON_CAREER_KEYWORDS =
  /기간제|일용|시설경비|경비원|미화|청소|한시인력|환경관리|수익시설|조리원|운전원|아르바이트|알바|영덕2현대화|위촉|초빙|의료요원|진료의사|진료교수|별정직\s*의사|의사\(|간호|수련의|전공의|약무직|약사|의료기술|방사선사|임상병리|물리치료|치과|위생사|보건직|수련생|무기계약|조무사|영양사|사회복지사|어시스턴트|테크니션|사옥관리|임원\s*비서|executive assistant|인재풀\s*등록|보훈특별/i;

const NON_TARGET_FUNCTION_REGEX =
  /현장영업|업주\s*영업|B2B\s*영업|제휴영업|Sales Manager|세일즈|일러스트레이터|비주얼\s*디자이너|Visual Designer|Product Designer|점포개발|변호사|법무담당|개인정보보호법|관세사|상담원/i;

function stripHtml(raw = '') {
  return String(raw)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractYearsFromText(text = '', isInternOrEntry = false) {
  if (isInternOrEntry && !/신입\/경력|경력\s*\d+\s*년/.test(text)) {
    return { minYears: 0, maxYears: 2 };
  }
  const rangeMatch = text.match(/경력\s*(\d+)\s*[~-]\s*(\d+)\s*년/);
  if (rangeMatch) {
    return {
      minYears: Math.min(20, parseInt(rangeMatch[1], 10)),
      maxYears: Math.min(25, parseInt(rangeMatch[2], 10)),
    };
  }
  const minMatch = text.match(/(?:경력|유관\s*경력|관련\s*경력|실무\s*경력)\s*(\d+)\s*년\s*(?:이상|↑|\+)/);
  if (minMatch) {
    const min = Math.min(20, parseInt(minMatch[1], 10));
    return { minYears: min, maxYears: Math.max(min + 5, 10) };
  }
  const yrPlus = text.match(/(\d+)\s*년\s*이상/);
  if (yrPlus && parseInt(yrPlus[1], 10) <= 15) {
    const min = parseInt(yrPlus[1], 10);
    return { minYears: min, maxYears: Math.max(min + 5, 10) };
  }
  if (/신입\s*가능|신입\/경력|주니어|연차\s*무관|경력\s*무관/i.test(text)) {
    return { minYears: 0, maxYears: 5 };
  }
  return { minYears: 2, maxYears: 8 };
}

function detectOccupation(text, categoryHint = '') {
  const s = `${text || ''} ${categoryHint || ''}`.toLowerCase();
  // '인재개발/사업개발' 등 복합어의 '개발'이 TECH로 새지 않도록 TECH 검사에만 마스킹 적용
  const techSrc = s.replace(/(사업|인재|조직|신사업|상품|경영|제품|브랜드|채널)\s*개발/g, '$1@@');

  if (NON_TARGET_FUNCTION_REGEX.test(s) || NON_CAREER_KEYWORDS.test(s)) {
    return 'OTHER';
  }
  // 1. HR (엄격: 일반 '채용' 공고 접미어가 아닌 실제 HR/노무/채용담당 직무만, CEO Staff는 PLANNING)
  if (
    /인사|노무|노사|평가보상|보상체계|피플\s*(파트너|애널리틱스|옵스)|조직문화|인재개발|채용담당|채용\s*(매니저|파트너|팀|운영|브랜딩|기획)|리크루터|\b(hr|er|hrbp|hrd|hrm|recruiter|recruiting|talent acquisition|compensation|people system)\b/.test(s) &&
    !/엔지니어|개발자|engineer|ceo\s*staff/.test(techSrc)
  ) {
    return 'HR';
  }
  // 2. 명확한 소프트웨어·데이터·보안 엔지니어링 우선 분기 (제목의 Growth/Finance에 밀리지 않도록)
  if (
    /(software\s*engineer|frontend|backend|fullstack|devops|sre|data\s*engineer|ml\s*engineer|research\s*engineer|security\s*engineer|network\s*engineer|qa\s*engineer|product\s*design\s*engineer|데이터\s*분석가|데이터\s*엔지니어|서버\s*개발|프론트엔드\s*개발|백엔드\s*개발|데이터베이스\s*엔지니어|보안운영|it\s*ai\s*엔지니어|sap\s*모듈)/i.test(techSrc)
  ) {
    return 'TECH';
  }
  // 3. FINANCE / ACCOUNTING / AUDIT / INVESTMENT
  if (
    /재무|회계|자금|예산|세무|\btax\b|감사|\baudit\b|finance|accounting|deals|\bm&a\b|\bcpa\b|가치평가|value-up|xbrl|계리|\bais\b|\bpe\b|준법감시|내부통제|내부회계|컴플라이언스|기금운용|투자운용|리스크|aml|fraud|\bir\b|수신상품|여신|계좌\s*도메인|이체\/출납|정산|신용보증/.test(s) &&
    !/엔지니어|engineer|개발자|백엔드|프론트엔드|devops|sre/.test(techSrc)
  ) {
    return 'FINANCE';
  }
  // 4. MARKETING / GROWTH / PR / BRAND
  if (
    /마케팅|홍보|브랜딩|브랜드\s*매니저|그로스|퍼포먼스|콘텐츠|미디어|\b(marketing|growth|pr|sns|crm|contents|devrel)\b|캠페인|광고\s*운영|소통/.test(s) &&
    !/백엔드|서버\s*개발|인프라|보안\s*엔지니어/.test(techSrc)
  ) {
    return 'MARKETING';
  }
  // 5. TECH (일반 IT/클라우드/보안/전산)
  if (
    /개발|엔지니어|프론트|백엔드|클라우드|보안|데이터\s*(사이언|분석)|전산|\b(tech|backend|frontend|fullstack|engineer|devops|infra|ml|ai|data|security|qa|ios|android|sap|ict|sw|sre)\b/.test(techSrc)
  ) {
    return 'TECH';
  }
  // 6. PLANNING / STRATEGY / PM / CONSULTING
  if (
    /전략|기획|컨설팅|컨설턴트|사업개발|신사업|\b(strategy|planning|pm|po|product\s*owner|product\s*operations|tpm|consultant|advisory|corp\.dev|ceo\s*staff)\b|상품전략|운영전략|프로덕트|esg|bx/.test(s)
  ) {
    return 'PLANNING';
  }
  return 'OTHER';
}

function sanitizePostings(jobs) {
  return jobs.filter(
    (j) =>
      j &&
      j.title &&
      j.jobUrl &&
      /^https:\/\//.test(j.jobUrl) &&
      !NON_CAREER_KEYWORDS.test(j.title) &&
      !NON_TARGET_FUNCTION_REGEX.test(j.title) &&
      ['TECH', 'FINANCE', 'MARKETING', 'PLANNING', 'HR'].includes(j.occupation)
  );
}

// 1. Crawl ALIO (기획재정부 공공기관 채용정보시스템)
async function crawlALIO() {
  console.log('Crawling ALIO (공공기관 채용정보)...');
  try {
    const url = 'https://job.alio.go.kr/recruit.do';
    const jobs = [];
    const seenIds = new Set();

    for (let pageNo = 1; pageNo <= 8 && jobs.length < 15; pageNo++) {
      const formData = new URLSearchParams();
      formData.append('pageNo', String(pageNo));

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerRadarUniversal/2.0',
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) break;
      const html = await res.text();
      const $ = cheerio.load(html);

      $('tr').each((i, el) => {
        const a = $(el).find('a[href*="recruitview.do"]');
        if (!a.length || jobs.length >= 15) return;

        const title = a.text().replace(/\s+/g, ' ').trim();
        const href = a.attr('href');
        const id = `alio-${href?.match(/idx=(\d+)/)?.[1] || `${pageNo}-${i}`}`;
        if (!href || seenIds.has(id)) return;

        const tds = $(el).find('td');
        const org = tds.eq(3).text().replace(/\s+/g, ' ').trim() || '공공기관';
        const region = tds.eq(4).text().replace(/\s+/g, ' ').trim() || '수도권';
        const empType = tds.eq(5).text().replace(/\s+/g, ' ').trim() || '정규직';

        if (NON_CAREER_KEYWORDS.test(title) || NON_CAREER_KEYWORDS.test(empType)) return;
        if (empType.includes('비정규직') && !empType.includes('인턴') && !title.includes('인턴')) return;

        let occ = detectOccupation(`${title} ${org}`);
        if (occ === 'OTHER' && /(청년인턴|체험형|일반직|행정|사무|공채|신입직원)/.test(title)) {
          occ = 'PLANNING';
        }
        if (occ === 'OTHER') return;

        seenIds.add(id);
        const isIntern = empType.includes('인턴') || title.includes('인턴');
        const isEntry = isIntern || empType.includes('신입') || title.includes('신입') || title.includes('공채');
        const isPermanent = !isIntern && !empType.includes('비정규직') && !empType.includes('계약');
        const isCapital = /(서울|경기|인천|수도권)/.test(region);

        jobs.push({
          id,
          company: org,
          title,
          canonicalRole:
            isIntern
              ? '청년인턴/행정지원'
              : occ === 'TECH'
              ? '공공 ICT/전산관리'
              : occ === 'FINANCE'
              ? '공공 재무/예산관리'
              : occ === 'HR'
              ? '공공 인사/노무행정'
              : occ === 'MARKETING'
              ? '공공 홍보/미디어'
              : '공공행정·경영기획',
          occupation: occ,
          industry: '공공기관 / 공기업',
          location: isCapital ? `${region} (수도권)` : `${region} (지방 본사/지사)`,
          commuteMinutes: region.includes('서울') ? 42 : isCapital ? 50 : 75,
          salaryMinManwon: isIntern ? 2500 : 4200,
          salaryMaxManwon: isIntern ? 2800 : 4800,
          salaryDisplay: isIntern ? '월 206~230만 원 (청년인턴 공시 처우)' : '4,200 ~ 4,800만 원 (ALIO 신입 초임 공시)',
          salaryTier: 'A',
          minYears: isEntry ? 0 : 2,
          maxYears: isEntry ? 2 : 6,
          hasFixedOT: false,
          fixedOTHours: 0,
          tags: Array.from(
            new Set([
              '공공기관',
              'ALIO 경영공시',
              ...(isPermanent ? ['정규직'] : []),
              empType,
              isEntry ? '신입/인턴' : '경력',
            ])
          ),
          pros: ['기획재정부 ALIO 100% 실공시 데이터', '고용 안정성 및 정시퇴근 보장'],
          gaps: ['공공기관 NCS 및 블라인드 채용 전형 준비 필요'],
          rawText: `[ALIO 공공기관 채용정보]\n기관명: ${org}\n공고명: ${title}\n고용형태: ${isPermanent ? `정규직 (${empType})` : empType}\n근무지: ${region}`,
          sourceName: '기획재정부 ALIO 공시망',
          jobUrl: href.startsWith('http') ? href : `https://job.alio.go.kr${href}`,
          sourceCategory: 'PUBLIC',
          isCompanyExclusive: true,
          sourceSystem: 'ALIO 오픈 공시망',
          isEntryLevel: isEntry,
          jobCategory: occ,
          publishedAt: new Date().toISOString().split('T')[0],
        });
      });
    }

    console.log(`ALIO: Crawled ${jobs.length} sanitized public jobs`);
    return jobs;
  } catch (err) {
    console.warn('ALIO crawler warning:', err.message);
    return [];
  }
}

// 2. Crawl PwC (삼일회계법인)
async function crawlPwC() {
  console.log('Crawling PwC...');
  try {
    const url = 'https://www.pwc.com/kr/ko/career/experienced.html';
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const jobs = [];
    const seen = new Set();
    $('a[href*="experienced/r"]').each((i, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      let href = $(el).attr('href');
      if (!title || !href || jobs.length >= 10) return;
      if (NON_CAREER_KEYWORDS.test(title)) return;

      if (!href.startsWith('http')) {
        href = `https://www.pwc.com${href.startsWith('/') ? href : '/' + href}`;
      }
      const id = `pwc-${href.match(/r\d+(-\d+)?/)?.[0] || i}`;
      if (seen.has(id)) return;

      const occ = detectOccupation(title);
      if (occ === 'OTHER') return;
      seen.add(id);

      const isIntern = /인턴|intern|\bra\b|research assistant/i.test(title);
      const isContract = title.includes('계약직');
      const isEntry = isIntern || title.includes('신입');

      jobs.push({
        id,
        company: '삼일PwC',
        title,
        canonicalRole:
          occ === 'HR'
            ? 'HR Strategy & People'
            : occ === 'TECH'
            ? 'Data/Tech Consultant'
            : occ === 'FINANCE'
            ? 'Corporate Finance & Deals'
            : occ === 'MARKETING'
            ? 'Brand & Communications'
            : 'Management Consulting',
        occupation: occ,
        industry: '전문서비스 / 회계컨설팅',
        location: '서울 용산구 (삼일PwC 본사)',
        commuteMinutes: 45,
        salaryMinManwon: isIntern ? 2700 : isEntry ? 4600 : 6200,
        salaryMaxManwon: isIntern ? 3100 : isEntry ? 5400 : 8500,
        salaryDisplay: isIntern
          ? '월 220~250만 원 (학부/RA 인턴십)'
          : isEntry
          ? '4,600 ~ 5,400만 원 (Big4 대졸 초임)'
          : '6,200 ~ 8,500만 원 (경력 처우)',
        salaryTier: 'B',
        minYears: isEntry ? 0 : 3,
        maxYears: isEntry ? 2 : 10,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: Array.from(
          new Set([
            'Big4 회계법인',
            isIntern ? '인턴' : isContract ? '계약직' : '정규직',
            ...(isEntry ? ['신입/인턴'] : ['경력']),
            '수시채용',
          ])
        ),
        pros: ['국내 1위 회계법인 삼일PwC의 전문성과 네트워크', '다양한 글로벌 프로젝트 경험'],
        gaps: [isEntry ? '기초 직무 지식 및 영어 커뮤니케이션' : '요구 스킬셋 부합 여부 확인 필요'],
        rawText: `[삼일PwC ${isIntern ? '인턴십' : isContract ? '계약직 채용' : '정규직 수시채용'}]\n${title}\n상세 직무 및 지원은 삼일PwC 공식 채용관 원문 참조.`,
        sourceName: '삼일PwC 공식 채용관',
        jobUrl: href,
        sourceCategory: 'CONSULTING',
        isCompanyExclusive: true,
        sourceSystem: 'PwC Global ATS',
        isEntryLevel: isEntry,
        jobCategory: occ,
        publishedAt: new Date().toISOString().split('T')[0],
      });
    });
    console.log(`PwC: Crawled ${jobs.length} sanitized jobs`);
    return jobs;
  } catch (err) {
    console.warn('PwC crawler warning:', err.message);
    return [];
  }
}

// 3. Crawl Deloitte (딜로이트 안진/컨설팅)
async function crawlDeloitte() {
  console.log('Crawling Deloitte...');
  try {
    const url = 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitList.aspx';
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const jobs = [];
    const seen = new Set();
    $('a.subject').each((i, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href');
      if (!title || !href || !href.includes('ridx=') || jobs.length >= 10) return;
      if (NON_CAREER_KEYWORDS.test(title)) return;

      const id = `deloitte-${href.match(/ridx=(\d+)/)?.[1] || i}`;
      if (seen.has(id)) return;
      const occ = detectOccupation(title);
      if (occ === 'OTHER') return;
      seen.add(id);

      const isIntern = /인턴|intern|\bra\b|research assistant/i.test(title);
      const isContract = title.includes('계약직');
      const isBothEntryAndExp = title.includes('신입') && title.includes('경력');
      const isEntry = isIntern || title.includes('신입');

      jobs.push({
        id,
        company: '딜로이트 안진',
        title,
        canonicalRole:
          occ === 'FINANCE'
            ? 'Tax & Financial Advisory'
            : occ === 'TECH'
            ? 'Cloud & AI Advisory'
            : occ === 'HR'
            ? 'Human Capital Consulting'
            : occ === 'MARKETING'
            ? 'Brand & PR'
            : 'Management Consulting',
        occupation: occ,
        industry: '전문서비스 / 회계컨설팅',
        location: '서울 영등포구 여의도동',
        commuteMinutes: 48,
        salaryMinManwon: isIntern ? 2700 : isEntry ? 4600 : 6500,
        salaryMaxManwon: isIntern ? 3100 : isBothEntryAndExp ? 7500 : isEntry ? 5300 : 8800,
        salaryDisplay: isIntern
          ? '월 230~250만 원 (인턴 처우)'
          : isBothEntryAndExp
          ? '4,600 ~ 7,500만 원 (신입/경력 협의)'
          : isEntry
          ? '4,600 ~ 5,300만 원 (신입 대졸초임)'
          : '6,500 ~ 8,800만 원 (경력직)',
        salaryTier: 'B',
        minYears: isEntry ? 0 : 3,
        maxYears: isBothEntryAndExp ? 7 : isEntry ? 2 : 10,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: Array.from(
          new Set([
            'Big4 회계법인',
            isIntern ? '인턴' : isContract ? '계약직(전환형)' : '정규직',
            ...(isEntry && !isIntern ? ['신입'] : []),
            '여의도',
          ])
        ),
        pros: ['글로벌 빅4 회계법인 커리어', '체계적인 주니어/시니어 교육 프로그램'],
        gaps: [isEntry ? '논리적 사고 및 프레젠테이션 역량' : '직무별 상세 요건 확인 필요'],
        rawText: `[딜로이트 안진 ${isIntern ? '인턴' : isContract ? '전환형 계약직' : '정규직'} 채용]\n${title}\n상세 직무 내용 및 우대사항은 공고 원문 참조.`,
        sourceName: '딜로이트 공식 채용 (WiseRecruit2)',
        jobUrl: `https://join.deloitte.co.kr/WiseRecruit2/User/${href}`,
        sourceCategory: 'CONSULTING',
        isCompanyExclusive: true,
        sourceSystem: 'WiseRecruit2 ATS',
        isEntryLevel: isEntry,
        jobCategory: occ,
        publishedAt: new Date().toISOString().split('T')[0],
      });
    });
    console.log(`Deloitte: Crawled ${jobs.length} sanitized jobs`);
    return jobs;
  } catch (err) {
    console.warn('Deloitte crawler warning:', err.message);
    return [];
  }
}

// 4. Crawl Toss & Affiliates (토스 · 토스뱅크 · 토스증권 · 토스페이먼츠)
async function crawlToss() {
  console.log('Crawling Toss Careers API...');
  try {
    const res = await fetch('https://api-public.toss.im/api/v3/ipd-eggnog/career/jobs', {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json?.success || [];

    const CAT_MAP = {
      TECH: new Set(['Backend', 'Frontend', 'App', 'ML', 'Data Engineering', 'Data Analysis', 'Infra', 'Information Security', 'Security Engineering', 'QA']),
      FINANCE: new Set(['Finance', 'Accounting', 'Risk', 'AML', 'Compliance', 'Securities', 'Bank', 'Insurance']),
      MARKETING: new Set(['Marketing', 'PR', 'Contents']),
      PLANNING: new Set(['Product Ownership', 'Strategy', 'IT Planning', 'Product Operations', 'Corp.dev']),
      HR: new Set(['HR', 'Recruiting', 'Compensation & Benefit', 'People System']),
    };

    const pickedByOcc = { TECH: [], FINANCE: [], MARKETING: [], PLANNING: [], HR: [] };
    for (const item of list) {
      if (!item?.id || !item?.title || NON_CAREER_KEYWORDS.test(item.title) || NON_TARGET_FUNCTION_REGEX.test(item.title)) continue;
      const meta = {};
      for (const m of item.metadata || []) meta[m.name] = m.value;
      const empType = meta['Employment_Type'] || '정규직';
      if (/계약직|비정규|단기/.test(empType)) continue;
      const cat = meta['커리어 페이지 노출 Job Category 값을 선택해주세요'] || '';
      if (cat === '병역특례' || cat === 'Sales' || cat === 'Sales Support' || cat === 'Customer Support' || cat === 'GA') continue;

      let occ = detectOccupation(item.title, cat);
      if (occ === 'OTHER') {
        for (const [k, set] of Object.entries(CAT_MAP)) {
          if (set.has(cat)) { occ = k; break; }
        }
      }
      if (occ === 'OTHER' || pickedByOcc[occ].length >= 5) continue;

      // 우선 한국어 공고 + 다양한 자회사/포지션 포함
      const subsidiary = meta['포지션의 소속 자회사를 선택해 주세요.'] || item.company_name || '토스 (비바리퍼블리카)';
      pickedByOcc[occ].push({ item, empType, cat, subsidiary, occ });
    }

    const candidates = Object.values(pickedByOcc).flat();
    const results = await Promise.allSettled(
      candidates.map(async ({ item, empType, cat, subsidiary, occ }) => {
        let plainText = `[${subsidiary}] ${item.title} (${cat || occ})`;
        try {
          const detRes = await fetch(`https://api-public.toss.im/api/v3/ipd-eggnog/career/jobs/${item.id}`, {
            signal: AbortSignal.timeout(8000),
          });
          if (detRes.ok) {
            const detJson = await detRes.json();
            const parsed = stripHtml(detJson?.success?.content || '');
            if (parsed.length > 40) plainText = parsed.slice(0, 1200);
          }
        } catch {}

        const isIntern = /인턴|intern|어시스턴트/i.test(`${item.title} ${empType}`);
        const isEntry = isIntern || /신입|주니어|경력\s*무관|연차\s*무관/i.test(`${item.title} ${plainText}`);
        const yrs = extractYearsFromText(`${item.title}\n${plainText}`, isEntry);

        return {
          id: `toss-${item.id}`,
          company: subsidiary,
          title: item.title,
          canonicalRole: cat || occ,
          occupation: occ,
          industry: 'IT / 핀테크·금융',
          location: '서울 강남구 테헤란로 (역삼)',
          commuteMinutes: 48,
          salaryMinManwon: isIntern ? 3000 : isEntry ? 5200 : 7000,
          salaryMaxManwon: isIntern ? 3600 : isEntry ? 7000 : 11000,
          salaryDisplay: isIntern
            ? '월 250~300만 원 (토스 커뮤니티 인턴십)'
            : isEntry
            ? '5,200 ~ 7,000만 원 (주니어/신입 협의)'
            : '7,000 ~ 11,000만 원 (직전 보상 + 사이닝/스톡 협의)',
          salaryTier: 'A',
          minYears: yrs.minYears,
          maxYears: yrs.maxYears,
          hasFixedOT: false,
          fixedOTHours: 0,
          tags: Array.from(
            new Set([
              '핀테크/유니콘',
              empType,
              cat || occ,
              ...(isEntry ? ['신입/주니어'] : ['경력']),
            ])
          ),
          pros: ['토스 커뮤니티 수평 문화와 빠른 제품 의사결정', '비포괄임금 및 경쟁력 있는 총보상'],
          gaps: ['직무별 실무 과제 및 문화적합성(Culture Fit) 인터뷰 준비 필요'],
          rawText: plainText,
          sourceName: '토스 공식 채용관',
          jobUrl: `https://toss.im/career/job-detail?job_id=${item.id}`,
          sourceCategory: 'GLOBAL_TECH',
          isCompanyExclusive: true,
          sourceSystem: 'Toss Greenhouse ATS',
          isEntryLevel: isEntry,
          jobCategory: occ,
          publishedAt: (item.updated_at || new Date().toISOString()).split('T')[0],
        };
      })
    );

    const jobs = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    console.log(`Toss: Crawled ${jobs.length} sanitized real jobs`);
    return jobs;
  } catch (err) {
    console.warn('Toss crawler warning:', err.message);
    return [];
  }
}

// 5. Crawl Daangn (당근 Greenhouse API)
async function crawlDaangn() {
  console.log('Crawling Daangn Greenhouse API...');
  try {
    const res = await fetch('https://boards-api.greenhouse.io/v1/boards/daangn/jobs?content=true', {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json?.jobs || [];

    const jobs = [];
    const byOcc = { TECH: 0, FINANCE: 0, MARKETING: 0, PLANNING: 0, HR: 0 };

    for (const item of list) {
      if (!item?.id || !item?.title) continue;
      if (NON_CAREER_KEYWORDS.test(item.title) || NON_TARGET_FUNCTION_REGEX.test(item.title)) continue;
      if (/계약직|단기/.test(item.title)) continue;

      const occ = detectOccupation(item.title);
      if (occ === 'OTHER' || byOcc[occ] >= 4) continue;
      byOcc[occ]++;

      const plainText = stripHtml(item.content || '').slice(0, 1200);
      const isIntern = /인턴|intern/i.test(item.title);
      const isEntry = isIntern || /신입|주니어|경력\s*무관/i.test(`${item.title} ${plainText}`);
      const yrs = extractYearsFromText(`${item.title}\n${plainText}`, isEntry);

      jobs.push({
        id: `daangn-${item.id}`,
        company: '당근 (당근마켓)',
        title: item.title,
        canonicalRole: item.title.split(' - ')[0].trim(),
        occupation: occ,
        industry: 'IT / 커뮤니티 플랫폼',
        location: '서울 서초구 강남대로 (강남역)',
        commuteMinutes: 44,
        salaryMinManwon: isIntern ? 2800 : isEntry ? 5000 : 6500,
        salaryMaxManwon: isIntern ? 3200 : isEntry ? 6500 : 9500,
        salaryDisplay: isIntern ? '월 230~260만 원 (당근 인턴)' : '6,000 ~ 9,500만 원 (유니콘 오퍼 협의)',
        salaryTier: 'B',
        minYears: yrs.minYears,
        maxYears: yrs.maxYears,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: Array.from(new Set(['유니콘', '정규직', isIntern ? '인턴' : isEntry ? '신입/주니어' : '경력'])),
        pros: ['3,500만+ MAU 로컬 커뮤니티 프로덕트 경험', '높은 업무 자율성과 비포괄임금 운영'],
        gaps: ['실무 중심 직무 인터뷰 및 프로덕트 데이터 감각 요구'],
        rawText: plainText || `[당근 채용]\n${item.title}`,
        sourceName: '당근 공식 채용관',
        jobUrl: `https://careers.daangn.com/jobs/role/${item.id}/`,
        sourceCategory: 'GLOBAL_TECH',
        isCompanyExclusive: true,
        sourceSystem: 'Greenhouse ATS',
        isEntryLevel: isEntry,
        jobCategory: occ,
        publishedAt: (item.updated_at || new Date().toISOString()).split('T')[0],
      });
    }
    console.log(`Daangn: Crawled ${jobs.length} sanitized real jobs`);
    return jobs;
  } catch (err) {
    console.warn('Daangn crawler warning:', err.message);
    return [];
  }
}

// 6. Crawl Woowahan (우아한형제들 공식 API)
async function crawlWoowahan() {
  console.log('Crawling Woowahan (배민) API...');
  try {
    const res = await fetch('https://career.woowahan.com/w1/recruits?size=60', {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json?.data?.list || [];

    const jobs = [];
    const byOcc = { TECH: 0, FINANCE: 0, MARKETING: 0, PLANNING: 0, HR: 0 };

    for (const item of list) {
      if (!item?.recruitNumber || !item?.recruitName) continue;
      // BA002001 = 정규직 확정 포지션
      if (item.employmentType?.recruitItemCode !== 'BA002001') continue;
      if (NON_CAREER_KEYWORDS.test(item.recruitName) || NON_TARGET_FUNCTION_REGEX.test(item.recruitName)) continue;

      const occ = detectOccupation(item.recruitName);
      if (occ === 'OTHER' || byOcc[occ] >= 4) continue;
      byOcc[occ]++;

      const minY = typeof item.careerRestrictionMinYears === 'number' && item.careerRestrictionMinYears >= 0 ? item.careerRestrictionMinYears : 2;
      const maxY = typeof item.careerRestrictionMaxYears === 'number' && item.careerRestrictionMaxYears >= minY ? Math.min(20, item.careerRestrictionMaxYears) : Math.max(minY + 5, 10);
      const isEntry = minY === 0 || /신입|주니어/i.test(item.recruitName);
      const plainText = stripHtml(item.recruitContents || '').slice(0, 1200);

      jobs.push({
        id: `woowahan-${item.recruitNumber}`,
        company: '우아한형제들 (배달의민족)',
        title: item.recruitName,
        canonicalRole: item.recruitName,
        occupation: occ,
        industry: 'IT / 이커머스 플랫폼',
        location: '서울 송파구 올림픽로 (잠실)',
        commuteMinutes: 52,
        salaryMinManwon: isEntry ? 4800 : 6500,
        salaryMaxManwon: isEntry ? 6500 : 9500,
        salaryDisplay: `${isEntry ? '4,800 ~ 6,500' : '6,500 ~ 9,500'}만 원 (주 35h/비포괄 기준 협의)`,
        salaryTier: 'B',
        minYears: minY,
        maxYears: maxY,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: Array.from(new Set(['플랫폼', '정규직', isEntry ? '신입/주니어' : `경력 ${minY}년+`])),
        pros: ['주 35시간 유연근무제 및 비포괄임금', '대규모 커머스·배달 트래픽/운영 환경'],
        gaps: ['서류 및 1~2차 실무 심층 인터뷰 대비 필요'],
        rawText: plainText || `[우아한형제들 정규직 채용]\n${item.recruitName}`,
        sourceName: '우아한형제들 채용관',
        jobUrl: `https://career.woowahan.com/recruitment/${item.recruitNumber}/detail`,
        sourceCategory: 'GLOBAL_TECH',
        isCompanyExclusive: true,
        sourceSystem: 'Woowahan ATS',
        isEntryLevel: isEntry,
        jobCategory: occ,
        publishedAt: (item.updateDate || new Date().toISOString()).split('T')[0],
      });
    }
    console.log(`Woowahan: Crawled ${jobs.length} sanitized real jobs`);
    return jobs;
  } catch (err) {
    console.warn('Woowahan crawler warning:', err.message);
    return [];
  }
}

// 7. Crawl Kakao & Affiliates (카카오 공동체 공식 API)
async function crawlKakao() {
  console.log('Crawling Kakao Careers API...');
  try {
    const endpoints = [
      'https://careers.kakao.com/public/api/job-list?part=STAFF&company=ALL&page=1',
      'https://careers.kakao.com/public/api/job-list?part=TECHNOLOGY&company=ALL&page=1',
      'https://careers.kakao.com/public/api/job-list?part=TECHNOLOGY&company=ALL&page=2',
    ];
    const responses = await Promise.all(
      endpoints.map((u) => fetch(u, { signal: AbortSignal.timeout(10000) }).then((r) => (r.ok ? r.json() : { jobList: [] })).catch(() => ({ jobList: [] })))
    );
    const list = responses.flatMap((r) => r?.jobList || []);

    const jobs = [];
    const seen = new Set();
    const byOcc = { TECH: 0, FINANCE: 0, MARKETING: 0, PLANNING: 0, HR: 0 };

    for (const item of list) {
      if (!item?.realId || !item?.jobOfferTitle || seen.has(item.realId)) continue;
      if (NON_CAREER_KEYWORDS.test(item.jobOfferTitle) || NON_TARGET_FUNCTION_REGEX.test(item.jobOfferTitle)) continue;
      if (/계약직/.test(item.employeeTypeName || '') || /계약직/.test(item.jobOfferTitle)) continue;

      const occ = detectOccupation(item.jobOfferTitle, item.jobTypeName);
      if (occ === 'OTHER' || byOcc[occ] >= 4) continue;
      seen.add(item.realId);
      byOcc[occ]++;

      const loc = item.locationName || '경기 성남시 분당구 (판교)';
      const isIntern = (item.employeeTypeName || '').includes('인턴') || item.jobOfferTitle.includes('인턴');
      const isEntry = isIntern || /신입/.test(item.jobOfferTitle);
      const rawDesc = stripHtml(`${item.workContentDesc || ''}\n${item.qualification || ''}`).slice(0, 1200);
      const yrs = extractYearsFromText(`${item.jobOfferTitle}\n${rawDesc}`, isEntry);

      jobs.push({
        id: `kakao-${item.realId}`,
        company: item.companyName || '카카오',
        title: item.jobOfferTitle,
        canonicalRole: item.jobTypeName || occ,
        occupation: occ,
        industry: 'IT / 플랫폼·핀테크',
        location: loc,
        commuteMinutes: /판교|성남|분당/.test(loc) ? 38 : 48,
        salaryMinManwon: isIntern ? 2700 : isEntry ? 5000 : 6500,
        salaryMaxManwon: isIntern ? 3100 : isEntry ? 6500 : 10000,
        salaryDisplay: isIntern ? '월 220~260만 원 (인턴십)' : isEntry ? '5,000 ~ 6,500만 원 (신입/주니어)' : '6,500 ~ 10,000만 원 (경력직 협의)',
        salaryTier: 'A',
        minYears: yrs.minYears,
        maxYears: yrs.maxYears,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: Array.from(
          new Set([
            '대기업/빅테크',
            item.employeeTypeName || '정규직',
            ...(isEntry ? ['신입/인턴'] : ['경력']),
            ...(item.skillSetList || []).map((s) => s.skillName).filter(Boolean).slice(0, 3),
          ])
        ),
        pros: [`${item.companyName || '카카오'} 공동체 대규모 서비스 및 복리후생`, '유연근무 및 명확한 직무 전문성'],
        gaps: ['공고 내 지원자격 및 우대기술(Stack) 부합 여부 확인 필요'],
        rawText: rawDesc || `[${item.companyName || '카카오'} 채용]\n${item.jobOfferTitle}`,
        sourceName: '카카오 영입 공식 포털',
        jobUrl: `https://careers.kakao.com/jobs/${item.realId}`,
        sourceCategory: 'CONGLOMERATE',
        isCompanyExclusive: true,
        sourceSystem: 'Kakao Careers API',
        isEntryLevel: isEntry,
        jobCategory: occ,
        publishedAt: (item.regDate || item.uptDate || new Date().toISOString()).split('T')[0].replace(/T.*/, ''),
      });
    }
    console.log(`Kakao: Crawled ${jobs.length} sanitized real jobs`);
    return jobs;
  } catch (err) {
    console.warn('Kakao crawler warning:', err.message);
    return [];
  }
}

async function syncToSupabase(jobs) {
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    console.log('No Supabase credentials found. Skipping DB sync. (Using local JSON only)');
    return;
  }

  try {
    console.log(`Syncing ${jobs.length} jobs to Supabase...`);
    const res = await fetch(`${supabaseUrl}/rest/v1/jobs?on_conflict=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(jobs),
    });

    if (!res.ok) {
      throw new Error(`Supabase Sync Failed: ${res.status} ${await res.text()}`);
    }
    console.log('Successfully synced all jobs to Supabase!');
  } catch (err) {
    console.error('Supabase sync error:', err.message);
  }
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'public', 'data');
  const cachePath = path.join(dataPath, 'jobs.json');
  const mobileDataPath = path.join(__dirname, '..', 'mobile', 'assets', 'data');
  const mobileCachePath = path.join(mobileDataPath, 'jobs.json');

  const batches = await Promise.all([
    crawlALIO(),
    crawlPwC(),
    crawlDeloitte(),
    crawlToss(),
    crawlDaangn(),
    crawlWoowahan(),
    crawlKakao(),
  ]);

  let liveJobs = sanitizePostings(batches.flat());

  // 전체 라이브 수집이 네트워크 장애 등으로 0건인 경우에만 기존 실수집 캐시 보존 (가상 시드 생성 금지)
  if (liveJobs.length === 0 && fs.existsSync(cachePath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      liveJobs = sanitizePostings(
        prev.filter((j) => !j.tags?.includes('큐레이션 샘플(실시간 공고 아님)'))
      );
      console.warn(`All live crawlers returned 0. Preserved ${liveJobs.length} previous live jobs.`);
    } catch {}
  }

  const seen = new Set();
  const allJobs = [];
  for (const job of liveJobs) {
    if (!seen.has(job.id)) {
      seen.add(job.id);
      allJobs.push(job);
    }
  }

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
  fs.writeFileSync(cachePath, JSON.stringify(allJobs, null, 2), 'utf-8');
  console.log(`Saved total ${allJobs.length} sanitized LIVE jobs to public/data/jobs.json`);

  if (fs.existsSync(mobileDataPath)) {
    fs.writeFileSync(mobileCachePath, JSON.stringify(allJobs, null, 2), 'utf-8');
  }

  await syncToSupabase(allJobs);
}

main().catch(console.error);
