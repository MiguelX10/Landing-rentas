(() => {
  'use strict';

  /* Nav: fondo translúcido al bajar */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.setAttribute('data-scrolled', '');
      else nav.removeAttribute('data-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Botón flotante de WhatsApp: aparece después del hero */
  const flotante = document.querySelector('[data-whatsapp-flotante]');
  const hero = document.querySelector('.hero');
  if (flotante && hero) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) flotante.removeAttribute('data-visible');
        else flotante.setAttribute('data-visible', '');
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);
  }

  /* Scroll reveal */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealables.forEach((el) => revealObserver.observe(el));
  }

  /* Lightbox de galería */
  const dialogo = document.querySelector('[data-lightbox]');
  const galeria = document.querySelector('[data-galeria]');
  if (dialogo && galeria) {
    const botones = Array.from(galeria.querySelectorAll('[data-lightbox-abrir]'));
    const imgLightbox = dialogo.querySelector('[data-lightbox-img]');
    let indiceActual = 0;

    const fuentes = botones.map((btn) => {
      const img = btn.querySelector('img');
      return { src: img.currentSrc || img.src, alt: img.alt };
    });

    const mostrar = (indice) => {
      indiceActual = (indice + fuentes.length) % fuentes.length;
      const { src, alt } = fuentes[indiceActual];
      imgLightbox.src = src;
      imgLightbox.alt = alt;
    };

    botones.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        mostrar(i);
        dialogo.showModal();
      });
    });

    dialogo.querySelector('[data-lightbox-cerrar]').addEventListener('click', () => dialogo.close());
    dialogo.querySelector('[data-lightbox-prev]').addEventListener('click', () => mostrar(indiceActual - 1));
    dialogo.querySelector('[data-lightbox-next]').addEventListener('click', () => mostrar(indiceActual + 1));

    dialogo.addEventListener('click', (evento) => {
      if (evento.target === dialogo) dialogo.close();
    });

    dialogo.addEventListener('keydown', (evento) => {
      if (evento.key === 'ArrowRight') mostrar(indiceActual + 1);
      if (evento.key === 'ArrowLeft') mostrar(indiceActual - 1);
    });
  }
})();
