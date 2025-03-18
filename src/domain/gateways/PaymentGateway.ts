import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Interface para o gateway de pagamento
 */
export interface PaymentGateway {
  /**
   * Processa um pagamento através do gateway
   */
  processPayment(data: {
    amount: number;
    method: PaymentMethod;
    data: any;
    ticketId?: string;
    ticketIds?: string[];
    userId: string;
  }): Promise<{
    status: PaymentStatus;
    transactionId: string;
    message?: string;
  }>;
} 