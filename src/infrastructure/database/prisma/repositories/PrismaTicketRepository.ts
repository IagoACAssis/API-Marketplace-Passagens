import { Ticket, TicketStatus } from '@domain/entities/Ticket';
import { TicketRepository } from '@domain/repositories/TicketRepository';
import { prisma } from '../client';

export class PrismaTicketRepository implements TicketRepository {
  async findById(id: string): Promise<Ticket | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });
    
    return ticket;
  }

  async findByCode(ticketCode: string): Promise<Ticket | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode }
    });
    
    return ticket;
  }

  async create(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const ticket = await prisma.ticket.create({
      data: ticketData
    });
    
    return ticket;
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data
    });
    
    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });
    
    return ticket;
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
    
    return { tickets, total };
  }

  async findByRoute(routeId: string): Promise<Ticket[]> {
    const tickets = await prisma.ticket.findMany({
      where: { routeId }
    });
    
    return tickets;
  }
}
