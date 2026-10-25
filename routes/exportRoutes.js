const express = require('express');
const router = express.Router();

const ExportController =
    require('../controllers/exportController');

router.get(
    '/supplier-ledger',
    ExportController.exportSupplierLedgerZIP
);

module.exports = router;