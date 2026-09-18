const fs = require('fs');

const html = fs.readFileSync('portfolio/fh-general-equipment/index.html', 'utf8');
let modifiedHtml = html.replace(
  /<span class="cs-num">01 — CONTEXT<\/span>\s*<h2>What is the business\?<\/h2>/,
  '<span class="cs-num">01 — PROJECT OVERVIEW</span>\n          <h2>What is the business?</h2>'
);

modifiedHtml = modifiedHtml.replace(
  /<span class="cs-num">02 — CHALLENGE<\/span>\s*<h2>What needed to improve\?<\/h2>/,
  '<span class="cs-num">02 — CHALLENGE</span>\n          <h2>What needed to improve?</h2>'
);

modifiedHtml = modifiedHtml.replace(
  /<span class="cs-num">06 — MEASUREMENT<\/span>[\s\S]*?(?=<article class="cs-frame animate reveal-up">)/,
  `<span class="cs-num">06 — REAL WORK / PROOF</span>
          <h2>Platform Execution & Results</h2>
          <p>Real platform data demonstrating the impact of the implemented strategy.</p>
          <div style="margin:2rem 0;">
            <div style="background:#111; padding: 1rem; border:1px solid rgba(255,255,255,0.08); border-radius:8px; margin-bottom: 2rem;">
              <img src="../../assets/proof/fh-google-ads-dashboard.png" alt="Google Ads Search Campaign for FH General Equipment" style="width:100%; border-radius:4px; margin-bottom:1rem;">
              <p style="font-size:0.9rem; color:var(--text-secondary); text-align:center;">Google Ads Search Campaign — Hands-on campaign structuring, keyword targeting and performance monitoring.</p>
            </div>
            <div style="background:#111; padding: 1rem; border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
              <img src="../../assets/proof/fh-gsc-performance.png" alt="Google Search Console Organic Performance" style="width:100%; border-radius:4px; margin-bottom:1rem;">
              <p style="font-size:0.9rem; color:var(--text-secondary); text-align:center;">Organic SEO Growth — Tracking search visibility and targeted B2B keyword improvements.</p>
            </div>
          </div>
        </article>

        <article class="cs-frame animate reveal-up">
`
);

modifiedHtml = modifiedHtml.replace(
  /<span class="cs-num">08 — LEARNING<\/span>\s*<h2>What this project reinforced<\/h2>/,
  '<span class="cs-num">08 — KEY LEARNING</span>\n          <h2>What this project reinforced</h2>'
);

modifiedHtml = modifiedHtml.replace(
  /<div style="background:#0a0a0a;border:1px solid rgba\(255,255,255,\.08\);border-radius:8px;padding:3rem;text-align:center;margin-top:3rem;">\s*<h2 style="margin-bottom:1rem;">Need a similar growth system\?<\/h2>[\s\S]*?<\/div>/,
  `<span class="cs-num" style="margin-top: 4rem;">09 — CTA</span>
        <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:3rem;text-align:center;margin-top:1rem;">
          <h2 style="margin-bottom:1rem;">Need a similar growth system?</h2>
          <p style="margin-bottom:1.5rem;">Discuss your objectives, channels, and measurement plan.</p>
          <a href="../../contact/" class="btn btn-primary">Start a Conversation</a>
        </div>`
);

fs.writeFileSync('portfolio/fh-general-equipment/index.html', modifiedHtml);
console.log('Updated FH General Equipment case study.');
