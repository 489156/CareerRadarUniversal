const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

if (!content.includes('import { useAppStore } from "@/store/useAppStore";')) {
  content = content.replace(
    'import { CareerPassport',
    'import { useAppStore } from "@/store/useAppStore";\nimport { CareerPassport'
  );
}

fs.writeFileSync('src/app/page.tsx', content, 'utf-8');
console.log('Import injected.');
