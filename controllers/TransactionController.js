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