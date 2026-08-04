(() => {
  'use strict';

  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Switch de modo claro/oscuro. El tema inicial ya lo aplica un script
     inline en <head> (para no parpadear); aquí solo se sincroniza el
     checkbox y se guarda el cambio cuando el usuario lo toca. */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.addEventListener('change', () => {
      const tema = themeToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', tema);
      localStorage.setItem('tema', tema);
    });
  }

  const nav = document.querySelector('[data-nav]');
  const barraProgreso = document.querySelector('[data-progreso-scroll]');
  const heroImg = document.querySelector('.hero__media img');
  const hero = document.querySelector('.hero');

  /* --- Loop único de scroll, dirigido por requestAnimationFrame ---
     Todas las lecturas de layout (alturas) se cachean fuera del loop
     para no forzar reflows en cada tick de scroll. */
  let alturaDocumento = 0;
  let alturaHero = 0;

  const medirLayout = () => {
    alturaDocumento = document.documentElement.scrollHeight - window.innerHeight;
    alturaHero = hero ? hero.offsetHeight : 0;
  };

  let tickEnCurso = false;

  const actualizarScroll = () => {
    tickEnCurso = false;
    const y = window.scrollY;

    if (nav) {
      if (y > 40) nav.setAttribute('data-scrolled', '');
      else nav.removeAttribute('data-scrolled');
    }

    if (barraProgreso && alturaDocumento > 0) {
      const progreso = Math.min(1, Math.max(0, y / alturaDocumento));
      barraProgreso.style.transform = `scaleX(${progreso})`;
    }

    if (heroImg && !prefiereMenosMovimiento && y < alturaHero) {
      heroImg.style.transform = `translateY(${y * 0.22}px)`;
    }
  };

  const solicitarTick = () => {
    if (!tickEnCurso) {
      tickEnCurso = true;
      requestAnimationFrame(actualizarScroll);
    }
  };

  medirLayout();
  actualizarScroll();
  window.addEventListener('scroll', solicitarTick, { passive: true });
  window.addEventListener('resize', () => {
    medirLayout();
    solicitarTick();
  });

  /* Formulario de contacto: arma el mensaje de WhatsApp con nombre, teléfono y fecha */
  const formContacto = document.querySelector('[data-form-whatsapp]');
  if (formContacto) {
    const inputFecha = formContacto.querySelector('#contacto-fecha');
    const hoy = new Date();
    const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    inputFecha.min = hoyISO;

    formContacto.addEventListener('submit', (evento) => {
      evento.preventDefault();
      if (!formContacto.reportValidity()) return;

      const nombre = formContacto.nombre.value.trim();
      const telefono = formContacto.telefono.value.trim();

      const [anio, mes, dia] = formContacto.fecha.value.split('-').map(Number);
      const fechaTexto = new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const mensaje =
        `Hola, quiero consultar disponibilidad:\n\n` +
        `Nombre: ${nombre}\n` +
        `Teléfono: ${telefono}\n` +
        `Fecha: ${fechaTexto}\n\n` +
        `¿Tienen disponibilidad para esa fecha?`;

      window.location.href = `https://wa.me/523312615339?text=${encodeURIComponent(mensaje)}`;
    });
  }

  /* Botón flotante de WhatsApp: aparece después del hero */
  const flotante = document.querySelector('[data-whatsapp-flotante]');
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

  /* Scroll reveal, con stagger automático entre hermanos del mismo contenedor */
  const revealables = document.querySelectorAll('[data-reveal], [data-reveal-pop]');
  if (revealables.length) {
    const contadorPorPadre = new Map();
    revealables.forEach((el) => {
      const padre = el.parentElement;
      const indice = contadorPorPadre.get(padre) || 0;
      contadorPorPadre.set(padre, indice + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(indice, 5) * 70}ms`);
    });

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
