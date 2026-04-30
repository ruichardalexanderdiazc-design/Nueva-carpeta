document.addEventListener('DOMContentLoaded', () => {
  initAuth((user) => {
    if (user) {
      window.location.href = 'home.html';
    }
  });

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
    console.warn('No se pudo establecer persistencia local:', err.message);
  });

  auth.getRedirectResult().catch((err) => {
    console.warn('Error en getRedirectResult:', err.message);
  });

  const signInGoogle = document.getElementById('signInGoogle');
  const signInEmail = document.getElementById('signInEmail');
  const registerEmail = document.getElementById('registerEmail');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const termsAccept = document.getElementById('termsAccept');
  const openTerms = document.getElementById('openTerms');
  const openPrivacy = document.getElementById('openPrivacy');

  const requireTerms = () => {
    if (!termsAccept?.checked) {
      alert('Acepta los términos y la política de privacidad antes de continuar.');
      return false;
    }
    return true;
  };

  if (signInGoogle) {
    signInGoogle.onclick = () => {
      console.log('Google login click');
      if (!requireTerms()) return;
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch((err) => {
        console.error('Google auth error', err);
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          auth.signInWithRedirect(provider);
          return;
        }
        alert(err.message);
      });
    };
  }

  if (signInEmail) {
    signInEmail.onclick = () => {
      if (!requireTerms()) return;
      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        return alert('Ingresa tu correo y contraseña para iniciar sesión.');
      }
      auth.signInWithEmailAndPassword(email, password).catch((err) => alert(err.message));
    };
  }

  if (registerEmail) {
    registerEmail.onclick = () => {
      if (!requireTerms()) return;
      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        return alert('Ingresa tu correo y contraseña para crear la cuenta.');
      }
      auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert('Cuenta creada correctamente. Bienvenido.'))
        .catch((err) => alert(err.message));
    };
  }

  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');

  const openTextModal = (title, contentHtml) => {
    if (!modalOverlay || !modalTitle || !modalContent) return;
    modalTitle.textContent = title;
    modalContent.innerHTML = contentHtml;
    modalOverlay.classList.remove('hidden');
  };

  const closeTextModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    modalTitle.textContent = '';
    modalContent.innerHTML = '';
  };

  if (closeModal) {
    closeModal.onclick = closeTextModal;
  }

  if (modalOverlay) {
    modalOverlay.onclick = (event) => {
      if (event.target === modalOverlay) {
        closeTextModal();
      }
    };
  }

  if (openTerms) {
    openTerms.onclick = () => {
      openTextModal('Términos de uso', `
        <p>Bienvenido/a a YOURMANGA. Esta aplicación te permite acceder a cómics, mangas y manhwas sin anuncios.</p>
        <p>Al registrarte o iniciar sesión aceptas que tu correo y contraseña sean utilizados para autenticarte con Firebase. Tu información no se comparte con terceros fuera de los servicios necesarios para el funcionamiento de la app.</p>
        <p>Queda prohibido utilizar la aplicación para publicar contenido ilegal, ofensivo o que viole derechos de autor. El acceso puede suspenderse si se detecta abuso.</p>
      `);
    };
  }

  if (openPrivacy) {
    openPrivacy.onclick = () => {
      openTextModal('Política de privacidad', `
        <p>YOURMANGA respeta tu privacidad. Tus datos de autenticación son gestionados por Firebase Auth y se utilizan solo para iniciar sesión y mantener tu sesión activa.</p>
        <p>No vendemos ni compartimos tu información personal. Solo almacenamos lo mínimo necesario para el funcionamiento de la app y tu experiencia de lectura.</p>
        <p>Si deseas eliminar tu cuenta, contacta al administrador o utiliza las herramientas de Firebase asociadas a tu cuenta.</p>
      `);
    };
  }
});
