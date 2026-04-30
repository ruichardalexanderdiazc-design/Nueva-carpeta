document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    await loadWorks();
    renderHome();
  });
});

function renderHome() {
  const works = state.works.filter((work) => work.visibility === 'public');
  const now = Date.now();
  const recent = works.filter((work) => {
    if (!work.published_at) return false;
    return now - new Date(work.published_at).getTime() <= 1000 * 60 * 60 * 24 * 14;
  }).slice(0, 4);
  const updates = works.filter((work) => {
    if (!work.updated_at) return false;
    return now - new Date(work.updated_at).getTime() <= 1000 * 60 * 60 * 24 * 7;
  }).slice(0, 4);
  const trending = [...works].sort((a, b) => ((b.reads || 0) + (b.likes || 0)) - ((a.reads || 0) + (a.likes || 0))).slice(0, 4);
  const upcoming = works.filter((work) => String(work.status || '').toUpperCase() === 'PRÓXIMAMENTE' || (work.scheduled_at && new Date(work.scheduled_at).getTime() > now)).slice(0, 4);
  const comicsYManhwas = works.filter((work) => ['CÓMIC', 'COMIC', 'MANGA', 'MANHWA'].includes(String(work.work_type || work.type || '').toUpperCase()));
  const finished = works.filter((work) => String(work.status || '').toUpperCase() === 'FINALIZADO');

  const sectionRecents = document.getElementById('section-recents');
  const sectionUpdates = document.getElementById('section-updates');
  const sectionTrending = document.getElementById('section-trending');
  const sectionUpcoming = document.getElementById('section-upcoming');
  const sectionFinished = document.getElementById('section-finished');
  const sectionCatalog = document.getElementById('section-catalog');
  const sectionCompleted = document.getElementById('section-completed');

  sectionRecents.innerHTML = '';
  if (sectionUpdates) sectionUpdates.innerHTML = '';
  sectionTrending.innerHTML = '';
  sectionUpcoming.innerHTML = '';
  sectionFinished.innerHTML = '';
  sectionCatalog.innerHTML = '';
  if (sectionCompleted) sectionCompleted.innerHTML = '';

  sectionRecents.appendChild(renderHomeSection('AÑADIDOS RECIENTEMENTE', recent.length ? recent : works.slice(0, 4)));
  if (sectionUpdates) sectionUpdates.appendChild(renderHomeSection('ACTUALIZACIONES DIARIAS', updates.length ? updates : trending));
  sectionTrending.appendChild(renderHomeSection('TÍTULOS EN TENDENCIA', trending));
  sectionUpcoming.appendChild(renderHomeSection('PRÓXIMAMENTE', upcoming));
  sectionCatalog.appendChild(renderHomeSection('CÓMICS Y MANHWAS', comicsYManhwas, true));
  sectionFinished.appendChild(renderHomeSection('TERMINADOS', finished));
  if (sectionCompleted) sectionCompleted.appendChild(renderHomeSection('COMICS/MANHWAS/MANGAS TERMINADOS', finished, false, 'browse.html?status=FINALIZADO'));

  const homeStatus = document.getElementById('homeStatus');
  if (homeStatus) {
    homeStatus.textContent = state.user ? `Bienvenido, ${state.user.displayName || state.user.email}` : 'Invitado';
  }
}

function renderHomeSection(title, items, showMore = false, link = 'browse.html') {
  const section = document.createElement('div');
  section.className = 'home-section';
  section.innerHTML = `
    <div class="section-title">
      <h3>${showMore ? `<a class="section-link" href="${link}">${title}</a>` : title}</h3>
      ${showMore ? '<a class="small-link" href="browse.html">Ver todo</a>' : ''}
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  if (!items.length) {
    grid.innerHTML = `<div class="card"><div class="card-body"><h3>No hay historias aquí todavía</h3><p class="footer-note">Explora otras secciones o publica desde el Estudio.</p></div></div>`;
  } else {
    items.forEach((item) => grid.appendChild(createCard(item, openWorkDetailModal)));
  }

  section.appendChild(grid);
  return section;
}
