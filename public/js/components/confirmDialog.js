// Shared confirmation dialog (partials/confirmModal.ejs).
// Resolves true when the user confirms, false when they cancel or close it.
// `message` is HTML - escape any user data in it.
// The confirm button takes focus once the dialog is shown, so Enter confirms and Escape cancels.

function confirmDialog({ title = 'Confirm', message = 'Are you sure?', confirmText = 'Yes, Submit' } = {}) {
  const modalEl = document.getElementById('confirmModal');
  const confirmBtn = document.getElementById('confirmSubmitBtn');
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmMessage').innerHTML = message;
  confirmBtn.textContent = confirmText;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  return new Promise(resolve => {
    let confirmed = false;

    const onConfirm = () => {
      confirmed = true;
      modal.hide();
    };
    const onShown = () => confirmBtn.focus();
    const onHidden = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      modalEl.removeEventListener('shown.bs.modal', onShown);
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
      resolve(confirmed);
    };

    confirmBtn.addEventListener('click', onConfirm);
    modalEl.addEventListener('shown.bs.modal', onShown);
    modalEl.addEventListener('hidden.bs.modal', onHidden);
    modal.show();
  });
}
