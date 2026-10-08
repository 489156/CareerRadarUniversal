const fs = require('fs');
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace mock import
page = page.replace(
  /import \{ MOCK_JOB_DATABASE.*\} from "@\/lib\/matcher";/,
  'import { calculateDynamicJobMatch, EXPANDED_SKILL_GAP_TRACKS, calculateEstimatedMarketValue, evaluateHardFilters } from "@/lib/matcher";'
);

// Replace initial state
page = page.replace(
  /const \[jobsDatabase, setJobsDatabase\] = useState<JobPosting\[\]>\(MOCK_JOB_DATABASE\);/,
  'const [jobsDatabase, setJobsDatabase] = useState<JobPosting[]>([]);'
);

// Replace fetch fallback
page = page.replace(
  /fetchJobsWithCache\(MOCK_JOB_DATABASE\)/,
  'fetchJobsWithCache([])'
);

fs.writeFileSync('src/app/page.tsx', page, 'utf-8');
console.log('page.tsx patched successfully');
