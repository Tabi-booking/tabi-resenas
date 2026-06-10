(function () {
  'use strict';

  const { googleReviewUrl } = window.TABI_REVIEW || {};

  let selectedStars = 0;
  let savedComment = '';
  const starBtns = document.querySelectorAll('.star-btn');

  function renderStars(hovered, selected) {
    starBtns.forEach((btn, i) => {
      const v = i + 1;
      btn.classList.toggle('hover', hovered > 0 && v <= hovered);
      btn.classList.toggle('active', hovered === 0 && v <= selected);
    });
  }

  document.getElementById('ocasion')?.addEventListener('change', () => clearError('ocasion'));

  document.getElementById('meseros')?.addEventListener('input', () => clearError('meseros'));

  starBtns.forEach((btn) => {
    btn.addEventListener('mouseenter', () => renderStars(+btn.dataset.val, selectedStars));
    btn.addEventListener('mouseleave', () => renderStars(0, selectedStars));
    btn.addEventListener('click', () => {
      selectedStars = +btn.dataset.val;
      renderStars(0, selectedStars);
      clearError('calificacion');
    });
  });

  const comentario = document.getElementById('comentario');
  const charNum = document.getElementById('char-num');

  comentario.addEventListener('input', () => {
    const len = Math.min(comentario.value.length, 500);
    charNum.textContent = len;
    if (comentario.value.length > 500) {
      comentario.value = comentario.value.slice(0, 500);
    }
  });

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

  function getSelectedOcasion() {
    const value = document.getElementById('ocasion').value;
    return value ? [value] : [];
  }

  function validate() {
    let ok = true;
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const meserosRaw = document.getElementById('meseros').value.trim();
    const ocasion = getSelectedOcasion();
    const coment = comentario.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    ['nombre', 'correo', 'meseros', 'ocasion', 'calificacion', 'comentario'].forEach((f) =>
      clearError(f)
    );

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
    if (ocasion.length === 0) {
      showError('ocasion', 'Selecciona un tipo de evento.');
      ok = false;
    }
    if (selectedStars === 0) {
      showError('calificacion', 'Selecciona una calificación.');
      ok = false;
    }
    if (!coment) {
      showError('comentario', 'Escribe un comentario.');
      ok = false;
    }
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function showCopyFeedback(message) {
    const feedback = document.getElementById('copy-feedback');
    feedback.textContent = message;
    feedback.style.color = '';
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 3500);
  }

  function finishReviewFlow(reviewText) {
    savedComment = reviewText;
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('success').style.display = 'block';
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
      ocasion: getSelectedOcasion(),
      calificacion: selectedStars,
      comentario: comentario.value.trim(),
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

      finishReviewFlow(payload.comentario);
    } catch {
      showError('nombre', 'Error de red. Intenta de nuevo.');
      btnText.textContent = 'Continuar';
      btn.disabled = false;
    }
  });

  document.getElementById('copy-btn').addEventListener('click', async () => {
    try {
      await copyText(savedComment);
      showCopyFeedback('¡Comentario copiado!');
    } catch {
      const feedback = document.getElementById('copy-feedback');
      feedback.textContent = 'No se pudo copiar. Intenta de nuevo.';
      feedback.style.color = 'var(--error)';
      feedback.classList.add('show');
    }
  });

  document.getElementById('google-link')?.addEventListener('click', (e) => {
    if (!googleReviewUrl) {
      e.preventDefault();
    }
  });
})();
