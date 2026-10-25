// Supplier <select> helpers, shared by the transaction form and the supplier report.

// Fills a <select> with all suppliers, keeping a blank placeholder option first.
async function loadSupplierOptions(select, { placeholder = '-- Select Supplier --' } = {}) {
  select.innerHTML = `<option value="">Loading suppliers...</option>`;
  try {
    const suppliers = await apiRequest('/api/supplier');
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    suppliers.forEach(s => select.add(new Option(s.supplier_name, s.supplier_id)));
    return suppliers;
  } catch (err) {
    console.error('Error loading suppliers:', err);
    select.innerHTML = `<option value="">Error loading suppliers</option>`;
    showToast('Error loading suppliers', true);
    return [];
  }
}

// Filters the <select> as the user types and selects the first match.
function attachSupplierSearch(input, select) {
  input.addEventListener('input', () => {
    const filter = input.value.toLowerCase();
    let firstMatch = null;

    Array.from(select.options).forEach(option => {
      if (!option.value) return; // placeholder stays visible
      const match = option.text.toLowerCase().includes(filter);
      option.hidden = !match;
      if (match && !firstMatch) firstMatch = option;
    });

    if (filter) select.value = firstMatch ? firstMatch.value : '';
  });
}
