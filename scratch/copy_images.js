const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/USER/.gemini/antigravity/brain/984c8ebc-c20a-4429-83b4-9e9de5d6fa08/.user_uploaded/';
const destDir = 'd:/website/assets/proof/';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Map the numeric suffixes to descriptive names based on visual analysis order
const map = {
  'media_1789699864825.png': 'fh-gsc-performance.png',
  'media_1789699864835.png': 'personal-ga4-dashboard.png',
  'media_1789699864841.png': 'fh-google-ads-dashboard.png',
  'media_1789699864844.png': 'kalpaka-meta-ads.png',
  'media_1789699864849.png': 'personal-pagespeed-insights.png'
};

for (const [srcFile, destFile] of Object.entries(map)) {
  const src = path.join(srcDir, srcFile);
  const dest = path.join(destDir, destFile);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${srcFile} to ${destFile}`);
  }
}
