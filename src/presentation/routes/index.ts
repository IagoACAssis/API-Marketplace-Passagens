import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth-routes';
import { routeRoutes } from './route-routes';
import { ticketRoutes } from './ticket-routes';

export function setupRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // Registra as rotas da API
  app.register(authRoutes, { prefix: '/auth' });
  app.register(routeRoutes, { prefix: '/routes' });
  app.register(ticketRoutes, { prefix: '/tickets' });
}