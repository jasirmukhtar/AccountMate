// New Transaction page. With ?transaction_id=<id> it opens that transaction read-only
// and lets the user edit it instead.
(() => {
  const title = document.getElementById('formTitle');
  const transactionId = new URLSearchParams(window.location.search).get('transaction_id');

  const form = createTransactionForm(document.getElementById('transactionForm'), {
    onSubmit: submit,
    onEdit: () => { title.textContent = 'Edit Transaction'; }
  });

  async function submit(values) {
    const confirmed = await confirmDialog({
      title: 'Confirm Transaction',
      message: `
        <strong>Supplier:</strong> ${escapeHtml(values.supplier_name)}<br>
        <strong>Amount:</strong> ₹${formatAmount(values.amount)}<br>
        <strong>Type:</strong> ${values.payment_type}<br>
        <strong>Date:</strong> ${values.invoice_date}
      `
    });
    if (!confirmed) return;

    const { supplier_name, ...payload } = values;

    try {
      if (transactionId) {
        await apiRequest(`/api/transaction/${transactionId}`, {
          method: 'PUT',
          body: { ...payload, invoice_date: `${payload.invoice_date}T00:00:00.000Z` }
        });
        showToast('Updated successfully');
        form.setReadOnly(true);
        title.textContent = 'View Transaction';
      } else {
        await apiRequest('/api/transaction', { method: 'POST', body: payload });
        showToast('Created successfully');
        form.reset();
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error submitting transaction', true);
    }
  }

  async function loadExisting() {
    try {
      const tx = await apiRequest(`/api/transaction/${transactionId}`);
      form.setValues(tx);
      form.setReadOnly(true);
      title.textContent = 'View Transaction';
    } catch (err) {
      console.error(err);
      showToast('Failed to load transaction', true);
    }
  }

  if (transactionId) form.ready.then(loadExisting);
})();
