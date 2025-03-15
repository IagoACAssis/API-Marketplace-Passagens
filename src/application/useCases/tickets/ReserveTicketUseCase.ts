import { TicketStatus } from '../../../domain/entities/Ticket'; 
import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { TicketRepository } from '../../../domain/repositories/TicketRepository';
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
    private routeRepository: RouteRepository
  ) {}

  async execute(request: ReserveTicketUseCaseRequest) {
    const { routeId, userId, passenger, passengerCpf, seatNumber } = request;

    // Verifica se a rota existe
    const route = await this.routeRepository.findById(routeId);
    
    if (!route) {
      throw new Error('Rota não encontrada.');
    }
    
    // Verifica se há assentos disponíveis  
    if (route.totalSeats <= 0) {
      throw new Error('Não há assentos disponíveis para esta rota.');
    }
    
    // Gera um código único para o bilhete
    const ticketCode = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`;
    
    // Cria a reserva
    const ticket = await this.ticketRepository.create({
      routeId,
      userId,
      status: TicketStatus.RESERVED,
      ticketCode,
      passenger,
      passengerCpf,
      seatNumber
    });
    
    // Atualiza o número de assentos disponíveis
    await this.routeRepository.update(routeId, {
      totalSeats: route.totalSeats - 1
    });
    
    return { ticket };
  }
}