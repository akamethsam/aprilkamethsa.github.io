/**
 * APRIL · ARCHIVO PRINCIPAL PARA PERSONALIZAR LA INVITACIÓN
 * Guarda en UTF-8. Conserva las comillas, comas y llaves.
 * Puedes editarlo desde GitHub y guardar con Commit changes.
 * Es PÚBLICO: nunca escribas contraseñas de Gmail ni claves privadas.
 * Guía: local/manuales/PUBLICAR_Y_CONFIGURAR.md.
 */
window.APRIL_CONFIG = {
  schemaVersion: 3,

  // 01 · PROTAGONISTA Y FECHA. El año 2026 aún está pendiente de confirmar.
  name: "April Kamethsa",
  date: "2026-11-22", // año-mes-día
  dateProvisional: true, // Aviso en el taller, invisible para los invitados.
  timezoneOffset: "-05:00", // Hora de Perú.
  baptismTime: "11:30", // 11:30 a. m. (formato de 24 horas).
  birthdayTime: "13:30", // 1:30 p. m.

  // 02 · LUGARES. Los mapas son enlaces opcionales HTTP/HTTPS.
  baptismVenue: "Lugar por confirmar",
  baptismAddress: "",
  baptismMap: "",
  birthdayVenue: "Salon de eventos 'Alameda Real' ",
  birthdayAddress: "",
  birthdayMap: "https://maps.app.goo.gl/AH9j7coXYSEvN8wG6",

  // 03 · TEXTOS. Escribe texto normal, sin etiquetas HTML.
  intro:
    "Hace un año comenzó nuestro cuento más bonito; hoy queremos escribir un nuevo capítulo contigo.",
  message:
    "En este cuento hay un castillo, muchos sueños y una sola protagonista; pero la magia estará completa cuando tú estés aquí.",

  // 04 · IMÁGENES. Copia tus archivos a docs/assets/images/.
  // WEBP, JPG, PNG o AVIF. Nombres sin espacios, por ejemplo april-portada.jpg.
  castle: "assets/images/castillo.webp", // Fondo de la bienvenida.
  photo: "", // Retrato en el mensaje familiar; vacío = corona.
  backgrounds: {
    chapter: "", // Fondo de fecha y horarios; vacío = sin imagen.
    story: "assets/images/castillo.webp", // Fondo suave del mensaje familiar.
    rsvp: "", // Fondo de la confirmación.
    opacity: 0.12, // Entre 0 y 0.30 para mantener legibilidad.
  },

  // 05 · LIBRO. Se conserva la secuencia original, con portada crema y relieves.
  book: {
    eyebrow: "UN CUENTO REAL",
    title: "El gran cumpleaños de",
    subtitle: "Mi bautizo y primer añito",
    cover: "assets/images/libro-portada-crema.webp", // Portada completa con marco.
    spine: "assets/images/libro-lomo-crema.webp", // Textura del lomo.
    image: "assets/images/april.jpg", // SOLO EL CENTRO: "assets/images/april.jpg".
    imageAlt: "April, la protagonista de este cuento",
    imagePosition: "50% 50%", // Encuadre horizontal/vertical, ej. "50% 30%".
    duration: 11, // Segundos entre 6 y 20.
    autoplay: true, // Respeta la preferencia de movimiento reducido.
  },

  // 06 · ANIMACIONES Y COLOR. El visitante puede pausar los movimientos.
  animation: { particles: true, parallax: true, reveals: true },
  theme: { accent: "#743751" },

  // 07 · CONFIRMACIÓN POR FORMSUBMIT. El límite es una ayuda visual, no un control de servidor.
  rsvpEnabled: true,
  maxGuests: 12,
  rsvp: {
    // "demo": prueba sin red. "live": formulario HTTPS hacia FormSubmit.
    // Antes de compartir: activa el formulario desde tu Gmail y prueba un envío.
    mode: "live",
    // Correo DESTINATARIO. No requiere contraseña.
    // Tras activar puedes reemplazarlo por el identificador público que ofrece FormSubmit.
    // No es la API key del archivo de envíos: jamás publiques esa clave.
    formsubmitRecipient: "akamethsam@gmail.com",
    // WhatsApp DE LA FAMILIA: código de país y número, solo dígitos. Vacío = oculto.
    // El número del invitado se recoge por separado en el formulario.
    whatsappNumber: "51953119385", // ← COLOCA AQUÍ TU NÚMERO: código de país + número, SIN + ni espacios.
    // Ejemplo de formato para Perú: "51912345678". No se usa hasta que lo escribas.
    eventLabel:
      "el bautizo y primer cumpleaños de April Kamethsa, el 22 de noviembre",
    // Marcadores disponibles: {nombre}, {evento} y {asistencia}. Sin HTML.
    message:
      "Hola, soy {nombre}. Confirmo mi asistencia para {evento}. Asistiré a: {asistencia}.",
    declineMessage:
      "Hola, soy {nombre}. Esta vez no podré asistir a {evento}. Gracias por invitarme.",
  },

  // 08 · MÚSICA DE FONDO
music: {
  enabled: true,
  src: "assets/audio/musica-april.mp3",
  volume: 0.35,
  loop: true
},
};
