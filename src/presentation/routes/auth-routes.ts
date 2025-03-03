import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { RegisterUseCase } from '@application/useCases/auth/RegisterUseCase';
import { AuthenticateUseCase } from '@application/useCases/auth/AuthenticateUseCase';
import { PrismaUserRepository } from '@infrastructure/database/prisma/repositories/PrismaUserRepository';

export async function authRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const userRepository = new PrismaUserRepository();
  const registerUseCase = new RegisterUseCase(userRepository);
  const authenticateUseCase = new AuthenticateUseCase(userRepository);
  const authController = new AuthController(registerUseCase, authenticateUseCase);

  // Rotas de autenticação
  app.post('/register', (req, reply) => authController.register(req, reply));
  app.post('/login', (req, reply) => authController.authenticate(req, reply));
}
