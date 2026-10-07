import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

html = html.replace("['all', 'exclusive', 'consulting'", "['all', 'entry', 'tech', 'finance', 'marketing', 'exclusive', 'consulting'");

// Ensure radar filtering handles entry, tech, finance, marketing
const targetFilter = `if (currentRadarFilter === 'entry') {
          const isEntryJob = (j.minYears === 0) || j.isEntryLevel || (j.tags || []).some(function(t) { return t.includes('신입') || t.includes('인턴'); }) || j.title.includes('인턴') || j.title.includes('신입');
          if (!isEntryJob) return false;
        }
        if (currentRadarFilter === 'tech' && j.occupation !== 'TECH' && !j.title.includes('SW') && !j.title.includes('개발') && !j.title.includes('Cloud')) return false;
        if (currentRadarFilter === 'finance' && j.occupation !== 'FINANCE' && !j.title.includes('회계') && !j.title.includes('재무')) return false;
        if (currentRadarFilter === 'marketing' && j.occupation !== 'MARKETING' && !j.title.includes('마케팅')) return false;`;

if (!html.includes("currentRadarFilter === 'entry'")) {
  html = html.replace(
    "if (currentRadarFilter === 'exclusive' && !j.isCompanyExclusive) return false;",
    `${targetFilter}\n        if (currentRadarFilter === 'exclusive' && !j.isCompanyExclusive) return false;`
  );
}

fs.writeFileSync(indexPath, html, 'utf-8');
console.log("Successfully updated allFilterKeys and filter logic in index.html!");
