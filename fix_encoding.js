const fs = require('fs');

const file = 'd:/NEW WEBSITE/index.html';
let content = fs.readFileSync(file, 'utf8');

// Replace the garbled rupee symbol with proper rupee symbol
content = content.replace(/₹/g, '₹');

// Let's also fix the garbled em dash
content = content.replace(/—/g, '—');
content = content.replace(/—/g, '—');

// Fix any potential A-tilde marks left
content = content.replace(//g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed calculator encoding issues.');
