// Dashboard: CR (purchases) vs DR (payments) for the selected date range.
(() => {
  const monthlyBody = document.getElementById('monthlyBody');
  const supplierBody = document.getElementById('supplierBody');
  let chart = null;
  let requestSeq = 0;

  const range = createDateRangePicker(document.getElementById('dashboardRange'), {
    requireBoth: true,
    onChange: loadDashboard
  });

  function renderTiles(data, label) {
    const crCount = data.monthly.reduce((a, m) => a + m.crCount, 0);
    const drCount = data.monthly.reduce((a, m) => a + m.drCount, 0);

    document.getElementById('totalCr').textContent = formatAmount(data.totals.cr);
    document.getElementById('totalCrSub').textContent = `${crCount} invoice${crCount === 1 ? '' : 's'}`;
    document.getElementById('totalDr').textContent = formatAmount(data.totals.dr);
    document.getElementById('totalDrSub').textContent = `${drCount} payment${drCount === 1 ? '' : 's'}`;
    document.getElementById('totalNet').innerHTML = netAmountHtml(data.totals.net);
    document.getElementById('totalNetSub').textContent =
      data.totals.net > 0 ? 'Purchased more than paid'
      : data.totals.net < 0 ? 'Paid more than purchased'
      : 'Purchases and payments balanced';

    document.getElementById('periodLabel').textContent =
      `${label} · ${formatDisplayDate(data.from)} – ${formatDisplayDate(data.to)}`;
  }

  function renderMonthlyTable(monthly) {
    monthlyBody.innerHTML = monthly.map(m => `
      <tr>
        <td>${m.label}</td>
        <td class="num">${formatAmount(m.cr)}</td>
        <td class="num">${formatAmount(m.dr)}</td>
        <td class="num">${netAmountHtml(m.cr - m.dr)}</td>
      </tr>
    `).join('');
  }

  function renderSuppliers(suppliers) {
    if (!suppliers.length) {
      supplierBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions in this period</td></tr>`;
      return;
    }
    supplierBody.innerHTML = suppliers.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.supplier_name)}</td>
        <td class="num">${formatAmount(s.cr)}</td>
        <td class="num">${formatAmount(s.dr)}</td>
        <td class="num">${netAmountHtml(s.cr - s.dr)}</td>
      </tr>
    `).join('');
  }

  function renderChart(monthly) {
    const css = getComputedStyle(document.documentElement);
    const color = (v) => css.getPropertyValue(v).trim();
    const barStyle = { borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 48 };

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('crDrChart'), {
      type: 'bar',
      data: {
        labels: monthly.map(m => m.label),
        datasets: [
          { label: 'Purchases (CR)', data: monthly.map(m => m.cr), backgroundColor: color('--cr'), ...barStyle },
          { label: 'Payments (DR)', data: monthly.map(m => m.dr), backgroundColor: color('--dr'), ...barStyle }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: { color: color('--text-secondary'), boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 2 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
              footer: (items) => {
                const cr = items.find(i => i.datasetIndex === 0)?.parsed.y || 0;
                const dr = items.find(i => i.datasetIndex === 1)?.parsed.y || 0;
                return `Net: ${formatAmount(cr - dr)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: color('--grid') },
            ticks: { color: color('--text-muted') }
          },
          y: {
            beginAtZero: true,
            grid: { color: color('--grid') },
            border: { display: false },
            ticks: { color: color('--text-muted'), callback: (v) => formatAmount(v) }
          }
        }
      }
    });
  }

  async function loadDashboard({ from, to, label } = range.getRange()) {
    const seq = ++requestSeq;
    try {
      const data = await apiRequest(`/api/transaction/dashboard/summary${buildQuery({ from, to })}`);

      // Ignore responses that arrive after a newer range was requested
      if (seq !== requestSeq) return;

      renderTiles(data, label);
      renderMonthlyTable(data.monthly);
      renderSuppliers(data.topSuppliers);
      renderChart(data.monthly);
    } catch (err) {
      console.error(err);
      showToast('Error loading dashboard', true);
      const msg = `<tr><td colspan="5" class="text-center text-danger">Error loading dashboard</td></tr>`;
      monthlyBody.innerHTML = msg;
      supplierBody.innerHTML = msg;
    }
  }

  loadDashboard();
})();
