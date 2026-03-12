'use strict';

/* ============================================================
   SCROLL — sticky header shadow
   ============================================================ */
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on any link click inside nav
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-item').forEach((item) => {
  const toggle = item.querySelector('.faq-toggle');
  const answer = item.querySelector('.faq-answer');

  // Remove the native hidden so CSS animation works
  answer.removeAttribute('hidden');
  answer.style.maxHeight = '0';

  toggle.addEventListener('click', () => {
    const isOpen = item.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));

    answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0';

    // Close sibling items
    document.querySelectorAll('.faq-item').forEach((other) => {
      if (other !== item && other.classList.contains('is-open')) {
        other.classList.remove('is-open');
        other.querySelector('.faq-toggle').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      }
    });
  });
});

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * target);

    // Russian locale formats 5000 as "5 000"
    el.textContent = value.toLocaleString('ru-RU');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString('ru-RU');
    }
  }

  requestAnimationFrame(step);
}

/* ============================================================
   INTERSECTION OBSERVER — fade-in & counters
   ============================================================ */
const observerConfig = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

// Fade-in for cards, steps, review cards, faq items
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerConfig);

document.querySelectorAll('.benefit-card, .step, .review-card, .faq-item').forEach((el) => {
  el.classList.add('js-fade');
  fadeObserver.observe(el);
});

// Counter observer — fires once when stats bar enters viewport
const statsBar = document.querySelector('.stats-bar');

if (statsBar) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statsBar.querySelectorAll('.stat-number').forEach(animateCounter);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counterObserver.observe(statsBar);
}

/* ============================================================
   SMOOTH SCROLL for anchor links (fallback for older Safari)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id     = link.getAttribute('href');
    const target = id === '#' ? null : document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});
