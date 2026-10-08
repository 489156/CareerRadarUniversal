const fs = require('fs');
const execSync = require('child_process').execSync;

const originalPage = execSync('git show HEAD:src/app/page.tsx').toString();
const origLines = originalPage.split('\n');
const start = origLines.findIndex(l => l.includes('{/* Job Detail Modal */}'));
const end = origLines.length; // It's at the end of the file
const modalJSX = origLines.slice(start, end).join('\n');

const componentContent = `import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export function JobDetailModal() {
  const selectedJob = useAppStore(state => state.selectedJob);
  const setSelectedJob = useAppStore(state => state.setSelectedJob);
  const selectedJobMatch = useAppStore(state => state.selectedJobMatch);
  const selectedJobHf = useAppStore(state => state.selectedJobHf);

  if (!selectedJob) return null;

  return (
    <>
${modalJSX.replace(/\{selectedJob && \(/, '').replace(/      \)\}\s*$/, '')}
    </>
  );
}
`;

fs.writeFileSync('src/components/JobDetailModal.tsx', componentContent, 'utf-8');

// Clean up closing brace if regex missed it
const cmLines = fs.readFileSync('src/components/JobDetailModal.tsx', 'utf-8').split('\n');
const cmCleaned = cmLines.filter(l => !l.includes('      )}'));
fs.writeFileSync('src/components/JobDetailModal.tsx', cmCleaned.join('\n'), 'utf-8');

// Replace in page.tsx
const pageLines = fs.readFileSync('src/app/page.tsx', 'utf-8').split('\n');
const pgStart = pageLines.findIndex(l => l.includes('{/* Job Detail Modal */}'));
pageLines.splice(pgStart, pageLines.length - pgStart, '      <JobDetailModal />\n    </main>\n  );\n}');

if (!pageLines.find(l => l.includes('import { JobDetailModal }'))) {
  const importIndex = pageLines.findIndex(l => l.includes('import { CrawlerModal }'));
  pageLines.splice(importIndex + 1, 0, 'import { JobDetailModal } from "@/components/JobDetailModal";');
}

fs.writeFileSync('src/app/page.tsx', pageLines.join('\n'), 'utf-8');
console.log('JobDetailModal extracted');
