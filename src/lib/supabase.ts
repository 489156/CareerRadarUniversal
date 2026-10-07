import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Client-side fetching wrapper with localStorage caching to save Free Tier quota
export async function fetchJobsWithCache(fallbackData: any[]) {
  if (!supabase) {
    console.warn("Supabase not configured, using fallback local JSON data.");
    return fallbackData;
  }

  try {
    const CACHE_KEY = 'career_radar_jobs_cache';
    const CACHE_EXPIRY = 1000 * 60 * 60 * 4; // 4 hours

    const cachedStr = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
        console.log("Using cached jobs from localStorage");
        return cached.data;
      }
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('publishedAt', { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return fallbackData;
    }

    if (data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: data
        }));
      }
      return data;
    }

    return fallbackData;
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return fallbackData;
  }
}
