const fs = require('fs');
const execSync = require('child_process').execSync;

const originalPage = execSync('git show HEAD:src/app/page.tsx').toString();
const origLines = originalPage.split('\n');
const start = origLines.findIndex(l => l.includes('{/* Job Detail Modal */}'));
const end = origLines.length;
const modalJSX = origLines.slice(start, end - 3).join('\n'); // Excluding the last few lines

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
${modalJSX}
    </>
  );
}
`;

fs.writeFileSync('src/components/JobDetailModal.tsx', componentContent, 'utf-8');
console.log('Fixed JobDetailModal');
