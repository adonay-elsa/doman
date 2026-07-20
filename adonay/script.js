// Premium Animations & Interactions
(function() {
  'use strict';

  // ===== LOADING SCREEN =====
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 1200);
    });
  }

  // ===== THEME TOGGLE =====
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ===== MOBILE NAV =====
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== NAVIGATION SCROLL =====
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  const handleNavScroll = () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ===== REVEAL ON SCROLL =====
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== PARALLAX EFFECT =====
  const handleParallax = () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.parallax-slow').forEach(el => {
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
      const yPos = -(scrolled * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  };
  window.addEventListener('scroll', handleParallax, { passive: true });

  // ===== MOUSE FOLLOW LIGHT =====
  const handleMouseLight = (e) => {
    document.querySelectorAll('.mouse-light').forEach(el => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.03) 0%, transparent 50%)`;
    });
  };
  window.addEventListener('mousemove', handleMouseLight, { passive: true });

  // ===== MAGNETIC BUTTONS =====
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ===== COUNTER ANIMATION =====
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          if (!target) return;
          const duration = 2000;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased) + (target > 100 ? '+' : '');
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  // ===== HABESHA PATTERN ANIMATION =====
  const animatePattern = () => {
    const patterns = document.querySelectorAll('.habesha-pattern');
    let time = 0;
    const tick = () => {
      time += 0.003;
      patterns.forEach((pattern, i) => {
        pattern.style.transform = `translateY(${Math.sin(time + i) * 20}px) rotate(${Math.sin(time * 0.5 + i) * 2}deg)`;
      });
      requestAnimationFrame(tick);
    };
    tick();
  };
  animatePattern();

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== IMAGE LAZY LOADING =====
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
  }

  // ===== ACTIVE NAV LINK =====
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  const handleActiveNav = () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', handleActiveNav, { passive: true });

  // ===== FORM HANDLING =====
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message Sent!';
        btn.style.background = '#34d399';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }, 1500);
    });
  });

  // ===== CUSTOM CURSOR (Desktop only) =====
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--text);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.15s var(--ease-out), opacity 0.3s;
      mix-blend-mode: difference;
      opacity: 0;
    `;
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorDot.style.cssText = `
      position: fixed;
      width: 32px;
      height: 32px;
      border: 1px solid var(--text);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: transform 0.4s var(--ease-out), opacity 0.3s;
      opacity: 0;
    `;
    document.body.appendChild(cursorDot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = '0.8';
      cursorDot.style.opacity = '0.5';
    });

    window.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });

    document.querySelectorAll('a, button, .btn, .cert-card, .portfolio-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2.5)';
        cursorDot.style.transform = 'scale(1.5)';
        cursorDot.style.borderColor = 'var(--accent)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorDot.style.transform = 'scale(1)';
        cursorDot.style.borderColor = 'var(--text)';
      });
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      dotX += (mouseX - dotX) * 0.08;
      dotY += (mouseY - dotY) * 0.08;

      cursor.style.left = cursorX - 4 + 'px';
      cursor.style.top = cursorY - 4 + 'px';
      cursorDot.style.left = dotX - 16 + 'px';
      cursorDot.style.top = dotY - 16 + 'px';

      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }

  // ===== LIGHTBOX =====
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbMedia = document.getElementById('lightbox-media');
    const lbCaption = document.getElementById('lightbox-caption');
    let lbImages = [];
    let lbIndex = 0;

    window.openLightbox = function(imgs, idx) {
      lbImages = imgs;
      lbIndex = idx;
      renderLightbox();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    function renderLightbox() {
      const img = lbImages[lbIndex];
      lbMedia.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" style="max-width:90vw;max-height:80vh;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,0.5);" />`;
      lbCaption.textContent = img.caption || img.alt || '';
    }

    window.closeLightbox = function() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    window.stepLightbox = function(dir) {
      lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
      renderLightbox();
    };

    document.querySelectorAll('.zoomable img').forEach(img => {
      img.addEventListener('click', () => {
        const card = img.closest('.zoomable');
        const imgs = [...card.querySelectorAll('img')].map(i => ({
          src: i.src,
          alt: i.alt,
          caption: i.dataset.caption || i.alt
        }));
        openLightbox(imgs, imgs.findIndex(i => i.src === img.src));
      });
    });

    lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => stepLightbox(-1));
    lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  // ===== HABESHA PATTERN SVG GENERATOR =====
  const createHabeshaPattern = () => {
    const pattern = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <pattern id="habesha" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill="none"/>
            <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
            <path d="M20 5L35 20L20 35L5 20Z" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.2"/>
            <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.15"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#habesha)"/>
      </svg>
    `;
    return pattern;
  };

  // ===== INITIALIZE =====
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
  });

})();
