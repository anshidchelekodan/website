const fs = require('fs');
let html = fs.readFileSync('pricing/index.html', 'utf8');

// Replace Daily Features
html = html.replace(/<li>Campaign setup<\/li>\s*<li>Audience targeting<\/li>\s*<li>Ad monitoring<\/li>\s*<li>Basic reporting<\/li>/, `<li>Basic Campaign Setup</li>\n                  <li>Single Ad Creative</li>\n                  <li>Standard Audience</li>\n                  <li>Weekly Check-in</li>`);

html = html.replace(/<li>Campaign setup<\/li>\s*<li>Audience targeting<\/li>\s*<li>Ad monitoring<\/li>\s*<li>Basic reporting<\/li>/, `<li>Advanced Campaign Setup</li>\n                  <li>A/B Tested Creatives</li>\n                  <li>Custom Audiences</li>\n                  <li>Daily Optimization</li>\n                  <li>Priority Support</li>`);

html = html.replace(/<li>Campaign setup<\/li>\s*<li>Audience targeting<\/li>\s*<li>Ad monitoring<\/li>\s*<li>Basic reporting<\/li>/, `<li>Full Funnel Strategy</li>\n                  <li>Unlimited Creatives</li>\n                  <li>Lookalike Audiences</li>\n                  <li>Real-time Monitoring</li>\n                  <li>Dedicated Account Rep</li>`);

// Replace Weekly Features
html = html.replace(/<li>Meta Ads management<\/li>\s*<li>Creative guidance<\/li>\s*<li>Audience optimization<\/li>\s*<li>Weekly performance report<\/li>\s*<li>Lead generation focus<\/li>/, `<li>Basic Ads Management</li>\n                  <li>Creative Guidance</li>\n                  <li>Core Audience Targeting</li>\n                  <li>Basic Lead Gen</li>\n                  <li>Bi-weekly Report</li>`);

html = html.replace(/<li>Meta Ads management<\/li>\s*<li>Creative guidance<\/li>\s*<li>Audience optimization<\/li>\s*<li>Weekly performance report<\/li>\s*<li>Lead generation focus<\/li>/, `<li>Advanced Ads Management</li>\n                  <li>A/B Creative Testing</li>\n                  <li>Lookalike Optimization</li>\n                  <li>High-intent Lead Gen</li>\n                  <li>Weekly Performance Report</li>`);

html = html.replace(/<li>Meta Ads management<\/li>\s*<li>Creative guidance<\/li>\s*<li>Audience optimization<\/li>\s*<li>Weekly performance report<\/li>\s*<li>Lead generation focus<\/li>/, `<li>Enterprise Ads Management</li>\n                  <li>Custom Video/Image Creatives</li>\n                  <li>Multi-layered Audiences</li>\n                  <li>Omnichannel Lead Gen</li>\n                  <li>Live Dashboard & Calls</li>`);

// Replace Monthly Features
html = html.replace(/<li>Full Meta Ads management<\/li>\s*<li>Campaign optimization<\/li>\s*<li>A\/B testing<\/li>\s*<li>Conversion tracking<\/li>\s*<li>Monthly analytics report<\/li>\s*<li>Dedicated support<\/li>/, `<li>Standard Ads Management</li>\n                  <li>Monthly Optimization</li>\n                  <li>Basic A/B Testing</li>\n                  <li>Standard Conversion Tracking</li>\n                  <li>Monthly Summary Report</li>\n                  <li>Email Support</li>`);

html = html.replace(/<li>Full Meta Ads management<\/li>\s*<li>Campaign optimization<\/li>\s*<li>A\/B testing<\/li>\s*<li>Conversion tracking<\/li>\s*<li>Monthly analytics report<\/li>\s*<li>Dedicated support<\/li>/, `<li>Pro Meta Ads Management</li>\n                  <li>Continuous Optimization</li>\n                  <li>Advanced A/B Testing</li>\n                  <li>Pixel & API Tracking</li>\n                  <li>Detailed Analytics Report</li>\n                  <li>Priority Chat Support</li>`);

html = html.replace(/<li>Full Meta Ads management<\/li>\s*<li>Campaign optimization<\/li>\s*<li>A\/B testing<\/li>\s*<li>Conversion tracking<\/li>\s*<li>Monthly analytics report<\/li>\s*<li>Dedicated support<\/li>/, `<li>Elite Ads Management</li>\n                  <li>Daily Scale Optimization</li>\n                  <li>Dynamic Creative Testing</li>\n                  <li>Advanced Server-side Tracking</li>\n                  <li>Custom Data Studio Report</li>\n                  <li>Dedicated 1-on-1 Slack/Call</li>`);

fs.writeFileSync('pricing/index.html', html, 'utf8');
console.log('Fixed distinct features successfully in pricing/index.html!');
