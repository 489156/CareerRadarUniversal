import fs from 'fs';

const pagePath = 'src/app/page.tsx';
let content = fs.readFileSync(pagePath, 'utf-8');

// 1. Add Zustand import
if (!content.includes('useAppStore')) {
  content = content.replace(
    /import React, \{ useState, useEffect \} from "react";/,
    `import React, { useState, useEffect } from "react";\nimport { useAppStore } from "@/store/useAppStore";\nimport { ResumeModal } from "@/components/ResumeModal";\nimport { MarketValueModal } from "@/components/MarketValueModal";\nimport { SkillGapModal } from "@/components/SkillGapModal";\nimport { CrawlerModal } from "@/components/CrawlerModal";\nimport { JobDetailModal } from "@/components/JobDetailModal";`
  );
}

// 2. Replace state definitions inside Home component
const stateRegexes = [
  { pattern: /const \[jobsDatabase, setJobsDatabase\] = useState<JobPosting\[\]>\(\[\]\);/, replace: 'const { jobsDatabase, setJobsDatabase } = useAppStore();' },
  { pattern: /const \[activeTab, setActiveTab\] = useState<.*?>\("passport"\);/, replace: 'const { activeTab, setActiveTab } = useAppStore();' },
  { pattern: /const \[toastMessage, setToastMessage\] = useState<string \| null>\(null\);/, replace: 'const { toastMessage, setToastMessage } = useAppStore();' },
  { pattern: /const \[passport, setPassport\] = useState<CareerPassport>\(\{[\s\S]*?customKeywords: \["교대근무", "파견직"\]\n\s*\}\n\s*\}\);/, replace: 'const { passport, setPassport } = useAppStore();' },
  { pattern: /const \[calcInput, setCalcInput\] = useState\(\{[\s\S]*?monthlyWelfare: 10,\n\s*\}\);/, replace: 'const { calcInput, setCalcInput } = useAppStore();' },
  { pattern: /const \[scannerText, setScannerText\] = useState\(""\);/, replace: 'const { scannerText, setScannerText } = useAppStore();' },
  { pattern: /const \[scanResult, setScanResult\] = useState<ReturnType<typeof diagnoseJobRisks> \| null>\(null\);/, replace: 'const { scanResult, setScanResult } = useAppStore();' },
  { pattern: /const \[isResumeModalOpen, setIsResumeModalOpen\] = useState\(false\);/, replace: '' },
  { pattern: /const \[resumeText, setResumeText\] = useState\(""\);/, replace: '' },
  { pattern: /const \[isMarketValueModalOpen, setIsMarketValueModalOpen\] = useState\(false\);/, replace: '' },
  { pattern: /const \[isSkillGapModalOpen, setIsSkillGapModalOpen\] = useState\(false\);/, replace: '' },
  { pattern: /const \[activeSkillTrackId, setActiveSkillTrackId\] = useState<string>\("track-analytics"\);/, replace: 'const { activeSkillTrackId, setActiveSkillTrackId } = useAppStore();' },
  { pattern: /const \[selectedJob, setSelectedJob\] = useState<JobPosting \| null>\(null\);/, replace: '' },
  { pattern: /const \[selectedJobMatch, setSelectedJobMatch\] = useState<DynamicMatchScore \| null>\(null\);/, replace: '' },
  { pattern: /const \[selectedJobHf, setSelectedJobHf\] = useState<\{ isExcluded: boolean; exclusionReasons: string\[\] \} \| null>\(null\);/, replace: '' },
  { pattern: /const \[customKeywordInput, setCustomKeywordInput\] = useState\(""\);/, replace: 'const { customKeywordInput, setCustomKeywordInput } = useAppStore();' },
  { pattern: /const \[showExcludedJobs, setShowExcludedJobs\] = useState\(false\);/, replace: 'const { showExcludedJobs, setShowExcludedJobs } = useAppStore();' },
  { pattern: /const \[radarSearch, setRadarSearch\] = useState\(""\);/, replace: 'const { radarSearch, setRadarSearch } = useAppStore();' },
  { pattern: /const \[radarFilter, setRadarFilter\] = useState<\n\s*"ALL" \| "RECOMMENDED" \| "GOOD_COMMUTE" \| "NO_OT" \| "ENTRY"\n\s*>\("ALL"\);/, replace: 'const { radarFilter, setRadarFilter } = useAppStore();' },
  { pattern: /const \[isCrawlerModalOpen, setIsCrawlerModalOpen\] = useState\(false\);/, replace: '' },
  { pattern: /const \[crawlerCategoryFilter, setCrawlerCategoryFilter\] = useState<string>\("ALL"\);/, replace: 'const { crawlerCategoryFilter, setCrawlerCategoryFilter } = useAppStore();' },
  { pattern: /const \[ledgerSearch, setLedgerSearch\] = useState\(""\);/, replace: 'const { ledgerSearch, setLedgerSearch } = useAppStore();' }
];

stateRegexes.forEach(({ pattern, replace }) => {
  content = content.replace(pattern, replace);
});

// Write it back to check if it parses and builds
fs.writeFileSync(pagePath, content, 'utf-8');
console.log('page.tsx state extracted!');
