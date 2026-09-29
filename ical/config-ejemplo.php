<?php
/* Copia este archivo como  config.php  y pegá ahí los links iCal.
   config.php no se sube al repositorio (ver .gitignore) porque esos links
   dan acceso de lectura a todo el calendario.
   En Netlify no se usa: los links van como variables de entorno ICAL_<ID>. */

return [
  'liptus-merluza'    => ['Google Calendar' => '', 'Airbnb' => '', 'Booking' => ''],
  'mares-besugo'      => ['Google Calendar' => '', 'Airbnb' => '', 'Booking' => ''],
  'liptus2-cornalito' => ['Google Calendar' => '', 'Airbnb' => '', 'Booking' => ''],
  'mares2-dorado'     => ['Google Calendar' => '', 'Airbnb' => '', 'Booking' => ''],
];
