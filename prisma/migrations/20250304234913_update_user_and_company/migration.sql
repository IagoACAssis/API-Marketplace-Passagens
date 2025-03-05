/*
  Warnings:

  - You are about to drop the column `userId` on the `company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `Company_userId_fkey`;

-- DropIndex
DROP INDEX `Company_userId_key` ON `company`;

-- AlterTable
ALTER TABLE `company` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `companyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
