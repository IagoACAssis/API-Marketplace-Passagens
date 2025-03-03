import { FastifyInstance } from 'fastify';
import { RouteController } from '../controllers/RouteController';
import { SearchRoutesUseCase } from '@application/useCases/routes/SearchRoutesUseCase';
import { PrismaRouteRepository } from '@infrastructure/database/prisma/repositories/PrismaRouteRepository';

export async function routeRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const routeRepository = new PrismaRouteRepository();
  const searchRoutesUseCase = new SearchRoutesUseCase(routeRepository);
  const routeController = new RouteController(searchRoutesUseCase);

  // Rotas de busca
  app.get('/', (req, reply) => routeController.search(req, reply));
}