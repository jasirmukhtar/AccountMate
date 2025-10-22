const SupplierController = require('../controllers/SupplierController');
const express = require('express');
const router = express.Router();


router.get("/suppliers", (req, res) => {
  res.render("supplier");
});

module.exports = router;