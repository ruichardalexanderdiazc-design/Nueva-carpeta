function initAuth(onReady) {
  auth.onAuthStateChanged((user) => {
    state.user = user;
    updateUserPanel();
    if (typeof onReady === 'function') {
      onReady(user);
    }
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.onclick = () => {
      event.prompt();
      event.userChoice.then(() => {
        installBtn.classList.add('hidden');
      });
    };
  }
});

window.addEventListener('load', () => {
  // Se evita el registro del service worker para que no sirva JavaScript viejo en el login.
  // registerServiceWorker();
  highlightCurrentNav();
});
