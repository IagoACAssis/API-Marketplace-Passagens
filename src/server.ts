import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

// Importações das rotas
import { setupRoutes } from './presentation/routes';
import { jwtConfig } from './infrastructure/auth/jwt-config';

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o servidor Fastify
const server = fastify({
  logger: true
});

// Registra plugins
async function bootstrap() {
  // Configuração de CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || true
  });

  // Configuração de JWT
  await server.register(jwt, {
    secret: jwtConfig.secret,
    sign: {
      expiresIn: jwtConfig.expiresIn
    }
  });

  // Registra as rotas
  setupRoutes(server);

  // Define a porta e o host
  const port = parseInt(process.env.PORT || '3333');
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();