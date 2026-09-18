const fs = require('fs');
const path = require('path');

const nav = `  <header>
    <nav class="navbar">
      <div class="container container-nav">
        <div class="logo-group">
          <a href="../../" class="logo">Anshid Ck<span class="text-accent">.</span></a>
          <div class="header-socials">
            <a href="https://www.instagram.com/_anshee___" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/mohammad-anshid-ck-9123462aa" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://www.facebook.com/share/16oyZso423" target="_blank" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="https://x.com/AnshidCK727" target="_blank" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="https://wa.me/919778179727" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <ul class="nav-links">
          <li class="mobile-nav-header"><span class="logo">Anshid Ck<span class="text-accent">.</span></span><button class="close-menu-btn" aria-label="Close menu">&times;</button></li>
          <li><a href="../../">Home</a></li>
          <li><a href="../../about/">About</a></li>
          <li><a href="../../services/">Services</a></li>
          <li><a href="https://anshidck.com/pricing/">Pricing</a></li>
          <li><a href="../../portfolio/" class="active">Portfolio</a></li>
          <li><a href="../../blog/">Blog</a></li>
          <li><a href="../../contact/">Contact</a></li>
        </ul>
        <button class="mobile-menu-btn" aria-label="Toggle navigation menu"><i class="fas fa-bars"></i></button>
      </div>
      <div class="nav-overlay"></div>
    </nav>
  </header>`;

const footer = `  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <a href="../../" class="logo" style="margin-bottom: 2rem; display: block; font-size: 1.8rem; font-weight: 800;">Anshid Ck<span class="text-accent">.</span></a>
          <p style="margin-bottom: 2.5rem; max-width: 350px;">Digital Marketing Strategist in Malappuram &amp; Kerala — strategy, performance marketing, SEO, and measurable growth systems.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul class="footer-links">
            <li><a href="../../">Home</a></li>
            <li><a href="../../about/">About</a></li>
            <li><a href="../../portfolio/">Work</a></li>
            <li><a href="../../contact/">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="tel:+919778179727">+91 97781 79727</a></li>
            <li><a href="mailto:anshidchelekodan@gmail.com">anshidchelekodan@gmail.com</a></li>
            <li><a href="https://maps.app.goo.gl/9y9T">Malappuram, Kerala, India</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom"><p>&copy; 2026 Muhammed Anshid Chelekodan. All rights reserved.</p></div>
    </div>
  </footer>
  <a href="https://wa.me/919778179727" class="float-wa" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
  <script src="../../main.js?v=20260331-1"></script>`;

function page(c) {
  const frames = c.sections.map(s => `
        <article class="cs-frame animate reveal-up">
          <span class="cs-num">${s.n} — ${s.label}</span>
          <h2>${s.title}</h2>
          ${s.html}
        </article>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NXNM6B7R');</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/webp" href="../../favicon.webp">
  <title>${c.title}</title>
  <meta name="description" content="${c.description}">
  <link rel="canonical" href="${c.canonical}">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="${c.title}">
  <meta property="og:description" content="${c.description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${c.canonical}">
  <meta property="og:image" content="https://anshidck.com/anshid-optimized.webp">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "${c.schemaName}",
    "headline": "${c.schemaName}",
    "description": "${c.description}",
    "url": "${c.canonical}",
    "author": {
      "@type": "Person",
      "name": "Muhammed Anshid Chelekodan",
      "alternateName": "Mohammad Anshid Ck",
      "url": "https://anshidck.com/",
      "jobTitle": "Digital Marketing Strategist"
    }
  }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="../../style.min.css?v=20260914">
  <style>
    .project-header{padding:160px 0 80px;background:linear-gradient(180deg,#050505 0%,#111 100%);text-align:center;border-bottom:1px solid rgba(255,255,255,.06)}
    .project-title{font-size:clamp(2rem,5vw,3.4rem);margin-bottom:.75rem}
    .case-study-layout{max-width:860px;margin:0 auto}
  </style>
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NXNM6B7R" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${nav}
  <main>
  <section class="project-header">
    <div class="container animate stagger-1">
      ${c.badge || ''}
      <h1 class="project-title">${c.h1}</h1>
      <p style="max-width:680px;margin:0 auto;font-size:1.1rem;">${c.summary}</p>
      <div class="cs-meta-bar">${c.tags.map(t => `<span class="cs-chip">${t}</span>`).join('')}</div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="case-study-layout">
${frames}
        <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:3rem;text-align:center;margin-top:3rem;">
          <h2 style="margin-bottom:1rem;">Need a similar growth system?</h2>
          <p style="margin-bottom:1.5rem;">Discuss your objectives, channels, and measurement plan.</p>
          <a href="../../contact/" class="btn btn-primary">Start a Conversation</a>
        </div>
      </div>
    </div>
  </section>
  </main>
${footer}
</body>
</html>`;
}

const cases = [
  {
    slug: 'fh-general-equipment',
    title: 'FH General Equipment Case Study | SEO & Google Ads | Anshid Ck',
    description: 'Case study: SEO, technical SEO, keyword research, and Google Ads lead generation work for FH General Equipment, a B2B equipment supplier serving markets including the USA and Guyana.',
    canonical: 'https://anshidck.com/portfolio/fh-general-equipment/',
    schemaName: 'FH General Equipment — Search & Acquisition System',
    h1: 'FH General Equipment',
    summary: 'Building a stronger search and acquisition system for a B2B general, medical, and industrial equipment supplier.',
    tags: ['B2B Equipment', 'SEO', 'Google Ads', 'Lead Generation'],
    sections: [
      { n: '01', label: 'CONTEXT', title: 'What is the business?', html: '<p>FH General Equipment is a B2B supplier of general, medical, and industrial equipment. The work focused on improving discoverability and lead acquisition through search — organic and paid — across relevant campaign markets, including the USA and Guyana where applicable.</p>' },
      { n: '02', label: 'CHALLENGE', title: 'What needed to improve?', html: '<p>The objective was to strengthen the search and acquisition system: clearer keyword targeting, more reliable campaign structure, and better tracking so enquiry generation could be managed with more precision.</p>' },
      { n: '03', label: 'MY ROLE', title: 'What I handled', html: '<ul><li>SEO and technical SEO improvements</li><li>Keyword research and intent mapping</li><li>Google Ads search campaign structure</li><li>Phrase &amp; Exact match targeting</li><li>Negative keyword hygiene</li><li>Geographic targeting for campaign markets</li><li>Conversion tracking setup and lead-generation focus</li><li>Website SEO improvements aligned to acquisition goals</li></ul>' },
      { n: '04', label: 'STRATEGY', title: 'How I approached it', html: '<p>I treated acquisition as a system: research demand first, then structure campaigns and on-site SEO so paid and organic search reinforced each other. Match types, negatives, and geo settings were used to keep spend and messaging aligned with business-relevant queries.</p>' },
      { n: '05', label: 'EXECUTION', title: 'Actions taken', html: '<ul><li>Keyword research to separate research, commercial, and lead-intent queries</li><li>Search campaign builds with Phrase and Exact match themes</li><li>Negative keyword lists to reduce wasted spend</li><li>Geographic targeting by campaign market</li><li>Technical and on-page SEO improvements on the website</li><li>Conversion tracking connected to lead actions</li></ul>' },
      { n: '06', label: 'MEASUREMENT', title: 'What was tracked', html: '<ul><li>Search query quality and match-type performance</li><li>Impression share and click behaviour on priority themes</li><li>Conversion events tied to lead actions</li><li>SEO visibility signals for targeted pages and queries</li></ul><p>Performance was monitored continuously for optimization decisions.</p>' },
      { n: '07', label: 'RESULTS', title: 'Outcome', html: '<p>Work completed across SEO, Google Ads structure, targeting, and conversion tracking for B2B lead generation. Detailed performance figures are available upon request.</p>' },
      { n: '08', label: 'LEARNING', title: 'What this project reinforced', html: '<ul><li>B2B search performance depends on query intent discipline more than broad reach</li><li>Negative keywords and geo controls protect budget as effectively as bid changes</li><li>Technical SEO and ads tracking must be wired before scaling spend</li><li>Phrase and Exact structures make diagnosis and optimization clearer over time</li></ul>' }
    ]
  },
  {
    slug: 'kalpaka-electronics',
    title: 'Kalpaka Electronics Case Study | Social & Meta Ads | Anshid Ck',
    description: 'Case study: social media marketing, content planning, Meta advertising, and lead-generation support for Kalpaka Electronics and Home Bazar in Kerala.',
    canonical: 'https://anshidck.com/portfolio/kalpaka-electronics/',
    schemaName: 'Kalpaka Electronics — Social & Performance Partnership',
    h1: 'Kalpaka Electronics and Home Bazar',
    summary: 'Ongoing digital marketing partnership focused on social media, Meta Ads, promotional campaigns, and customer engagement across Kerala.',
    tags: ['Electronics Retail', 'Social Media', 'Meta Ads', 'Lead Generation'],
    sections: [
      { n: '01', label: 'CONTEXT', title: 'What is the business?', html: '<p>Kalpaka Electronics and Home Bazar is an electronics retail brand. I work as a digital marketing partner supporting social presence, paid social, promotional campaigns, and engagement-focused growth.</p>' },
      { n: '02', label: 'CHALLENGE', title: 'What was the objective?', html: '<p>Strengthen brand visibility and customer engagement while running promotional and seasonal campaigns that support enquiry and footfall-oriented outcomes — not vanity reach alone.</p>' },
      { n: '03', label: 'MY ROLE', title: 'What I handle', html: '<ul><li>Social media marketing</li><li>Content planning and product marketing</li><li>Promotional and seasonal campaigns</li><li>Meta advertising</li><li>Lead generation support</li><li>Performance analysis of campaigns and content</li></ul>' },
      { n: '04', label: 'STRATEGY', title: 'Approach', html: '<p>Campaign and content plans are built around product moments, offers, and local audience behaviour. Meta Ads and organic social are coordinated so creative, messaging, and timing reinforce each other.</p>' },
      { n: '05', label: 'EXECUTION', title: 'Work completed', html: '<ul><li>Content calendars and product-focused creative direction</li><li>Promotional campaign setups on Meta</li><li>Seasonal campaign bursts aligned to retail demand</li><li>Ongoing creative and message iteration</li><li>Performance reviews to guide the next sprint</li></ul>' },
      { n: '06', label: 'MEASUREMENT', title: 'What is monitored', html: '<ul><li>Campaign delivery and engagement quality</li><li>Lead / enquiry signals from paid social where configured</li><li>Content performance trends across posts and creatives</li><li>Seasonal campaign response versus baseline periods</li></ul>' },
      { n: '07', label: 'RESULTS', title: 'Outcome', html: '<p>Established collaboration with continuous social, Meta Ads, and promotional support. Verified campaign metrics can be shared privately upon request.</p>' },
      { n: '08', label: 'LEARNING', title: 'What this work teaches', html: '<ul><li>Retail social works best when offers, products, and timing are planned as one system</li><li>Seasonal campaigns need creative and budget readiness before the peak window</li><li>Performance analysis should inform the next content cycle, not only weekly reports</li></ul>' }
    ]
  },
  {
    slug: 'sigma-electronics',
    title: 'Sigma Home Appliances Case Study | Social Strategy | Anshid Ck',
    description: 'Case study: social media strategy, content planning, product promotion, and performance analysis for Sigma Home Appliances.',
    canonical: 'https://anshidck.com/portfolio/sigma-electronics/',
    schemaName: 'Sigma Home Appliances — Social & Creative Direction',
    h1: 'Sigma Home Appliances',
    summary: 'Digital marketing partnership covering social strategy, product promotion, seasonal campaigns, and creative direction.',
    tags: ['Home Appliances', 'Social Media', 'Creative Direction', 'Performance'],
    sections: [
      { n: '01', label: 'CONTEXT', title: 'What is the business?', html: '<p>Sigma Home Appliances is a home appliances brand I support as a digital marketing partner — covering campaigns, creative content, and performance-focused social initiatives.</p>' },
      { n: '02', label: 'CHALLENGE', title: 'Objective', html: '<p>Improve online presence and campaign consistency through clearer social strategy, stronger product promotion, and seasonal creative execution.</p>' },
      { n: '03', label: 'MY ROLE', title: 'What I handle', html: '<ul><li>Social media strategy</li><li>Content planning</li><li>Product promotion</li><li>Seasonal campaigns</li><li>Creative direction</li><li>Performance analysis</li></ul>' },
      { n: '04', label: 'STRATEGY', title: 'Approach', html: '<p>Position social as a product communication channel: plan content pillars, align creatives to seasonal demand, and review performance so messaging stays tied to business priorities.</p>' },
      { n: '05', label: 'EXECUTION', title: 'Work completed', html: '<ul><li>Social strategy and content planning</li><li>Product and promotional creative direction</li><li>Seasonal campaign execution</li><li>Performance reviews to refine messaging and formats</li></ul>' },
      { n: '06', label: 'MEASUREMENT', title: 'What is monitored', html: '<ul><li>Content and campaign engagement quality</li><li>Creative performance patterns</li><li>Seasonal campaign delivery versus planned objectives</li></ul>' },
      { n: '07', label: 'RESULTS', title: 'Outcome', html: '<p>Active collaboration with ongoing social and performance marketing support. Specific performance numbers are available upon request.</p>' },
      { n: '08', label: 'LEARNING', title: 'What this work teaches', html: '<ul><li>Creative direction is a performance input, not only a brand layer</li><li>Seasonal calendars reduce last-minute campaign waste</li><li>Consistent analysis keeps product promotion aligned with what audiences respond to</li></ul>' }
    ]
  },
  {
    slug: 'adverix-media',
    title: 'ADVERIX MEDIA — Founder Case Study | Brand & Growth Systems',
    description: 'Founder case study for ADVERIX MEDIA: brand positioning, digital marketing strategy, website, SEO, content, lead generation, and video production.',
    canonical: 'https://anshidck.com/portfolio/adverix-media/',
    schemaName: 'ADVERIX MEDIA — Founder Venture',
    h1: 'ADVERIX MEDIA',
    summary: 'My own venture — a performance-driven digital marketing and video production practice built to create measurable growth systems.',
    badge: '<span class="cs-venture">Founder Venture</span>',
    tags: ['Founder', 'Brand Strategy', 'SEO', 'Lead Generation', 'Video'],
    sections: [
      { n: '01', label: 'CONTEXT', title: 'What is this project?', html: '<p>ADVERIX MEDIA is my founder-led venture — not a client retainer. It was built on a clear belief: marketing should generate measurable results, not just reports. The practice combines digital marketing systems with video production capability.</p>' },
      { n: '02', label: 'CHALLENGE', title: 'What I set out to build', html: '<p>Create a credible personal-agency brand with clear positioning, a usable digital presence, and service systems around SEO, paid media, content, lead generation, and video — so clients get execution tied to business objectives.</p>' },
      { n: '03', label: 'MY ROLE', title: 'Founder responsibilities', html: '<ul><li>Brand positioning and visual identity direction</li><li>Digital marketing strategy</li><li>Website and SEO foundations</li><li>Content systems</li><li>Lead generation architecture</li><li>Video production and creative direction</li><li>Overall service design and client delivery standards</li></ul>' },
      { n: '04', label: 'STRATEGY', title: 'How I positioned it', html: '<p>Position ADVERIX MEDIA around impact over impressions: strategy first, then channel execution, then measurement. Brand, website, and offers are designed to communicate that full-process approach.</p>' },
      { n: '05', label: 'EXECUTION', title: 'What has been built', html: '<ul><li>Brand positioning and identity direction</li><li>Website and content foundations</li><li>SEO and lead-generation oriented service structure</li><li>Campaign and creative systems for client work</li><li>Video production capability as part of the offer</li></ul>' },
      { n: '06', label: 'MEASUREMENT', title: 'How progress is judged', html: '<ul><li>Clarity of brand message and service positioning</li><li>Website and SEO readiness for discovery</li><li>Lead pathways from content and campaigns</li><li>Quality of delivery systems for client projects</li></ul>' },
      { n: '07', label: 'RESULTS', title: 'Current status', html: '<p>ADVERIX MEDIA operates as my founder brand (2026 – Present), delivering digital marketing and video-led growth work under a performance-focused model. Specific commercial metrics are omitted here by design.</p>' },
      { n: '08', label: 'LEARNING', title: 'What founding taught me', html: '<ul><li>Positioning must be specific enough that the right clients self-select</li><li>Website, SEO, and offers have to tell the same story</li><li>Creative and performance systems work best when designed together from day one</li><li>Founder-led delivery raises accountability — and raises the bar on process discipline</li></ul>' }
    ]
  }
];

for (const c of cases) {
  const dir = path.join('d:/website/portfolio', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(c), 'utf8');
  console.log('wrote', c.slug);
}
