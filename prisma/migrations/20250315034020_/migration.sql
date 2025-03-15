/*
  Warnings:

  - You are about to drop the `amenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `routeamenity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `route` DROP FOREIGN KEY `Route_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `routeamenity` DROP FOREIGN KEY `RouteAmenity_amenityId_fkey`;

-- DropForeignKey
ALTER TABLE `routeamenity` DROP FOREIGN KEY `RouteAmenity_routeId_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_routeId_fkey`;

-- DropIndex
DROP INDEX `Ticket_routeId_fkey` ON `ticket`;

-- DropTable
DROP TABLE `amenity`;

-- DropTable
DROP TABLE `route`;

-- DropTable
DROP TABLE `routeamenity`;

-- CreateTable
CREATE TABLE `routes` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(191) NOT NULL,
    `originState` VARCHAR(191) NULL,
    `originCountry` VARCHAR(191) NOT NULL,
    `originType` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `destinationState` VARCHAR(191) NULL,
    `destinationCountry` VARCHAR(191) NOT NULL,
    `destinationType` VARCHAR(191) NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `arrivalTime` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `totalSeats` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `routes` ADD CONSTRAINT `routes_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
