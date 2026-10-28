const prisma = require("../prisma/prismaClient");

async function getAllSuppliers() {
  return await prisma.supplier.findMany({
    select: {
      supplier_id: true,
      supplier_name: true,
      contact_number: true,
      address: true,
    },
    orderBy: { created_at: "desc" },
  });
}

async function createSupplier(data) {
  return await prisma.supplier.create({ data });
}

// from / to are optional "YYYY-MM-DD" strings (inclusive). Invoice dates are
// stored as UTC midnight, so the range is applied on whole UTC days.
async function getSupplierReportById(supplier_id, from, to) {
  const supplierId = parseInt(supplier_id);
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
  const fromDate = isDate(from) ? new Date(`${from}T00:00:00.000Z`) : null;
  const toDate = isDate(to)
    ? new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000)
    : null;

  const supplier = await prisma.supplier.findUnique({
    where: { supplier_id: supplierId },
  });

  if (!supplier) throw new Error("Supplier not found");

  // Balance brought forward = opening balance + everything before the range
  let openingBalance = Number(supplier.opening_balance ?? 0);
  if (fromDate) {
    const prior = await prisma.transaction.groupBy({
      by: ["payment_type"],
      where: { supplier_id: supplierId, invoice_date: { lt: fromDate } },
      _sum: { amount: true },
    });
    for (const p of prior) {
      const sum = p._sum.amount || 0;
      openingBalance += p.payment_type === "CR" ? sum : -sum;
    }
  }

  const invoiceDate = {};
  if (fromDate) invoiceDate.gte = fromDate;
  if (toDate) invoiceDate.lt = toDate;

  const transactions = await prisma.transaction.findMany({
    where: {
      supplier_id: supplierId,
      ...(fromDate || toDate ? { invoice_date: invoiceDate } : {}),
    },
    orderBy: [{ invoice_date: "asc" }, { transaction_id: "asc" }],
  });

  // Compute running balance
  let runningBalance = openingBalance;
  let totalCR = 0;
  let totalDR = 0;
  const report = transactions.map((tx) => {
    if (tx.payment_type === "CR") {
      runningBalance += tx.amount;
      totalCR += tx.amount;
    } else if (tx.payment_type === "DR") {
      runningBalance -= tx.amount;
      totalDR += tx.amount;
    }
    return {
      transaction_id: tx.transaction_id,
      invoice_no: tx.invoice_no,
      invoice_date: tx.invoice_date,
      payment_type: tx.payment_type,
      amount: tx.amount,
      balance: runningBalance,
    };
  });

  return {
    supplier_id: supplier.supplier_id,
    supplier_name: supplier.supplier_name,
    from: fromDate ? from : null,
    to: toDate ? to : null,
    opening_balance: openingBalance,
    total_CR: totalCR,
    total_DR: totalDR,
    closing_balance: runningBalance,
    report,
  };
}

// async function getSupplierBalancesReport() {
//   const suppliers = await prisma.supplier.findMany({
//     include: {
//       transaction: true
//     },
//     orderBy: { supplier_name: 'asc'  }
//   });

//   let totalBalance = 0;

//   const supplierBalances = suppliers.map(supplier => {
//     const totalCR = supplier.transaction
//       .filter(tx => tx.payment_type === 'CR')
//       .reduce((sum, tx) => sum + tx.amount, 0);

//     const totalDR = supplier.transaction
//       .filter(tx => tx.payment_type === 'DR')
//       .reduce((sum, tx) => sum + tx.amount, 0);

//     const balance = Number(supplier.opening_balance || 0) + totalCR - totalDR;
//     totalBalance += balance;

//     return {
//       supplier_id: supplier.supplier_id,
//       supplier_name: supplier.supplier_name,
//       opening_balance: supplier.opening_balance || 0,
//       total_CR: totalCR,
//       total_DR: totalDR,
//       balance
//     };
//   });

//   return {
//     success: true,
//     totalBalance,
//     suppliers: supplierBalances
//   };
// }

async function getSupplierBalancesReport() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      transaction: true,
    },
    orderBy: { supplier_name: "asc" },
  });

  // 1. Calculate balances for all suppliers first
  const allCalculatedSuppliers = suppliers.map((supplier) => {
    const totalCR = supplier.transaction
      .filter((tx) => tx.payment_type === "CR")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDR = supplier.transaction
      .filter((tx) => tx.payment_type === "DR")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = Number(supplier.opening_balance || 0) + totalCR - totalDR;

    return {
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      opening_balance: supplier.opening_balance || 0,
      total_CR: totalCR,
      total_DR: totalDR,
      balance,
    };
  });

  // 2. Filter out suppliers with balance < 0
  const filteredSuppliers = allCalculatedSuppliers.filter(
    (s) => (s.balance) > 0,
  );

  // 3. Calculate the total balance based ONLY on the filtered list
  const totalBalance = filteredSuppliers.reduce((sum, s) => sum + s.balance, 0);

  return {
    success: true,
    totalBalance,
    suppliers: filteredSuppliers,
  };
}

module.exports = {
  getAllSuppliers,
  createSupplier,
  getSupplierReportById,
  getSupplierBalancesReport,
};
