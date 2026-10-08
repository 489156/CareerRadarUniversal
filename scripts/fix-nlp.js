const fs = require('fs');
let content = fs.readFileSync('src/lib/matcher.ts', 'utf-8');

content = content.replace("(job.rawText || '').slice(0, 150),", "");

content = content.replace(
  /(domain === 'TECH' && \(job\.occupation === 'TECH' \|\| jobText\.includes\('개발'\) \|\| jobText\.includes\('data'\)\)) \|\|/g,
  "(domain === 'TECH' && job.occupation === 'TECH') ||"
);
content = content.replace(
  /(domain === 'FINANCE' && \(job\.occupation === 'FINANCE' \|\| jobText\.includes\('회계'\) \|\| jobText\.includes\('finance'\)\)) \|\|/g,
  "(domain === 'FINANCE' && job.occupation === 'FINANCE') ||"
);
content = content.replace(
  /(domain === 'HR' && \(job\.occupation === 'HR' \|\| jobText\.includes\('인사'\) \|\| jobText\.includes\('채용'\)\)) \|\|/g,
  "(domain === 'HR' && job.occupation === 'HR') ||"
);
content = content.replace(
  /(domain === 'PLANNING' && \(job\.occupation === 'PLANNING' \|\| jobText\.includes\('기획'\) \|\| jobText\.includes\('컨설팅'\)\)) \|\|/g,
  "(domain === 'PLANNING' && job.occupation === 'PLANNING') ||"
);
content = content.replace(
  /(domain === 'MARKETING' && \(job\.occupation === 'MARKETING' \|\| jobText\.includes\('마케팅'\)\))/g,
  "(domain === 'MARKETING' && job.occupation === 'MARKETING')"
);

fs.writeFileSync('src/lib/matcher.ts', content, 'utf-8');
console.log('Fixed NLP heuristics');
