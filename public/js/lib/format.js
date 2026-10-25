// Formatting helpers shared by every page.

function formatAmount(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Local Date -> "YYYY-MM-DD", the format <input type="date"> and the API use
function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "YYYY-MM-DD" -> "25 Oct 2026"
function formatDisplayDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Invoice date from the API (ISO datetime) -> local date string
function formatInvoiceDate(value) {
  return value ? new Date(value).toLocaleDateString() : '';
}

// Net amount wrapped in a colour class: positive = still payable, negative = overpaid
function netAmountHtml(net) {
  const cls = net > 0 ? 'net-pos' : net < 0 ? 'net-neg' : '';
  return `<span class="${cls}">${formatAmount(net)}</span>`;
}

function safeFileName(value) {
  return String(value || '').replace(/[^\w-]+/g, '_');
}
