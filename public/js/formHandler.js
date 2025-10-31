async function loadSuppliers(dropdown, searchInput, transactionId) {
  try {
    const res = await fetch('/api/supplier');
    const suppliersList = await res.json();
    suppliersList.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.supplier_id;
      opt.text = s.supplier_name;
      dropdown.add(opt);
    });

    searchInput.addEventListener('input', function () {
      const filter = this.value.toLowerCase();
      let firstMatch = null;
      Array.from(dropdown.options).forEach(option => {
        const match = option.text.toLowerCase().includes(filter);
        option.style.display = match ? '' : 'none';
        if (match && !firstMatch) firstMatch = option;
      });
      if (firstMatch) dropdown.value = firstMatch.value;
    });

    if (transactionId) await loadTransaction(transactionId);
  } catch (err) {
    console.error('Error loading suppliers', err);
  }
}

async function loadTransaction(id) {
  try {
    const res = await fetch(`/api/transaction/${id}`);
    const tx = await res.json();
    if (!res.ok) return showToast('Failed to load transaction', true);

    document.getElementById('supplierDropdown').value = tx.supplier_id;
    document.getElementById('supplierSearch').value = tx.supplier_name;
    document.getElementById('amount').value = tx.amount;
    document.getElementById('invoice_no').value = tx.invoice_no;
    document.getElementById('invoiceDate').value = tx.invoiceDate.split('T')[0];
    document.getElementById('payment_type').value = tx.payment_type;
    document.querySelectorAll('.toggle-btn-group button')
      .forEach(btn => btn.classList.toggle('active', btn.dataset.value === tx.payment_type));

    disableForm(true);
    document.getElementById('formTitle').textContent = 'View Transaction';
    document.getElementById('editBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'none';
  } catch {
    showToast('Error loading transaction', true);
  }
}

function disableForm(disabled) {
  ['supplierDropdown', 'supplierSearch', 'amount', 'invoice_no', 'invoiceDate']
    .forEach(id => document.getElementById(id).disabled = disabled);
  document.querySelectorAll('.toggle-btn-group button').forEach(btn => btn.disabled = disabled);
}
