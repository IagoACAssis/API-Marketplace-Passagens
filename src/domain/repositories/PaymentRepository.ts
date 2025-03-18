import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Payment } from '../entities/Payment';

export interface PaymentRepository {
  /**
   * Cria um novo pagamento
   */
  create(payment: {
    ticketId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    externalId?: string;
  }): Promise<Payment>;
  
  /**
   * Busca um pagamento pelo ID
   */
  findById(id: string): Promise<Payment | null>;
  
  /**
   * Busca um pagamento pelo ID do ticket
   */
  findByTicketId(ticketId: string): Promise<Payment | null>;
  
  /**
   * Atualiza um pagamento
   */
  update(id: string, data: Partial<Payment>): Promise<Payment>;

  /**
   * Cria um pagamento para múltiplos tickets
   */
  createMultiTicketPayment(payment: {
    userId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    externalId?: string;
  }): Promise<Payment>;

  /**
   * Busca pagamentos pelo ID do usuário com paginação
   */
  findByUserId(userId: string, page: number, limit: number): Promise<{ payments: Payment[], total: number }>;
}