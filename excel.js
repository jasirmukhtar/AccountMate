const workbook = new ExcelJS.Workbook();

const sheet = workbook.addWorksheet("Suppliers");

sheet.columns = [
    { header: "Supplier ID", key: "supplier_id", width: 15 },
    { header: "Supplier Name", key: "supplier_name", width: 30 },
    { header: "Phone", key: "contact_number", width: 20 },
    { header: "Address", key: "address", width: 40 },
    { header: "Opening Balance", key: "opening_balance", width: 20 }
];

suppliers.forEach(s => {

    sheet.addRow({
        supplier_id: s.supplier_id,
        supplier_name: s.supplier_name,
        contact_number: s.contact_number,
        address: s.address,
        opening_balance: s.opening_balance
    });

});

await workbook.xlsx.writeFile(
    path.join(backupFolder, "Suppliers.xlsx")
);