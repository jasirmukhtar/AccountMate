const prisma = require('../prisma/prismaClient');
const { get } = require('../routes/supplierRoutes');

async function createTransaction(transactionData) {


try {
  return await prisma.transaction.create({
    data: {
      amount: Number(transactionData.amount),        
      invoice_no: Number(transactionData.invoice_no),
      supplier_id: Number(transactionData.supplier_id),
      payment_type: transactionData.payment_type   
    }
  });
} catch (error) {
    throw new Error("This is a Duplicate Transaction " + error.message);

}
}

async function getTransactions(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      skip,
      take: limit,
      orderBy: { invoice_date: 'asc' },   
      include: { supplier: true } 
    }),
    prisma.transaction.count()
  ]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

async function getTransactionById(id) {

  const txId = Number(id);
  return await prisma.transaction.findUnique({
    where: { transaction_id: txId },
    include: { supplier: {
      select: { supplier_id: true, supplier_name: true, address: true }
    } }   
  });
}

async function updateTransaction(id, payload) {

  const txId = Number(id);
  const existing = await prisma.transaction.findUnique({
    where: { transaction_id: txId }
  });

  if (!existing) {
    throw new Error("Transaction not found");
  }

  const updated = await prisma.transaction.update({
    where: { transaction_id: txId },
    data: payload
  });

  return updated;
}


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction
};