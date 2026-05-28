(function () {
  document.documentElement.classList.add("rings-js");

  const STAGGER_S = 0.07;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getViewportCenter() {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  function startFloating(ring) {
    ring.classList.remove("ring-entering");
    ring.classList.add("ring-is-floating");
  }

  function resetRings(rings) {
    rings.forEach((ring) => {
      ring.classList.remove("ring-entering", "ring-is-floating");
      ring.style.removeProperty("--ring-enter-x");
      ring.style.removeProperty("--ring-enter-y");
      ring.style.removeProperty("--ring-enter-delay");
    });
  }

  function initRingEnterAnimation() {
    const container = document.querySelector(".all-rings");
    if (!container) return;

    const rings = [...container.querySelectorAll(".ring")];
    if (!rings.length) return;

    resetRings(rings);

    if (prefersReducedMotion()) {
      rings.forEach(startFloating);
      return;
    }

    const center = getViewportCenter();

    rings.forEach((ring, index) => {
      const rect = ring.getBoundingClientRect();
      const ringCenterX = rect.left + rect.width / 2;
      const ringCenterY = rect.top + rect.height / 2;

      ring.style.setProperty("--ring-enter-x", `${center.x - ringCenterX}px`);
      ring.style.setProperty("--ring-enter-y", `${center.y - ringCenterY}px`);
      ring.style.setProperty("--ring-enter-delay", `${index * STAGGER_S}s`);
      ring.classList.add("ring-entering");

      ring.addEventListener(
        "animationend",
        (event) => {
          if (event.animationName !== "ring-enter") return;
          startFloating(ring);
        },
        { once: true }
      );
    });
  }

  function scheduleRingEnter() {
    requestAnimationFrame(() => {
      requestAnimationFrame(initRingEnterAnimation);
    });
  }

  window.addEventListener("load", scheduleRingEnter);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) scheduleRingEnter();
  });

  function initMouseParallax() {
    if (prefersReducedMotion()) return;

    const rings = [...document.querySelectorAll(".all-rings .ring")];
    const bokehOrbs = [...document.querySelectorAll(".bokeh-layer .bokeh")];
    const cards = [
      ...document.querySelectorAll(
        ".central-block-light-card, .central-block-dark-card, .central-block"
      ),
    ];

    const items = [
      ...bokehOrbs.map((el, index) => ({
        el,
        depth: 0.1 + (index % 6) * 0.03,
      })),
      ...rings.map((el, index) => ({
        el,
        depth: 0.35 + (index % 6) * 0.11,
      })),
      ...cards.map((el, index) => ({
        el,
        depth: 0.2 + index * 0.07,
      })),
    ];

    if (!items.length) return;

    const MAX_SHIFT_PX = 14;
    const EASE = 0.075;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function setParallax(x, y) {
      items.forEach(({ el, depth }) => {
        el.style.setProperty("--parallax-x", `${x * depth}px`);
        el.style.setProperty("--parallax-y", `${y * depth}px`);
      });
    }

    function onMouseMove(event) {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      targetX = nx * 2 * MAX_SHIFT_PX;
      targetY = ny * 2 * MAX_SHIFT_PX;
    }

    function resetTarget() {
      targetX = 0;
      targetY = 0;
    }

    function tick() {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      setParallax(currentX, currentY);
      requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetTarget);
    window.addEventListener("blur", resetTarget);
    tick();
  }

  initMouseParallax();
})();
