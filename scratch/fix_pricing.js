const fs = require('fs');
const path = require('path');

const pricingFile = path.join('d:', 'website', 'pricing', 'index.html');
let html = fs.readFileSync(pricingFile, 'utf8');

// Replace mojibake for Rupee symbol
html = html.replace(/â,¹/g, '₹');
html = html.replace(/,1/g, '₹');

// Let's also do a safe search for any place that says "Starts at XXX15,000"
html = html.replace(/Starts at [^0-9]+15,000/g, 'Starts at ₹15,000');
html = html.replace(/Starts at [^0-9]+250\/day/g, 'Starts at ₹250/day');
html = html.replace(/Starts at [^0-9]+12,000/g, 'Starts at ₹12,000');
html = html.replace(/Starts at [^0-9]+10,000/g, 'Starts at ₹10,000');

// Replace inside the script for Custom Plans (e.g. Starter (,115k/mo))
html = html.replace(/\([^0-9]+15k\/mo\)/g, '(₹15k/mo)');
html = html.replace(/\([^0-9]+25k\/mo\)/g, '(₹25k/mo)');
html = html.replace(/\([^0-9]+30k\/mo\)/g, '(₹30k/mo)');
html = html.replace(/\([^0-9]+12k\/mo\)/g, '(₹12k/mo)');
html = html.replace(/\([^0-9]+20k\/mo\)/g, '(₹20k/mo)');
html = html.replace(/\([^0-9]+10k\/mo\)/g, '(₹10k/mo)');
html = html.replace(/\([^0-9]+25k\)/g, '(₹25k)');
html = html.replace(/\([^0-9]+50k\+\)/g, '(₹50k+)');
html = html.replace(/\([^0-9]+15k\)/g, '(₹15k)');
html = html.replace(/\([^0-9]+30k\)/g, '(₹30k)');
html = html.replace(/\([^0-9]+50k\)/g, '(₹50k)');
html = html.replace(/\(\+[^0-9]+5k\)/g, '(+₹5k)');
html = html.replace(/\(\+[^0-9]+8k\)/g, '(+₹8k)');
html = html.replace(/\(\+[^0-9]+4k\)/g, '(+₹4k)');
html = html.replace(/\(\+[^0-9]+3k\)/g, '(+₹3k)');

// Fix openTab function to not rely on event.currentTarget so it can be called programmatically
if (html.includes('event.currentTarget.classList.add(\'active\');')) {
    html = html.replace(
        "event.currentTarget.classList.add('active');",
        "// Find the button and add active class\n      const btn = document.querySelector(`.tab-btn[onclick=\"openTab('\${tabId}')\"]`);\n      if(btn) btn.classList.add('active');"
    );
}

// Add URL param listener
if (!html.includes('const urlParams = new URLSearchParams')) {
    html = html.replace(
        'document.addEventListener(\'DOMContentLoaded\', () => {',
        `document.addEventListener('DOMContentLoaded', () => {
      // Auto-open tab based on URL param
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && document.getElementById(tabParam)) {
          openTab(tabParam);
      }`
    );
}

fs.writeFileSync(pricingFile, html, 'utf8');
console.log("Pricing fixes applied safely!");

// Clean up quote dir
try {
    const quoteDir = path.join('d:', 'website', 'quote');
    fs.rmSync(quoteDir, { recursive: true, force: true });
    console.log("Deleted old quote folder");
} catch(e) {}
