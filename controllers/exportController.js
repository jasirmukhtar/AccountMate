const path = require('path');
const exportService = require('../services/exportService');

exports.exportSupplierLedgerZIP = async (req, res) => {
    try {

        const filePath =
            await exportService.exportSupplierLedgerZIP();

        res.download(
            filePath,
            path.basename(filePath),
            (error) => {

                if (error) {
                    console.error(
                        'Error downloading supplier ledger ZIP:',
                        error
                    );
                }

            }
        );

    } catch (error) {

        console.error(
            'Error exporting supplier ledger ZIP:',
            error
        );

        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};