/* ==========================================================================
   Carpe Diem · Pinamar — exportar datos para el chatbot de n8n
   --------------------------------------------------------------------------
   Lee js/datos.js (la misma fuente que usa la web) y escribe
   chatbot/carpe-diem-departamentos.json, listo para cargar en n8n.

   Cómo usarlo: parado en la carpeta del proyecto, en la terminal,
       node herramientas/exportar-chatbot.js

   Por defecto exporta solo los departamentos que ya se alquilan. Los que
   tienen "Próximamente" en el nombre quedan afuera; para incluirlos:
       node herramientas/exportar-chatbot.js --todos
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..");
const SITIO = "https://www.carpediempinamar.com.ar"; // cambiar cuando esté el dominio definitivo
const incluirTodos = process.argv.includes("--todos");

// --- leer js/datos.js sin navegador ---
const contexto = { window: {} };
vm.createContext(contexto);
vm.runInContext(fs.readFileSync(path.join(raiz, "js/datos.js"), "utf8"), contexto);
const D = contexto.window.CARPE_DIEM;

const esProximamente = (p) => /pr[óo]ximamente/i.test(p.nombre);

// Palabras con las que un huésped suele pedir un departamento ("el de la parrilla")
const CLAVES = [
  ["parrilla", /parrilla/i], ["patio", /patio/i], ["balcón", /balc[óo]n/i], ["pileta", /pileta|solárium|solarium/i],
  ["cochera", /cochera|estacionamiento/i], ["planta baja", /planta baja/i], ["ascensor", /ascensor/i],
  ["lavarropas", /lavarropas|lavadero/i], ["aire acondicionado", /aire acondicionado/i], ["wifi", /wi-?fi/i],
  ["apto teletrabajo", /escritorio|trabajar/i], ["baño en suite", /suite/i], ["cuna", /cuna/i], ["bañera", /bañera/i],
];

function textoCompleto(p) {
  return JSON.stringify([p.descripcion, p.distribucion, p.comodidades, p.datos, p.tipo, p.frase]);
}

function palabrasClave(p) {
  const texto = textoCompleto(p);
  const claves = CLAVES.filter(([, re]) => re.test(texto)).map(([nombre]) => nombre);
  claves.push(p.zona.toLowerCase());
  if (/no se admiten/i.test(p.normas?.mascotas || "")) claves.push("sin mascotas");
  else if (p.normas?.mascotas) claves.push("mascotas");
  return [...new Set(claves)];
}

function comodidadesPlanas(p) {
  return Object.values(p.comodidades || {}).flat();
}

// Resumen en texto plano: es lo que mejor le sirve al modelo para responder
function resumen(p) {
  const d = p.datos || {};
  const n = p.normas || {};
  return [
    `${p.nombre} (${p.tipo}), en ${p.zona}. ${p.frase}`,
    `Capacidad: hasta ${d.huespedes} huéspedes, ${d.dormitorios} dormitorio(s), ${d.banos} baño(s), ${d.ambientes} ambientes, ${d.superficie} m², ${d.piso}. Camas: ${d.camas}.`,
    `Distancia a la playa: ${d.distanciaPlaya}.`,
    (p.descripcion || []).join(" "),
    `Incluye: ${comodidadesPlanas(p).join(", ")}.`,
    `Normas: entrada ${n.checkin}; salida ${n.checkout}; estadía mínima ${n.estadiaMinima}; mascotas: ${n.mascotas}; ${n.fumar}; ${n.fiestas}.`,
    `Cerca: ${(p.cerca || []).map((c) => `${c.lugar} a ${c.distancia}`).join("; ")}.`,
  ].join(" ");
}

const departamentos = D.propiedades
  .filter((p) => incluirTodos || !esProximamente(p))
  .map((p) => {
    const d = p.datos || {};
    return {
      id: p.id,
      nombre: p.nombre,
      estado: esProximamente(p) ? "proximamente" : "disponible",
      datos_provisorios: !!p.ejemplo, // true = todavía son datos de ejemplo, no confirmar por chat
      tipo: p.tipo,
      zona: p.zona,
      direccion: p.direccion,
      link_ficha: `${SITIO}/#/${p.id}`,
      capacidad: {
        huespedes: d.huespedes,
        ambientes: d.ambientes,
        dormitorios: d.dormitorios,
        banos: d.banos,
        camas: d.camas,
        superficie_m2: d.superficie,
        ubicacion_en_el_edificio: d.piso,
      },
      distancias: {
        playa: d.distanciaPlaya,
        puntos_de_interes: (p.cerca || []).map((c) => ({ lugar: c.lugar, distancia: c.distancia })),
      },
      descripcion: p.descripcion || [],
      distribucion: (p.distribucion || []).map((x) => ({ espacio: x.espacio, detalle: x.detalle })),
      comodidades_por_grupo: p.comodidades || {},
      comodidades: comodidadesPlanas(p),
      normas: {
        check_in: p.normas?.checkin,
        check_out: p.normas?.checkout,
        estadia_minima: p.normas?.estadiaMinima,
        mascotas: p.normas?.mascotas,
        fumar: p.normas?.fumar,
        fiestas: p.normas?.fiestas,
      },
      reservas: {
        airbnb: p.reservas?.airbnb || null,
        booking: p.reservas?.booking || null,
      },
      disponibilidad: {
        // Devuelve { configurado, fuentes, actualizado, ocupados: [{ desde, hasta }] }.
        // "hasta" es el día de salida: esa noche NO está ocupada.
        endpoint: `${SITIO}/ical/calendario.php?id=${p.id}`,
        metodo: "GET",
      },
      fotos: {
        carpeta: `${SITIO}/img/propiedades/${p.id}/`,
        nombres: "01.jpg, 02.jpg, 03.jpg… (la 01 es la portada)",
        etiquetas: p.etiquetasFotos || [],
      },
      palabras_clave: palabrasClave(p),
      resumen: resumen(p),
    };
  });

const salida = {
  generado: new Date().toISOString().slice(0, 10),
  fuente: "js/datos.js del sitio carpediempinamar",
  negocio: {
    nombre: `${D.marca.nombre} ${D.marca.lugar}`,
    rubro: "Alquiler temporario de departamentos",
    localidad: "Pinamar, Buenos Aires, Argentina",
    sitio: SITIO,
    whatsapp: D.contacto.whatsapp,
    whatsapp_link: `https://wa.me/${D.contacto.whatsapp}`,
    email: D.contacto.email,
    instagram: `https://www.instagram.com/${D.contacto.instagram}/`,
    tiktok: `https://www.tiktok.com/@${D.contacto.tiktok}`,
    datos_provisorios: !!D.contacto.ejemplo,
  },
  guia_de_respuesta: [
    "Responder en español rioplatense, de vos, cordial y breve.",
    "Usar únicamente los datos de este archivo. Si algo no está, decir que se consulta y derivar a una persona.",
    "No hay precios en este archivo: ante una consulta de tarifas, pedir fechas y cantidad de huéspedes y derivar a WhatsApp.",
    "Para saber si unas fechas están libres, consultar el endpoint de 'disponibilidad' del departamento. 'hasta' es el día de salida y esa noche no cuenta como ocupada.",
    "Si el endpoint responde configurado: false o falla, no afirmar disponibilidad: ofrecer confirmar por WhatsApp.",
    "Si un departamento tiene datos_provisorios: true, no confirmar esos detalles como definitivos.",
    "Para cerrar, compartir el link de la ficha del departamento y el de Airbnb o Booking.",
    "No inventar fotos, reseñas, descuentos ni excepciones a las normas de la casa.",
  ],
  departamentos,
};

const destino = path.join(raiz, "chatbot/carpe-diem-departamentos.json");
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(salida, null, 2) + "\n", "utf8");
console.log(`Listo: ${path.relative(raiz, destino)} · ${departamentos.length} departamentos${incluirTodos ? " (incluye los que están próximamente)" : ""}`);
