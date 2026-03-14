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
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Special case for progress bars
      if (entry.target.classList.contains('skill-bar-container')) {
        const progressLines = entry.target.querySelectorAll('.progress-line span');
        progressLines.forEach(line => {
          line.style.width = line.getAttribute('data-width');
        });
      }
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  // Observe animated elements
  const animatedElements = document.querySelectorAll('.animate');
  animatedElements.forEach(el => observer.observe(el));
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
    navbar.style.padding = '1rem 0';
  } else {
    navbar.style.boxShadow = 'none';
    navbar.style.padding = '1.5rem 0';
  }
});

// Set active nav link based on current page completely matching or partially matching
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
navItems.forEach(link => {
  const linkPath = link.getAttribute('href');
  if (linkPath === currentPath) {
    link.classList.add('active');
  }
});
