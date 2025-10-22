/*
  Warnings:

  - You are about to drop the column `invoiceDate` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `invoiceDate`,
    ADD COLUMN `invoice_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
