import { Ticket, TicketStatus } from '../entities/Ticket';

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByCode(ticketCode: string): Promise<Ticket | null>;
  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket>;
  update(id: string, data: Partial<Ticket>): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus): Promise<Ticket>;
  findByUser(userId: string, page: number, limit: number): Promise<{ tickets: Ticket[], total: number }>;
  findByRoute(routeId: string): Promise<Ticket[]>;
  
  /**
   * Busca a rota associada a um ticket
   */
  getTicketRoute(ticketId: string): Promise<{ 
    id: string, 
    origin: string, 
    destination: string, 
    departureTime: Date, 
    price: number 
  }>;
}