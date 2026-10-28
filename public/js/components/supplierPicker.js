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

// Turns a text input into a searchable dropdown for a (hidden) <select>, which keeps
// holding the chosen value. Focus or typing opens the list, arrows move the highlight,
// Enter / Tab / blur pick the highlighted supplier, Escape closes.
// Enter is left to bubble after a pick, so the form can move on to the next field.
// Returns { sync } - call it after setting select.value from code.
function attachSupplierSearch(input, select) {
  const menu = document.createElement('div');
  menu.className = 'list-group combo-menu';
  menu.id = `${select.id}Menu`;
  menu.setAttribute('role', 'listbox');
  input.after(menu);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-controls', menu.id);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');

  let matches = [];
  let active = -1;

  const isOpen = () => menu.classList.contains('show');
  const selectedText = () => (select.value ? select.options[select.selectedIndex].text : '');

  // Name-prefix matches first, then matches anywhere in the name
  function render(filter) {
    const q = filter.trim().toLowerCase();
    const options = Array.from(select.options).filter(o => o.value && o.text.toLowerCase().includes(q));
    matches = q
      ? [...options.filter(o => o.text.toLowerCase().startsWith(q)),
         ...options.filter(o => !o.text.toLowerCase().startsWith(q))]
      : options;

    menu.innerHTML = matches.length
      ? matches.map((o, i) => `
          <button type="button" class="list-group-item list-group-item-action" role="option"
                  tabindex="-1" data-index="${i}">${escapeHtml(o.text)}</button>`).join('')
      : `<div class="list-group-item text-muted">No supplier found</div>`;
  }

  function highlight(index) {
    active = matches.length ? Math.max(0, Math.min(index, matches.length - 1)) : -1;
    menu.querySelectorAll('[data-index]').forEach((item, i) => {
      item.classList.toggle('active', i === active);
      if (i === active) item.scrollIntoView({ block: 'nearest' });
    });
  }

  function open(filter) {
    render(filter);
    menu.classList.add('show');
    input.setAttribute('aria-expanded', 'true');
    const current = matches.findIndex(o => o.value === select.value);
    highlight(filter ? 0 : Math.max(current, 0));
  }

  function close() {
    menu.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function pick(index) {
    const option = matches[index];
    select.value = option ? option.value : '';
    input.value = selectedText();
    close();
    select.dispatchEvent(new Event('change'));
  }

  function sync() {
    input.value = selectedText();
    close();
  }

  input.addEventListener('focus', () => {
    input.select();
    open('');
  });

  input.addEventListener('input', () => open(input.value));

  // Leaving the field commits the highlighted match, or clears an unmatched entry
  input.addEventListener('blur', () => {
    if (!isOpen()) return;
    if (input.value === selectedText()) return close();
    pick(input.value.trim() ? active : -1);
  });

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen()) return open('');
        highlight(active + (e.key === 'ArrowDown' ? 1 : -1));
        break;
      case 'Enter':
        if (!isOpen()) return;
        if (active < 0) {
          // Nothing to pick - stay here instead of moving on with no supplier
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        pick(active);
        break;
      case 'Escape':
        if (!isOpen()) return;
        e.stopPropagation(); // don't close a surrounding modal
        sync();
        break;
    }
  });

  // Keep focus in the input while clicking an item, so blur doesn't pick first
  menu.addEventListener('mousedown', (e) => e.preventDefault());
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-index]');
    if (item) pick(Number(item.dataset.index));
  });

  return { sync };
}
