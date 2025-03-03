import { Payment, PaymentStatus } from '../entities/Payment';

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByTicket(ticketId: string): Promise<Payment | null>;
  create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus, externalId?: string): Promise<Payment>;
}