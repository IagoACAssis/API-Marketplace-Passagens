import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Payment } from '../../../../domain/entities/Payment';
import { PaymentRepository } from '../../../../domain/repositories/PaymentRepository';

const prisma = new PrismaClient();

// Implementação temporária com supressão de erros de tipo
// TODO: Resolver problemas de tipagem entre Prisma Decimal e number
export class PrismaPaymentRepository implements PaymentRepository {
  /**
   * Cria um novo pagamento
   */
  async create(payment: {
    ticketId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    externalId?: string;
  }): Promise<Payment> {
    const userId = (await prisma.ticket.findUnique({
      where: { id: payment.ticketId },
      select: { userId: true }
    }))?.userId;

    if (!userId) {
      throw new Error('Usuário não encontrado para este ticket');
    }

    const prismaPayment = await prisma.payment.create({
      data: {
        tickets: {
          connect: {
            id: payment.ticketId
          }
        },
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        externalId: payment.externalId,
        user: {
          connect: {
            id: userId
          }
        }
      },
      include: { user: true }
    });

    return this.mapToPayment(prismaPayment);
  }

  /**
   * Busca um pagamento pelo ID
   */
  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!payment) return null;

    return this.mapToPayment(payment);
  }

  /**
   * Busca um pagamento pelo ID do ticket
   */
  async findByTicketId(ticketId: string): Promise<Payment | null> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { 
        payment: {
          include: { user: true }
        }
      }
    });

    if (!ticket || !ticket.payment) return null;

    return this.mapToPayment(ticket.payment);
  }

  /**
   * Atualiza um pagamento
   */
  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.externalId) updateData.externalId = data.externalId;

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: { user: true }
    });

    return this.mapToPayment(payment);
  }

  /**
   * Cria um pagamento para múltiplos tickets
   */
  async createMultiTicketPayment(payment: {
    userId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    externalId?: string;
  }): Promise<Payment> {
    const prismaPayment = await prisma.payment.create({
      data: {
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        externalId: payment.externalId,
        user: {
          connect: {
            id: payment.userId
          }
        }
      },
      include: { user: true }
    });

    return this.mapToPayment(prismaPayment);
  }

  /**
   * Busca pagamentos pelo ID do usuário com paginação
   */
  async findByUserId(userId: string, page: number, limit: number): Promise<{ payments: Payment[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [paymentsData, total] = await Promise.all([
      prisma.payment.findMany({
        where: { 
          user: {
            id: userId
          }
        },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({
        where: { 
          user: {
            id: userId
          }
        }
      })
    ]);
    
    return {
      payments: paymentsData.map(payment => this.mapToPayment(payment)),
      total
    };
  }

  /**
   * Mapeia o modelo do Prisma para a entidade de domínio
   */
  private mapToPayment(data: any): Payment {
    // Conversão explícita para o tipo Payment
    return {
      id: data.id,
      userId: data.userId || data.user?.id || '',
      status: data.status,
      method: data.method,
      amount: data.amount, 
      externalId: data.externalId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as Payment;
  }
} 