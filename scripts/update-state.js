const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace local state with store call
content = content.replace('const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);', 'const isResumeModalOpen = useAppStore(state => state.isResumeModalOpen);\n  const setIsResumeModalOpen = useAppStore(state => state.setIsResumeModalOpen);');

fs.writeFileSync('src/app/page.tsx', content, 'utf-8');
console.log('States updated');
