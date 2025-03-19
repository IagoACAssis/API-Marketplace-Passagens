import { ReserveTicketUseCase } from '../../application/useCases/tickets/ReserveTicketUseCase';
import { PrismaTicketRepository } from '../../infrastructure/database/prisma/repositories/PrismaTicketRepository';
import { PrismaRouteRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteRepository';
import { PrismaRouteTemplateRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteTemplateRepository';
import { DynamicRouteGenerationService } from '../../application/services/DynamicRouteGenerationService';

export function makeReserveTicketUseCase() {
  const ticketRepository = new PrismaTicketRepository();
  const routeRepository = new PrismaRouteRepository();
  const routeTemplateRepository = new PrismaRouteTemplateRepository();
  
  const dynamicRouteService = new DynamicRouteGenerationService(
    routeTemplateRepository,
    routeRepository
  );
  
  const reserveTicketUseCase = new ReserveTicketUseCase(
    ticketRepository,
    routeRepository,
    dynamicRouteService
  );
  
  return reserveTicketUseCase;
} 