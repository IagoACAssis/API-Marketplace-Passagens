import { UserRole as PrismaUserRole } from '@prisma/client';

export interface JwtPayload {
  id: string;
  companyId?: string;
  role: PrismaUserRole;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'supersecret',
  expiresIn: '7d' // Token expira em 7 dias
}; 