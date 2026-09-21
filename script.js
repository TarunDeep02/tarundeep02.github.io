
/* V8 ultra-smooth cursor controller */
(() => {
  const cursor = document.getElementById("smooth-cursor");
  if (!cursor || !window.matchMedia("(pointer:fine)").matches) return;

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let x = targetX;
  let y = targetY;
  let frameRequested = false;
  let hovering = false;

  function render() {
    frameRequested = false;

    x += (targetX - x) * 0.38;
    y += (targetY - y) * 0.38;

    cursor.style.transform =
      "translate3d(" + x + "px," + y + "px,0)";

    if (Math.abs(targetX - x) > 0.1 ||
        Math.abs(targetY - y) > 0.1) {
      frameRequested = true;
      requestAnimationFrame(render);
    }
  }

  function requestRender() {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(render);
    }
  }

  function pointerMove(event) {
    targetX = event.clientX;
    targetY = event.clientY;
    requestRender();
  }

  function setHover(value) {
    if (hovering === value) return;
    hovering = value;
    cursor.classList.toggle("is-hovering", value);
  }

  window.addEventListener("pointermove", pointerMove, {
    passive: true
  });

  document.addEventListener("pointerover", function(event) {
    const target = event.target;
    const interactive = target && target.closest
      ? target.closest(
          "a,button,input,textarea,select,[role='button'],.project-card,.experience-card,.skill-card"
        )
      : null;

    if (interactive) setHover(true);
  }, {passive:true});

  document.addEventListener("pointerout", function(event) {
    const target = event.target;
    const interactive = target && target.closest
      ? target.closest(
          "a,button,input,textarea,select,[role='button'],.project-card,.experience-card,.skill-card"
        )
      : null;

    if (interactive &&
        (!event.relatedTarget ||
         !interactive.contains(event.relatedTarget))) {
      setHover(false);
    }
  }, {passive:true});

  window.addEventListener("pointerdown", function() {
    setHover(true);
  }, {passive:true});

  window.addEventListener("pointerup", function() {
    setHover(false);
  }, {passive:true});

  window.addEventListener("blur", function() {
    cursor.style.display = "none";
  }, {passive:true});

  window.addEventListener("focus", function() {
    cursor.style.display = "";
  }, {passive:true});

  requestRender();
})();


/* V7 cinematic loading + editorial intro */
(() => {
  const opening = document.getElementById("cinematic-opening");
  const progress = document.getElementById("loader-progress");
  const percent = document.getElementById("loader-percent");
  const transition = document.querySelector(".cinematic-transition");

  if (!opening || !progress || !percent) return;

  let value = 0;
  const start = performance.now();
  const duration = 3200;

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    // Smooth game-like loading curve, deliberately reaches 100%.
    const eased = 1 - Math.pow(1 - t, 2.2);
    value = Math.floor(eased * 100);
    progress.style.width = value + "%";
    percent.textContent = value + "%";

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      percent.textContent = "100%";
      setTimeout(() => {
        opening.classList.add("show-hello");
      }, 350);

      // Hold the Hello frame long enough to read, then transition.
      setTimeout(() => {
        transition.classList.add("play");
      }, 2450);

      setTimeout(() => {
        opening.classList.add("is-exiting");
        document.body.classList.add("portfolio-entered");
      }, 3150);

      setTimeout(() => {
        opening.remove();
      }, 4400);
    }
  }

  requestAnimationFrame(tick);

  // User can skip the opening with a click/tap.
  opening.addEventListener("click", () => {
    if (!opening.classList.contains("show-hello")) {
      value = 100;
      progress.style.width = "100%";
      percent.textContent = "100%";
      opening.classList.add("show-hello");
    } else {
      transition.classList.add("play");
      opening.classList.add("is-exiting");
      setTimeout(() => opening.remove(), 1200);
    }
  }, {passive:true});
})();

(() => {
  "use strict";

  const card = document.getElementById("photoCard");
  const stage = document.getElementById("photoStage");
  const glow = document.querySelector(".mouse-glow");
  const loader = document.getElementById("filmLoader");
  const progressBar = document.getElementById("scrollProgress");
  const sceneNumber = document.getElementById("sceneNumber");
  const nav = document.querySelector(".nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let targetRotation = 0;
  let currentRotation = 0;
  let targetTiltX = 0;
  let currentTiltX = 0;
  let targetTiltZ = 0;
  let currentTiltZ = 0;

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  // Game-style 0–100% cinematic boot sequence.
  const loaderPercent = document.getElementById("loaderPercent");
  const loaderFill = document.getElementById("loaderFill");
  const loaderGlow = document.getElementById("loaderGlow");
  const loaderStatus = document.getElementById("loaderStatus");
  const loaderStats = [...document.querySelectorAll(".loader-stats span")];

  const bootMessages = [
    [0,  "POWERING VISUAL ENGINE"],
    [12, "LOADING DATA MODULES"],
    [27, "CONNECTING ANALYTICS CORE"],
    [43, "INITIALIZING SQL LAYER"],
    [58, "MOUNTING POWER BI SYSTEM"],
    [71, "LOADING RISK INTELLIGENCE"],
    [83, "ENABLING AML / FRAUD ANALYTICS"],
    [94, "CALIBRATING PORTFOLIO"],
    [100,"SYSTEM READY"]
  ];

  function bootMessage(value){
    let message = bootMessages[0][1];
    for (const [threshold, text] of bootMessages) {
      if (value >= threshold) message = text;
    }
    return message;
  }

  function runBootSequence(){
    if (!loader) return;

    const start = performance.now();
    const duration = 3600;

    function tick(now){
      const raw = clamp((now - start) / duration, 0, 1);
      // Smooth game-like acceleration/deceleration.
      const eased = raw < .5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      const value = Math.round(eased * 100);

      if (loaderPercent) loaderPercent.textContent = `${value}%`;
      if (loaderFill) loaderFill.style.width = `${value}%`;
      if (loaderGlow) loaderGlow.style.left = `${value}%`;
      if (loaderStatus) loaderStatus.textContent = bootMessage(value);

      loaderStats.forEach((item, index) => {
        item.classList.toggle("active", value >= (index + 1) * 15);
      });

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        if (loaderPercent) loaderPercent.textContent = "100%";
        if (loaderStatus) loaderStatus.textContent = "SYSTEM READY · ENTERING EXPERIENCE";
        setTimeout(() => loader?.classList.add("done"), 650);
      }
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runBootSequence, {once:true});
  } else {
    runBootSequence();
  }

  // Scroll-driven 360° portrait card.
  function updateScroll() {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const pageProgress = clamp(window.scrollY / maxScroll, 0, 1);

    if (progressBar) {
      progressBar.style.height = `${pageProgress * 100}%`;
    }

    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);

    // Rotate the portrait during the opening cinematic sequence.
    if (!reduceMotion.matches) {
      const openingTravel = Math.max(window.innerHeight * 3.0, 1900);
      const rotationProgress = clamp(window.scrollY / openingTravel, 0, 1);
      targetRotation = rotationProgress * 360;
    }

    // Scene counter.
    const scenes = [...document.querySelectorAll(".cinematic-scene")];
    let active = scenes[0];
    let best = Infinity;

    scenes.forEach(scene => {
      const r = scene.getBoundingClientRect();
      const distance = Math.abs(r.top + r.height * .42 - window.innerHeight * .45);
      if (distance < best) {
        best = distance;
        active = scene;
      }
    });

    if (sceneNumber && active) {
      const n = active.dataset.scene || "01";
      sceneNumber.textContent = `${n} / 07`;
    }
  }

  function render() {
    currentRotation += (targetRotation - currentRotation) * 0.055;
    currentTiltX += (targetTiltX - currentTiltX) * 0.07;
    currentTiltZ += (targetTiltZ - currentTiltZ) * 0.07;

    if (card) {
      card.style.transform =
        `rotateY(${currentRotation}deg) rotateX(${currentTiltX}deg) rotateZ(${currentTiltZ}deg)`;
    }

    requestAnimationFrame(render);
  }

  window.addEventListener("scroll", updateScroll, { passive:true });
  window.addEventListener("resize", updateScroll);

  // Mouse depth interaction.
  stage?.addEventListener("pointermove", event => {
    const r = stage.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - .5;
    const y = (event.clientY - r.top) / r.height - .5;

    targetTiltX = clamp(-y * 5, -3, 3);
    targetTiltZ = clamp(x * 3, -2, 2);
  });

  stage?.addEventListener("pointerleave", () => {
    targetTiltX = 0;
    targetTiltZ = 0;
  });

  // Global cinematic pointer layer: one rAF update per rendered frame.
  // Uses transform instead of left/top to avoid layout work.
  if (window.matchMedia("(pointer:fine)").matches) {
    let pointerRAF = 0;
    let pointerX = window.innerWidth * 0.5;
    let pointerY = window.innerHeight * 0.5;

    const renderPointer = () => {
      pointerRAF = 0;
      if (glow) {
        glow.style.transform =
          `translate3d(${pointerX}px,${pointerY}px,0) translate(-50%,-50%)`;
      }
      const cursor = document.querySelector(".cinematic-cursor");
      if (cursor) {
        cursor.style.transform =
          `translate3d(${pointerX}px,${pointerY}px,0) translate(-50%,-50%)`;
      }
    };

    document.addEventListener("pointermove", event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerRAF) pointerRAF = requestAnimationFrame(renderPointer);
    }, {passive:true});
  }
// Cinematic cursor.
  if (window.matchMedia("(pointer:fine)").matches) {
    const cursor = document.createElement("div");
    cursor.className = "cinematic-cursor";
    document.body.appendChild(cursor);
document.querySelectorAll("a,button,.project,.tool,.floating-chip").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
    });
  }

  // Intersection-based cinematic entrances.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:.14 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Magnetic buttons.
  document.querySelectorAll(".button,.nav-resume").forEach(button => {
    button.addEventListener("pointermove", event => {
      const r = button.getBoundingClientRect();
      const x = (event.clientX - r.left - r.width / 2) * .045;
      const y = (event.clientY - r.top - r.height / 2) * .045;
      button.style.transform = `translate(${x}px,${y}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  updateScroll();
  render();
})();
