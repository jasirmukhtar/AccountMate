const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController');

router.get('/', SupplierController.getAllSuppliers);
router.get('/report/:id', SupplierController.getSupplierReportById);
router.get('/balances/report', SupplierController.getSupplierBalancesReport);
router.post('/', SupplierController.createSupplier);

module.exports = router;