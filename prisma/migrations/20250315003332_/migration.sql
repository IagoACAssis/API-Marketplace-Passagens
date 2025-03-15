/*
  Warnings:

  - You are about to drop the column `availableSeats` on the `route` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `route` table. All the data in the column will be lost.
  - Added the required column `destinationCountry` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationType` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCountry` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originType` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `route` DROP COLUMN `availableSeats`,
    DROP COLUMN `capacity`,
    ADD COLUMN `destinationCountry` VARCHAR(191) NOT NULL,
    ADD COLUMN `destinationState` VARCHAR(191) NULL,
    ADD COLUMN `destinationType` VARCHAR(191) NOT NULL,
    ADD COLUMN `originCountry` VARCHAR(191) NOT NULL,
    ADD COLUMN `originState` VARCHAR(191) NULL,
    ADD COLUMN `originType` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalSeats` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Amenity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RouteAmenity` (
    `routeId` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`routeId`, `amenityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RouteAmenity` ADD CONSTRAINT `RouteAmenity_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RouteAmenity` ADD CONSTRAINT `RouteAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
