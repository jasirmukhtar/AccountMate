const prisma = require('../prisma/prismaClient');

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


module.exports = {
    createTransaction
};