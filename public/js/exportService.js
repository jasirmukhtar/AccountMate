const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");

async function exportSupplierLedgerCSV() {

  const ledger = await getCompleteSupplierLedger();


  const filePath = path.join(
    __dirname,
    "../exports/supplier-ledger.csv"
  );

  const csvWriter = createCsvWriter({
    path: filePath,

    header: [
      { id: "supplier_id", title: "Supplier ID" },
      { id: "supplier_name", title: "Supplier Name" },
      { id: "contact_number", title: "Contact Number" },
      { id: "address", title: "Address" },
      { id: "date", title: "Date" },
      { id: "invoice_no", title: "Invoice No" },
      { id: "payment_type", title: "Type" },
      { id: "debit", title: "Debit" },
      { id: "credit", title: "Credit" },
      { id: "balance", title: "Balance" }
    ]
  });

  await csvWriter.writeRecords(ledger);

  return filePath;
}