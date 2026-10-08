const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Import ResumeModal
if (!content.includes('import { ResumeModal }')) {
  const importIndex = lines.findIndex(line => line.includes('export default function Home()'));
  lines.splice(importIndex, 0, 'import { ResumeModal } from "@/components/ResumeModal";');
}

// Write back
fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf-8');
console.log('ResumeModal injected.');
