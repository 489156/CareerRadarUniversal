import { createClient } from '@supabase/supabase-js';
import { JobPosting } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const NON_CAREER_FILTER = /기간제|일용|시설경비|경비원|미화|청소|한시인력|환경관리|수익시설|조리원|운전원|아르바이트|알바|위촉|초빙|의료요원|진료의사|진료교수|간호|수련의|전공의|약무직|치과|위생사|보건직|수련생|무기계약|조무사|영양사|사회복지사/;

function sanitizeJobs(items: JobPosting[]): JobPosting[] {
  return (items || []).filter(
    (j) => j && j.title && !NON_CAREER_FILTER.test(`${j.title} ${(j.tags || []).join(' ')}`)
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Client-side fetching wrapper with localStorage caching to save Free Tier quota
export async function fetchJobsWithCache(fallbackData: JobPosting[] = []): Promise<JobPosting[]> {
  let baseData = sanitizeJobs(fallbackData);
  try {
    const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
    const res = await fetch(`${basePath}/data/jobs.json`);
    if (res.ok) {
      baseData = sanitizeJobs(await res.json());
    }
  } catch (e) {
    console.warn('Could not fetch local jobs.json fallback', e);
  }

  if (!supabase) {
    return baseData;
  }

  try {
    const CACHE_KEY = 'career_radar_jobs_cache';
    const CACHE_EXPIRY = 1000 * 60 * 60 * 4; // 4 hours

    const cachedStr = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
        const sbData = sanitizeJobs(cached.data || []);
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
      const sanitizedSb = sanitizeJobs(data as JobPosting[]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: sanitizedSb }));
      }
      const merged = [...sanitizedSb];
      const existingIds = new Set(sanitizedSb.map((j) => j.id));
      baseData.forEach((j) => { if (!existingIds.has(j.id)) merged.push(j); });
      return merged;
    }

    return baseData;
  } catch (err) {
    console.error("Unexpected error fetching jobs:", err);
    return baseData;
  }
}
