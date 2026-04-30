document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    renderAdmin();
  });
});

function renderAdmin() {
  const adminPanel = document.getElementById('adminPanel');
  if (!adminPanel) return;

  const isAdmin = state.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (!state.user || !isAdmin) {
    adminPanel.innerHTML = `
      <div class="card-body">
        <h3>Acceso denegado</h3>
        <p>Necesitas iniciar sesión con la cuenta de administrador para usar el Estudio.</p>
      </div>
    `;
    return;
  }

  if (!state.adminDraft) {
    state.adminDraft = {
      type: 'MANHWA',
      title: '',
      synopsis: '',
      status: 'FINALIZADO',
      chapterCount: 1,
      cover: '',
      categories: [],
      tags: [],
      scheduleAt: '',
      publishMode: 'now',
      episodes: [],
    };
  }

  adminPanel.innerHTML = `
    <div class="section-title"><h3>Estudio de publicación</h3><span>Paso ${state.adminStep} de 4</span></div>
    ${renderAdminStep(state.adminStep)}
    <div class="browse-toolbar admin-actions">
      <button class="secondary" id="adminBack" ${state.adminStep === 1 ? 'disabled' : ''}>Anterior</button>
      <button class="primary" id="adminNext">${state.adminStep === 4 ? 'Publicar' : 'Siguiente'}</button>
    </div>
  `;

  document.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.onclick = () => chip.classList.toggle('active');
  });

  document.getElementById('adminBack').onclick = () => {
    if (state.adminStep > 1) {
      state.adminStep -= 1;
      renderAdmin();
    }
  };

  document.getElementById('adminNext').onclick = async () => {
    if (!saveAdminStep(state.adminStep)) return;
    if (state.adminStep < 4) {
      state.adminStep += 1;
      renderAdmin();
    } else {
      await publishAdminWork();
    }
  };
}

function renderAdminStep(step) {
  if (step === 1) {
    return `
      <div class="card-body">
        <label>Tipo de obra</label>
        <select id="adminType">
          <option value="CÓMIC" ${state.adminDraft.type === 'CÓMIC' ? 'selected' : ''}>CÓMIC</option>
          <option value="MANGA" ${state.adminDraft.type === 'MANGA' ? 'selected' : ''}>MANGA</option>
          <option value="MANHWA" ${state.adminDraft.type === 'MANHWA' ? 'selected' : ''}>MANHWA</option>
        </select>
        <label>Título</label>
        <input id="adminTitle" value="${state.adminDraft.title}" placeholder="Ej. Dragón Invisible" />
        <label>Sinopsis</label>
        <textarea id="adminSynopsis" rows="4" placeholder="Describe la historia">${state.adminDraft.synopsis}</textarea>
        <label>Portada</label>
        <input id="adminCover" value="${state.adminDraft.cover}" placeholder="https://..." />
        <label>Estado</label>
        <select id="adminStatus">
          <option value="FINALIZADO" ${state.adminDraft.status === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
          <option value="EN EMISIÓN" ${state.adminDraft.status === 'EN EMISIÓN' ? 'selected' : ''}>EN EMISIÓN</option>
          <option value="PRÓXIMAMENTE" ${state.adminDraft.status === 'PRÓXIMAMENTE' ? 'selected' : ''}>PRÓXIMAMENTE</option>
        </select>
        <label>Número de capítulos</label>
        <input id="adminChapterCount" type="number" min="1" value="${state.adminDraft.chapterCount}" />
        ${state.adminDraft.status === 'PRÓXIMAMENTE' || state.adminDraft.status === 'EN EMISIÓN' ? `
          <label>Fecha de publicación / lanzamiento</label>
          <input id="adminScheduleDate" type="date" value="${state.adminDraft.scheduleAt ? state.adminDraft.scheduleAt.split('T')[0] : ''}" />
          <input id="adminScheduleTime" type="time" value="${state.adminDraft.scheduleAt ? state.adminDraft.scheduleAt.split('T')[1]?.slice(0,5) : ''}" />
        ` : ''}
      </div>
    `;
  }

  if (step === 2) {
    const categories = ['Acción','Fantasía','Romance','Drama','Suspenso','Misterio','Vida escolar','Ciencia ficción','Horror'];
    const tags = ['+18','Finalizado','En emisión','Chico rudo','Vida cotidiana','Adolescentes','Bullying','Yaoi','Gore'];
    return `
      <div class="card-body">
        <p>Elige categorías</p>
        ${categories.map((cat) => `<button class="tag-chip ${state.adminDraft.categories.includes(cat) ? 'active' : ''}" data-tag="${cat}">${cat}</button>`).join(' ')}
        <p style="margin-top:14px;">Elige etiquetas</p>
        ${tags.map((tag) => `<button class="tag-chip ${state.adminDraft.tags.includes(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</button>`).join(' ')}
      </div>
    `;
  }

  if (step === 3) {
    const chapters = Array.from({ length: state.adminDraft.chapterCount }, (_, index) => index + 1);
    state.adminDraft.episodes = chapters.map((num, idx) => state.adminDraft.episodes[idx] || { id: `new-${num}`, title: `Capítulo ${num}`, cover: '', content: [{ type: 'text', value: `Texto del capítulo ${num}.` }] });
    return `
      <div class="card-body">
        <p>Define portadas y contenidos de cada capítulo</p>
        ${state.adminDraft.episodes.map((episode, index) => `
          <div style="margin-bottom:16px;">
            <strong>${episode.title}</strong>
            <input class="adminEpisodeCover" data-episode="${index}" value="${episode.cover}" placeholder="URL de portada" />
            <textarea class="adminEpisodeText" data-episode="${index}" rows="3" placeholder="Contenido del capítulo">${episode.content[0]?.value || ''}</textarea>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <div class="card-body">
      <h3>Revisión final</h3>
      <p><strong>${state.adminDraft.title}</strong></p>
      <p>${state.adminDraft.synopsis}</p>
      <p><strong>Capítulos:</strong> ${state.adminDraft.chapterCount}</p>
      <p><strong>Tipo de obra:</strong> ${state.adminDraft.type}</p>
      <p><strong>Estado:</strong> ${state.adminDraft.status}</p>
      <p><strong>Categorías:</strong> ${state.adminDraft.categories.join(', ')}</p>
      <p><strong>Etiquetas:</strong> ${state.adminDraft.tags.join(', ')}</p>
      ${state.adminDraft.status === 'EN EMISIÓN' ? `
        <p>¿Quieres publicar esta obra ahora o programarla como próximo lanzamiento?</p>
        <label><input type="radio" name="adminPublishMode" value="now" ${state.adminDraft.publishMode !== 'schedule' ? 'checked' : ''}/> Publicar ahora</label>
        <label><input type="radio" name="adminPublishMode" value="schedule" ${state.adminDraft.publishMode === 'schedule' ? 'checked' : ''}/> Publicar como PRÓXIMAMENTE</label>
        <div style="margin-top:12px;">
          <label>Fecha de lanzamiento</label>
          <input id="adminScheduleDate" type="date" value="${state.adminDraft.scheduleAt ? state.adminDraft.scheduleAt.split('T')[0] : ''}" />
          <input id="adminScheduleTime" type="time" value="${state.adminDraft.scheduleAt ? state.adminDraft.scheduleAt.split('T')[1]?.slice(0,5) : ''}" />
        </div>
      ` : ''}
      ${state.adminDraft.status === 'PRÓXIMAMENTE' ? `<p>Se mostrará en HOME dentro de PRÓXIMAMENTE hasta la fecha programada.</p>` : ''}
      ${state.adminDraft.status === 'FINALIZADO' ? `<p>Se mostrará en HOME en la sección TERMINADOS y estará disponible para lectura.</p>` : ''}
    </div>
  `;
}

function saveAdminStep(step) {
  if (step === 1) {
    state.adminDraft.type = document.getElementById('adminType').value;
    state.adminDraft.title = document.getElementById('adminTitle').value.trim();
    state.adminDraft.synopsis = document.getElementById('adminSynopsis').value.trim();
    state.adminDraft.cover = document.getElementById('adminCover').value.trim();
    state.adminDraft.status = document.getElementById('adminStatus').value;
    state.adminDraft.chapterCount = Math.max(1, Number(document.getElementById('adminChapterCount').value) || 1);
    const dateInput = document.getElementById('adminScheduleDate')?.value;
    const timeInput = document.getElementById('adminScheduleTime')?.value;
    if (dateInput && timeInput) {
      state.adminDraft.scheduleAt = `${dateInput}T${timeInput}:00Z`;
    }
    if (!state.adminDraft.title || !state.adminDraft.synopsis || !state.adminDraft.cover) {
      alert('Completa título, sinopsis y portada.');
      return false;
    }
    return true;
  }

  if (step === 2) {
    const selected = Array.from(document.querySelectorAll('.tag-chip.active')).map((chip) => chip.dataset.tag);
    state.adminDraft.categories = selected.filter((tag) => ['Acción','Fantasía','Romance','Drama','Suspenso','Misterio','Vida escolar','Ciencia ficción','Horror'].includes(tag));
    state.adminDraft.tags = selected.filter((tag) => !state.adminDraft.categories.includes(tag));
    if (!state.adminDraft.categories.length) state.adminDraft.categories = ['Acción'];
    if (!state.adminDraft.tags.length) state.adminDraft.tags = ['Drama'];
    return true;
  }

  if (step === 3) {
    document.querySelectorAll('.adminEpisodeCover').forEach((input, index) => {
      state.adminDraft.episodes[index].cover = input.value.trim() || state.adminDraft.cover;
    });
    document.querySelectorAll('.adminEpisodeText').forEach((textarea, index) => {
      state.adminDraft.episodes[index].content = [{ type: 'text', value: textarea.value.trim() || `Capítulo ${index + 1}` }];
    });
    return true;
  }

  if (step === 4) {
    const mode = document.querySelector('input[name="adminPublishMode"]:checked')?.value;
    if (mode) state.adminDraft.publishMode = mode;
    const dateInput = document.getElementById('adminScheduleDate')?.value;
    const timeInput = document.getElementById('adminScheduleTime')?.value;
    if (dateInput && timeInput) {
      state.adminDraft.scheduleAt = `${dateInput}T${timeInput}:00Z`;
    }
    if (state.adminDraft.publishMode === 'schedule' && !state.adminDraft.scheduleAt) {
      alert('Selecciona fecha y hora para publicar próximamente.');
      return false;
    }
    return true;
  }

  return true;
}

async function publishAdminWork() {
  const draft = state.adminDraft;

  if (draft.publishMode === 'schedule' && draft.status === 'EN EMISIÓN') {
    draft.status = 'PRÓXIMAMENTE';
  }

  try {
    const insertedWork = await xanoFetch(XANO_ADMIN_PUBLISH, {
      method: 'POST',
      body: {
        title: draft.title,
        author: state.user.displayName || state.user.email,
        work_type: draft.type,
        status: draft.status,
        synopsis: draft.synopsis,
        cover: draft.cover,
        coverLarge: draft.cover,
        categories: draft.categories,
        tags: draft.tags,
        reads: 0,
        likes: 0,
        dislikes: 0,
        visibility: 'public',
        published_at: draft.status === 'PRÓXIMAMENTE' ? (draft.scheduleAt || new Date().toISOString()) : new Date().toISOString(),
        schedule_at: draft.status === 'PRÓXIMAMENTE' ? draft.scheduleAt : null,
      },
    });

    if (!insertedWork?.id) {
      throw new Error('No se pudo crear la obra');
    }

    const episodesPayload = draft.episodes.map((episode, index) => ({
      work_id: insertedWork.id,
      title: episode.title,
      cover: episode.cover || draft.cover,
      content: episode.content,
      chapter_number: index + 1,
    }));

    for (const episode of episodesPayload) {
      await xanoFetch(XANO_ADMIN_ADD_CHAPTER, {
        method: 'POST',
        body: episode,
      });
    }

    state.adminDraft = null;
    state.adminStep = 1;
    await loadWorks();
    alert('La obra se ha publicado correctamente.');
    window.location.href = 'home.html';
  } catch (error) {
    console.error('Error publicando obra:', error);
    alert('No se pudo publicar la obra. Revisa la consola.');
  }
}
