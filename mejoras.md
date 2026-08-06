# mejoras.md — Casa Palmera

> Plan de correcciones. Revisión hecha sobre el código real
> (`index.html`, `assets/css/styles.css`, `assets/js/script.js`),
> el sitio en Vercel y capturas de escritorio.
> Agosto 2026

---

## Contexto: esto es una demo

El proyecto **no va a producción**. Es una pieza de entrega para prácticas profesionales: se presenta, se revisa y se evalúa. El lugar existe y el contenido es real, pero la página no va a operar como el sitio del negocio.

Eso cambia por completo las prioridades.

**Qué se evalúa en realidad:** alguien abre el link, hace scroll cinco minutos, le pica a los enlaces del nav y probablemente abre el código. En ese recorrido, cada detalle roto pesa mucho más que en un sitio real, porque el acabado *es* lo único que se está midiendo.

### Qué cambió respecto a la versión anterior de este plan

| Tarea | Antes | Ahora | Por qué |
|---|---|---|---|
| Verificar dominio, `robots.txt`, sitemap | Crítico | **No aplica** | No hay sitio en producción que indexar |
| Google Business Profile, Facebook, analítica | Alto | **Fuera de alcance** | Son canales de un negocio operando |
| Sesión de fotos de 2 h | La tarea #1 | **Opcional** | El 80% del beneficio está en descartar las malas, no en tomar nuevas |
| Bugs visibles en el recorrido | Alto | **Máxima prioridad** | Es exactamente lo que va a ver quien revisa |
| Contraste del CTA | Medio | **Alto** | Si corren Lighthouse o axe, sale |
| README | Punto final de la lista | **La pieza principal de la entrega** | Es donde vive el criterio que el código no comunica |
| Total estimado | ~10 h | **~4 h** | |

---

## Diagnóstico

El proyecto está bien construido. Cosas ya resueltas que la mayoría de las landings no tienen:

- Fuentes auto-hospedadas con subset, `font-display: swap` y `preload`
- Tema claro/oscuro con script inline en `<head>` para evitar el parpadeo
- Loop de scroll único con `requestAnimationFrame` y lecturas de layout cacheadas fuera del tick
- `IntersectionObserver` con stagger automático entre hermanos
- Lightbox con `<dialog>` nativo, teclado y cierre por backdrop
- `prefers-reduced-motion` respetado sección por sección, no solo en el reset
- Comentarios que explican el *por qué* (el de `min-width: 0` en el hero es de manual)
- Contenido real: precio, capacidad y reglamento salen del contrato de arrendamiento

Lo que falta es rematar. Cuatro bugs, un fallo de contraste, y curaduría de fotos.

### Correcciones a mi revisión anterior

Escrita sin ver el código, tres puntos estaban mal:

| Decía | Lo correcto |
|---|---|
| "Falta `aria-hidden` en la capa duplicada del H1" | Ya está puesto. La duplicación que vi era del extractor de texto, no del DOM |
| "Eliminar el efecto de dos capas del título" | El concepto se queda. Falla la ejecución — ver 1.1 |
| "Bajar la opacidad de la trama de equipal" | Ya está en `0.08`. El problema es el color de fondo `--vara` |

---

## P0 — El recorrido de cinco minutos

Todo lo que se topa quien abre el link y hace scroll.

### 0.1 Fotos rotadas 90°

Varias imágenes de la galería salen de lado. Al convertir de HEIC a WebP se eliminaron los metadatos EXIF sin aplicar antes la rotación: el visor de macOS lee el EXIF, el navegador no.

```bash
# -auto-orient aplica la rotación ANTES de que -strip borre los metadatos
magick input.HEIC -auto-orient -strip -quality 82 output.webp

# Lote con los 3 anchos del srcset
for f in originales/*.HEIC; do
  base=$(basename "$f" .HEIC)
  for w in 640 1280 1920; do
    magick "$f" -auto-orient -strip -resize ${w}x -quality 82 \
      "assets/images/galeria/${base}-${w}.webp"
  done
done
```

- [ ] Reconvertidas todas con `-auto-orient`
- [ ] Verificadas una por una **en el navegador**, no en el Finder

---

### 0.2 Curar la galería a 8 fotos

De las 12 actuales hay al menos tres que restan: la roja borrosa, la nocturna donde no se distingue nada, y las de ángulo confuso.

**Criterio:** si en dos segundos no se entiende qué se está viendo, se va.

Ocho buenas convencen más que doce donde tres son malas. Y en una demo, una foto mala se lee como falta de criterio, no como falta de material.

Al quitarlas hay que renumerar los `data-lightbox-abrir` — el JS usa ese índice contra el array `fuentes`.

- [ ] Reducida a 8
- [ ] `data-lightbox-abrir` renumerados de 0 a 7
- [ ] Lightbox probado en las 8

---

### 0.3 El HTML estático dice "0 personas" y "$0"

```html
<!-- actual -->
<li><span data-contador="50">0</span> personas máx.</li>
<p class="precio__monto">$<span data-contador="3500">0</span>…</p>
```

Si quien revisa abre "ver código fuente" —cosa probable— ve una terraza de cero personas a cero pesos. También pasa si el JS va lento.

El JS ya está bien. Solo cambia el HTML:

```html
<li><span data-contador="50">50</span> personas máx.</li>
<p class="precio__monto">$<span data-contador="3500">3,500</span><span class="precio__moneda">MXN / día</span></p>
```

El observer sobreescribe el texto al animar, así que el valor inicial no estorba.

- [ ] Valores reales en el HTML
- [ ] Probado con JS desactivado en DevTools

---

### 0.4 Falta `scroll-margin-top`

Al usar los anclas del nav, los títulos de sección quedan tapados por el header sticky. Es de las primeras cosas que alguien va a probar.

Ya tienes `html { scroll-behavior: smooth }` y el override de reduced-motion. Falta el margen:

```css
/* En la sección 3. BASE */
section[id] { scroll-margin-top: 5.5rem; }

@media (min-width: 640px) {
  section[id] { scroll-margin-top: 6.5rem; }
}
```

- [ ] Agregado
- [ ] Probados los 4 enlaces en móvil y escritorio

---

### 0.5 `.btn--cta` no pasa contraste WCAG

`--cuero: #C67228` con texto blanco da aproximadamente **3.57:1**. El mínimo para texto normal es 4.5:1.

El umbral de "texto grande" es 18.66px en negrita; tu `--paso-0` llega máximo a `1.125rem` = **18px**. Queda 0.66px por debajo, así que se evalúa como texto normal y no pasa.

Ya identificaste esto para `.btn--small` (usa `--cuero-oscuro`, ~5.08:1). Falta llevarlo al botón principal — y es el elemento más usado de toda la página.

```css
.btn--cta {
  background: var(--cuero-oscuro);   /* 5.08:1 con blanco */
  color: var(--blanco);
  box-shadow: var(--sombra);
}
.btn--cta:hover { background: #8A4F18; }

/* --cuero sí pasa 3:1 como texto grande: --paso-1 en negrita supera 18.66px */
.btn--large {
  padding: 1.1em 2.25em;
  font-size: var(--paso-1);
  background: var(--cuero);
}
.btn--large:hover { background: var(--cuero-oscuro); }
```

Ojo con la cascada: `.btn--cta` y `.btn--large` ahora pelean por `background`. Verificar que `.btn--large.btn--cta` termine con el color correcto.

**Revisar también:** `--panel: #C9EEF7` con `--texto: #0B6E8C` da ~4.70:1. Pasa, pero apenas.

- [ ] `.btn--cta` corregido
- [ ] Verificado en WebAIM, en claro y oscuro

---

### 0.6 Canonical y OG apuntan a un dominio que no existe

```html
<link rel="canonical" href="https://casapalmera.mx/">
<meta property="og:image" content="https://casapalmera.mx/assets/images/og/og-image.jpg">
```

**Si le mandas el link a tu jefe por WhatsApp o Slack, la preview sale sin imagen.** Es el primer contacto con tu trabajo y se ve mal por una razón que no tiene nada que ver con la calidad de la página.

Cámbialos a la URL real de Vercel:

```html
<link rel="canonical" href="https://landing-rentas.vercel.app/">
<meta property="og:url" content="https://landing-rentas.vercel.app/">
<meta property="og:image" content="https://landing-rentas.vercel.app/assets/images/og/og-image.jpg">
<meta name="twitter:image" content="https://landing-rentas.vercel.app/assets/images/og/og-image.jpg">
```

Y lo mismo en el JSON-LD (`image` y `url`).

- [ ] URLs actualizadas en canonical, OG, Twitter y JSON-LD
- [ ] `og-image.jpg` existe y abre directo
- [ ] Pesa menos de 300 KB
- [ ] **Link pegado en un WhatsApp real y la tarjeta carga con imagen**

---

## P1 — Percepción visual

### 1.1 El efecto del título: arreglarlo, no quitarlo

**El concepto se queda.** Lo que falla es que la ejecución actual no lee como refracción, lee como error de renderizado.

```css
/* actual */
.hero__title-line--bottom {
  opacity: 0.45;                              /* → se ve gris, no sumergido */
  transform: translateY(6px) scaleY(1.06);    /* → desplaza hacia abajo */
  transform-origin: top;                      /* → el scaleY empuja MÁS abajo */
  filter: blur(0.5px);
}
```

Tres problemas encadenados:

1. **El desplazamiento es vertical.** La refracción real desplaza **horizontalmente**. Un corte horizontal con offset vertical lee como "se descuadró", no como "está bajo el agua".
2. **`translateY(6px)` + `scaleY(1.06)` con origen arriba se suman** a ~10px de offset. Demasiado; abre una separación visible.
3. **`opacity: 0.45` lo vuelve gris.** El agua tiñe, no desatura. Un objeto sumergido se ve del color del agua, no descolorido.

**Fix:**

```css
.hero__title {
  position: relative;
  font-size: var(--paso-5);
  color: var(--blanco);
  line-height: 0.95;
  isolation: isolate;
}

.hero__title-line { display: block; }

.hero__title-line--top {
  clip-path: inset(0 0 50% 0);
}

.hero__title-line--bottom {
  position: absolute;
  inset: 0;
  clip-path: inset(50% 0 0 0);
  color: var(--reflejo);          /* teñido por el agua, no gris */
  opacity: 0.95;
  transform: translateX(5px) scaleX(1.02);
  transform-origin: center;
  animation: refraccion 5s ease-in-out infinite alternate;
}

/* La ondulación es lo que vuelve legible el efecto: el ojo entiende
   "agua en movimiento" antes que "texto mal alineado". */
@keyframes refraccion {
  0%   { transform: translateX(5px)  scaleX(1.015); }
  50%  { transform: translateX(-2px) scaleX(1.03); }
  100% { transform: translateX(4px)  scaleX(1.01); }
}

/* Línea de flotación explícita: hace que el corte se lea intencional */
.hero__title::after {
  content: "";
  position: absolute;
  left: -1.5%;
  right: -1.5%;
  top: 50%;
  height: 2px;
  transform: translateY(-1px);
  background: linear-gradient(90deg,
    transparent,
    rgb(255 255 255 / 0.9) 20%,
    rgb(255 255 255 / 0.9) 80%,
    transparent);
  filter: blur(0.4px);
  pointer-events: none;
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .hero__title-line--bottom {
    animation: none;
    transform: translateX(4px) scaleX(1.02);
  }
}
```

**El efecto necesita fondo oscuro para existir.** En la captura, la mitad de arriba cae sobre azulejo oscuro (se lee) y la de abajo sobre agua clara (desaparece). Ninguna cantidad de CSS arregla eso — por eso 1.1 y 1.2 van juntos.

```css
.hero__texto { position: relative; }

.hero__texto::before {
  content: "";
  position: absolute;
  inset: -2rem -3rem;
  z-index: -1;
  background: radial-gradient(
    ellipse at 30% 50%,
    rgb(7 36 48 / 0.72) 0%,
    rgb(7 36 48 / 0.45) 45%,
    transparent 75%
  );
  pointer-events: none;
}
```

- [ ] Desplazamiento vertical → horizontal
- [ ] Capa de abajo teñida en vez de desaturada
- [ ] Línea de flotación agregada
- [ ] Scrim local detrás del texto
- [ ] Probado sobre la foto de hero nueva

---

### 1.2 Cambiar la foto del hero

`alberca-dia-1280.webp` es una toma vertical del azulejo y el borde, en ángulo confuso y sin contraste. No se entiende qué se está viendo, y además rompe el efecto del título.

**La foto correcta ya está en tu galería:** `galeria-12-alberca-jardin-dia` — alberca con cascada, palmeras, cielo azul. Se entiende el lugar de inmediato y tiene zonas oscuras donde el texto se lee.

Y refuerza el scrim global, que ahorita es muy suave arriba:

```css
.hero__scrim {
  background: linear-gradient(
    105deg,
    rgb(7 36 48 / 0.70) 0%,
    rgb(7 36 48 / 0.40) 45%,
    rgb(10 40 55 / 0.15) 75%,
    rgb(10 40 55 / 0.45) 100%
  );
}

@media (max-width: 899px) {
  .hero__scrim {
    background: linear-gradient(
      180deg,
      rgb(7 36 48 / 0.55) 0%,
      rgb(7 36 48 / 0.35) 40%,
      rgb(10 40 55 / 0.75) 100%
    );
  }
}
```

- [ ] Foto reemplazada
- [ ] Scrim reforzado
- [ ] `<link rel="preload">` del `<head>` actualizado al nombre nuevo
- [ ] Contraste del H1 verificado en móvil

---

### 1.3 Romper el grid de la galería

Con 8 fotos, el grid uniforme a `aspect-ratio: 4/3` sigue leyéndose a catálogo. Que la mejor foto sea la más grande cambia la percepción más que cualquier otro ajuste de CSS.

```css
.galeria__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 150px;
  gap: 0.6rem;
}

.galeria__item {
  position: relative;
  border-radius: var(--radio);
  overflow: hidden;
  aspect-ratio: auto;      /* el grid manda ahora */
  min-height: 44px;
}

.galeria__item:nth-child(1) { grid-column: span 2; grid-row: span 2; }

@media (min-width: 720px) {
  .galeria__grid {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 190px;
    gap: 0.85rem;
  }
  .galeria__item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
  .galeria__item:nth-child(6) { grid-column: span 2; }
}
```

**Y corregir los `sizes`.** Varios declaran `(min-width: 900px) 50vw` pero renderizan a 25vw en el grid de 4 columnas: está descargando imágenes del doble del tamaño necesario. Con el layout nuevo:

```html
<!-- item 1 y 6: ocupan 2 de 4 columnas -->
sizes="(min-width: 720px) 50vw, 100vw"

<!-- los demás: 1 de 4 columnas -->
sizes="(min-width: 720px) 25vw, 50vw"
```

- [ ] Grid asimétrico
- [ ] `sizes` corregidos según el ancho real de render
- [ ] Probado en 375px

---

### 1.4 El fondo `--vara` de la sección Precio

La textura ya está bien calibrada en `0.08`. **El problema es el fondo:** `--vara: #F4E4C4` pinta la sección entera de arena, y ese amarillo no pertenece a la paleta de agua.

**Opción A (recomendada):** fondo neutro, la trama se queda como acento.
```css
.precio { background: var(--bg); }
.precio__textura { color: var(--cuero); opacity: 0.06; }
```

**Opción B:** conservar el tono cálido pero mucho más lavado.
```css
--vara: #FBF6EC;   /* apenas un tinte, no un color */
```

Lo mismo aplica al gradiente de `.contacto`. En modo oscuro `--vara: #3A2818` sí funciona; no lo toques.

- [ ] Fondo de Precio resuelto
- [ ] Gradiente de Contacto revisado
- [ ] Verificado en modo oscuro

---

### 1.5 La sección Precio desperdicia el 60% del ancho

`.precio__card` tiene `max-width: 460px` y queda sola a la izquierda.

```css
.precio__contenido {
  display: grid;
  grid-template-columns: minmax(300px, 460px) 1fr;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}
.precio__foto {
  border-radius: var(--radio);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  box-shadow: var(--sombra);
}
@media (max-width: 900px) {
  .precio__contenido { grid-template-columns: 1fr; }
  .precio__foto { display: none; }
}
```

Meter ahí la foto del lugar montado para evento.

- [ ] Resuelto

---

## P2 — El README es la entrega

En una demo, el README no es documentación: **es la pieza que se evalúa junto con el código.** Es donde vive el criterio que el código solo no comunica. Casi nadie lo hace, y por eso pesa tanto.

### Estructura

```markdown
# Casa Palmera

Landing page para renta por día de una terraza con alberca
en Zacoalco de Torres, Jalisco.

🔗 https://landing-rentas.vercel.app

## El problema

[Negocio real. Qué necesitaba: convertir visitas en consultas
por WhatsApp. Contenido sacado del contrato de arrendamiento real.]

## Decisiones de diseño

- Por qué el hero abre con la alberca y no con el nombre
- Por qué el orden de secciones sigue el orden en que la gente pregunta
- Por qué el concepto es "agua y equipal" — el equipal es la
  artesanía de Zacoalco, ~450 familias viven de fabricarlos
- Por qué el efecto del título cambió de desplazamiento vertical
  a horizontal

## Decisiones técnicas

- **Sin framework.** Una landing estática no necesita build step.
  Menos peso, menos superficie de error, despliegue directo.
- **Script de tema inline en `<head>`.** Si esperara al `script.js`
  con `defer`, la página parpadearía en claro antes de cambiar a oscuro.
- **Lecturas de layout cacheadas fuera del loop de scroll.** Leer
  `scrollHeight` en cada tick fuerza un reflow y traba el scroll.
- **WhatsApp en vez de formulario con backend.** Sitio estático, y
  en México WhatsApp convierte mejor que un formulario para este público.
- **`<dialog>` y `<details>` nativos** para lightbox y FAQ: traen
  focus trap y accesibilidad de fábrica, sin librerías.

## Accesibilidad

- HTML semántico, un solo `<h1>`, jerarquía sin brincos
- Contraste verificado contra WCAG (4.5:1 normal, 3:1 grande)
- `:focus-visible` propio, navegable 100% con teclado
- `prefers-reduced-motion` respetado sección por sección
- Skip link, `alt` descriptivos, áreas táctiles de 44px

## Rendimiento

[Screenshot de Lighthouse]

- WebP con `srcset` de 3 anchos y `sizes` según ancho real de render
- Fuentes auto-hospedadas, subset latino, `preload` + `font-display: swap`
- Sin dependencias externas

## Alcance

Se resolvió como single-page estática porque el objetivo es una sola
conversión. Una versión de producción sumaría panel de disponibilidad,
galería administrable, backend de reservas, y separación en componentes.

## Correr en local

python3 -m http.server 8000
```

**La sección de alcance importa.** Responde por adelantado el "¿por qué nomás una landing?" y demuestra que distingues entre lo que el proyecto pide y lo que un sistema completo pediría. Eso es exactamente lo que se mide cuando alguien dice que va a ver el nivel de cada quien.

- [ ] README escrito
- [ ] Screenshot de Lighthouse incluido
- [ ] Sección de alcance escrita
- [ ] Commits con mensajes claros (nada de "cambios", "fix2", "asdf")

---

## P3 — Si sobra tiempo

Nada de aquí es necesario para la entrega.

### 3.1 El formulario del hero flota constantemente

```css
.hero__formulario { animation: flotar 7s ease-in-out infinite; }
```

Es un blanco en movimiento del que hay que atinar un campo. El reset lo apaga bajo `prefers-reduced-motion`, pero la mayoría no tiene esa preferencia activada.

```css
.hero__formulario:has(:focus-within) { animation-play-state: paused; }
```

O quitar el loop y dejar solo una entrada al cargar.

### 3.2 El `backdrop-filter` del nav no hace nada

Con `background: var(--bg)` opaco, el blur no tiene qué difuminar.

```css
.nav {
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
@supports not (backdrop-filter: blur(1px)) {
  .nav { background: var(--bg); }
}
```

### 3.3 Conectar el toggle de tema a la galería

Mostrar fotos de día en modo claro y de noche en modo oscuro. Vuelve el switch una decisión de producto en vez de un adorno.

```css
:root[data-theme="light"] .galeria__item[data-cuando="noche"],
:root[data-theme="dark"]  .galeria__item[data-cuando="dia"] {
  display: none;
}
```

**Rompe el lightbox.** El array `fuentes` se arma una vez con todos los botones; al ocultar la mitad, los índices se desincronizan. Hay que reconstruirlo al abrir:

```js
const visibles = () => botones.filter((b) => b.offsetParent !== null);

botones.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lista = visibles();
    fuentes = lista.map((b) => {
      const img = b.querySelector('img');
      return { src: img.currentSrc || img.src, alt: img.alt };
    });
    mostrar(lista.indexOf(btn));
    dialogo.showModal();
  });
});
```

### 3.4 Sesión de fotos al atardecer

Si el tiempo alcanzara, sigue siendo lo que más mejoraría la página. Sábado entre 6:00 y 7:15 p.m., horizontal, cámara nivelada, encuadre limpio. Celular está bien; el problema nunca fue la cámara.

Para una demo, sin embargo, curar las que ya hay da la mayor parte del beneficio.

### 3.5 Detalles menores

- `will-change: transform` permanente en `.hero__media img` mantiene una capa de composición viva toda la sesión
- `.lightbox` está declarado en dos bloques separados; conviene unificarlo
- `.btn--outline:hover` usa `color: var(--bg)`, pero dentro de `.llegar__panel` el fondo es `--panel`
- Escala tipográfica: `--paso-3` arranca en 2rem contra 1rem de cuerpo. En móvil se siente tímido; subirlo a `2.25rem` ayuda
- Facade para el iframe del mapa (ya tiene `loading="lazy"`, que mitiga bastante)

---

## Fuera de alcance

Estaba en la versión anterior de este plan. No aplica a una demo:

- Conectar `casapalmera.mx` y configurar DNS
- `robots.txt` y `sitemap.xml`
- Google Business Profile y Search Console
- Facebook Page y publicación en grupos locales
- Vercel Analytics y medición de conversión
- Cal.com para disponibilidad real

Vale la pena **mencionarlo en el README**, en la sección de alcance: demuestra que entiendes el negocio completo aunque el proyecto no lo implemente.

---

## Orden de ejecución

| # | Tarea | Tiempo |
|---|---|---|
| 1 | Fotos con `-auto-orient` | 30 min |
| 2 | Curar galería a 8 y renumerar índices | 20 min |
| 3 | Contadores con valor real en el HTML | 10 min |
| 4 | `scroll-margin-top` | 5 min |
| 5 | Contraste de `.btn--cta` | 15 min |
| 6 | Canonical, OG y JSON-LD a la URL de Vercel | 5 min |
| 7 | Afinar el efecto del título | 30 min |
| 8 | Foto de hero + scrim | 25 min |
| 9 | Grid asimétrico y `sizes` | 45 min |
| 10 | Fondo de Precio y vacío de la sección | 30 min |
| 11 | Lighthouse + screenshot | 30 min |
| 12 | **README** | 45 min |

**Total: ~4 horas.** Los puntos 1 a 6 suman menos de dos horas y quitan todo lo que se ve roto.

---

## Checklist final

**Antes de mandar el link**
- [ ] Ninguna foto de lado
- [ ] Los 4 enlaces del nav caen donde deben
- [ ] Sin errores en consola
- [ ] Se ve bien en 320px, 375px, 768px, 1440px
- [ ] Probado en modo claro **y** oscuro, sección por sección
- [ ] Probado en Safari (`clip-path`, `color-mix`, `:has()` se portan distinto)
- [ ] `prefers-reduced-motion` activado y revisada la página completa
- [ ] Navegación completa con Tab, foco siempre visible
- [ ] Lighthouse 95+ → screenshot guardado
- [ ] HTML validado en validator.w3.org
- [ ] JSON-LD validado en Rich Results Test
- [ ] Link pegado en WhatsApp y la tarjeta carga con imagen

**Entrega**
- [ ] README con decisiones, Lighthouse y alcance
- [ ] Repo público y ordenado, sin archivos sueltos ni `.DS_Store`
- [ ] Commits con mensajes claros
- [ ] URL de Vercel funcionando

---

## Para la revisión

Decisiones que conviene poder explicar, porque son criterio y no accidente:

1. **Por qué no hay framework.** Una landing estática no necesita build step; sin él hay menos peso y menos que se rompa.
2. **Por qué el script de tema va inline en el `<head>`.** Con `defer` la página parpadearía en claro antes de cambiar a oscuro.
3. **Por qué las lecturas de layout se cachean fuera del loop de scroll.** Leer `scrollHeight` en cada tick fuerza reflow y traba el scroll.
4. **Por qué WhatsApp y no formulario con backend.** Sitio estático, y para este público convierte mejor.
5. **Por qué el efecto del título cambió de vertical a horizontal.** La primera versión no leía como refracción. Probar, ver que no funciona y corregir es el trabajo — no defender una idea porque ya estaba escrita.
6. **Qué tendría una versión de producción y por qué esta no lo tiene.** Distinguir alcance es de las cosas que más se notan.

---

## Notas

- En una demo, un detalle roto pesa más que en producción: el acabado es lo único que se está midiendo.
- Menos fotos mejores > más fotos. Aplica igual a efectos, animaciones y secciones.
- El contraste del CTA importa: es el elemento más usado de la página y lo primero que sale en una auditoría automática.
- El README es la mitad de la entrega. Una landing bien terminada con criterio explicado vale más que un proyecto grande a medias.