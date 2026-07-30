const fs = require('fs');
const path = require('path');

const pricingFile = path.join('d:', 'website', 'pricing', 'index.html');
let html = fs.readFileSync(pricingFile, 'utf8');

// Ensure fonts are fixed by replacing common font issues
html = html.replace(/<h3 style="color:#fff;/g, '<h3 style="color:#fff; font-family: var(--font-heading, \'Montserrat\', sans-serif);');
html = html.replace(/<h2 class="step-title"/g, '<h2 class="step-title" style="font-family: var(--font-heading, \'Montserrat\', sans-serif);"');

// Make sure inputs and selects have the proper font family
if (!html.includes('font-family: var(--font-body, \'Montserrat\'')) {
    html = html.replace(/\.form-control \{/g, '.form-control {\n  font-family: var(--font-body, \'Montserrat\', sans-serif);');
}

fs.writeFileSync(pricingFile, html, 'utf8');
console.log("Font fixes applied!");
