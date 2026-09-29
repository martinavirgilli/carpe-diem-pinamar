/* ==========================================================================
   Carpe Diem · Pinamar — calendario de disponibilidad en Netlify
   --------------------------------------------------------------------------
   Es la versión para Netlify de ical/calendario.php: hace exactamente lo
   mismo (baja los calendarios iCal, junta las fechas ocupadas y las
   devuelve en JSON), pero como función serverless, porque Netlify no
   ejecuta PHP.

   Los links de los calendarios NO van en el código: se cargan como
   variables de entorno en el panel de Netlify, una por departamento:

       ICAL_LIPTUS_MERLUZA      = https://calendar.google.com/.../basic.ics
       ICAL_MARES_BESUGO        = https://calendar.google.com/.../basic.ics
       ICAL_LIPTUS2_CORNALITO   = https://calendar.google.com/.../basic.ics

   El nombre sale del id del departamento en js/datos.js, en mayúsculas y
   con guiones bajos. Si un departamento está en varias plataformas, se
   ponen todos los links en la misma variable, separados por coma.

   Responde en /ical/calendario.php?id=<departamento>, la misma dirección
   que usa la versión PHP, así el sitio no cambia.
   ========================================================================== */

const MINUTOS_CACHE = 20;

const ETIQUETAS = [
  [/airbnb\./i, "Airbnb"],
  [/booking\./i, "Booking"],
  [/google\./i, "Google Calendar"],
];

const respuesta = (datos, estado = 200, cachear = false) =>
  new Response(JSON.stringify(datos), {
    status: estado,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cachear
        ? `public, max-age=0, s-maxage=${MINUTOS_CACHE * 60}`   // lo guarda la red de Netlify, no el navegador
        : "no-store",
    },
  });

const nombreFuente = (url) => (ETIQUETAS.find(([re]) => re.test(url)) || [, "Calendario"])[1];

const hoy = () => new Date().toISOString().slice(0, 10);

function fecha(valor) {
  const m = /(\d{4})(\d{2})(\d{2})/.exec(valor);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function sumarUnDia(iso) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Saca las reservas de un archivo iCal. "hasta" es el día de salida: esa noche queda libre.
function ocupadosDe(ics) {
  const reservas = [];
  const limpio = ics.replace(/\r\n[ \t]/g, "");           // el formato iCal parte las líneas largas
  for (const [, ev] of limpio.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)) {
    const inicio = /^DTSTART[^:]*:(.+)$/m.exec(ev);
    if (!inicio) continue;
    const desde = fecha(inicio[1].trim());
    if (!desde) continue;
    const fin = /^DTEND[^:]*:(.+)$/m.exec(ev);
    let hasta = fin ? fecha(fin[1].trim()) : null;
    if (!hasta || hasta <= desde) hasta = sumarUnDia(desde);
    if (hasta < hoy()) continue;                           // reservas que ya pasaron
    reservas.push({ desde, hasta });
  }
  return reservas;
}

export default async (peticion) => {
  const id = (new URL(peticion.url).searchParams.get("id") || "").toLowerCase();
  if (!/^[a-z0-9-]{1,60}$/.test(id)) {
    return respuesta({ configurado: false, error: "Departamento desconocido" }, 404);
  }

  const variable = "ICAL_" + id.toUpperCase().replace(/-/g, "_");
  const urls = (process.env[variable] || "")
    .split(/[\s,]+/)
    .filter((u) => /^https?:\/\//.test(u));
  if (!urls.length) return respuesta({ configurado: false });

  const ocupados = [];
  const fuentes = [];
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "CarpeDiemPinamar/1.0" } });
        if (!res.ok) throw new Error(res.status);
        ocupados.push(...ocupadosDe(await res.text()));
        fuentes.push(nombreFuente(url));
      } catch (error) {
        console.error(`No se pudo leer el calendario de ${id}:`, error.message);
      }
    })
  );

  if (!fuentes.length) return respuesta({ configurado: false, error: "No respondió ningún calendario" }, 502);

  ocupados.sort((a, b) => a.desde.localeCompare(b.desde));
  return respuesta(
    {
      configurado: true,
      fuentes: [...new Set(fuentes)],
      actualizado: new Date().toISOString(),
      ocupados,
    },
    200,
    true
  );
};

// Responde en la misma dirección que la versión PHP, así el sitio funciona igual en los dos lados.
export const config = { path: "/ical/calendario.php" };
