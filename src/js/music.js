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

  /**
 * ----------------------------------------------------------
 * BOTÓN REPRODUCIR / PAUSAR
 * ----------------------------------------------------------
 */

function connectMusicButton() {
  const button = document.getElementById("akac-music-toggle");

  // Si todavía no existe el botón, esperamos un poco.
  if (!button) {
    setTimeout(connectMusicButton, 300);
    return;
  }

  /**
   * Actualiza el aspecto del botón según
   * la música esté sonando o esté pausada.
   */
  function updateButton() {
    const icon = button.querySelector(".akac-music-icon");

    if (!icon) return;

    if (audio.paused) {
      // Música detenida.
      icon.textContent = "♪";

      button.setAttribute(
        "aria-label",
        "Reproducir música"
      );

      button.classList.add("is-paused");
      button.classList.remove("is-playing");

    } else {
      // Música reproduciéndose.
      icon.textContent = "❚❚";

      button.setAttribute(
        "aria-label",
        "Pausar música"
      );

      button.classList.add("is-playing");
      button.classList.remove("is-paused");
    }
  }

  /**
   * Cuando el visitante toca el botón.
   */
  button.addEventListener("click", async (event) => {

    // Evita que este clic afecte otras animaciones.
    event.preventDefault();
    event.stopPropagation();

    if (audio.paused) {

      // REPRODUCIR
      try {
        await audio.play();
      } catch (error) {
        console.warn(
          "APRIL MUSIC: No fue posible reproducir la música.",
          error
        );
      }

    } else {

      // PAUSAR
      audio.pause();
    }

    updateButton();
  });

  /**
   * Sincronización automática.
   */
  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);

  updateButton();
}

/**
 * Intentamos conectar el botón.
 */
connectMusicButton();

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
