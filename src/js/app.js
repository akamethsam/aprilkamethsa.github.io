/* Coordinación del proyecto. El taller solo puede actualizar su propia vista previa. */
((A) => {
  "use strict";
  const root = document.getElementById("april-cuento");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const embedded =
    window.parent !== window &&
    new URLSearchParams(location.search).get("editor") === "1";
  let dispose = () => {},
    book = null,
    paused = reduce.matches;
  // Vuelve a montar la invitación solo al editar; primero retira efectos y escuchas anteriores.
  function render(
    raw,
    { intro = true, preserveScroll = false, forceIntro = false } = {},
  ) {
    const scroll = preserveScroll ? window.scrollY : 0;
    dispose();
    const c = A.normalizeConfig(raw);
    if (
      embedded ||
      location.protocol === "file:" ||
      window.APRIL_OFFLINE_PREVIEW
    )
      c.rsvp.mode = "demo";
    root.className = "akac-root";
    root.removeAttribute("style");
    root.style.setProperty("--akac-plum", c.theme.accent);
    root.style.setProperty("--akac-button-ink", A.inkOn(c.theme.accent));
    root.classList.toggle("akac-paused", paused);
    A.renderTemplate(root, c, paused);
    document.title = c.name + " · Un cuento real";
    const effects = A.createEffects(root, c);
    book = A.createBook(root, c, {
      motionEnabled: () => !paused,
      // La reproducción se solicita exactamente cuando comienza la apertura.
      onStart: () => window.APRIL_MUSIC?.playFromBook?.(),
      onReveal: () => effects.burst(),
      onFinish: () => effects.refresh(),
    });
    const motion = root.querySelector(".akac-motion-toggle");
    // Un único interruptor coordina libro, partículas, parallax y movimiento reducido.
    function setMotion(value) {
      paused = value;
      root.classList.toggle("akac-paused", paused);
      motion.setAttribute("aria-pressed", String(paused));
      motion.setAttribute(
        "aria-label",
        paused ? "Activar animaciones" : "Pausar animaciones",
      );
      motion.innerHTML = `${A.icon(paused ? "play" : "pause", 16)}<span>${paused ? "Animar" : "Pausar"}</span>`;
      book.setPaused(paused);
      effects.setPaused(paused);
    }
    const toggle = () => setMotion(!paused),
      preference = (event) => setMotion(event.matches),
      replay = () => book.start(true);
    motion.addEventListener("click", toggle);
    reduce.addEventListener("change", preference);
    const replayButton = root.querySelector(".akac-replay");
    replayButton.addEventListener("click", replay);
    // Mantiene el foco del teclado entre los controles del libro mientras está abierto.
    const modalKeys = (event) => {
      if (book.isActive() && event.key === "Escape") book.finish();
      if (book.isActive() && event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        root.querySelector(".akac-skip").focus();
      }
    };
    motion.addEventListener("keydown", modalKeys);
    const disposeRsvp = A.initRsvp(root, c, () => effects.burst());
    setMotion(paused);
    if (intro && (c.book.autoplay || forceIntro) && !paused) {
      // Con música, mostramos primero el libro cerrado: el toque del invitado
      // autoriza el sonido y arranca la animación en el mismo gesto.
      if (c.music?.enabled && c.music?.startWithBook !== false && !forceIntro)
        book.prepare();
      else book.start();
    } else {
      book.finish();
      if (preserveScroll) window.scrollTo({ top: scroll, behavior: "instant" });
    }
    dispose = () => {
      book.destroy();
      effects.destroy();
      disposeRsvp();
      motion.removeEventListener("click", toggle);
      motion.removeEventListener("keydown", modalKeys);
      reduce.removeEventListener("change", preference);
      replayButton.removeEventListener("click", replay);
    };
  }
  render(window.APRIL_CONFIG, { intro: !embedded });
  // El taller solo envía mensajes desde su propio marco y origen.
  if (embedded) {
    window.addEventListener("message", (event) => {
      if (event.source !== window.parent) return;
      if (location.protocol !== "file:" && event.origin !== location.origin)
        return;
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "APRIL_PREVIEW_CONFIG")
        render(message.config, {
          intro: !!message.playIntro,
          forceIntro: !!message.playIntro,
          preserveScroll: !message.playIntro,
        });
      if (message.type === "APRIL_REPLAY" && book) book.start(true);
    });
    window.parent.postMessage(
      { type: "APRIL_PREVIEW_READY" },
      location.protocol === "file:" ? "*" : location.origin,
    );
  }
  // En una página conservada por el navegador, evita destruir los controles al volver.
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) dispose();
  });
})(window.April);
