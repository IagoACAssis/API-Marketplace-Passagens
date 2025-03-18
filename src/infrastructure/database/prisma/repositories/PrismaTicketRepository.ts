import { Ticket, TicketStatus } from '../../../../domain/entities/Ticket';
import { TicketRepository } from '../../../../domain/repositories/TicketRepository';
import { prisma } from '../client';

export class PrismaTicketRepository implements TicketRepository {
  async findById(id: string): Promise<Ticket | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });
    
    if (!ticket) return null;

    return {
      ...ticket,
      status: ticket.status as TicketStatus
    };
  }

  async findByCode(ticketCode: string): Promise<Ticket | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode }
    });
    
    if (!ticket) return null;

    return {
      ...ticket,
      status: ticket.status as TicketStatus
    };
  }

  async create(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const ticket = await prisma.ticket.create({
      data: ticketData
    });
    
    return {
      ...ticket,
      status: ticket.status as TicketStatus
    };
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data
    });
    
    return {
      ...ticket,
      status: ticket.status as TicketStatus
    };
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });
    
    return {
      ...ticket,
      status: ticket.status as TicketStatus
    };
  }

  async findByUser(userId: string, page: number, limit: number): Promise<{ tickets: Ticket[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          route: true
        }
      }),
      prisma.ticket.count({
        where: { userId }
      })
    ]);
    
    return { tickets: tickets.map(ticket => ({
      ...ticket,
      status: ticket.status as TicketStatus
    })), total };
  }

  async findByRoute(routeId: string): Promise<Ticket[]> {
    const tickets = await prisma.ticket.findMany({
      where: { routeId }
    });
    
    return tickets.map(ticket => ({
      ...ticket,
      status: ticket.status as TicketStatus
    }));
  }

  /**
   * Busca a rota associada a um ticket
   */
  async getTicketRoute(ticketId: string): Promise<{ id: string, origin: string, destination: string, departureTime: Date, price: number }> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        route: {
          select: {
            id: true,
            origin: true,
            destination: true,
            departureTime: true,
            price: true
          }
        }
      }
    });

    if (!ticket || !ticket.route) {
      throw new Error('Rota não encontrada para este ticket');
    }

    return {
      id: ticket.route.id,
      origin: ticket.route.origin,
      destination: ticket.route.destination,
      departureTime: ticket.route.departureTime,
      price: ticket.route.price
    };
  }
}
