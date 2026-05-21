// Stoken — site interactions

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Nav scrolled state ------------------------------------------
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu --------------------------------------------------
  const burger = document.querySelector(".nav__burger");
  if (burger) {
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      const isOpen = nav.classList.contains("open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }
  document.querySelectorAll(".mobile-menu a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  // --- Hero video: single perfect loop, deterministic per-page start --
  document.querySelectorAll("[data-hero-video]").forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.classList.add("is-active");
    video.setAttribute("aria-hidden", "false");
    const parent = video.parentElement;
    if (parent) parent.classList.add("video-ready");

    if (reduceMotion) {
      video.pause();
      return;
    }

    const startSeconds = Number.parseFloat(video.dataset.heroStart || "0");
    const playbackRate = Number.parseFloat(video.dataset.heroRate || "0.5");
    const applyStart = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const offset = Number.isFinite(startSeconds) ? startSeconds : 0;
      try { video.currentTime = offset % video.duration; } catch (_) {}
    };
    if (video.readyState >= 1) applyStart();
    else video.addEventListener("loadedmetadata", applyStart, { once: true });

    if (Number.isFinite(playbackRate) && playbackRate > 0) {
      try { video.playbackRate = playbackRate; } catch (_) {}
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  });

  // --- Capital flow tabs -------------------------------------------
  document.querySelectorAll("[data-section='capital-flow']").forEach(section => {
    const steps = [...section.querySelectorAll("[data-flow-step]")];
    const panels = [...section.querySelectorAll("[data-flow-panel]")];
    const activate = key => {
      steps.forEach(step => {
        const active = step.dataset.flowStep === key;
        step.classList.toggle("is-active", active);
        step.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(panel => {
        const active = panel.dataset.flowPanel === key;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };
    steps.forEach(step => {
      step.addEventListener("click", () => activate(step.dataset.flowStep));
    });
  });

  // --- Reveal + counter trigger on scroll --------------------------
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          // Trigger counters inside this element
          e.target.querySelectorAll(".stat__num[data-target]").forEach(animateCounter);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  // --- Counter animation -------------------------------------------
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = parseInt(el.dataset.duration || "1400", 10);
    const start = performance.now();
    const from = 0;
    function step(t) {
      const p = Math.min((t - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + (target - from) * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- Year ---------------------------------------------------------
  document.querySelectorAll(".js-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  document.documentElement.dataset.stokenReady = "true";
});
