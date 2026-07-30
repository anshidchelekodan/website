const fs = require('fs');
const path = require('path');

const file = path.join('d:', 'website', 'pricing', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Add HTML for Social Media and Video in Step 1
const newServicesHtml = `
            <div class="service-toggle-btn" data-serv="social" onclick="wToggle('social')">
                <div class="st-icon"><i class="fas fa-hashtag"></i></div>
                <div class="st-text">
                    <h3>Social Media</h3>
                    <p>Brand building & engagement.</p>
                </div>
                <div class="st-check"><i class="fas fa-check"></i></div>
            </div>
            
            <div class="service-toggle-btn" data-serv="video" onclick="wToggle('video')">
                <div class="st-icon"><i class="fas fa-video"></i></div>
                <div class="st-text">
                    <h3>Video Production</h3>
                    <p>Cinematic reels & brand videos.</p>
                </div>
                <div class="st-check"><i class="fas fa-check"></i></div>
            </div>
        </div>
    </div>
`;
html = html.replace('        </div>\n    </div>\n\n    <!-- STEP 2: CONFIGURE -->', newServicesHtml + '\n\n    <!-- STEP 2: CONFIGURE -->');

// 2. Add config panels for Social and Video in Step 2
const newPanelsHtml = `
            <div class="config-item" id="conf-social">
                <div class="config-title"><i class="fas fa-hashtag text-accent"></i> Social Media Plan</div>
                <div class="plan-toggle-group">
                    <div class="plan-btn active" onclick="wPlan('social','Starter')">Starter (₹12k)</div>
                    <div class="plan-btn" onclick="wPlan('social','Growth')">Growth (₹20k)</div>
                    <div class="plan-btn" onclick="wPlan('social','Premium')">Custom</div>
                </div>
            </div>
            
            <div class="config-item" id="conf-video">
                <div class="config-title"><i class="fas fa-video text-accent"></i> Video Production</div>
                <div class="plan-toggle-group">
                    <div class="plan-btn active" onclick="wPlan('video','Starter')">Starter (₹10k)</div>
                    <div class="plan-btn" onclick="wPlan('video','Growth')">Growth (₹25k)</div>
                    <div class="plan-btn" onclick="wPlan('video','Premium')">Custom</div>
                </div>
            </div>
            
            <div id="no-selection-msg"
`;
html = html.replace('            <div id="no-selection-msg"', newPanelsHtml);

// 3. Update wPrices and wSelections
html = html.replace(
    /const wPrices = \{[\s\S]*?\};/,
    `const wPrices = {
    seo: { Starter: 15000, Growth: 25000, Premium: 'Custom' },
    meta: { Starter: 10000, Growth: 20000, Premium: 'Custom' },
    google: { Starter: 15000, Growth: 30000, Premium: 'Custom' },
    web: { Starter: 15000, Growth: 30000, Premium: 50000 },
    social: { Starter: 12000, Growth: 20000, Premium: 'Custom' },
    video: { Starter: 10000, Growth: 25000, Premium: 'Custom' }
};`
);

html = html.replace(
    /let wSelections = \{[\s\S]*?\};/,
    `let wSelections = {
    seo: { sel: false, plan: 'Starter' },
    meta: { sel: false, plan: 'Starter' },
    google: { sel: false, plan: 'Starter' },
    web: { sel: false, plan: 'Starter' },
    social: { sel: false, plan: 'Starter' },
    video: { sel: false, plan: 'Starter' }
};`
);

// 4. Update the names in wUpdateUI for Step 4
html = html.replace(
    /const names = \{seo:'SEO', meta:'Meta Ads', google:'Google Ads', web:'Web Design'\};/,
    `const names = {seo:'SEO', meta:'Meta Ads', google:'Google Ads', web:'Web Design', social:'Social Media', video:'Video Production'};`
);

// 5. Update wNext to handle submission via fetch
const fetchLogic = `
        const btn = document.getElementById('wiz-next');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Build the message string containing all their choices
        const names = {seo:'SEO', meta:'Meta Ads', google:'Google Ads', web:'Web Design', social:'Social Media', video:'Video Production'};
        let details = "Requested Services:\\n";
        let hasSelections = false;
        Object.keys(wSelections).forEach(k => {
            if(wSelections[k].sel) {
                const p = wPrices[k][wSelections[k].plan];
                details += \`- \${names[k]}: \${wSelections[k].plan} (\${p === 'Custom' ? 'Custom Pricing' : '₹'+p.toLocaleString()})\\n\`;
                hasSelections = true;
            }
        });
        if(!hasSelections) details += "None selected.\\n";
        details += "\\nEstimated Total: " + document.getElementById('wiz-total-val').innerText;
        
        const company = document.getElementById('w_company').value;
        if(company) details += "\\nCompany/Website: " + company;

        const formData = {
            name: document.getElementById('w_name').value,
            phone: document.getElementById('w_phone').value,
            email: document.getElementById('w_email').value,
            message: "[CUSTOM QUOTE BUILDER]:\\n" + details
        };

        const scriptURL = "https://script.google.com/macros/s/AKfycbwHQNCp53r_-9lnEKM6pXrVuyqtxuqq-5C3tCm8tHJYJYEhJJYN1dryN_PTSZLbo1tA/exec";
        
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(formData)
        }).then(() => {
            wStep = 5;
            wUpdateUI();
        }).catch(err => {
            alert("Something went wrong. Please try again.");
            btn.innerHTML = 'Submit Request <i class="fas fa-paper-plane" style="margin-left:5px;"></i>';
        });
        
        return;
`;

html = html.replace(
    /\/\/ Simulating submission delay for UI[\s\S]*?return;\n    \}/,
    fetchLogic + '    }'
);

fs.writeFileSync(file, html, 'utf8');
console.log("Wizard fully updated and integrated with Google Sheets!");
