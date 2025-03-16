import { FastifyInstance } from 'fastify';
import { JwtPayload } from './jwt-config';
import { UserRole } from '@prisma/client';


export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  /**
   * Gera um token JWT
   */
  generateToken(payload: JwtPayload): string {
    return this.fastify.jwt.sign(payload);
  }

  /**
   * Verifica um token JWT
   */
  verifyToken(token: string): JwtPayload {
    return this.fastify.jwt.verify<JwtPayload>(token);
  }

  /**
   * Gera um token JWT para um usuário
   */
  generateUserToken(payload: {
    id: string;
    companyId?: string;
    name: string;
    email: string;    
    role: UserRole;
    

  }): string {
    return this.generateToken(payload);
  }
} 