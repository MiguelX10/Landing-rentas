# Casa Palmera — Terraza con alberca en Zacoalco de Torres

Landing page estática para la renta por día de una terraza con alberca en Zacoalco de Torres, Jalisco. El objetivo es uno solo: que quien la abra se convenza con las fotos, entienda qué incluye y cuánto cuesta, y mande WhatsApp.

Proyecto real, no un ejercicio — el contenido (precio, capacidad, reglamento) sale del contrato de arrendamiento real del lugar.

## El problema

Un municipio de ~30,000 habitantes no tiene volumen de búsqueda en Google para "terraza con alberca en Zacoalco". El canal real es que el link se comparta por WhatsApp y Facebook. Eso cambia el diseño de la página: no se optimiza para posicionar, se optimiza para verse increíble cuando alguien la pega en un grupo de WhatsApp — de ahí que la imagen Open Graph reciba tanto cuidado como el propio hero.

## Decisiones de diseño

- **Concepto "agua y equipal".** El agua (línea horizontal, tono azulejo) da la estructura; el equipal (Zacoalco es la capital del equipal) da la textura, vía una trama SVG tejida a 6-8% de opacidad en las secciones cálidas. Evita a propósito el look genérico de "salón de eventos" (crema + serif + terracota) que no dice nada del lugar.
- **El hero se corta en la línea de flotación.** El H1 se divide en dos capas con `clip-path`: la mitad superior sólida, la inferior con menos opacidad y un ligero desplazamiento, simulando algo sumergido. Es el único momento llamativo de la página — todo lo demás es tranquilo a propósito. Se apaga con `prefers-reduced-motion`.
- **Precio único, no paquetes inventados.** El contrato real solo define una renta de $3,500/día, no tiers de entre-semana/fin-de-semana/festivo. Se mostró tal cual en vez de inventar una estructura de precios que no existe — el brief explícitamente prohíbe cualquier "Lorem ipsum" o contenido no real.
- **El reglamento es contenido, no relleno.** Sale íntegro del contrato (horarios de alberca, qué no meter al agua, la advertencia de químicos). Filtra clientes problema y ahorra la misma pregunta por WhatsApp veinte veces.

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| Vanilla HTML/CSS/JS, sin frameworks | Una landing de una sola página no necesita build step. Menos peso, menos que se rompa, y demuestra CSS real sin Tailwind |
| WhatsApp como canal primario | Sitio estático sin backend; en México WhatsApp convierte mejor que un formulario que nadie revisa |
| `<dialog>` nativo para el lightbox | Ya trae focus trap y cierre con Esc, cero JS de librería |
| `<details>/<summary>` para el FAQ | Accesible de nacimiento |
| Fuentes auto-hospedadas (no `fonts.googleapis.com`) | Ver sección de performance — elimina una cadena de peticiones externa completa |
| `IntersectionObserver` para scroll reveal | No hay listeners de `scroll` bloqueando el hilo principal |

## Fotos

Se procesaron 8 fotos reales del lugar (HEIC → WebP, 3 anchos cada una: 640/1280/1920, calidad 80). El mínimo recomendado por el plan de trabajo era 12 — quedó documentado como pendiente para una siguiente sesión de fotos (ver "Con más tiempo").

## SEO local

- Open Graph completo con imagen 1200×630 generada a partir de la foto de la alberca de día, con overlay de texto — pensada para verse bien como tarjeta de WhatsApp, que es donde de verdad va a vivir esta página.
- JSON-LD `LocalBusiness` con dirección, teléfono y capacidad — es el detalle que casi nadie pone en una landing de este tipo y es lo que Google usa para el panel local.
- `sitemap.xml` + `robots.txt`, aunque sea una sola URL.
- Fuera del código: para que esto funcione de verdad falta el Google Business Profile con el link a la landing (en un pueblo chico esto pesa más que el SEO on-page) y publicarla en grupos de Facebook locales y de eventos en GDL.

## Accesibilidad

Contraste verificado con axe/Lighthouse, no a ojo. `--cuero` (el color de acción) no pasa 4.5:1 con texto blanco a tamaños normales — se resolvió reservándolo para botones grandes en negrita (que sí califican como "texto grande" bajo WCAG, umbral 3:1) y usando una variante más oscura (`--cuero-oscuro`) en el botón pequeño del nav, que sí necesita el 4.5:1 completo.

## Performance — resultados reales de Lighthouse

Corrido en local (`npx lighthouse`), no son números inventados. Reporte completo en `docs/lighthouse-report.jpg`.

| Categoría | Score |
|---|---|
| Performance | **85** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

**Sobre el 85 de Performance:** las tres métricas que dependen de trabajo real (Total Blocking Time, Cumulative Layout Shift, First Contentful Paint) están en verde — CLS es 0 y FCP es 1.1s. La única métrica en rojo es el Largest Contentful Paint reportado (4.4s), pero el desglose interno de Lighthouse (`lcp-breakdown-insight`) muestra que el tiempo *real* de carga y render del elemento LCP es de ~140ms; el resto es la simulación de red 4G lenta que Lighthouse aplica por defecto sin importar que el servidor sea local. Es una limitante del método de medición, no del código — en el deploy real sobre la CDN de Vercel debería medir aún mejor.

Antes de auto-hospedar las fuentes (se cargaban desde `fonts.googleapis.com`), el Performance era 77 y el FCP 3.0s. Ese fue el cambio de más impacto real de toda la sesión de optimización.

## Qué haría con más tiempo

1. **Completar el set de fotos.** Van 8, faltan tomas de día del área techada vacía, el asador, los baños, el estacionamiento y una toma amplia del entorno (cerros/cielo abierto) — es la ventaja competitiva real contra una terraza urbana y hoy no está en la galería.
2. **Foto de alberca al atardecer.** El plan la pedía como la imagen que más vende; lo que hay es de día y de noche, falta la hora dorada.
3. **Confirmar redes sociales** del lugar para enlazarlas en el footer.
4. **Perseguir el 95+ de Performance** con imágenes AVIF además de WebP, aunque como se explica arriba el score actual ya refleja una carga real rápida.
5. **Dominio propio y deploy en Vercel** (Fase 8 del plan de trabajo) — hoy corre en local con `python3 -m http.server`.

## Cómo correrlo en local

```bash
cd terraza-landing
python3 -m http.server 8000
```

Abrir `http://localhost:8000`.
