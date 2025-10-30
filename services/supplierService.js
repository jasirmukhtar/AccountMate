const prisma = require('../prisma/prismaClient');

async function getAllSuppliers() {
  
  return await prisma.supplier.findMany({

    select: {
      supplier_id: true,
      supplier_name: true,
      contact_number: true,
      address: true
    },
    orderBy: { created_at: 'desc' },
  });
}

async function createSupplier(data) {
  return await prisma.supplier.create({ data });
}

async function getSupplierReportById(supplier_id) {

  supplierId = parseInt(supplier_id);
  
  const supplier = await prisma.supplier.findUnique({
    where: { supplier_id: supplierId },
  });

  if (!supplier) throw new Error("Supplier not found");

  // Get all transactions for this supplier, sorted by invoice_date or transaction_id
  const transactions = await prisma.transaction.findMany({
    where: { supplier_id: supplierId },
    orderBy: { invoice_date: 'asc' },
  });

  // Compute running balance
  let runningBalance = Number(supplier.opening_balance ?? 0);
  const report = transactions.map(tx => {
    if (tx.payment_type === 'CR') {
      runningBalance += tx.amount;
    } else if (tx.payment_type === 'DR') {
      runningBalance -= tx.amount;
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
    opening_balance: supplier.opening_balance,
    report,
  };
}

async function getSupplierBalancesReport() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      transactions: true
    }
  });

  let totalBalance = 0;

  const supplierBalances = suppliers.map(supplier => {
    const totalCR = supplier.transactions
      .filter(tx => tx.payment_type === 'CR')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDR = supplier.transactions
      .filter(tx => tx.payment_type === 'DR')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = Number(supplier.opening_balance || 0) + totalCR - totalDR;
    totalBalance += balance;

    return {
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      opening_balance: supplier.opening_balance || 0,
      total_CR: totalCR,
      total_DR: totalDR,
      balance
    };
  });

  return {
    success: true,
    totalBalance,
    suppliers: supplierBalances
  };
}


module.exports = {
  getAllSuppliers,
  createSupplier,
  getSupplierReportById,
  getSupplierBalancesReport
};