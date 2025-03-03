import { UserRole } from '@/domain/entities/User';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';


const prisma = new PrismaClient();

async function main() {
  try {
    // Verifica se já existe um admin
    const adminExists = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN
      }
    });

    if (adminExists) {
      console.log('Administrador já existe. Pulando criação.');
      return;
    }

    // Cria o administrador
    const passwordHash = await hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@marketplace.com',
        passwordHash,
        role: 'ADMIN'
      }
    });

    console.log(`Administrador criado com sucesso: ${admin.email}`);
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
