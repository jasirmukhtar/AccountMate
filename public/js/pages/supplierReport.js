// Supplier Report: running-balance ledger for one supplier over a date range,
// with CR and DR in separate columns, plus Excel / PDF export.
(() => {
  const supplierDropdown = document.getElementById('supplierDropdown');
  const reportBody = document.getElementById('reportBody');
  const reportFoot = document.getElementById('reportFoot');

  let currentReport = []; // rows of the generated report, for export
  let currentMeta = null;  // supplier name, range and totals of the generated report

  const range = createDateRangePicker(document.getElementById('reportRange'), {
    onChange: () => { if (supplierDropdown.value) generateReport(); }
  });

  const rangeLabel = (from, to) => {
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Up to ${to}`;
    return 'All time';
  };

  async function generateReport() {
    const supplierId = supplierDropdown.value;
    if (!supplierId) return showToast('Please select a supplier', true);

    const error = range.validate();
    if (error) return showToast(error, true);
    const { from, to } = range.getRange();

    try {
      const data = await apiRequest(`/api/supplier/report/${supplierId}${buildQuery({ from, to })}`);

      currentMeta = {
        supplier_name: data.supplier_name,
        range: rangeLabel(data.from, data.to),
        total_CR: data.total_CR,
        total_DR: data.total_DR,
        closing_balance: data.closing_balance
      };

      // Opening / brought-forward balance row
      const openingText = data.from ? 'Balance Brought Forward' : 'Opening Balance';
      currentReport = [{ "#": 1, "Invoice No": openingText, "Invoice Date": "", "CR": "", "DR": "", "Balance": data.opening_balance }];
      const rows = [`
        <tr>
          <td>1</td>
          <td colspan="4"><strong>${openingText}</strong></td>
          <td class="num">${formatAmount(data.opening_balance)}</td>
        </tr>
      `];

      data.report.forEach((tx, i) => {
        const idx = i + 2;
        const date = formatInvoiceDate(tx.invoice_date);
        const cr = tx.payment_type === 'CR' ? tx.amount : '';
        const dr = tx.payment_type === 'DR' ? tx.amount : '';
        rows.push(`
          <tr>
            <td>${idx}</td>
            <td>${escapeHtml(tx.invoice_no)}</td>
            <td>${date}</td>
            <td class="num col-cr">${cr === '' ? '' : formatAmount(cr)}</td>
            <td class="num col-dr">${dr === '' ? '' : formatAmount(dr)}</td>
            <td class="num">${formatAmount(tx.balance)}</td>
          </tr>
        `);
        currentReport.push({ "#": idx, "Invoice No": tx.invoice_no, "Invoice Date": date, "CR": cr, "DR": dr, "Balance": tx.balance });
      });

      if (!data.report.length) {
        rows.push(`<tr><td colspan="6" class="text-center text-muted">No transactions in this range</td></tr>`);
      }

      reportBody.innerHTML = rows.join('');
      reportFoot.innerHTML = `
        <tr>
          <td colspan="3" class="text-end">Total</td>
          <td class="num col-cr">${formatAmount(data.total_CR)}</td>
          <td class="num col-dr">${formatAmount(data.total_DR)}</td>
          <td class="num">${formatAmount(data.closing_balance)}</td>
        </tr>
      `;

      document.getElementById('sumOpening').textContent = formatAmount(data.opening_balance);
      document.getElementById('sumCr').textContent = formatAmount(data.total_CR);
      document.getElementById('sumDr').textContent = formatAmount(data.total_DR);
      document.getElementById('sumClosing').textContent = formatAmount(data.closing_balance);
      document.getElementById('summaryRow').classList.remove('d-none');
    } catch (err) {
      console.error(err);
      showToast('Error fetching report', true);
    }
  }

  const exportFileName = (ext) =>
    `SupplierTransactionReport_${safeFileName(currentMeta.supplier_name)}_${safeFileName(currentMeta.range)}.${ext}`;

  function exportExcel() {
    if (!currentReport.length) return showToast('No data to export', true);
    const ws = XLSX.utils.json_to_sheet([
      ...currentReport,
      { "#": "", "Invoice No": "Total", "Invoice Date": "", "CR": currentMeta.total_CR, "DR": currentMeta.total_DR, "Balance": currentMeta.closing_balance }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, exportFileName('xlsx'));
  }

  function exportPDF() {
    if (!currentReport.length) return showToast('No data to export', true);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Supplier Transaction Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`${currentMeta.supplier_name}  |  ${currentMeta.range}`, 14, 23);

    doc.autoTable({
      head: [['#', 'Invoice No', 'Invoice Date', 'CR (Purchase)', 'DR (Payment)', 'Balance']],
      body: currentReport.map(r => [r['#'], r['Invoice No'], r['Invoice Date'], r['CR'], r['DR'], r['Balance']]),
      foot: [['', 'Total', '', currentMeta.total_CR, currentMeta.total_DR, currentMeta.closing_balance]],
      showFoot: 'lastPage',
      startY: 28,
      columnStyles: {
        3: { halign: 'right', textColor: [28, 92, 171] },
        4: { halign: 'right', textColor: [181, 70, 26] },
        5: { halign: 'right' }
      },
      didParseCell: (cell) => {
        if (cell.section !== 'head') return;
        if (cell.column.index === 3) cell.cell.styles.fillColor = [42, 120, 214];
        if (cell.column.index === 4) cell.cell.styles.fillColor = [235, 104, 52];
      }
    });
    doc.save(exportFileName('pdf'));
  }

  document.getElementById('generateReport').addEventListener('click', generateReport);
  document.getElementById('exportExcel').addEventListener('click', exportExcel);
  document.getElementById('exportPDF').addEventListener('click', exportPDF);

  loadSupplierOptions(supplierDropdown);
})();
