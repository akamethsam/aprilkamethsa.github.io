/* Libro 3D: portada, lomo, cantos, hojas y una única línea de tiempo ajustable. */
((A) => {
  "use strict";

  A.bookMarkup = (c, prefix) => {
    const e = A.escape,
      parts = c.name.split(/\s+/),
      first = e(parts.shift());
    return `<div class="akac-intro" hidden role="dialog" aria-modal="true" aria-labelledby="${prefix("book-title")}">
      <div class="akac-intro-halo" aria-hidden="true"></div>
      <div class="akac-portal" aria-hidden="true"></div>
      <div class="akac-intro-heading"><span>${e(c.book.eyebrow)}</span><p>Hay historias que comienzan con amor</p></div>
      <div class="akac-book-stage">
        <div class="akac-book-floor" aria-hidden="true"></div>
        <div class="akac-book">
          <div class="akac-book-back"></div>
          <div class="akac-book-edge akac-edge-right"></div>
          <div class="akac-book-edge akac-edge-top"></div>
          <div class="akac-book-paper"><span>${A.icon("crown", 40)}</span><p>Érase una vez…</p><strong>${first}</strong><small>y su primer año de magia</small><i>Un día para recordar siempre</i></div>
          ${[5, 4, 3, 2, 1].map((n) => `<div class="akac-leaf" data-leaf="${n}"><div class="akac-leaf-line"></div></div>`).join("")}
          <div class="akac-book-cover">
            <div class="akac-cover-front">
              <img src="${e(c.book.cover)}" alt="Portada crema con un marco ovalado y relieves dorados" class="akac-cover-art" decoding="async" fetchpriority="high">
              ${c.book.image ? `<img src="${e(c.book.image)}" alt="${e(c.book.imageAlt)}" class="akac-cover-photo" style="object-position:${e(c.book.imagePosition)}" decoding="async" fetchpriority="high">` : ""}
              <div class="akac-cover-title" id="${prefix("book-title")}"><p>${e(c.book.title)}</p><strong>${e(c.name)}</strong><span>${e(c.book.subtitle)}</span></div>
              <div class="akac-cover-light" aria-hidden="true"></div>
            </div>
            <div class="akac-cover-inside"><span>${A.icon("heart", 30)}</span><p>Los cuentos más bonitos<br>se viven en familia</p><small>Con todo nuestro amor</small></div>
          </div>
          <div class="akac-book-spine"><img src="${e(c.book.spine)}" alt="" aria-hidden="true" decoding="async"></div>
        </div>
      </div>
      <div class="akac-loading"><div class="akac-progress-track" aria-hidden="true"><span></span></div><p role="status" aria-live="polite">Un cuento escrito con amor…</p><span class="akac-book-step" aria-hidden="true">01 · EL COMIENZO</span></div>
      <button class="akac-skip" type="button">Entrar a la invitación ${A.icon("arrow", 16)}</button>
    </div>`;
  };

  /** Valores puros de la secuencia; p es el avance normalizado entre 0 y 1. */
  A.bookFrame = (value) => {
    const p = A.clamp(value, 0, 1);
    const opening = A.ease(A.clamp((p - 0.32) / 0.45, 0, 1));
    const exit = A.ease(A.clamp((p - 0.89) / 0.11, 0, 1));
    return {
      progress: p,
      phase:
        p < 0.32
          ? "cover"
          : p < 0.77
            ? "opening"
            : p < 0.89
              ? "reading"
              : "reveal",
      yaw: -24 + 18 * A.ease(A.clamp(p / 0.77, 0, 1)),
      coverAngle: -159 * opening,
      leaves: [1, 2, 3, 4, 5].map(
        (n) =>
          -(157 - n * 1.9) *
          A.ease(A.clamp((p - 0.35 - n * 0.028) / 0.33, 0, 1)),
      ),
      shift: 24 * opening,
      scale: 1 - 0.07 * opening + exit * 1.85,
      exit,
    };
  };

  A.createBook = (root, c, options) => {
    const $ = (s) => root.querySelector(s);
    const intro = $(".akac-intro"),
      invitation = $(".akac-invitation"),
      volume = $(".akac-book");
    const cover = $(".akac-book-cover"),
      leaves = Array.from(root.querySelectorAll("[data-leaf]"));
    const progress = $(".akac-progress-track>span"),
      status = $(".akac-loading>p"),
      step = $(".akac-book-step");
    const skip = $(".akac-skip");
    let active = false,
      paused = false,
      raf = 0,
      elapsed = 0,
      last = 0,
      epoch = 0,
      phase = "",
      previousFocus = null,
      removed = false;
    let assetTimer = 0;
    const duration = c.book.duration * 1000;

    // Aplica el mismo avance al volumen, portada y cinco hojas; no crea líneas de tiempo separadas.
    function draw(p) {
      const frame = A.bookFrame(p);
      const compact = window.innerWidth < 700 || window.innerHeight < 480;
      const spread = -frame.coverAngle / 159;
      const fittedScale =
        frame.scale * (compact ? 1 - 0.24 * spread * (1 - frame.exit) : 1);
      volume.style.transform = `translateX(${frame.shift}%) rotateY(${frame.yaw}deg) rotateX(${5 - 5 * frame.progress}deg) rotateZ(${-2 + 2 * frame.progress}deg) scale(${fittedScale})`;
      cover.style.transform = `translateZ(25px) rotateY(${frame.coverAngle}deg)`;
      leaves.forEach((el) => {
        const n = +el.dataset.leaf;
        el.style.transform = `translateZ(${22 - n * 2}px) rotateY(${frame.leaves[n - 1]}deg)`;
      });
      progress.style.transform = `scaleX(${frame.progress})`;
      intro.style.setProperty("--book-exit", frame.exit.toFixed(4));
      if (frame.phase !== phase) {
        phase = frame.phase;
        const text = {
          cover: ["Un cuento escrito con amor…", "01 · EL COMIENZO"],
          opening: [
            "Cada página guarda una sorpresa…",
            "02 · LA MAGIA DESPIERTA",
          ],
          reading: ["Nuestro capítulo más bonito…", "03 · APRIL KAMETHSA"],
          reveal: ["Bienvenido a nuestro cuento", "04 · UN DÍA PARA CELEBRAR"],
        }[phase];
        status.textContent = text[0];
        step.textContent =
          phase === "reading" ? "03 · " + c.name.toUpperCase() : text[1];
        if (phase === "reveal") {
          root.classList.add("akac-revealing");
          if (options.onReveal) options.onReveal();
        }
      }
    }

    // Cierra el libro y devuelve el acceso y el foco a la invitación.
    function finish() {
      epoch++;
      active = false;
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(assetTimer);
      intro.hidden = true;
      intro.style.removeProperty("--book-exit");
      root.classList.remove("akac-opening", "akac-revealing");
      root.classList.add("akac-entered");
      root.style.removeProperty("--akac-intro-height");
      invitation.inert = false;
      if (intro.contains(document.activeElement)) {
        const focus =
          previousFocus && previousFocus.isConnected
            ? previousFocus
            : $(".akac-nav-rsvp");
        if (focus) focus.focus({ preventScroll: true });
      }
      if (options.onFinish) options.onFinish();
    }

    // Avanza según el tiempo real; se detiene cuando la pestaña está oculta.
    function tick(now) {
      raf = 0;
      if (!active || paused || removed || document.hidden) return;
      if (last) elapsed += Math.min(now - last, 160);
      last = now;
      draw(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) finish();
      else raf = requestAnimationFrame(tick);
    }

    // Programa un solo fotograma; evita bucles duplicados al reanudar.
    function schedule() {
      last = 0;
      if (active && !paused && !document.hidden && !raf)
        raf = requestAnimationFrame(tick);
    }

    // Reinicia la secuencia. El contador epoch invalida aperturas antiguas pendientes.
    async function start(manual = false) {
      epoch++;
      const generation = epoch;
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(assetTimer);
      if (removed) return;
      if (!options.motionEnabled()) {
        finish();
        return;
      }
      previousFocus = manual ? document.activeElement : null;
      active = true;
      paused = false;
      elapsed = 0;
      last = 0;
      phase = "";
      intro.hidden = false;
      root.classList.remove("akac-entered", "akac-revealing");
      root.classList.add("akac-opening");
      root.style.setProperty("--akac-intro-height", `${window.innerHeight}px`);
      invitation.inert = true;
      root.scrollIntoView({ behavior: "instant", block: "start" });
      draw(0);
      if (manual) skip.focus({ preventScroll: true });
      // Espera imágenes y fuentes como máximo 2,5 s; luego comienza la duración configurada.
      const images = Array.from(
        root.querySelectorAll(
          ".akac-cover-art,.akac-cover-photo,.akac-book-spine img,.akac-castle",
        ),
      );
      const ready = Promise.all(
        images.map((img) =>
          img.decode ? img.decode().catch(() => {}) : Promise.resolve(),
        ),
      );
      const fonts = document.fonts
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();
      await Promise.race([
        Promise.all([ready, fonts]),
        new Promise((resolve) => {
          assetTimer = setTimeout(resolve, 2500);
        }),
      ]);
      clearTimeout(assetTimer);
      if (!active || removed || generation !== epoch) return;
      schedule();
    }

    // Pausa la animación sin perder la posición de las páginas.
    function setPaused(value) {
      paused = value;
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (active && paused) status.textContent = "El cuento está en pausa";
      if (!paused) {
        phase = "";
        schedule();
      }
    }
    const onSkip = () => finish();
    const onKey = (event) => {
      if (event.key === "Escape") finish();
      if (event.key === "Tab") {
        const focusable = [
          skip,
          root.querySelector(".akac-motion-toggle"),
        ].filter(Boolean);
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      }
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (!document.hidden) schedule();
    };
    const onResize = () => {
      if (active)
        root.style.setProperty(
          "--akac-intro-height",
          `${window.innerHeight}px`,
        );
    };
    skip.addEventListener("click", onSkip);
    intro.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });
    return {
      start,
      finish,
      setPaused,
      isActive: () => active,
      destroy() {
        removed = true;
        epoch++;
        active = false;
        clearTimeout(assetTimer);
        cancelAnimationFrame(raf);
        skip.removeEventListener("click", onSkip);
        intro.removeEventListener("keydown", onKey);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
      },
    };
  };
})(window.April);
