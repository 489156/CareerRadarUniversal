const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

const startStr = 'export async function fetchJobsWithCache';
const startIndex = code.indexOf(startStr);

if (startIndex !== -1) {
  const prefix = code.slice(0, startIndex);
  
  const newFetchFn = `export async function fetchJobsWithCache(fallbackData: any[] = []) {
  let baseData = fallbackData;
  try {
    const res = await fetch('/data/jobs.json');
    if (res.ok) {
      baseData = await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch local jobs.json fallback', e);
  }

  if (!supabase) {
    console.warn("Supabase not configured, using fallback local JSON data.");
    return baseData;
  }

  try {
    const CACHE_KEY = 'career_radar_jobs_cache';
    const CACHE_EXPIRY = 1000 * 60 * 60 * 4; // 4 hours

    const cachedStr = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
        console.log("Using cached jobs from localStorage");
        const sbData = cached.data || [];
        const merged = [...sbData];
        const existingIds = new Set(sbData.map((j) => j.id));
        baseData.forEach((j) => { if (!existingIds.has(j.id)) merged.push(j); });
        return merged;
      }
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('publishedAt', { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return baseData;
    }

    if (data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      }
      
      const merged = [...data];
      const existingIds = new Set(data.map((j) => j.id));
      baseData.forEach((j) => { if (!existingIds.has(j.id)) merged.push(j); });
      return merged;
    }

    return baseData;
  } catch (err) {
    console.error("Unexpected error fetching jobs:", err);
    return baseData;
  }
}
`;

  code = prefix + newFetchFn;
  fs.writeFileSync('src/lib/supabase.ts', code, 'utf-8');
  console.log('Fixed fetchJobsWithCache robustly');
}
