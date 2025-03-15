import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware para verificar se o usuário está autenticado via JWT
 */
export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verifica o token JWT e adiciona o usuário decodificado à requisição
    await request.jwtVerify();
    
    // Verifica se o objeto user tem todas as propriedades necessárias
    const user = (request as any).user;
    
    if (!user || !user.id || !user.role || !user.email || !user.name) {
      return reply.status(401).send({ 
        message: 'Token inválido ou malformado. Faça login novamente.' 
      });
    }
  } catch (error) {
    return reply.status(401).send({ message: 'Não autorizado. Faça login para continuar.' });
  }
} 