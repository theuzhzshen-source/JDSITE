(() => {
  const loginBox = document.getElementById('loginBox');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');

  let all = [];

  function configured() {
    return window.JD_DB?.ready;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));
  }

  async function boot() {
    if (!configured()) {
      document.getElementById('loginStatus').textContent =
        'Configure config.js antes de usar o painel.';
      return;
    }

    const { data } =
      await window.JD_DB.client.auth.getSession();

    if (data.session) {
      showDashboard();
    }
  }

  function showDashboard() {
    loginBox.hidden = true;
    dashboard.hidden = false;

    load();
    loadUpcomingShows();
  }


  // =====================================================
  // REPERTÓRIO
  // =====================================================

  async function load() {
    const { data, error } =
      await window.JD_DB.client
        .from('music_request')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
      document.getElementById('morningRows').innerHTML =
        `<tr><td colspan="6">Erro ao carregar: ${esc(error.message)}</td></tr>`;

      document.getElementById('afternoonRows').innerHTML =
        `<tr><td colspan="6">Erro ao carregar: ${esc(error.message)}</td></tr>`;

      return;
    }

    all = data || [];

    render();
  }


  function row(x) {
    return `
      <tr>

        <td>
          <strong>${esc(x.song)}</strong>
        </td>

        <td>
          ${esc(x.artist)}
        </td>

        <td>
          ${esc(x.observation || '—')}
        </td>

        <td>
          ${
            x.created_at
              ? new Date(x.created_at).toLocaleString('pt-BR')
              : '—'
          }
        </td>

        <td>
          <select
            data-id="${x.id}"
            class="rowStatus"
            aria-label="Status de ${esc(x.song)}"
          >

            <option
              value="PENDING"
              ${x.status === 'PENDING' ? 'selected' : ''}
            >
              PENDENTE
            </option>

            <option
              value="REVIEWED"
              ${x.status === 'REVIEWED' ? 'selected' : ''}
            >
              ANALISADA
            </option>

            <option
              value="ACCEPTED"
              ${x.status === 'ACCEPTED' ? 'selected' : ''}
            >
              ACEITA
            </option>

            <option
              value="REJECTED"
              ${x.status === 'REJECTED' ? 'selected' : ''}
            >
              RECUSADA
            </option>

          </select>
        </td>

        <td>
          <button
            class="deleteBtn"
            data-id="${x.id}"
          >
            EXCLUIR
          </button>
        </td>

      </tr>
    `;
  }


  function renderPanel(shift, list) {

    const rows = document.getElementById(
      shift === 'MORNING'
        ? 'morningRows'
        : 'afternoonRows'
    );

    const count = document.getElementById(
      shift === 'MORNING'
        ? 'morningCount'
        : 'afternoonCount'
    );

    count.textContent = list.length;

    rows.innerHTML =
      list.map(row).join('') ||
      `
        <tr>
          <td colspan="6" class="empty">
            Nenhuma música cadastrada neste turno.
          </td>
        </tr>
      `;
  }


  function render() {

    const q =
      document.getElementById('search')
        .value
        .trim()
        .toLowerCase();

    const statusFilter =
      document.getElementById('statusFilter').value;

    const filtered = all.filter(x =>
      (statusFilter === 'ALL' ||
        x.status === statusFilter) &&

      (
        `${x.song} ${x.artist} ${x.observation || ''}`
          .toLowerCase()
          .includes(q)
      )
    );

    const morning =
      filtered.filter(x => x.shift === 'MORNING');

    const afternoon =
      filtered.filter(x => x.shift === 'AFTERNOON');


    document.getElementById('total').textContent =
      all.length;

    document.getElementById('pending').textContent =
      all.filter(x => x.status === 'PENDING').length;

    document.getElementById('accepted').textContent =
      all.filter(x => x.status === 'ACCEPTED').length;

    document.getElementById('morning').textContent =
      all.filter(x => x.shift === 'MORNING').length;

    document.getElementById('afternoon').textContent =
      all.filter(x => x.shift === 'AFTERNOON').length;


    renderPanel('MORNING', morning);
    renderPanel('AFTERNOON', afternoon);


    document.querySelectorAll('.rowStatus')
      .forEach(el => {

        el.addEventListener('change', async () => {

          const { error } =
            await window.JD_DB.client
              .from('music_request')
              .update({
                status: el.value,
                updated_at: new Date().toISOString()
              })
              .eq('id', el.dataset.id);

          if (error) {
            alert(
              'Não foi possível atualizar: ' +
              error.message
            );
          }

          await load();
        });

      });


    document.querySelectorAll('.deleteBtn')
      .forEach(el => {

        el.addEventListener('click', async () => {

          if (!confirm('Excluir esta sugestão?')) {
            return;
          }

          const { error } =
            await window.JD_DB.client
              .from('music_request')
              .delete()
              .eq('id', el.dataset.id);

          if (error) {
            alert(
              'Não foi possível excluir: ' +
              error.message
            );
          }

          await load();
        });

      });

  }


  // =====================================================
  // LOGIN
  // =====================================================

  loginForm.addEventListener('submit', async e => {

    e.preventDefault();

    const status =
      document.getElementById('loginStatus');

    if (!configured()) {

      status.textContent =
        'Configure config.js primeiro.';

      return;
    }

    status.textContent = 'ENTRANDO...';

    const { error } =
      await window.JD_DB.client.auth
        .signInWithPassword({
          email:
            document.getElementById('email').value.trim(),

          password:
            document.getElementById('password').value
        });

    if (error) {

      status.textContent =
        'E-mail ou senha inválidos.';

    } else {

      showDashboard();

    }

  });


  document.getElementById('logout')
    ?.addEventListener('click', async () => {

      await window.JD_DB.client.auth.signOut();

      location.reload();

    });


  document.getElementById('search')
    ?.addEventListener('input', render);

  document.getElementById('statusFilter')
    ?.addEventListener('change', render);



  // =====================================================
// PRÓXIMOS SHOWS — ADMIN
// =====================================================

const scheduleShowBtn = document.getElementById('scheduleShowBtn');
const showModal = document.getElementById('showModal');
const closeShowModal = document.getElementById('closeShowModal');
const showForm = document.getElementById('showForm');

const showName = document.getElementById('showName');
const showDate = document.getElementById('showDate');

const showFormStatus =
  document.getElementById('showFormStatus');

const showsAdminList =
  document.getElementById('showsAdminList');

const showDateUndefined =
  document.getElementById('showDateUndefined') ||
  document.getElementById('dateUndefined');

let editingShowId = null;


// =====================================================
// ABRIR MODAL
// =====================================================

function openShowModal(show = null) {

  if (!showModal) return;

  showModal.hidden = false;

  editingShowId = show ? show.id : null;

  // NOME
  if (showName) {
    showName.value = show?.name || '';
  }

  // DATA
  if (showDate) {
    showDate.value = show?.show_date || '';
  }

  // DATA INDEFINIDA
  if (showDateUndefined) {
    showDateUndefined.checked = !show?.show_date;
  }

  updateDateField();

  // Título
  const title = showModal.querySelector('h2');

  if (title) {

    if (editingShowId) {
      title.innerHTML =
        'EDITAR<br><em>PRÓXIMO SHOW</em>';
    } else {
      title.innerHTML =
        'AGENDAR<br><em>PRÓXIMO SHOW</em>';
    }

  }

  // Botão
  const button =
    showModal.querySelector('.confirmShowBtn');

  if (button) {

    if (editingShowId) {
      button.innerHTML =
        'SALVAR ALTERAÇÕES <b>↗</b>';
    } else {
      button.innerHTML =
        'AGENDAR SHOW <b>↗</b>';
    }

  }

  if (showFormStatus) {
    showFormStatus.textContent = '';
  }

  showName?.focus();
}


// =====================================================
// CAMPO DATA
// =====================================================

function updateDateField() {

  if (!showDate) return;

  const undefinedDate =
    showDateUndefined?.checked === true;

  showDate.disabled = undefinedDate;

  if (undefinedDate) {
    showDate.value = '';
  }

}


// =====================================================
// CHECKBOX DATA INDEFINIDA
// =====================================================

showDateUndefined?.addEventListener(
  'change',
  updateDateField
);


// =====================================================
// FECHAR MODAL
// =====================================================

function closeShowModalFn() {

  if (!showModal) return;

  showModal.hidden = true;

  editingShowId = null;

  showForm?.reset();

  if (showDate) {
    showDate.disabled = false;
  }

  if (showFormStatus) {
    showFormStatus.textContent = '';
  }

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatShowDate(date) {

  if (!date) {
    return 'DATA INDEFINIDA';
  }

  const parts = date.split('-');

  if (parts.length !== 3) {
    return 'DATA INDEFINIDA';
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

}


// =====================================================
// CARREGAR SHOWS
// =====================================================

async function loadUpcomingShows() {

  if (!configured() || !showsAdminList) return;

  const result = await window.JD_DB.client
    .from('upcoming_shows')
    .select('*')
    .order('show_date', {
      ascending: true,
      nullsFirst: false
    });

  const data = result.data;
  const error = result.error;

  console.log(
    '[ADMIN] Shows carregados:',
    data
  );

  if (error) {

    console.error(
      '[ADMIN] Erro ao carregar:',
      error
    );

    showsAdminList.innerHTML = `
      <div class="adminShowCard">
        ERRO AO CARREGAR SHOWS:
        ${esc(error.message)}
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {

    showsAdminList.innerHTML = `
      <div class="adminShowCard">

        <div class="adminShowDate">
          AGENDA VAZIA
        </div>

        <div class="adminShowName">
          Nenhum show agendado.
        </div>

      </div>
    `;

    return;
  }


  // ===================================================
  // MONTAR CARDS
  // ===================================================

  showsAdminList.innerHTML = data.map(show => {

    const dateText = show.show_date
      ? formatShowDate(show.show_date)
      : 'DATA INDEFINIDA';

    return `
      <article class="adminShowCard">

        <div class="adminShowDate">
          ${esc(dateText)}
        </div>

        <div class="adminShowName">
          ${esc(show.name)}
        </div>

        <div class="adminShowActions">

          <button
            type="button"
            class="editShowBtn"
            data-show-id="${show.id}"
          >
            EDITAR
          </button>

          <button
            type="button"
            class="deleteShowBtn"
            data-show-id="${show.id}"
          >
            EXCLUIR SHOW
          </button>

        </div>

      </article>
    `;

  }).join('');


  // ===================================================
  // BOTÃO EDITAR
  // ===================================================

  document
    .querySelectorAll('.editShowBtn')
    .forEach(button => {

      button.addEventListener('click', () => {

        const id = button.dataset.showId;

        const show = data.find(
          item =>
            String(item.id) === String(id)
        );

        if (!show) {

          alert(
            'Não foi possível encontrar este show.'
          );

          return;
        }

        console.log(
          '[ADMIN] Editando show:',
          show
        );

        openShowModal(show);

      });

    });


  // ===================================================
  // BOTÃO EXCLUIR
  // ===================================================

  document
    .querySelectorAll('.deleteShowBtn')
    .forEach(button => {

      button.addEventListener(
        'click',
        async () => {

          const id =
            button.dataset.showId;

          if (
            !confirm(
              'Excluir este show da agenda?'
            )
          ) {
            return;
          }

          const { error } =
            await window.JD_DB.client
              .from('upcoming_shows')
              .delete()
              .eq('id', id);

          if (error) {

            alert(
              'Não foi possível excluir o show: ' +
              error.message
            );

            return;
          }

          await loadUpcomingShows();

        }
      );

    });

}


// =====================================================
// ABRIR NOVO SHOW
// =====================================================

scheduleShowBtn?.addEventListener(
  'click',
  () => openShowModal()
);


// =====================================================
// FECHAR
// =====================================================

closeShowModal?.addEventListener(
  'click',
  closeShowModalFn
);


showModal
  ?.querySelector('.showModalBackdrop')
  ?.addEventListener(
    'click',
    closeShowModalFn
  );


// =====================================================
// SALVAR / EDITAR
// =====================================================

showForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();

    const name =
      showName?.value.trim();

    if (!name) {

      showFormStatus.textContent =
        'INFORME O NOME DO SHOW.';

      return;
    }


    /*
      IMPORTANTE:

      Se o campo estiver desativado,
      significa DATA INDEFINIDA.

      Se estiver ativo, pegamos a data
      diretamente do input.
    */

    let date = null;

    if (
      showDate &&
      !showDate.disabled &&
      showDate.value
    ) {

      date = showDate.value;

    }


    console.log(
      '[ADMIN] Salvando:',
      {
        id: editingShowId,
        name: name,
        show_date: date
      }
    );


    showFormStatus.textContent =
      editingShowId
        ? 'SALVANDO ALTERAÇÕES...'
        : 'AGENDANDO...';


    // =================================================
    // EDITAR
    // =================================================

    if (editingShowId) {

      const { error } =
        await window.JD_DB.client
          .from('upcoming_shows')
          .update({
            name: name,
            show_date: date
          })
          .eq('id', editingShowId);


      if (error) {

        console.error(
          '[ADMIN] ERRO UPDATE:',
          error
        );

        showFormStatus.textContent =
          'ERRO AO SALVAR: ' +
          error.message;

        return;
      }


      console.log(
        '[ADMIN] SHOW ATUALIZADO COM SUCESSO:',
        {
          id: editingShowId,
          name: name,
          show_date: date
        }
      );


      showFormStatus.textContent =
        'SHOW ATUALIZADO!';

    }


    // =================================================
    // NOVO SHOW
    // =================================================

    else {

      const { error } =
        await window.JD_DB.client
          .from('upcoming_shows')
          .insert({
            name: name,
            show_date: date
          });


      if (error) {

        console.error(
          '[ADMIN] ERRO INSERT:',
          error
        );

        showFormStatus.textContent =
          'ERRO AO AGENDAR: ' +
          error.message;

        return;
      }


      showFormStatus.textContent =
        'SHOW AGENDADO!';

    }


    // =================================================
    // RECARREGAR LISTA
    // =================================================

    await loadUpcomingShows();


    // =================================================
    // FECHAR MODAL
    // =================================================

    setTimeout(() => {

      closeShowModalFn();

    }, 500);

  }
);


// =====================================================
// INICIALIZAR
// =====================================================

loadUpcomingShows();

})();