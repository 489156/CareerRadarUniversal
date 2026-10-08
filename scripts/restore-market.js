const fs = require('fs');
const execSync = require('child_process').execSync;

const originalPage = execSync('git show HEAD:src/app/page.tsx').toString();
const origLines = originalPage.split('\n');
const start = origLines.findIndex(l => l.includes('{/* Market Value Methodology Modal */}'));
const end = origLines.findIndex(l => l.includes('{/* Skill Gap & 28 Expanded Opportunities Modal */}'));
const modalJSX = origLines.slice(start, end).join('\n');

const componentContent = `import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateEstimatedMarketValue } from '@/lib/matcher';
import { calculateLifeAdjustedHourlyWage } from '@/lib/calculator';

export function MarketValueModal() {
  const isMarketValueModalOpen = useAppStore(state => state.isMarketValueModalOpen);
  const setIsMarketValueModalOpen = useAppStore(state => state.setIsMarketValueModalOpen);
  const passport = useAppStore(state => state.passport);

  const marketValue = calculateEstimatedMarketValue(passport);
  const currentTotalCash = passport.baseSalary + passport.fixedAllowance + passport.variableBonus;

  return (
    <>
${modalJSX}
    </>
  );
}
`;
fs.writeFileSync('src/components/MarketValueModal.tsx', componentContent, 'utf-8');
console.log('Restored exactly from git');
