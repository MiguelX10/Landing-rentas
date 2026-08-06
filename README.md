# Casa Palmera

Landing page para renta por día de una terraza con alberca en Zacoalco de Torres, Jalisco.

🔗 https://landing-rentas.vercel.app

## El problema

Casa Palmera es un lugar real: una terraza techada con alberca que se renta por día para eventos, en un municipio de ~30,000 habitantes en Jalisco. El precio ($3,500 MXN/día), la capacidad (50 personas) y el reglamento (horarios de alberca, qué no meter al agua, la advertencia de químicos) salen íntegros del contrato de arrendamiento real del lugar — nada de contenido inventado.

Esta entrega es una demo para prácticas profesionales, no el sitio de producción del negocio. Eso cambió las prioridades a mitad de camino: en vez de perseguir dominio propio, `robots.txt`, Google Business Profile o analítica (cosas que solo importan con el sitio operando), el esfuerzo se puso en que el recorrido de quien revisa el proyecto — abrir el link, hacer scroll, picar los enlaces del nav, ver el código — no tenga nada roto. En una demo, un detalle roto pesa más que en producción, porque el acabado es lo único que se está midiendo.

Aun así, el diseño respeta cómo se distribuiría en la vida real: en un pueblo chico, el canal es WhatsApp y Facebook, no la búsqueda orgánica, así que la página está pensada para convencer con fotos y convertir a un solo mensaje de WhatsApp, no para posicionar en Google.

## Decisiones de diseño

- **Concepto "agua y equipal".** El agua (tono azulejo, franjas siempre-oscuras) da la estructura; el equipal (Zacoalco es la capital del equipal) da la textura, vía una trama SVG tejida a baja opacidad en las secciones cálidas. Evita a propósito el look genérico de "salón de eventos" que no dice nada del lugar.
- **El hero se corta en la línea de flotación — y por qué cambió de vertical a horizontal.** El H1 se divide en dos capas: la mitad superior sólida, la inferior simulando estar bajo el agua. La primera versión desplazaba la capa de abajo *verticalmente* y le bajaba la opacidad — leía como un error de renderizado, no como refracción, porque el agua real desplaza horizontalmente y tiñe (no desatura) lo que está debajo. Se corrigió a un desplazamiento horizontal ondulante, la capa de abajo teñida con el color de acento del agua en vez de gris, y una línea de flotación explícita para que el corte se lea intencional. Probar un efecto, ver que no aterriza y corregirlo es el trabajo — no defender la primera versión porque ya estaba escrita.
- **La foto del hero se eligió por legibilidad, no por ser "la más bonita".** La original era una toma vertical del azulejo y el borde de la alberca, en ángulo confuso — no se entendía qué se estaba viendo, y encima rompía el efecto del título al no tener zona oscura donde el texto se leyera. Se reemplazó por la foto de alberca con cascada, palmeras y cielo, horizontal, con una zona de sombra natural del lado izquierdo donde vive el texto.
- **Precio único, no paquetes inventados.** El contrato real solo define una renta de $3,500/día, no tiers de entre-semana/fin-de-semana/festivo. Se mostró tal cual en vez de inventar una estructura de precios que no existe.
- **El reglamento es contenido, no relleno.** Sale íntegro del contrato. Filtra clientes problema y ahorra la misma pregunta por WhatsApp veinte veces.
- **Galería curada a 8 fotos, no las 12 originales.** Tres de las doce no aportaban: ángulos confusos, tomas nocturnas donde no se distinguía nada. Ocho fotos buenas convencen más que doce donde tres restan — el mismo criterio aplica a efectos y secciones, no solo a fotos. El grid además es asimétrico (la mejor foto ocupa 2×2) para romper el efecto "catálogo" de celdas idénticas.

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| Vanilla HTML/CSS/JS, sin framework | Una landing de una sola página no necesita build step. Menos peso, menos superficie de error, despliegue directo |
| Script de tema inline en `<head>` | Si esperara al `script.js` con `defer`, la página parpadearía en claro antes de cambiar a oscuro |
| Lecturas de layout cacheadas fuera del loop de scroll | Leer `scrollHeight` en cada tick de scroll fuerza un reflow y traba el hilo principal |
| WhatsApp en vez de formulario con backend | Sitio estático sin backend; en México WhatsApp convierte mejor que un formulario que nadie revisa |
| `<dialog>` nativo para el lightbox | Focus trap y cierre con Esc de fábrica, cero JS de librería |
| `<details>/<summary>` para el FAQ | Accesible de nacimiento |
| Fuentes auto-hospedadas, con `preload` | Elimina una cadena de peticiones externa completa a `fonts.googleapis.com` — fue el cambio de mayor impacto real en Performance |
| `IntersectionObserver` para contadores y scroll-reveal | No hay listeners de `scroll` bloqueando el hilo principal |

## Accesibilidad

- HTML semántico, un solo `<h1>`, jerarquía de encabezados sin saltos
- Contraste verificado con la calculadora de contraste WCAG y confirmado con Lighthouse/axe, no a ojo — incluyendo un par de bugs reales que se encontraron así: `.btn--cta` con `--cuero` no pasaba 4.5:1 a tamaño normal (se resolvió con `--cuero-oscuro`, reservando `--cuero` para botones grandes en negrita, que sí califican como "texto grande" bajo WCAG); el texto del footer tampoco pasaba (4.37:1) y se corrigió a `--cal`
- `:focus-visible` propio, navegable 100% con teclado
- `prefers-reduced-motion` respetado sección por sección, no solo en el reset global
- Skip link, `alt` descriptivos en cada foto, áreas táctiles de 44px
- Los contadores (`50 personas`, `$3,500`) tienen el valor real escrito en el HTML estático — el JS solo los anima desde cero; si el JS falla o Google indexa antes de que corra, no se ve "0 personas" ni "$0 MXN"

## Rendimiento — resultados reales de Lighthouse

Corrido en local (`npx lighthouse`), no son números inventados. Reporte completo en `docs/lighthouse-report.jpg`.

| Categoría | Score |
|---|---|
| Performance | **80** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

**Sobre el 80 de Performance:** las métricas que dependen de trabajo real están en verde — Cumulative Layout Shift es 0, First Contentful Paint 1.1s, Total Blocking Time 0ms. La única métrica en rojo es el Largest Contentful Paint reportado (5.6s), pero el desglose interno de Lighthouse (`lcp-breakdown-insight`) muestra que el tiempo *real* de carga y render del elemento LCP suma ~195ms; el resto es la simulación de red 4G lenta que Lighthouse aplica por defecto sin importar que el servidor sea local. Es una limitante del método de medición, no del código — en el deploy real sobre la CDN de Vercel debería medir mejor.

## Alcance

Se resolvió como single-page estática porque el objetivo de esta entrega es demostrar el trabajo de front-end, no operar un negocio. Fuera de alcance a propósito, aunque valga la pena mencionarlo:

- Dominio propio (`casapalmera.mx`), DNS, `robots.txt` y `sitemap.xml` apuntando a un sitio en producción
- Google Business Profile y Search Console
- Facebook Page y publicación en grupos locales — en un pueblo chico esto pesa más que el SEO on-page
- Analítica de conversión (Vercel Analytics o similar)
- Backend real de disponibilidad (por ejemplo Cal.com) en vez de "manda WhatsApp y checamos"
- Panel administrable para la galería, en vez de HTML estático

Una versión de producción real sumaría todo lo anterior más separación en componentes si el sitio creciera más allá de una sola página.

## Cómo correrlo en local

```bash
cd terraza-landing
python3 -m http.server 8000
```

Abrir `http://localhost:8000`.
