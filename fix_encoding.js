const fs = require('fs');

const file = 'd:/NEW WEBSITE/index.html';
let content = fs.readFileSync(file, 'utf8');

// Replace the garbled rupee symbol with proper rupee symbol
content = content.replace(/Ã¢â€šÂ¹/g, '₹');

// Let's also fix the garbled em dash
content = content.replace(/Ã¢â‚¬â€/g, '—');
content = content.replace(/â€”/g, '—');

// Fix any potential A-tilde marks left
content = content.replace(/Ã‚/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed calculator encoding issues.');
