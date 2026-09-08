/** Normaliza los ajustes del archivo o del taller; no acepta HTML ni código remoto. */
((A) => {
  "use strict";
  const defaults = A.clone(window.APRIL_CONFIG);
  A.defaults = A.clone(defaults);

  // Un encuadre solo admite dos porcentajes, nunca instrucciones CSS arbitrarias.
  A.imagePosition = (value) => {
    const match = /^(\d{1,3})% (\d{1,3})%$/.exec(String(value || ""));
    return match && +match[1] <= 100 && +match[2] <= 100 ? value : "50% 50%";
  };

  /** Lista explícita de ajustes permitidos. Los credenciales privadas no entran aquí. */
  A.normalizeConfig = (raw) => {
    raw = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const c = A.clone(defaults);
    const textFields = {
      name: 70,
      baptismVenue: 150,
      baptismAddress: 230,
      birthdayVenue: 150,
      birthdayAddress: 230,
      intro: 500,
      message: 700,
    };
    Object.entries(textFields).forEach(([key, max]) => {
      if (typeof raw[key] === "string") c[key] = raw[key].trim().slice(0, max);
    });
    if (!c.name) c.name = "April Kamethsa";
    c.date = A.validDate(raw.date)
      ? raw.date
      : A.validDate(c.date)
        ? c.date
        : "2026-11-22";
    ["baptismTime", "birthdayTime"].forEach((key) => {
      c[key] = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raw[key] || "")
        ? raw[key]
        : key === "baptismTime"
          ? "11:30"
          : "13:30";
    });
    ["baptismMap", "birthdayMap"].forEach((key) => {
      c[key] = A.linkURL(raw[key] ?? c[key]);
    });
    ["castle", "photo"].forEach((key) => {
      c[key] =
        A.imageURL(raw[key] ?? c[key]) ||
        (key === "castle" ? "assets/images/castillo.webp" : "");
    });
    ["dateProvisional", "rsvpEnabled"].forEach((key) => {
      if (typeof raw[key] === "boolean") c[key] = raw[key];
    });
    c.maxGuests = A.clamp(
      Math.round(Number(raw.maxGuests ?? c.maxGuests)) || 12,
      1,
      30,
    );

    // Portada, retrato central y lomo son capas independientes.
    const book = raw.book && typeof raw.book === "object" ? raw.book : {};
    ["eyebrow", "title", "subtitle", "imageAlt"].forEach((key) => {
      c.book[key] = String(book[key] ?? c.book[key] ?? "")
        .trim()
        .slice(0, 100);
    });
    ["cover", "spine", "image"].forEach((key) => {
      c.book[key] =
        A.imageURL(book[key] ?? c.book[key]) ||
        (key === "image"
          ? ""
          : `assets/images/libro-${key === "cover" ? "portada" : "lomo"}-crema.webp`);
    });
    c.book.imagePosition = A.imagePosition(
      book.imagePosition ?? c.book.imagePosition,
    );
    c.book.duration = A.clamp(
      Number(book.duration ?? c.book.duration) || 11,
      6,
      20,
    );
    if (typeof book.autoplay === "boolean") c.book.autoplay = book.autoplay;

    // Una imagen por sección. El fondo nunca se utiliza como contenido de lectura.
    const backgrounds = raw.backgrounds || {};
    ["chapter", "story", "rsvp"].forEach((key) => {
      c.backgrounds[key] = A.imageURL(backgrounds[key] ?? c.backgrounds[key]);
    });
    c.backgrounds.opacity = A.clamp(
      Number(backgrounds.opacity ?? c.backgrounds.opacity) || 0,
      0,
      0.3,
    );
    ["particles", "parallax", "reveals"].forEach((key) => {
      if (raw.animation && typeof raw.animation[key] === "boolean")
        c.animation[key] = raw.animation[key];
    });
    c.theme.accent = /^#[0-9a-fA-F]{6}$/.test(
      raw.theme?.accent ?? c.theme.accent,
    )
      ? (raw.theme?.accent ?? c.theme.accent)
      : "#743751";

    // Música local. Solo admite rutas seguras del propio proyecto.
    const music = raw.music && typeof raw.music === "object" ? raw.music : {};
    if (typeof music.enabled === "boolean") c.music.enabled = music.enabled;
    if (typeof music.loop === "boolean") c.music.loop = music.loop;
    if (typeof music.startWithBook === "boolean")
      c.music.startWithBook = music.startWithBook;
    const audioSrc = String(music.src ?? c.music.src ?? "").trim();
    c.music.src = /^(?:assets\/audio\/)[A-Za-z0-9._-]+\.(?:mp3|m4a|ogg|wav)$/i.test(
      audioSrc,
    )
      ? audioSrc
      : "assets/audio/princesse.mp3";
    const musicVolume = Number(music.volume ?? c.music.volume);
    c.music.volume = Number.isFinite(musicVolume)
      ? A.clamp(musicVolume, 0, 1)
      : 0.35;

    // Solo se admite un correo o identificador público; el dominio FormSubmit es fijo.
    const rsvp = raw.rsvp || {};
    c.rsvp.mode = (rsvp.mode ?? c.rsvp.mode) === "live" ? "live" : "demo";
    const recipient = String(rsvp.formsubmitRecipient ?? c.rsvp.formsubmitRecipient ?? "").trim();
    c.rsvp.formsubmitRecipient = /^(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[a-f0-9]{32,64})$/.test(recipient) ? recipient : "";
    const number = String(rsvp.whatsappNumber ?? c.rsvp.whatsappNumber);
    c.rsvp.whatsappNumber = /^[1-9]\d{6,14}$/.test(number) ? number : "";
    ["eventLabel", "message", "declineMessage"].forEach((key) => {
      c.rsvp[key] = String(rsvp[key] ?? c.rsvp[key])
        .trim()
        .slice(0, 500);
    });
    c.timezoneOffset = "-05:00";
    c.schemaVersion = 3;
    return c;
  };

  /** El taller descarga datos públicos; jamás guarda contraseñas. */
  A.exportConfig = (config) =>
    "/** APRIL · Configuración exportada.\n * Reemplaza docs/config/invitation.js.\n * Guía de cada campo: local/manuales/PERSONALIZAR.md. No escribir contraseñas aquí.\n */\nwindow.APRIL_CONFIG = " +
    JSON.stringify(A.normalizeConfig(config), null, 2) +
    ";\n";
})(window.April);
