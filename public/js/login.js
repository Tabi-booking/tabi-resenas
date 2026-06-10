(function () {
  'use strict';

  const form = document.getElementById('login-form');
  const btn = document.getElementById('btn-login');
  const errForm = document.getElementById('err-form');

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message || '';
  }

  function clearErrors() {
    setError('err-username', '');
    setError('err-password', '');
    setError('err-form', '');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username) {
      setError('err-username', 'El usuario es obligatorio');
      return;
    }

    if (!password) {
      setError('err-password', 'La contraseña es obligatoria');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando…';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError('err-form', data.error || 'No se pudo iniciar sesión');
        return;
      }

      window.location.href = '/admin';
    } catch {
      setError('err-form', 'Error de conexión. Intenta de nuevo.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
})();
