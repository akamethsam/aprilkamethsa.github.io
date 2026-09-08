/**
 * APRIL · MÚSICA DE FONDO
 * ------------------------------------------------------------
 * Este archivo controla exclusivamente la música de la invitación.
 *
 * IMPORTANTE:
 * Los navegadores modernos bloquean la reproducción automática
 * con sonido hasta que el visitante interactúa con la página.
 *
 * Por ello:
 * 1. Intentamos reproducir la música al cargar.
 * 2. Si el navegador la bloquea, esperamos el primer clic,
 *    toque de pantalla o pulsación de teclado.
 * 3. Después de esa interacción, la música comienza.
 * ------------------------------------------------------------
 */

(() => {
  "use strict";

  // Obtenemos la configuración principal de la invitación.
  const config = window.APRIL_CONFIG;

  // Si no existe configuración de música, no hacemos nada.
  if (!config || !config.music) {
    console.warn("APRIL MUSIC: No existe configuración de música.");
    return;
  }

  // Si la música está desactivada, detenemos la inicialización.
  if (!config.music.enabled) {
    console.info("APRIL MUSIC: Música desactivada.");
    return;
  }

  // Si no existe una ruta de audio, tampoco continuamos.
  if (!config.music.src) {
    console.warn("APRIL MUSIC: No se indicó ningún archivo de audio.");
    return;
  }

  /**
   * Creamos el reproductor.
   */
  const audio = new Audio();

  // Archivo MP3.
  audio.src = config.music.src;

  // Precargamos parte del archivo.
  audio.preload = "auto";

  // Repetición de la música.
  audio.loop = config.music.loop !== false;

  // Volumen.
  // Si no está definido, utilizamos 0.35.
  const configuredVolume = Number(config.music.volume);

  audio.volume = Number.isFinite(configuredVolume)
    ? Math.min(1, Math.max(0, configuredVolume))
    : 0.35;

  /**
   * Guardamos una referencia global.
   *
   * Esto permite utilizar el reproductor posteriormente
   * desde otros archivos si queremos crear un botón
   * de Música / Silencio.
   */
  window.APRIL_AUDIO = audio;

  /**
   * Evita ejecutar varios intentos simultáneamente.
   */
  let started = false;

  /**
   * Intenta reproducir la canción.
   */
  async function playMusic() {
    // Si ya está reproduciéndose, no hacemos nada.
    if (!audio.paused) {
      started = true;
      removeInteractionListeners();
      return;
    }

    try {
      await audio.play();

      started = true;

      console.info("APRIL MUSIC: Música iniciada.");

      // Una vez conseguida la reproducción,
      // ya no necesitamos escuchar el primer clic.
      removeInteractionListeners();
    } catch (error) {
      /**
       * Esto NO necesariamente significa que haya un error.
       *
       * Chrome/Safari suelen devolver NotAllowedError
       * cuando el usuario todavía no ha interactuado.
       */
      console.info(
        "APRIL MUSIC: El navegador espera una interacción del usuario.",
        error
      );
    }
  }

  /**
   * Cuando exista la primera interacción,
   * iniciamos la música.
   */
  function firstInteraction() {
    if (started) return;

    playMusic();
  }

  /**
   * Quitamos los listeners después de iniciar correctamente.
   */
  function removeInteractionListeners() {
    document.removeEventListener("pointerdown", firstInteraction);
    document.removeEventListener("touchstart", firstInteraction);
    document.removeEventListener("click", firstInteraction);
    document.removeEventListener("keydown", firstInteraction);
  }

  /**
   * Escuchamos distintas formas de interacción.
   *
   * pointerdown funciona para mouse y muchos dispositivos táctiles.
   */
  document.addEventListener("pointerdown", firstInteraction, {
    passive: true,
  });

  document.addEventListener("touchstart", firstInteraction, {
    passive: true,
  });

  document.addEventListener("click", firstInteraction);

  document.addEventListener("keydown", firstInteraction);

  /**
   * También intentamos reproducir inmediatamente.
   *
   * En algunos casos el navegador lo permitirá,
   * pero normalmente la primera visita necesitará interacción.
   */
  playMusic();

  /**
   * Información útil si el archivo no existe
   * o GitHub Pages devuelve un error.
   */
  audio.addEventListener("error", () => {
    console.error(
      "APRIL MUSIC: No se pudo cargar el archivo:",
      config.music.src,
      audio.error
    );
  });
})();
