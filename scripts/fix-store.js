const fs = require('fs');
let content = fs.readFileSync('src/store/useAppStore.ts', 'utf-8');
const oldType = "radarFilter: 'ALL' | 'RECOMMENDED' | 'ENTRY' | 'GOOD_COMMUTE' | 'NO_OT';";
const newType = 'radarFilter: "all" | "entry" | "tech" | "finance" | "marketing" | "exclusive" | "consulting" | "public" | "conglomerate" | "globalTech" | "tierA" | "highMatch" | "commuteFit" | "nonOT";';
content = content.replace(oldType, newType);
content = content.replace("radarFilter: 'ALL',", 'radarFilter: "all",');
fs.writeFileSync('src/store/useAppStore.ts', content, 'utf-8');
console.log('Fixed radarFilter type');
