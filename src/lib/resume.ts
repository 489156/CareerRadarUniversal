import { detectDomainFromKeywords } from "./matcher";

export type ResumeOccupation = "HR" | "TECH" | "FINANCE" | "MARKETING" | "PLANNING";

export interface ParsedResume {
  occupation: ResumeOccupation;
  domainName: string;
  canonicalRole: string;
  skills: string[];
  totalYears: number;
  track: "ENTRY" | "EXPERIENCED";
  yearsSource: "explicit" | "date-range" | "entry-keyword" | "unknown";
  /** false면 어느 직군 키워드도 못 찾아 PLANNING으로 폴백한 것 (UI에서 사용자 확인 필요) */
  domainMatched: boolean;
}

const DEFAULT_ROLE: Record<ResumeOccupation, string> = {
  TECH: "소프트웨어 엔지니어 & 데이터/AI",
  FINANCE: "재무·회계 & Deal Advisory",
  MARKETING: "그로스 & 퍼포먼스 마케팅",
  HR: "인사기획 & People Operations",
  PLANNING: "경영전략 & 사업/서비스 기획",
};

const SKILLS = [
  "React", "TypeScript", "JavaScript", "Next.js", "Java", "Spring", "Kafka", "Python", "SQL", "AWS", "Cloud", "Kubernetes", "Docker",
  "KICPA", "CPA", "AICPA", "CFA", "재무제표", "세무", "회계", "가치평가", "M&A", "자금", "내부회계", "IFRS",
  "퍼포먼스 마케팅", "그로스마케팅", "GA4", "브랜딩", "콘텐츠", "CRM", "SEO",
  "인사기획", "평가보상", "노무관리", "채용", "People Analytics", "조직문화", "HRBP", "노사관계",
  "경영기획", "전략기획", "사업개발", "PM", "PO", "서비스기획", "컨설팅", "신사업",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSkill(text: string, skill: string): boolean {
  // 영문/약어(PM, SEO, CPA, Java 등)가 development, seoul 등에 부분일치하지 않도록 경계 검사
  if (/^[a-z0-9.&+-]+$/i.test(skill)) {
    const re = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(skill)}(?=$|[^a-z0-9])`, "i");
    return re.test(text);
  }
  return text.toLowerCase().includes(skill.toLowerCase());
}

// 직군별 키워드. '사업개발/인재개발' 같은 복합어의 '개발'이 TECH로 새지 않도록 TECH 판정 시 마스킹한다.
const MASK = /(사업|인재|조직|신사업|상품|경영|제품)\s*개발/g;
const DOMAIN_PATTERNS: Record<ResumeOccupation, RegExp> = {
  TECH: /개발자|개발|엔지니어|프론트|백엔드|풀스택|소프트웨어|머신러닝|인공지능|클라우드|전산|데이터\s*(?:사이언|엔지니어)|\b(react|typescript|javascript|next\.js|java|spring|kafka|python|docker|kubernetes|aws|devops|frontend|backend|sql|api|llm)\b/gi,
  FINANCE: /회계|세무|재무|감사|자금|가치평가|계리|증권|여신|공시|기금운용|\b(cpa|kicpa|cfa|m&a|ifrs|valuation|deals?|tax|fp&a)\b/gi,
  MARKETING: /마케팅|마케터|그로스|퍼포먼스|브랜딩|광고|콘텐츠|홍보|캠페인|\b(marketing|marketer|ga4|crm|seo|sns)\b/gi,
  HR: /인사|피플|채용|노무|노사|조직문화|평가보상|인재개발|임금피크|\b(hr|hrbp|hrd|hrm|people analytics|er)\b/gi,
  PLANNING: /기획|전략|컨설팅|사업개발|신사업|\b(pm|po|strategy|planning|consulting)\b/gi,
};

export function detectResumeDomain(text: string): { occupation: ResumeOccupation; matched: boolean } {
  const masked = text.replace(MASK, "$1@@").toLowerCase();
  const original = text.toLowerCase();
  let best: ResumeOccupation = "PLANNING";
  let bestScore = 0;
  (Object.keys(DOMAIN_PATTERNS) as ResumeOccupation[]).forEach((k) => {
    const src = k === "TECH" ? masked : original;
    const score = (src.match(DOMAIN_PATTERNS[k]) || []).length;
    if (score > bestScore) { best = k; bestScore = score; }
  });
  return { occupation: best, matched: bestScore > 0 };
}

// 경력이 아닌 기간(학력·인턴·프로젝트·교육) 및 섹션 헤더는 연차 합산에서 제외
const NON_CAREER_LINE = /대학|고등|중학|학사|석사|박사|졸업|입학|인턴|프로젝트|부트캠프|교육과정|수료|공모전|동아리|봉사/;
const NON_CAREER_SECTION = /^\s*(?:\[|<|■|▶|●|#)*\s*(?:학력|교육|프로젝트|대외활동|인턴|수상|자격)/;
const CAREER_SECTION = /^\s*(?:\[|<|■|▶|●|#)*\s*(?:경력|직무경험|재직|업무경험|work\s*experience|career)/i;

export function extractYears(text: string, now = new Date()): { years: number; source: ParsedResume["yearsSource"] } {
  // 1. 명시: "경력 5년", "총 8년", "5년차", "3 years"
  const explicit =
    text.match(/(?:총\s*)?(?:경력|재직|근무|실무)\s*(?:기간)?\s*(?:총\s*)?[:：]?\s*(\d{1,2})\s*년/) ||
    text.match(/(\d{1,2})\s*년\s*차/) ||
    text.match(/총\s*(\d{1,2})\s*년/) ||
    text.match(/(\d{1,2})\+?\s*years?(?:\s+of)?\s+experience/i);
  if (explicit) return { years: parseInt(explicit[1], 10), source: "explicit" };

  // 2. 기간 합산 (겹치는 구간은 병합). 줄 단위로 읽어 비경력 줄·섹션 제외.
  const ranges: Array<[number, number]> = [];
  const re = /((?:19|20)\d{2})\s*[.\-/년]\s*(\d{1,2})?\s*월?\s*[~–-]\s*(?:((?:19|20)\d{2})\s*[.\-/년]\s*(\d{1,2})?|현재|재직\s*중|present)/gi;
  let inNonCareerSection = false;
  for (const line of text.split(/\r?\n/)) {
    if (CAREER_SECTION.test(line)) inNonCareerSection = false;
    else if (NON_CAREER_SECTION.test(line) && line.length < 40) inNonCareerSection = true;
    if (inNonCareerSection || NON_CAREER_LINE.test(line)) continue;
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const start = parseInt(m[1], 10) * 12 + (parseInt(m[2] || "1", 10) - 1);
      const end = m[3] ? parseInt(m[3], 10) * 12 + (parseInt(m[4] || "12", 10) - 1) : now.getFullYear() * 12 + now.getMonth();
      if (end >= start) ranges.push([start, end]);
    }
  }
  if (ranges.length > 0) {
    ranges.sort((a, b) => a[0] - b[0]);
    let total = 0;
    let [cs, ce] = ranges[0];
    for (const [s, e] of ranges.slice(1)) {
      if (s <= ce) ce = Math.max(ce, e);
      else { total += ce - cs + 1; cs = s; ce = e; }
    }
    total += ce - cs + 1;
    return { years: Math.floor(total / 12), source: "date-range" };
  }

  // 3. 신입 키워드
  if (/신입|졸업\s*예정|학부생|취업\s*준비|인턴/.test(text)) return { years: 0, source: "entry-keyword" };
  return { years: -1, source: "unknown" };
}

export function parseResume(text: string, now = new Date()): ParsedResume {
  const { occupation, matched } = detectResumeDomain(text);
  const domainName = detectDomainFromKeywords(DEFAULT_ROLE[occupation]).domainName;
  const skills = SKILLS.filter((s) => hasSkill(text, s));
  const { years, source } = extractYears(text, now);
  const totalYears = Math.max(0, years);
  return {
    occupation,
    domainName,
    canonicalRole: skills.length ? `${DEFAULT_ROLE[occupation]} (${skills.slice(0, 3).join(", ")})` : DEFAULT_ROLE[occupation],
    skills,
    totalYears,
    track: totalYears === 0 ? "ENTRY" : "EXPERIENCED",
    yearsSource: source,
    domainMatched: matched,
  };
}
