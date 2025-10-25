const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

router.get("/transaction", (req, res) => {
  res.render("transaction");
});

router.get("/transactions", (req, res) => {
  res.render("transactions");
});

module.exports = router;