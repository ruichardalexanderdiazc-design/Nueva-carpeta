document.addEventListener('DOMContentLoaded', () => {
  initAuth(async () => {
    await loadWorks();
    renderLibrary();
  });
});

async function renderLibrary() {
  const libraryGrid = document.getElementById('libraryGrid');
  if (!libraryGrid) return;

  if (!state.user) {
    libraryGrid.innerHTML = `<div class="card"><div class="card-body"><h3>Inicia sesión para ver tu biblioteca</h3><p class="footer-note">Tu biblioteca se sincroniza con tu cuenta Google.</p></div></div>`;
    return;
  }

  const libraryIds = await getUserLibrary();
  const works = state.works.filter((work) => libraryIds.includes(work.id));
  libraryGrid.innerHTML = '';

  if (!works.length) {
    libraryGrid.innerHTML = `<div class="card"><div class="card-body"><h3>Aún no hay nada en tu biblioteca</h3><p class="footer-note">Abre una obra para guardarla automáticamente.</p></div></div>`;
    return;
  }

  works.forEach((work) => libraryGrid.appendChild(createCard(work, openWorkDetailModal)));
}
