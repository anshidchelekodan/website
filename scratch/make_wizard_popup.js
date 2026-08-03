const fs = require('fs');
let html = fs.readFileSync('pricing/index.html', 'utf8');

// 1. Find the Quote Builder Tab section
const quoteTabStart = html.indexOf('<div id="quote" class="tab-content">');
const bottomGridStart = html.indexOf('<!-- BOTTOM GRID (CTA + FAQ) -->');

// Extract the whole quote builder tab (which currently includes the wizard container)
const quoteTabContent = html.substring(quoteTabStart, html.indexOf('</section>', quoteTabStart)); 
// Wait, </section> is the end of the pricing section. Let's find exactly where wizard-container ends.
// The wizard container ends with:
//         return;
//     }
//     wStep++;
//     wUpdateUI();
// }
// </script>
// </div>

const wizardContainerStart = html.indexOf('<div class="wizard-container">');
const scriptEnd = html.indexOf('</script>', wizardContainerStart) + 9;
const wizardContainerEnd = html.indexOf('</div>', scriptEnd) + 6;

const wizardFullHtml = html.substring(wizardContainerStart, wizardContainerEnd);

// 2. Remove the wizard container from inside the #quote tab
// and replace the #quote tab's intro with the Launch Splash Screen
const newQuoteTab = `        <!-- QUOTE BUILDER TAB -->
        <div id="quote" class="tab-content">
          <div class="web-intro" style="text-align: center; margin-bottom: 3rem; padding: 4rem 2rem; background: rgba(0,0,0,0.3); border-radius: 24px; border: 1px dashed rgba(46,230,166,0.3);">
            <div style="font-size: 4rem; color: var(--accent-color); margin-bottom: 1rem; animation: float-badge 3s ease-in-out infinite;"><i class="fas fa-magic"></i></div>
            <h2 style="font-size: clamp(1.8rem, 4vw, 2.5rem); margin-bottom: 0.5rem; color: #fff; font-weight: 800;">Custom <span class="text-accent">Project Estimator</span></h2>
            <p style="color: var(--text-secondary); max-width: 800px; margin: 0 auto 2.5rem auto; line-height: 1.6; font-size: 1.1rem;">Build your ideal digital marketing package in our new smart wizard. Select services, customize plans, and get an instant live estimate.</p>
            <button class="btn btn-primary" onclick="openWizardModal()" style="font-size: 1.1rem; padding: 1rem 3rem; box-shadow: 0 10px 30px rgba(46, 230, 166, 0.3);"><i class="fas fa-rocket"></i> Launch Quote Builder</button>
          </div>
        </div>`;

// 3. Update the Wizard CSS to make it a popup
let modifiedWizardHtml = wizardFullHtml;
const oldWizardCss = `.wizard-container {
    max-width: 900px;
    margin: 0 auto 50px auto;
    background: rgba(15, 15, 15, 0.4);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    font-family: var(--font-body, 'Montserrat', sans-serif);
}`;

const newWizardCss = `/* Modal Overlay Styles (Owl Style) */
.wizard-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(5, 11, 10, 0.9);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
}
.wizard-modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.wizard-container {
    width: 95%;
    max-width: 1000px;
    max-height: 90vh;
    background: rgba(12, 16, 15, 0.95);
    border: 1px solid rgba(46, 230, 166, 0.25);
    border-radius: 24px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(46, 230, 166, 0.15);
    display: flex;
    flex-direction: column;
    transform: scale(0.95) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: 0;
    position: relative;
}
.wizard-modal-overlay.active .wizard-container {
    transform: scale(1) translateY(0);
}
.wizard-step {
    overflow-y: auto;
    max-height: calc(90vh - 170px);
    padding: 40px;
}
/* Custom Scrollbar */
.wizard-step::-webkit-scrollbar { width: 6px; }
.wizard-step::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 6px; }

.wiz-close-modal {
    position: absolute;
    top: 25px;
    right: 25px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}
.wiz-close-modal:hover {
    background: rgba(255, 80, 80, 0.9);
    border-color: rgba(255, 80, 80, 1);
    transform: rotate(90deg);
}`;
modifiedWizardHtml = modifiedWizardHtml.replace(oldWizardCss, newWizardCss);

// Add the close button to the header
modifiedWizardHtml = modifiedWizardHtml.replace('<div class="wizard-header">', `<button class="wiz-close-modal" onclick="closeWizardModal()"><i class="fas fa-times"></i></button>\n    <div class="wizard-header">`);

// Add the JS functions to open/close
const modalJs = `
function openWizardModal() {
    document.getElementById('wizard-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
}
function closeWizardModal() {
    document.getElementById('wizard-modal').classList.remove('active');
    document.body.style.overflow = '';
}
</script>`;
modifiedWizardHtml = modifiedWizardHtml.replace('</script>', modalJs);

// Wrap in modal overlay
modifiedWizardHtml = `<div id="wizard-modal" class="wizard-modal-overlay">\n` + modifiedWizardHtml + `\n</div>`;

// 4. Put it all together
// Remove everything from <div id="quote" class="tab-content"> down to the end of the wizard container.
const oldQuoteSection = html.substring(quoteTabStart, wizardContainerEnd);

// Place the new splash screen where the old tab was, and place the modal at the very end of the file (before </body>)
html = html.replace(oldQuoteSection, newQuoteTab);

// Append the modal to the body
html = html.replace('</body>', modifiedWizardHtml + '\n</body>');

fs.writeFileSync('pricing/index.html', html, 'utf8');
console.log('Successfully converted wizard to popup modal!');
