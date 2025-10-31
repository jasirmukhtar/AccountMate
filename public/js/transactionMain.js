document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('transactionForm');
  formContainer.innerHTML = createTransactionForm();

  const dropdown = document.getElementById('supplierDropdown');
  const searchInput = document.getElementById('supplierSearch');
  const toggleButtons = document.querySelectorAll('.toggle-btn-group button');
  const hiddenInput = document.getElementById('payment_type');
  const invoiceDate = document.getElementById('invoiceDate');
  invoiceDate.value = new Date().toISOString().split('T')[0];

  toggleButtons.forEach(btn =>
    btn.addEventListener('click', () => {
      toggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hiddenInput.value = btn.dataset.value;
    })
  );

  const transactionId = new URLSearchParams(window.location.search).get('transaction_id');
  loadSuppliers(dropdown, searchInput, transactionId);

  document.getElementById('editBtn').addEventListener('click', () => {
    disableForm(false);
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('formTitle').textContent = 'Edit Transaction';
  });

  const form = document.getElementById('transactionForm');
  let pendingPayload = null;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const amount = +document.getElementById('amount').value;
    const invoice_no = +document.getElementById('invoice_no').value;
    const supplier_id = +dropdown.value;
    const payment_type = hiddenInput.value;
    const invoiceDateVal = invoiceDate.value;

    if (!amount || !invoice_no || !supplier_id) {
      showToast('Please fill all fields!', true);
      return;
    }

    const supplierName = dropdown.options[dropdown.selectedIndex].text;
    document.getElementById('confirmMessage').innerHTML = `
      <strong>Supplier:</strong> ${supplierName}<br>
      <strong>Amount:</strong> ₹${amount}<br>
      <strong>Type:</strong> ${payment_type}<br>
      <strong>Date:</strong> ${invoiceDateVal}
    `;

    pendingPayload = { amount, invoice_no, supplier_id, payment_type, invoiceDate: invoiceDateVal };

    const modalEl = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    document.getElementById('confirmSubmitBtn').onclick = async () => {
      modal.hide(); // ✅ Close modal immediately when clicked

      const url = transactionId ? `/api/transaction/${transactionId}` : '/api/transaction';
      const method = transactionId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingPayload)
        });

        const data = await res.json();

        if (res.ok) {
          showToast(transactionId ? 'Updated successfully' : 'Created successfully');

          // ✅ Reset form after successful submission
          form.reset();

          // Reset defaults
          invoiceDate.value = new Date().toISOString().split('T')[0];
          document.querySelectorAll('.toggle-btn-group button').forEach(b => b.classList.remove('active'));
          document.querySelector('.toggle-btn-group button[data-value="CR"]').classList.add('active');
          hiddenInput.value = 'CR';
          searchInput.value = '';
          dropdown.selectedIndex = 0;

          pendingPayload = null;
        } else {
          showToast(data.message || 'Error', true);
        }
      } catch (err) {
        console.error(err);
        showToast('Error submitting transaction', true);
      }
    };
  });
});
