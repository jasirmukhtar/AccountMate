// Transaction form (partials/transactionForm.ejs), shared by the New Transaction
// page and the edit modal on All Transactions.
//
// options:
//   onSubmit(values) - called with validated values when the form is submitted
//   onEdit()         - called after the Edit button unlocks the fields
// Returns { ready, getValues, setValues, setReadOnly, reset, focus }.
//
// Keyboard flow (no mouse needed): Enter moves supplier -> amount -> invoice no ->
// invoice date -> payment type -> submit; C / D or arrow keys switch the payment
// type; Ctrl+Enter submits from any field.
function createTransactionForm(form, { onSubmit, onEdit } = {}) {
  const el = {
    search: form.querySelector('#supplierSearch'),
    supplier: form.querySelector('#supplierDropdown'),
    amount: form.querySelector('#amount'),
    invoiceNo: form.querySelector('#invoice_no'),
    invoiceDate: form.querySelector('#invoice_date'),
    paymentType: form.querySelector('#payment_type'),
    toggleGroup: form.querySelector('.toggle-btn-group'),
    toggles: form.querySelectorAll('.toggle-btn-group button'),
    submitBtn: form.querySelector('#submitBtn'),
    editBtn: form.querySelector('#editBtn')
  };

  function setPaymentType(type) {
    el.paymentType.value = type;
    el.toggles.forEach(btn => btn.classList.toggle('active', btn.dataset.value === type));
  }

  const activeToggle = () => el.toggleGroup.querySelector('button.active');
  const fieldOrder = () => [el.search, el.amount, el.invoiceNo, el.invoiceDate, activeToggle(), el.submitBtn];

  function focusNext(current) {
    const next = fieldOrder()[fieldOrder().indexOf(current) + 1];
    if (!next) return;
    next.focus();
    if (next.select) next.select(); // typing replaces the old value
  }

  // Focuses the first field, or the Edit button while the form is read-only
  function focus() {
    if (el.search.disabled) el.editBtn.focus();
    else el.search.focus();
  }

  function getValues() {
    const option = el.supplier.options[el.supplier.selectedIndex];
    return {
      supplier_id: Number(el.supplier.value),
      supplier_name: option ? option.text : '',
      amount: Number(el.amount.value),
      invoice_no: Number(el.invoiceNo.value),
      invoice_date: el.invoiceDate.value,
      payment_type: el.paymentType.value
    };
  }

  function setValues(tx) {
    el.supplier.value = tx.supplier_id ?? tx.supplier?.supplier_id ?? '';
    supplierSearch.sync();
    el.amount.value = tx.amount;
    el.invoiceNo.value = tx.invoice_no;
    el.invoiceDate.value = tx.invoice_date ? String(tx.invoice_date).split('T')[0] : '';
    setPaymentType(tx.payment_type);
  }

  function setReadOnly(readOnly) {
    [el.search, el.supplier, el.amount, el.invoiceNo, el.invoiceDate, ...el.toggles]
      .forEach(input => { input.disabled = readOnly; });
    el.editBtn.style.display = readOnly ? 'block' : 'none';
    el.submitBtn.style.display = readOnly ? 'none' : 'block';
  }

  // Clears the form; the payment type is kept so repeated entries stay quick
  function reset() {
    const type = el.paymentType.value;
    form.reset();
    el.supplier.value = '';
    supplierSearch.sync();
    el.invoiceDate.value = toISODate(new Date());
    setPaymentType(type);
  }

  function validate(values) {
    if (!values.supplier_id || !values.amount || !values.invoice_no || !values.invoice_date) {
      return 'Please fill all fields!';
    }
    return null;
  }

  el.toggles.forEach(btn => btn.addEventListener('click', () => setPaymentType(btn.dataset.value)));
  const supplierSearch = attachSupplierSearch(el.search, el.supplier);

  el.toggleGroup.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    let type = null;
    if (key === 'c') type = 'CR';
    else if (key === 'd') type = 'DR';
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') type = el.paymentType.value === 'CR' ? 'DR' : 'CR';
    if (!type) return;
    e.preventDefault();
    setPaymentType(type);
    activeToggle().focus();
  });

  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing) return;
    if (e.ctrlKey) {
      e.preventDefault();
      if (!el.submitBtn.disabled && el.submitBtn.style.display !== 'none') form.requestSubmit();
      return;
    }
    // Buttons keep their normal Enter behaviour (submit / edit)
    if (e.target === el.submitBtn || e.target === el.editBtn) return;
    e.preventDefault();
    if (el.toggleGroup.contains(e.target)) setPaymentType(e.target.dataset.value);
    focusNext(e.target);
  });

  el.editBtn.addEventListener('click', () => {
    setReadOnly(false);
    onEdit?.();
    el.search.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = getValues();
    const error = validate(values);
    if (error) return showToast(error, true);
    onSubmit?.(values);
  });

  el.invoiceDate.value = toISODate(new Date());
  const ready = loadSupplierOptions(el.supplier, { placeholder: 'Select Supplier' });

  return { ready, getValues, setValues, setReadOnly, reset, focus };
}
