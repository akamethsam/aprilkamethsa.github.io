/**
 * APRIL · MÚSICA DE FONDO
 * --------------------------------------------------------------------------
 * La música se inicia desde la apertura del libro, no desde un autoplay suelto.
 * Esto es importante porque Chrome, Safari, iPhone y Android suelen bloquear
 * el audio con sonido cuando la página intenta reproducirlo sin interacción.
 *
 * Flujo normal:
 * 1) El libro aparece cerrado.
 * 2) El invitado toca "Toca para abrir nuestro cuento".
 * 3) Ese mismo gesto llama a playFromBook().
 * 4) Comienzan princesse.mp3 y la animación del libro.
 * --------------------------------------------------------------------------
 */
(() => {
  "use strict";

  const config = window.APRIL_CONFIG;
  const music = config && config.music;

  if (!music || !music.enabled || !music.src) {
    window.APRIL_MUSIC = {
      enabled: false,
      playFromBook: () => Promise.resolve(false),
      pause: () => {},
      isPlaying: () => false,
    };
    return;
  }

  const audio = new Audio(music.src);
  audio.preload = "auto";
  audio.loop = music.loop !== false;

  const configuredVolume = Number(music.volume);
  audio.volume = Number.isFinite(configuredVolume)
    ? Math.min(1, Math.max(0, configuredVolume))
    : 0.35;

  // Referencia pública para futuras funciones (por ejemplo, un botón Música/Silencio).
  window.APRIL_AUDIO = audio;

  let playPromise = null;

  /**
   * Reproduce la canción. Debe llamarse durante el gesto que abre el libro para
   * que los navegadores móviles reconozcan la reproducción como autorizada.
   */
  function playFromBook() {
    if (!audio.paused) return Promise.resolve(true);
    if (playPromise) return playPromise;

    playPromise = audio
      .play()
      .then(() => {
        console.info("APRIL MUSIC: música iniciada con la apertura del libro.");
        return true;
      })
      .catch((error) => {
        console.info(
          "APRIL MUSIC: el navegador no permitió iniciar el audio todavía.",
          error,
        );
        return false;
      })
      .finally(() => {
        playPromise = null;
      });

    return playPromise;
  }

  function pause() {
    audio.pause();
  }

  audio.addEventListener("error", () => {
    console.error(
      "APRIL MUSIC: no se pudo cargar el archivo:",
      music.src,
      audio.error,
    );
  });

  window.APRIL_MUSIC = {
    enabled: true,
    audio,
    playFromBook,
    pause,
    isPlaying: () => !audio.paused,
  };
})();
