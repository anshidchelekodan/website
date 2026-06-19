const fs = require('fs');
const files = [
    'd:/NEW WEBSITE/index.html',
    'd:/NEW WEBSITE/services/index.html',
    'd:/NEW WEBSITE/services/seo-optimization/index.html'
];

for (let file of files) {
    if (!fs.existsSync(file)) continue;
    
    // Read assuming UTF-8 or UTF-16
    let content = fs.readFileSync(file);
    let strContent = content.toString('utf16le');
    if (!strContent.includes('<html')) {
        strContent = content.toString('utf8');
    }
    
    if (strContent.includes('<li><a href="') && !strContent.includes('>Pricing</a>')) {
        // Regex to insert Pricing after Services in nav links
        strContent = strContent.replace(/(<li><a[^>]*>Services<\/a><\/li>)/g, '$1\n          <li><a href="/pricing/">Pricing</a></li>');
        
        // Write back as UTF-8
        fs.writeFileSync(file, strContent, 'utf8');
        console.log('Updated ' + file);
    }
}
