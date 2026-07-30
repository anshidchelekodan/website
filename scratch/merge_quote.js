const fs = require('fs');
const path = require('path');

const quoteFile = path.join('d:', 'website', 'quote', 'index.html');
const pricingFile = path.join('d:', 'website', 'pricing', 'index.html');
const navFiles = [
    path.join('d:', 'website', 'index.html'),
    path.join('d:', 'website', 'pricing', 'index.html')
];

// 1. Read quote/index.html and extract the needed parts
let quoteHtml = fs.readFileSync(quoteFile, 'utf8');
// Fix encoding if it's messed up
quoteHtml = quoteHtml.replace(/â,¹/g, '&#8377;').replace(/₹/g, '&#8377;');

// Extract style
const styleMatch = quoteHtml.match(/<style>\s*\/\* Custom Quote Builder Styles \*\/[\s\S]*?<\/style>/);
const style = styleMatch ? styleMatch[0] : '';

// Extract builder wrapper and success screen
const builderMatch = quoteHtml.match(/<div id="builder-wrapper" class="quote-layout">[\s\S]*?<div id="success-screen" class="success-screen">[\s\S]*?<\/div>\s*<\/div>/);
let builderHtml = builderMatch ? builderMatch[0] : '';

// Extract script
const scriptMatch = quoteHtml.match(/<script>\s*\/\* ==========================================\s*\*\/[\s\S]*?<\/script>/);
let scriptHtml = scriptMatch ? scriptMatch[0] : '';
// Replace Rupee in script to unicode \u20B9
scriptHtml = scriptHtml.replace(/&#8377;/g, '\\u20B9');

if (!builderHtml) {
    console.error("Could not extract builder HTML");
    process.exit(1);
}

// 2. Read pricing/index.html
let pricingHtml = fs.readFileSync(pricingFile, 'utf8');
pricingHtml = pricingHtml.replace(/â,¹/g, '&#8377;').replace(/₹/g, '&#8377;'); // Fix encoding here too just in case

// Add Tab Button
if (!pricingHtml.includes("onclick=\"openTab('quote')\"")) {
    pricingHtml = pricingHtml.replace(
        /<button class="tab-btn" onclick="openTab\('growth'\)">.*?<\/button>/,
        `$&
        <button class="tab-btn" onclick="openTab('quote')" style="background: linear-gradient(135deg, rgba(98, 255, 176, 0.2), rgba(46, 230, 166, 0.05)); border-color: var(--accent-color); color: #fff;"><i class="fas fa-calculator" style="color: var(--accent-color);"></i> Quote Builder</button>`
    );
}

// Add Tab Content right before </section> that holds the tabs
if (!pricingHtml.includes('id="quote" class="tab-content"')) {
    const tabContent = `
        <!-- QUOTE BUILDER TAB -->
        <div id="quote" class="tab-content">
          <div class="web-intro" style="text-align: center; margin-bottom: 3rem;">
            <h2 style="font-size: clamp(1.8rem, 4vw, 2.5rem); margin-bottom: 0.5rem; color: #fff; font-weight: 800;">Custom <span class="text-accent">Quote Builder</span></h2>
            <p style="color: var(--text-secondary); max-width: 800px; margin: 0 auto; line-height: 1.6;">Build your ideal digital marketing package. Select the services you need, customize your plans, and get an instant live estimate.</p>
          </div>
          ${builderHtml}
        </div>
    `;
    
    // Find where the last tab content ends. The last one is currently 'growth' or 'web'
    pricingHtml = pricingHtml.replace(
        /<!-- GROWTH PACKAGES TAB -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/,
        match => {
            return match.replace(/<\/div>\s*<\/div>\s*<\/section>$/, `</div>\n${tabContent}\n</div>\n</div>\n</section>`);
        }
    );
}

// Add Style inside head
if (!pricingHtml.includes("/* Custom Quote Builder Styles */")) {
    pricingHtml = pricingHtml.replace('</head>', `${style}\n</head>`);
}

// Add Script before </body>
if (!pricingHtml.includes("const PRICING = {")) {
    pricingHtml = pricingHtml.replace('</body>', `${scriptHtml}\n</body>`);
}

// Update nav link in pricing/index.html to point to itself with #quote, or rather ?tab=quote
pricingHtml = pricingHtml.replace(/<a href="\.\.\/quote\/">Get Quote<\/a>/g, '<a href="#quote" onclick="openTab(\'quote\')">Get Quote</a>');
pricingHtml = pricingHtml.replace(/<a href="quote\/">Get Quote<\/a>/g, '<a href="#quote" onclick="openTab(\'quote\')">Get Quote</a>');

fs.writeFileSync(pricingFile, pricingHtml, 'utf8');
console.log("Updated pricing/index.html");

// 3. Update index.html to link to pricing/#quote instead of quote/
let indexHtml = fs.readFileSync(navFiles[0], 'utf8');
indexHtml = indexHtml.replace(/href="quote\/"/g, 'href="pricing/?tab=quote"');
indexHtml = indexHtml.replace(/href="\.\.\/quote\/"/g, 'href="pricing/?tab=quote"');
fs.writeFileSync(navFiles[0], indexHtml, 'utf8');
console.log("Updated index.html");
