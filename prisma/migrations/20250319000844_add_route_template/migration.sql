-- CreateTable
CREATE TABLE `RouteTemplate` (
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
    `departureTime` VARCHAR(191) NOT NULL,
    `arrivalTime` VARCHAR(191) NOT NULL,
    `daysOfWeek` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `totalSeats` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RouteTemplate_origin_destination_idx`(`origin`, `destination`),
    INDEX `RouteTemplate_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RouteTemplate` ADD CONSTRAINT `RouteTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
