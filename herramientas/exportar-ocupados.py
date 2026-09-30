# -*- coding: utf-8 -*-
"""
Carpe Diem · Pinamar — copia guardada de los calendarios

Lee los links iCal de ical/config.php, los descarga y deja las fechas
ocupadas de cada departamento en ical/ocupados-<id>.json.

    python herramientas/exportar-ocupados.py

Para qué sirve: en el hosting, el calendario del sitio se actualiza solo con
ical/calendario.php. Estos archivos son la copia de respaldo que el sitio usa
si ese PHP no está disponible (por ejemplo, en la vista previa o en un hosting
sin PHP). Al ser una copia, queda congelada: hay que volver a generarla cuando
cambian las reservas.
"""
import json, os, re, sys, urllib.request
from datetime import date, datetime, timedelta

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(RAIZ, "ical", "config.php")
HOY = date.today().isoformat()


def fuentes_por_departamento():
    cfg = open(CONFIG, encoding="utf-8").read()
    cfg = cfg.split("return [", 1)[1]
    salida = {}
    for dep, cuerpo in re.findall(r"'([a-z0-9\-]+)' => \[(.*?)\]", cfg, re.S):
        links = re.findall(r"'([^']+)'\s*=> '(https?://[^']+)'", cuerpo)
        if links:
            salida[dep] = links
    return salida


def fecha(valor):
    m = re.search(r"(\d{4})(\d{2})(\d{2})", valor)
    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else None


def ocupados_de(ics):
    reservas = []
    ics = re.sub(r"\r\n[ \t]", "", ics)  # líneas partidas del formato iCal
    for ev in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", ics, re.S):
        a = re.search(r"^DTSTART[^:]*:(.+)$", ev, re.M)
        if not a:
            continue
        desde = fecha(a.group(1).strip())
        b = re.search(r"^DTEND[^:]*:(.+)$", ev, re.M)
        hasta = fecha(b.group(1).strip()) if b else None
        if not desde:
            continue
        if not hasta or hasta <= desde:
            hasta = (datetime.strptime(desde, "%Y-%m-%d") + timedelta(days=1)).date().isoformat()
        if hasta < HOY:
            continue  # reservas que ya pasaron
        reservas.append({"desde": desde, "hasta": hasta})
    return sorted(reservas, key=lambda r: r["desde"])


total = 0
for dep, links in fuentes_por_departamento().items():
    reservas, usadas = [], []
    for nombre, url in links:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CarpeDiemPinamar/1.0"})
            ics = urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "replace")
        except Exception as ex:
            print(f"  ! {dep} [{nombre}]: no se pudo descargar ({ex})")
            continue
        usadas.append(nombre)
        reservas += ocupados_de(ics)
    datos = {
        "configurado": bool(usadas),
        "instantanea": True,
        "fuentes": usadas,
        "actualizado": datetime.now().astimezone().isoformat(timespec="minutes"),
        "ocupados": reservas,
    }
    cuerpo = json.dumps(datos, ensure_ascii=False, indent=2)

    # .json: lo lee el sitio publicado en un hosting
    with open(os.path.join(RAIZ, "ical", f"ocupados-{dep}.json"), "w", encoding="utf-8") as f:
        f.write(cuerpo)

    # .js: lo lee el sitio abierto con doble clic, donde el navegador no deja leer archivos
    with open(os.path.join(RAIZ, "ical", f"ocupados-{dep}.js"), "w", encoding="utf-8") as f:
        f.write("window.CARPE_DIEM_OCUPADOS = window.CARPE_DIEM_OCUPADOS || {};\n"
                + f'window.CARPE_DIEM_OCUPADOS["{dep}"] = {cuerpo};\n')
    total += 1
    print(f"  · {dep}: {len(reservas)} reserva(s) desde {', '.join(usadas) or 'ninguna fuente'}")

print(f"Listo: {total} archivo(s) en ical/")
