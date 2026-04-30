document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    await loadWorks();
    renderSearch();
  });

  const searchPageInput = document.getElementById('searchPageInput');
  const searchPageButton = document.getElementById('searchPageButton');

  if (searchPageInput) {
    searchPageInput.addEventListener('input', renderSearch);
  }
  if (searchPageButton) {
    searchPageButton.addEventListener('click', renderSearch);
  }
});

function renderSearch() {
  const queryParam = getQueryParam('search') || getQueryParam('q') || '';
  const queryInput = document.getElementById('searchPageInput');
  if (queryInput && queryParam && !queryInput.value) {
    queryInput.value = queryParam;
  }

  const query = (queryInput?.value || queryParam || '').trim().toLowerCase();
  const selectedType = getQueryParam('work_type') || 'all';
  const sortOption = getQueryParam('sort') || 'reads_desc';
  const grid = document.getElementById('searchGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let results = state.works.filter((work) => work.visibility === 'public');
  if (selectedType !== 'all') {
    results = results.filter((work) => (work.work_type || work.type || '').toLowerCase() === selectedType.toLowerCase());
  }

  if (query) {
    results = results.filter((work) => {
      const text = `${work.title} ${work.author} ${work.synopsis} ${(work.tags || []).join(' ')}`.toLowerCase();
      return text.includes(query);
    });
  }

  if (!query && selectedType === 'all') {
    grid.innerHTML = `<div class="card"><div class="card-body"><h3>Busca por título, autor o etiqueta</h3><p class="footer-note">Usa la barra para descubrir cómics, mangas y manhwas.</p></div></div>`;
    return;
  }

  results.sort((a, b) => {
    if (sortOption === 'likes_desc') return (b.likes || 0) - (a.likes || 0);
    if (sortOption === 'title_asc') return a.title.localeCompare(b.title);
    return (b.reads || 0) - (a.reads || 0);
  });

  if (!results.length) {
    grid.innerHTML = `<div class="card"><div class="card-body"><h3>No se encontraron resultados</h3><p class="footer-note">Prueba otra palabra clave o cambia de género.</p></div></div>`;
    return;
  }

  results.forEach((work) => grid.appendChild(createCard(work, openWorkDetailModal)));
}
