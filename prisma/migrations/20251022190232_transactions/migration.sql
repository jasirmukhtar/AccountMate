-- CreateTable
CREATE TABLE `Transaction` (
    `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_no` INTEGER NOT NULL,
    `payment_type` ENUM('CR', 'DR') NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,

    UNIQUE INDEX `Transaction_supplier_id_payment_type_invoice_no_key`(`supplier_id`, `payment_type`, `invoice_no`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
