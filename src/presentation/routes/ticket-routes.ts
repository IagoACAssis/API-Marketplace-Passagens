import { FastifyInstance } from 'fastify';
import { TicketController } from '../controllers/TicketController';
import { ReserveTicketUseCase } from '../../application/useCases/tickets/ReserveTicketUseCase';
import { PrismaTicketRepository } from '../../infrastructure/database/prisma/repositories/PrismaTicketRepository';
import { PrismaRouteRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteRepository';
import { authenticate } from '../middlewares/authenticate';

export async function ticketRoutes(app: FastifyInstance) {
  // Registra o middleware de autenticação
  app.addHook('onRequest', authenticate);

  // Inicializa dependências
  const ticketRepository = new PrismaTicketRepository();
  const routeRepository = new PrismaRouteRepository();
  const reserveTicketUseCase = new ReserveTicketUseCase(ticketRepository, routeRepository);
  const ticketController = new TicketController(reserveTicketUseCase);

  // Rotas de tickets
  app.post('/reserve', (req, reply) => ticketController.reserve(req, reply));
}
