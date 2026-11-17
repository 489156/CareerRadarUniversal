# Career Radar Universal (커리어 레이더 유니버설)

> **대기업·공공기관(ALIO)·Big4 자체 ATS 채용공고 무인 수집 및 다차원 커리어 인텔리전스 플랫폼**  
> *Zero-CLI 기반 GitHub Actions 무인 데이터 파이프라인 & GitHub Pages 정적 배포 아키텍처*

[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-0A0A0B.svg?style=for-the-badge)](https://489156.github.io/CareerRadarUniversal/)
[![Build](https://img.shields.io/badge/Build-Next.js%2014%20Static%20Export-27272A.svg?style=for-the-badge)](https://github.com/489156/CareerRadarUniversal/actions/workflows/deploy-pages.yml)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?style=for-the-badge)](https://supabase.com)
[![Pipeline](https://img.shields.io/badge/Crawler%20Pipeline-GitHub%20Actions%20Cron-18181B.svg?style=for-the-badge)](https://github.com/489156/CareerRadarUniversal/actions/workflows/crawler-cron.yml)

- **배포 URL**: https://489156.github.io/CareerRadarUniversal/

---

## 1. 기획 배경 (Executive Summary)

채용 시장의 핵심 정보 비대칭은 **"핵심 직무 공고일수록 대형 잡포털(사람인·잡코리아)에 올라오지 않는다"**는 점입니다.
- **공공기관 및 국책금융기관**: 기획재정부 ALIO 경영공시 시스템에만 정규직 채용이 우선 게재됩니다.
- **주요 대기업(삼성·현대차·SK·LG)** 및 **회계·컨설팅(Big4/MBB)**, **빅테크**: 자사 채용 홈페이지(Closed ATS)를 통해 수시 채용을 진행합니다.

**Career Radar Universal**은 사용자의 경력·직무·연봉·거주지 기준을 담은 **Career Passport**를 바탕으로, **21개 공식 채널(실시간 자동 크롤러 3곳 + 공식 채용관 링크 18곳)**의 채용 데이터에 대해 **다차원 적합도 점수화 ➔ 6종 절대 배제 필터링 ➔ 기업 Tier별 시장 연봉(P10~P90) 산출 ➔ 노동법 독소조항 진단 ➔ 통근·OT 반영 실질 시급 계산**까지 단일 워크스페이스에서 제공합니다.

---

## 2. 시스템 아키텍처 & 단일 배포 파이프라인 (GitHub Pages + Actions)

본 서비스는 **GitHub(Actions + Pages)** 를 단일 배포·실행 허브로 사용하여 별도 CLI나 외부 호스팅 분산 없이 완전 자동으로 동작합니다.

```mermaid
flowchart TD
    subgraph Data_Pipeline ["1. 무인 데이터 수집 & 적재 (GitHub Actions Cron)"]
        GHA["GitHub Actions Cron<br/>(매일 한국 시각 자정 00:00 KST / 15:00 UTC)"] -->|1. 실시간 스크래핑| EXT["ALIO · 삼일PwC · 딜로이트 안진<br/>(+ 큐레이션 시드 14건 병합)"]
        EXT -->|2. 비경력직 필터 & 정제| GHA
        GHA -->|3. SERVICE_ROLE_KEY Upsert| SUPA[("Supabase PostgreSQL<br/>public.jobs 테이블")]
        GHA -->|4. 정적 캐시 커밋| LOCAL_JSON["public/data/jobs.json"]
    end

    subgraph Hosting_Pages ["2. 정적 호스팅 (GitHub Pages 단일 배포)"]
        DEPLOY["deploy-pages.yml<br/>(Next.js 14 Static Export + basePath 자동 주입)"] --> GHP["GitHub Pages<br/>https://489156.github.io/CareerRadarUniversal/"]
    end

    subgraph Client_App ["3. 웹 클라이언트 (Frontend SPA)"]
        USER["사용자 브라우저 (Desktop / Mobile)"]
        USER -->|정적 자산 & JSON 로드| GHP
        USER -->|선택: anon key 읽기 전용 조회 (4h 캐시)| SUPA
    end
```

### 3대 안정성 안전망
1. **서브경로 자동 인식 (`NEXT_PUBLIC_BASE_PATH`)**: [deploy-pages.yml](.github/workflows/deploy-pages.yml)이 `actions/configure-pages@v5`의 `base_path`(`/CareerRadarUniversal`)를 [next.config.mjs](next.config.mjs)와 [supabase.ts](src/lib/supabase.ts)에 자동 주입해 정적 CSS/JS 및 `/data/jobs.json` 경로가 깨지지 않습니다.
2. **Supabase 무료 쿼터 방어 (4시간 TTL 캐싱)**: 브라우저 `localStorage`에 4시간 단위로 조회 결과를 캐싱해 반복 DB 호출을 방지합니다.
3. **3단계 데이터 Fallback**: `Supabase (선택)` → `public/data/jobs.json (크롤러 자동 커밋)` → 내장 `MOCK_JOB_DATABASE` 순으로 폴백되어 DB 키가 없어도 즉시 동작합니다.

---

## 3. 핵심 기능 (6-Tab Workspace & Quick Modals)

1. **`1. 조건 설정` (Career Passport & Hard Filter)**:
   - 신입/경력 트랙, 5대 직군(IT·재무/회계·마케팅·경영기획/전략·인사/HR), 보유 스킬 칩 추가, 목표 기업 Tier, 현재 보상, 통근 허용 한도를 설정합니다.
   - **이력서 파싱 (`ResumeModal`)**: 이력서 텍스트 붙여넣기 또는 `.txt`/`.md` 업로드를 통해 직무·경력(날짜 범위 병합/중복 제거, 연도 오인 방지)·스킬·현재 연봉을 자동 추출합니다.
   - **6대 절대 배제 필터 + 커스텀 키워드**: 비정규직(신입 인턴 예외), 비수도권, 통근 한도 초과, 고정OT 20h 초과, 현재 보상 미만, 지방이전 기관을 즉시 제외합니다.
2. **`2. 공고 레이더` (Opportunity Radar)**:
   - 고밀도 **테이블 뷰**와 **카드 뷰** 전환 지원, 직군·기업유형·비포괄·고적합 필터링 제공.
   - 공고 클릭 시 **우측 슬라이드오버 드로어(`JobDetailModal`)**에서 보상·통근·OT·4축 점수 분해(`직무 적합도 / 보상 경쟁력 / 통근 효율 / 워라밸`) 및 매칭/갭 사유를 확인하고 계약 진단 탭으로 원문을 즉시 전송할 수 있습니다.
3. **`3. 계약 진단` (Labor Risk Scanner)**:
   - 포괄임금 고정OT, 수습 감액, 퇴직금 월할/불법 정산, 부당 경업금지, 근로기준법 제20조 위약예정 문구를 탐지하며, `"비포괄임금"`·`"감액 없음"` 등 부정어 오탐을 차단합니다.
4. **`4. 실질 시급` (Life-Adjusted Value Calculator)**:
   - 명목 연봉에서 왕복 통근 시간, 교통비, 주당 실근로시간, 재택근무 일수를 반영해 **실질 체감 시급**과 연간 통근 소모 시간을 계산합니다.
5. **`5. 오퍼 비교` (Offer Comparison Matrix)**:
   - 현재 직장 vs Offer A vs Offer B의 기본급·수당·통근·재택·근로시간을 나란히 입력해 실질 시급 기준 최적 오퍼를 판정합니다.
6. **`6. 연봉 원장` (Market Salary Ledger) & `⌘K` 커맨드 팔레트**:
   - ALIO 공시·채용공고 기반 12대 주요 기관/기업 보수 테이블 검색, `Ctrl+K` / `⌘K` 빠른 명령창을 지원합니다.

---

## 4. 완전 무인 환경 세팅 가이드 (Zero-CLI)

GitHub 웹 대시보드에서 아래 순서만 설정하면 크롤러와 웹 호스팅이 모두 무인 자동화됩니다.

### Step 1. GitHub Pages 배포 활성화 (필수)
1. 본 GitHub 저장소의 **Settings ➔ Pages**로 이동합니다.
2. **Build and deployment ➔ Source**를 **`GitHub Actions`**로 선택합니다.
3. `main` 브랜치 푸시 시 [deploy-pages.yml](.github/workflows/deploy-pages.yml)이 자동 실행되어 `https://489156.github.io/CareerRadarUniversal/`에 게시됩니다.

### Step 2. Supabase 데이터베이스 생성 (선택 — 실시간 DB 연동 시)
1. [Supabase](https://supabase.com/)에서 New Project를 생성합니다.
2. 좌측 **SQL Editor**에 [`supabase_schema.sql`](./supabase_schema.sql) 전체를 붙여넣고 **Run**을 실행합니다.
   - 보안 정책(RLS)상 `anon` 키는 **클라이언트 읽기(`SELECT`) 전용**이며, 쓰기(`UPSERT`)는 차단되어 있습니다.
3. **Project Settings ➔ API**에서 아래 3개 값을 확인합니다.
   - `Project URL` (`SUPABASE_URL`)
   - `anon public key` (`SUPABASE_ANON_KEY` — 브라우저 읽기 전용)
   - `service_role secret key` (`SUPABASE_SERVICE_ROLE_KEY` — 크롤러 DB 적재 필수)

### Step 3. GitHub Repository Secrets 등록 (크롤러 및 DB 연동)
저장소의 **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**에서 등록합니다:
- `SUPABASE_URL`: Supabase 루트 Project URL (예: `https://<project-ref>.supabase.co` — 뒤에 `/rest/v1` 경로를 붙이지 마세요)
- `SUPABASE_SERVICE_ROLE_KEY`: (Supabase `service_role` 키 — [crawler-cron.yml](.github/workflows/crawler-cron.yml)의 DB Upsert에 **필수**)
- `SUPABASE_ANON_KEY`: (Supabase `anon public` 키 — [deploy-pages.yml](.github/workflows/deploy-pages.yml) 빌드 시 프론트엔드 읽기 키로 주입됨. 선택적으로 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 이름으로도 분리 가능)

> **자동 수집 스케줄**: [crawler-cron.yml](.github/workflows/crawler-cron.yml)은 **매일 한국 시각 자정 (`00:00 KST` / `15:00 UTC`, `cron: '0 15 * * *'`)** 에 실행되어 수집 결과를 Supabase에 적재하고 `public/data/jobs.json` 캐시를 자동 커밋·재배포합니다.  
> Supabase Secrets를 등록하지 않아도 크롤러가 `public/data/jobs.json` 파일을 자동 갱신하므로 서비스는 문제없이 작동합니다.

---

## 5. 기술 스택 (Tech Stack)

| 계층 | 기술 스택 | 설명 |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | TypeScript 기반, `output: 'export'` 정적 내보내기 및 `NEXT_PUBLIC_BASE_PATH` 서브경로 지원 |
| **State Management** | **Zustand** | 단일 전역 스토어(`useAppStore`) 및 독립 모달/드로어 컴포넌트 모듈화 |
| **Styling & Typography** | **Tailwind CSS 3.4** | `simple-modern-mono` 다크 모노크롬, Google Fonts(`Inter`, `JetBrains Mono`) + jsDelivr(`Pretendard v1.3.9` 다이나믹 서브셋) |
| **Hosting & CI/CD** | **GitHub Pages + Actions** | `deploy-pages.yml` 단일 자동 빌드·게시 파이프라인 |
| **Database & Cache** | **Supabase (PostgreSQL) + JSON Fallback** | RLS 기반 `SELECT` 조회 + 4시간 `localStorage` 캐시 + `public/data/jobs.json` 폴백 |
| **Automated Crawler** | **GitHub Actions Cron + Cheerio** | 매일 자정(`00:00 KST`) ALIO·삼일PwC·딜로이트 안진 무인 수집 및 `SERVICE_ROLE_KEY` Upsert |

---

## 6. 문서 디렉토리 & 라이선스

- **데이터베이스 스키마 DDL**: [`supabase_schema.sql`](./supabase_schema.sql)
- **시스템 기획 및 리뷰 문서**: [`Career_Radar_Universal_Prototype_Implementation_Plan.md`](./Career_Radar_Universal_Prototype_Implementation_Plan.md), [`Career_Radar_Universal_Master_Plan_v2.0.md`](./Career_Radar_Universal_Master_Plan_v2.0.md), [`Career_Radar_Universal_Dual_Review_Report.md`](./Career_Radar_Universal_Dual_Review_Report.md)

Copyright © 2026 [489156](https://github.com/489156). All rights reserved.
