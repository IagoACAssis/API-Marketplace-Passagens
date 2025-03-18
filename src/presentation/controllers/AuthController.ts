import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RegisterUseCase } from '../../application/useCases/auth/RegisterUseCase';
import { AuthenticateUseCase } from '../../application/useCases/auth/AuthenticateUseCase';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '../../domain/entities/User';
import { AuthService } from '../../infrastructure/auth/auth-service';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  cpf: z.string().optional(),
  phone: z.string().optional()
});

const authenticateSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/**
 * Controller responsável pelas rotas de autenticação
 */
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private authenticateUseCase: AuthenticateUseCase,
    private authService: AuthService
  ) {}

  /**
   * Registra um novo usuário
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      // pega os dados do usuario
      const { name, email, password, cpf, phone } = registerSchema.parse(request.body);

      // registra o usuario
      const { user } = await this.registerUseCase.execute({
        name,
        email,
        password,
        cpf,
        phone        
      });

      // retorna o usuario criado
      return reply.status(201).send({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(409).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  /**
   * Autentica um usuário existente
   */
  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = authenticateSchema.parse(request.body);

      const user = await this.authenticateUseCase.execute({
        email,
        password
      });

      // Gera o token JWT
      const token = this.authService.generateUserToken({
        id: user.userId,
        companyId: user.companyId,
        role: user.role as PrismaUserRole,
        name: user.name,
        email: user.email
      });

      // retorna o usuario e o token
      return reply.send({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(401).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
}