<?php
/* ==========================================================================
   Carpe Diem · Pinamar — sincronización de calendarios
   Lee los calendarios iCal de Airbnb/Booking configurados en config.php,
   junta las fechas ocupadas y las devuelve en JSON para js/app.js.
   Guarda una copia por 20 minutos para no consultar a Airbnb/Booking en
   cada visita. No hace falta editar este archivo.
   ========================================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const CACHE_MINUTOS = 20;

$config = require __DIR__ . '/config.php';
$id = isset($_GET['id']) ? preg_replace('/[^a-z0-9\-]/', '', strtolower($_GET['id'])) : '';

if ($id === '' || !isset($config[$id])) {
  http_response_code(404);
  echo json_encode(['configurado' => false, 'error' => 'Departamento desconocido']);
  exit;
}

$fuentes = array_filter($config[$id], fn($url) => is_string($url) && trim($url) !== '');
if (!$fuentes) {
  echo json_encode(['configurado' => false]);
  exit;
}

$dirCache = __DIR__ . '/cache';
if (!is_dir($dirCache)) @mkdir($dirCache, 0755);
$archivoCache = "$dirCache/$id.json";
if (is_file($archivoCache) && (time() - filemtime($archivoCache)) < CACHE_MINUTOS * 60) {
  readfile($archivoCache);
  exit;
}

function descargar(string $url): ?string {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 12,
      CURLOPT_USERAGENT => 'CarpeDiemPinamar/1.0',
    ]);
    $txt = curl_exec($ch);
    $ok = curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
    curl_close($ch);
    return ($ok && $txt) ? $txt : null;
  }
  $ctx = stream_context_create(['http' => ['timeout' => 12, 'header' => "User-Agent: CarpeDiemPinamar/1.0\r\n"]]);
  $txt = @file_get_contents($url, false, $ctx);
  return $txt ?: null;
}

function fechaIcal(string $valor): ?string {
  // Acepta 20260103, 20260103T140000Z, etc.
  if (!preg_match('/(\d{4})(\d{2})(\d{2})/', $valor, $m)) return null;
  return "$m[1]-$m[2]-$m[3]";
}

$ocupados = [];
$usadas = [];
foreach ($fuentes as $nombre => $url) {
  $ics = descargar($url);
  if ($ics === null) continue;
  $usadas[] = $nombre;
  $ics = preg_replace("/\r\n[ \t]/", '', $ics); // líneas partidas
  preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $ics, $eventos);
  foreach ($eventos[1] as $ev) {
    if (!preg_match('/^DTSTART[^:]*:(.+)$/m', $ev, $a)) continue;
    $desde = fechaIcal(trim($a[1]));
    $hasta = preg_match('/^DTEND[^:]*:(.+)$/m', $ev, $b) ? fechaIcal(trim($b[1])) : null;
    if (!$desde) continue;
    if (!$hasta || $hasta <= $desde) $hasta = date('Y-m-d', strtotime("$desde +1 day"));
    if ($hasta < date('Y-m-d')) continue; // reservas pasadas
    $ocupados[] = ['desde' => $desde, 'hasta' => $hasta];
  }
}

$respuesta = json_encode([
  'configurado' => count($usadas) > 0,
  'fuentes'     => $usadas,
  'actualizado' => date('c'),
  'ocupados'    => $ocupados,
], JSON_UNESCAPED_UNICODE);

if ($usadas) @file_put_contents($archivoCache, $respuesta);
echo $respuesta;
