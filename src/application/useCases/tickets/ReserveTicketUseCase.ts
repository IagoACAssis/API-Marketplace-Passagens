import { TicketStatus } from '../../../domain/entities/Ticket'; 
import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { TicketRepository } from '../../../domain/repositories/TicketRepository';
import { DynamicRouteGenerationService } from '../../services/DynamicRouteGenerationService';
import { randomUUID } from 'crypto';

interface ReserveTicketUseCaseRequest {
  routeId: string;
  userId: string;
  passenger: string;
  passengerCpf: string;
  seatNumber?: string;
}

/**
 * Caso de uso para reserva de passagens
 */
export class ReserveTicketUseCase {
  constructor(
    private ticketRepository: TicketRepository,
    private routeRepository: RouteRepository,
    private dynamicRouteService: DynamicRouteGenerationService
  ) {}

  async execute(request: ReserveTicketUseCaseRequest) {
    const { routeId, userId, passenger, passengerCpf, seatNumber } = request;

    let route;
    
    // Verifica se é uma rota virtual (começa com "virtual-")
    if (routeId.startsWith('virtual-')) {
      try {
        // Materializa a rota virtual
        route = await this.dynamicRouteService.materializeRoute(routeId);
      } catch (error) {
        throw new Error(`Erro ao materializar rota virtual: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } else {
      // Busca rota física normal
      route = await this.routeRepository.findById(routeId);
    }
    
    if (!route) {
      throw new Error('Rota não encontrada.');
    }
    
    // Verifica se há assentos disponíveis  
    const availableSeats = await this.routeRepository.getAvailableSeats(route.id);
    if (availableSeats <= 0) {
      throw new Error('Não há assentos disponíveis para esta rota.');
    }
    
    // Gera um código único para o bilhete
    const ticketCode = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`;
    
    // Cria a reserva
    const ticket = await this.ticketRepository.create({
      routeId: route.id,
      userId,
      status: TicketStatus.RESERVED,
      ticketCode,
      passenger,
      passengerCpf,
      seatNumber
    });
    
    // Atualiza o número de assentos disponíveis
    // Não atualizamos mais o totalSeats, pois agora usamos o método getAvailableSeats
    
    return { ticket };
  }
}