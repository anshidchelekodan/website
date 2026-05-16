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
