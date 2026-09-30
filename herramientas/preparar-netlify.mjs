/* ==========================================================================
   Carpe Diem · Pinamar — prepara la carpeta que se publica en Netlify
   --------------------------------------------------------------------------
   Netlify ejecuta este script antes de publicar (ver netlify.toml) y copia
   a "publicar/" solo lo que tiene que ver el visitante.

   Queda AFUERA a propósito:
     · ical/config.php y ical/calendario.php  → Netlify no ejecuta PHP, así que
       se servirían como texto y quedarían a la vista los links secretos de
       los calendarios. En Netlify ese trabajo lo hace netlify/functions/calendario.mjs.
     · herramientas/, marca/, chatbot/        → son para trabajar, no para publicar.
     · img/originales/                        → las fotos pesadas sin optimizar.

   También se puede correr a mano para ver qué se va a subir:
       node herramientas/preparar-netlify.mjs
   ========================================================================== */

import { cp, mkdir, rm, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = path.join(RAIZ, "publicar");

const COPIAR = ["index.html", "favicon.svg", "robots.txt", "sitemap.xml", "css", "js", "img"];

const existe = async (p) => access(p).then(() => true, () => false);

await rm(DESTINO, { recursive: true, force: true });
await mkdir(DESTINO, { recursive: true });

for (const elemento of COPIAR) {
  const origen = path.join(RAIZ, elemento);
  if (await existe(origen)) {
    await cp(origen, path.join(DESTINO, elemento), {
      recursive: true,
      filter: (ruta) => !path.relative(RAIZ, ruta).split(path.sep).includes("originales"),
    });
    console.log("  copiado:", elemento);
  }
}

// La copia guardada de los calendarios: es la red de seguridad si la función falla.
const ical = path.join(RAIZ, "ical");
if (await existe(ical)) {
  await mkdir(path.join(DESTINO, "ical"), { recursive: true });
  for (const archivo of await readdir(ical)) {
    if (archivo.startsWith("ocupados-") && (archivo.endsWith(".json") || archivo.endsWith(".js"))) {
      await cp(path.join(ical, archivo), path.join(DESTINO, "ical", archivo));
      console.log("  copiado: ical/" + archivo);
    }
  }
}

console.log("Listo: carpeta publicar/ armada (sin PHP ni archivos de trabajo).");
