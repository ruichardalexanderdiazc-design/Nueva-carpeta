const APP_VERSION = '1.0.1';
const ADMIN_EMAIL = 'richardalexanderdiaz0@gmail.com';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD4t6Tq1bAell9u6V8UcErv1Ee4gFo78y0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.appspot.com",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:d8407d9235631b7fc6fb0e"
};
const XANO_API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:manga-reader';
const XANO_WORKS_PATH = '/manga_work';
const XANO_CHAPTERS_PATH = '/manga_chapter';
const XANO_LIBRARY_PATH = '/manga_library';
const XANO_INTERACTIONS_PATH = '/manga_interaction';
const XANO_ADMIN_PUBLISH = '/admin/publish-work';
const XANO_ADMIN_ADD_CHAPTER = '/admin/add-chapter';

const state = {
  user: null,
  works: [],
  selectedWorkId: null,
  selectedEpisodeId: null,
  browserFilter: { type: 'all', status: 'all', tags: [], query: '' },
  adminStep: 1,
  adminDraft: null,
};

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function xanoFetch(path, { method = 'GET', body = null, signal = null } = {}) {
  const response = await fetch(`${XANO_API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || `Error ${response.status} en ${path}`);
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadWorks() {
  try {
    const works = await xanoFetch(`${XANO_WORKS_PATH}`);
    state.works = (Array.isArray(works) ? works : []).map((work) => ({
      ...work,
      tags: Array.isArray(work.tags) ? work.tags : (work.tags ? String(work.tags).split(',').map((tag) => tag.trim()) : []),
      categories: Array.isArray(work.categories) ? work.categories : (work.categories ? String(work.categories).split(',').map((cat) => cat.trim()) : []),
    }));
  } catch (error) {
    console.error('Error cargando obras desde Xano:', error.message || error);
    state.works = [];
  }
}

function createCard(item, onClick) {
  const now = Date.now();
  const status = String(item.status || '').toUpperCase();
  const updated = item.updated_at && now - new Date(item.updated_at).getTime() <= 1000 * 60 * 60 * 24 * 7;
  const recent = item.published_at && now - new Date(item.published_at).getTime() <= 1000 * 60 * 60 * 24 * 14;
  let badgeLabel = 'HISTORIA';
  if (status === 'PRÓXIMAMENTE') badgeLabel = 'PRÓXIMAMENTE';
  else if (status === 'FINALIZADO') badgeLabel = 'FINALIZADO';
  else if (updated) badgeLabel = 'ACTUALIZADO';
  else if (recent) badgeLabel = 'NUEVO';
  else badgeLabel = String(item.work_type || item.type || 'CÓMIC').toUpperCase();

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-cover" src="${item.cover || item.coverLarge || 'logo.svg'}" alt="${item.title}" />
    <div class="card-body">
      <span class="card-tag">${badgeLabel}</span>
      <h3 class="card-title">${item.title || 'Título desconocido'}</h3>
      <p class="card-subtitle">${item.author || 'Autor desconocido'} · ${(item.reads || 0).toLocaleString()} leídos</p>
    </div>
  `;
  card.onclick = () => onClick(item);
  return card;
}

function getWorkById(id) {
  return state.works.find((work) => String(work.id) === String(id));
}

async function fetchWorkById(id) {
  try {
    const work = await xanoFetch(`${XANO_WORKS_PATH}/${encodeURIComponent(id)}`);
    const chapters = await xanoFetch(`${XANO_CHAPTERS_PATH}?work_id=eq.${encodeURIComponent(id)}`);
    const comments = await xanoFetch(`${XANO_INTERACTIONS_PATH}?work_id=eq.${encodeURIComponent(id)}&interaction_type=eq.comment`);
    return {
      ...work,
      tags: Array.isArray(work.tags) ? work.tags : (work.tags ? String(work.tags).split(',').map((tag) => tag.trim()) : []),
      categories: Array.isArray(work.categories) ? work.categories : (work.categories ? String(work.categories).split(',').map((cat) => cat.trim()) : []),
      episodes: Array.isArray(chapters) ? chapters.sort((a, b) => Number(a.chapter_number || a.episode_number || 0) - Number(b.chapter_number || b.episode_number || 0)) : [],
      comments: Array.isArray(comments) ? comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [],
    };
  } catch (error) {
    console.warn('Error cargando obra:', error.message || error);
    return getWorkById(id) || null;
  }
}

async function createComment(workId, author, text) {
  if (!workId || !text) return;
  await xanoFetch(XANO_INTERACTIONS_PATH, {
    method: 'POST',
    body: {
      work_id: workId,
      user_id: state.user?.uid || null,
      interaction_type: 'comment',
      value: text,
    },
  });
}

async function saveUserLibrary(workId) {
  if (!state.user || !workId) return;
  try {
    await xanoFetch(XANO_LIBRARY_PATH, {
      method: 'POST',
      body: {
        user_id: state.user.uid,
        work_id: workId,
      },
    });
  } catch (error) {
    console.warn('Error guardando biblioteca:', error.message || error);
  }
}

async function getUserLibrary() {
  if (!state.user) return [];
  try {
    const data = await xanoFetch(`${XANO_LIBRARY_PATH}?user_id=eq.${encodeURIComponent(state.user.uid)}`);
    return Array.isArray(data) ? data.map((item) => item.work_id) : [];
  } catch (error) {
    console.warn('Error cargando biblioteca:', error.message || error);
    return [];
  }
}

function formatCountdown(timestamp) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Ahora disponible';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function updateUserPanel() {
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const userAvatarWrapper = document.getElementById('userAvatarWrapper');
  const signOutBtn = document.getElementById('signOutBtn');
  const adminLinks = document.querySelectorAll('.nav-admin');

  if (userName) {
    userName.textContent = state.user ? state.user.displayName || state.user.email : '';
  }

  if (userAvatar) {
    if (state.user?.photoURL) {
      userAvatar.src = state.user.photoURL;
      userAvatar.classList.remove('hidden');
    } else {
      userAvatar.classList.add('hidden');
    }
  }

  if (userAvatarWrapper) {
    userAvatarWrapper.classList.toggle('hidden', !state.user?.photoURL);
  }

  if (signOutBtn) {
    signOutBtn.hidden = !state.user;
    signOutBtn.onclick = () => auth.signOut();
  }

  const isAdmin = state.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  adminLinks.forEach((link) => {
    link.classList.toggle('hidden', !isAdmin);
  });
}

function openModal(content, options = {}) {
  const overlay = document.getElementById('modalOverlay');
  const modalCard = document.getElementById('modalCard');
  if (!overlay || !modalCard) return;

  const closeButton = options.closable === false ? '' : '<div style="text-align:right;margin-top:16px;"><button class="secondary" id="closeModal">Cerrar</button></div>';
  modalCard.innerHTML = content + closeButton;
  overlay.classList.remove('hidden');
  if (options.closable !== false) {
    document.getElementById('closeModal').onclick = closeModal;
  }
}

async async function openWorkDetailModal(work) {
  if (!work) return;
  let detailedWork = work;
  if (!Array.isArray(work.episodes) || !work.episodes.length || !Array.isArray(work.comments)) {
    detailedWork = await fetchWorkById(work.id);
  }

  const synopsis = detailedWork.synopsis || 'Sinopsis no disponible.';
  const summary = synopsis.length > 220 ? `${synopsis.slice(0, 220).trim()}...` : synopsis;
  const showReadMore = synopsis.length > 220;

  const chapters = (detailedWork.episodes || []).slice(0, 4).map((episode) => `
    <article class="card detail-episode" data-episode="${episode.id}">
      <img class="card-cover" src="${episode.cover || detailedWork.cover}" alt="${episode.title}" />
      <div class="card-body">
        <span class="card-tag">Capítulo ${episode.chapter_number || episode.episode_number || '?'}</span>
        <h3 class="card-title">${episode.title}</h3>
        <p class="card-subtitle">Toca para leer</p>
      </div>
    </article>
  `).join('');

  const comments = (detailedWork.comments || []).map((comment) => `
    <section class="comment-card">
      <div class="comment-meta"><strong>${comment.user_id || comment.author || 'Anon'}</strong><span>${new Date(comment.created_at).toLocaleString()}</span></div>
      <p>${comment.value || comment.comment || ''}</p>
    </section>
  `).join('');

  openModal(`
    <div class="detail-view">
      <div class="detail-actions">
        <button class="secondary" id="detailShare">Compartir</button>
        <button class="secondary" id="detailReport">Reportar</button>
      </div>
      <div class="detail-top">
        <img src="${detailedWork.coverLarge || detailedWork.cover || 'logo.svg'}" alt="${detailedWork.title}" />
        <div class="detail-meta">
          <h2>${detailedWork.title}</h2>
          <p>${detailedWork.author || 'Autor desconocido'} · ${detailedWork.work_type || detailedWork.type || 'Cómic'} · ${detailedWork.status || 'Estado desconocido'}</p>
          <div>${(detailedWork.categories || []).map((cat) => `<span class="card-tag">${cat}</span>`).join(' ')}</div>
          <p class="footer-note">Etiquetas: ${(detailedWork.tags || []).join(', ')}</p>
        </div>
      </div>
      <div class="detail-synopsis">
        <h3>Sinopsis</h3>
        <p id="detailSynopsis">${summary}</p>
        ${showReadMore ? '<button class="secondary" id="detailReadMore">Leer más</button>' : ''}
      </div>
      <div class="detail-stats">
        <div class="stat-card"><strong>Leídos</strong><p>${(detailedWork.reads || 0).toLocaleString()}</p></div>
        <div class="stat-card"><strong>Likes</strong><p>${(detailedWork.likes || 0).toLocaleString()}</p></div>
        <div class="stat-card"><strong>Capítulos</strong><p>${(detailedWork.episodes || []).length}</p></div>
      </div>
      <div class="section-title"><h3>Episodios</h3>${(detailedWork.episodes || []).length ? '<button class="secondary" id="openAllChapters">Ver todos los capítulos</button>' : ''}</div>
      <div class="cards-grid">${chapters || '<div class="card"><div class="card-body"><p>No hay episodios disponibles todavía.</p></div></div>'}</div>
      <div class="detail-comments">
        <div class="section-title"><h3>Comentarios</h3></div>
        ${comments}
        <div class="comment-card">
          <textarea id="commentText" rows="3" placeholder="Escribe un comentario..."></textarea>
          <button class="primary" id="submitComment">Publicar comentario</button>
        </div>
      </div>
    </div>
  `);

  document.getElementById('detailShare')?.addEventListener('click', () => shareWork(detailedWork));
  document.getElementById('detailReport')?.addEventListener('click', () => showReport(detailedWork));
  document.getElementById('detailReadMore')?.addEventListener('click', (event) => {
    const description = document.getElementById('detailSynopsis');
    if (description) {
      description.textContent = synopsis;
      event.target.hidden = true;
    }
  });
  document.getElementById('openAllChapters')?.addEventListener('click', () => openEpisodeListModal(detailedWork));

  document.querySelectorAll('.detail-episode').forEach((card) => {
    card.onclick = () => {
      const episodeId = card.dataset.episode;
      const episode = (detailedWork.episodes || []).find((item) => String(item.id) === String(episodeId));
      if (episode) {
        openChapterModal(detailedWork, episode);
      }
    };
  });
}

function openEpisodeListModal(work) {
  if (!work) return;
  const episodes = (work.episodes || []).map((episode, index) => `
    <article class="reader-chapter-card" data-episode="${episode.id}">
      <img src="${episode.cover || work.cover}" alt="${episode.title}" />
      <div>
        <strong>${episode.title}</strong>
        <span>Capítulo ${episode.chapter_number || episode.episode_number || index + 1}</span>
      </div>
    </article>
  `).join('');

  openModal(`
    <div class="detail-view">
      <div class="section-title"><h3>Lista de episodios</h3></div>
      <div class="reader-chapters">${episodes || '<div class="reader-empty">No hay episodios para mostrar.</div>'}</div>
    </div>
  `);

  document.querySelectorAll('.reader-chapter-card').forEach((card) => {
    card.onclick = () => {
      const episodeId = card.dataset.episode;
      const episode = (work.episodes || []).find((item) => String(item.id) === String(episodeId));
      if (episode) {
        openChapterModal(work, episode);
      }
    };
  });
}

  const submitComment = document.getElementById('submitComment');
  if (submitComment) {
    submitComment.onclick = async () => {
      const text = document.getElementById('commentText').value.trim();
      if (!text) return alert('Escribe un comentario antes de publicar.');
      if (!state.user) return alert('Debes iniciar sesión para comentar.');
      await createComment(detailedWork.id, state.user.displayName || state.user.email, text);
      const updated = await fetchWorkById(detailedWork.id);
      if (updated) {
        await loadWorks();
        openWorkDetailModal(updated);
      }
    };
  }
}

function openChapterModal(work, episode) {
  if (!work || !episode) return;
  const episodes = work.episodes || [];
  const currentIndex = episodes.findIndex((item) => String(item.id) === String(episode.id));
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
  const contentHtml = ((episode.content || [])
    .map((block) => block.type === 'image'
      ? `<img class="reader-image" src="${block.value}" alt="${work.title}" />`
      : `<p>${block.value}</p>`)
    .join('')) || '<div class="reader-empty">No hay contenido disponible para este capítulo.</div>';

  const chapterListHtml = episodes.map((chap, index) => `
    <article class="reader-chapter-card" data-episode="${chap.id}">
      <img src="${chap.cover || work.cover}" alt="${chap.title}" />
      <div>
        <strong>${chap.title}</strong>
        <span>Capítulo ${chap.chapter_number || chap.episode_number || index + 1}</span>
      </div>
    </article>
  `).join('');

  openModal(`
    <div class="reader-shell">
      <div class="reader-top" id="readerTop" style="display:none; justify-content:space-between; align-items:center; gap:12px;">
        <button class="icon-btn" id="readerClose">Cerrar</button>
        <div><strong>${work.title}</strong> · ${episode.title}</div>
        <div style="display:flex; gap:8px;"><button class="icon-btn" id="readerInfo">Info</button><button class="icon-btn" id="readerShare">Compartir</button></div>
      </div>
      <div class="reader-screen" id="readerScreen">
        <div class="reader-content">
          <div class="reader-header-card">
            <img class="reader-cover" src="${work.coverLarge || work.cover || 'logo.svg'}" alt="${work.title}" />
            <div class="reader-header-text">
              <span class="reader-label">${work.work_type || work.type || 'CÓMIC'} · ${work.status || ''}</span>
              <h1>${episode.title}</h1>
              <p class="reader-subtitle">${work.author || 'Autor desconocido'}</p>
              <p class="reader-synopsis">${work.synopsis || ''}</p>
            </div>
          </div>
          <div class="reader-images">${contentHtml}</div>
        </div>
        <div class="reader-overlay hidden" id="readerOverlay">
          <button class="heart-button" id="readerHeart">❤️ +</button>
          <button class="icon-btn" id="readerShareOverlay">Compartir</button>
        </div>
      </div>
      <div class="reader-bottom" id="readerBottom" style="display:none;">
        <button class="icon-btn" id="readerPrev" ${prevEpisode ? '' : 'disabled'}>⬅️</button>
        <button class="icon-btn" id="readerChapterList">☰</button>
        <button class="icon-btn" id="readerNext" ${nextEpisode ? '' : 'disabled'}>➡️</button>
      </div>
      <div class="reader-chapters hidden" id="readerChapters">${chapterListHtml}</div>
    </div>
  `, { closable: false });

  const readerTop = document.getElementById('readerTop');
  const readerBottom = document.getElementById('readerBottom');
  const readerOverlay = document.getElementById('readerOverlay');
  const readerScreen = document.getElementById('readerScreen');

  const toggleControls = () => {
    const visible = readerOverlay.classList.contains('hidden');
    readerOverlay.classList.toggle('hidden', !visible);
    if (readerTop) readerTop.style.display = visible ? 'flex' : 'none';
    if (readerBottom) readerBottom.style.display = visible ? 'flex' : 'none';
  };

  if (readerScreen) {
    readerScreen.onclick = (event) => {
      if (event.target.closest('.icon-btn') || event.target.closest('button') || event.target.closest('.reader-chapter-card')) return;
      toggleControls();
    };
  }

  document.getElementById('readerClose')?.addEventListener('click', closeModal);
  document.getElementById('readerInfo')?.addEventListener('click', () => openWorkDetailModal(work));
  document.getElementById('readerShare')?.addEventListener('click', () => shareWork(work));
  document.getElementById('readerShareOverlay')?.addEventListener('click', () => shareWork(work));
  document.getElementById('readerHeart')?.addEventListener('click', (event) => {
    event.stopPropagation();
    const heartButton = event.currentTarget;
    heartButton.textContent = heartButton.textContent.includes('+') ? '❤️' : '❤️ +';
    alert('ENTENDIDO, RECIBIRÁS UNA NOTIFICACIÓN DE TU CAMPANA CUANDO HAYA UNA NUEVA ACTUALIZACIÓN DE CAPÍTULO');
  });
  document.getElementById('readerPrev')?.addEventListener('click', () => {
    if (prevEpisode) openChapterModal(work, prevEpisode);
  });
  document.getElementById('readerNext')?.addEventListener('click', () => {
    if (nextEpisode) openChapterModal(work, nextEpisode);
  });
  document.getElementById('readerChapterList')?.addEventListener('click', () => {
    document.getElementById('readerChapters')?.classList.toggle('hidden');
  });
  document.querySelectorAll('.reader-chapter-card').forEach((card) => {
    card.onclick = () => {
      const episodeId = card.dataset.episode;
      const episodeItem = episodes.find((item) => String(item.id) === String(episodeId));
      if (episodeItem) openChapterModal(work, episodeItem);
    };
  });

  saveUserLibrary(work.id);
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function shareWork(work) {
  const text = `¡NO DEJO DE LEER ${work.title.toUpperCase()}! Te invito a leer.`;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: work.title, text, url });
  } else {
    openModal(`
      <h3>Compartir ${work.title}</h3>
      <p>Copia el texto o usa el enlace de tu app favorita.</p>
      <textarea readonly rows="4">${text} ${url}</textarea>
      <p><a href="https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}" target="_blank">Compartir en WhatsApp</a></p>
      <p><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank">Compartir en Facebook</a></p>
    `);
  }
}

function showReport(work) {
  openModal(`
    <h3>Reportar ${work.title}</h3>
    <p>Selecciona el motivo y describe el problema.</p>
    <select id="reportReason">
      <option value="Contenido inapropiado">Contenido inapropiado</option>
      <option value="Violencia o gore">Violencia o gore</option>
      <option value="Error en capítulo">Error en capítulo</option>
      <option value="Otro">Otro</option>
    </select>
    <textarea id="reportMessage" rows="4" placeholder="Describe el problema"></textarea>
    <button class="primary" id="submitReport">Enviar reporte</button>
  `);

  document.getElementById('submitReport').onclick = async () => {
    const reason = document.getElementById('reportReason').value;
    const message = document.getElementById('reportMessage').value.trim();
    if (!reason || !message) return alert('Completa motivo y descripción.');
    try {
      await xanoFetch(XANO_INTERACTIONS_PATH, {
        method: 'POST',
        body: {
          work_id: work.id,
          user_id: state.user?.uid || null,
          interaction_type: 'report',
          reason,
          value: message,
        },
      });
      closeModal();
      alert('Reporte enviado. Gracias.');
    } catch (error) {
      alert('No se pudo enviar el reporte. Intenta de nuevo.');
      console.error(error);
    }
  };
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((error) => {
      console.warn('Service worker no registrado:', error);
    });
  }
}

function highlightCurrentNav() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === current);
  });
}
