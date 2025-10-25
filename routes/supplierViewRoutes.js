const SupplierController = require('../controllers/SupplierController');
const express = require('express');
const router = express.Router();


router.get("/suppliers", (req, res) => {
  res.render("supplier");
});

router.get("/supplier/report", (req, res) => {
  res.render("supplierReport");
});

router.get("/balances-report", (req, res) => {
  res.render("balancesReport");
});

module.exports = router;