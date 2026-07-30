const fs = require('fs');
const path = require('path');

const file = path.join('d:', 'website', 'pricing', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Add CSS
const newCss = `
/* Plan Buttons */
.plan-toggle-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 15px;
}
.plan-btn {
    padding: 12px 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #aaa;
    transition: all 0.3s ease;
    font-weight: 600;
}
.plan-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
    transform: translateY(-2px);
}
.plan-btn.active {
    background: rgba(46, 230, 166, 0.1);
    border-color: var(--accent-color);
    color: #fff;
    box-shadow: 0 0 20px rgba(98, 255, 176, 0.15);
}

/* Step 2 Grid & Live Cart */
.wiz-step-2-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 40px;
}
.wiz-live-cart {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px;
    padding: 25px;
    position: sticky;
    top: 100px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.wiz-cart-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
    background: radial-gradient(circle at center, rgba(46, 230, 166, 0.08) 0%, transparent 70%);
    border-radius: 16px;
    padding: 10px;
    height: 180px;
}
.wiz-cart-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    font-size: 0.95rem;
    color: #ccc;
}
.wiz-cart-item:last-child {
    border-bottom: none;
}
.wiz-cart-item-title {
    font-weight: 500;
}
.wiz-cart-item-val {
    color: var(--accent-color);
    font-weight: 700;
}
.wiz-cart-total-box {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed rgba(255,255,255,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
}
.wiz-cart-total-val {
    color: var(--accent-color);
    font-size: 1.6rem;
    font-weight: 800;
}
@media (max-width: 768px) {
    .wiz-step-2-grid {
        grid-template-columns: 1fr;
    }
}
/* Review Item */`;

html = html.replace('/* Review Item */', newCss);

// 2. Add Lottie Script to head
if(!html.includes('lottie-player.js')) {
    html = html.replace('</head>', '  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>\n</head>');
}

// 3. Update Step 2 HTML Layout
const step2Html = `<div class="wizard-step" id="wiz-step-2">
        <h2 style="font-size:1.8rem; color:#fff; margin-bottom:25px; font-family: var(--font-heading, 'Montserrat', sans-serif);">Customize Your Plan</h2>
        
        <div class="wiz-step-2-grid">
            <div id="wiz-configs-container">`;

html = html.replace(`<div class="wizard-step" id="wiz-step-2">
        <h2 style="font-size:1.8rem; color:#fff; margin-bottom:25px; font-family: var(--font-heading, 'Montserrat', sans-serif);">Customize Your Plan</h2>
        
        <div id="wiz-configs-container">`, step2Html);

// 4. Close the grid and add the Live Cart
const closeConfigsHtml = `            <div id="no-selection-msg"
 style="display:none; color:rgba(255,255,255,0.5); text-align:center; padding:30px;">
                You haven't selected any specific services to customize.
            </div>
        </div>
        
        <!-- Live Cart Side -->
        <div class="wiz-live-cart-container">
            <div class="wiz-live-cart">
                <div class="wiz-cart-animation">
                    <!-- Premium Lottie Animation of person on laptop -->
                    <lottie-player src="https://lottie.host/8cd71b2d-9650-4dcb-b2f7-e4be684ed380/O82J8bH60c.json" background="transparent" speed="1" style="width: 100%; height: 100%;" loop autoplay></lottie-player>
                </div>
                <h3 style="color:#fff; font-size:1.2rem; margin-bottom:15px; font-family:var(--font-heading, 'Montserrat', sans-serif);">Live Estimate</h3>
                <div class="wiz-cart-content" id="wiz-live-cart-content">
                    <div style="color:rgba(255,255,255,0.4); text-align:center; padding:20px 0; font-size:0.9rem;">Select services to see estimate</div>
                </div>
                <div class="wiz-cart-total-box">
                    <span>Total Estimate</span>
                    <span class="wiz-cart-total-val" id="wiz-live-cart-total-val">₹0</span>
                </div>
            </div>
        </div>
        
    </div>`;

html = html.replace(/<div id="no-selection-msg"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, closeConfigsHtml);

// 5. Update JS to render cart
const cartJs = `
    const tv = document.getElementById('wiz-total-val');
    const lcv = document.getElementById('wiz-live-cart-total-val');
    
    let totalStr = '';
    if(total === 0 && !hasCustom) {
        totalStr = '₹0';
    } else {
        totalStr = '₹' + total.toLocaleString() + (hasCustom ? ' +' : '');
    }
    if(tv) tv.innerText = totalStr;
    if(lcv) lcv.innerText = totalStr;
    
    // Build cart HTML
    let cartHtml = '';
    const names = {seo:'SEO', meta:'Meta Ads', google:'Google Ads', web:'Web Design', social:'Social Media', video:'Video Production'};
    Object.keys(wSelections).forEach(k => {
        if(wSelections[k].sel) {
            const p = wPrices[k][wSelections[k].plan];
            const pStr = p==='Custom' ? 'Custom' : '₹'+p.toLocaleString();
            cartHtml += \`<div class="wiz-cart-item">
                <span class="wiz-cart-item-title">\${names[k]} (\${wSelections[k].plan})</span>
                <span class="wiz-cart-item-val">\${pStr}</span>
            </div>\`;
        }
    });
    
    const cartEl = document.getElementById('wiz-live-cart-content');
    if(cartEl) {
        if(cartHtml === '') cartHtml = '<div style="color:rgba(255,255,255,0.4); text-align:center; padding:20px 0; font-size:0.9rem;">Select services to see estimate</div>';
        cartEl.innerHTML = cartHtml;
    }
}`;

html = html.replace(/const tv = document\.getElementById\('wiz-total-val'\);[\s\S]*?tv\.innerText = '₹' \+ total\.toLocaleString\(\) \+ \(hasCustom \? ' \+' : ''\);\n    \}\n\}/, cartJs);


fs.writeFileSync(file, html, 'utf8');
console.log('Update successful');
