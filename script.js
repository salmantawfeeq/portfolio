// script.js

(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Smooth scroll for in-page links
  function smoothScrollTo(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Click on navbar name -> scroll to top
  const logo = document.querySelector(".navbar .logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", (e) => {
      // Avoid any accidental selection
      e.preventDefault?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Navbar links +  button
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"], button[data-scroll]');
    if (!a) return;

    // Anchor links
    if (a.tagName.toLowerCase() === "a") {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      smoothScrollTo(href);
    }

    // Buttons
    if (a.tagName.toLowerCase() === "button" && a.dataset.scroll) {
      e.preventDefault();
      smoothScrollTo(a.dataset.scroll);
    }
  });

  // Active section highlight (scroll spy)
  const nav = document.querySelector(".navbar");
  const navLinks = $$('.nav-links a[href^="#"]');

  function setActiveSection(id) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const targetId = href ? href.slice(1) : null;
      if (targetId && targetId === id) link.classList.add("is-active");
      else link.classList.remove("is-active");
    });

    const allTypeLines = $$(".type-line");
    if (allTypeLines.length) {
      const map = {
        home: "Building",
        projects: "Web Experiences",
        about: "Web Experiences",
        experience: "That Perform",
        contact: "That Perform",
      };

      const desired = map[id] || "Building";

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
    if (!name || name.length < 2) return "Please enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email.";
    if (!message || message.length < 10)
      return "Message must be at least 10 characters.";
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
        setStatus(contactStatus, "success", "Message sent successfully!");
        contactForm.reset();
      } catch (error) {
        // Important: do NOT navigate immediately.
        // Instead, show a mailto link so it opens only if the user clicks.
        const mailto = buildMailtoLink({ name, email, message });
        setStatus(
          contactStatus,
          "error",
          "Could not send via EmailJS. Click to open an email draft.",
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
          linkEl.textContent = "Open email draft (mailto)";
          contactForm.appendChild(linkEl);
        }
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

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
      },
      { threshold: [0.15, 0.35, 0.6] },
    );

    ["projects", "about", "experience", "contact", "proficiency"]
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((s) => spy.observe(s));

    // Progress bars animation (Proficiency)
    const proficiency = document.getElementById("proficiency");
    if (proficiency) {
      const pbIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              proficiency.classList.add("is-proficiency-visible");
              // Activate fills once
              $$(".progress-row", proficiency).forEach((row) =>
                row.classList.add("is-activated"),
              );
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
      window.addEventListener(
        "mousemove",
        (e) => {
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
        },
        { passive: true },
      );
    }
  }
})();
