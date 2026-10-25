// Balance Report: suppliers with an outstanding (positive) balance, plus a PDF export.
(() => {
  const tbody = document.getElementById('supplierTableBody');
  const totalCell = document.getElementById('totalBalanceCell');
  let suppliers = [];
  let totalBalance = 0;

  async function loadSupplierBalances() {
    try {
      const data = await apiRequest('/api/supplier/balances/report');
      suppliers = data.suppliers || [];
      totalBalance = Number(data.totalBalance || 0);

      tbody.innerHTML = suppliers.length
        ? suppliers.map((s, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(s.supplier_name)}</td>
              <td class="num">${Number(s.balance).toFixed(2)}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" class="text-center">No suppliers found</td></tr>`;
      totalCell.textContent = totalBalance.toFixed(2);
    } catch (err) {
      console.error(err);
      showToast('Error loading supplier balances', true);
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error loading supplier balances</td></tr>`;
    }
  }

  function generatePDF() {
    if (!suppliers.length) return showToast('No supplier data available', true);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const today = new Date();

    // Min/max balance for the colour grading of the balance column
    const balances = suppliers.map(s => Number(s.balance));
    const minBal = Math.min(...balances);
    const maxBal = Math.max(...balances) === minBal ? minBal + 1 : Math.max(...balances);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(233, 30, 99);
    doc.text('Fine Cure', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${today.toLocaleDateString()}`, 196, 22, { align: 'right' });

    doc.autoTable({
      startY: 30,
      head: [['#', 'Supplier Name', 'Balance']],
      body: suppliers.map((s, idx) => [idx + 1, s.supplier_name, Number(s.balance).toFixed(2)]),
      foot: [['', 'TOTAL', totalBalance.toFixed(2)]],
      showFoot: 'lastPage',
      theme: 'grid',
      styles: {
        fontSize: 13,
        fontStyle: 'bold',
        textColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      headStyles: { fillColor: [0, 188, 212], textColor: [255, 255, 255], fontSize: 14 },
      footStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255], fontSize: 14, halign: 'center' },

      // Balance column shades from white (smallest) to red (largest)
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 2) return;
        const ratio = Math.min(1, Math.max(0, (parseFloat(data.cell.raw) - minBal) / (maxBal - minBal)));
        const shade = Math.round(255 - 155 * ratio);
        data.cell.styles.fillColor = [255, shade, shade];
      }
    });

    doc.save(`supplier_balances_${toISODate(today)}.pdf`);
  }

  document.getElementById('generatePDFBtn').addEventListener('click', generatePDF);

  loadSupplierBalances();
})();
