// Navbar actions (partials/navbar.ejs).

document.getElementById('exportSupplierLedgerBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    await downloadFile('/api/export/supplier-ledger', 'FineCureBackup.zip');
  } catch (err) {
    console.error('Export error:', err);
    showToast('Failed to export supplier ledgers.', true);
  } finally {
    btn.disabled = false;
  }
});
