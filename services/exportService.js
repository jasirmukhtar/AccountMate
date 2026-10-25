const prisma = require("../prisma/prismaClient");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { createObjectCsvWriter } = require("csv-writer");

function formatDate(date) {
    if (!date) return "";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
}

function sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/\s+/g, " ")
        .trim();
}

async function exportSupplierLedgerZIP() {

    const suppliers = await prisma.supplier.findMany({
        include: {
            transaction: {
                orderBy: [
                    { invoice_date: "asc" },
                    { transaction_id: "asc" }
                ]
            }
        },
        orderBy: {
            supplier_name: "asc"
        }
    });

    const exportDir = path.join(__dirname, "../exports");

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

 const today = new Date();

const day = String(today.getDate()).padStart(2, "0");
const month = String(today.getMonth() + 1).padStart(2, "0");
const year = today.getFullYear();

const currentDate = `${day}-${month}-${year}`;
console.log("Current Date:", currentDate);

const zipFileName = `supplier-ledgers-${currentDate}.zip`;

const zipPath = path.join(
    exportDir,
    zipFileName
);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
        zlib: { level: 9 }
    });

    archive.pipe(output);

    for (const supplier of suppliers) {

        let balance = Number(supplier.opening_balance || 0);

        const ledger = [];

        // Opening balance
        ledger.push({
            date: "",
            invoice_no: "",
            payment_type: "OPENING",
            debit: 0,
            credit: 0,
            balance: balance
        });

        // Transactions
        for (const tx of supplier.transaction) {

            const amount = Number(tx.amount || 0);

            let debit = 0;
            let credit = 0;

            if (tx.payment_type === "CR") {
                credit = amount;
                balance += amount;
            }

            if (tx.payment_type === "DR") {
                debit = amount;
                balance -= amount;
            }

            ledger.push({
                date: formatDate(tx.invoice_date),
                invoice_no: tx.invoice_no,
                payment_type: tx.payment_type,
                debit: debit,
                credit: credit,
                balance: balance
            });
        }

        const fileName =
            `${sanitizeFileName(supplier.supplier_name)}.csv`;

        const tempFilePath = path.join(
            exportDir,
            fileName
        );

        const csvWriter = createObjectCsvWriter({
            path: tempFilePath,
            header: [
                {
                    id: "date",
                    title: "Date"
                },
                {
                    id: "invoice_no",
                    title: "Invoice No"
                },
                {
                    id: "payment_type",
                    title: "Type"
                },
                {
                    id: "debit",
                    title: "Debit"
                },
                {
                    id: "credit",
                    title: "Credit"
                },
                {
                    id: "balance",
                    title: "Balance"
                }
            ]
        });

        await csvWriter.writeRecords(ledger);

        archive.file(tempFilePath, {
            name: fileName
        });
    }

    await archive.finalize();

    return new Promise((resolve, reject) => {

        output.on("close", () => {
            resolve(zipPath);
        });

        archive.on("error", (error) => {
            reject(error);
        });

    });
}

module.exports = {
    exportSupplierLedgerZIP
};