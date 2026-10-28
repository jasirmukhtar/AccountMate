// Bootstrap pagination with a truncated page window: 1 … 4 5 [6] 7 8 … 60

// First, last, and up to `spread` pages either side of current, "…" for gaps
function getPageWindow(current, totalPages, spread = 2) {
  const pages = new Set([1, totalPages]);
  for (let i = current - spread; i <= current + spread; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, idx) => {
    if (idx > 0) {
      const gap = p - sorted[idx - 1];
      if (gap === 2) result.push(p - 1);   // fill a single missing page instead of "…"
      else if (gap > 2) result.push('…');
    }
    result.push(p);
  });
  return result;
}

// Renders into a <ul class="pagination">; onChange(page) fires on click.
function renderPagination(container, current, totalPages, onChange) {
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const item = (label, page, { disabled = false, active = false } = {}) => `
    <li class="page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}">
      <button type="button" class="page-link" data-page="${page}">${label}</button>
    </li>`;

  const parts = [item('Previous', current - 1, { disabled: current <= 1 })];
  getPageWindow(current, totalPages).forEach(p => {
    parts.push(p === '…'
      ? `<li class="page-item disabled page-ellipsis"><span class="page-link">…</span></li>`
      : item(p, p, { active: p === current }));
  });
  parts.push(item('Next', current + 1, { disabled: current >= totalPages }));
  container.innerHTML = parts.join('');

  container.onclick = (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.closest('.disabled')) return;
    onChange(Number(btn.dataset.page));
  };
}
