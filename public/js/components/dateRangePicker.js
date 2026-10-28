// Date range picker (partials/dateRange.ejs): preset buttons + custom From/To.

// Preset name -> { from, to } as "YYYY-MM-DD" ("" means open-ended)
function getPresetRange(name) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const range = (from, to) => ({ from: toISODate(from), to: toISODate(to) });

  switch (name) {
    case 'this-month':    return range(new Date(y, m, 1), now);
    case 'last-month':    return range(new Date(y, m - 1, 1), new Date(y, m, 0));
    case 'last-3-months': return range(new Date(y, m - 2, 1), now);
    case 'last-6-months': return range(new Date(y, m - 5, 1), now);
    case 'this-year':     return range(new Date(y, 0, 1), now);
    case 'all':           return { from: '', to: '' };
    default:              return null;
  }
}

// options:
//   onChange(range)  - called when a preset is picked or Apply is clicked
//   requireBoth      - Apply needs both From and To
// Returns { getRange, validate }; range = { from, to, label }.
function createDateRangePicker(root, { onChange, requireBoth = false } = {}) {
  const fromInput = root.querySelector('[data-range-from]');
  const toInput = root.querySelector('[data-range-to]');
  const applyBtn = root.querySelector('[data-range-apply]');
  const presetButtons = root.querySelectorAll('[data-range]');
  let label = 'Custom range';

  function setActive(name) {
    presetButtons.forEach(b => b.classList.toggle('active', b.dataset.range === name));
  }

  function applyPreset(button) {
    const range = getPresetRange(button.dataset.range);
    fromInput.value = range.from;
    toInput.value = range.to;
    label = button.textContent.trim();
    setActive(button.dataset.range);
  }

  function getRange() {
    return { from: fromInput.value, to: toInput.value, label };
  }

  // Returns an error message, or null when the range is usable
  function validate() {
    const { from, to } = getRange();
    if (requireBoth && (!from || !to)) return 'Please pick both a From and a To date.';
    if (from && to && from > to) return "'From' date must be before 'To' date.";
    return null;
  }

  function markCustom() {
    setActive('custom');
    label = 'Custom range';
  }

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.range === 'custom') {
        markCustom();
        fromInput.focus();
        return;
      }
      applyPreset(button);
      onChange?.(getRange());
    });
  });

  // Editing a date by hand switches to the custom range
  [fromInput, toInput].forEach(input => input.addEventListener('input', markCustom));

  applyBtn?.addEventListener('click', () => {
    const error = validate();
    if (error) return showToast(error, true);
    markCustom();
    onChange?.(getRange());
  });

  // Fill the inputs from the preset marked active in the markup
  const initial = root.querySelector('[data-range].active');
  if (initial && initial.dataset.range !== 'custom') applyPreset(initial);

  return { getRange, validate };
}
