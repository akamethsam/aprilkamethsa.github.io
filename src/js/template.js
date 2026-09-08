/* Maquetación de la invitación. Textos generales aquí; datos del evento en config/invitation.js. */
((A) => {
  "use strict";
  A.renderTemplate = (root, c, paused) => {
    const esc = A.escape,
      icon = A.icon,
      timeText = A.timeText,
      safeURL = A.linkURL;
    const prefix = (key) => `${root.id}-${key}`;
    const name = esc(c.name),
      parts = c.name.trim().split(/\s+/),
      first = esc(parts.shift()),
      rest = esc(parts.join(" "));
    const date = new Date(c.date + "T12:00:00Z");
    const month = date.toLocaleDateString("es-PE", {
        month: "long",
        timeZone: "UTC",
      }),
      day = date.getUTCDate(),
      year = date.getUTCFullYear();
    const weekday = date.toLocaleDateString("es-PE", {
      weekday: "long",
      timeZone: "UTC",
    });
    // Los fondos son imágenes decorativas locales; nunca contienen los textos.
    const background = (key) =>
      c.backgrounds[key]
        ? `<img class="akac-section-bg" src="${esc(c.backgrounds[key])}" alt="" aria-hidden="true" loading="lazy" decoding="async" style="opacity:${c.backgrounds.opacity}">`
        : "";
    const heroAsset = c.castle,
      photo = A.imageURL(c.photo);
    const venue = (title, address, map) =>
      `<p class="akac-place">${esc(title || "Lugar por confirmar")}</p>${address ? `<p class="akac-address">${esc(address)}</p>` : ""}${safeURL(map) ? `<a class="akac-map" href="${esc(safeURL(map))}" target="_blank" rel="noopener noreferrer">${icon("pin", 18)} Cómo llegar ${icon("arrow", 16)}</a>` : ""}`;
    root.innerHTML = `<canvas class="akac-sparkles" aria-hidden="true"></canvas>${A.bookMarkup(c, prefix)}
      <div class="akac-invitation">
        <header class="akac-nav"><a href="#${prefix("home")}" class="akac-monogram" aria-label="Volver al inicio de la invitación">${icon("crown", 21)}<span>${name}<em>MI PRIMER AÑITO</em></span></a><a class="akac-nav-rsvp" href="#${prefix("rsvp")}">Confirmar asistencia ${icon("arrow", 17)}</a></header>
        <section class="akac-hero" id="${prefix("home")}" aria-labelledby="${prefix("name")}">
          <div class="akac-landscape"><img class="akac-castle" src="${esc(heroAsset)}" alt="Castillo de cuento rosa y marfil entre nubes y jardines, sin personajes" fetchpriority="high" decoding="async"></div>
          <div class="akac-hero-wash" aria-hidden="true"></div>
          <div class="akac-hero-copy">
            <p class="akac-eyebrow akac-reveal">ÉRASE UNA VEZ…</p>
            <h1 id="${prefix("name")}" class="akac-name akac-reveal">${first}<span>${rest}</span></h1>
            <div class="akac-subline akac-reveal"><span></span>MI BAUTIZO &amp; PRIMER AÑITO<span></span></div>
            <p class="akac-hero-message akac-reveal">${esc(c.intro || "Hace un año comenzó nuestro cuento más bonito; hoy queremos escribir un nuevo capítulo contigo.")}</p>
            <a class="akac-button akac-reveal" href="#${prefix("day")}">Acompáñame en este cuento ${icon("down", 18)}</a>
            <p class="akac-hero-date akac-reveal">${day} DE ${esc(month.toUpperCase())} <span>·</span> ${year}</p>
          </div>
          <div class="akac-year-stamp" aria-label="Mi primer año"><span>MI PRIMER</span><strong>1</strong><span>AÑITO</span></div>
          <a class="akac-scroll" href="#${prefix("day")}"><span>EL CUENTO CONTINÚA</span>${icon("down", 17)}</a>
        </section>
        <section class="akac-chapter akac-reveal" id="${prefix("day")}" aria-labelledby="${prefix("day-title")}">
          ${background("chapter")}
          <div class="akac-chapter-top">${icon("star", 20)}<span>UN DÍA, TRES MOMENTOS INOLVIDABLES</span>${icon("star", 20)}</div>
          <h2 id="${prefix("day-title")}">La magia tiene una fecha</h2>
          <p class="akac-chapter-copy">Primero, una bendición para mi vida; después, un momento especial para recordar; y finalmente, la alegría de celebrar mi primer año.</p>
          <div class="akac-date-display"><span>${esc(weekday)}</span><strong>${day}</strong><span>${esc(month)}<small>${year}</small></span></div>
          <div class="akac-countdown" aria-label="Tiempo que falta para el bautizo"><div><strong data-unit="days">—</strong><span>DÍAS</span></div><i>:</i><div><strong data-unit="hours">—</strong><span>HORAS</span></div><i>:</i><div><strong data-unit="minutes">—</strong><span>MINUTOS</span></div><i>:</i><div><strong data-unit="seconds">—</strong><span>SEGUNDOS</span></div></div>
          <p class="akac-countdown-caption">La cuenta regresiva para comenzar nuestro día</p>
          <div class="akac-events">
            <article class="akac-event akac-reveal"><div class="akac-event-number">CAPÍTULO I</div><span class="akac-event-icon">${icon("cross", 30)}</span><h3>Mi bautizo</h3><p class="akac-event-line">Una bendición que me acompañará siempre</p><p class="akac-time">${esc(timeText(c.baptismTime || "11:30"))}</p>${venue(c.baptismVenue, c.baptismAddress, c.baptismMap)}</article>
            <div class="akac-events-divider" aria-hidden="true">${icon("star", 22)}</div>
            <!-- El corte de pelo es parte del día, pero no tiene un horario independiente. -->
            <article class="akac-event akac-event--haircut akac-reveal"><div class="akac-event-number">CAPÍTULO II</div><span class="akac-event-icon">${icon("scissors", 32)}</span><h3>Corte de pelo</h3><p class="akac-event-line">Un pequeño gran momento para recordar toda la vida</p><p class="akac-haircut-note">UN RECUERDO PARA SIEMPRE</p></article>
            <div class="akac-events-divider" aria-hidden="true">${icon("star", 22)}</div>
            <article class="akac-event akac-reveal"><div class="akac-event-number">CAPÍTULO III</div><span class="akac-event-icon">${icon("crown", 32)}</span><h3>Mi primer añito</h3><p class="akac-event-line">Un castillo lleno de risas y mucho amor</p><p class="akac-time">${esc(timeText(c.birthdayTime || "13:30"))}</p>${venue(c.birthdayVenue, c.birthdayAddress, c.birthdayMap)}</article>
          </div>
        </section>
        <section class="akac-story akac-reveal" aria-label="Una invitación especial">${background("story")}<div class="akac-story-rule" aria-hidden="true"></div>${photo ? `<img class="akac-portrait" src="${esc(photo)}" alt="${name}" loading="lazy" decoding="async">` : icon("crown", 36)}<p>${esc(c.message || "En este cuento hay un castillo, muchos sueños y una sola protagonista; pero la magia estará completa cuando tú estés aquí.")}</p><span>CON CARIÑO, MI FAMILIA</span><div class="akac-story-rule" aria-hidden="true"></div></section>
        <section class="akac-rsvp akac-reveal" id="${prefix("rsvp")}" aria-labelledby="${prefix("rsvp-title")}">
          ${background("rsvp")}
          <div class="akac-rsvp-heading"><p class="akac-eyebrow">TU LUGAR EN ESTE CUENTO</p><h2 id="${prefix("rsvp-title")}">¿Nos acompañas?</h2><p>Nos hará mucha ilusión compartir este día contigo; cuéntanos si podrás venir.</p><div class="akac-rsvp-signature">${first}<span>${rest}</span>${icon("heart", 26)}</div></div>
          <div class="akac-form-wrap">${
            c.rsvpEnabled === false
              ? '<p class="akac-closed">La confirmación de asistencia aún no está disponible; vuelve a visitarnos pronto.</p>'
              : `
            <p class="akac-demo-note" data-rsvp-note>VISTA DE MUESTRA · Este formulario no envía datos.</p>
            <form class="akac-form" method="post" action="#akac-rsvp">
              <div class="akac-field"><label for="${prefix("guest")}">Tu nombre o familia <span>*</span></label><input id="${prefix("guest")}" name="guest_name" type="text" autocomplete="name" maxlength="120" required placeholder="Ej. Familia Mendoza"></div>
              <div class="akac-field"><label for="${prefix("phone")}">WhatsApp <small>(opcional)</small></label><input id="${prefix("phone")}" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="25" placeholder="Número de contacto"></div>
              <div class="akac-field"><label for="${prefix("attendance")}">¿En qué momentos nos acompañarás? <span>*</span></label><select id="${prefix("attendance")}" name="attendance" required><option value="">Elige una opción</option><option value="both">Bautizo y cumpleaños</option><option value="baptism">Solo en el bautizo</option><option value="birthday">Solo en el cumpleaños</option><option value="no">Esta vez no podré asistir</option></select></div>
              <div class="akac-party"><div class="akac-field"><label for="${prefix("adults")}">Adultos <small>(incluyéndote)</small></label><input id="${prefix("adults")}" name="adults" type="number" min="1" max="${c.maxGuests}" value="1" required inputmode="numeric"></div><div class="akac-field"><label for="${prefix("children")}">Niños</label><input id="${prefix("children")}" name="children" type="number" min="0" max="${c.maxGuests}" value="0" required inputmode="numeric"></div></div>
              <div class="akac-honey" aria-hidden="true"><label>Dejar vacío<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
              <label class="akac-consent"><input name="consent" type="checkbox" required value="1"><span>Acepto que estos datos se envíen a la familia mediante FormSubmit para organizar la celebración.</span></label>
              <p class="akac-demo-note">El envío pasa por una verificación antispam. <a href="privacidad.html" target="_blank" rel="noopener noreferrer">Uso de tus datos</a>.</p>
              <button type="submit" class="akac-button akac-submit">Enviar mi confirmación ${icon("heart", 19)}</button>
              <p class="akac-form-status" role="status" aria-live="polite" tabindex="-1"></p>
              <div class="akac-confirmation" hidden>
                <p class="akac-confirmation-message"></p>
                <a class="akac-button akac-whatsapp" hidden target="_blank" rel="noopener noreferrer">Continuar por WhatsApp ${icon("arrow", 17)}</a>
                <p class="akac-whatsapp-note" hidden>Se abrirá el mensaje preparado; pulsa Enviar en WhatsApp para compartirlo.</p>
              </div>
            </form>`
          }
          </div>
        </section>
        <footer class="akac-footer">${icon("crown", 27)}<p>Los cuentos más bonitos se viven en familia</p><span>${name} · ${day} de ${esc(month)} de ${year}</span><button type="button" class="akac-replay">${icon("replay", 16)} Volver a abrir el libro</button></footer>
      </div>
      <button class="akac-motion-toggle" type="button" aria-pressed="${paused}" aria-label="${paused ? "Activar animaciones" : "Pausar animaciones"}">${icon(paused ? "play" : "pause", 16)}<span>${paused ? "Animar" : "Pausar"}</span></button>`;
  };
})(window.April);
