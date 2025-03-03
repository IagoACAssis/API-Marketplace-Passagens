import { PrismaClient } from '@prisma/client';

// Criação de uma instância global do PrismaClient
export const prisma = new PrismaClient();
