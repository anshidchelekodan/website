// Mobile Menu Toggle logic
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Create backdrop element if it doesn't exist
let navOverlay = document.querySelector('.nav-overlay');
if (!navOverlay) {
  navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  document.body.appendChild(navOverlay);
}

const toggleMenu = (show) => {
  const isOpening = show !== undefined ? show : !navLinks.classList.contains('active');
  
  if (isOpening) {
    navLinks.classList.add('active');
    navOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    if (mobileMenuBtn.querySelector('i')) {
      mobileMenuBtn.querySelector('i').classList.replace('fa-bars', 'fa-times');
    }
  } else {
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (mobileMenuBtn.querySelector('i')) {
      mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
    }
  }
};

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => toggleMenu());
}

// Close menu when clicking overlay
navOverlay.addEventListener('click', () => toggleMenu(false));

// Close mobile menu when clicking a link
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
  item.addEventListener('click', () => toggleMenu(false));
});

// Scroll Animations (Intersection Observer)
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
      
      // Skill bars animation
      if (entry.target.classList.contains('expertise-item')) {
        const progressFill = entry.target.querySelector('.skill-progress-fill');
        if (progressFill) {
          progressFill.style.width = progressFill.getAttribute('data-width');
        }
      }
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Navbar & Header Logic
const navbar = document.querySelector('.navbar');

let isScrolling = false;
function handleScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
}

// Magnetic Button Effect DISABLED for cleaner UI
// function initMagneticButtons() {
//   const buttons = document.querySelectorAll('.btn-primary');
//   buttons.forEach(btn => {
//     btn.addEventListener('mousemove', (e) => {
//       const rect = btn.getBoundingClientRect();
//       const x = e.clientX - rect.left - rect.width / 2;
//       const y = e.clientY - rect.top - rect.height / 2;
//       btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
//     });
//     btn.addEventListener('mouseleave', () => {
//       btn.style.transform = 'translate(0px, 0px)';
//     });
//   });
// }

// Pro Mouse Glow Mouse Effect DISABLED for cleaner UI
// function initMouseGlow() {
//   const cards = document.querySelectorAll('.pro-mv-card');
//   cards.forEach(card => {
//     card.addEventListener('mousemove', (e) => {
//       const rect = card.getBoundingClientRect();
//       const x = ((e.clientX - rect.left) / rect.width) * 100;
//       const y = ((e.clientY - rect.top) / rect.height) * 100;
//       card.style.setProperty('--mouse-x', `${x}%`);
//       card.style.setProperty('--mouse-y', `${y}%`);
//     });
//   });
// }

const initFAQ = () => {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
};


// Back to Top Logic
const backToTopBtn = document.createElement('div');
backToTopBtn.className = 'back-to-top';
backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
document.body.appendChild(backToTopBtn);

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Observe animated elements
  const animatedElements = document.querySelectorAll('.animate');
  animatedElements.forEach(el => observer.observe(el));
  
  // Init other features
  handleScroll();
  initFAQ();
  
  // Back to top visibility
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  // Smooth scroll for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Set active nav link
  const currentPath = window.location.pathname;
  
  // Highlighting logic
  navItems.forEach(link => {
    link.classList.remove('active'); // Clear first
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Resolve full path
    const a = document.createElement('a');
    a.href = href;
    const linkPath = a.pathname;
    
    // Exact match
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
    // Folder match (services, portfolio, blog)
    else if (href !== 'index.html' && !href.endsWith('index.html') && href !== '' && href !== './') {
      const folderSegment = href.replace(/^(\.\.\/)+/, '').replace(/\/$/, '');
      if (folderSegment && currentPath.includes('/' + folderSegment + '/')) {
        link.classList.add('active');
      }
    }
    // Special case for home page (root or root index.html)
    const normalizedPath = currentPath.endsWith('/index.html')
      ? currentPath.slice(0, -'index.html'.length)
      : currentPath;
    const isRoot = normalizedPath === '/' || normalizedPath === '';
    const isRootIndex = currentPath === '/index.html';
    const isHomeLink = href === 'index.html' || href === './' || href === '../' || href === '../../' || href === '../index.html' || href === '../../index.html';

    if (isHomeLink && (isRoot || isRootIndex)) {
      link.classList.add('active');
    }
  });
});

window.addEventListener('scroll', handleScroll);


// Blog Comment Form Handler
const blogCommentForm = document.getElementById('blogCommentForm');
if (blogCommentForm) {
  blogCommentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = blogCommentForm.querySelector('button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    // Prepare data to match existing contact script (name, email, message, phone)
    const formData = {
      name: document.getElementById('comment-name').value,
      email: document.getElementById('comment-email').value,
      message: "[BLOG COMMENT]: " + document.getElementById('comment-msg').value,
      phone: "N/A"
    };

    // Use the existing Google Script endpoint found in contact/index.html
    const scriptURL = "https://script.google.com/macros/s/AKfycbwHQNCp53r_-9lnEKM6pXrVuyqtxuqq-5C3tCm8tHJYJYEhJJYN1dryN_PTSZLbo1tA/exec";

    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', // Google Script requires no-cors for simple fetch
      body: JSON.stringify(formData)
    })
    .then(() => {
      // Show Premium Success State
      const container = blogCommentForm.parentElement;
      const successMsg = document.createElement('div');
      successMsg.className = 'animate reveal reveal-up';
      successMsg.style.padding = '3.5rem 2rem';
      successMsg.style.background = 'rgba(255, 255, 255, 0.02)';
      successMsg.style.border = '1px solid var(--accent-color)';
      successMsg.style.borderRadius = '24px';
      successMsg.style.textAlign = 'center';
      successMsg.style.marginTop = '2rem';
      successMsg.style.boxShadow = 'var(--shadow-hover)';
      
      successMsg.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <i class="fas fa-check-circle" style="font-size: 3.5rem; color: var(--accent-color);"></i>
        </div>
        <h3 style="color: #fff; margin-bottom: 0.8rem; font-size: 2rem;">Message Received!</h3>
        <p style="color: var(--text-secondary); font-size: 1.15rem; max-width: 500px; margin: 0 auto; line-height: 1.6;">
          Your insight has been sent to Mohammad Anshid Ck's inbox. Thank you for contributing to the discussion!
        </p>
      `;
      
      blogCommentForm.style.display = 'none';
      container.insertBefore(successMsg, blogCommentForm.nextSibling);
    })
    .catch(error => {
      btn.disabled = false;
      btn.textContent = originalText;
      alert("Something went wrong. Please try again or contact me directly via WhatsApp.");
    });
  });
}
