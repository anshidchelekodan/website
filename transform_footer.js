// transform_footer.js
// Update footer-bottom across all HTML files to separate legal links.
const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir, arr = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip hidden
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git'].includes(entry.name)) continue;
      getAllHtmlFiles(fullPath, arr);
    } else if (fullPath.endsWith('.html')) {
      arr.push(fullPath);
    }
  }
  return arr;
}

function replaceFooter(content) {
  // Find the whole <div class="footer-bottom">...</div> block (including inner markup)
  const footerRegex = /<div class="footer-bottom">[\s\S]*?<\/div>/i;
  const match = content.match(footerRegex);
  if (!match) return content; // fallback: nothing to change

  // Build the new markup – keep existing spacing/indentation style modestly aligned.
  const newFooter = `
    <div class="footer-bottom">
      <span class="footer-copy">&copy; <time datetime="2026">2026</time> Mohammad Anshid Ck. All rights reserved.</span>
      <div class="legal-links">
        <a href="https://www.anshidck.com/privacy-policy/" class="legal-link">Privacy Policy</a>
        <a href="https://www.anshidck.com/sitemap.xml" class="legal-link">Sitemap</a>
      </div>
    </div>`;

  return content.replace(footerRegex, newFooter);
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = replaceFooter(original);
  if (original !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Updated:', filePath);
  }
}

const allHtml = getAllHtmlFiles('d:/website');
allHtml.forEach(processFile);
console.log('Footer transformation complete. Processed', allHtml.length, 'files.');
