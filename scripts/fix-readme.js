const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf-8');

const oldLine = '| **Frontend Framework** | **Next.js 14 (App Router)** | TypeScript 기반의 모던 웹 아키텍처, `output: \'export\'` SSG 모드 |';
const newLine = oldLine + '\n| **State Management** | **Zustand** | 단일 전역 스토어(`useAppStore`) 기반의 초경량/고성능 상태 관리 및 UI 컴포넌트 모듈화 |';

content = content.replace(oldLine, newLine);
fs.writeFileSync('README.md', content, 'utf-8');
console.log('Fixed Tech Stack');
