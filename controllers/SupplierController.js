const supplierService = require('../services/supplierService');


exports.getAllSuppliers = async (req, res) => {
    
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
        res.status
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createSupplier = async (req, res) => {
    
    try {
        const newSupplier = await supplierService.createSupplier(req.body);
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getSupplierReportById = async (req, res) => {
    
    try {
        const supplier = await supplierService.getSupplierReportById(req.params.id);
        res.json(supplier);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSupplierBalancesReport = async (req, res) => {
    
    try {
        const supplier = await supplierService.getSupplierBalancesReport();
        res.status(201).json(supplier);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};







