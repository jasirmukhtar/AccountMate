// All Transactions: server-side column filters, truncated pagination, and an edit modal.
(() => {
  const limit = 10;
  const tbody = document.getElementById('transactionTableBody');
  const pagination = document.getElementById('paginationControls');
  const filters = document.querySelectorAll('.column-filter');
  const modalEl = document.getElementById('transactionModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  let currentPage = 1;
  let currentTransactionId = null;
  let requestSeq = 0;

  const form = createTransactionForm(document.getElementById('transactionForm'), { onSubmit: saveTransaction });

  function getFilters() {
    const values = {};
    filters.forEach(el => {
      const value = el.value.trim();
      if (value) values[el.dataset.filter] = value;
    });
    return values;
  }

  async function loadTransactions(page = 1) {
    const seq = ++requestSeq;
    try {
      const data = await apiRequest(`/api/transaction${buildQuery({ page, limit, ...getFilters() })}`);

      // Ignore responses that arrive after a newer search was started
      if (seq !== requestSeq) return;

      // Filters may shrink the result set below the current page
      if (data.totalPages > 0 && page > data.totalPages) return changePage(data.totalPages);

      const offset = (data.page - 1) * limit;
      document.getElementById('resultSummary').textContent = data.total
        ? `Showing ${offset + 1}–${offset + data.transactions.length} of ${data.total} transactions`
        : '';

      tbody.innerHTML = data.transactions.length
        ? data.transactions.map((tx, idx) => `
            <tr class="row-link" data-id="${tx.transaction_id}">
              <td>${offset + idx + 1}</td>
              <td>${tx.transaction_id}</td>
              <td>${escapeHtml(tx.supplier?.supplier_name)}</td>
              <td>${tx.invoice_no}</td>
              <td>${formatInvoiceDate(tx.invoice_date)}</td>
              <td>${tx.payment_type}</td>
              <td class="num">${formatAmount(tx.amount)}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="7" class="text-center">No transactions found.</td></tr>`;

      renderPagination(pagination, data.page, data.totalPages, changePage);
    } catch (err) {
      console.error('Error loading transactions:', err);
      showToast('Error loading transactions', true);
    }
  }

  function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadTransactions(currentPage);
  }

  async function openTransactionModal(transactionId) {
    try {
      await form.ready;
      const tx = await apiRequest(`/api/transaction/${transactionId}`);
      currentTransactionId = tx.transaction_id;
      form.setValues(tx);
      form.setReadOnly(true);
      modal.show();
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch transaction', true);
    }
  }

  async function saveTransaction(values) {
    const { supplier_name, ...payload } = values;
    try {
      await apiRequest(`/api/transaction/${currentTransactionId}`, {
        method: 'PUT',
        body: { ...payload, invoice_date: `${payload.invoice_date}T00:00:00.000Z` }
      });
      showToast('Transaction updated successfully!');
      form.setReadOnly(true);
      form.focus();
      loadTransactions(currentPage);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error updating transaction', true);
    }
  }

  // Opens on the Edit button, so Enter starts editing
  modalEl.addEventListener('shown.bs.modal', () => form.focus());

  tbody.addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-id]');
    if (row) openTransactionModal(row.dataset.id);
  });

  // Column filters: debounce typing, reset to the first page on change
  let filterTimer = null;
  filters.forEach(el => {
    const eventName = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(() => changePage(1), 300);
    });
  });

  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    filters.forEach(el => { el.value = ''; });
    changePage(1);
  });

  loadTransactions(currentPage);
})();
