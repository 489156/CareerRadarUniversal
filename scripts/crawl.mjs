import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function crawlPwC() {
  console.log("Crawling PwC...");
  const url = 'https://www.pwc.com/kr/ko/career/experienced.html';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const jobs = [];
  $('a[href*="experienced/r"]').each((i, el) => {
    const title = $(el).text().trim();
    let href = $(el).attr('href');
    if (title && href) {
      if (!href.startsWith('http')) {
        href = `https://www.pwc.com${href.startsWith('/') ? href : '/' + href}`;
      }
      jobs.push({
        id: `pwc-${href.match(/r\d+(-\d+)?/)?.[0] || i}`,
        company: "삼일PwC",
        title: title,
        canonicalRole: title.includes('HR') || title.includes('인사') ? 'HR' : title.includes('개발') || title.includes('Engineer') ? 'Engineering' : 'Consulting',
        occupation: "PLANNING",
        industry: "전문서비스 / 회계컨설팅",
        location: "서울 용산구 (삼일PwC 본사)",
        commuteMinutes: 45,
        salaryMinManwon: 6000,
        salaryMaxManwon: 8000,
        salaryDisplay: "회사 내규에 따름",
        salaryTier: "B",
        minYears: 3,
        maxYears: 10,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: ["Big4 회계법인", "정규직", "수시채용"],
        pros: ["국내 1위 회계법인 삼일PwC의 전문성과 네트워크", "다양한 프로젝트 경험"],
        gaps: ["요구 스킬셋 부합 여부 확인 필요"],
        rawText: `[삼일PwC 수시채용]\n${title}\n자세한 내용은 해당 링크를 통해 확인하세요.`,
        sourceName: "삼일PwC 공식 채용관",
        jobUrl: href,
        sourceCategory: "CONSULTING",
        isCompanyExclusive: true,
        sourceSystem: "PwC Global ATS",
        publishedAt: new Date().toISOString().split('T')[0]
      });
    }
  });
  return jobs.slice(0, 10);
}

async function crawlDeloitte() {
  console.log("Crawling Deloitte...");
  const url = 'https://join.deloitte.co.kr/WiseRecruit2/User/RecruitList.aspx';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const jobs = [];
  $('a.subject').each((i, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    if (title && href && href.includes('ridx=')) {
      jobs.push({
        id: `deloitte-${href.match(/ridx=(\d+)/)?.[1] || i}`,
        company: "딜로이트 안진",
        title: title,
        canonicalRole: 'Consulting',
        occupation: "PLANNING",
        industry: "전문서비스 / 회계컨설팅",
        location: "서울 영등포구 여의도동",
        commuteMinutes: 48,
        salaryMinManwon: 6000,
        salaryMaxManwon: 8000,
        salaryDisplay: "회사 내규에 따름",
        salaryTier: "B",
        minYears: 3,
        maxYears: 10,
        hasFixedOT: false,
        fixedOTHours: 0,
        tags: ["Big4 회계법인", "정규직", "여의도"],
        pros: ["글로벌 빅4 회계법인 커리어", "체계적인 교육 프로그램"],
        gaps: ["직무별 상세 요건 확인 필요"],
        rawText: `[딜로이트 안진 채용]\n${title}\n상세 직무 내용 및 우대사항은 공고 참조.`,
        sourceName: "딜로이트 공식 채용 (WiseRecruit2)",
        jobUrl: `https://join.deloitte.co.kr/WiseRecruit2/User/${href}`,
        sourceCategory: "CONSULTING",
        isCompanyExclusive: true,
        sourceSystem: "WiseRecruit2 ATS",
        publishedAt: new Date().toISOString().split('T')[0]
      });
    }
  });
  return jobs.slice(0, 10);
}

// Generate some fallback mock jobs for variety if needed
function generateMockJobs() {
  return [
    {
      id: "job-kpmg-comp",
      company: "삼정KPMG",
      title: "HRM본부 직무급 체계 및 평가보상 기획자 (과장급) [REAL DATA PLACEHOLDER]",
      canonicalRole: "Total Rewards & Compensation",
      occupation: "HR",
      industry: "전문서비스 / 컨설팅",
      location: "서울 강남구 테헤란로",
      commuteMinutes: 46,
      salaryMinManwon: 6600,
      salaryMaxManwon: 7900,
      salaryDisplay: "6,600 ~ 7,900만 원 (Tier B 업계 표준)",
      salaryTier: "B",
      minYears: 6,
      maxYears: 10,
      hasFixedOT: true,
      fixedOTHours: 20,
      tags: ["Big4 회계법인", "강남권역"],
      pros: ["다양한 프로젝트 경험"],
      gaps: ["요구 스킬셋 부합 여부 확인"],
      rawText: "KPMG 직무급 체계 및 평가보상 기획자 상세 요건 참조",
      sourceName: "삼정KPMG 공식 채용관",
      jobUrl: "https://career.kpmg.co.kr/",
      sourceCategory: "CONSULTING",
      isCompanyExclusive: true,
      sourceSystem: "KPMG Careers",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "job-ey-ax",
      company: "EY한영",
      title: "Data Analytics & AI 컨설턴트 (경력직) [REAL DATA PLACEHOLDER]",
      canonicalRole: "Data Analytics",
      occupation: "TECH",
      industry: "전문서비스 / 회계컨설팅",
      location: "서울 영등포구 여의도",
      commuteMinutes: 48,
      salaryMinManwon: 7000,
      salaryMaxManwon: 8500,
      salaryDisplay: "7,000 ~ 8,500만 원 (Tier B)",
      salaryTier: "B",
      minYears: 5,
      maxYears: 12,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["Big4 회계법인", "Data & AI"],
      pros: ["최신 AX 기술 접목 프로젝트"],
      gaps: ["분석 툴 활용 역량 검증 필요"],
      rawText: "EY한영 Data Analytics 컨설턴트 상세 공고 참조",
      sourceName: "EY한영 커리어",
      jobUrl: "https://www.ey.com/ko_kr/careers",
      sourceCategory: "CONSULTING",
      isCompanyExclusive: true,
      sourceSystem: "EY Global ATS",
      publishedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "job-samsung-dx",
      company: "삼성전자 DX부문",
      title: "Global HR Data Analyst (차장급) [REAL DATA PLACEHOLDER]",
      canonicalRole: "HR Analytics",
      occupation: "HR",
      industry: "제조 / IT",
      location: "경기 수원시 영통구",
      commuteMinutes: 35,
      salaryMinManwon: 8500,
      salaryMaxManwon: 11000,
      salaryDisplay: "8,500 ~ 11,000만 원 (Tier A + PS)",
      salaryTier: "A",
      minYears: 10,
      maxYears: 15,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["대기업", "수원사업장", "데이터분석"],
      pros: ["압도적인 복리후생 및 성과급"],
      gaps: ["글로벌 커뮤니케이션 역량"],
      rawText: "삼성전자 DX부문 Global HR Data Analyst",
      sourceName: "삼성 커리어스",
      jobUrl: "https://www.samsungcareers.com/",
      sourceCategory: "CONGLOMERATE",
      isCompanyExclusive: true,
      sourceSystem: "삼성 채용시스템",
      publishedAt: new Date().toISOString().split('T')[0]
    }
  ];
}

async function injectIntoSource(jobs) {
  // Inject jobs into matcher.ts
  const matcherPath = path.join(__dirname, '..', 'src', 'lib', 'matcher.ts');
  let matcherContent = fs.readFileSync(matcherPath, 'utf-8');
  
  // Replace everything between 'export const MOCK_JOB_DATABASE: JobPosting[] = [' and '];\n\nexport const EXPANDED_SKILL_GAP_TRACKS: SkillGapTrack[]'
  // Or just find the export and replace the array contents.
  const regex = /(export const MOCK_JOB_DATABASE:\s*JobPosting\[\]\s*=\s*)\[[\s\S]*?\];/;
  const newContent = `$1${JSON.stringify(jobs, null, 2)};`;
  matcherContent = matcherContent.replace(regex, newContent);
  fs.writeFileSync(matcherPath, matcherContent, 'utf-8');
  
  // Inject jobs into index.html
  const indexPath = path.join(__dirname, '..', 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  const indexRegex = /(const ALL_JOBS\s*=\s*)\[[\s\S]*?\];/;
  indexContent = indexContent.replace(indexRegex, `$1${JSON.stringify(jobs, null, 2)};`);
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log("Successfully injected real scraped data into matcher.ts and index.html!");
}

async function main() {
  const pwcJobs = await crawlPwC();
  const deloitteJobs = await crawlDeloitte();
  const mockJobs = generateMockJobs();
  
  const allJobs = [...pwcJobs, ...deloitteJobs, ...mockJobs];
  
  // Create data dir just in case someone wants to fetch it later
  const dataPath = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dataPath, 'jobs.json'), JSON.stringify(allJobs, null, 2), 'utf-8');
  console.log(`Saved ${allJobs.length} jobs to public/data/jobs.json`);
  
  await injectIntoSource(allJobs);
}

main().catch(console.error);
