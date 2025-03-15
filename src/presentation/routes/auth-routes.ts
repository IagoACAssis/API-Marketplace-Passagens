import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { RegisterUseCase } from '../../application/useCases/auth/RegisterUseCase';
import { AuthenticateUseCase } from '../../application/useCases/auth/AuthenticateUseCase';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/PrismaUserRepository';
import { AuthService } from '../../infrastructure/auth/auth-service';

export async function authRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const userRepository = new PrismaUserRepository();
  const registerUseCase = new RegisterUseCase(userRepository);
  const authenticateUseCase = new AuthenticateUseCase(userRepository);
  const authService = new AuthService(app);
  const authController = new AuthController(registerUseCase, authenticateUseCase, authService);

  // Rotas de autenticação
  app.post('/register', (req, reply) => authController.register(req, reply));
  app.post('/login', (req, reply) => authController.authenticate(req, reply));
}
