# Career Radar Universal: Functional Prototype Implementation Plan (MVP)
**문서 버전**: v1.0  
**기준 일자**: 2026-09-28  
**프로젝트**: Career Radar Universal  
**저장소**: [489156/CareerRadarUniversal](https://github.com/489156/CareerRadarUniversal)  
**기획/작성**: versova ([@489156](https://github.com/489156))

---

## 1. 프로토타입 목표 및 범위 (Prototype Objectives & Scope)

### 1.1 핵심 목표
Career Radar Universal의 핵심 가치 사슬인 **"Career Passport 입력 → 직무 온톨로지 정규화 → 3-Tier 연봉 검증 → 실질 시급(Life-Adjusted Value) 산출 → 오퍼 비교"**를 실제로 구동 가능한 웹 기반 기능 프로토타입(Functional Prototype)으로 구현한다.

### 1.2 비기능적 요구사항 (Non-Functional Requirements)
* **Vibe-Coding 친화성**: 복잡한 인프라 관리 없이 Supabase Dashboard 및 Cloudflare Pages GUI를 통해 손쉽게 배포·운영 가능해야 함.
* **비용 제로(Zero-Cost) 아키텍처**: 개발 및 초기 프로토타입 단계에서 Supabase Free Tier, Cloudflare Pages Free Tier, Gemini 1.5 Flash 무료 할당량을 활용.
* **단일 페이지 반응형 웹(SPA/Dashboard)**: 모바일과 데스크톱 모두에서 직관적으로 확인 가능한 대시보드 인터페이스.

---

## 2. 기술 스택 및 아키텍처 (Tech Stack & Architecture)

```mermaid
flowchart LR
    subgraph CLIENT ["Client Layer (Next.js 14 / React)"]
        UI_ONBOARD["1. Career Passport Wizard"]
        UI_DASH["2. Opportunity Radar & Fit Explainer"]
        UI_COMP["3. Life-Adjusted Salary Calculator"]
        UI_OFFER["4. Offer Comparison Matrix"]
    end

    subgraph BACKEND ["Serverless / Edge Layer"]
        API_NORM["/api/normalize (Ontology & Salary Regex)"]
        API_MATCH["/api/match (Multi-Objective Scoring)"]
        API_AI["/api/copilot (Gemini 1.5 Flash API)"]
    end

    subgraph DATA ["Data Layer (Supabase PostgreSQL)"]
        DB_PASSPORT[("user_passports")]
        DB_JOBS[("job_postings")]
        DB_SALARY[("salary_benchmarks (Tier A/B/C)")]
        DB_OFFERS[("user_offers")]
    end

    CLIENT --> BACKEND
    BACKEND --> DATA
```

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts (데이터 시각화)
* **Backend/API**: Next.js Serverless Route Handlers (`/api/...`)
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security, pgvector)
* **LLM Engine**: Google Gemini 1.5 Flash (이력서 텍스트 구조화 및 STAR 답변 가이드)
* **Hosting**: Cloudflare Pages (GitHub 저장소 연동 자동 CI/CD 빌드)

---

## 3. 데이터베이스 스키마 설계 (Supabase SQL DDL)

Supabase 대시보드의 **SQL Editor**에 복사-붙여넣기하여 즉시 생성할 수 있는 완결형 DDL이다.

```sql
-- 1. Career Passport 테이블 (구직자 핵심 프로필)
CREATE TABLE IF NOT EXISTS user_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    occupation VARCHAR(100) NOT NULL,            -- 직군 (예: 인사, IT, 기획)
    canonical_role VARCHAR(100) NOT NULL,        -- 정규화 직무명 (예: HR Planning)
    total_experience_years INT NOT NULL,         -- 총 경력 연차
    current_company_type VARCHAR(50),            -- 대기업/중견/스타트업
    current_base_salary BIGINT,                  -- 현재 기본급 (원)
    current_fixed_allowance BIGINT DEFAULT 0,    -- 현재 고정수당 (원)
    current_variable_bonus BIGINT DEFAULT 0,     -- 현재 성과급 (원)
    home_location VARCHAR(100),                  -- 거주지 (예: 경기도 군포시)
    commute_tolerance_minutes INT DEFAULT 60,    -- 편도 허용 통근 시간 (분)
    hard_preferences JSONB DEFAULT '{"employment_type": "정규직", "region": "수도권"}'::jsonb,
    soft_preferences JSONB DEFAULT '{"wfh_preferred": true, "min_salary": 55000000}'::jsonb,
    skills TEXT[] DEFAULT '{}',                  -- 보유 스킬셋
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 채용 공고 테이블 (수집 및 정규화된 공고)
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(150) NOT NULL,
    raw_title VARCHAR(200) NOT NULL,
    canonical_role VARCHAR(100) NOT NULL,        -- 표준 온톨로지 직무명
    location VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) DEFAULT '정규직',
    min_experience_years INT DEFAULT 0,
    max_experience_years INT DEFAULT 99,
    salary_min BIGINT,                           -- 공고 명시 최소 연봉
    salary_max BIGINT,                           -- 공고 명시 최대 연봉
    salary_confidence_tier VARCHAR(10) DEFAULT 'C', -- A: 공시/명시, B: 통계/제보, C: 추정
    has_fixed_ot BOOLEAN DEFAULT FALSE,          -- 포괄임금제/고정OT 여부
    fixed_ot_hours INT DEFAULT 0,                -- 고정 연장근로 시간
    probation_period_months INT DEFAULT 3,       -- 수습기간 (월)
    probation_salary_ratio NUMERIC DEFAULT 1.0,  -- 수습 급여 비율 (1.0 = 100%)
    source_url TEXT,
    raw_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 연봉 벤치마크 원장 (Tier A/B/C)
CREATE TABLE IF NOT EXISTS salary_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_role VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(50) NOT NULL,        -- 주니어(1-3), 미드(4-7), 시니어(8+)
    region VARCHAR(50) NOT NULL,
    tier VARCHAR(10) NOT NULL,                   -- Tier A, Tier B, Tier C
    source_name VARCHAR(100) NOT NULL,           -- ALIO, 고용노동부, 사람인, 사용자 제보
    sample_size INT DEFAULT 1,
    p25_salary BIGINT NOT NULL,
    p50_salary BIGINT NOT NULL,
    p75_salary BIGINT NOT NULL,
    guaranteed_cash_ratio NUMERIC DEFAULT 0.85,  -- 기본급 비중
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 오퍼 비교 테이블 (Offer Comparison)
CREATE TABLE IF NOT EXISTS user_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    offer_title VARCHAR(150) NOT NULL,
    base_salary BIGINT NOT NULL,
    target_bonus BIGINT DEFAULT 0,
    annual_equity BIGINT DEFAULT 0,
    welfare_points BIGINT DEFAULT 0,
    commute_minutes_oneway INT NOT NULL,         -- 편도 통근 시간
    monthly_commute_cost INT DEFAULT 100000,     -- 월 예상 교통비
    weekly_remote_days INT DEFAULT 0,            -- 주간 재택 일수
    weekly_expected_work_hours INT DEFAULT 40,   -- 주당 실근로시간
    fixed_ot_included BOOLEAN DEFAULT FALSE,
    life_adjusted_hourly_wage NUMERIC,           -- 산출된 실질 시급
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 핵심 알고리즘 및 비즈니스 로직 (Core Logic Specs)

### 4.1 한국형 임금 및 독소조항 감지 로직 (Regex Scanner)
공고 원문 텍스트에서 포괄임금제, 수습 감액, 퇴직금 분할 지급 등의 조건을 자동 감지한다.

```typescript
export interface JobRiskDiagnosis {
  hasFixedOT: boolean;
  fixedOTHours: number;
  hasSeveranceSplitRisk: boolean; // 퇴직금 1/13 분할 위험
  probationReducedSalary: boolean;
  warnings: string[];
}

export function diagnoseJobRisks(text: string): JobRiskDiagnosis {
  const warnings: string[] = [];
  
  // 1. 포괄임금 / 고정OT 감지
  const otMatch = text.match(/(포괄임금|고정연장|고정\s*OT|시간외수당\s*(\d+)시간)/i);
  let fixedOTHours = 0;
  if (otMatch) {
    const hoursMatch = text.match(/(\d+)\s*시간\s*(포괄|포함|인정)/);
    fixedOTHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 32; // 기본 추정치 32시간
    warnings.push(`포괄임금제 적용 가능성 감지 (월 고정 OT 약 ${fixedOTHours}시간 포함 추정)`);
  }

  // 2. 퇴직금 분할 지급(1/13) 의심 문구 감지
  if (/퇴직금\s*포함|연봉의\s*1\/13|퇴직금\s*월할/i.test(text)) {
    warnings.push("퇴직금 분할 지급(퇴직금 1/13 포함) 의심 - 법적 근로기준법 위반 소지 점검 필요");
  }

  // 3. 수습기간 급여 삭감 감지
  const probationReduction = /수습.*(70%|80%|90%|차등지급)/i.test(text);
  if (probationReduction) {
    warnings.push("수습기간 중 급여 삭감 조건 감지 (최대 3개월간 10~30% 감액 가능성)");
  }

  return {
    hasFixedOT: !!otMatch,
    fixedOTHours,
    hasSeveranceSplitRisk: warnings.some(w => w.includes("퇴직금")),
    probationReducedSalary: probationReduction,
    warnings,
  };
}
```

### 4.2 실질 시급 (Life-Adjusted Hourly Wage) 산출 수식
명목 연봉에서 세후 추정액, 연간 통근 비용, 식대 및 필수 지출을 차감하고, 연간 실질 투입 시간(근무시간 + 통근시간)으로 나눈 실질 시급을 계산한다.

$$\text{Life-Adjusted Hourly Wage} = \frac{\text{Guaranteed Cash} - \text{Annual Commute Cost} - \text{Excess Meals}}{\text{Annual Working Hours} + \text{Annual Commute Hours}}$$

```typescript
export interface LifeAdjustedInput {
  baseSalary: number;            // 기본급 (원)
  fixedAllowance: number;        // 고정수당 (원)
  monthlyCommuteCost: number;    // 월 교통비 (원)
  commuteMinutesOneway: number;  // 편도 통근 시간 (분)
  weeklyRemoteDays: number;      // 주당 재택 일수 (0~5)
  weeklyWorkHours: number;       // 주당 실근로시간 (예: 40 + 고정OT 8 = 48시간)
}

export function calculateLifeAdjustedHourlyWage(input: LifeAdjustedInput): {
  realHourlyWage: number;
  nominalHourlyWage: number;
  annualCommuteHours: number;
} {
  const guaranteedAnnualCash = input.baseSalary + input.fixedAllowance;
  const annualCommuteCost = input.monthlyCommuteCost * 12;
  
  // 주당 출근 일수
  const commuteDaysPerWeek = Math.max(0, 5 - input.weeklyRemoteDays);
  
  // 연간 통근 시간 (52주 기준)
  const weeklyCommuteHours = (input.commuteMinutesOneway * 2 * commuteDaysPerWeek) / 60;
  const annualCommuteHours = weeklyCommuteHours * 52;
  
  // 연간 총 근로 시간 (52주 기준)
  const annualWorkHours = input.weeklyWorkHours * 52;
  
  // 1. 단순 명목 시급 (연 2,088시간 주 40시간 기준)
  const nominalHourlyWage = Math.round(guaranteedAnnualCash / 2088);
  
  // 2. 실질 가치 반영 시급
  const netEconomicBenefit = guaranteedAnnualCash - annualCommuteCost;
  const totalLifeTimeInvested = annualWorkHours + annualCommuteHours;
  const realHourlyWage = Math.round(netEconomicBenefit / totalLifeTimeInvested);

  return {
    realHourlyWage,
    nominalHourlyWage,
    annualCommuteHours: Math.round(annualCommuteHours),
  };
}
```

---

## 5. UI/UX 와이어프레임 플로우 (Core Screens)

```
[화면 1: 5분 간편 온보딩 (Passport Wizard)]
 ┌────────────────────────────────────────────────────────┐
 │ 1. 직무 및 연차 (HR / 인사기획 / 7년차)                │
 │ 2. 현재 보상 (기본급 5,400만 + 고정수당 400만)          │
 │ 3. 거주지 및 허용 통근 (경기도 군포시 / 최대 60분)     │
 │ 4. 절대 조건 (정규직, 수도권)                          │
 └────────────────────────────────────────────────────────┘
                           │ [완료 및 분석 실행]
                           ▼
[화면 2: 메인 Opportunity Radar 대시보드]
 ┌────────────────────────────────────────────────────────┐
 │ [내 커리어 시장가치]                                   │
 │ P25: 5,600만 | P50: 6,200만 | P75: 6,800만 (Tier B)    │
 ├────────────────────────────────────────────────────────┤
 │ [맞춤 공고 레이더 (적합도 순)]                         │
 │ 1. A대기업 (People Partner) - 적합도 94% / 6,500만(A)  │
 │    - 추천 사유: HR기획 5년+ 요건 일치, 통근 45분       │
 │    - 주의 사항: 포괄임금제 (월 20시간 고정OT 포함)     │
 │ 2. B테크기업 (HRBP) - 적합도 88% / 6,200만(B)          │
 └────────────────────────────────────────────────────────┘
                           │ [공고 선택]
                           ▼
[화면 3: 오퍼 비교기 (Offer Comparison Matrix)]
 ┌──────────────────────┬─────────────┬───────────────────┐
 │ 항목                 │ 현재 회사   │ A사 (최종 오퍼)   │
 ├──────────────────────┼─────────────┼───────────────────┤
 │ 확정 현금            │ 5,800만 원  │ 6,400만 원 (+600) │
 │ 편도 통근 시간       │ 35분        │ 75분 (+40분)      │
 │ 재택근무             │ 주 1일      │ 주 0일 (전면출근) │
 │ 연간 통근 투입 시간  │ 290시간     │ 650시간 (+360시간)│
 │ 실질 체감 시급       │ 24,100원    │ 21,800원 (-2,300) │
 │ 판정                 │ 기준점      │ 실질 가치 하락 ⚠️ │
 └──────────────────────┴─────────────┴───────────────────┘
```

---

## 6. 4주 단위 프로토타입 구현 스프린트 (Sprint Roadmap)

| 스프린트 | 주요 마일스톤 | 핵심 산출물 | 검증 기준 |
| :--- | :--- | :--- | :--- |
| **Sprint 1 (W1)** | 프로젝트 셋업 & Career Passport 모듈 | Next.js 14 보일러플레이트, Supabase DDL 적용, 5분 온보딩 Wizard UI | 프로필 저장 및 로컬 스토리지/Supabase 연동 확인 |
| **Sprint 2 (W2)** | 3-Tier 연봉 원장 & 임금 정규화 엔진 | Tier A(ALIO/명시공고) 시드 데이터 50건, 고정OT/독소조항 정규식 진단기 | 공고 텍스트 입력 시 고정OT 시간 및 위험 플래그 자동 산출 |
| **Sprint 3 (W3)** | 실질 시급 계산기 & Opportunity Radar | Life-Adjusted Calculator UI, 다차원 매칭 알고리즘, 적합도 분해 뷰 | 통근 시간 및 재택 여부에 따른 실질 시급 변동 차트 출력 |
| **Sprint 4 (W4)** | 오퍼 비교 매트릭스 & E2E 통합 테스트 | Offer Comparison A/B 매트릭스, 종합 대시보드, Cloudflare Pages 배포 | 현 직장 vs 가상 오퍼 2개 입력 시 실질 손익 판정 시뮬레이션 완결 |

---

## 7. 배포 및 실행 가이드 (Vibe-Coding Deployment Guide)

1. **Supabase 설정**:
   * [Supabase Console](https://supabase.com/dashboard)에서 신규 프로젝트 생성.
   * `SQL Editor` 탭에 본 문서 제3장의 DDL 스크립트를 붙여넣고 `Run` 실행.
   * `Project Settings > API`에서 `SUPABASE_URL` 및 `SUPABASE_ANON_KEY` 복사.

2. **Cloudflare Pages 배포**:
   * [Cloudflare Dashboard](https://dash.cloudflare.com/) 진입 후 `Workers & Pages > Create application > Pages`.
   * GitHub 저장소 `489156/CareerRadarUniversal` 선택.
   * 빌드 설정: Framework Preset `Next.js`, 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력 후 `Deploy`.
