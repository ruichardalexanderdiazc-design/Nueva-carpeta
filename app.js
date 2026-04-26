const ADMIN_EMAIL = 'richardalexanderdiaz0@gmail.com';
const STORAGE_KEY = 'yourmanga-app-state-v1';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD4t6Tq1bAell9u6V8UcErv1Ee4gFo78y0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.appspot.com",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:d8407d9235631b7fc6fb0e"
};

const state = {
  user: null,
  works: [],
  selectedWorkId: null,
  selectedEpisodeId: null,
  browserFilter: { type: 'all', status: 'all', tags: [], query: '' },
  adminStep: 1,
  adminDraft: null,
  activePage: 'login',
  showReaderControls: true,
};

const elements = {
  pageLogin: document.getElementById('page-login'),
  pageHome: document.getElementById('page-home'),
  pageBrowse: document.getElementById('page-browse'),
  pageDetail: document.getElementById('page-detail'),
  pageReader: document.getElementById('page-reader'),
  pageLibrary: document.getElementById('page-library'),
  pageAdmin: document.getElementById('page-admin'),
  navButtons: document.querySelectorAll('.nav-btn'),
  signInGoogle: document.getElementById('signInGoogle'),
  showEmailAuth: document.getElementById('showEmailAuth'),
  emailAuth: document.getElementById('emailAuth'),
  signInEmail: document.getElementById('signInEmail'),
  signUpEmail: document.getElementById('signUpEmail'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  signOutBtn: document.getElementById('signOutBtn'),
  userName: document.getElementById('userName'),
  navAdmin: document.querySelector('.nav-admin'),
  sectionRecents: document.getElementById('section-recents'),
  sectionUpcoming: document.getElementById('section-upcoming'),
  sectionDaily: document.getElementById('section-daily'),
  sectionTrending: document.getElementById('section-trending'),
  sectionCatalog: document.getElementById('section-catalog'),
  sectionFinished: document.getElementById('section-finished'),
  sectionFinishedAll: document.getElementById('section-finished-all'),
  homeStatus: document.getElementById('homeStatus'),
  browseGrid: document.getElementById('browseGrid'),
  tagFilters: document.getElementById('tagFilters'),
  searchInput: document.getElementById('searchInput'),
  filterType: document.getElementById('filterType'),
  filterStatus: document.getElementById('filterStatus'),
  detailTop: document.getElementById('detailTop'),
  detailMeta: document.getElementById('detailMeta'),
  detailSynopsis: document.getElementById('detailSynopsis'),
  detailStats: document.getElementById('detailStats'),
  episodePreview: document.getElementById('episodePreview'),
  moreEpisodes: document.getElementById('moreEpisodes'),
  detailComments: document.getElementById('detailComments'),
  shareBtn: document.getElementById('shareBtn'),
  infoBtn: document.getElementById('infoBtn'),
  reportBtn: document.getElementById('reportBtn'),
  readerTop: document.getElementById('readerTop'),
  readerScreen: document.getElementById('readerScreen'),
  readerOverlay: document.getElementById('readerOverlay'),
  readerContent: document.getElementById('readerContent'),
  readerBottom: document.getElementById('readerBottom'),
  readerChapters: document.getElementById('readerChapters'),
  prevChapterBtn: document.getElementById('prevChapterBtn'),
  nextChapterBtn: document.getElementById('nextChapterBtn'),
  navEpisodesBtn: document.getElementById('navEpisodesBtn'),
  readerInfoBtn: document.getElementById('readerInfoBtn'),
  readerShareBtn: document.getElementById('readerShareBtn'),
  libraryGrid: document.getElementById('libraryGrid'),
  adminPanel: document.getElementById('adminPanel'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalCard: document.getElementById('modalCard'),
  cardTemplate: document.getElementById('cardTemplate'),
};

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();

function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      Object.assign(state, parsed);
    } catch (error) {
      console.warn('No se pudo cargar estado:', error);
    }
  }
  if (!state.works || !state.works.length) {
    state.works = getDefaultWorks();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    works: state.works,
    browserFilter: state.browserFilter,
  }));
}

function getDefaultWorks() {
  return [
    {
      id: 'm1',
      title: 'Luz del Reino Sombrío',
      type: 'MANHWA',
      status: 'EN EMISIÓN',
      visibility: 'public',
      cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=80',
      coverLarge: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?auto=format&fit=crop&w=1200&q=80',
      author: 'Richard Díaz',
      synopsis: 'Un guerrero perseguido encuentra el camino para reclamar su honor y descubrir la verdad detrás de la sombra que domina su mundo.',
      categories: ['Acción', 'Fantasía', 'Vida escolar'],
      tags: ['En emisión', '+18', 'Drama'],
      reads: 15430,
      likes: 1429,
      dislikes: 34,
      comments: [
        {id: 'c1', author: 'Luisa', text: '¡Me encanta este manhwa!', date: 'Hace 2 horas'},
      ],
      episodes: [
        {id: 'e1', title: 'Capítulo 1', cover: 'https://images.unsplash.com/photo-1526318472351-bc3a2d8f9b2c?auto=format&fit=crop&w=600&q=80', content: [{type:'text', value:'La historia comienza con un oscuro presagio en las calles de la ciudad.'}, {type:'image', value:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'}]},
        {id: 'e2', title: 'Capítulo 2', cover: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=600&q=80', content: [{type:'text', value:'El protagonista descubre un fragmento de un artefacto antiguo que cambiará todo.'}, {type:'image', value:'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80'}]},
      ],
      createdAt: Date.now() - 2 * 86400000,
      updatedAt: Date.now() - 3600000,
      publishedAt: Date.now() - 2 * 86400000,
      scheduleAt: null,
    },
    {
      id: 'c1',
      title: 'Alas de Niebla',
      type: 'CÓMIC',
      status: 'FINALIZADO',
      visibility: 'public',
      cover: 'https://images.unsplash.com/photo-1515287313105-36a1e07c663f?auto=format&fit=crop&w=700&q=80',
      coverLarge: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      author: 'Sara Montoya',
      synopsis: 'Una historia de supervivencia, misterio y conspiración en un mundo donde los secretos se esconden tras un rostro amable.',
      categories: ['Suspenso', 'Misterio', 'Drama'],
      tags: ['Finalizado', 'Bloody', 'Terror'],
      reads: 8274,
      likes: 813,
      dislikes: 12,
      comments: [
        {id: 'c2', author: 'Javier', text: 'Final increíble y emocionante.', date: 'Hace 4 días'},
      ],
      episodes: [
        {id: 'e3', title: 'Capítulo 1', cover: 'https://images.unsplash.com/photo-1461336550766-2a0b81fba89e?auto=format&fit=crop&w=600&q=80', content: [{type:'text', value:'Una chispa en la oscuridad hace que la protagonista abra los ojos a un nuevo peligro.'}]},
      ],
      createdAt: Date.now() - 14 * 86400000,
      updatedAt: Date.now() - 2 * 86400000,
      publishedAt: Date.now() - 12 * 86400000,
      scheduleAt: null,
    },
    {
      id: 'p1',
      title: 'Cuenta Regresiva',
      type: 'MANGA',
      status: 'PRÓXIMAMENTE',
      visibility: 'public',
      cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80',
      coverLarge: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      author: 'Daniela Rojas',
      synopsis: 'Se acerca el lanzamiento más esperado. Un nuevo manga que combina acción y romance con una historia única.',
      categories: ['Romance', 'Acción', 'Suspenso'],
      tags: ['Próximamente', 'Amor', 'En emisión'],
      reads: 3200,
      likes: 490,
      dislikes: 8,
      comments: [],
      episodes: [],
      createdAt: Date.now() - 3 * 86400000,
      updatedAt: Date.now() - 3 * 86400000,
      publishedAt: Date.now() + 2 * 86400000,
      scheduleAt: Date.now() + 2 * 86400000,
    },
  ];
}

function createCard(item, onClick) {
  const template = elements.cardTemplate.content.cloneNode(true);
  const card = template.querySelector('.card');
  const cover = card.querySelector('.card-cover');
  const tag = card.querySelector('.card-tag');
  const title = card.querySelector('.card-title');
  const subtitle = card.querySelector('.card-subtitle');

  cover.src = item.cover;
  tag.textContent = item.tags[0] || item.status || item.type;
  title.textContent = item.title;
  subtitle.textContent = `${item.author} · ${item.type}`;
  card.onclick = () => onClick(item);
  return card;
}

function openPage(pageId) {
  state.activePage = pageId;
  const pages = document.querySelectorAll('.page');
  pages.forEach((page) => page.classList.toggle('active', page.id === `page-${pageId}`));
  setActiveNav(pageId);
  if (pageId === 'home') renderHome();
  if (pageId === 'browse') renderBrowse();
  if (pageId === 'library') renderLibrary();
  if (pageId === 'admin') renderAdmin();
}

function setActiveNav(pageId) {
  elements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.page === pageId);
  });
}

function renderHome() {
  const works = state.works.filter((work) => work.visibility === 'public');
  const recents = works.filter((work) => work.status === 'EN EMISIÓN' || work.status === 'FINALIZADO').sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,4);
  const upcoming = works.filter((work)=>work.status==='PRÓXIMAMENTE').sort((a,b)=>a.publishedAt-b.publishedAt);
  const trending = [...works].sort((a,b)=>b.reads - a.reads).slice(0,4);
  const daily = works.filter((work)=>work.updatedAt > Date.now() - 86400000).slice(0,4);
  const catalog = works;
  const finished = works.filter((work)=>work.status==='FINALIZADO').slice(0,4);
  const finishedAll = works.filter((work)=>work.status==='FINALIZADO');

  elements.sectionRecents.innerHTML = '';
  elements.sectionUpcoming.innerHTML = '';
  elements.sectionDaily.innerHTML = '';
  elements.sectionTrending.innerHTML = '';
  elements.sectionCatalog.innerHTML = '';
  elements.sectionFinished.innerHTML = '';
  elements.sectionFinishedAll.innerHTML = '';

  elements.sectionRecents.appendChild(renderSection('AÑADIDOS RECIENTEMENTE', recents));
  elements.sectionUpcoming.appendChild(renderSection('PRÓXIMAMENTE', upcoming, true));
  elements.sectionDaily.appendChild(renderSection('ACTUALIZACIONES DIARIAS', daily));
  elements.sectionTrending.appendChild(renderSection('TÍTULOS EN TENDENCIA', trending));
  elements.sectionCatalog.appendChild(renderSection('CÓMICS Y MANHWAS', catalog, false, true));
  elements.sectionFinished.appendChild(renderSection('TERMINADOS', finished));
  elements.sectionFinishedAll.appendChild(renderSection('COMICS/MANHWAS/MANGAS TERMINADOS', finishedAll, false, false, true));

  elements.homeStatus.textContent = `Usuario: ${state.user?.displayName || 'Invitado'}`;
}

function renderSection(title, items, countDown = false, linkToBrowse = false, allowEmpty = false) {
  const section = document.createElement('div');
  section.className = 'section';
  const header = document.createElement('div');
  header.className = 'section-title';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  header.appendChild(h3);
  if (linkToBrowse) {
    const action = document.createElement('button');
    action.className = 'primary';
    action.textContent = 'Ver todo';
    action.addEventListener('click', () => openPage('browse'));
    header.appendChild(action);
  }
  section.appendChild(header);
  const grid = document.createElement('div');
  grid.className = 'cards-grid';
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = `<div class="card-body"><h3>No hay contenidos disponibles</h3><p class="footer-note">Verifica más tarde o publica nuevos capítulos desde el estudio.</p></div>`;
    grid.appendChild(empty);
  } else {
    items.forEach((item) => {
      const card = createCard(item, openDetail);
      if (countDown && item.scheduleAt) {
        const countdown = document.createElement('div');
        countdown.className = 'card-tag';
        countdown.textContent = `Sale en ${formatCountdown(item.scheduleAt)}`;
        card.querySelector('.card-body').prepend(countdown);
      }
      grid.appendChild(card);
    });
  }
  section.appendChild(grid);
  return section;
}

function formatCountdown(timestamp) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Ahora disponible';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function renderBrowse() {
  const tags = [...new Set(state.works.flatMap((work) => work.tags))];
  elements.tagFilters.innerHTML = '';
  tags.forEach((tag) => {
    const chip = document.createElement('button');
    chip.className = 'tag-chip';
    chip.textContent = tag;
    chip.dataset.tag = tag;
    if (state.browserFilter.tags.includes(tag)) chip.classList.add('active');
    chip.onclick = () => toggleFilterTag(tag);
    elements.tagFilters.appendChild(chip);
  });
  updateBrowseGrid();
}

function updateBrowseGrid() {
  const query = elements.searchInput.value.trim().toLowerCase();
  state.browserFilter.query = query;
  state.browserFilter.type = elements.filterType.value;
  state.browserFilter.status = elements.filterStatus.value;
  let results = state.works.filter((work) => work.visibility === 'public');
  if (state.browserFilter.type !== 'all') {
    results = results.filter((work) => work.type === state.browserFilter.type);
  }
  if (state.browserFilter.status !== 'all') {
    results = results.filter((work) => work.status === state.browserFilter.status);
  }
  if (state.browserFilter.tags.length) {
    results = results.filter((work) => state.browserFilter.tags.every((tag) => work.tags.includes(tag)));
  }
  if (query) {
    results = results.filter((work) => work.title.toLowerCase().includes(query) || work.author.toLowerCase().includes(query));
  }
  elements.browseGrid.innerHTML = '';
  if (!results.length) {
    const message = document.createElement('div');
    message.className = 'card';
    message.innerHTML = `<div class="card-body"><h3>No se encontró ningún cómic o manhwa</h3><p class="footer-note">Prueba otro filtro o usa otro término de búsqueda.</p></div>`;
    elements.browseGrid.appendChild(message);
    return;
  }
  results.forEach((work) => {
    elements.browseGrid.appendChild(createCard(work, openDetail));
  });
}

function toggleFilterTag(tag) {
  const index = state.browserFilter.tags.indexOf(tag);
  if (index >= 0) {
    state.browserFilter.tags.splice(index, 1);
  } else {
    state.browserFilter.tags.push(tag);
  }
  renderBrowse();
}

function openDetail(work) {
  state.selectedWorkId = work.id;
  const selected = getWorkById(work.id);
  if (!selected) return;
  saveUserLibrary(selected.id);
  elements.detailTop.innerHTML = `
    <img src="${selected.coverLarge}" alt="${selected.title}" />
    <div class="detail-meta">
      <h2>${selected.title}</h2>
      <p>${selected.author} · ${selected.type} · ${selected.status}</p>
      <div>${selected.categories.map((cat)=>`<span class="card-tag">${cat}</span>`).join(' ')}</div>
    </div>
  `;
  elements.detailSynopsis.innerHTML = `
    <h3>Sinopsis</h3>
    <p id="synopsisText">${selected.synopsis}</p>
  `;
  elements.detailStats.innerHTML = `
    <div class="stat-card"><strong>Leídos</strong><p>${selected.reads.toLocaleString()}</p></div>
    <div class="stat-card"><strong>Likes</strong><p>${selected.likes}</p></div>
    <div class="stat-card"><strong>Dislikes</strong><p>${selected.dislikes}</p></div>
    <div class="stat-card"><strong>Capítulos</strong><p>${selected.episodes.length}</p></div>
  `;
  renderEpisodePreview(selected);
  renderComments(selected);
  openPage('detail');
}

function renderEpisodePreview(work) {
  if (!work.episodes.length) {
    elements.episodePreview.innerHTML = '<div class="card-body"><p>No hay episodios disponibles todavía.</p></div>';
    elements.moreEpisodes.innerHTML = '';
    return;
  }
  const preview = work.episodes.slice(0, 3).map((episode) => `
    <article class="card" data-episode="${episode.id}">
      <img class="card-cover" src="${episode.cover}" alt="${episode.title}" />
      <div class="card-body">
        <div class="card-tag">${episode.title}</div>
        <h3 class="card-title">${episode.title}</h3>
        <p class="card-subtitle">Toca para leer</p>
      </div>
    </article>
  `).join('');
  elements.episodePreview.innerHTML = `<div class="section-title"><h3>Episodios</h3></div><div class="cards-grid">${preview}</div>`;
  elements.episodePreview.querySelectorAll('.card').forEach((card)=>{
    card.onclick = () => openChapter(work.id, card.dataset.episode);
  });
  if (work.episodes.length > 3) {
    elements.moreEpisodes.innerHTML = `<button class="primary" id="showAllEpisodes">Más episodios</button>`;
    document.getElementById('showAllEpisodes').onclick = () => showAllEpisodes(work);
  } else {
    elements.moreEpisodes.innerHTML = '';
  }
}

function showAllEpisodes(work) {
  openModal(`
    <h3>Lista completa de episodios</h3>
    <div class="reader-chapters">${work.episodes.map((episode)=>`
      <article class="reader-chapter-card" data-episode="${episode.id}">
        <img src="${episode.cover}" alt="${episode.title}" />
        <div><strong>${episode.title}</strong><p>${work.title}</p></div>
      </article>`).join('')} </div>
  `);
  document.querySelectorAll('.reader-chapter-card').forEach((card)=>{
    card.onclick = () => {
      closeModal();
      openChapter(work.id, card.dataset.episode);
    };
  });
}

function renderComments(work) {
  const commentsHtml = work.comments.map((comment) => `
    <section class="comment-card">
      <div class="comment-meta"><strong>${comment.author}</strong><span>${comment.date}</span></div>
      <p>${comment.text}</p>
    </section>
  `).join('');
  elements.detailComments.innerHTML = `
    <div class="section-title"><h3>Comentarios</h3></div>
    ${commentsHtml}
    <div class="comment-card">
      <textarea id="commentText" rows="3" placeholder="Escribe un comentario..."></textarea>
      <button class="primary" id="submitComment">Publicar comentario</button>
    </div>
  `;
  document.getElementById('submitComment').onclick = () => {
    const text = document.getElementById('commentText').value.trim();
    if (!text) return alert('Escribe un comentario antes de publicar.');
    work.comments.unshift({
      id: `c-${Date.now()}`,
      author: state.user?.displayName || 'Usuario',
      text,
      date: 'Ahora mismo',
    });
    saveWorks();
    renderComments(work);
  };
}

function openChapter(workId, episodeId) {
  const work = getWorkById(workId);
  const episode = work?.episodes.find((ep) => ep.id === episodeId);
  if (!work || !episode) return;
  state.selectedWorkId = work.id;
  state.selectedEpisodeId = episode.id;
  saveUserLibrary(work.id);
  elements.readerTop.innerHTML = `
    <div><strong>${work.title}</strong> · ${episode.title}</div>
    <div>${work.author}</div>
  `;
  elements.readerContent.innerHTML = `
    <div class="card-body"><h3>${episode.title}</h3><p>${work.synopsis}</p></div>
    ${episode.content.map((block)=> block.type === 'image' ? `<img src="${block.value}" alt="${work.title}" />` : `<p>${block.value}</p>`).join('')}
  `;
  elements.readerOverlay.classList.add('hidden');
  elements.readerBottom.classList.add('hidden');
  renderReaderChapters(work);
  openPage('reader');
}

function renderReaderChapters(work) {
  elements.readerChapters.innerHTML = work.episodes.map((episode) => `
    <article class="reader-chapter-card" data-episode="${episode.id}">
      <img src="${episode.cover}" alt="${episode.title}" />
      <div><strong>${episode.title}</strong><small>${work.title}</small></div>
    </article>
  `).join('');
  elements.readerChapters.querySelectorAll('.reader-chapter-card').forEach((card) => {
    card.onclick = () => openChapter(work.id, card.dataset.episode);
  });
  elements.prevChapterBtn.onclick = () => navigateChapter(-1);
  elements.nextChapterBtn.onclick = () => navigateChapter(1);
  elements.navEpisodesBtn.onclick = () => {
    elements.readerChapters.classList.toggle('hidden');
  };
  elements.readerInfoBtn.onclick = () => openDetail(work);
  elements.readerShareBtn.onclick = () => shareWork(work);
}

function navigateChapter(offset) {
  const work = getWorkById(state.selectedWorkId);
  if (!work) return;
  const index = work.episodes.findIndex((ep) => ep.id === state.selectedEpisodeId);
  const target = work.episodes[index + offset];
  if (target) {
    openChapter(work.id, target.id);
  }
}

function saveUserLibrary(workId) {
  if (!state.user) return;
  const library = getUserLibrary();
  if (!library.includes(workId)) {
    library.push(workId);
    localStorage.setItem(`yourmanga-library-${state.user.uid}`, JSON.stringify(library));
  }
}

function getUserLibrary() {
  if (!state.user) return [];
  const data = localStorage.getItem(`yourmanga-library-${state.user.uid}`);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function renderLibrary() {
  const libraryIds = getUserLibrary();
  const works = libraryIds.map(getWorkById).filter(Boolean);
  elements.libraryGrid.innerHTML = '';
  if (!works.length) {
    elements.libraryGrid.innerHTML = `<div class="card"><div class="card-body"><h3>Tu biblioteca está vacía</h3><p class="footer-note">Abre un cómic o manhwa para que se guarde automáticamente aquí.</p></div></div>`;
    return;
  }
  works.forEach((work) => elements.libraryGrid.appendChild(createCard(work, openDetail)));
}

function openModal(content) {
  elements.modalCard.innerHTML = content + '<div style="text-align:right;margin-top:16px;"><button class="secondary" id="closeModal">Cerrar</button></div>';
  elements.modalOverlay.classList.remove('hidden');
  document.getElementById('closeModal').onclick = closeModal;
}

function closeModal() {
  elements.modalOverlay.classList.add('hidden');
}

function showReport(work) {
  openModal(`
    <h3>Reportar ${work.title}</h3>
    <p>Selecciona el motivo para notificar al administrador.</p>
    <select id="reportReason">
      <option value="Contenido inapropiado">Contenido inapropiado</option>
      <option value="Violencia o gore">Violencia o gore</option>
      <option value="Error en capítulo">Error en capítulo</option>
      <option value="Otro">Otro</option>
    </select>
    <textarea id="reportMessage" rows="4" placeholder="Describe el problema"></textarea>
    <button class="primary" id="submitReport">Enviar reporte</button>
  `);
  document.getElementById('submitReport').onclick = () => {
    const reason = document.getElementById('reportReason').value;
    const message = document.getElementById('reportMessage').value.trim();
    const reports = JSON.parse(localStorage.getItem('yourmanga-reports') || '[]');
    reports.push({id: `r-${Date.now()}`, workId: work.id, reason, message, author: state.user?.displayName || 'Usuario', date: new Date().toLocaleString()});
    localStorage.setItem('yourmanga-reports', JSON.stringify(reports));
    closeModal();
    alert('Reporte enviado al administrador. Gracias.');
  };
}

function shareWork(work) {
  const text = `¡NO DEJO DE LEER ${work.title.toUpperCase()}! TE INVITO A LEER.`;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({title: work.title, text, url});
  } else {
    openModal(`
      <h3>Compartir</h3>
      <p>Copia el mensaje y comparte en tus aplicaciones favoritas.</p>
      <textarea readonly rows="4">${text} ${url}</textarea>
      <p><a href="https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}" target="_blank">Compartir en WhatsApp</a></p>
      <p><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank">Compartir en Facebook</a></p>
      <p><a href="https://www.instagram.com/" target="_blank">Abrir Instagram</a></p>
    `);
  }
}

function getWorkById(id) {
  return state.works.find((work) => work.id === id);
}

function saveWorks() {
  saveState();
}

function renderAdmin() {
  if (!state.user || state.user.email !== ADMIN_EMAIL) {
    elements.adminPanel.innerHTML = `
      <div class="card-body"><h3>Acceso denegado</h3><p>Inicia sesión con la cuenta de administrador para ver el estudio de publicación.</p></div>`;
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
      scheduleAt: null,
      episodes: [],
    };
  }
  const step = state.adminStep;
  elements.adminPanel.innerHTML = `
    <div class="section-title"><h3>Estudio de publicación</h3><span>Paso ${step} de 5</span></div>
    ${renderAdminStep(step)}
    <div class="browse-toolbar"><button class="secondary" id="adminBack">Anterior</button><button class="primary" id="adminNext">${step === 5 ? 'Publicar' : 'Siguiente'}</button></div>
  `;
  document.getElementById('adminBack').disabled = step === 1;
  document.getElementById('adminBack').onclick = () => { if (step > 1) { state.adminStep--; renderAdmin(); }};
  document.getElementById('adminNext').onclick = () => { if (step < 5) { if (saveAdminStep(step)) { state.adminStep++; renderAdmin(); }} else { publishAdminWork(); }};
  elements.adminPanel.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.onclick = () => {
      chip.classList.toggle('active');
    };
  });
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
        <label>Título de la obra</label>
        <input id="adminTitle" value="${state.adminDraft.title}" placeholder="Ej. Dragón Invisible" />
        <label>Sinopsis</label>
        <textarea id="adminSynopsis" rows="4" placeholder="Escribe una sinopsis corta">${state.adminDraft.synopsis}</textarea>
        <label>URL de portada</label>
        <input id="adminCover" value="${state.adminDraft.cover}" placeholder="https://..." />
        <label>Estado</label>
        <select id="adminStatus">
          <option value="FINALIZADO" ${state.adminDraft.status === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
          <option value="EN EMISIÓN" ${state.adminDraft.status === 'EN EMISIÓN' ? 'selected' : ''}>EN EMISIÓN</option>
          <option value="PRÓXIMAMENTE" ${state.adminDraft.status === 'PRÓXIMAMENTE' ? 'selected' : ''}>PRÓXIMAMENTE</option>
        </select>
        <label>Cantidad de capítulos</label>
        <input id="adminChapterCount" type="number" min="1" max="50" value="${state.adminDraft.chapterCount}" />
      </div>
    `;
  }
  if (step === 2) {
    const categories = ['Acción','Fantasía','Romance','Drama','Suspenso','Misterio','Vida escolar','Ciencia ficción','Horror'];
    return `
      <div class="card-body">
        <p>Elige categorías</p>
        ${categories.map((cat)=>`<button class="tag-chip ${state.adminDraft.categories.includes(cat)?'active':''}" data-tag="${cat}">${cat}</button>`).join(' ')}
        <p style="margin-top:14px;">Elige etiquetas</p>
        ${['+18','Finalizado','En emisión','Chico rudo','Cárcel','Vida cotidiana','Adolescentes','Bullying','YAOI','Gore','Sangre','Drama','Suspenso','Historias'].map((tag)=>`<button class="tag-chip ${state.adminDraft.tags.includes(tag)?'active':''}" data-tag="${tag}">${tag}</button>`).join(' ')}
      </div>
    `;
  }
  if (step === 3) {
    const chapters = Array.from({length: state.adminDraft.chapterCount}, (_, index) => index + 1);
    state.adminDraft.episodes = chapters.map((num, idx) => state.adminDraft.episodes[idx] || {id: `new-${num}`, title: `Capítulo ${num}`, cover: '', content: [{type:'text', value:`Contenido del capítulo ${num}.`}]});
    return `
      <div class="card-body">
        <p>Añade portada y contenido a cada capítulo</p>
        ${state.adminDraft.episodes.map((episode)=>`
          <div style="margin-bottom:16px;">
            <strong>${episode.title}</strong>
            <input class="adminEpisodeCover" data-episode="${episode.id}" placeholder="URL de portada" value="${episode.cover}" />
            <textarea class="adminEpisodeText" data-episode="${episode.id}" rows="3" placeholder="Texto del capítulo">${episode.content[0]?.value || ''}</textarea>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (step === 4) {
    if (state.adminDraft.status === 'PRÓXIMAMENTE') {
      const scheduleValue = state.adminDraft.scheduleAt ? new Date(state.adminDraft.scheduleAt).toISOString().slice(0,16) : '';
      return `
        <div class="card-body">
          <p>Fecha de publicación programada</p>
          <input id="adminSchedule" type="datetime-local" value="${scheduleValue}" />
          <p>Revisa los datos antes de publicar.</p>
        </div>
      `;
    }
    return `
      <div class="card-body">
        <p>Revisa los datos antes de publicar</p>
        <ul>
          <li><strong>Tipo:</strong> ${state.adminDraft.type}</li>
          <li><strong>Título:</strong> ${state.adminDraft.title}</li>
          <li><strong>Estado:</strong> ${state.adminDraft.status}</li>
          <li><strong>Chapters:</strong> ${state.adminDraft.chapterCount}</li>
          <li><strong>Categorías:</strong> ${state.adminDraft.categories.join(', ')}</li>
          <li><strong>Etiquetas:</strong> ${state.adminDraft.tags.join(', ')}</li>
        </ul>
      </div>
    `;
  }
  if (step === 5) {
    const preview = state.adminDraft;
    return `
      <div class="card-body">
        <h3>La obra está lista para publicar</h3>
        <img src="${preview.cover}" alt="Portada" style="width:100%;border-radius:18px;object-fit:cover;max-height:280px;" />
        <p><strong>${preview.title}</strong></p>
        <p>Estado de la obra: ${preview.status}</p>
        <p>Número de capítulos: ${preview.chapterCount}</p>
        <p>Tipo de obra: ${preview.type}</p>
        <p>Etiquetas: ${preview.tags.join(', ')}</p>
        <p>Categorías: ${preview.categories.join(', ')}</p>
        <p>Nombre del autor: ${state.user.displayName || state.user.email}</p>
      </div>
    `;
  }
  return '';
}

function saveAdminStep(step) {
  const draft = state.adminDraft;
  if (step === 1) {
    draft.type = document.getElementById('adminType').value;
    draft.title = document.getElementById('adminTitle').value.trim();
    draft.synopsis = document.getElementById('adminSynopsis').value.trim();
    draft.cover = document.getElementById('adminCover').value.trim();
    draft.status = document.getElementById('adminStatus').value;
    draft.chapterCount = Math.max(1, Number(document.getElementById('adminChapterCount').value) || 1);
    if (!draft.title || !draft.synopsis || !draft.cover) {
      alert('Completa título, sinopsis y portada.');
      return false;
    }
    if (draft.status === 'PRÓXIMAMENTE' && !draft.cover) {
      alert('Agrega una portada para publicar próximamente.');
      return false;
    }
    return true;
  }
  if (step === 2) {
    const selected = Array.from(elements.adminPanel.querySelectorAll('.tag-chip.active')).map((chip) => chip.dataset.tag);
    const categories = selected.filter((tag) => ['Acción','Fantasía','Romance','Drama','Suspenso','Misterio','Vida escolar','Ciencia ficción','Horror'].includes(tag));
    const tags = selected.filter((tag) => !categories.includes(tag));
    draft.categories = categories.length ? categories : ['Acción'];
    draft.tags = tags.length ? tags : ['Drama'];
    return true;
  }
  if (step === 3) {
    const covers = Array.from(elements.adminPanel.querySelectorAll('.adminEpisodeCover'));
    const texts = Array.from(elements.adminPanel.querySelectorAll('.adminEpisodeText'));
    covers.forEach((input, index) => {
      draft.episodes[index].cover = input.value.trim() || draft.cover;
    });
    texts.forEach((textarea, index) => {
      draft.episodes[index].content = [{type:'text', value: textarea.value.trim() || `Capítulo ${index+1}` }];
    });
    return true;
  }
  if (step === 4) {
    if (draft.status === 'PRÓXIMAMENTE') {
      const scheduleValue = document.getElementById('adminSchedule').value;
      if (!scheduleValue) {
        alert('Selecciona cuándo quieres publicar la obra.');
        return false;
      }
      draft.scheduleAt = new Date(scheduleValue).getTime();
    }
    return true;
  }
  return true;
}

function publishAdminWork() {
  const draft = state.adminDraft;
  const work = {
    id: `work-${Date.now()}`,
    title: draft.title,
    type: draft.type,
    status: draft.status,
    visibility: 'public',
    cover: draft.cover,
    coverLarge: draft.cover,
    author: state.user.displayName || state.user.email,
    synopsis: draft.synopsis,
    categories: draft.categories,
    tags: [...draft.tags, draft.status === 'PRÓXIMAMENTE' ? 'Próximamente' : draft.status === 'FINALIZADO' ? 'Finalizado' : 'En emisión'],
    reads: 0,
    likes: 0,
    dislikes: 0,
    comments: [],
    episodes: draft.episodes.map((episode, index) => ({
      id: `ep-${Date.now()}-${index}`,
      title: episode.title,
      cover: episode.cover || draft.cover,
      content: episode.content,
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: draft.status === 'PRÓXIMAMENTE' ? draft.scheduleAt : Date.now(),
    scheduleAt: draft.scheduleAt,
  };
  state.works.unshift(work);
  saveState();
  state.adminDraft = null;
  state.adminStep = 1;
  alert(`${work.title} ha sido publicada y aparecerá en el home.`);
  openPage('home');
}

function initAuth() {
  auth.onAuthStateChanged((user) => {
    state.user = user;
    if (user) {
      elements.userName.textContent = user.displayName || user.email;
      elements.signOutBtn.hidden = false;
      elements.navAdmin.hidden = user.email !== ADMIN_EMAIL;
      openPage('home');
    } else {
      elements.userName.textContent = '';
      elements.signOutBtn.hidden = true;
      elements.navAdmin.hidden = true;
      openPage('login');
    }
  });
}

function initEvents() {
  elements.navButtons.forEach((button) => {
    button.onclick = () => openPage(button.dataset.page);
  });
  elements.signInGoogle.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((err) => alert(err.message));
  };
  elements.showEmailAuth.onclick = () => elements.emailAuth.classList.toggle('hidden');
  elements.signInEmail.onclick = () => {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    if (!email || !password) return alert('Completa correo y contraseña.');
    auth.signInWithEmailAndPassword(email, password).catch((err) => alert(err.message));
  };
  elements.signUpEmail.onclick = () => {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    if (!email || !password) return alert('Completa correo y contraseña.');
    auth.createUserWithEmailAndPassword(email, password).then((result)=>{
      result.user.updateProfile({displayName: email.split('@')[0]});
    }).catch((err) => alert(err.message));
  };
  elements.signOutBtn.onclick = () => auth.signOut();
  elements.searchInput.oninput = updateBrowseGrid;
  elements.filterType.onchange = updateBrowseGrid;
  elements.filterStatus.onchange = updateBrowseGrid;
  elements.shareBtn.onclick = () => {
    const work = getWorkById(state.selectedWorkId);
    if (!work) return;
    shareWork(work);
  };
  elements.infoBtn.onclick = () => {
    const work = getWorkById(state.selectedWorkId);
    if (!work) return;
    openDetail(work);
  };
  elements.reportBtn.onclick = () => {
    const work = getWorkById(state.selectedWorkId);
    if (!work) return;
    showReport(work);
  };
  elements.readerScreen.onclick = () => {
    state.showReaderControls = !state.showReaderControls;
    elements.readerOverlay.classList.toggle('hidden', !state.showReaderControls);
    elements.readerBottom.classList.toggle('hidden', !state.showReaderControls);
  };
  document.body.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

loadState();
initAuth();
initEvents();
renderHome();

window.addEventListener('load', () => {
  if (state.activePage === 'login') openPage('login');
});
