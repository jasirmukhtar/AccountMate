// Suppliers: list of all suppliers with contact details.
(() => {
  const tbody = document.getElementById('supplierTableBody');

  async function loadSuppliers() {
    try {
      const suppliers = await apiRequest('/api/supplier');
      tbody.innerHTML = suppliers.length
        ? suppliers.map(s => `
            <tr>
              <td>${escapeHtml(s.supplier_name)}</td>
              <td>${escapeHtml(s.contact_number)}</td>
              <td>${escapeHtml(s.address)}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" class="text-center">No suppliers found</td></tr>`;
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      showToast('Error loading suppliers', true);
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error loading suppliers</td></tr>`;
    }
  }

  loadSuppliers();
})();
