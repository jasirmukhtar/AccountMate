const supplierService = require('../services/supplierService');


exports.getAllSuppliers = async (req, res) => {
    
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
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





