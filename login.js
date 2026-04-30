document.addEventListener('DOMContentLoaded', () => {
  console.log('login.js cargado');

  initAuth((user) => {
    if (user) {
      window.location.href = 'home.html';
    }
  });

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
    console.warn('No se pudo establecer persistencia local:', err.message);
  });

  const signInEmail = document.getElementById('signInEmail');
  const registerEmail = document.getElementById('registerEmail');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const termsAccept = document.getElementById('termsAccept');
  const openTerms = document.getElementById('openTerms');
  const openPrivacy = document.getElementById('openPrivacy');
  const authMessage = document.getElementById('authMessage');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');

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

  const requireTerms = () => {
    if (!termsAccept?.checked) {
      showAuthMessage('Acepta los términos y la política de privacidad antes de continuar.', 'error');
      return false;
    }
    return true;
  };

  const openTextModal = (title, contentHtml) => {
    if (!modalOverlay || !modalTitle || !modalContent) return;
    modalTitle.textContent = title;
    modalContent.innerHTML = contentHtml;
    modalOverlay.classList.remove('hidden');
  };

  const closeTextModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = '';
    if (modalContent) modalContent.innerHTML = '';
  };

  if (closeModal) {
    closeModal.addEventListener('click', closeTextModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        closeTextModal();
      }
    });
  }

  if (!signInEmail || !registerEmail || !emailInput || !passwordInput) {
    console.error('Faltan elementos de login:', { signInEmail, registerEmail, emailInput, passwordInput });
  }

  if (signInEmail) {
    signInEmail.addEventListener('click', () => {
      clearAuthMessage();
      if (!requireTerms()) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        return showAuthMessage('Ingresa tu correo y contraseña para iniciar sesión.', 'error');
      }

      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          showAuthMessage('Sesión iniciada. Redirigiendo...', 'success');
        })
        .catch((err) => {
          console.error('Email sign in error', err);
          if (err.code === 'auth/user-not-found') {
            showAuthMessage('Lo sentimos, este correo no está registrado. Primero regístrate o usa otro correo.', 'error');
          } else if (err.code === 'auth/wrong-password') {
            showAuthMessage('Contraseña incorrecta. Verifica tu contraseña e intenta de nuevo.', 'error');
          } else if (err.code === 'auth/invalid-email') {
            showAuthMessage('Correo electrónico inválido. Usa un correo válido.', 'error');
          } else {
            showAuthMessage(`Lo sentimos, no puedes iniciar sesión con este método: ${err.message}`, 'error');
          }
        });
    });
  }

  if (registerEmail) {
    registerEmail.addEventListener('click', () => {
      clearAuthMessage();
      if (!requireTerms()) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

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
              const switchButton = document.getElementById('switchToSignIn');
              if (switchButton) {
                switchButton.addEventListener('click', () => {
                  clearAuthMessage();
                  showAuthMessage('Usa el botón Iniciar sesión para acceder con tu contraseña.', 'info');
                });
              }
            }, 0);
          } else if (err.code === 'auth/weak-password') {
            showAuthMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
          } else if (err.code === 'auth/invalid-email') {
            showAuthMessage('Correo electrónico inválido. Usa un correo válido.', 'error');
          } else {
            showAuthMessage(`Lo sentimos, no puedes registrarte con este método: ${err.message}`, 'error');
          }
        });
    });
  }

  if (openTerms) {
    openTerms.addEventListener('click', () => {
      openTextModal('Términos de uso', `
        <p>Bienvenido/a a YOURMANGA. Esta aplicación te permite acceder a cómics, mangas y manhwas sin anuncios.</p>
        <p>Al registrarte o iniciar sesión aceptas que tu correo y contraseña sean utilizados para autenticarte con Firebase. Tu información se usa únicamente para autenticar tu cuenta y mantener tu sesión activa.</p>
        <p>Queda prohibido utilizar la aplicación para publicar contenido ilegal, ofensivo o que viole derechos de autor. El acceso puede suspenderse si se detecta abuso.</p>
      `);
    });
  }

  if (openPrivacy) {
    openPrivacy.addEventListener('click', () => {
      openTextModal('Política de privacidad', `
        <p>YOURMANGA respeta tu privacidad. Tus datos de autenticación son gestionados por Firebase Auth y se utilizan sólo para iniciar sesión y mantener tu sesión activa.</p>
        <p>No vendemos ni compartimos tu información personal. Sólo almacenamos lo mínimo necesario para el funcionamiento de la app y tu experiencia de lectura.</p>
        <p>Si deseas eliminar tu cuenta, puedes hacerlo desde Firebase o contactando al administrador del proyecto.</p>
      `);
    });
  }
});
