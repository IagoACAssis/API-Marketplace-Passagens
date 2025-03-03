import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RegisterUseCase } from '@application/useCases/auth/RegisterUseCase';
import { AuthenticateUseCase } from '@application/useCases/auth/AuthenticateUseCase';
import { UserRole } from '@domain/entities/User';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum([UserRole.CUSTOMER, UserRole.COMPANY]).optional()
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
    private authenticateUseCase: AuthenticateUseCase
  ) {}

  /**
   * Registra um novo usuário
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, password, cpf, phone, role } = registerSchema.parse(request.body);

      const { user } = await this.registerUseCase.execute({
        name,
        email,
        password,
        cpf,
        phone,
        role
      });

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
      const token = request.server.jwt.sign(
        {
          sub: user.userId,
          role: user.role,
          name: user.name,
          email: user.email
        },
        {
          expiresIn: process.env.JWT_EXPIRES_IN
        }
      );

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