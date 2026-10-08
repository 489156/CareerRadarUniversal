const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Remove useState declarations and replace with useAppStore
const replacements = [
  { search: 'const [activeTab, setActiveTab] = useState<"passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger">("passport");', replace: 'const activeTab = useAppStore(state => state.activeTab);\n  const setActiveTab = useAppStore(state => state.setActiveTab);' },
  { search: 'const [toastMessage, setToastMessage] = useState<string | null>(null);', replace: 'const toastMessage = useAppStore(state => state.toastMessage);\n  const setToastMessage = useAppStore(state => state.setToastMessage);' },
  
  // Note: passport state needs to be fully replaced. The existing code spans multiple lines.
  // We'll use regex for the passport useState.
  
  { search: /const \[passport, setPassport\] = useState<CareerPassport>\(\{[\s\S]*?\}\);/, replace: 'const passport = useAppStore(state => state.passport);\n  const setPassport = useAppStore(state => state.setPassport);' },
  
  { search: /const \[hardFilters, setHardFilters\] = useState<HardFilters>\(\{[\s\S]*?\}\);/, replace: 'const hardFilters = useAppStore(state => state.hardFilters);\n  const setHardFilters = useAppStore(state => state.setHardFilters);' },
  
  { search: /const \[calcInput, setCalcInput\] = useState\(\{[\s\S]*?\}\);/, replace: 'const calcInput = useAppStore(state => state.calcInput);\n  const setCalcInput = useAppStore(state => state.setCalcInput);' },
  
  { search: 'const [scannerText, setScannerText] = useState("");', replace: 'const scannerText = useAppStore(state => state.scannerText);\n  const setScannerText = useAppStore(state => state.setScannerText);' },
  
  { search: 'const [scanResult, setScanResult] = useState<ReturnType<typeof diagnoseJobRisks> | null>(null);', replace: 'const scanResult = useAppStore(state => state.scanResult);\n  const setScanResult = useAppStore(state => state.setScanResult);' },
  
  { search: 'const [resumeText, setResumeText] = useState("");', replace: 'const resumeText = useAppStore(state => state.resumeText);\n  const setResumeText = useAppStore(state => state.setResumeText);' },
  
  { search: 'const [isMarketValueModalOpen, setIsMarketValueModalOpen] = useState(false);', replace: 'const isMarketValueModalOpen = useAppStore(state => state.isMarketValueModalOpen);\n  const setIsMarketValueModalOpen = useAppStore(state => state.setIsMarketValueModalOpen);' },
  
  { search: 'const [isSkillGapModalOpen, setIsSkillGapModalOpen] = useState(false);', replace: 'const isSkillGapModalOpen = useAppStore(state => state.isSkillGapModalOpen);\n  const setIsSkillGapModalOpen = useAppStore(state => state.setIsSkillGapModalOpen);' },
  
  { search: 'const [activeSkillTrackId, setActiveSkillTrackId] = useState<string>("track-analytics");', replace: 'const activeSkillTrackId = useAppStore(state => state.activeSkillTrackId);\n  const setActiveSkillTrackId = useAppStore(state => state.setActiveSkillTrackId);' },
  
  { search: 'const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);', replace: 'const selectedJob = useAppStore(state => state.selectedJob);\n  const setSelectedJob = useAppStore(state => state.setSelectedJob);' },
  
  { search: 'const [selectedJobMatch, setSelectedJobMatch] = useState<DynamicMatchScore | null>(null);', replace: 'const selectedJobMatch = useAppStore(state => state.selectedJobMatch);\n  const setSelectedJobMatch = useAppStore(state => state.setSelectedJobMatch);' },
  
  { search: 'const [selectedJobHf, setSelectedJobHf] = useState<{ isExcluded: boolean; exclusionReasons: string[] } | null>(null);', replace: 'const selectedJobHf = useAppStore(state => state.selectedJobHf);\n  const setSelectedJobHf = useAppStore(state => state.setSelectedJobHf);' },
  
  { search: 'const [customKeywordInput, setCustomKeywordInput] = useState("");', replace: 'const customKeywordInput = useAppStore(state => state.customKeywordInput);\n  const setCustomKeywordInput = useAppStore(state => state.setCustomKeywordInput);' },
  
  { search: 'const [showExcludedJobs, setShowExcludedJobs] = useState(false);', replace: 'const showExcludedJobs = useAppStore(state => state.showExcludedJobs);\n  const setShowExcludedJobs = useAppStore(state => state.setShowExcludedJobs);' },
  
  { search: 'const [radarSearch, setRadarSearch] = useState("");', replace: 'const radarSearch = useAppStore(state => state.radarSearch);\n  const setRadarSearch = useAppStore(state => state.setRadarSearch);' },
  
  { search: /const \[radarFilter, setRadarFilter\] = useState<[\s\S]*?>\("all"\);/, replace: 'const radarFilter = useAppStore(state => state.radarFilter);\n  const setRadarFilter = useAppStore(state => state.setRadarFilter);' },
  
  { search: 'const [isCrawlerModalOpen, setIsCrawlerModalOpen] = useState(false);', replace: 'const isCrawlerModalOpen = useAppStore(state => state.isCrawlerModalOpen);\n  const setIsCrawlerModalOpen = useAppStore(state => state.setIsCrawlerModalOpen);' },
  
  { search: 'const [crawlerCategoryFilter, setCrawlerCategoryFilter] = useState<string>("ALL");', replace: 'const crawlerCategoryFilter = useAppStore(state => state.crawlerCategoryFilter);\n  const setCrawlerCategoryFilter = useAppStore(state => state.setCrawlerCategoryFilter);' },
  
  { search: 'const [ledgerSearch, setLedgerSearch] = useState("");', replace: 'const ledgerSearch = useAppStore(state => state.ledgerSearch);\n  const setLedgerSearch = useAppStore(state => state.setLedgerSearch);' },
  
  { search: 'const [jobsDatabase, setJobsDatabase] = useState<JobPosting[]>([]);', replace: 'const jobsDatabase = useAppStore(state => state.jobsDatabase);\n  const setJobsDatabase = useAppStore(state => state.setJobsDatabase);' }
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

// Also fix isResumeModalOpen which was somehow missed or manually injected earlier, let's just make sure there are no duplicates.
// Wait, I saw isResumeModalOpen was already using useAppStore in the grep output. I'll make sure there's no useState for it.
content = content.replace(/const \[isResumeModalOpen, setIsResumeModalOpen\] = useState\(false\);/, '');

fs.writeFileSync('src/app/page.tsx', content, 'utf-8');
console.log('Fixed local states');
