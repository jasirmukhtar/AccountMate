function createTransactionForm() {
  return `
    <div class="mb-3">
      <label class="form-label">Supplier</label>
      <input type="text" id="supplierSearch" placeholder="Search supplier..." class="form-control mb-1">
      <select name="supplier_id" id="supplierDropdown" class="form-select" required></select>
    </div>
    <div class="mb-3">
      <label class="form-label">Amount</label>
      <input type="number" name="amount" id="amount" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Invoice No</label>
      <input type="number" name="invoice_no" id="invoice_no" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Invoice Date</label>
      <input type="date" id="invoiceDate" name="invoiceDate" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Payment Type</label>
      <div class="btn-group toggle-btn-group" role="group">
        <button type="button" class="btn btn-outline-primary active" data-value="CR">CR</button>
        <button type="button" class="btn btn-outline-primary" data-value="DR">DR</button>
      </div>
      <input type="hidden" name="payment_type" id="payment_type" value="CR">
    </div>
    <button type="submit" class="btn btn-success w-100" id="submitBtn">Create Transaction</button>
    <button type="button" class="btn btn-warning w-100 mt-2" id="editBtn" style="display:none;">Edit</button>
  `;
}

function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${isError ? 'danger' : 'success'} border-0 mb-2`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
