const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  content = content.replace(/#E11D48/gi, '#62ffb0');
  content = content.replace(/#FB7185/gi, '#4FFFB0');
  content = content.replace(/rgba\(\s*225\s*,\s*29\s*,\s*72/gi, 'rgba(98, 255, 176');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        traverseDir(fullPath);
      }
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  });
}

traverseDir('d:/website');
console.log('Color replacement complete.');
