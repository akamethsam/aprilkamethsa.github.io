/** Retorno de FormSubmit. No es un recibo SMTP: GitHub Pages no puede verificar la bandeja de Gmail. */
((A) => {
  "use strict";
  const config = A.normalizeConfig(window.APRIL_CONFIG);
  const pending = A.readPendingRsvp(config);
  const status = document.getElementById("return-status");
  const message = document.getElementById("return-message");
  const link = document.getElementById("return-whatsapp");
  const note = document.getElementById("return-note");
  const clear = document.getElementById("return-clear");
  function forget() {
    A.clearPendingRsvp();
    message.textContent = "";
    message.hidden = true;
    link.hidden = true;
    link.removeAttribute("href");
    note.hidden = true;
    clear.hidden = true;
    status.textContent = "Ya no hay datos de tu respuesta guardados en esta pestaña.";
  }
  // Abrir esta página directamente nunca se interpreta como una confirmación recibida.
  if (!pending) return;
  status.textContent = "Si completaste la verificación de envío, el servicio procesará tu respuesta para la familia. Desde esta página no podemos comprobar la entrega del correo.";
  message.textContent = A.confirmationMessage(pending.data, config);
  message.hidden = false;
  const url = config.rsvp.mode === "live" ? A.rsvpWhatsappURL(pending.data, config) : "";
  if (url) { link.href = url; link.hidden = false; note.hidden = false; }
  clear.hidden = false;
  clear.addEventListener("click", forget);
  // También desaparece de la pantalla si el visitante deja esta página abierta.
  setTimeout(forget, Math.max(0, pending.created + A.rsvpMaxAge - Date.now()));
})(window.April);
