/* Destellos, profundidad del castillo, aparición al desplazar y cuenta regresiva. */
((A) => {
  "use strict";
  A.countdown = (target, now) => {
    const seconds = Math.max(0, Math.floor((target - now) / 1000));
    return {
      days: Math.floor(seconds / 86400),
      hours: Math.floor(seconds / 3600) % 24,
      minutes: Math.floor(seconds / 60) % 60,
      seconds: seconds % 60,
    };
  };
  A.createEffects = (root, c) => {
    const $ = (s) => root.querySelector(s),
      hero = $(".akac-castle"),
      canvas = $(".akac-sparkles");
    let ctx = null;
    try {
      ctx = canvas.getContext("2d");
    } catch (_) {}
    let paused = false,
      removed = false,
      visible = true,
      particleRaf = 0,
      sceneRaf = 0,
      lastParticle = 0,
      burstUntil = 0;
    let width = 1,
      height = 1,
      particles = [],
      pointerX = 0,
      pointerY = 0;
    const removers = [];
    const listen = (el, event, fn, options) => {
      el.addEventListener(event, fn, options);
      removers.push(() => el.removeEventListener(event, fn, options));
    };
    // Ajusta el lienzo y limita partículas/resolución para mantener fluidez en celulares.
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: width < 650 ? 34 : 64 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.6,
        speed: Math.random() * 0.34 + 0.16,
        phase: Math.random() * 6.3,
      }));
    }
    // Dibuja destellos decorativos a unos 30 FPS. Math.random se usa solo para decoración.
    function particleTick(now) {
      particleRaf = 0;
      if (
        !ctx ||
        paused ||
        removed ||
        document.hidden ||
        !visible ||
        !c.animation.particles
      )
        return;
      if (now - lastParticle > 32) {
        lastParticle = now;
        ctx.clearRect(0, 0, width, height);
        const intro = root.classList.contains("akac-opening");
        particles.forEach((p) => {
          p.y -= p.speed * (now < burstUntil ? 6 : 1);
          p.x += Math.sin(now * 0.0005 + p.phase) * 0.24;
          if (p.y < -7) p.y = height + 7;
          const opacity =
            (intro ? 0.45 : 0.29) + Math.sin(now * 0.0015 + p.phase) * 0.2;
          ctx.fillStyle = `rgba(225,191,119,${opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          if (p.size > 1.7) {
            ctx.strokeStyle = `rgba(242,210,155,${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x - 4, p.y);
            ctx.lineTo(p.x + 4, p.y);
            ctx.moveTo(p.x, p.y - 4);
            ctx.lineTo(p.x, p.y + 4);
            ctx.stroke();
          }
        });
      }
      particleRaf = requestAnimationFrame(particleTick);
    }
    // Desplaza suavemente el fondo principal; no afecta al contenido ni a los formularios.
    function sceneTick() {
      sceneRaf = 0;
      if (paused || removed || document.hidden || !c.animation.parallax) return;
      const rect = $(".akac-hero").getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height)
        hero.style.transform = `translate3d(${pointerX}px,${A.clamp(-rect.top * 0.12, -65, 65) + pointerY}px,0) scale(1.06)`;
    }
    const scheduleScene = () => {
      if (!sceneRaf && !paused && c.animation.parallax)
        sceneRaf = requestAnimationFrame(sceneTick);
    };
    // Reanuda un solo bucle de efectos.
    function resume() {
      if (!particleRaf) particleRaf = requestAnimationFrame(particleTick);
      scheduleScene();
    }
    // Limpia el lienzo al pausar y conserva el resto de la página utilizable.
    function setPaused(value) {
      paused = value;
      cancelAnimationFrame(particleRaf);
      cancelAnimationFrame(sceneRaf);
      particleRaf = 0;
      sceneRaf = 0;
      if (paused) {
        if (ctx) ctx.clearRect(0, 0, width, height);
        hero.style.transform = "none";
      } else resume();
    }
    listen(
      root,
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" || paused) return;
        pointerX = (event.clientX / width - 0.5) * -10;
        pointerY = (event.clientY / height - 0.5) * -7;
        scheduleScene();
      },
      { passive: true },
    );
    listen(
      window,
      "resize",
      () => {
        resize();
        scheduleScene();
      },
      { passive: true },
    );
    listen(window, "scroll", scheduleScene, { passive: true });
    listen(document, "visibilitychange", () => {
      cancelAnimationFrame(particleRaf);
      particleRaf = 0;
      if (!document.hidden && !paused) {
        resume();
        updateClock();
      }
    });
    let revealObserver, visibilityObserver;
    // Las secciones aparecen una sola vez. Sin esta API, el contenido sigue siendo visible.
    if ("IntersectionObserver" in window) {
      if (c.animation.reveals) {
        revealObserver = new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("akac-visible");
                revealObserver.unobserve(entry.target);
              }
            }),
          { threshold: 0.1 },
        );
        root.querySelectorAll(".akac-reveal").forEach((el) => {
          el.classList.add("akac-will-reveal");
          revealObserver.observe(el);
        });
      }
      visibilityObserver = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (!visible) {
          cancelAnimationFrame(particleRaf);
          particleRaf = 0;
          if (ctx) ctx.clearRect(0, 0, width, height);
        } else if (!paused) resume();
      });
      visibilityObserver.observe(root);
    }
    const target = new Date(
      `${c.date}T${c.baptismTime}:00${c.timezoneOffset}`,
    ).getTime();
    const end = new Date(`${c.date}T23:59:59${c.timezoneOffset}`).getTime();
    // Calcula la cuenta regresiva con la zona horaria del evento.
    function updateClock() {
      const now = Date.now(),
        units = A.countdown(target, now);
      Object.entries(units).forEach(([unit, value]) => {
        const el = $(`[data-unit="${unit}"]`),
          text = String(value).padStart(2, "0");
        if (el && el.textContent !== text) el.textContent = text;
      });
      const caption = $(".akac-countdown-caption");
      const message =
        now < target
          ? "La cuenta regresiva para comenzar nuestro día"
          : now <= end
            ? "¡Hoy escribimos este capítulo juntos!"
            : "Gracias por ser parte de nuestro cuento";
      if (caption.textContent !== message) caption.textContent = message;
    }
    root.querySelectorAll('.akac-invitation a[href^="#"]').forEach((link) =>
      listen(link, "click", (event) => {
        const element = document.getElementById(
          link.getAttribute("href").slice(1),
        );
        if (element) {
          event.preventDefault();
          element.scrollIntoView({
            behavior: paused ? "instant" : "smooth",
            block: "start",
          });
          element.setAttribute("tabindex", "-1");
          element.focus({ preventScroll: true });
        }
      }),
    );
    resize();
    updateClock();
    resume();
    const clock = setInterval(() => {
      if (!document.hidden) updateClock();
    }, 1000);
    return {
      setPaused,
      refresh: scheduleScene,
      burst() {
        if (!paused) burstUntil = performance.now() + 1400;
      },
      destroy() {
        removed = true;
        clearInterval(clock);
        cancelAnimationFrame(particleRaf);
        cancelAnimationFrame(sceneRaf);
        removers.forEach((fn) => fn());
        if (revealObserver) revealObserver.disconnect();
        if (visibilityObserver) visibilityObserver.disconnect();
      },
    };
  };
})(window.April);
