const fs = require('fs');
const execSync = require('child_process').execSync;

const originalPage = execSync('git show HEAD:src/app/page.tsx').toString();
const origLines = originalPage.split('\n');
const start = origLines.findIndex(l => l.includes('{/* Skill Gap & 28 Expanded Opportunities Modal */}'));
const end = origLines.findIndex(l => l.includes('{/* Universal Multi-Source Crawler Network Modal */}'));
const modalJSX = origLines.slice(start, end).join('\n');

const componentContent = `import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EXPANDED_SKILL_GAP_TRACKS } from '@/lib/matcher';

export function SkillGapModal() {
  const isSkillGapModalOpen = useAppStore(state => state.isSkillGapModalOpen);
  const setIsSkillGapModalOpen = useAppStore(state => state.setIsSkillGapModalOpen);
  const activeSkillTrackId = useAppStore(state => state.activeSkillTrackId);
  const setActiveSkillTrackId = useAppStore(state => state.setActiveSkillTrackId);

  if (!isSkillGapModalOpen) return null;

  return (
    <>
${modalJSX}
    </>
  );
}
`;

fs.writeFileSync('src/components/SkillGapModal.tsx', componentContent, 'utf-8');

// Replace in page.tsx
const pageLines = fs.readFileSync('src/app/page.tsx', 'utf-8').split('\n');
const pgStart = pageLines.findIndex(l => l.includes('{/* Skill Gap & 28 Expanded Opportunities Modal */}'));
const pgEnd = pageLines.findIndex(l => l.includes('{/* Universal Multi-Source Crawler Network Modal */}'));
pageLines.splice(pgStart, pgEnd - pgStart, '      <SkillGapModal />');

if (!pageLines.find(l => l.includes('import { SkillGapModal }'))) {
  const importIndex = pageLines.findIndex(l => l.includes('import { MarketValueModal }'));
  pageLines.splice(importIndex + 1, 0, 'import { SkillGapModal } from "@/components/SkillGapModal";');
}

fs.writeFileSync('src/app/page.tsx', pageLines.join('\n'), 'utf-8');
console.log('SkillGapModal created and injected');
