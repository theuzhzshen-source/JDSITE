(() => {
  const topbar = document.getElementById('topbar');
  const glow = document.getElementById('cursorGlow');
  let mx = innerWidth / 2, my = innerHeight / 2;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (glow) {
      glow.style.left = `${mx}px`;
      glow.style.top = `${my}px`;
    }
  }, { passive: true });

  addEventListener('scroll', () => {
    topbar?.classList.toggle('scrolled', scrollY > 50);
  }, { passive: true });

  // O scroll movimenta apenas o cenário/textos marcados como .layer.
  // Os integrantes NÃO recebem esta transformação.
  const layers = [...document.querySelectorAll('.layer')];
  let raf = 0;

  function render() {
    const cx = mx - innerWidth / 2;
    const cy = my - innerHeight / 2;

    layers.forEach(el => {
      const depth = Number(el.dataset.depth || 0);
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - innerHeight / 2;
      const sy = Math.max(
        -80,
        Math.min(80, -center * depth * .16)
      );

      el.style.setProperty('--scrollY', `${sy}px`);
      el.style.setProperty('--px', `${cx * depth * .014}px`);
      el.style.setProperty('--py', `${cy * depth * .010}px`);
    });

    raf = requestAnimationFrame(render);
  }

  cancelAnimationFrame(raf);
  render();

  const members = [...document.querySelectorAll('.heroMember')];
  const caption = document.getElementById('memberCaption');
  const know = document.getElementById('knowButton');

  const roles = [
    'BATERIA',
    'VOCAL',
    'GUITARRA',
    'GUITARRA'
  ];

  const names = [
    'LEONARD',
    'MHATEUZ',
    'AUGUSTO',
    'PROFESSOR'
  ];

  let active = 1;

  function setMember(next) {
    active = (next + members.length) % members.length;

    members.forEach((member, i) => {
      member.classList.remove(
        'isActive',
        'isSide',
        'left',
        'right',
        'isBack'
      );

      const distance =
        (i - active + members.length) % members.length;

      if (distance === 0) {
        member.classList.add('isActive');
      } else if (distance === 1) {
        member.classList.add('isSide', 'right');
      } else if (distance === members.length - 1) {
        member.classList.add('isSide', 'left');
      } else {
        member.classList.add('isBack');
      }
    });

    if (caption) {
      caption.querySelector('.captionIndex').textContent = '';
      caption.querySelector('strong').textContent = names[active];
      caption.querySelector('small').textContent = roles[active];
    }

    if (know) {
      know.href = `integrante-${active + 1}.html`;
      know.setAttribute('data-member-url', know.href);
    }
  }

  document.getElementById('memberPrev')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    setMember(active - 1);
  });

  document.getElementById('memberNext')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    setMember(active + 1);
  });

  members.forEach((m, i) => {
    m.addEventListener('click', () => setMember(i));
  });

  setMember(active);

  // Efeito de clique sem animar `transform`
  document.querySelectorAll('.clickFx').forEach(el => {
    el.addEventListener('pointerdown', () => {
      el.animate([
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.35)' },
        { filter: 'brightness(1)' }
      ], {
        duration: 180,
        easing: 'ease-out'
      });
    });
  });

  // Navegação explícita do CONHEÇA
  if (know) {
    know.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const url =
        know.getAttribute('data-member-url') ||
        know.getAttribute('href');

      if (url) {
        window.location.assign(url);
      }
    });
  }

  document.getElementById('mobileMenu')?.addEventListener('click', () => {
    document.querySelector('.topbar nav')?.classList.toggle('open');
  });

  // Nunca deixa uma foto inexistente virar o ícone quebrado do navegador.
  document.querySelectorAll('.heroMember img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      img.closest('.heroMember')?.classList.add('noPhoto');
    }, { once: true });
  });


  // =====================================================
  // PRÓXIMOS SHOWS — HOME
  // =====================================================

  const upcomingShowsList =
    document.getElementById('upcomingShowsList');


  // Formata a data recebida do Supabase
  function formatHomeShowDate(date) {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }


  // Proteção contra HTML
  function escapeHomeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));
  }


  async function loadHomeShows() {

    if (!upcomingShowsList) return;

    // Espera o Supabase estar disponível
    let attempts = 0;

    while (!window.JD_DB?.client && attempts < 100) {
      await new Promise(resolve =>
        setTimeout(resolve, 100)
      );
      attempts++;
    }

    if (!window.JD_DB?.client) {
      upcomingShowsList.innerHTML = `
        <div class="noShows">
          NÃO FOI POSSÍVEL CONECTAR À AGENDA.
        </div>
      `;
      return;
    }


    // =================================================
    // BUSCA OS SHOWS ATUALIZADOS
    // =================================================

    const { data, error } = await window.JD_DB.client
      .from('upcoming_shows')
      .select('id, name, show_date')
      .order('show_date', {
        ascending: true,
        nullsFirst: false
      });


    console.log('[HOME] upcoming_shows:', data);
    console.log('[HOME] erro:', error);


    if (error) {
      upcomingShowsList.innerHTML = `
        <div class="noShows">
          ERRO AO CARREGAR A AGENDA.
        </div>
      `;

      console.error(
        '[HOME] Erro ao buscar shows:',
        error
      );

      return;
    }


    if (!data || data.length === 0) {
      upcomingShowsList.innerHTML = `
        <div class="noShows">
          NENHUM SHOW AGENDADO NO MOMENTO.
        </div>
      `;

      return;
    }


    // =================================================
    // MONTA OS CARDS
    // =================================================

    upcomingShowsList.innerHTML = data.map((show, index) => {

      const dateText = show.show_date
        ? formatHomeShowDate(show.show_date)
        : 'DATA INDEFINIDA';

      return `
        <article class="upcomingShowCard">

          <div class="upcomingShowNumber">
            ${String(index + 1).padStart(2, '0')}
          </div>

          <div class="upcomingShowLabel">
            PRÓXIMO SHOW / ${String(index + 1).padStart(2, '0')}
          </div>

          <div class="upcomingShowName">
            ${escapeHomeHtml(show.name)}
          </div>

          <div class="upcomingShowDate">
            ${escapeHomeHtml(dateText)}
          </div>

        </article>
      `;

    }).join('');
  }


  // Carrega a agenda
  loadHomeShows();

})();