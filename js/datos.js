/* ==========================================================================
   CARPE DIEM · PINAMAR — DATOS DEL SITIO
   --------------------------------------------------------------------------
   Este es el único archivo que hace falta editar para cambiar textos,
   contacto y departamentos.

   FOTOS: no hace falta listarlas acá. Guardalas en
       img/propiedades/<id-del-depto>/01.jpg, 02.jpg, 03.jpg ...
   (numeradas, sin saltos, en .jpg) y el sitio las detecta solo.
   La 01.jpg es la portada del departamento.
   Foto principal del inicio:  img/portada.jpg
   ========================================================================== */

window.CARPE_DIEM = {

  marca: {
    nombre: "Carpe Diem",
    lugar: "Pinamar",
    lema: "Aprovechá el día",
  },

  contacto: {
    // Número completo, sin +, espacios ni guiones. Ej: 5492254123456
    whatsapp: "5492254607187",
    mensajeWhatsapp: "¡Hola! Vi la web de Carpe Diem Pinamar y quiero consultar por",
    email: "carpediempinamar@gmail.com",
    instagram: "carpediem.alquilerespinamar",   // solo el usuario, sin @
    tiktok: "carpe.diem.alquil",      // solo el usuario, sin @
  },

  // Calendario: los links iCal de Airbnb/Booking se cargan en
  // ical/config.php (quedan ocultos en el servidor, no acá).
  calendario: {
    endpoint: "ical/calendario.php",
    mesesVisibles: 2,

    /* Reglas de estadía, según el MES DE LLEGADA (1 = enero … 12 = diciembre).
       · diaLlegada: día de la semana obligatorio para entrar (0 = domingo … 6 = sábado).
       · nochesExactas: las únicas duraciones permitidas.
       · minimoNoches: cantidad mínima, con cualquier día de llegada.
       · texto: lo que se muestra debajo del calendario. */
    reglas: [
      {
        meses: [12, 1, 2, 3],
        diaLlegada: 6,                 // sábado
        multiploNoches: 7,             // semanas completas: 7, 14, 21, 28…
        minimoNoches: 7,
        texto: "De diciembre a marzo se alquila por semanas completas, de sábado a sábado.",
        avisoLlegada: "De diciembre a marzo la llegada es siempre un sábado.",
        avisoSalida: "La salida también es un sábado: se alquila por semanas completas.",
      },
      // De abril a noviembre no hay restricción: cualquier día y cualquier cantidad de noches.
    ],
  },

  propiedades: [
    {
      id: "liptus-merluza",
      nombre: "Edificio Liptus",
      tipo: "Departamento 3 ambientes",
      zona: "Pinamar Centro",
      direccion: "De La Merluza 1122, Pinamar",
      // Coordenadas para el mapa de zona. Se sacan de Google Maps: clic derecho sobre el lugar → "copiar coordenadas".
      mapa: { lat: -37.1041868, lng: -56.8585226 },
      frase: "Planta baja con patio y parrilla, entre los pinos.",
      descripcion: [
        "Un tres ambientes luminoso en planta baja, con patio y parrilla. Está a pocas cuadras de la Avenida Bunge y a unos minutos de la playa, así que podés hacer todo caminando: la playa a la mañana, el centro a la tarde.",
        "Está pensado para parejas o familias chicas que buscan descansar: habitaciones cómodas, cocina completa para no depender de salir a comer y un living que se abre al patio para las tardes largas y las noches de asado.",
      ],
      datos: {
        huespedes: 4,
        ambientes: 3,
        dormitorios: 2,
        camas: "1 matrimonial + 2 individuales",
        banos: 2,
        superficie: 60,
        piso: "Planta baja",
        distanciaPlaya: "10 cuadras",
      },
      distribucion: [
        { espacio: "Dormitorio en suite", detalle: "Cama matrimonial, placard, ventana al patio, caja fuerte" },
        { espacio: "Dormitorio 2", detalle: "Dos camas individuales, ventana al patio" },
        { espacio: "Living comedor", detalle: "Sofá de 2 plazas, mesa para 4, Smart TV" },
        { espacio: "Cocina", detalle: "Equipación completa, horno, heladera, microondas y otros electrodomésticos" },
        { espacio: "Patio", detalle: "Parrilla, mesa y 4 sillas" },
        { espacio: "Baño en suite", detalle: "Completo, con ducha, dentro de la habitación principal" },
        { espacio: "Baño", detalle: "Completo, con ducha" },
        { espacio: "Cochera/lavadero", detalle: "Espacio privado para estacionamiento y lavado, con lavarropas y mesada" },

      ],
      comodidades: {
        "Descanso": ["Aire acondicionado frío/calor", "Calefacción", "Cortinas blackout", "Cuna a pedido"],
        "Cocina": ["Anafe eléctrico y horno", "Microondas", "Heladera con freezer", "Cafetera y pava eléctrica", "Vajilla completa", "Utensilios de cocina"],
        "Conexión": ["Wi-Fi 600 Mb", "Smart TV"],
        "Edificio": ["Ascensor", "Cochera cubierta privada", "Lavadero común", "Pileta"],
      },
      normas: {
        checkin: "Desde las 16:00",
        checkout: "Hasta las 10:00",
        estadiaMinima: "De diciembre a marzo, semanas completas de sábado a sábado (7 noches como mínimo)",
        mascotas: "No se admiten",
        fumar: "Prohibido fumar dentro de la unidad",
        fiestas: "No se permiten fiestas ni eventos",
      },
      cerca: [
        { lugar: "Playa", distancia: "10 cuadras" },
        { lugar: "Av. Bunge", distancia: "1.5 kilometros" },
        { lugar: "Supermercado", distancia: "7 cuadras" },
        { lugar: "Terminal de micros", distancia: "7 min en auto" },
      ],
      etiquetasFotos: ["Patio y parrilla", "Living comedor", "Dormitorio en suite", "Dormitorio", "Cocina", "Baño en suite", "Baño", "Frente del edificio"],
      reservas: {
        airbnb: "https://www.airbnb.com.ar/rooms/837759040884961194?guests=1&adults=1&s=67&unique_share_id=2afef204-95a9-43f7-b5fd-b47c9891bb79",
        // booking: "https://www.booking.com/",   // se activa cuando Booking apruebe las publicaciones
      },
    },

    {
      id: "mares-besugo",
      nombre: "Edificio Mares",
      tipo: "Departamento 2 ambientes con balcón",
      zona: "Pinamar Centro",
      direccion: "Del Besugo 1350, Pinamar",
      mapa: { lat: -37.1043375, lng: -56.860429 },
      frase: "Tercer piso con balcón, parrilla y cochera cubierta.",
      descripcion: [
        "Un dos ambientes en un tercer piso, con balcón y parrilla, en una de las zonas más tranquilas ya accesibles de Pinamar. Te despertás con los pájaros y a unas cuadras llegás a una playa ancha y tranquila o al centro de Pinamar.",
        "Es ideal para familias: un dormitorios, dos baños, uno en suite y un toillete, un sofa cama en el living comedor y un balcón con parrilla con vista a los pinos. Con estacionamiento privado en el edificio.",
      ],
      datos: {
        huespedes: 4,
        ambientes: 2,
        dormitorios: 1,
        camas: "1 matrimonial + 1 sofá cama",
        banos: 2,
        superficie: 50,
        piso: "Tercer piso con ascensor",
        distanciaPlaya: "10 cuadras",
      },
      distribucion: [
        { espacio: "Dormitorio principal", detalle: "Cama matrimonial, baño en suite, caja fuerte" },
        { espacio: "Living comedor", detalle: "Sofá cama, mesa para 4, Smart TV" },
        { espacio: "Cocina", detalle: "Equipada completa, horno y otros electrodomésticos, además de un lavarropas" },
        { espacio: "Patio", detalle: "Parrilla" },
        { espacio: "Baños", detalle: "Uno en suite y un toillete" },
      ],
      comodidades: {
        "Descanso": ["Aire acondicionado frío/calor", "Cuna a pedido"],
        "Cocina": ["Horno y anafe eléctrico", "Lavarropas", "Microondas", "Cafetera", "Vajilla para 4", "Utensilios de cocina"],
        "Conexión": ["Wi-Fi 600 Mb", "Smart TV en el living y en el dormitorio"],
        "Exterior": ["Balcón propio", "Parrilla", "Tender"],
        "Edificio": ["Cochera cubierta", "Ascensor", "Pileta"],
      },
      normas: {
        checkin: "Desde las 16:00",
        checkout: "Hasta las 10:00",
        estadiaMinima: "De diciembre a marzo, semanas completas de sábado a sábado (7 noches como mínimo)",
        mascotas: "No se admiten",
        fumar: "Prohibido fumar dentro de la unidad",
        fiestas: "No se permiten fiestas ni eventos",
      },
      cerca: [
        { lugar: "Playa", distancia: "10 cuadras" },
        { lugar: "Av. Bunge", distancia: "20 min caminando" },
        { lugar: "Cariló", distancia: "15 min en auto" },
      ],
      etiquetasFotos: ["Balcón y parrilla", "Living comedor", "Dormitorio principal", "Cocina", "Baño", "Entorno de pinos"],
      reservas: {
        airbnb: "https://www.airbnb.com.ar/rooms/1088037256147290223?guests=1&adults=1&s=67&unique_share_id=4638a735-2f1f-4537-8277-9330dffc706a",
        // booking: "https://www.booking.com/",   // se activa cuando Booking apruebe las publicaciones
      },
    },

    {
      id: "liptus2-cornalito",
      nombre: "Edificio Liptus 2",
      tipo: "Departamento 2 ambientes con pileta",
      zona: "Pinamar Centro",
      direccion: "Dirección a confirmar, Pinamar",
      mapa: { lat: -37.1048344, lng: -56.8620441 },
      frase: "Cerca del centro, con pileta en el edificio.",
      descripcion: [
        "Un dos ambientes a minutos a pie de la Avenida Bunge, en un edificio con pileta. Tiene la comodidad del centro, con cafés, restaurantes y paseo, y la playa a diez cuadras.",
        "Es una buena opción también fuera de temporada: tiene calefacción, buena conexión a internet y la tranquilidad de un entorno natural.",
      ],
      datos: {
        huespedes: 4,
        ambientes: 2,
        dormitorios: 1,
        camas: "1 matrimonial + 1 sofá cama",
        banos: 1,
        superficie: 42,
        piso: "Tercer piso con ascensor",
        distanciaPlaya: "10 cuadras",
      },
      distribucion: [
        { espacio: "Dormitorio", detalle: "Cama matrimonial, placard amplio, caja fuerte" },
        { espacio: "Living comedor", detalle: "Sillón de dos plazas, Smart TV" },
        { espacio: "Cocina", detalle: "Tipo americana, equipada completa" },
        { espacio: "Baño", detalle: "Completo, con ducha" },
      ],
      comodidades: {
        "Descanso": ["Aire acondicionado frío/calor", "Cuna a pedido"],
        "Cocina": ["Anafe y horno eléctrico", "Microondas", "Heladera con freezer", "Tostadora y pava eléctrica"],
        "Conexión": ["Wi-Fi 300 Mb por fibra", "Smart TV"],
        "Edificio": ["Pileta descubierta", "Ascensor", "Cochera cubierta privada"],
      },
      normas: {
        checkin: "Desde las 16:00",
        checkout: "Hasta las 10:00",
        estadiaMinima: "De diciembre a marzo, semanas completas de sábado a sábado (7 noches como mínimo)",
        mascotas: "No se admiten",
        fumar: "No se fuma adentro",
        fiestas: "No se permiten fiestas ni eventos",
      },
      cerca: [
        { lugar: "Av. Bunge", distancia: "2 cuadras" },
        { lugar: "Playa", distancia: "5 cuadras" },
        { lugar: "Supermercado", distancia: "1 cuadra" },
        { lugar: "Reserva de médanos", distancia: "10 min en auto" },
      ],
      etiquetasFotos: ["Living", "Dormitorio", "Cocina", "Baño", "Pileta del edificio", "Frente"],
      reservas: {
        airbnb: "https://www.airbnb.com.ar/rooms/1782958064403058557?guests=1&adults=1&s=67&unique_share_id=b61aebd0-2f20-4fd4-b0c5-c27fd753f83a",
        // booking: "https://www.booking.com/",   // se activa cuando Booking apruebe las publicaciones
      },
    },

    {
      // Todavía no se alquila: en el sitio aparece solo como una tarjeta,
      // sin ficha, sin datos y sin links de reserva. Cuando esté listo,
      // se le borra la línea  estado  y se completan los datos como los demás.
      id: "mares2-dorado",
      estado: "proximamente",
      nombre: "Edificio Mares 2",
      // La foto del render va en img/propiedades/mares2-dorado/1.jpg
      etiquetasFotos: ["Render"],
    },
  ],

  // Reseñas: copiá textuales las de Airbnb/Booking (con permiso o nombre de pila).
  resenas: [
    { texto: "Reseña de ejemplo: acá va lo que escribió un huésped real sobre su estadía.", autor: "Nombre del huésped", origen: "Airbnb", depto: "Edificio Alta Mar", fecha: "Enero 2026" },
    { texto: "Reseña de ejemplo: los comentarios sobre limpieza, ubicación y atención suelen ser los que más convencen.", autor: "Nombre del huésped", origen: "Booking", depto: "Edificio Los Pinos", fecha: "Febrero 2026" },
    { texto: "Reseña de ejemplo: si una reseña menciona el patio, la vista o el silencio, mejor todavía.", autor: "Nombre del huésped", origen: "Airbnb", depto: "Edificio Del Médano", fecha: "Marzo 2026" },
  ],
};
