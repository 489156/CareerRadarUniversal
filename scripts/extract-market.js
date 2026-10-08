const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf-8').split('\n');
// Extract lines 1447 to 1580 (0-indexed: 1446 to 1580)
const modalJSX = lines.slice(1446, 1580).join('\n');

const componentContent = `import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateEstimatedMarketValue } from '@/lib/matcher';
import { calculateLifeAdjustedHourlyWage } from '@/lib/calculator';

export function MarketValueModal() {
  const isMarketValueModalOpen = useAppStore(state => state.isMarketValueModalOpen);
  const setIsMarketValueModalOpen = useAppStore(state => state.setIsMarketValueModalOpen);
  const passport = useAppStore(state => state.passport);

  if (!isMarketValueModalOpen) return null;

  return (
${modalJSX.replace(/\{isMarketValueModalOpen && \(/, '').replace(/^\s*\}\)\s*$/m, '')}
  );
}
`;

fs.writeFileSync('src/components/MarketValueModal.tsx', componentContent, 'utf-8');

// Replace in page.tsx
lines.splice(1446, 134, '      <MarketValueModal />');

// Inject import
if (!lines.find(l => l.includes('import { MarketValueModal }'))) {
  const importIndex = lines.findIndex(l => l.includes('import { ResumeModal }'));
  lines.splice(importIndex + 1, 0, 'import { MarketValueModal } from "@/components/MarketValueModal";');
}

fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf-8');
console.log('MarketValueModal created and injected');
