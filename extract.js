const fs = require('fs');
const cal = fs.readFileSync('calendar/index.html', 'utf8');

// Extract CSS
const cssStart = cal.indexOf('.eye-socket {');
let cssEnd = cal.indexOf('/* =============================================\r\n           MOBILE RESPONSIVE');
if (cssEnd === -1) cssEnd = cal.indexOf('/* ===', cssStart);
let css = cal.substring(cssStart, cssEnd).trim();
fs.writeFileSync('owl.css', css);

// Extract HTML
const htmlStart = cal.indexOf('<div class="owl-scene">');
const htmlEnd = cal.indexOf('</div>\r\n                    <span class="text-accent"');
let html = cal.substring(htmlStart, htmlEnd + 6).trim();
fs.writeFileSync('owl.html', html);
console.log('Done CSS length:', css.length, 'HTML length:', html.length);
