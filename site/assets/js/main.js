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

  // --- Hero video playlist -----------------------------------------
  const heroPlaylist = document.querySelector("[data-hero-video-playlist]");
  const heroVideos = heroPlaylist ? [...heroPlaylist.querySelectorAll("[data-hero-video]")] : [];
  if (heroPlaylist && heroVideos.length) {
    if (reduceMotion) {
      heroVideos.forEach(video => {
        video.pause();
        video.classList.remove("is-active", "is-leaving");
        video.setAttribute("aria-hidden", "true");
      });
    } else {
      const configuredTransitionMs = Number.parseInt(heroPlaylist.dataset.transitionMs || "1800", 10);
      const configuredLead = Number.parseFloat(heroPlaylist.dataset.transitionLead || "1.8");
      const transitionMs = Number.isFinite(configuredTransitionMs) ? configuredTransitionMs : 1800;
      const transitionLead = Number.isFinite(configuredLead) ? configuredLead : transitionMs / 1000;
      let activeIndex = 0;
      let transitioning = false;
      let hasStarted = false;

      const prepareVideo = video => {
        video.muted = true;
        video.playsInline = true;
        video.loop = false;
        if (video.preload !== "auto") {
          video.preload = "auto";
        }
      };

      const warmNext = index => {
        const next = heroVideos[(index + 1) % heroVideos.length];
        if (next) prepareVideo(next);
      };

      const activateVideo = async index => {
        if (transitioning) return;
        const previous = heroVideos[activeIndex];
        const next = heroVideos[index];
        if (!next) return;

        transitioning = true;
        let cleanupAfterFade = false;
        prepareVideo(next);

        try {
          next.currentTime = 0;
          await next.play();
          heroPlaylist.classList.add("video-ready");

          if (!hasStarted || previous === next) {
            heroVideos.forEach((video, videoIndex) => {
              const isCurrent = videoIndex === index;
              video.classList.toggle("is-active", isCurrent);
              video.classList.remove("is-leaving");
              video.setAttribute("aria-hidden", isCurrent ? "false" : "true");
              if (!isCurrent) video.pause();
            });
            activeIndex = index;
            hasStarted = true;
            warmNext(activeIndex);
            return;
          }

          next.classList.add("is-active");
          next.classList.remove("is-leaving");
          next.setAttribute("aria-hidden", "false");
          previous.classList.add("is-leaving");
          previous.setAttribute("aria-hidden", "true");
          cleanupAfterFade = true;

          window.setTimeout(() => {
            previous.pause();
            previous.classList.remove("is-active", "is-leaving");
            activeIndex = index;
            transitioning = false;
            warmNext(activeIndex);
          }, transitionMs);
        } catch {
          if (!hasStarted) heroPlaylist.classList.remove("video-ready");
        } finally {
          if (!cleanupAfterFade) transitioning = false;
        }
      };

      heroVideos.forEach((video, index) => {
        prepareVideo(video);
        video.classList.remove("is-leaving");
        video.addEventListener("timeupdate", () => {
          if (index !== activeIndex || transitioning || !Number.isFinite(video.duration)) return;
          if (video.duration - video.currentTime <= transitionLead) {
            activateVideo((activeIndex + 1) % heroVideos.length);
          }
        });
        video.addEventListener("ended", () => {
          if (index === activeIndex && !transitioning) {
            activateVideo((activeIndex + 1) % heroVideos.length);
          }
        });
      });

      activateVideo(0);
    }
  }

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

  // --- Mouse parallax on hero grid ---------------------------------
  const heroGrid = document.querySelector(".hero__grid");
  if (!reduceMotion && heroGrid && window.matchMedia("(min-width: 900px)").matches) {
    window.addEventListener("mousemove", e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      heroGrid.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  // --- Sphere parallax ---------------------------------------------
  const sphere = document.querySelector(".sphere");
  if (!reduceMotion && sphere && window.matchMedia("(min-width: 900px)").matches) {
    const nodes = sphere.querySelectorAll(".sphere__node");
    const core = sphere.querySelector(".sphere__core");
    sphere.addEventListener("mousemove", e => {
      const rect = sphere.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      nodes.forEach((n, i) => {
        const factor = 8 + (i * 2);
        n.style.transform = `translate(calc(-50% + ${cx * factor}px), calc(-50% + ${cy * factor}px))`;
      });
      if (core) core.style.transform = `translate(${cx * 6}px, ${cy * 6}px)`;
    });
    sphere.addEventListener("mouseleave", () => {
      nodes.forEach(n => n.style.transform = "");
      if (core) core.style.transform = "";
    });
  }

  // --- Year ---------------------------------------------------------
  document.querySelectorAll(".js-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  document.documentElement.dataset.stokenReady = "true";
});
