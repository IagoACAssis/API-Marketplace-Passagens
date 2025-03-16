import { FastifyRequest, FastifyReply } from 'fastify';

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = request.user as { role?: string };
    
    if (!user || user.role !== 'ADMIN') {
      return reply.code(403).send({
        error: 'Acesso negado. Esta operação requer privilégios de administrador.'
      });
    }
    
    // Se o usuário é um administrador, permite que a requisição continue
    return;
  } catch (error) {
    return reply.code(500).send({
      error: 'Erro ao verificar permissões de administrador'
    });
  }
}
