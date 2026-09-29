# -*- coding: utf-8 -*-
"""
Carpe Diem · Pinamar — genera los archivos del logo en marca/

Arma el isologo (marca + texto) en SVG con las letras convertidas a curvas,
así se ve igual en cualquier programa aunque no tenga la tipografía Marcellus
instalada, y además exporta versiones en PNG con fondo transparente.

    python herramientas/generar-logo.py

Necesita: fonttools y pillow, y descarga la tipografía Marcellus de Google Fonts.
"""
import os, io, urllib.request
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "marca")
CACHE = os.path.join(SALIDA, "Marcellus-Regular.ttf")
URL_FUENTE = "https://fonts.gstatic.com/s/marcellus/v14/wEO_EBrOk8hQLDvIAF8FUQ.ttf"

VERDE = "#4a746e"   # verde pino de la marca
TINTA = "#3a4745"   # gris verdoso de los textos
BLANCO = "#ffffff"

os.makedirs(SALIDA, exist_ok=True)
if not os.path.exists(CACHE):
    req = urllib.request.Request(URL_FUENTE, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r, open(CACHE, "wb") as f:
        f.write(r.read())

fuente = TTFont(CACHE)
UPEM = fuente["head"].unitsPerEm
glifos = fuente.getGlyphSet()
cmap = fuente.getBestCmap()
hmtx = fuente["hmtx"]
ALTURA_MAYUSCULA = getattr(fuente["OS/2"], "sCapHeight", None) or int(UPEM * 0.7)


def camino_texto(texto, seguimiento_em=0.0):
    """Devuelve (path SVG en unidades de la fuente, ancho) con las letras en curvas."""
    seguimiento = seguimiento_em * UPEM
    x, partes = 0.0, []
    for i, c in enumerate(texto):
        nombre = cmap.get(ord(c))
        if nombre is None:
            x += UPEM * 0.3
            continue
        pen = SVGPathPen(glifos)
        glifos[nombre].draw(pen)
        d = pen.getCommands()
        if d:
            partes.append('<path transform="translate(%.1f 0)" d="%s"/>' % (x, d))
        x += hmtx[nombre][0] + (seguimiento if i < len(texto) - 1 else 0)
    return "".join(partes), x


def marca(escala, color, x=0.0, y=0.0):
    """El sol sobre el horizonte: arco + dos líneas. Dibujo base de 40 × 24."""
    return (
        '<g transform="translate(%.2f %.2f) scale(%.4f)" fill="none" stroke="%s" '
        'stroke-width="1.5" stroke-linecap="round">'
        '<path d="M8 18a12 12 0 0 1 24 0"/><path d="M2 21h36"/>'
        '<path d="M6 23.5h28" opacity=".55"/></g>' % (x, y, escala, color)
    )


# ---------- medidas comunes ----------
F1, S1 = 120.0, 0.04          # "Carpe Diem"
F2, S2 = 30.0, 0.26           # "ALQUILERES PINAMAR"
k1, k2 = F1 / UPEM, F2 / UPEM
d1, w1 = camino_texto("Carpe Diem", S1)
d2, w2 = camino_texto("ALQUILERES PINAMAR", S2)
ancho1, ancho2 = w1 * k1, w2 * k2
alto1, alto2 = ALTURA_MAYUSCULA * k1, ALTURA_MAYUSCULA * k2
ENTRE_LINEAS = 34.0
ALTO_TEXTO = alto1 + ENTRE_LINEAS + alto2
MARCA_ALTO = 96.0
ESCALA_MARCA = MARCA_ALTO / 24.0
MARCA_ANCHO = 40.0 * ESCALA_MARCA
SEPARACION = 42.0
BORDE = 16.0


def svg(ancho, alto, cuerpo, titulo):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.1f %.1f" width="%.0f" height="%.0f" '
        'role="img" aria-label="%s">\n  %s\n</svg>\n' % (ancho, alto, ancho, alto, titulo, cuerpo)
    )


def horizontal(color_marca, color_texto):
    ancho = BORDE * 2 + MARCA_ANCHO + SEPARACION + max(ancho1, ancho2)
    alto = BORDE * 2 + max(MARCA_ALTO, ALTO_TEXTO)
    cy = alto / 2
    x_texto = BORDE + MARCA_ANCHO + SEPARACION
    base1 = cy - ALTO_TEXTO / 2 + alto1
    base2 = base1 + ENTRE_LINEAS + alto2
    cuerpo = (
        marca(ESCALA_MARCA, color_marca, BORDE, cy - MARCA_ALTO / 2 - 2)
        + '<g fill="%s">' % color_texto
        + '<g transform="translate(%.2f %.2f) scale(%.5f -%.5f)">%s</g>' % (x_texto, base1, k1, k1, d1)
        + '<g transform="translate(%.2f %.2f) scale(%.5f -%.5f)">%s</g>' % (x_texto, base2, k2, k2, d2)
        + "</g>"
    )
    return svg(ancho, alto, cuerpo, "Carpe Diem Pinamar")


def vertical(color_marca, color_texto):
    ancho = BORDE * 2 + max(MARCA_ANCHO, ancho1, ancho2)
    alto = BORDE * 2 + MARCA_ALTO + 30 + ALTO_TEXTO
    cx = ancho / 2
    base1 = BORDE + MARCA_ALTO + 30 + alto1
    base2 = base1 + ENTRE_LINEAS + alto2
    cuerpo = (
        marca(ESCALA_MARCA, color_marca, cx - MARCA_ANCHO / 2, BORDE)
        + '<g fill="%s">' % color_texto
        + '<g transform="translate(%.2f %.2f) scale(%.5f -%.5f)">%s</g>' % (cx - ancho1 / 2, base1, k1, k1, d1)
        + '<g transform="translate(%.2f %.2f) scale(%.5f -%.5f)">%s</g>' % (cx - ancho2 / 2, base2, k2, k2, d2)
        + "</g>"
    )
    return svg(ancho, alto, cuerpo, "Carpe Diem Pinamar")


def isotipo(color):
    return svg(40 + 8, 24 + 8, marca(1.0, color, 4, 4), "Carpe Diem")


archivos = {
    "logo-horizontal.svg": horizontal(VERDE, TINTA),
    "logo-horizontal-blanco.svg": horizontal(BLANCO, BLANCO),
    "logo-horizontal-negro.svg": horizontal(TINTA, TINTA),
    "logo-vertical.svg": vertical(VERDE, TINTA),
    "logo-vertical-blanco.svg": vertical(BLANCO, BLANCO),
    "isotipo.svg": isotipo(VERDE),
    "isotipo-blanco.svg": isotipo(BLANCO),
}
for nombre, contenido in archivos.items():
    with open(os.path.join(SALIDA, nombre), "w", encoding="utf-8") as f:
        f.write(contenido)

# ---------- PNG con fondo transparente ----------
SS = 4  # dibuja en grande y achica, para que los bordes salgan suaves


def texto_seguido(dib, xy, texto, tipografia, seguimiento, relleno):
    x, y = xy
    for c in texto:
        dib.text((x, y), c, font=tipografia, fill=relleno, anchor="ls")
        x += tipografia.getlength(c) + seguimiento


def png(nombre, vertical_=False, color_marca=VERDE, color_texto=TINTA, ancho_final=2000):
    f1 = ImageFont.truetype(CACHE, int(F1 * SS))
    f2 = ImageFont.truetype(CACHE, int(F2 * SS))
    a1 = sum(f1.getlength(c) for c in "Carpe Diem") + S1 * F1 * SS * 9
    a2 = sum(f2.getlength(c) for c in "ALQUILERES PINAMAR") + S2 * F2 * SS * 17
    m_alto, m_ancho = MARCA_ALTO * SS, MARCA_ANCHO * SS
    alto_texto = ALTO_TEXTO * SS
    if vertical_:
        W = (BORDE * 2 * SS) + max(m_ancho, a1, a2)
        H = (BORDE * 2 * SS) + m_alto + 30 * SS + alto_texto
    else:
        W = (BORDE * 2 * SS) + m_ancho + SEPARACION * SS + max(a1, a2)
        H = (BORDE * 2 * SS) + max(m_alto, alto_texto)
    img = Image.new("RGBA", (int(W), int(H)), (0, 0, 0, 0))
    dib = ImageDraw.Draw(img)
    grosor = max(2, int(1.5 * ESCALA_MARCA * SS))
    if vertical_:
        mx, my = (W - m_ancho) / 2, BORDE * SS
        base1 = BORDE * SS + m_alto + 30 * SS + ALTURA_MAYUSCULA * (F1 / UPEM) * SS
        x1, x2 = (W - a1) / 2, (W - a2) / 2
    else:
        mx, my = BORDE * SS, (H - m_alto) / 2 - 2 * SS
        base1 = (H - alto_texto) / 2 + ALTURA_MAYUSCULA * (F1 / UPEM) * SS
        x1 = x2 = BORDE * SS + m_ancho + SEPARACION * SS
    base2 = base1 + (ENTRE_LINEAS + ALTURA_MAYUSCULA * (F2 / UPEM)) * SS
    e = ESCALA_MARCA * SS
    dib.arc([mx + 8 * e, my + 6 * e, mx + 32 * e, my + 30 * e], 180, 360, fill=color_marca, width=grosor)
    dib.line([mx + 2 * e, my + 21 * e, mx + 38 * e, my + 21 * e], fill=color_marca, width=grosor)
    dib.line([mx + 6 * e, my + 23.5 * e, mx + 34 * e, my + 23.5 * e], fill=color_marca + "8c", width=grosor)
    texto_seguido(dib, (x1, base1), "Carpe Diem", f1, S1 * F1 * SS, color_texto)
    texto_seguido(dib, (x2, base2), "ALQUILERES PINAMAR", f2, S2 * F2 * SS, color_texto)
    img = img.resize((ancho_final, max(1, round(ancho_final * H / W))), Image.LANCZOS)
    img.save(os.path.join(SALIDA, nombre))


png("logo-horizontal.png")
png("logo-horizontal-blanco.png", color_marca=BLANCO, color_texto=BLANCO)
png("logo-vertical.png", vertical_=True, ancho_final=1400)
png("logo-vertical-blanco.png", vertical_=True, color_marca=BLANCO, color_texto=BLANCO, ancho_final=1400)

print("Archivos en marca/:", ", ".join(sorted(os.listdir(SALIDA))))
