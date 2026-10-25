const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

router.post('/', TransactionController.createNewTransaction);

router.get('/', TransactionController.getTransactions);
router.get('/dashboard/summary', TransactionController.getDashboardSummary);
router.get('/:id', TransactionController.getTransactionById);
router.put('/:id', TransactionController.updateTransactionById);

module.exports = router;