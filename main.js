/**
 * main.js — Performance-Optimized
 * Fixes: layout thrashing, passive listeners, RAF throttling, GPU-only transforms
 */

/* ─── Mobile Menu ─────────────────────────────────────────── */
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks      = document.querySelector('.nav-links');

let navOverlay = document.querySelector('.nav-overlay');
if (!navOverlay) {
  navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  document.body.appendChild(navOverlay);
}

const closeMenuBtn = document.querySelector('.close-menu-btn');
const mainContent  = document.querySelector('main');

const toggleMenu = (show) => {
  const isOpening = show !== undefined ? show : !navLinks.classList.contains('active');
  if (isOpening) {
    navLinks.classList.add('active');
    navOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    if (mainContent) mainContent.style.filter = 'blur(10px)';
  } else {
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (mainContent) mainContent.style.filter = '';
  }
};

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
if (closeMenuBtn)  closeMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(false); });
navOverlay.addEventListener('click', () => toggleMenu(false));

const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => item.addEventListener('click', () => toggleMenu(false)));


/* ─── Scroll Animations (IntersectionObserver) ───────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
      // Skill bars — write only inside RAF to avoid forced reflow
      if (entry.target.classList.contains('expertise-item')) {
        const fill = entry.target.querySelector('.skill-progress-fill');
        if (fill) {
          const w = fill.getAttribute('data-width');
          requestAnimationFrame(() => { fill.style.width = w; });
        }
      }
      observer.unobserve(entry.target);
    }
  });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });


/* ─── Navbar Scroll (RAF-throttled, GPU class only) ─────── */
const navbar = document.querySelector('.navbar');
let _navRaf = false;
function handleScroll() {
  if (!_navRaf) {
    _navRaf = true;
    requestAnimationFrame(() => {
      // window.scrollY is cheap — doesn't force layout when read inside RAF
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      _navRaf = false;
    });
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });


/* ─── FAQ Accordion — batch read then write to avoid reflow ─ */
const initFAQ = () => {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // READ phase — gather all heights before touching DOM
      const heights = new Map();
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          heights.set(other, other.querySelector('.faq-answer').scrollHeight);
        }
      });
      const targetHeight = !isActive ? answer.scrollHeight : 0;

      // WRITE phase — single RAF
      requestAnimationFrame(() => {
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            other.querySelector('.faq-answer').style.maxHeight = null;
          }
        });
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = targetHeight + 'px';
        } else {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        }
      });
    });
  });
};


/* ─── Global UI (Progress Bar + Back-to-Top) ────────────── */
const initGlobalUI = () => {
  // Progress bar — use transform:scaleX() instead of width (GPU composited)
  if (!document.getElementById('scroll-progress-container')) {
    const pc = document.createElement('div');
    pc.id = 'scroll-progress-container';
    pc.innerHTML = '<div id="scroll-progress-bar"></div>';
    document.body.prepend(pc);
  }

  if (!document.querySelector('.back-to-top')) {
    const btn = document.createElement('div');
    btn.className = 'back-to-top';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

initGlobalUI();

const progressBar  = document.getElementById('scroll-progress-bar');
const backToTopBtn = document.querySelector('.back-to-top');
let _scrollRaf = false;

const updateScrollUI = () => {
  if (_scrollRaf) return;
  _scrollRaf = true;
  requestAnimationFrame(() => {
    const winScroll = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    // GPU-composited: scaleX instead of width
    if (progressBar && height > 0) {
      progressBar.style.transform = `scaleX(${winScroll / height})`;
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('active', winScroll > 400);
    }
    _scrollRaf = false;
  });
};

window.addEventListener('scroll', updateScrollUI, { passive: true });


/* ─── DOMContentLoaded init ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Observe animated elements (skip hero elements — they're already visible)
  document.querySelectorAll('.animate').forEach(el => observer.observe(el));

  handleScroll();
  initFAQ();
  updateScrollUI();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const el = document.getElementById(this.getAttribute('href').slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Active nav link highlighting
  const currentPath = window.location.pathname;
  const normalize = (p) => p.replace(/\/index\.html$/, '/').replace(/(.+)\/$/, '$1') || '/';
  const nCurrent = normalize(currentPath);
  navItems.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    let linkPath;
    try { linkPath = new URL(href, window.location.href).pathname; }
    catch (e) { const a = document.createElement('a'); a.href = href; linkPath = a.pathname; }
    const nLink = normalize(linkPath);
    if (nLink === nCurrent || (nLink !== '/' && nCurrent.startsWith(nLink + '/'))) {
      link.classList.add('active');
    }
  });
});


/* ─── Blog Comment Form ─────────────────────────────────── */
const blogCommentForm = document.getElementById('blogCommentForm');
if (blogCommentForm) {
  blogCommentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = blogCommentForm.querySelector('button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    const formData = {
      name: document.getElementById('comment-name').value,
      email: document.getElementById('comment-email').value,
      message: '[BLOG COMMENT]: ' + document.getElementById('comment-msg').value,
      phone: 'N/A'
    };
    fetch('https://script.google.com/macros/s/AKfycbwHQNCp53r_-9lnEKM6pXrVuyqtxuqq-5C3tCm8tHJYJYEhJJYN1dryN_PTSZLbo1tA/exec', {
      method: 'POST', mode: 'no-cors', body: JSON.stringify(formData)
    }).then(() => {
      const container = blogCommentForm.parentElement;
      const successMsg = document.createElement('div');
      successMsg.className = 'animate reveal reveal-up';
      successMsg.style.cssText = 'padding:3.5rem 2rem;background:rgba(255,255,255,.02);border:1px solid var(--accent-color);border-radius:24px;text-align:center;margin-top:2rem;';
      successMsg.innerHTML = `<div style="margin-bottom:1.5rem"><i class="fas fa-check-circle" style="font-size:3.5rem;color:var(--accent-color)"></i></div><h3 style="color:#fff;margin-bottom:.8rem;font-size:2rem">Message Received!</h3><p style="color:var(--text-secondary);font-size:1.15rem;max-width:500px;margin:0 auto;line-height:1.6">Your insight has been sent to Mohammad Anshid Ck's inbox.</p>`;
      blogCommentForm.style.display = 'none';
      container.insertBefore(successMsg, blogCommentForm.nextSibling);
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Something went wrong. Please try again or contact me directly via WhatsApp.');
    });
  });
}

// Global Owl Eye Tracking
document.addEventListener('mousemove', (e) => {
    const eyes = document.querySelectorAll('.eye');
    if(eyes.length === 0) return;
    eyes.forEach(eye => {
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const rad = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        
        // Max distance the pupil can move from center
        const distance = Math.min(13, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 10);
        
        const pupilX = distance * Math.cos(rad);
        const pupilY = distance * Math.sin(rad);
        
        const pupil = eye.querySelector('.pupil');
        if(pupil) {
            pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
    });
});

/* ─── The Growth Owl Easter Egg ─────────────────────────────────── */
const initGrowthOwl = () => {
    // Check localStorage (once every 24 hours)
    const lastSeen = localStorage.getItem('growthOwlSeen');
    const now = new Date().getTime();
    if (lastSeen && now - parseInt(lastSeen) < 24 * 60 * 60 * 1000) {
        return; // Already seen in the last 24 hours
    }

    // Only run once per session
    if (sessionStorage.getItem('growthOwlActive')) return;
    sessionStorage.setItem('growthOwlActive', 'true');

    // Wait a bit before flying (3 to 8 seconds)
    setTimeout(() => {
        createOwl();
    }, Math.random() * 5000 + 3000);

    function createOwl() {
        const wrapper = document.createElement('div');
        wrapper.id = 'growth-owl-wrapper';
        wrapper.style.cssText = `
            position: fixed;
            top: ${Math.random() * 40 + 20}vh;
            left: -100px;
            z-index: 9999;
            will-change: transform;
            user-select: none;
            cursor: pointer;
        `;
        
        const owl = document.createElement('div');
        owl.innerHTML = '🦉';
        owl.style.cssText = `
            font-size: 3.5rem;
            filter: drop-shadow(0 0 15px rgba(46, 230, 166, 0.8));
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: owlWiggle 2s infinite ease-in-out;
        `;
        
        wrapper.appendChild(owl);
        document.body.appendChild(wrapper);

        // Add global keyframes for wiggle
        if (!document.getElementById('owl-styles')) {
            const style = document.createElement('style');
            style.id = 'owl-styles';
            style.textContent = `
                @keyframes owlWiggle {
                    0%, 100% { transform: translateY(0) rotate(5deg); }
                    50% { transform: translateY(-15px) rotate(-5deg); }
                }
                @keyframes owlFadeIn {
                    from { opacity: 0; transform: translate(-50%, -40%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
                .owl-particle {
                    position: fixed;
                    pointer-events: none;
                    z-index: 10001;
                    background: var(--accent-color, #2EE6A6);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--accent-color, #2EE6A6), 0 0 20px rgba(46, 230, 166, 0.5);
                }
            `;
            document.head.appendChild(style);
        }

        // Fly animation using Web Animations API (GPU accelerated, no layout thrashing)
        const duration = 10000; // 10 seconds to cross
        const flyAnimation = wrapper.animate([
            { transform: 'translate3d(0, 0, 0)' },
            { transform: \`translate3d(calc(100vw + 200px), \${Math.random() * 200 - 100}px, 0)\` }
        ], {
            duration: duration,
            easing: 'linear',
            fill: 'forwards'
        });

        let clicked = false;
        
        wrapper.addEventListener('click', () => {
            if (clicked) return;
            clicked = true;
            flyAnimation.pause();
            localStorage.setItem('growthOwlSeen', now.toString()); // Mark as seen
            
            // Get current bounds for smooth transition
            const rect = wrapper.getBoundingClientRect();
            wrapper.style.left = rect.left + 'px';
            wrapper.style.top = rect.top + 'px';
            wrapper.style.transform = 'none';
            
            // Disable animation temporarily to transition to center
            requestAnimationFrame(() => {
                wrapper.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                wrapper.style.left = '50%';
                wrapper.style.top = '30%';
                owl.style.animation = 'none';
                owl.style.transform = 'translate(-50%, -50%) scale(1.5)';
                
                setTimeout(() => {
                    showPopup();
                    createConfetti();
                    wrapper.style.opacity = '0';
                    setTimeout(() => wrapper.remove(), 300);
                }, 600);
            });
        });

        flyAnimation.onfinish = () => {
            if (!clicked && wrapper.parentNode) wrapper.remove();
        };
    }

    function showPopup() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(5, 11, 10, 0.8); z-index: 10000; backdrop-filter: blur(8px);
            opacity: 0; transition: opacity 0.4s ease;
        `;
        document.body.appendChild(overlay);

        const popup = document.createElement('div');
        popup.className = 'owl-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(11, 46, 42, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(46, 230, 166, 0.3);
            border-radius: 24px;
            padding: 3rem 2.5rem;
            z-index: 10001;
            text-align: center;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
            color: #fff;
            opacity: 0;
            animation: owlFadeIn 0.6s forwards cubic-bezier(0.16, 1, 0.3, 1);
        `;

        popup.innerHTML = `
            <div style="font-size: 4.5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px rgba(46, 230, 166, 0.6)); transform: scale(1.1);">🦉</div>
            <h3 style="font-size: 1.8rem; margin-bottom: 1rem; color: #fff; font-weight: 700;">You found the Growth Owl!</h3>
            <p style="color: var(--text-secondary, #cbd5e1); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
               Smart businesses know growth comes from strategy, not luck.<br><br>
               <strong style="color: var(--accent-color, #2EE6A6);">Claim your free digital marketing strategy session.</strong>
            </p>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <a href="/contact/" class="btn btn-primary" style="width: 100%; justify-content: center;"><i class="fas fa-rocket" style="margin-right: 8px;"></i>Book Free Strategy Call</a>
                <button class="btn btn-outline close-owl-btn" style="width: 100%; justify-content: center; background: transparent; color: #fff; border-color: rgba(255,255,255,0.2);">Continue Exploring</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Trigger overlay fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        const closePopup = () => {
            popup.style.animation = 'none';
            popup.style.transition = 'all 0.4s ease';
            popup.style.opacity = '0';
            popup.style.transform = 'translate(-50%, -40%) scale(0.95)';
            overlay.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                overlay.remove();
            }, 400);
        };

        popup.querySelector('.close-owl-btn').addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
    }

    function createConfetti() {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'owl-particle';
            const size = Math.random() * 5 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particle.style.left = '50%';
            particle.style.top = '30%';
            
            document.body.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 80 + Math.random() * 150;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity + (Math.random() * 100 + 50); // Gravity effect
            
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: \`translate(calc(-50% + \${tx}px), calc(-50% + \${ty}px)) scale(0)\`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
    }
};

window.addEventListener('load', () => {
    setTimeout(initGrowthOwl, 2500);
});
