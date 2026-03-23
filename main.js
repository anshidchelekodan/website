// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });
}

// Close mobile menu when clicking a link
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });
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

// Magnetic Button Effect
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// Pro Mouse Glow Mouse Effect
function initMouseGlow() {
  const cards = document.querySelectorAll('.pro-mv-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

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

document.addEventListener('DOMContentLoaded', () => {
  // Observe animated elements
  const animatedElements = document.querySelectorAll('.animate');
  animatedElements.forEach(el => observer.observe(el));
  
  // Init other features
  handleScroll();
  initMagneticButtons();
  initMouseGlow();
  initFAQ();
});

window.addEventListener('scroll', handleScroll);

// Set active nav link
const currentPath = window.location.pathname;
navItems.forEach(link => {
  const href = link.getAttribute('href');
  if (!href) return;
  
  // Remove relative path segments for comparison
  const cleanHref = href.replace(/^(\.\.\/)+/, '');
  
  // Home page check
  if (cleanHref === 'index.html' || cleanHref === './' || cleanHref === '') {
    if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
      link.classList.add('active');
    }
  } 
  // Folder check (e.g., about/, services/)
  else if (currentPath.includes('/' + cleanHref.replace(/\/$/, ''))) {
    link.classList.add('active');
  }
});

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
          Your insight has been sent to Anshid's inbox. Thank you for contributing to the discussion!
        </p>
      `;
      
      blogCommentForm.style.display = 'none';
      container.insertBefore(successMsg, blogCommentForm.nextSibling);
    })
    .catch(error => {
      console.error('Error!', error.message);
      btn.disabled = false;
      btn.textContent = originalText;
      alert("Something went wrong. Please try again or contact me directly via WhatsApp.");
    });
  });
}
