const transactionService = require('../services/transactionService');

exports.createNewTransaction = async (req, res) => {
    try {
        const newTransaction = await transactionService.createTransaction(req.body);        
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await transactionService.getTransactions(page, limit);
    res.json(result);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await transactionService.getTransactionById(Number(id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
};