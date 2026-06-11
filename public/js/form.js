(function () {
  'use strict';

  const { googleReviewUrl } = window.TABI_REVIEW || {};

  document.getElementById('nombre')?.addEventListener('input', () => clearError('nombre'));
  document.getElementById('correo')?.addEventListener('input', () => clearError('correo'));
  document.getElementById('meseros')?.addEventListener('input', () => clearError('meseros'));

  function showError(field, msg) {
    const el = document.getElementById('err-' + field);
    const input = document.getElementById(field);
    el.textContent = msg;
    el.classList.add('show');
    if (input) input.classList.add('error');
  }

  function clearError(field) {
    const el = document.getElementById('err-' + field);
    const input = document.getElementById(field);
    if (el) {
      el.textContent = '';
      el.classList.remove('show');
    }
    if (input) input.classList.remove('error');
  }

  function validate() {
    let ok = true;
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const meserosRaw = document.getElementById('meseros').value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    ['nombre', 'correo', 'meseros'].forEach((f) => clearError(f));

    if (nombre.length < 2) {
      showError('nombre', 'Ingresa tu nombre (mínimo 2 caracteres).');
      ok = false;
    }
    if (!emailRe.test(correo)) {
      showError('correo', 'Ingresa un correo válido.');
      ok = false;
    }
    if (meserosRaw.length > 100) {
      showError('meseros', 'El nombre del mesero no puede superar 100 caracteres.');
      ok = false;
    }
    return ok;
  }

  function redirectToGoogleReviews() {
    if (googleReviewUrl) {
      window.location.href = googleReviewUrl;
      return;
    }
    showError('nombre', 'No hay enlace de Google Reseñas configurado.');
  }

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btnText = document.getElementById('btn-text');
    const btn = document.getElementById('submit-btn');
    btnText.textContent = 'Continuando…';
    btn.disabled = true;

    const meserosRaw = document.getElementById('meseros').value.trim();
    const payload = {
      nombre: document.getElementById('nombre').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      meseros: meserosRaw === '' ? null : meserosRaw,
    };

    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([f, m]) => showError(f, m));
        }
        btnText.textContent = 'Continuar';
        btn.disabled = false;
        return;
      }

      redirectToGoogleReviews();
    } catch {
      showError('nombre', 'Error de red. Intenta de nuevo.');
      btnText.textContent = 'Continuar';
      btn.disabled = false;
    }
  });
})();
