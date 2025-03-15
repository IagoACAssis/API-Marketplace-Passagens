-- CreateTable
CREATE TABLE `amenities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `amenities_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route_amenities` (
    `routeId` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`routeId`, `amenityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `route_amenities` ADD CONSTRAINT `route_amenities_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_amenities` ADD CONSTRAINT `route_amenities_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
