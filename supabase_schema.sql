-- Supabase Schema for Career Radar Universal (public.jobs)
-- Copy and run this script inside your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    "canonicalRole" TEXT,
    occupation TEXT,
    industry TEXT,
    location TEXT,
    "commuteMinutes" INTEGER DEFAULT 50,
    "salaryMinManwon" INTEGER DEFAULT 4000,
    "salaryMaxManwon" INTEGER DEFAULT 6000,
    "salaryDisplay" TEXT,
    "salaryTier" TEXT DEFAULT 'B',
    "minYears" INTEGER DEFAULT 0,
    "maxYears" INTEGER DEFAULT 10,
    "hasFixedOT" BOOLEAN DEFAULT false,
    "fixedOTHours" INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    pros JSONB DEFAULT '[]'::jsonb,
    gaps JSONB DEFAULT '[]'::jsonb,
    "rawText" TEXT,
    "sourceName" TEXT,
    "jobUrl" TEXT,
    "sourceCategory" TEXT,
    "isCompanyExclusive" BOOLEAN DEFAULT true,
    "sourceSystem" TEXT,
    "isEntryLevel" BOOLEAN DEFAULT false,
    "jobCategory" TEXT,
    "publishedAt" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop legacy overly-permissive policy if it exists
DROP POLICY IF EXISTS "Allow Crawler Upsert Jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow Public Read Jobs" ON public.jobs;

-- Allow anonymous read access for the client-side SPA / Mobile App ONLY
CREATE POLICY "Allow Public Read Jobs"
ON public.jobs FOR SELECT
TO anon, authenticated
USING (true);

-- Note: Automated Crawler (GitHub Actions) should authenticate with SUPABASE_SERVICE_ROLE_KEY,
-- which safely bypasses RLS for server-side upserts without exposing write permissions to public clients.
