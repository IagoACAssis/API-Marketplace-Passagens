import { FastifyRequest, FastifyReply } from 'fastify';

interface UserPayload {
  sub: string;
  role: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    userPayload: UserPayload;
  }
}

/**
 * Middleware que verifica se o usuário está autenticado
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verifica se existe um token de autenticação
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ message: 'Token não fornecido.' });
    }

    try {
      // Verifica se o token é válido
      const user = request.server.jwt.verify<UserPayload>(token);
      
      // Adiciona as informações do usuário ao request
      request.user = user;
    } catch (error) {
      return reply.status(401).send({ message: 'Token inválido ou expirado.' });
    }
  } catch (error) {
    return reply.status(500).send({ message: 'Erro ao autenticar usuário.' });
  }
}
