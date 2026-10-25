// Transaction form (partials/transactionForm.ejs), shared by the New Transaction
// page and the edit modal on All Transactions.
//
// options:
//   onSubmit(values) - called with validated values when the form is submitted
//   onEdit()         - called after the Edit button unlocks the fields
// Returns { ready, getValues, setValues, setReadOnly, reset }.
function createTransactionForm(form, { onSubmit, onEdit } = {}) {
  const el = {
    search: form.querySelector('#supplierSearch'),
    supplier: form.querySelector('#supplierDropdown'),
    amount: form.querySelector('#amount'),
    invoiceNo: form.querySelector('#invoice_no'),
    invoiceDate: form.querySelector('#invoice_date'),
    paymentType: form.querySelector('#payment_type'),
    toggles: form.querySelectorAll('.toggle-btn-group button'),
    submitBtn: form.querySelector('#submitBtn'),
    editBtn: form.querySelector('#editBtn')
  };

  function setPaymentType(type) {
    el.paymentType.value = type;
    el.toggles.forEach(btn => btn.classList.toggle('active', btn.dataset.value === type));
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
    el.search.value = '';
    el.supplier.value = tx.supplier_id ?? tx.supplier?.supplier_id ?? '';
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
    el.search.dispatchEvent(new Event('input'));
    el.supplier.value = '';
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
  attachSupplierSearch(el.search, el.supplier);

  el.editBtn.addEventListener('click', () => {
    setReadOnly(false);
    onEdit?.();
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

  return { ready, getValues, setValues, setReadOnly, reset };
}
