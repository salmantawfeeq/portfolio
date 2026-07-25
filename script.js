(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


  function smoothScrollTo(selector) {

    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Footer copyright year
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Click on navbar name -> scroll to top
  const logo = document.querySelector(".navbar .logo");
  if (logo) {
    logo.style.cursor = "pointer";

    const goHome = () => {
      const home = document.getElementById("home");
      if (home) {
        home.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    logo.addEventListener("click", (e) => {
      e.preventDefault?.();
      goHome();
    });

    // Keyboard accessibility (mobile/desktop friendly)
    logo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goHome();
      }
    });
  }

  // Navbar links +  button

  // Use pointerup + click fallback to avoid touch quirks on some mobile browsers.
  function handleInPageNav(targetEl, e) {
    if (!targetEl) return;

    // Anchor links
    if (targetEl.tagName.toLowerCase() === "a") {
      const href = targetEl.getAttribute("href");
      if (!href || href === "#") return;

      // Prevent default only for hash navigation, so we fully control the smooth behavior.
      // This fixes inconsistent touch/click scrolling on mobile.
      e.preventDefault?.();
      smoothScrollTo(href);
      return;
    }

    // Buttons
    if (targetEl.tagName.toLowerCase() === "button" && targetEl.dataset.scroll) {
      e.preventDefault?.();
      smoothScrollTo(targetEl.dataset.scroll);
    }
  }

  const navDelegationSelector = 'a[href^="#"], button[data-scroll]';

  document.addEventListener("pointerup", (e) => {
    // Only handle primary interactions (tap/click)
    const a = e.target.closest(navDelegationSelector);
    if (!a) return;
    handleInPageNav(a, e);
  });

  // Fallback for desktops/browsers where pointerup isn't reliable
  document.addEventListener("click", (e) => {
    const a = e.target.closest(navDelegationSelector);
    if (!a) return;
    handleInPageNav(a, e);
  });


  // Active section highlight (scroll spy)
  const nav = document.querySelector(".navbar");
  const navLinks = $$('.nav-links a[href^="#"]');
  const navUnderline = $(".nav-underline");
  const dock = $(".mobile-dock");
  const dockItems = $$(".dock-item", dock || document);
  const dockIndicator = $(".dock-indicator");

  function moveNavUnderline(link) {
    if (!navUnderline || !nav) return;
    if (!link) {
      navUnderline.style.opacity = "0";
      return;
    }
    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    navUnderline.style.opacity = "1";
    navUnderline.style.width = `${linkRect.width}px`;
    navUnderline.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
  }

  function moveDockIndicator(item) {
    if (!dockIndicator || !dock) return;
    if (!item || getComputedStyle(dock).display === "none") {
      dockIndicator.style.opacity = "0";
      return;
    }
    const itemRect = item.getBoundingClientRect();
    const dockRect = dock.getBoundingClientRect();
    dockIndicator.style.opacity = "1";
    dockIndicator.style.width = `${itemRect.width}px`;
    dockIndicator.style.transform = `translateX(${itemRect.left - dockRect.left}px)`;
  }

  function setActiveSection(id) {
    let activeLink = null;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const targetId = href ? href.slice(1) : null;
      if (targetId && targetId === id) {
        link.classList.add("is-active");
        activeLink = link;
      } else {
        link.classList.remove("is-active");
      }
    });
    moveNavUnderline(activeLink);

    let activeDockItem = null;
    dockItems.forEach((item) => {
      if (item.dataset.dock === id) {
        item.classList.add("is-active");
        activeDockItem = item;
      } else {
        item.classList.remove("is-active");
      }
    });
    moveDockIndicator(activeDockItem);

    const allTypeLines = $$(".type-line");
    if (allTypeLines.length) {
      const modernLabel = document.querySelector(".modern-label");
      if (modernLabel) {
        modernLabel.style.opacity = "1";
        modernLabel.style.clipPath = "none";
      }
    }
  }

  // Contact form (EmailJS)
  const CONTACT = {
    formId: "contact-form",
    statusId: "contact-status",
    serviceId: "service_3zr6jkm",
    templateId: "template_bjsohns",
    userId: "nnOro-mJNyF3wnTjt",
    toEmail: "salmantawfeeq10@gmail.com",
  };

function setStatus(statusEl, type, msg) {
    if (!statusEl) return;
    statusEl.classList.remove("is-success", "is-error", "is-visible");
    if (type)
      statusEl.classList.add(type === "success" ? "is-success" : "is-error");
    statusEl.textContent = msg || "";
    statusEl.classList.add("is-visible");
  }

  function getFieldValue(form, name) {
    const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
    return el ? el.value.trim() : "";
  }

  function basicValidate(name, email, message) {
    if (!name || name.length < 2) return t("Please enter your name.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return t("Please enter a valid email.");
    if (!message || message.length < 10)
      return t("Message must be at least 10 characters.");
    return null;
  }

  async function sendViaEmailJS(payload) {
    if (!window.emailjs || typeof window.emailjs.send !== "function") {
      throw new Error("EmailJS SDK not loaded");
    }

    if (typeof window.emailjs.init === "function") {
      window.emailjs.init(CONTACT.userId);
    }

    return window.emailjs.send(CONTACT.serviceId, CONTACT.templateId, payload);
  }

  function buildMailtoLink({ name, email, message }) {
    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );
    return `mailto:${CONTACT.toEmail}?subject=${subject}&body=${body}`;
  }

  // Scroll progress + navbar intensity
  const scrollBar = $(".scroll-progress-bar");
  function updateScrollUI() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

    if (scrollBar) scrollBar.style.width = `${p * 100}%`;
    if (nav)
      nav.style.boxShadow = p > 0.02 ? "0 14px 40px rgba(0,0,0,.30)" : "none";
  }
  updateScrollUI();
  window.addEventListener("scroll", () => updateScrollUI(), { passive: true });

  // Contact form submit handling
  const contactForm = $(`#${CONTACT.formId}`);
  const contactStatus = $(`#${CONTACT.statusId}`);

  if (contactForm) {
    const sendBtn = contactForm.querySelector(".contact-send");

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = getFieldValue(contactForm, "name");
      const email = getFieldValue(contactForm, "email");
      const message = getFieldValue(contactForm, "message");

      const err = basicValidate(name, email, message);
      if (err) {
        setStatus(contactStatus, "error", err);
        return;
      }

      const payload = { name, email, message };

      if (sendBtn) {
        sendBtn.classList.add("is-loading");
        sendBtn.disabled = true;
      }
      setStatus(contactStatus, null, "");

      try {
        await sendViaEmailJS(payload);
        setStatus(contactStatus, "success", t("Message sent successfully!"));
        contactForm.reset();
      } catch (error) {
        // Important: do NOT navigate immediately.
        // Instead, show a mailto link so it opens only if the user clicks.
        const mailto = buildMailtoLink({ name, email, message });
        setStatus(
          contactStatus,
          "error",
          t("Could not send via EmailJS. Click to open an email draft."),
        );

        let linkEl = contactForm.querySelector(".contact-mailto-link");
        if (!linkEl) {
          linkEl = document.createElement("a");
          linkEl.className = "contact-mailto-link";
          linkEl.style.display = "inline-flex";
          linkEl.style.marginTop = "10px";
          linkEl.style.fontWeight = "900";
          linkEl.style.color = "var(--accent)";
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          contactForm.appendChild(linkEl);
        }
        linkEl.textContent = t("Open email draft (mailto)");
        linkEl.href = mailto;
      } finally {
        if (sendBtn) {
          sendBtn.classList.remove("is-loading");
          sendBtn.disabled = false;
        }
      }
    });
  }

  // IntersectionObserver animations
  const animateTargets = $$(
    ".projects, .about, .experience, .contact, .certifications, .cert-card, .project-card, .about-card, .skills-card",
  );

  // Scroll-spy: computed directly from live geometry on every scroll tick
  // (rAF-throttled) rather than IntersectionObserver threshold-crossing
  // events. This avoids relying on async crossing notifications reliably
  // firing for the exact moment a section's ratio returns to zero — which
  // proved flaky right at the viewport edge and could strand a stale
  // "active" section after a fast scroll back to the top.
  const navSectionEls = ["projects", "about", "certifications", "experience", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function computeActiveSection() {
    const vh = window.innerHeight;
    const MIN_ACTIVE_RATIO = 0.12;
    let bestId = null;
    let bestRatio = MIN_ACTIVE_RATIO;

    navSectionEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return;
      const visibleTop = Math.max(r.top, 0);
      const visibleBottom = Math.min(r.bottom, vh);
      const visibleH = Math.max(0, visibleBottom - visibleTop);
      const ratio = visibleH / r.height;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = el.id;
      }
    });

    setActiveSection(bestId);
  }

  if (navSectionEls.length) {
    let spyTicking = false;
    const scheduleActiveSectionUpdate = () => {
      if (spyTicking) return;
      spyTicking = true;
      requestAnimationFrame(() => {
        computeActiveSection();
        spyTicking = false;
      });
    };

    computeActiveSection();
    window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveSectionUpdate, { passive: true });
  }

  if ("IntersectionObserver" in window) {
    // Progress bars animation (Proficiency)
    const proficiency = document.getElementById("proficiency");
    if (proficiency) {
      const pbIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              proficiency.classList.add("is-proficiency-visible");
              // Activate fills once
              $$(".progress-row", proficiency).forEach((row) => {
                row.classList.add("is-activated");
              });
            }
          }
        },
        { threshold: 0.25 },
      );
      pbIO.observe(proficiency);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 },
    );

    animateTargets.forEach((t) => {
      t.classList.add("will-animate");
      io.observe(t);
    });

    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      const aboutIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              aboutSection.classList.add("is-about-visible");
            }
          }
        },
        { threshold: [0.08, 0.18, 0.35] },
      );
      aboutIO.observe(aboutSection);
    }
  }

  // Hero interactivity (mouse glow + subtle parallax)
  const hero = document.querySelector(".hero");
  const orb = document.querySelector(".cursor-orb");
  const circle = document.querySelector(".circle");
  const scan = document.querySelector(".bg-scan");

  if (hero && orb) {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      let heroInView = true;
      if ("IntersectionObserver" in window) {
        heroInView = false;
        new IntersectionObserver(
          (entries) => {
            heroInView = entries[0].isIntersecting;
          },
          { threshold: 0 },
        ).observe(hero);
      }

      let pendingEvent = null;
      let ticking = false;

      function applyParallax(e) {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; // 0..1
        const y = (e.clientY - r.top) / r.height; // 0..1

        const ox = (x - 0.5) * 80;
        const oy = (y - 0.5) * 60;
        orb.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;

        if (circle) {
          circle.style.transform = `translate3d(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px, 0)`;
        }

        if (scan) {
          scan.style.opacity = String(0.08 + x * 0.1);
          scan.style.transform = `translateY(${(-20 + y * 40).toFixed(2)}%)`;
        }
      }

      window.addEventListener(
        "mousemove",
        (e) => {
          if (!heroInView) return;
          pendingEvent = e;
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            applyParallax(pendingEvent);
            ticking = false;
          });
        },
        { passive: true },
      );
    }
  }


  // Project Galleries (carousel) - simple prev/next per project card
  const galleries = $$("[data-gallery]");

  function setupGallery(galleryEl) {
    const track = galleryEl.querySelector(".gallery-track");
    const items = track ? Array.from(track.querySelectorAll("img")) : [];
    const prevBtn = galleryEl.querySelector(".gallery-btn.prev");
    const nextBtn = galleryEl.querySelector(".gallery-btn.next");

    if (!track || items.length <= 1) return;

    let index = 0;

    function render() {
      track.style.transform = `translateX(${-index * 100}%)`;
    }

    function goNext() {
      index = (index + 1) % items.length;
      render();
    }

    function goPrev() {
      index = (index - 1 + items.length) % items.length;
      render();
    }

    // Prevent link navigation/selection issues inside <a> wrappers on mobile
    const blockTouch = (ev) => {
      ev.preventDefault?.();
      ev.stopPropagation?.();
    };

    // click
    prevBtn?.addEventListener("click", (ev) => {
      blockTouch(ev);
      goPrev();
    });
    nextBtn?.addEventListener("click", (ev) => {
      blockTouch(ev);
      goNext();
    });

    // touch / pointer
    prevBtn?.addEventListener("pointerdown", (ev) => blockTouch(ev));
    nextBtn?.addEventListener("pointerdown", (ev) => blockTouch(ev));


    // Keyboard support when focus is inside gallery
    galleryEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    });

    render();
  }

  if (galleries.length) {
    galleries.forEach(setupGallery);
  }

  // 3D tilt on cards (mouse-only, respects reduced motion)
  const reduceMotionMQ =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointerMQ = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  if (!reduceMotionMQ && !coarsePointerMQ) {
    const tiltEls = $$(".project-card, .cert-card, .about-card, .skills-card");

    tiltEls.forEach((card) => {
      const maxTilt = 6;
      let rafId = null;
      let pending = null;

      function applyTilt() {
        rafId = null;
        if (!pending) return;
        const { px, py } = pending;
        card.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale(1.015)`;
      }

      card.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = card.getBoundingClientRect();
        pending = {
          px: (e.clientX - r.left) / r.width - 0.5,
          py: (e.clientY - r.top) / r.height - 0.5,
        };
        card.style.transition = "transform 0.06s linear";
        if (rafId === null) rafId = requestAnimationFrame(applyTilt);
      });

      card.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        pending = null;
        card.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
        card.style.transform = "";
      });
    });
  }

  // ---------------------------------------------------------------
  // Language toggle (English / Arabic) — swaps text via data-i18n-ar
  // attributes, flips document direction to RTL, and persists choice.
  // ---------------------------------------------------------------
  const LANG_STORAGE_KEY = "site-lang";

  const MESSAGES_AR = {
    "Please enter your name.": "من فضلك أدخل اسمك.",
    "Please enter a valid email.": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.",
    "Message must be at least 10 characters.": "يجب أن تكون الرسالة 10 أحرف على الأقل.",
    "Message sent successfully!": "تم إرسال الرسالة بنجاح!",
    "Could not send via EmailJS. Click to open an email draft.":
      "تعذر الإرسال عبر EmailJS. اضغط لفتح مسودة بريد إلكتروني.",
    "Open email draft (mailto)": "افتح مسودة البريد الإلكتروني",
  };

  let currentLang = "en";

  function t(enText) {
    return currentLang === "ar" ? MESSAGES_AR[enText] || enText : enText;
  }

  function applyLanguage(lang) {
    const isAr = lang === "ar";
    currentLang = isAr ? "ar" : "en";

    document.documentElement.lang = currentLang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";

    $$("[data-i18n-ar]").forEach((el) => {
      if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.textContent;
      el.textContent = isAr ? el.dataset.i18nAr : el.dataset.i18nEn;
    });

    $$("[data-i18n-ar-placeholder]").forEach((el) => {
      if (el.dataset.i18nEnPlaceholder === undefined) {
        el.dataset.i18nEnPlaceholder = el.getAttribute("placeholder") || "";
      }
      el.setAttribute(
        "placeholder",
        isAr ? el.dataset.i18nArPlaceholder : el.dataset.i18nEnPlaceholder,
      );
    });

    $$("[data-tooltip-ar]").forEach((el) => {
      if (el.dataset.tooltipEn === undefined) {
        el.dataset.tooltipEn = el.getAttribute("data-tooltip") || "";
      }
      el.setAttribute(
        "data-tooltip",
        isAr ? el.dataset.tooltipAr : el.dataset.tooltipEn,
      );
    });

    const langToggleLabel = document.querySelector("#lang-toggle .lang-toggle-label");
    if (langToggleLabel) langToggleLabel.textContent = isAr ? "English" : "العربية";

    try {
      localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    } catch (e) {
      /* private mode / storage disabled — language just won't persist */
    }

    // Nav-underline / dock-indicator geometry depends on rendered text
    // width, which changes when the language switches.
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  const langToggleBtn = document.getElementById("lang-toggle");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      applyLanguage(currentLang === "en" ? "ar" : "en");
    });
  }

  let storedLang = null;
  try {
    storedLang = localStorage.getItem(LANG_STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  applyLanguage(storedLang === "ar" ? "ar" : "en");
})();

