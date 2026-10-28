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

    const { transaction_id, supplier, invoice_no, invoice_date, payment_type, amount } = req.query;

    const result = await transactionService.getTransactions(page, limit, {
      transaction_id, supplier, invoice_no, invoice_date, payment_type, amount
    });
    res.json(result);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const summary = await transactionService.getDashboardSummary(from, to);
    res.json({ success: true, ...summary });
  } catch (err) {
    console.error("Error building dashboard summary:", err);
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

exports.updateTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await transactionService.updateTransaction(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated,
    });
  } catch (err) {
    const statusCode = err.code === 'NOT_FOUND' ? 404 : err.code === 'DUPLICATE' ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to update transaction',
    });
  }
};