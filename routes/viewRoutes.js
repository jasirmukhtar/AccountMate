const express = require('express');
const router = express.Router();

// Page routes: path -> EJS view
const pages = {
  '/': 'index',
  '/transaction': 'transaction',
  '/transactions': 'transactions',
  '/suppliers': 'supplier',
  '/supplier/report': 'supplierReport',
  '/balances-report': 'balancesReport'
};

Object.entries(pages).forEach(([path, view]) => {
  router.get(path, (req, res) => res.render(view));
});

module.exports = router;
