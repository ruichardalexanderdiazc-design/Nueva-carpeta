document.addEventListener('DOMContentLoaded', () => {
  initAuth((user) => {
    if (user) {
      window.location.href = 'home.html';
    }
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
      if (!requireTerms()) return;
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch((err) => {
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

  if (openTerms) {
    openTerms.onclick = (event) => {
      event.preventDefault();
      window.location.href = 'terms.html';
    };
  }

  if (openPrivacy) {
    openPrivacy.onclick = (event) => {
      event.preventDefault();
      window.location.href = 'privacy.html';
    };
  }
});
