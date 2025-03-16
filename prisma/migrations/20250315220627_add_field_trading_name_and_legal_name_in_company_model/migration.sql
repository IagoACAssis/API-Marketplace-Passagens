/*
  Warnings:

  - You are about to drop the column `name` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `companies` DROP COLUMN `name`,
    ADD COLUMN `legalName` VARCHAR(191) NULL,
    ADD COLUMN `tradingName` VARCHAR(191) NULL;
