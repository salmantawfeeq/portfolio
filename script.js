// script.js

(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Smooth scroll for in-page links
  function smoothScrollTo(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Navbar links + Hire Me button
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"], button[data-scroll]');
    if (!a) return;

    // Anchor links
    if (a.tagName.toLowerCase() === 'a') {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      smoothScrollTo(href);
    }

    // Buttons
    if (a.tagName.toLowerCase() === 'button' && a.dataset.scroll) {
      e.preventDefault();
      smoothScrollTo(a.dataset.scroll);
    }
  });

  // Active section highlight (scroll spy)
  const nav = document.querySelector('.navbar');
  const navLinks = $$('.nav-links a[href^="#"]');

  function setActiveSection(id) {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const targetId = href ? href.slice(1) : null;
      if (targetId && targetId === id) link.classList.add('is-active');
      else link.classList.remove('is-active');
    });

    // Dashboard label: sync with the section keyword inside the hero
    const allTypeLines = $$('.type-line');
    if (allTypeLines.length) {
      const map = {
        home: 'Building',
        projects: 'Web Experiences',
        about: 'Web Experiences',
        experience: 'That Perform',
        contact: 'That Perform'
      };

      // عند دخول الصفحة من بداية الـ load أو السكشن home تحديدًا: اعرض أول سطر فقط
      // (ده بيضمن إن Home يكون له شكل مستقل ومش محتاج تحميل من Intersection غير جاهز)
      const desired = map[id] || 'Building';

      // ثابت: تعطيل تفاعل إظهار/إخفاء سطور العنوان اللي عليها data-type
      // (ده بيوقف أي مشاكل بتظهر بعد Refresh أو الرجوع للصفحة)
      // allTypeLines.forEach((el) => {
      //   const t = el.getAttribute('data-type');
      //   const shouldShow = t === desired;
      //   el.style.opacity = shouldShow ? '1' : '0';
      //   el.style.clipPath = shouldShow ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)';
      // });

      // تأكد إن Modern ثابتة دائمًا
      const modernLabel = document.querySelector('.modern-label');
      if (modernLabel) {
        modernLabel.style.opacity = '1';
        modernLabel.style.clipPath = 'none';
      }
    }
  }

  // تم إيقاف sync الديناميكي لتفادي اختفاء النص بعد refresh/scroll.
  // setActiveSection('home');

  if ('IntersectionObserver' in window) {
    const sections = ['home', 'projects', 'about', 'experience', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const spy = new IntersectionObserver(
      (entries) => {
        // pick the most visible one
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        // تم تعطيل setActiveSection لتفادي أي تغيّر في كلمات hero بعد الرجوع/refresh.
        // setActiveSection(visible.target.id);
      },
      { threshold: [0.15, 0.35, 0.6] }
    );

    sections.forEach((s) => spy.observe(s));
  }

  // Scroll progress + navbar intensity
  const scrollBar = $('.scroll-progress-bar');
  function updateScrollUI() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

    if (scrollBar) scrollBar.style.width = `${p * 100}%`;
    if (nav) nav.style.boxShadow = p > 0.02 ? '0 14px 40px rgba(0,0,0,.30)' : 'none';
  }
  updateScrollUI();
  window.addEventListener('scroll', () => updateScrollUI(), { passive: true });

  // IntersectionObserver animations
  const animateTargets = $$('.projects, .about, .experience, .contact, .certifications, .cert-card, .project-card, .about-card, .skills-card');

  const supportsIO = 'IntersectionObserver' in window;

  // About background progressive reveal (separate, so we can control the class)
  const aboutSection = document.getElementById('about');


  if (supportsIO) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        }
      },
      { threshold: 0.12 }
    );
    animateTargets.forEach((t) => {
      t.classList.add('will-animate');
      io.observe(t);
    });

    // Progressive reveal for About background only
    if (aboutSection) {
      const aboutIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              aboutSection.classList.add('is-about-visible');
            }
          }
        },
        { threshold: [0.08, 0.18, 0.35] }
      );
      aboutIO.observe(aboutSection);
    }
  }


  // Hero interactivity (mouse glow + subtle parallax)
  const hero = document.querySelector('.hero');
  const orb = document.querySelector('.cursor-orb');
  const circle = document.querySelector('.circle');
  const scan = document.querySelector('.bg-scan');

  if (hero && orb) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      window.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; // 0..1
        const y = (e.clientY - r.top) / r.height; // 0..1

        // Move orb slightly within hero-visual area
        const ox = (x - 0.5) * 80;
        const oy = (y - 0.5) * 60;
        orb.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;

        if (circle) {
          circle.style.transform = `translate3d(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px, 0)`;
        }

        if (scan) {
          scan.style.opacity = String(0.08 + x * 0.10);
          scan.style.transform = `translateY(${(-20 + y * 40).toFixed(2)}%)`;
        }
      }, { passive: true });
    }
  }

  // Contact form validation + micro-interaction
  const form = $('#contactForm');
  const hint = $('#formHint');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('input[name="name"]')?.value.trim();
      const email = form.querySelector('input[name="email"]')?.value.trim();
      const message = form.querySelector('textarea[name="message"]')?.value.trim();

      if (!name || !email || !message) {
        if (hint) hint.textContent = 'Please fill in all fields.';
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        if (hint) hint.textContent = 'Please enter a valid email.';
        return;
      }

      if (hint) hint.textContent = 'Sending...';
      if (submitBtn) {
        submitBtn.disabled = true;
        const oldText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';

        setTimeout(() => {
          if (hint) hint.textContent = 'Message sent (demo).';
          form.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = oldText;
        }, 700);
      } else {
        if (hint) hint.textContent = 'Message sent (demo).';
        form.reset();
      }
    });
  }
})();

