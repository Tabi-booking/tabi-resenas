(function () {
  'use strict';

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return iso;
    }
  }

  function esc(str) {
    return String(str).replace(/</g, '&lt;');
  }

  function renderRows(rows) {
    const tbody = document.getElementById('tbody');
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">Todavía no hay reseñas.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(
        (r, i) => `
      <tr data-id="${r.id}">
        <td style="color:var(--text-subtle);font-size:12px">${i + 1}</td>
        <td><div class="cell-name">${esc(r.nombre)}</div></td>
        <td><div class="cell-email">${esc(r.correo)}</div></td>
        <td>${r.meseros ? esc(r.meseros) : '<span class="cell-muted">—</span>'}</td>
        <td class="cell-date">${fmtDate(r.fecha)}</td>
        <td><button class="btn-delete" onclick="deleteRow(${r.id})">Eliminar</button></td>
      </tr>
    `
      )
      .join('');
  }

  function updateStats(rows) {
    const total = rows.length;
    document.getElementById('s-total').textContent = total;
    document.getElementById('count-badge').textContent =
      total + ' reseña' + (total !== 1 ? 's' : '');
  }

  async function load() {
    try {
      const res = await fetch('/api/resenas');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const rows = await res.json();
      renderRows(rows);
      updateStats(rows);
    } catch {
      document.getElementById('tbody').innerHTML =
        '<tr><td colspan="6" class="empty-state">Error al cargar las reseñas.</td></tr>';
    }
  }

  window.deleteRow = async function (id) {
    if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch('/api/resenas/' + id, { method: 'DELETE' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (data.ok) load();
    } catch {
      alert('Error al eliminar. Intenta de nuevo.');
    }
  };

  document.getElementById('btn-logout').addEventListener('click', async function () {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/admin/login';
    }
  });

  load();
})();
