const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'pricing', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Update CSS
const oldCss = `/* Step 2 Grid & Live Cart */
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
}`;

const newCss = `/* Step 2 Grid & Live Cart */
.wiz-step-2-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 30px;
}
.wiz-live-cart {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 20px;
    position: sticky;
    top: 90px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
}
.wiz-cart-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
    background: radial-gradient(circle at center, rgba(46, 230, 166, 0.08) 0%, transparent 70%);
    border-radius: 14px;
    padding: 5px;
    height: 110px;
}
.wiz-cart-content {
    max-height: 190px;
    overflow-y: auto;
    padding-right: 6px;
    margin-bottom: 10px;
}
.wiz-cart-content::-webkit-scrollbar {
    width: 4px;
}
.wiz-cart-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
.wiz-cart-content::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 4px;
}
.wiz-cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 0.9rem;
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
    font-size: 0.95rem;
}
.wiz-cart-item-remove {
    background: rgba(255,255,255,0.06);
    border: none;
    color: rgba(255,255,255,0.5);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s ease;
    margin-right: 8px;
    flex-shrink: 0;
}
.wiz-cart-item-remove:hover {
    background: rgba(255, 80, 80, 0.25);
    color: #ff6b6b;
}
.wiz-remove-btn {
    background: rgba(255, 80, 80, 0.08);
    border: 1px solid rgba(255, 80, 80, 0.2);
    color: #ff7676;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}
.wiz-remove-btn:hover {
    background: rgba(255, 80, 80, 0.25);
    color: #fff;
    border-color: #ff6b6b;
}`;

html = html.replace(oldCss, newCss);

// Update config-title CSS rule
html = html.replace(`.config-title {
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 20px;
    font-weight: 700;
    font-family: var(--font-heading, 'Montserrat', sans-serif);
    display: flex;
    align-items: center;
    gap: 10px;
}`, `.config-title {
    font-size: 1.15rem;
    color: #fff;
    margin-bottom: 20px;
    font-weight: 700;
    font-family: var(--font-heading, 'Montserrat', sans-serif);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}`);

// 2. Update Step 2 Config Titles with Unselect Button
html = html.replace('<div class="config-title"><i class="fas fa-search-dollar text-accent"></i> SEO Plan</div>', '<div class="config-title"><span><i class="fas fa-search-dollar text-accent"></i> SEO Plan</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'seo\')"><i class="fas fa-times"></i> Unselect</button></div>');
html = html.replace('<div class="config-title"><i class="fab fa-meta text-accent"></i> Meta Ads Plan</div>', '<div class="config-title"><span><i class="fab fa-meta text-accent"></i> Meta Ads Plan</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'meta\')"><i class="fas fa-times"></i> Unselect</button></div>');
html = html.replace('<div class="config-title"><i class="fab fa-google text-accent"></i> Google Ads Plan</div>', '<div class="config-title"><span><i class="fab fa-google text-accent"></i> Google Ads Plan</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'google\')"><i class="fas fa-times"></i> Unselect</button></div>');
html = html.replace('<div class="config-title"><i class="fas fa-laptop-code text-accent"></i> Web Design Plan</div>', '<div class="config-title"><span><i class="fas fa-laptop-code text-accent"></i> Web Design Plan</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'web\')"><i class="fas fa-times"></i> Unselect</button></div>');
html = html.replace('<div class="config-title"><i class="fas fa-hashtag text-accent"></i> Social Media Plan</div>', '<div class="config-title"><span><i class="fas fa-hashtag text-accent"></i> Social Media Plan</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'social\')"><i class="fas fa-times"></i> Unselect</button></div>');
html = html.replace('<div class="config-title"><i class="fas fa-video text-accent"></i> Video Production</div>', '<div class="config-title"><span><i class="fas fa-video text-accent"></i> Video Production</span> <button type="button" class="wiz-remove-btn" onclick="wRemove(\'video\')"><i class="fas fa-times"></i> Unselect</button></div>');

// 3. Add wRemove JS function
const wRemoveJs = `function wToggle(serv) {
    wSelections[serv].sel = !wSelections[serv].sel;
    const btn = document.querySelector(\`[data-serv="\${serv}"]\`);
    if(btn) btn.classList.toggle('selected');
    wCalc();
}

function wRemove(serv) {
    wSelections[serv].sel = false;
    const btn = document.querySelector(\`[data-serv="\${serv}"]\`);
    if(btn) btn.classList.remove('selected');
    wCalc();
    wUpdateUI();
}`;

html = html.replace(/function wToggle\(serv\) \{[\s\S]*?wCalc\(\);\n\}/, wRemoveJs);

// 4. Update cartHtml logic in wCalc
const oldCartJs = `            cartHtml += \`<div class="wiz-cart-item">
                <span class="wiz-cart-item-title">\${names[k]} (\${wSelections[k].plan})</span>
                <span class="wiz-cart-item-val">\${pStr}</span>
            </div>\`;`;

const newCartJs = `            cartHtml += \`<div class="wiz-cart-item">
                <div style="display:flex; align-items:center;">
                    <button type="button" class="wiz-cart-item-remove" onclick="wRemove('\${k}')" title="Unselect service"><i class="fas fa-times"></i></button>
                    <span class="wiz-cart-item-title">\${names[k]} (\${wSelections[k].plan})</span>
                </div>
                <span class="wiz-cart-item-val">\${pStr}</span>
            </div>\`;`;

html = html.replace(oldCartJs, newCartJs);

fs.writeFileSync(file, html, 'utf8');
console.log('Successfully updated Live Cart & Unselect options!');
