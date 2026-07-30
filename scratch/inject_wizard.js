const fs = require('fs');
const path = require('path');

const pricingFile = path.join('d:', 'website', 'pricing', 'index.html');
const wizardFile = path.join('d:', 'website', 'scratch', 'new_wizard.html');

let html = fs.readFileSync(pricingFile, 'utf8');
const wizardHtml = fs.readFileSync(wizardFile, 'utf8');

// 1. Remove old CSS
html = html.replace(/<style>\s*\/\* Custom Quote Builder Styles \*\/[\s\S]*?<\/style>/, '');

// 2. Remove old JS
html = html.replace(/<script>\s*\/\* ==========================================\s*\*\/[\s\S]*?<\/script>/, '');

// 3. Replace old HTML tab content with new wizard
// Find the exact boundaries of the QUOTE BUILDER TAB block
const tabStartStr = '<!-- QUOTE BUILDER TAB -->';
const tabStartIndex = html.indexOf(tabStartStr);

if (tabStartIndex !== -1) {
    // Find where the tab content ends by looking for the end of the section
    const sectionEndStr = '</div>\r\n      </div>\r\n    </section>';
    const fallbackSectionEndStr = '</div>\n      </div>\n    </section>';
    
    let tabEndIndex = html.indexOf(sectionEndStr, tabStartIndex);
    if (tabEndIndex === -1) {
        tabEndIndex = html.indexOf(fallbackSectionEndStr, tabStartIndex);
    }
    
    if (tabEndIndex !== -1) {
        // Extract everything before the tab and everything after the tab
        const beforeTab = html.substring(0, tabStartIndex);
        const afterTab = html.substring(tabEndIndex);
        
        // Wrap wizardHtml in the tab-content div
        const newTab = `<!-- QUOTE BUILDER TAB -->
        <div id="quote" class="tab-content">
          <div class="web-intro" style="text-align: center; margin-bottom: 3rem;">
            <h2 style="font-size: clamp(1.8rem, 4vw, 2.5rem); margin-bottom: 0.5rem; color: #fff; font-weight: 800;">Custom <span class="text-accent">Project Estimator</span></h2>
            <p style="color: var(--text-secondary); max-width: 800px; margin: 0 auto; line-height: 1.6;">Build your ideal digital marketing package in our new step-by-step wizard. Select the services you need, customize your plans, and get an instant live estimate.</p>
          </div>
          ${wizardHtml}
        </div>
        `;
        
        html = beforeTab + newTab + afterTab;
        fs.writeFileSync(pricingFile, html, 'utf8');
        console.log("Successfully injected new Wizard into pricing/index.html");
    } else {
        console.error("Could not find the end of the quote tab.");
    }
} else {
    console.error("Could not find <!-- QUOTE BUILDER TAB -->");
}
