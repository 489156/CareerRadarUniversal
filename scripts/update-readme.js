const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf-8');

const oldTechStack = `| 계층 | 기술 스택 | 설명 |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | TypeScript 기반의 모던 웹 아키텍처, \`output: 'export'\` SSG 모드 |
| **Styling & Design** | **Tailwind CSS 3.4** | Vercel / Linear 감성의 모던 Slate 다크 테마 |
| **Edge Hosting** | **Cloudflare Pages / Workers** | 글로벌 엣지 무비용 초고속 정적 배포 (\`wrangler.toml\` assets 규격) |
| **Backend & BaaS** | **Supabase (PostgreSQL)** | REST API 통신, RLS 보안 정책, 브라우저 4시간 TTL 로컬 캐싱 |
| **Automated Crawler** | **GitHub Actions Cron + Cheerio** | 매일 자정 18대 채널 무인 스크래핑 및 Supabase Upsert |`;

const newTechStack = `| 계층 | 기술 스택 | 설명 |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | TypeScript 기반의 모던 웹 아키텍처, \`output: 'export'\` SSG 모드 |
| **State Management** | **Zustand** | 단일 전역 스토어(\`useAppStore\`) 기반의 초경량/고성능 상태 관리 및 UI 컴포넌트 모듈화 |
| **Styling & Design** | **Tailwind CSS 3.4** | Vercel / Linear 감성의 모던 Slate 다크 테마 |
| **Edge Hosting** | **Cloudflare Pages / Workers** | 글로벌 엣지 무비용 초고속 정적 배포 (\`wrangler.toml\` assets 규격) |
| **Backend & BaaS** | **Supabase (PostgreSQL)** | REST API 통신, RLS 보안 정책, 브라우저 4시간 TTL 로컬 캐싱 |
| **Automated Crawler** | **GitHub Actions Cron + Cheerio** | 매일 자정 18대 채널 무인 스크래핑 및 Supabase Upsert |`;

content = content.replace(oldTechStack, newTechStack);

const archNote = `🚀 **최신 아키텍처 업데이트**: 단일 파일(Monolithic) 뷰 구조에서 벗어나, **Zustand 전역 상태 관리**를 도입하고 모든 거대 팝업 모달을 독립 컴포넌트(\`src/components/\`)로 100% 분리하는 대규모 리팩토링을 완료했습니다. 데이터 패칭 로직 또한 하드코딩 Mock 데이터에서 **Supabase 실시간 연동**으로 전환되었습니다.\n\n### 아키텍처 3대 안정성 안전망`;

content = content.replace('### 아키텍처 3대 안정성 안전망', archNote);

fs.writeFileSync('README.md', content, 'utf-8');
console.log('README.md updated!');
