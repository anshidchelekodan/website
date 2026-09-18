const fs = require('fs');

function patchFile(path, replacerFn) {
  if (fs.existsSync(path)) {
    let html = fs.readFileSync(path, 'utf8');
    html = replacerFn(html);
    fs.writeFileSync(path, html);
    console.log('Updated', path);
  } else {
    console.log('Not found:', path);
  }
}

patchFile('portfolio/kalpaka-electronics/index.html', (html) => {
  let mod = html.replace(
    /<span class="cs-num">01 — CONTEXT<\/span>\s*<h2>What is the business\?<\/h2>/,
    '<span class="cs-num">01 — PROJECT OVERVIEW</span>\n          <h2>What is the business?</h2>'
  );
  mod = mod.replace(
    /<span class="cs-num">02 — CHALLENGE<\/span>\s*<h2>What was the objective\?<\/h2>/,
    '<span class="cs-num">02 — CHALLENGE</span>\n          <h2>What was the objective?</h2>'
  );
  mod = mod.replace(
    /<span class="cs-num">06 — MEASUREMENT<\/span>[\s\S]*?(?=<article class="cs-frame animate reveal-up">)/,
    `<span class="cs-num">06 — REAL WORK / PROOF</span>
          <h2>Campaign Execution & Meta Ads Dashboard</h2>
          <p>Real Meta Ads data demonstrating lead generation, messaging conversations, and campaign structuring.</p>
          <div style="margin:2rem 0;">
            <div style="background:#111; padding: 1rem; border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
              <img src="../../assets/proof/kalpaka-meta-ads.png" alt="Meta Ads Campaign Dashboard" style="width:100%; border-radius:4px; margin-bottom:1rem;">
              <p style="font-size:0.9rem; color:var(--text-secondary); text-align:center;">Meta Ads Manager — WhatsApp engagement and lead generation campaigns for Kalpaka Electronics.</p>
            </div>
          </div>
        </article>

        <article class="cs-frame animate reveal-up">
`
  );
  mod = mod.replace(
    /<span class="cs-num">08 — LEARNING<\/span>\s*<h2>What this work teaches<\/h2>/,
    '<span class="cs-num">08 — KEY LEARNING</span>\n          <h2>What this work teaches</h2>'
  );
  mod = mod.replace(
    /<div style="background:#0a0a0a;border:1px solid rgba\(255,255,255,\.08\);border-radius:8px;padding:3rem;text-align:center;margin-top:3rem;">\s*<h2 style="margin-bottom:1rem;">Need a similar growth system\?<\/h2>[\s\S]*?<\/div>/,
    `<span class="cs-num" style="margin-top: 4rem;">09 — CTA</span>
        <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:3rem;text-align:center;margin-top:1rem;">
          <h2 style="margin-bottom:1rem;">Need a similar growth system?</h2>
          <p style="margin-bottom:1.5rem;">Discuss your objectives, channels, and measurement plan.</p>
          <a href="../../contact/" class="btn btn-primary">Start a Conversation</a>
        </div>`
  );
  return mod;
});
