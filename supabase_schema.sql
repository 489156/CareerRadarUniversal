-- Supabase SQL Editor에서 실행하세요.

-- 1. jobs 테이블 생성
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    "canonicalRole" TEXT,
    occupation TEXT,
    industry TEXT,
    location TEXT,
    "commuteMinutes" INTEGER,
    "salaryMinManwon" INTEGER,
    "salaryMaxManwon" INTEGER,
    "salaryDisplay" TEXT,
    "salaryTier" TEXT,
    "minYears" INTEGER,
    "maxYears" INTEGER,
    "hasFixedOT" BOOLEAN,
    "fixedOTHours" INTEGER,
    tags TEXT[],
    pros TEXT[],
    gaps TEXT[],
    "rawText" TEXT,
    "sourceName" TEXT,
    "jobUrl" TEXT,
    "sourceCategory" TEXT,
    "isCompanyExclusive" BOOLEAN,
    "sourceSystem" TEXT,
    "isEntryLevel" BOOLEAN,
    "jobCategory" TEXT,
    "publishedAt" TEXT
);

-- 2. Row Level Security (RLS) 설정 (누구나 읽기 가능, 수정/삭제는 인증된 서비스키(또는 Cron)만 가능)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.jobs FOR SELECT 
USING (true);

-- (참고: Insert/Update는 GitHub Actions에서 서비스 롤키/ANON 키를 사용하여 API 통신하므로 별도 정책이 필요할 수 있으나, 
--  테스트 단계에서는 ANON KEY 사용 시 아래 정책을 추가해야 합니다.)
CREATE POLICY "Allow anon insert/update for crawler" 
ON public.jobs FOR ALL 
USING (true)
WITH CHECK (true);
