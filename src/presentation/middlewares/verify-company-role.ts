import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

/**
 * Middleware para verificar se o usuário autenticado tem papel de empresa
 */
export async function verifyCompanyRole(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  const { role, companyId } = user;
  
  if (role !== UserRole.COMPANY || !companyId) {
    return reply.status(403).send({ 
      message: 'Acesso negado. Esta funcionalidade é exclusiva para empresas.' 
    });
  }
}