const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

router.get("/createTransaction", (req, res) => {
  res.render("createTransaction");
});

module.exports = router;