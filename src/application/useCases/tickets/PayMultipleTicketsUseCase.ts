import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { TicketRepository } from '../../../domain/repositories/TicketRepository';
import { PaymentRepository } from '../../../domain/repositories/PaymentRepository';
import { PaymentGateway } from '../../../domain/gateways/PaymentGateway';
import { TicketStatus } from '../../../domain/entities/Ticket';

interface PayMultipleTicketsUseCaseRequest {
  ticketIds: string[];
  userId: string;
  paymentMethod: PaymentMethod;
  paymentData: {
    // Dados específicos para cada método de pagamento
    // Para cartão de crédito/débito
    cardNumber?: string;
    cardHolder?: string;
    expirationDate?: string;
    cvv?: string;
    // Para PIX
    pixKey?: string;
    // Para boleto
    cpf?: string;
  };
}

interface PayMultipleTicketsUseCaseResponse {
  tickets: any[];
  payment: any;
}

/**
 * Caso de uso para processar o pagamento de múltiplos tickets
 */
export class PayMultipleTicketsUseCase {
  constructor(
    private ticketRepository: TicketRepository,
    private paymentRepository: PaymentRepository,
    private paymentGateway: PaymentGateway
  ) {}

  async execute({ ticketIds, userId, paymentMethod, paymentData }: PayMultipleTicketsUseCaseRequest): Promise<PayMultipleTicketsUseCaseResponse> {
    // 1. Verificar tickets
    const tickets = [];
    let totalAmount = 0;
    
    for (const ticketId of ticketIds) {
      // Buscar o ticket
      const ticket = await this.ticketRepository.findById(ticketId);
      
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} não encontrado`);
      }
      
      // Verificar se o ticket pertence ao usuário
      if (ticket.userId !== userId) {
        throw new Error(`Ticket ${ticketId} não pertence ao usuário`);
      }
      
      // Verificar se o ticket está reservado
      if (ticket.status !== TicketStatus.RESERVED) {
        throw new Error(`Ticket ${ticketId} não está em estado de reserva`);
      }
      
      // Buscar detalhes da rota para obter o preço
      const route = await this.ticketRepository.getTicketRoute(ticketId);
      
      // Adicionar ao total
      totalAmount += Number(route.price);
      tickets.push(ticket);
    }

    // 2. Processar o pagamento através do gateway
    const paymentResult = await this.paymentGateway.processPayment({
      amount: totalAmount,
      method: paymentMethod,
      data: paymentData,
      ticketIds,
      userId
    });

    // 3. Registrar o pagamento
    const payment = await this.paymentRepository.createMultiTicketPayment({
      userId,
      amount: totalAmount,
      method: paymentMethod,
      status: paymentResult.status,
      externalId: paymentResult.transactionId
    });

    // 4. Se o pagamento foi bem-sucedido, atualizar o status dos tickets
    if (paymentResult.status === PaymentStatus.PAID) {
      for (const ticketId of ticketIds) {
        // Atualizar o status do ticket para PAID
        await this.ticketRepository.updateStatus(ticketId, TicketStatus.PAID);
        
        // Associar o paymentId ao ticket
        await this.ticketRepository.updatePaymentId(ticketId, payment.id);
      }
    }

    // 5. Buscar os tickets atualizados
    const updatedTickets = [];
    for (const ticketId of ticketIds) {
      const updatedTicket = await this.ticketRepository.findById(ticketId);
      updatedTickets.push(updatedTicket);
    }

    return {
      tickets: updatedTickets,
      payment
    };
  }
} 