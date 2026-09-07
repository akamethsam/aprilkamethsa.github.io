/**
 * CONFIRMACIÓN GITHUB PAGES: prueba local o POST HTTPS hacia FormSubmit.
 * No hay PHP ni credenciales. FormSubmit gestiona el correo y el CAPTCHA.
 * Para volver con el mensaje de WhatsApp se usa sessionStorage durante esta pestaña.
 * No se guarda el teléfono del invitado. La referencia temporal caduca a los 30 minutos.
 */
((A) => {
  "use strict";
  const attendanceLabels = {
    both: "bautizo y cumpleaños",
    baptism: "solo el bautizo",
    birthday: "solo el cumpleaños",
    no: "no podré asistir",
  };

  /** Sustitución de texto, sin eval ni innerHTML. Permite personalizar la frase de prueba. */
  A.confirmationMessage = (data, config) => {
    const values = {
      nombre: data.guest_name,
      evento: config.rsvp.eventLabel,
      asistencia: attendanceLabels[data.attendance],
    };
    const template =
      data.attendance === "no"
        ? config.rsvp.declineMessage
        : config.rsvp.message;
    return template.replace(
      /\{(nombre|evento|asistencia)\}/g,
      (_, key) => values[key],
    );
  };

  /** Validación de ayuda del navegador; no sustituye controles de servidor del proveedor. */
  A.validateRsvp = (data, maxGuests) => {
    if (
      !data.guest_name ||
      data.guest_name.length > 120 ||
      /[\u0000-\u001f\u007f]/.test(data.guest_name)
    )
      return "Escribe tu nombre o el de tu familia, sin saltos de línea.";
    if (!Object.hasOwn(attendanceLabels, data.attendance))
      return "Elige a qué momentos podrás asistir.";
    if (
      data.phone &&
      (!/^[+0-9 ()-]{6,25}$/.test(data.phone) ||
        data.phone.replace(/\D/g, "").length < 6 ||
        data.phone.replace(/\D/g, "").length > 15)
    )
      return "Revisa el número de contacto o deja ese campo vacío.";
    if (
      !Number.isInteger(data.adults) ||
      !Number.isInteger(data.children) ||
      data.adults < 0 ||
      data.children < 0
    )
      return "Indica cantidades enteras de adultos y niños.";
    if (
      data.attendance !== "no" &&
      (data.adults < 1 || data.adults + data.children > maxGuests)
    )
      return `Indica entre 1 y ${maxGuests} personas, con al menos un adulto.`;
    if (data.attendance === "no" && (data.adults !== 0 || data.children !== 0))
      return "Revisa la cantidad de personas.";
    if (!data.consent)
      return "Acepta el uso de los datos para organizar la celebración.";
    if (data.website) return "No se pudo validar el formulario.";
    return "";
  };

  /** Un nombre distinto por carpeta evita mezclar invitaciones del mismo usuario de GitHub. */
  A.rsvpStorageKey = () => "april-rsvp-v5:" + new URL("./", location.href).pathname;
  A.rsvpMaxAge = 30 * 60 * 1000;

  /** Borra únicamente nuestros datos; no afecta otros sitios o formularios. */
  A.clearPendingRsvp = () => {
    try { sessionStorage.removeItem(A.rsvpStorageKey()); } catch (_) { /* Almacenamiento bloqueado. */ }
  };

  /** Datos mínimos para WhatsApp: nunca contraseña, teléfono de contacto ni datos en la URL. */
  A.savePendingRsvp = (data) => {
    A.clearPendingRsvp();
    try {
      sessionStorage.setItem(A.rsvpStorageKey(), JSON.stringify({
        created: Date.now(),
        data: { guest_name: data.guest_name, attendance: data.attendance,
          adults: data.adults, children: data.children, phone: "", website: "", consent: true },
      }));
      return true;
    } catch (_) { return false; } // El correo puede funcionar aunque no se conserve el mensaje.
  };

  /** Se vuelve a validar lo guardado: sessionStorage también puede ser manipulado. */
  A.readPendingRsvp = (config) => {
    try {
      const pending = JSON.parse(sessionStorage.getItem(A.rsvpStorageKey()) || "null");
      if (!pending || !Number.isFinite(pending.created) || pending.created > Date.now() ||
          Date.now() - pending.created > A.rsvpMaxAge ||
          !pending.data || typeof pending.data.guest_name !== "string" ||
          A.validateRsvp(pending.data, config.maxGuests)) {
        A.clearPendingRsvp();
        return null;
      }
      return pending;
    } catch (_) { A.clearPendingRsvp(); return null; }
  };

  /** Solo construye datos. No hace red: así podemos probar el destino y contenido sin enviar correo. */
  A.prepareRsvpSubmission = (data, config) => {
    const error = A.validateRsvp(data, config.maxGuests);
    if (error) throw new Error(error);
    if (location.protocol !== "https:") throw new Error("Abre la invitación mediante HTTPS para confirmar.");
    const recipient = config.rsvp.formsubmitRecipient;
    if (!/^(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[a-f0-9]{32,64})$/.test(recipient || ""))
      throw new Error("El formulario aún no está disponible. Comunícate con la familia.");
    return {
      // Un correo o token público, nunca una URL arbitraria ni una clave API.
      action: "https://formsubmit.co/" + encodeURIComponent(recipient),
      fields: {
        _subject: "Respuesta de asistencia · " + config.name,
        _template: "table",
        _captcha: "true", // Se mantiene la protección recomendada por FormSubmit.
        _honey: data.website,
        // Respeta /repositorio/ tanto en github.io como en un dominio propio.
        _next: new URL("gracias.html", location.href).href,
        Nombre: data.guest_name,
        Contacto: data.phone || "No indicado",
        Asistencia: attendanceLabels[data.attendance],
        Adultos: String(data.adults),
        Niños: String(data.children),
        Evento: config.rsvp.eventLabel,
        Fecha: config.date,
        Bautizo: config.baptismTime,
        Cumpleaños: config.birthdayTime,
        Zona_horaria: "Perú (UTC-5)",
        Mensaje: A.confirmationMessage(data, config),
        Consentimiento: "Aceptado para organizar esta celebración mediante FormSubmit",
      },
    };
  };

  /** WhatsApp se abre exclusivamente al pulsar el enlace; no se simula un envío automático. */
  A.rsvpWhatsappURL = (data, config) => {
    if (!/^[1-9]\d{6,14}$/.test(config.rsvp.whatsappNumber || "")) return "";
    const counts = data.attendance === "no" ? "" : ` Adultos: ${data.adults}. Niños: ${data.children}.`;
    return "https://wa.me/" + config.rsvp.whatsappNumber + "?text=" +
      encodeURIComponent(A.confirmationMessage(data, config) + counts);
  };

  /** Envía un formulario nativo para que el proveedor muestre su CAPTCHA y gestione el retorno. */
  A.initRsvp = (root, config, onSuccess) => {
    const form = root.querySelector(".akac-form");
    if (!form) return () => {};
    const status = form.querySelector(".akac-form-status");
    const result = form.querySelector(".akac-confirmation");
    const button = form.querySelector(".akac-submit");
    const buttonHTML = button.innerHTML;
    const party = form.querySelector(".akac-party");
    const live = config.rsvp.mode === "live";
    let busy = false, outgoing = null;
    root.querySelector("[data-rsvp-note]").textContent = live
      ? "Tu respuesta se enviará al correo de la familia. Después podrás enviarla también por WhatsApp."
      : "VISTA DE MUESTRA · No se enviará ningún correo ni mensaje de WhatsApp.";
    if (!live) button.firstChild.textContent = "Probar mi confirmación ";

    function announce(text, error = false) {
      status.textContent = text;
      status.className = "akac-form-status " + (error ? "akac-error" : "akac-success");
      status.focus({ preventScroll: true });
    }
    function changeAttendance() {
      const no = form.elements.attendance.value === "no";
      party.hidden = no;
      form.elements.adults.disabled = no;
      form.elements.children.disabled = no;
    }
    // Si el visitante vuelve desde el CAPTCHA, libera el botón sin reenviar automáticamente.
    function restore() {
      busy = false;
      button.disabled = false;
      button.innerHTML = buttonHTML;
      if (!live) button.firstChild.textContent = "Probar mi confirmación ";
      form.removeAttribute("aria-busy");
      outgoing?.remove();
      outgoing = null;
    }
    function submit(event) {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      const no = form.elements.attendance.value === "no";
      const data = {
        guest_name: form.elements.guest_name.value.trim(),
        phone: form.elements.phone.value.trim(),
        attendance: form.elements.attendance.value,
        adults: no ? 0 : Number(form.elements.adults.value),
        children: no ? 0 : Number(form.elements.children.value),
        consent: form.elements.consent.checked,
        website: form.elements.website.value,
      };
      const error = A.validateRsvp(data, config.maxGuests);
      if (error) { announce(error, true); return; }
      result.hidden = true;
      if (!live) {
        result.querySelector(".akac-confirmation-message").textContent = A.confirmationMessage(data, config);
        result.querySelector(".akac-whatsapp").hidden = true;
        result.querySelector(".akac-whatsapp-note").hidden = true;
        result.hidden = false;
        announce("Mensaje de prueba preparado. No se ha enviado ningún correo ni guardado tu respuesta.");
        onSuccess?.();
        return;
      }
      try {
        const submission = A.prepareRsvpSubmission(data, config);
        const saved = A.savePendingRsvp(data);
        busy = true;
        button.disabled = true;
        button.textContent = "Abriendo la verificación…";
        form.setAttribute("aria-busy", "true");
        announce(saved
          ? "Completa la verificación para enviar tu respuesta; después volverás a la invitación."
          : "Se abrirá la verificación. Tu navegador no permite conservar el mensaje para WhatsApp.");
        // Los valores se asignan como texto, nunca se interpolan como HTML.
        outgoing = document.createElement("form");
        outgoing.method = "POST";
        outgoing.action = submission.action;
        outgoing.acceptCharset = "UTF-8";
        outgoing.hidden = true;
        for (const [name, value] of Object.entries(submission.fields)) {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = name; input.value = value;
          outgoing.append(input);
        }
        document.body.append(outgoing);
        // Evita que un campo llamado «submit» pueda sustituir al método del formulario.
        HTMLFormElement.prototype.submit.call(outgoing);
      } catch (_) {
        A.clearPendingRsvp();
        restore();
        announce("No pudimos abrir el envío. Comprueba que estés en la web HTTPS o comunícate con la familia.", true);
      }
    }
    changeAttendance();
    A.readPendingRsvp(config); // Retira referencias caducadas al volver a la invitación.
    form.elements.attendance.addEventListener("change", changeAttendance);
    form.addEventListener("submit", submit);
    window.addEventListener("pageshow", restore);
    return () => {
      outgoing?.remove();
      form.elements.attendance.removeEventListener("change", changeAttendance);
      form.removeEventListener("submit", submit);
      window.removeEventListener("pageshow", restore);
    };
  };
})(window.April);
