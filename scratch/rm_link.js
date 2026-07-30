const fs=require('fs'); 
let f=fs.readFileSync('pricing/index.html','utf8'); 
f=f.replace(/          <li><a href="#quote" onclick="openTab\('quote'\)">Get Quote<\/a><\/li>\r?\n/g, ''); 
fs.writeFileSync('pricing/index.html',f);
