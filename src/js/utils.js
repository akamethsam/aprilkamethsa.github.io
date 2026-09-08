/* Utilidades compartidas. Scripts clásicos para abrir también desde file://. */
((A) => {
  "use strict";
  // Escapa caracteres antes de interpolar textos en las plantillas HTML.
  A.escape = (value) =>
    String(value == null ? "" : value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  // Copia solo datos serializables de configuración, sin funciones.
  A.clone = (value) => JSON.parse(JSON.stringify(value));
  // Mantiene un valor entre un mínimo y un máximo.
  A.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  // Curva suave compartida por la apertura del libro.
  A.ease = (value) =>
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  // Permite únicamente enlaces web; rechaza javascript: y otros protocolos ejecutables.
  A.linkURL = (value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  };
  // Admite imágenes locales y datos incorporados por el generador de referencia.
  A.imageURL = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (
      /^data:image\/(?:png|jpeg|webp|avif);base64,[A-Za-z0-9+/=]+$/.test(text)
    )
      return text;
    if (
      /^assets\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpg|jpeg|avif)$/i.test(
        text,
      ) &&
      !text.includes("..")
    )
      return text;
    // Solo archivos propios: evita rastreadores y cambios remotos inesperados.
    return "";
  };
  // Rechaza fechas inexistentes, por ejemplo el 30 de febrero.
  A.validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const date = new Date(value + "T12:00:00Z");
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  };
  // Presenta horas de 24 horas como a. m. / p. m.
  A.timeText = (time) => {
    const match = /^(\d{2}):(\d{2})$/.exec(time || "");
    if (!match) return "";
    const hour = +match[1];
    return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? "a. m." : "p. m."}`;
  };
  // Elige texto blanco o negro según el contraste del color de botón.
  A.inkOn = (color) => {
    const rgb = color
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) =>
        v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
      );
    const lum = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const whiteContrast = 1.05 / (lum + 0.05),
      blackContrast = (lum + 0.05) / 0.05;
    return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
  };
  // Iconos funcionales propios. Las ilustraciones del libro están en assets/images/.
  A.icon = (name, size = 22) => {
    const paths = {
      star: '<path d="m12 2 2.8 6.1 6.7.8-4.9 4.6 1.3 6.5-5.9-3.3-5.9 3.3 1.3-6.5L2.5 8.9l6.7-.8Z"/>',
      arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
      down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
      heart:
        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      crown: '<path d="m3 6 4.5 4L12 3l4.5 7L21 6l-2 12H5L3 6Zm2 15h14"/>',
      cross: '<path d="M12 3v18M6 8h12"/>',
      scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="m8.7 8.3 10.6 6.4M8.7 15.7 19.3 9.3"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      replay: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
      pause: '<path d="M8 5v14M16 5v14"/>',
      play: '<path d="m8 4 12 8-12 8Z"/>',
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
  };
})((window.April = window.April || {}));
