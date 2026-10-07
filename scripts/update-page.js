const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add import
if (!code.includes('fetchJobsWithCache')) {
  code = code.replace(
    'import { CRAWLER_SOURCES, getCrawlerNetworkStats } from "@/lib/crawler";',
    'import { CRAWLER_SOURCES, getCrawlerNetworkStats } from "@/lib/crawler";\nimport { fetchJobsWithCache } from "@/lib/supabase";'
  );
}

// 2. Add state inside Home component
if (!code.includes('jobsDatabase')) {
  code = code.replace(
    'export default function Home() {',
    'export default function Home() {\n  const [jobsDatabase, setJobsDatabase] = useState<JobPosting[]>(MOCK_JOB_DATABASE);\n\n  useEffect(() => {\n    fetchJobsWithCache(MOCK_JOB_DATABASE).then(data => {\n      setJobsDatabase(data);\n    });\n  }, []);\n'
  );
}

// 3. Replace MOCK_JOB_DATABASE mapping
code = code.replace(
  'const jobsWithScores = MOCK_JOB_DATABASE.map((job) => ({',
  'const jobsWithScores = jobsDatabase.map((job) => ({'
);

fs.writeFileSync('src/app/page.tsx', code, 'utf-8');
console.log('page.tsx updated to use Supabase state');
