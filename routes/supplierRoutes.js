const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController');

router.get('/', SupplierController.getAllSuppliers);
router.post('/', SupplierController.createSupplier);

module.exports = router;