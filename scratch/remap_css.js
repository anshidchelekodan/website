const fs = require('fs');
let css = fs.readFileSync('d:/website/style.css', 'utf8');
css = css.replace(/rgba\(98,\s*255,\s*176,/g, 'rgba(225, 29, 72,');
css = css.replace(/rgba\(46,\s*230,\s*166,/g, 'rgba(225, 29, 72,');
css = css.replace(/#62ffb0/gi, '#E11D48');
css = css.replace(/#4FFFB0/gi, '#FB7185');
css = css.replace(/#2EE6A6/gi, '#E11D48');
fs.writeFileSync('d:/website/style.css', css);
const min = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .trim();
fs.writeFileSync('d:/website/style.min.css', min);
console.log('ok', min.length);
