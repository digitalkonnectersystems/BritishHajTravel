const fs = require('fs');
const content = fs.readFileSync('e:/WordPress Plugins/DKS Projects/king-travel-can-nxt/src/app/admin/pages/edit/page.tsx', 'utf-8');
const lines = content.split('\n');
const mappedTypes = new Set();
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('case ') || lines[i].includes('=== "') || lines[i].includes("=== '")) {
    const match1 = lines[i].match(/case\s+['"]([^'"]+)['"]/);
    if(match1) mappedTypes.add(match1[1]);
    const match2 = lines[i].match(/===\s+['"]([^'"]+)['"]/);
    if(match2) mappedTypes.add(match2[1]);
  }
}
console.log('Types mentioned in admin page:', Array.from(mappedTypes));
