const fs = require('fs');
let content = fs.readFileSync('src/store/useAppStore.ts', 'utf-8');
content = content.replace(/radarFilter: "ALL" \| "RECOMMENDED" \| "GOOD_COMMUTE" \| "NO_OT" \| "ENTRY";/g, 'radarFilter: "all" | "entry" | "tech" | "finance" | "marketing" | "exclusive" | "consulting" | "public" | "conglomerate" | "globalTech" | "tierA" | "highMatch" | "commuteFit" | "nonOT";');
content = content.replace(/setRadarFilter: \(filter: "ALL" \| "RECOMMENDED" \| "GOOD_COMMUTE" \| "NO_OT" \| "ENTRY"\) => void;/g, 'setRadarFilter: (filter: "all" | "entry" | "tech" | "finance" | "marketing" | "exclusive" | "consulting" | "public" | "conglomerate" | "globalTech" | "tierA" | "highMatch" | "commuteFit" | "nonOT") => void;');
content = content.replace(/radarFilter: "ALL",/g, 'radarFilter: "all",');
fs.writeFileSync('src/store/useAppStore.ts', content, 'utf-8');
console.log('Fixed radar filter correctly');
