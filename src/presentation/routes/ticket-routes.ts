import { FastifyInstance } from 'fastify';
import { TicketController } from '../controllers/TicketController';
import { PayMultipleTicketsUseCase } from '../../application/useCases/tickets/PayMultipleTicketsUseCase';
import { PrismaTicketRepository } from '../../infrastructure/database/prisma/repositories/PrismaTicketRepository';
import { PrismaPaymentRepository } from '../../infrastructure/database/prisma/repositories/PrismaPaymentRepository';
import { MockPaymentGateway } from '../../infrastructure/gateways/MockPaymentGateway';
import { authenticate } from '../middlewares/authenticate';
import { verifyJwt } from '../middlewares/verify-jwt';
import { makeReserveTicketUseCase } from '../factories/make-reserve-ticket-use-case';

export async function ticketRoutes(app: FastifyInstance) {
  // Registra o middleware de autenticação
  app.addHook('onRequest', authenticate);

  // Inicializa dependências
  const ticketRepository = new PrismaTicketRepository();
  const paymentRepository = new PrismaPaymentRepository();
  const paymentGateway = new MockPaymentGateway();
  
  // Usa os factories para criar os casos de uso
  const reserveTicketUseCase = makeReserveTicketUseCase();
  
  // Usa o "as any" temporariamente para evitar erros de tipagem até que a implementação seja corrigida
  const payMultipleTicketsUseCase = new PayMultipleTicketsUseCase(
    ticketRepository, 
    paymentRepository as any, 
    paymentGateway
  );
  
  const ticketController = new TicketController(
    reserveTicketUseCase,
    payMultipleTicketsUseCase
  );

  // Rotas protegidas
  app.addHook('onRequest', verifyJwt);
  
  // Reserva de tickets (um ou vários)
  app.post('/reserve', (req, reply) => ticketController.reserveMultiple(req, reply));
    
  // Pagamento de múltiplos tickets
  app.post('/pay-multiple', (req, reply) => ticketController.payMultiple(req, reply));
}
