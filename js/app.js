/* ==========================================================================
   Carpe Diem · Pinamar — lógica del sitio
   No hace falta tocar este archivo para cambiar contenidos: ver js/datos.js
   ========================================================================== */
(function () {
  "use strict";

  const D = window.CARPE_DIEM;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MAX_FOTOS = 40;
  const tituloBase = document.title;
  const descBase = $('meta[name="description"]')?.getAttribute("content") || "";

  /* ---------------- utilidades ---------------- */

  function linkWhatsapp(texto) {
    const t = texto || `${D.contacto.mensajeWhatsapp} los departamentos.`;
    return `https://wa.me/${D.contacto.whatsapp}?text=${encodeURIComponent(t)}`;
  }

  function marcaEjemplo(obj, texto = "ejemplo") {
    return obj && obj.ejemplo ? `<span class="marca-ejemplo">${esc(texto)}</span>` : "";
  }

  // Líneas de médano para los espacios de foto vacíos
  function ondas() {
    let d = "";
    for (let i = 0; i < 7; i++) {
      const y = 70 + i * 32;
      const a = 14 + (i % 3) * 6;
      d += `<path d="M-10 ${y} C 80 ${y - a}, 150 ${y - a}, 220 ${y + a / 3} S 350 ${y + a}, 410 ${y - a / 2}"/>`;
    }
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">${d}</svg>`;
  }

  // Crea un espacio de foto: muestra el lugar reservado y, si la imagen existe, la carga encima.
  function espacioFoto(src, etiqueta, alt, conRuta = true, prioridad = false) {
    const caja = document.createElement("div");
    caja.className = "foto";
    caja.innerHTML = `<div class="foto__vacia">${ondas()}
      <span class="foto__tipo">Foto</span>
      <span class="foto__etiqueta">${esc(etiqueta || "Próximamente")}</span>
      ${conRuta ? `<span class="foto__ruta">${esc(src)}</span>` : ""}</div>`;
    if (src) {
      const img = new Image();
      img.alt = alt || etiqueta || "";
      img.loading = prioridad ? "eager" : "lazy";   // las que se ven de entrada no esperan
      img.decoding = "async";
      img.onload = () => { caja.innerHTML = ""; caja.appendChild(img); };
      img.src = src;
    }
    return caja;
  }

  function existeImagen(src) {
    return new Promise((ok) => {
      const img = new Image();
      img.onload = () => ok(true);
      img.onerror = () => ok(false);
      img.src = src;
    });
  }

  const cacheFotos = {};
  const cachePatron = {};                       // cómo se llaman las fotos de cada departamento
  const EXTENSIONES = ["jpg", "jpeg", "png", "webp"];
  const PATRON_POR_DEFECTO = { ceros: 2, ext: "jpg" };

  function rutaFoto(id, n, patron) {
    const p = patron || cachePatron[id] || PATRON_POR_DEFECTO;
    return `img/propiedades/${id}/${String(n).padStart(p.ceros, "0")}.${p.ext}`;
  }

  // Devuelve la portada (la foto 1) apenas se sabe cómo se llama, sin esperar al resto.
  async function primeraFoto(id) {
    if (cacheFotos[id]) return cacheFotos[id][0] || null;
    const patron = cachePatron[id] || (await descubrirPatron(id));
    if (!patron) return null;
    cachePatron[id] = patron;
    return rutaFoto(id, 1, patron);
  }

  // Acepta 01.jpg, 02.jpg... y también 1.jpg, 2.jpg..., en jpg, jpeg, png o webp.
  async function descubrirPatron(id) {
    for (const ceros of [2, 1]) {
      for (const ext of EXTENSIONES) {
        const patron = { ceros, ext };
        if (await existeImagen(rutaFoto(id, 1, patron))) return patron;
      }
    }
    return null;
  }

  // Busca la primera foto y sigue numerando hasta que falte una.
  async function detectarFotos(id) {
    if (cacheFotos[id]) return cacheFotos[id];
    const patron = await descubrirPatron(id);
    const lista = [];
    if (patron) {
      cachePatron[id] = patron;
      lista.push(rutaFoto(id, 1, patron));
      for (let n = 2; n <= MAX_FOTOS; n++) {
        const src = rutaFoto(id, n, patron);
        if (!(await existeImagen(src))) break;
        lista.push(src);
      }
    }
    cacheFotos[id] = lista;
    return lista;
  }

  /* ---------------- contacto y redes ---------------- */

  function prepararContacto() {
    const c = D.contacto;
    $$("[data-wa]").forEach((a) => { a.href = linkWhatsapp(); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-ig]").forEach((a) => { a.href = `https://www.instagram.com/${c.instagram}/`; });
    $$("[data-tt]").forEach((a) => { a.href = `https://www.tiktok.com/@${c.tiktok}`; });
    $$("[data-ig-usuario]").forEach((s) => { s.textContent = "@" + c.instagram; });
    $$("[data-tt-usuario]").forEach((s) => { s.textContent = "@" + c.tiktok; });
    $$("[data-mail]").forEach((a) => {
      if (!c.email) { a.hidden = true; return; }
      a.href = "mailto:" + c.email;
      a.textContent = c.email;
    });
    $("#contacto-plataformas").innerHTML = D.propiedades.map((p) => {
      const links = [];
      if (p.reservas?.airbnb) links.push(`<a href="${esc(p.reservas.airbnb)}" target="_blank" rel="noopener">Airbnb</a>`);
      if (p.reservas?.booking) links.push(`<a href="${esc(p.reservas.booking)}" target="_blank" rel="noopener">Booking</a>`);
      return links.length ? `<span>${esc(p.nombre)}: ${links.join(" · ")}</span>` : "";
    }).join("");
    const anio = $("#anio");
    if (anio) anio.textContent = new Date().getFullYear();
  }

  /* ---------------- inicio ---------------- */

  function tarjeta(p) {
    const a = document.createElement("a");
    a.className = "depto";
    a.href = `#/${p.id}`;
    const d = p.datos || {};
    a.innerHTML = `
      <div class="depto__img">${marcaEjemplo(p, "datos de ejemplo")}</div>
      <div class="depto__cuerpo">
        <span class="depto__zona">${esc(p.zona)}</span>
        <h3 class="depto__nombre">${esc(p.nombre)}</h3>
        <p class="depto__frase">${esc(p.frase)}</p>
        <div class="depto__datos">
          <span>${d.huespedes} huéspedes</span>
          <span>${d.dormitorios} dorm.</span>
          <span>${d.banos} baño${d.banos > 1 ? "s" : ""}</span>
          <span>Playa a ${esc(d.distanciaPlaya)}</span>
        </div>
        <span class="depto__ver">Ver departamento</span>
      </div>`;
    const portada = $(".depto__img", a);
    const etiqueta = (p.etiquetasFotos || [])[0] || "Portada";
    const alt = `${p.nombre}, ${p.tipo} en ${p.zona}`;
    portada.appendChild(espacioFoto(null, etiqueta, alt, false));
    primeraFoto(p.id).then((foto) => {
      if (!foto) return;
      portada.querySelector(".foto")?.remove();
      portada.appendChild(espacioFoto(foto, etiqueta, alt, false, true));
    });
    return a;
  }

  function renderInicio() {
    const lista = $("#lista-deptos");
    lista.innerHTML = "";
    D.propiedades.forEach((p) => lista.appendChild(tarjeta(p)));

    $$("[data-foto]").forEach((fig) => {
      fig.innerHTML = "";
      fig.appendChild(espacioFoto(fig.dataset.foto, fig.dataset.etiqueta, fig.dataset.alt, true, true));
    });

    $("#lista-resenas").innerHTML = (D.resenas || []).map((r) => `
      <figure class="resena">
        <blockquote>“${esc(r.texto)}”</blockquote>
        <figcaption>
          <strong>${esc(r.autor)} ${marcaEjemplo(r)}</strong>
          <span>${esc(r.depto)} · ${esc(r.origen)} · ${esc(r.fecha)}</span>
        </figcaption>
      </figure>`).join("");
  }

  /* ---------------- detalle de departamento ---------------- */

  const NOMBRES_DATOS = [
    ["huespedes", "Huéspedes"], ["ambientes", "Ambientes"], ["dormitorios", "Dormitorios"], ["banos", "Baños"],
    ["superficie", "m² cubiertos"], ["distanciaPlaya", "A la playa"], ["piso", "Ubicación", true], ["camas", "Camas", true],
  ];
  const NOMBRES_NORMAS = { checkin: "Entrada", checkout: "Salida", estadiaMinima: "Estadía mínima", mascotas: "Mascotas", fumar: "Fumar", fiestas: "Fiestas" };

  function renderDetalle(p) {
    const vista = $("#vista-depto");
    const d = p.datos || {};
    const etiquetas = p.etiquetasFotos || [];
    const r = p.reservas || {};

    vista.innerHTML = `
    <article class="ficha aparece">
      <a class="ficha__volver" href="#departamentos">← Todos los departamentos</a>

      <header class="ficha__cabeza">
        <div class="ficha__meta"><span class="eyebrow">${esc(p.tipo)} · ${esc(p.zona)}</span>${marcaEjemplo(p, "datos de ejemplo")}</div>
        <h1>${esc(p.nombre)}</h1>
        <p class="ficha__frase">${esc(p.frase)}</p>
      </header>

      <div class="galeria" id="galeria"></div>

      <div class="ficha__cuerpo">
        <div class="ficha__principal">

          <section class="bloque" aria-label="Datos principales">
            <div class="datos">
              ${NOMBRES_DATOS.filter(([k]) => d[k] !== undefined && d[k] !== "").map(([k, nombre, ancho]) => `
                <div class="dato${ancho ? " dato--ancho" : ""}"><span class="dato__valor">${esc(d[k])}</span><span class="dato__nombre">${nombre}</span></div>`).join("")}
            </div>
          </section>

          <section class="bloque">
            <h2>El departamento</h2>
            <div class="bloque__texto">${(p.descripcion || []).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
          </section>

          ${p.distribucion?.length ? `
          <section class="bloque">
            <h2>Distribución</h2>
            <ul class="lista-filas">${p.distribucion.map((x) => `<li><span>${esc(x.espacio)}</span><span>${esc(x.detalle)}</span></li>`).join("")}</ul>
          </section>` : ""}

          <section class="bloque">
            <h2>Qué incluye</h2>
            <div class="comodidades">
              ${Object.entries(p.comodidades || {}).map(([grupo, items]) => `
                <div><h3>${esc(grupo)}</h3><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}
            </div>
          </section>

          <section class="bloque" id="disponibilidad">
            <h2>Disponibilidad</h2>
            <div class="cal" id="calendario"></div>
          </section>

          <section class="bloque">
            <h2>Normas de la casa</h2>
            <ul class="lista-filas">${Object.entries(p.normas || {}).map(([k, v]) => `<li><span>${esc(NOMBRES_NORMAS[k] || k)}</span><span>${esc(v)}</span></li>`).join("")}</ul>
          </section>

          ${p.cerca?.length ? `
          <section class="bloque">
            <h2>A pasos</h2>
            <div class="cerca">${p.cerca.map((c) => `<div><strong>${esc(c.lugar)}</strong><span>${esc(c.distancia)}</span></div>`).join("")}</div>
          </section>` : ""}

          <section class="bloque">
            <h2>Ubicación</h2>
            <div class="mapa" id="mapa"></div>
            <p class="mapa__direccion"><span>${esc(p.zona)} · zona aproximada, la dirección exacta se envía al confirmar la reserva</span>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapa ? `${p.mapa.lat},${p.mapa.lng}` : p.direccion)}" target="_blank" rel="noopener">Ver la zona en Google Maps</a></p>
          </section>
        </div>

        <aside class="reserva" aria-label="Consultar o reservar">
          <h2>Consultá tus fechas</h2>
          <div class="reserva__fechas">
            <div><span>Llegada</span><strong id="r-llegada">Elegí en el calendario</strong></div>
            <div><span>Salida</span><strong id="r-salida">—</strong></div>
          </div>
          <p class="reserva__noches" id="r-noches">Hasta ${d.huespedes} huéspedes · ${esc(p.normas?.estadiaMinima ? "mínimo " + p.normas.estadiaMinima : "")}</p>
          <a class="boton boton--ancho" id="r-wa" href="${linkWhatsapp(`${D.contacto.mensajeWhatsapp} el ${p.nombre}.`)}" target="_blank" rel="noopener">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/></svg>
            Consultar por WhatsApp</a>
          ${r.airbnb || r.booking ? `
          <p class="reserva__o">o reservá en</p>
          <div class="reserva__plataformas">
            ${r.airbnb ? `<a class="boton boton--linea" href="${esc(r.airbnb)}" target="_blank" rel="noopener">Airbnb</a>` : ""}
            ${r.booking ? `<a class="boton boton--linea" href="${esc(r.booking)}" target="_blank" rel="noopener">Booking</a>` : ""}
          </div>` : ""}
          <p class="reserva__nota">Consultando directo por WhatsApp te respondemos con el precio final para tus fechas.</p>
        </aside>
      </div>

      <section class="seccion" style="padding-inline:0" aria-labelledby="t-otros">
        <header class="seccion__cabeza"><p class="eyebrow">Seguí mirando</p><h2 id="t-otros">Otros departamentos</h2></header>
        <div class="otros" id="otros"></div>
      </section>
    </article>`;

    // galería: primero los espacios reservados, después las fotos reales si existen
    const galeria = $("#galeria");
    const pintarGaleria = (fotos) => {
      galeria.innerHTML = "";
      const cantidad = fotos.length ? Math.min(5, fotos.length) : Math.min(5, Math.max(etiquetas.length, 5));
      for (let i = 0; i < cantidad; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "galeria__item";
        const etiqueta = etiquetas[i] || `Foto ${i + 1}`;
        btn.setAttribute("aria-label", `Ver foto: ${etiqueta}`);
        btn.appendChild(espacioFoto(fotos[i] || rutaFoto(p.id, i + 1), etiqueta, `${p.nombre}: ${etiqueta.toLowerCase()}`, true, true));
        if (fotos.length) btn.addEventListener("click", () => abrirVisor(p, fotos, i));
        else btn.style.cursor = "default";
        galeria.appendChild(btn);
      }
      if (fotos.length > 1) {
        const todas = document.createElement("button");
        todas.type = "button";
        todas.className = "galeria__todas";
        todas.textContent = `Ver las ${fotos.length} fotos`;
        todas.addEventListener("click", () => abrirVisor(p, fotos, 0));
        galeria.appendChild(todas);
      }
    };
    pintarGaleria([]);
    primeraFoto(p.id).then((foto) => {
      if (foto && document.body.contains(galeria)) pintarGaleria([foto]);
      return detectarFotos(p.id);
    }).then((fotos) => { if (fotos && fotos.length && document.body.contains(galeria)) pintarGaleria(fotos); });

    pintarMapa($("#mapa"), p);

    // otros
    const otros = $("#otros");
    D.propiedades.filter((x) => x.id !== p.id).forEach((x) => otros.appendChild(tarjeta(x)));

    new Calendario($("#calendario"), p, actualizarReserva(p));

    document.title = `${p.nombre} · ${tituloBase}`;
    $('meta[name="description"]')?.setAttribute("content", `${p.nombre}, ${p.tipo.toLowerCase()} en ${p.zona}. ${p.frase} Mirá fotos, comodidades y disponibilidad.`);
  }

  /* Mapa de zona: muestra el barrio con un círculo, sin marcar la puerta del edificio.
     La dirección exacta se pasa por WhatsApp cuando se confirma la reserva. */
  const RADIO_ZONA = 200;      // metros: unas 3 cuadras a la redonda
  const VERDE_MAPA = "#4a746e";
  let mapaActual = null;

  function espacioMapa(caja, p, nota) {
    caja.innerHTML = `<div class="mapa__vacio">${ondas()}<span class="foto__tipo">Mapa</span>
      <span class="foto__etiqueta">${esc(p.zona)}</span>
      <span class="foto__ruta">${esc(nota)}</span></div>`;
  }

  function pintarMapa(caja, p) {
    if (!caja) return;
    const m = p.mapa;
    if (mapaActual) { mapaActual.remove(); mapaActual = null; }
    if (!m || typeof m.lat !== "number") return espacioMapa(caja, p, "Ubicación a confirmar");
    // la vista previa no deja cargar mapas de afuera
    if (/claude|anthropic/.test(location.hostname) || !window.L) {
      return espacioMapa(caja, p, "El mapa se ve en el sitio publicado");
    }
    caja.innerHTML = '<div class="mapa__lienzo"></div>';
    const mapa = L.map($(".mapa__lienzo", caja), {
      scrollWheelZoom: false,        // así la rueda del mouse sigue bajando la página
      zoomControl: true,
      attributionControl: true,
    }).setView([m.lat, m.lng], m.zoom || 16);   // la vista va primero: si no, Leaflet no dibuja nada
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);
    const zona = L.circle([m.lat, m.lng], {
      radius: RADIO_ZONA,
      color: VERDE_MAPA, weight: 1, opacity: .9,
      fillColor: VERDE_MAPA, fillOpacity: .12,
    }).addTo(mapa);
    mapa.fitBounds(zona.getBounds().pad(0.25));
    mapaActual = mapa;
  }

  function fechaCorta(d) { return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }); }
  function fechaMensaje(d) { return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }); }

  function actualizarReserva(p) {
    return (inicio, fin) => {
      const llegada = $("#r-llegada"), salida = $("#r-salida"), noches = $("#r-noches"), wa = $("#r-wa");
      if (!llegada) return;
      llegada.textContent = inicio ? fechaCorta(inicio) : "Elegí en el calendario";
      salida.textContent = fin ? fechaCorta(fin) : "—";
      if (inicio && fin) {
        const n = Math.round((fin - inicio) / 864e5);
        noches.textContent = `${n} noche${n > 1 ? "s" : ""} · hasta ${p.datos.huespedes} huéspedes`;
        wa.href = linkWhatsapp(`${D.contacto.mensajeWhatsapp} el ${p.nombre}, del ${fechaMensaje(inicio)} al ${fechaMensaje(fin)} (${n} noche${n > 1 ? "s" : ""}). ¿Está disponible?`);
      } else {
        noches.textContent = inicio ? "Ahora elegí el día de salida" : `Hasta ${p.datos.huespedes} huéspedes · mínimo ${p.normas?.estadiaMinima || ""}`;
        wa.href = linkWhatsapp(`${D.contacto.mensajeWhatsapp} el ${p.nombre}.`);
      }
    };
  }

  /* ---------------- calendario de disponibilidad ----------------
     Pide a ical/calendario.php?id=<depto> las fechas ocupadas (que ese
     archivo lee de los calendarios iCal de Airbnb y Booking).
     Respuesta esperada: { configurado: true, actualizado: "ISO", ocupados: [{ desde: "2026-01-03", hasta: "2026-01-10" }] }
     "hasta" es el día de salida (no se cuenta como noche ocupada).
     Si no responde (vista previa o sin configurar) muestra fechas de ejemplo. */

  const clave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const desdeClave = (s) => { const [y, m, d] = s.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const sumarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  class Calendario {
    constructor(raiz, prop, alCambiar) {
      this.raiz = raiz;
      this.prop = prop;
      this.alCambiar = alCambiar;
      const h = new Date();
      this.hoy = new Date(h.getFullYear(), h.getMonth(), h.getDate());
      this.mesBase = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
      this.desplazamiento = 0;
      this.ocupados = new Set();
      this.inicio = null;
      this.fin = null;
      this.raiz.innerHTML = `
        <div class="cal__barra">
          <p class="cal__estado" data-tipo="cargando">Cargando disponibilidad…</p>
          <div class="cal__nav">
            <button type="button" data-mov="-1" aria-label="Mes anterior">‹</button>
            <button type="button" data-mov="1" aria-label="Mes siguiente">›</button>
          </div>
        </div>
        <div class="cal__meses"></div>
        <p class="cal__aviso" aria-live="polite"></p>
        <div class="cal__leyenda">
          <span><i class="l-libre"></i>Disponible</span>
          <span><i class="l-ocupado"></i>Ocupado</span>
          <span><i class="l-sel"></i>Tus fechas</span>
        </div>`;
      $$("[data-mov]", raiz).forEach((b) => b.addEventListener("click", () => { this.desplazamiento += Number(b.dataset.mov); this.pintar(); }));
      this.raiz.addEventListener("click", (e) => { const b = e.target.closest(".cal__dia"); if (b && !b.disabled) this.elegir(desdeClave(b.dataset.dia)); });
      this.pintar();
      this.cargar();
    }

    async cargar() {
      const estado = $(".cal__estado", this.raiz);
      const id = encodeURIComponent(this.prop.id);
      // 1) el calendario en vivo del hosting; 2) la copia guardada; 3) fechas de ejemplo
      const v = Date.now();                    // evita que el navegador muestre una copia vieja
      const fuentes = [
        `${D.calendario.endpoint}?id=${id}&v=${v}`,
        `ical/ocupados-${id}.json?v=${v}`,
      ];
      for (const url of fuentes) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(res.status);
          const datos = await res.json();
          if (!datos.configurado) throw new Error("sin configurar");
          this.marcar(datos.ocupados || []);
          const cuando = datos.actualizado
            ? new Date(datos.actualizado).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "";
          estado.dataset.tipo = "ok";
          estado.textContent = datos.instantanea
            ? `Fechas al ${cuando} · se confirman por WhatsApp`
            : `Sincronizado con ${(datos.fuentes || ["el calendario"]).join(" y ")}${cuando ? " · " + cuando : ""}`;
          this.pintar();
          return;
        } catch (err) { /* probamos la fuente siguiente */ }
      }
      this.marcar(this.ejemplo());
      estado.dataset.tipo = "ejemplo";
      estado.textContent = "Calendario de ejemplo: todavía no está conectado";
      this.pintar();
    }

    marcar(rangos) {
      this.ocupados.clear();
      rangos.forEach(({ desde, hasta }) => {
        for (let d = desdeClave(desde); d < desdeClave(hasta); d = sumarDias(d, 1)) this.ocupados.add(clave(d));
      });
    }

    // Reservas inventadas pero estables, solo para ver cómo se ve el calendario
    ejemplo() {
      let semilla = [...this.prop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
      const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
      const rangos = [];
      let d = sumarDias(this.hoy, 2 + Math.floor(azar() * 5));
      while (rangos.length < 8) {
        const largo = 2 + Math.floor(azar() * 7);
        rangos.push({ desde: clave(d), hasta: clave(sumarDias(d, largo)) });
        d = sumarDias(d, largo + 3 + Math.floor(azar() * 12));
      }
      return rangos;
    }

    nochesLibres(a, b) {
      for (let d = a; d < b; d = sumarDias(d, 1)) if (this.ocupados.has(clave(d))) return false;
      return true;
    }

    elegir(dia) {
      const aviso = $(".cal__aviso", this.raiz);
      aviso.textContent = "";
      const igual = (a, b) => a && b && +a === +b;
      if (this.ocupados.has(clave(dia))) {                            // noche ocupada: no se puede elegir
        aviso.textContent = "Esa noche ya está ocupada. Elegí otra fecha de llegada.";
        return;
      }
      if (igual(dia, this.fin)) this.fin = null;                      // tocar la salida la desmarca
      else if (igual(dia, this.inicio)) { this.inicio = this.fin; this.fin = null; }  // y tocar la llegada, también
      else if (this.inicio && !this.fin && dia > this.inicio) {
        if (!this.nochesLibres(this.inicio, dia)) {                   // hay noches ocupadas en el medio
          aviso.textContent = "Hay noches ocupadas en ese rango. Probá con otra fecha de salida.";
          return;
        }
        this.fin = dia;
      } else { this.inicio = dia; this.fin = null; }                  // cualquier otro caso: arranca de nuevo
      this.pintar();
      this.alCambiar(this.inicio, this.fin);
    }

    pintar() {
      const meses = $(".cal__meses", this.raiz);
      const cant = D.calendario.mesesVisibles || 2;
      this.desplazamiento = Math.max(0, Math.min(this.desplazamiento, 12 - cant));
      $('[data-mov="-1"]', this.raiz).disabled = this.desplazamiento === 0;
      $('[data-mov="1"]', this.raiz).disabled = this.desplazamiento >= 12 - cant;
      const dias = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];
      let html = "";
      for (let k = 0; k < cant; k++) {
        const primero = new Date(this.mesBase.getFullYear(), this.mesBase.getMonth() + this.desplazamiento + k, 1);
        const titulo = primero.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
        const huecos = (primero.getDay() + 6) % 7;
        const total = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate();
        html += `<div class="cal__mes"><p class="cal__titulo">${titulo}</p><div class="cal__grilla">`;
        html += dias.map((x) => `<span class="cal__dia-sem" aria-hidden="true">${x}</span>`).join("");
        html += `<span class="cal__vacio"></span>`.repeat(huecos);
        for (let n = 1; n <= total; n++) {
          const d = new Date(primero.getFullYear(), primero.getMonth(), n);
          const c = clave(d);
          const pasado = d < this.hoy;
          const ocupado = this.ocupados.has(c);
          const clases = ["cal__dia"];
          if (pasado) clases.push("cal__dia--pasado");
          else if (ocupado) clases.push("cal__dia--ocupado");
          else clases.push("cal__dia--libre");
          if (+d === +this.hoy) clases.push("cal__dia--hoy");
          if (this.inicio && +d === +this.inicio) clases.push("cal__dia--inicio");
          if (this.fin && +d === +this.fin) clases.push("cal__dia--fin");
          if (this.inicio && this.fin && d > this.inicio && d < this.fin) clases.push("cal__dia--rango");
          const etiqueta = `${d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}: ${pasado ? "fecha pasada" : ocupado ? "ocupado" : "disponible"}`;
          html += `<button type="button" class="${clases.join(" ")}" data-dia="${c}" aria-label="${etiqueta}"${pasado ? " disabled" : ""}>${n}</button>`;
        }
        html += `</div></div>`;
      }
      meses.innerHTML = html;
    }
  }

  /* ---------------- visor de fotos ---------------- */

  const visor = $("#visor");
  let visorFotos = [], visorIdx = 0, visorProp = null;
  function mostrarFoto() {
    const img = $("#visor-img");
    const etiqueta = (visorProp.etiquetasFotos || [])[visorIdx] || `Foto ${visorIdx + 1}`;
    img.src = visorFotos[visorIdx];
    img.alt = `${visorProp.nombre}: ${etiqueta}`;
    $("#visor-pie").textContent = `${etiqueta} · ${visorIdx + 1} / ${visorFotos.length}`;
  }
  function abrirVisor(p, fotos, i) {
    visorProp = p; visorFotos = fotos; visorIdx = i;
    mostrarFoto();
    if (typeof visor.showModal === "function") visor.showModal();
  }
  const mover = (n) => { visorIdx = (visorIdx + n + visorFotos.length) % visorFotos.length; mostrarFoto(); };
  $("[data-cerrar]", visor).addEventListener("click", () => visor.close());
  $("[data-ant]", visor).addEventListener("click", () => mover(-1));
  $("[data-sig]", visor).addEventListener("click", () => mover(1));
  visor.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") mover(-1); if (e.key === "ArrowRight") mover(1); });
  let toqueX = null;
  visor.addEventListener("touchstart", (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
    toqueX = null;
  });

  /* ---------------- navegación ---------------- */

  function enrutar() {
    const h = decodeURIComponent(location.hash || "");
    const inicio = $("#vista-inicio"), depto = $("#vista-depto");
    if (h.startsWith("#/")) {
      const p = D.propiedades.find((x) => x.id === h.slice(2));
      if (p) {
        inicio.hidden = true;
        depto.hidden = false;
        renderDetalle(p);
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
    }
    const veniaDeDepto = !depto.hidden;
    depto.hidden = true;
    depto.innerHTML = "";
    inicio.hidden = false;
    document.title = tituloBase;
    $('meta[name="description"]')?.setAttribute("content", descBase);
    if (veniaDeDepto) {
      const destino = h && h.length > 1 ? document.getElementById(h.slice(1)) : null;
      requestAnimationFrame(() => destino ? destino.scrollIntoView() : window.scrollTo(0, 0));
    }
  }

  const cabecera = $(".cabecera");
  window.addEventListener("scroll", () => cabecera.classList.toggle("con-borde", window.scrollY > 8), { passive: true });

  prepararContacto();
  renderInicio();
  window.addEventListener("hashchange", enrutar);
  enrutar();
})();
