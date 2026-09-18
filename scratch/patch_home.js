const fs = require('fs');
const path = 'd:/website/index.html';
let html = fs.readFileSync(path, 'utf8');

// Brands marquee
const brandsOld = html.match(/<!-- Set 1 -->[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*\n\s*<!-- Feature 8:/);
if (!brandsOld) {
  console.error('brands block not found');
} else {
  const replacement = `<!-- Set 1 -->
          <div class="brand-item"><span>FH General Equipment</span></div>
          <div class="brand-item"><span>Kalpaka Electronics</span></div>
          <div class="brand-item"><span>Sigma Electronics</span></div>
          <div class="brand-item"><span>Blueweb2 Agency</span></div>
          <div class="brand-item"><span>ADVERIX MEDIA</span></div>
          <div class="brand-item"><span>SJS Business Solutions</span></div>
          
          <!-- Duplicate for seamless loop -->
          <div class="brand-item"><span>FH General Equipment</span></div>
          <div class="brand-item"><span>Kalpaka Electronics</span></div>
          <div class="brand-item"><span>Sigma Electronics</span></div>
          <div class="brand-item"><span>Blueweb2 Agency</span></div>
          <div class="brand-item"><span>ADVERIX MEDIA</span></div>
          <div class="brand-item"><span>SJS Business Solutions</span></div>
        </div>
      </div>
    </section>

    <!-- Feature 8:`;
  html = html.replace(brandsOld[0], replacement);
  console.log('brands ok');
}

// Replace results-proof section with professional snapshot
const proofStart = html.indexOf('<!-- Feature 8: Growth Proof');
const aboutStart = html.indexOf('<!-- About Section Preview -->');
if (proofStart === -1 || aboutStart === -1) {
  console.error('results-proof markers missing', proofStart, aboutStart);
} else {
  const snapshot = `<!-- Professional Snapshot (compact — does not duplicate About) -->
    <section id="snapshot" class="section" style="background:#080808; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06);">
      <div class="container">
        <div class="section-title animate reveal-up">
          <span>Professional Snapshot</span>
          <h2>Clear on the <span class="text-accent">essentials</span></h2>
        </div>
        <div class="snapshot-grid animate reveal-up">
          <div class="snapshot-item">
            <h3>What I Do</h3>
            <p>Digital marketing strategy and execution across search, paid media, social, analytics, and web.</p>
          </div>
          <div class="snapshot-item">
            <h3>What I Care About</h3>
            <p>Business objectives, measurable outcomes, and continuous optimization.</p>
          </div>
          <div class="snapshot-item">
            <h3>What Makes My Approach Different</h3>
            <p>I connect creative execution with performance data — then improve what the numbers show.</p>
          </div>
        </div>
        <p style="margin-top:2rem;"><a href="about/" class="text-accent" style="font-weight:700;">Full background &amp; experience →</a></p>
      </div>
    </section>

    <!-- About Section Preview -->`;
  html = html.slice(0, proofStart) + snapshot + html.slice(aboutStart + '<!-- About Section Preview -->'.length);
  console.log('snapshot ok');
}

// Replace case studies cards with real work links (no fabricated metrics)
const csStart = html.indexOf('<!-- Case Study Section (Proof of Work) -->');
const partStart = html.indexOf('<!-- Current Client Partnerships Section -->');
if (csStart === -1 || partStart === -1) {
  console.error('case study markers missing');
} else {
  const cs = `<!-- Case Study Section (Proof of Work) -->
    <section class="section" id="case-studies" style="background-color: rgba(0,0,0,0.35);">
      <div class="container">
        <div class="section-title animate reveal-up">
          <span>Selected Work</span>
          <h2>Case studies that show <span class="text-accent">how I work</span></h2>
          <p>Problem → thinking → execution → measurement. Full write-ups live in the portfolio.</p>
        </div>

        <div class="portfolio-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem;">
          <article class="work-card animate reveal-up">
            <div class="work-card-body">
              <span class="work-card-industry">B2B Equipment</span>
              <h3><a href="portfolio/fh-general-equipment/">FH General Equipment</a></h3>
              <p class="work-card-services">SEO · Google Ads · Lead Generation</p>
              <p class="work-card-challenge">Building a stronger search and acquisition system for a B2B supplier.</p>
              <a href="portfolio/fh-general-equipment/" class="btn btn-primary">View Case Study</a>
            </div>
          </article>
          <article class="work-card animate reveal-up">
            <div class="work-card-body">
              <span class="work-card-industry">Electronics Retail</span>
              <h3><a href="portfolio/kalpaka-electronics/">Kalpaka Electronics</a></h3>
              <p class="work-card-services">Social Media · Meta Ads · Lead Generation</p>
              <p class="work-card-challenge">Strengthening visibility and engagement through social and promotional campaigns.</p>
              <a href="portfolio/kalpaka-electronics/" class="btn btn-primary">View Case Study</a>
            </div>
          </article>
          <article class="work-card animate reveal-up">
            <div class="work-card-body">
              <span class="work-card-industry">Agency Experience</span>
              <h3><a href="portfolio/blueweb2/">Blueweb2 Agency</a></h3>
              <p class="work-card-services">SEO · Meta Ads · Google Ads</p>
              <p class="work-card-challenge">Executing multi-channel client campaigns focused on lead generation and performance.</p>
              <a href="portfolio/blueweb2/" class="btn btn-primary">View Case Study</a>
            </div>
          </article>
          <article class="work-card animate reveal-up">
            <div class="work-card-body">
              <span class="work-card-industry">Founder Venture</span>
              <h3><a href="portfolio/adverix-media/">ADVERIX MEDIA</a></h3>
              <p class="work-card-services">Brand · SEO · Lead Generation · Video</p>
              <p class="work-card-challenge">Building a founder-led practice around measurable growth systems.</p>
              <a href="portfolio/adverix-media/" class="btn btn-primary">View Case Study</a>
            </div>
          </article>
        </div>

        <div style="text-align: center; margin-top: 3rem;">
          <a href="portfolio/" class="btn btn-outline">Explore Full Portfolio</a>
        </div>
      </div>
    </section>

    `;
  html = html.slice(0, csStart) + cs + html.slice(partStart);
  console.log('case studies ok');
}

// Upgrade process section heading + expand to 6 steps How I Think
html = html.replace(
  `<span style="display:inline-block; padding: 5px 18px; background: rgba(98,255,176,0.08); border: 1px solid rgba(98,255,176,0.2); border-radius: 50px; font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--accent-color); margin-bottom: 1.5rem;">The Roadmap to Results</span>
          <h2>My Strategic <span class="text-accent">Work Approach</span></h2>
          <p>A systematic 4-step framework engineered for predictable, compounding business growth.</p>`,
  `<span style="display:inline-block; padding: 5px 18px; background: rgba(225,29,72,0.08); border: 1px solid rgba(225,29,72,0.25); border-radius: 50px; font-size: 0.75rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--accent-color); margin-bottom: 1.5rem;">How I Think</span>
          <h2>The marketing process I <span class="text-accent">actually follow</span></h2>
          <p>Research → Strategy → Execution → Measurement → Optimization — shown as a working system.</p>`
);

const approachGridMatch = html.match(/<div class="approach-grid">[\s\S]*?<\/div>\s*\n\s*<div class="text-center animate stagger-4"/);
if (approachGridMatch) {
  const think = `<div class="think-grid" id="how-i-think">
          <div class="think-step animate reveal-up">
            <div class="n">01</div>
            <h3>Discover</h3>
            <p>Understand the business, audience, market, and objective.</p>
          </div>
          <div class="think-step animate reveal-up">
            <div class="n">02</div>
            <h3>Research</h3>
            <p>Analyze search behaviour, competitors, audience intent, and opportunities.</p>
          </div>
          <div class="think-step animate reveal-up">
            <div class="n">03</div>
            <h3>Strategize</h3>
            <p>Choose channels, messaging, content, and campaign structure.</p>
          </div>
          <div class="think-step animate reveal-up">
            <div class="n">04</div>
            <h3>Execute</h3>
            <p>Launch campaigns, content, SEO improvements, and tracking.</p>
          </div>
          <div class="think-step animate reveal-up">
            <div class="n">05</div>
            <h3>Measure</h3>
            <p>Analyze meaningful KPIs tied to business outcomes.</p>
          </div>
          <div class="think-step animate reveal-up">
            <div class="n">06</div>
            <h3>Optimize</h3>
            <p>Test, learn, improve, and scale what works.</p>
          </div>
        </div>

        <div class="text-center animate stagger-4"`;
  html = html.replace(approachGridMatch[0], think);
  console.log('how i think ok');
} else {
  console.error('approach grid not found');
}

// Replace Core Expertise % marquee with categorized capabilities + stack
const skillsStart = html.indexOf('<!-- Skills Section Redesign -->');
const nextAfterSkills = html.indexOf('<section class="section"', skillsStart + 10);
// find the section that follows skills - looking for experience or results
// Better: find end of skills section by locating next major comment
const skillsEndMarkers = [
  html.indexOf('<!-- Experience', skillsStart),
  html.indexOf('<!-- Results', skillsStart),
  html.indexOf('<section class="section results-wins-section"', skillsStart),
  html.indexOf('<!-- Static', skillsStart)
].filter(i => i > skillsStart);
const skillsEnd = Math.min(...skillsEndMarkers);
if (skillsStart > -1 && skillsEnd < Infinity) {
  const caps = `<!-- Capabilities & Stack (replaces % skill bars — no invented proficiency scores) -->
    <section class="section" id="capabilities" style="background:#080808;">
      <div class="container">
        <div class="section-title animate reveal-up">
          <span>Capabilities</span>
          <h2>What I actually <span class="text-accent">work with</span></h2>
          <p>Grouped by how campaigns are planned and delivered — not a logo wall.</p>
        </div>
        <div class="cap-grid">
          <div class="cap-block animate reveal-up">
            <h3>Performance</h3>
            <ul><li>Google Ads</li><li>Meta Ads</li><li>Lead Generation</li><li>Conversion Optimization</li></ul>
          </div>
          <div class="cap-block animate reveal-up">
            <h3>Search</h3>
            <ul><li>SEO</li><li>Technical SEO</li><li>On-Page SEO</li><li>Local SEO</li><li>Keyword Research</li><li>AEO</li></ul>
          </div>
          <div class="cap-block animate reveal-up">
            <h3>Social</h3>
            <ul><li>Social Media Strategy</li><li>Content Planning</li><li>Campaigns</li><li>Brand Communication</li></ul>
          </div>
          <div class="cap-block animate reveal-up">
            <h3>Analytics</h3>
            <ul><li>GA4</li><li>Google Search Console</li><li>Google Tag Manager</li><li>Performance Reporting</li></ul>
          </div>
          <div class="cap-block animate reveal-up">
            <h3>Creative</h3>
            <ul><li>Creative Direction</li><li>Video Production</li><li>Branding</li></ul>
          </div>
          <div class="cap-block animate reveal-up">
            <h3>Web</h3>
            <ul><li>WordPress</li><li>Website SEO</li><li>Performance &amp; UX</li></ul>
          </div>
        </div>

        <div class="section-title animate reveal-up" style="margin-top:4rem;">
          <span>Marketing Stack</span>
          <h2>Tools I use in <span class="text-accent">delivery</span></h2>
        </div>
        <div class="stack-grid">
          <div class="stack-group animate reveal-up">
            <h3>Google</h3>
            <ul><li>Google Ads</li><li>GA4</li><li>Search Console</li><li>Tag Manager</li></ul>
          </div>
          <div class="stack-group animate reveal-up">
            <h3>Meta</h3>
            <ul><li>Meta Ads Manager</li><li>Business Suite</li></ul>
          </div>
          <div class="stack-group animate reveal-up">
            <h3>Web</h3>
            <ul><li>WordPress</li><li>Performance-oriented HTML/CSS</li></ul>
          </div>
          <div class="stack-group animate reveal-up">
            <h3>Creative</h3>
            <ul><li>Video production tools</li><li>Campaign creative direction</li></ul>
          </div>
        </div>
      </div>
    </section>

    `;
  html = html.slice(0, skillsStart) + caps + html.slice(skillsEnd);
  console.log('capabilities ok');
} else {
  console.error('skills section markers', skillsStart, skillsEnd);
}

// Remove duplicate results-wins section on homepage if present
const rw = html.indexOf('<section class="section results-wins-section"');
if (rw > -1) {
  const rwEnd = html.indexOf('</section>', rw);
  // find the script after it that powers counters - remove through next section
  let end = html.indexOf('<!-- ', rw + 10);
  if (end === -1) end = html.indexOf('<section', rw + 10);
  // Also remove following counter script block if immediately after
  const afterSection = html.indexOf('</section>', rw);
  let cutEnd = afterSection + '</section>'.length;
  const scriptStart = html.indexOf('<style>', cutEnd);
  const scriptAlt = html.indexOf('<script>', cutEnd);
  // look ahead 500 chars for counter script
  const peek = html.slice(cutEnd, cutEnd + 800);
  if (peek.includes('results-card:hover') || peek.includes('.counter')) {
    const styleStart = html.indexOf('<style>', cutEnd);
    const scriptEnd = html.indexOf('</script>', cutEnd);
    if (styleStart > -1 && styleStart < cutEnd + 200 && scriptEnd > -1) {
      cutEnd = scriptEnd + '</script>'.length;
    } else if (scriptEnd > -1 && html.indexOf('<script>', cutEnd) < cutEnd + 200) {
      cutEnd = scriptEnd + '</script>'.length;
    }
  }
  html = html.slice(0, rw) + '\n    <!-- results-wins removed: duplicated / unverified aggregate metrics -->\n' + html.slice(cutEnd);
  console.log('removed results-wins');
}

// Partnership links
html = html.replace(
  '<h3 style="font-size: 1.85rem; color: #fff; margin-bottom: 0.4rem; font-weight: 800;">Kalpaka Electronics and Home Bazar</h3>',
  '<h3 style="font-size: 1.85rem; color: #fff; margin-bottom: 0.4rem; font-weight: 800;"><a href="portfolio/kalpaka-electronics/" style="color:inherit;">Kalpaka Electronics and Home Bazar</a></h3>'
);
html = html.replace(
  '<h3 style="font-size: 1.85rem; color: #fff; margin-bottom: 0.4rem; font-weight: 800;">Sigma Home Appliances</h3>',
  '<h3 style="font-size: 1.85rem; color: #fff; margin-bottom: 0.4rem; font-weight: 800;"><a href="portfolio/sigma-electronics/" style="color:inherit;">Sigma Home Appliances</a></h3>'
);

// Soften about preview heading
html = html.replace(
  'The Best Digital Marketing Strategist in Malappuram & Kerala',
  'Digital Marketing Strategist in Malappuram &amp; Kerala'
);
html = html.replace(
  'Why Partner with <span class="text-accent">Mohammad Anshid Ck?</span>',
  'Why work with <span class="text-accent">Muhammed Anshid Chelekodan?</span>'
);

fs.writeFileSync(path, html);
console.log('homepage patch complete, length', html.length);
