import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth-routes';
import { routeRoutes } from './route-routes';
import { ticketRoutes } from './ticket-routes';
import { companyRoutes } from './company-routes';

export function setupRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // Registra as rotas da API
  
  // rotas de autenticação
  app.register(authRoutes, { prefix: '/auth' });
  // rotas de rota
  app.register(routeRoutes, { prefix: '/routes' });
  // rotas de ticket
  app.register(ticketRoutes, { prefix: '/tickets' });
  // rotas de empresa
  app.register(companyRoutes, { prefix: '/company' });
}