const fs = require('fs');
const path = require('path');

const walk = dir => fs.readdirSync(dir).reduce((files, file) => {
  const name = path.join(dir, file);
  return fs.statSync(name).isDirectory() ? [...files, ...walk(name)] : [...files, name];
}, []);

walk('src').forEach(f => {
  if (f.endsWith('.tsx') || f.endsWith('.ts')) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('onOpenLeadAction')) {
      fs.writeFileSync(f, c.replace(/onOpenLeadAction/g, 'onOpenLead'));
      console.log('Updated', f);
    }
  }
});
