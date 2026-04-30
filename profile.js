document.addEventListener('DOMContentLoaded', () => {
  initAuth(() => {
    renderProfile();
  });
});

function renderProfile() {
  const profileCard = document.getElementById('profileCard');
  if (!profileCard) return;

  if (!state.user) {
    profileCard.innerHTML = `
      <h3>Perfil</h3>
      <p>Inicia sesión con Google para ver tu cuenta y acceder a tu biblioteca.</p>
      <a class="primary" href="index.html">Iniciar sesión</a>
    `;
    return;
  }

  profileCard.innerHTML = `
    <div class="profile-summary">
      <div class="avatar-wrap"><img src="${state.user.photoURL || 'logo.svg'}" alt="Avatar" /></div>
      <div>
        <h3>${state.user.displayName || state.user.email}</h3>
        <p>${state.user.email}</p>
      </div>
    </div>
    <div class="card-body profile-details">
      <p><strong>Usuario:</strong> ${state.user.displayName || state.user.email}</p>
      <p><strong>Email:</strong> ${state.user.email}</p>
      <p><strong>ID:</strong> ${state.user.uid}</p>
      <p><strong>Administrador:</strong> ${state.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'Sí' : 'No'}</p>
    </div>
    <div class="browse-toolbar">
      <button class="primary" id="profileSignOut">Cerrar sesión</button>
      <a class="secondary" href="home.html">Volver al inicio</a>
    </div>
  `;

  document.getElementById('profileSignOut').onclick = () => auth.signOut();
}
