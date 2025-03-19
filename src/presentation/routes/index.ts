import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth-routes';
import { companyRoutes } from './company-routes';
import { ticketRoutes } from './ticket-routes';
import { routeRoutes } from './route-routes';
import { routeTemplateRoutes } from './route-template-routes';

export async function setupRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // Público
  app.register(authRoutes, { prefix: '/auth' });
  
  // Protegido
  app.register(companyRoutes, { prefix: '/companies' });
  app.register(ticketRoutes, { prefix: '/tickets' });
  app.register(routeRoutes, { prefix: '/routes' });
  app.register(routeTemplateRoutes, { prefix: '/route-templates' });
}