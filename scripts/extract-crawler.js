const fs = require('fs');
const execSync = require('child_process').execSync;

const originalPage = execSync('git show HEAD:src/app/page.tsx').toString();
const origLines = originalPage.split('\n');
const start = origLines.findIndex(l => l.includes('{/* Universal Multi-Source Crawler Network Modal */}'));
const end = origLines.findIndex(l => l.includes('{/* Job Detail Modal */}'));
const modalJSX = origLines.slice(start, end).join('\n');

const componentContent = `import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CRAWLER_SOURCES, getCrawlerNetworkStats } from '@/lib/crawler';

export function CrawlerModal() {
  const isCrawlerModalOpen = useAppStore(state => state.isCrawlerModalOpen);
  const setIsCrawlerModalOpen = useAppStore(state => state.setIsCrawlerModalOpen);
  const crawlerCategoryFilter = useAppStore(state => state.crawlerCategoryFilter);
  const setCrawlerCategoryFilter = useAppStore(state => state.setCrawlerCategoryFilter);

  if (!isCrawlerModalOpen) return null;

  return (
    <>
${modalJSX.replace(/\{isCrawlerModalOpen && \(/, '').replace(/      \)\}\s*$/, '')}
    </>
  );
}
`;

fs.writeFileSync('src/components/CrawlerModal.tsx', componentContent, 'utf-8');

// Clean up closing brace if regex missed it
const cmLines = fs.readFileSync('src/components/CrawlerModal.tsx', 'utf-8').split('\n');
const cmCleaned = cmLines.filter(l => !l.includes('      )}'));
fs.writeFileSync('src/components/CrawlerModal.tsx', cmCleaned.join('\n'), 'utf-8');

// Replace in page.tsx
const pageLines = fs.readFileSync('src/app/page.tsx', 'utf-8').split('\n');
const pgStart = pageLines.findIndex(l => l.includes('{/* Universal Multi-Source Crawler Network Modal */}'));
const pgEnd = pageLines.findIndex(l => l.includes('{/* Job Detail Modal */}'));
pageLines.splice(pgStart, pgEnd - pgStart, '      <CrawlerModal />');

if (!pageLines.find(l => l.includes('import { CrawlerModal }'))) {
  const importIndex = pageLines.findIndex(l => l.includes('import { SkillGapModal }'));
  pageLines.splice(importIndex + 1, 0, 'import { CrawlerModal } from "@/components/CrawlerModal";');
}

fs.writeFileSync('src/app/page.tsx', pageLines.join('\n'), 'utf-8');
console.log('CrawlerModal extracted');
