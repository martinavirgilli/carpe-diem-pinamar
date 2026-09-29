# -*- coding: utf-8 -*-
"""
Carpe Diem · Pinamar — deja las fotos livianas para la web

Las fotos que salen del celular o de la cámara son enormes (3840 x 2160) y en un
celular con datos tardan una eternidad. Esto las achica a un tamaño que se ve
igual de bien en pantalla y pesa mucho menos.

    python herramientas/optimizar-fotos.py

Los originales NO se pierden: se mueven a img/originales/, con la misma
estructura de carpetas. Esa carpeta no se sube al sitio ni al repositorio.
Volver a correrlo no hace nada: las fotos ya optimizadas se saltean.
"""
import os, shutil, sys
from PIL import Image, ImageOps

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # la consola de Windows no habla unicode

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(RAIZ, "img")
ORIGINALES = os.path.join(IMG, "originales")

LADO_MAXIMO = 1800      # px del lado más largo: alcanza para pantallas grandes
CALIDAD = 82            # jpeg: por arriba de 85 casi no se nota y pesa el doble

def fotos():
    for carpeta, _, archivos in os.walk(IMG):
        if os.path.commonpath([os.path.abspath(carpeta), ORIGINALES]) == ORIGINALES:
            continue
        for archivo in archivos:
            if archivo.lower().endswith((".jpg", ".jpeg", ".png")):
                yield os.path.join(carpeta, archivo)

total_antes = total_despues = tocadas = 0

for ruta in fotos():
    peso_antes = os.path.getsize(ruta)
    with Image.open(ruta) as im:
        ancho, alto = im.size
        if max(ancho, alto) <= LADO_MAXIMO:            # ya está en tamaño web: no se vuelve a comprimir
            total_antes += peso_antes
            total_despues += peso_antes
            continue

        relativa = os.path.relpath(ruta, IMG)
        respaldo = os.path.join(ORIGINALES, relativa)
        os.makedirs(os.path.dirname(respaldo), exist_ok=True)
        if not os.path.exists(respaldo):
            shutil.copy2(ruta, respaldo)

        im = ImageOps.exif_transpose(im)          # respeta cómo estaba rotada la foto
        im.thumbnail((LADO_MAXIMO, LADO_MAXIMO), Image.LANCZOS)
        im.convert("RGB").save(ruta, "JPEG", quality=CALIDAD, optimize=True, progressive=True)

    peso_despues = os.path.getsize(ruta)
    total_antes += peso_antes
    total_despues += peso_despues
    tocadas += 1
    print(f"  {relativa:44} {ancho}x{alto} {peso_antes/1024:6.0f} KB  ->  {im.size[0]}x{im.size[1]} {peso_despues/1024:6.0f} KB")

mb = lambda n: f"{n/1024/1024:.1f} MB"
print(f"\n{tocadas} foto(s) optimizadas. El sitio pasa de {mb(total_antes)} a {mb(total_despues)} en fotos.")
if tocadas:
    print(f"Los originales quedaron en img/originales/")
