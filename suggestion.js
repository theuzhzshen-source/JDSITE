(() => {
  const form = document.getElementById('suggestionForm');
  if (!form) return;

  const shiftInput = document.getElementById('shift');
  const buttons = [...document.querySelectorAll('.shiftBtn')];
  const status = document.getElementById('formStatus');
  const submit = form.querySelector('button[type="submit"]');

  function selectShift(value) {
    shiftInput.value = value;

    buttons.forEach(btn => {
      const active = btn.dataset.value === value;

      btn.classList.toggle('selected', active);
      btn.setAttribute(
        'aria-pressed',
        active ? 'true' : 'false'
      );
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectShift(btn.dataset.value);

      status.textContent = '';
      status.className = '';

      btn.animate(
        [
          {
            transform: 'translateY(0) scale(1)'
          },
          {
            transform: 'translateY(1px) scale(.97)'
          },
          {
            transform: 'translateY(0) scale(1)'
          }
        ],
        {
          duration: 180,
          easing: 'ease-out'
        }
      );
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const song = document
      .getElementById('song')
      .value
      .trim();

    const artist = document
      .getElementById('artist')
      .value
      .trim();

    const observation = document
      .getElementById('observation')
      .value
      .trim();

    // Verifica o turno
    if (!shiftInput.value) {
      status.className = 'error';
      status.textContent = 'ESCOLHA MANHÃ OU TARDE.';
      buttons[0]?.focus();
      return;
    }

    // Verifica música e artista
    if (!song || !artist) {
      status.className = 'error';
      status.textContent = 'PREENCHA A MÚSICA E O ARTISTA.';
      return;
    }

    // Verifica conexão com o Supabase
    if (!window.JD_DB?.ready || !window.JD_DB?.client) {
      status.className = 'error';
      status.textContent =
        'O BANCO AINDA NÃO FOI CONFIGURADO. VERIFIQUE config.js.';
      return;
    }

    // Desabilita o botão durante o envio
    submit.disabled = true;
    submit.classList.add('sending');

    status.className = 'sendingText';
    status.textContent = 'ENVIANDO PARA O REPERTÓRIO...';

    try {
      const { error } = await window.JD_DB.client
        .from('music_request')
        .insert({
          shift: shiftInput.value,
          song: song,
          artist: artist,
          observation: observation || null
        });

      if (error) {
        console.error('Erro ao enviar sugestão:', error);

        status.className = 'error';
        status.textContent =
          'NÃO FOI POSSÍVEL REGISTRAR. VERIFIQUE O BANCO E TENTE NOVAMENTE.';

        return;
      }

      // Limpa o formulário
      form.reset();

      // Remove seleção de turno
      selectShift('');

      // Mensagem de sucesso
      status.className = 'success';
      status.textContent =
        '✓ SUGESTÃO ADICIONADA AO REPERTÓRIO.';

    } catch (error) {
      console.error('Erro inesperado:', error);

      status.className = 'error';
      status.textContent =
        'OCORREU UM ERRO AO ENVIAR. TENTE NOVAMENTE.';
    } finally {
      submit.disabled = false;
      submit.classList.remove('sending');
    }
  });

  // Começa sem turno selecionado
  selectShift('');
})();