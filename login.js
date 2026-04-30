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

  const authMessage = document.getElementById('authMessage');

  const showAuthMessage = (message, type = 'error') => {
    if (!authMessage) {
      alert(message);
      return;
    }
    authMessage.innerHTML = message;
    authMessage.className = `auth-message ${type}`;
  };

  const clearAuthMessage = () => {
    if (!authMessage) return;
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
  };

  if (signInGoogle) {
    signInGoogle.onclick = () => {
      clearAuthMessage();
      if (!requireTerms()) return;
      if (!auth || !firebase) {
        return showAuthMessage('No se pudo inicializar. Recarga la página e inténtalo de nuevo.', 'error');
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(() => {
          showAuthMessage('Iniciando sesión con Google...', 'success');
        })
        .catch((err) => {
          console.error('Google auth error', err);
          if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
            auth.signInWithRedirect(provider);
            return;
          }
          showAuthMessage(`Lo sentimos, no puedes iniciar sesión con Google: ${err.message}`, 'error');
        });
    };
  }

  if (signInEmail) {
    signInEmail.onclick = () => {
      clearAuthMessage();
      if (!requireTerms()) return;
      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        return showAuthMessage('Ingresa tu correo y contraseña para iniciar sesión.', 'error');
      }
      auth.signInWithEmailAndPassword(email, password).catch((err) => {
        console.error('Email sign in error', err);
        if (err.code === 'auth/user-not-found') {
          showAuthMessage('Lo sentimos, este correo no está registrado. Primero regístrate o usa otro correo.', 'error');
        } else if (err.code === 'auth/wrong-password') {
          showAuthMessage('Contraseña incorrecta. Verifica tu contraseña e intenta de nuevo.', 'error');
        } else {
          showAuthMessage(`Lo sentimos, no puedes iniciar sesión con este método: ${err.message}`, 'error');
        }
      });
    };
  }

  if (registerEmail) {
    registerEmail.onclick = () => {
      clearAuthMessage();
      if (!requireTerms()) return;
      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        return showAuthMessage('Ingresa tu correo y contraseña para crear la cuenta.', 'error');
      }
      auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
          showAuthMessage('Cuenta creada correctamente. Redirigiendo...', 'success');
        })
        .catch((err) => {
          console.error('Register error', err);
          if (err.code === 'auth/email-already-in-use') {
            showAuthMessage('Lo sentimos, este correo ya está registrado en una cuenta. ¿Es tuya? <button type="button" id="switchToSignIn" class="link-button">Inicia sesión</button>', 'error');
            setTimeout(() => {
              document.getElementById('switchToSignIn')?.addEventListener('click', () => {
                clearAuthMessage();
                showAuthMessage('Usa el botón Iniciar sesión para acceder con tu contraseña.', 'info');
              });
            }, 0);
          } else if (err.code === 'auth/weak-password') {
            showAuthMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
          } else if (err.code === 'auth/invalid-email') {
            showAuthMessage('Correo electrónico inválido. Usa un correo válido.', 'error');
          } else {
            showAuthMessage(`Lo sentimos, no puedes registrarte con este método: ${err.message}`, 'error');
          }
        });
    };
  }

  if (openTerms) {
    openTerms.onclick = () => {
      openTextModal('Términos de uso', `
        <p>Bienvenido/a a YOURMANGA. Esta aplicación te permite acceder a cómics, mangas y manhwas sin anuncios.</p>
        <p>Al registrarte o iniciar sesión aceptas que tu correo y contraseña sean utilizados para autenticarte con Firebase. Tu información se usa únicamente para autenticar tu cuenta y mantener tu sesión activa.</p>
        <p>Queda prohibido utilizar la aplicación para publicar contenido ilegal, ofensivo o que viole derechos de autor. El acceso puede suspenderse si se detecta abuso.</p>
      `);
    };
  }

  if (openPrivacy) {
    openPrivacy.onclick = () => {
      openTextModal('Política de privacidad', `
        <p>YOURMANGA respeta tu privacidad. Tus datos de autenticación son gestionados por Firebase Auth y se utilizan sólo para iniciar sesión y mantener tu sesión activa.</p>
        <p>No vendemos ni compartimos tu información personal. Sólo almacenamos lo mínimo necesario para el funcionamiento de la app y tu experiencia de lectura.</p>
        <p>Si deseas eliminar tu cuenta, puedes hacerlo desde Firebase o contactando al administrador del proyecto.</p>
      `);
    };
  }
});
