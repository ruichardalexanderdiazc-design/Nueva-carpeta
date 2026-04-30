document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    await loadWorks();
    renderBrowse();
  });

  const searchInput = document.getElementById('searchInput');
  const filterType = document.getElementById('filterType');
  const filterStatus = document.getElementById('filterStatus');

  if (searchInput) searchInput.addEventListener('input', renderBrowse);
  if (filterType) filterType.addEventListener('change', renderBrowse);
  if (filterStatus) filterStatus.addEventListener('change', renderBrowse);
});

function renderBrowse() {
  const tags = [...new Set(state.works.flatMap((work) => work.tags || []))];
  const filters = document.getElementById('tagFilters');
  if (filters) {
    filters.innerHTML = '';
    tags.forEach((tag) => {
      const chip = document.createElement('button');
      chip.className = 'tag-chip';
      chip.textContent = tag;
      chip.dataset.tag = tag;
      chip.onclick = () => {
        if (state.browserFilter.tags.includes(tag)) {
          state.browserFilter.tags = state.browserFilter.tags.filter((value) => value !== tag);
        } else {
          state.browserFilter.tags.push(tag);
        }
        renderBrowse();
      };
      if (state.browserFilter.tags.includes(tag)) chip.classList.add('active');
      filters.appendChild(chip);
    });
  }

  const results = filterWorks();
  const grid = document.getElementById('browseGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!results.length) {
    grid.innerHTML = `<div class="card"><div class="card-body"><h3>No encontramos historias</h3><p class="footer-note">Ajusta filtros o prueba otra búsqueda.</p></div></div>`;
    return;
  }

  results.forEach((work) => grid.appendChild(createCard(work, openWorkDetailModal)));
}

function filterWorks() {
  const query = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  state.browserFilter.query = query;
  state.browserFilter.type = document.getElementById('filterType')?.value || 'all';
  state.browserFilter.status = document.getElementById('filterStatus')?.value || 'all';

  let results = state.works.filter((work) => work.visibility === 'public');
  if (state.browserFilter.type !== 'all') {
    results = results.filter((work) => (work.work_type || work.type) === state.browserFilter.type);
  }
  if (state.browserFilter.status !== 'all') {
    results = results.filter((work) => work.status === state.browserFilter.status);
  }
  if (state.browserFilter.tags.length) {
    results = results.filter((work) => state.browserFilter.tags.every((tag) => (work.tags || []).includes(tag)));
  }
  if (state.browserFilter.query) {
    results = results.filter((work) => {
      const text = `${work.title} ${work.author} ${work.synopsis} ${(work.tags || []).join(' ')}`.toLowerCase();
      return text.includes(state.browserFilter.query);
    });
  }
  return results;
}
