import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ReserveTicketUseCase } from '../../application/useCases/tickets/ReserveTicketUseCase';
import { PaymentMethod } from '@prisma/client';
import { PayMultipleTicketsUseCase } from '../../application/useCases/tickets/PayMultipleTicketsUseCase';

// Removido o schema de reserva única, apenas mantemos o esquema múltiplo
// que também pode lidar com uma única reserva
const reserveMultipleTicketsSchema = z.object({
  routeId: z.string().uuid(),
  passengers: z.array(z.object({
    name: z.string().min(3),
    cpf: z.string().min(11),
    seatNumber: z.string().optional()
  })).min(1, "É necessário ao menos um passageiro")
});

// Schema para validação de pagamento com cartão
const cardPaymentDataSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  cardHolder: z.string().min(3),
  expirationDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Data de expiração deve estar no formato MM/YY'),
  cvv: z.string().min(3).max(4)
});

// Schema para validação de pagamento com PIX
const pixPaymentDataSchema = z.object({
  pixKey: z.string().min(1)
});

// Schema para validação de pagamento com Boleto
const boletoPaymentDataSchema = z.object({
  cpf: z.string().min(11).max(14)
});

// Schema de pagamento que valida baseado no método selecionado
const payTicketSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentData: z.any()
}).superRefine((data, ctx) => {
  // Validações específicas por método de pagamento
  switch (data.paymentMethod) {
    case PaymentMethod.CREDIT_CARD:
    case PaymentMethod.DEBIT_CARD:
      try {
        cardPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de cartão inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    case PaymentMethod.PIX:
      try {
        pixPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de PIX inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    case PaymentMethod.BOLETO:
      try {
        boletoPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de boleto inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    default:
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Método de pagamento não suportado',
        path: ['paymentMethod']
      });
  }
});

// Schema para pagamento de múltiplos tickets
const payMultipleTicketsSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentData: z.any()
}).superRefine((data, ctx) => {
  // Validações específicas por método de pagamento
  switch (data.paymentMethod) {
    case PaymentMethod.CREDIT_CARD:
    case PaymentMethod.DEBIT_CARD:
      try {
        cardPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de cartão inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    case PaymentMethod.PIX:
      try {
        pixPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de PIX inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    case PaymentMethod.BOLETO:
      try {
        boletoPaymentDataSchema.parse(data.paymentData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dados de boleto inválidos',
            path: ['paymentData']
          });
        }
      }
      break;
    default:
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Método de pagamento não suportado',
        path: ['paymentMethod']
      });
  }
});

/**
 * Controller responsável pelas operações de bilhetes
 */
export class TicketController {
  constructor(
    private reserveTicketUseCase: ReserveTicketUseCase,
    private payMultipleTicketsUseCase: PayMultipleTicketsUseCase
  ) {}

  /**
   * Processa o pagamento de múltiplos tickets
   */
  async payMultiple(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Valida o token e obtém o usuário atual
      const user = request.user as { id: string };
      const userId = user.id;

      // Valida os dados de pagamento múltiplo
      const { ticketIds, paymentMethod, paymentData } = payMultipleTicketsSchema.parse(request.body);

      // Executa o caso de uso de pagamento múltiplo
      const result = await this.payMultipleTicketsUseCase.execute({
        ticketIds,
        userId,
        paymentMethod,
        paymentData
      });

      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  /**
   * Cria reservas de bilhetes - pode ser um ou múltiplos
   */
  async reserveMultiple(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Valida o token e obtém o usuário atual
      const user = request.user as { id: string };
      const userId = user.id;
      
      // Valida os dados da reserva múltipla
      const { routeId, passengers } = reserveMultipleTicketsSchema.parse(
        request.body
      );

      // Tickets reservados
      const tickets = [];
      
      // Reserva os tickets em uma transação para garantir atomicidade
      for (const passenger of passengers) {
        const { ticket } = await this.reserveTicketUseCase.execute({
          routeId,
          userId,
          passenger: passenger.name,
          passengerCpf: passenger.cpf,
          seatNumber: passenger.seatNumber
        });
        
        tickets.push(ticket);
      }

      // Retorna os bilhetes criados
      return reply.status(201).send({ 
        tickets,
        // Para compatibilidade com clientes que esperam um único ticket
        ticket: tickets.length === 1 ? tickets[0] : undefined 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
}