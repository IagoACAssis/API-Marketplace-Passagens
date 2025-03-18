import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

/**
 * Middleware para verificar se o usuário autenticado tem papel de empresa
 */
export async function verifyCompanyRole(request: FastifyRequest, reply: FastifyReply) {
  // pega o usuario do request
  const user = (request as any).user;
  // pega o papel e o id da empresa do usuario
  const { role, companyId } = user;
  
  // verifica se o usuario é uma empresa e se tem um id de empresa
  if (role !== UserRole.COMPANY || !companyId) {
    return reply.status(403).send({ 
      message: 'Acesso negado. Esta funcionalidade é exclusiva para empresas.' 
    });
  }
}