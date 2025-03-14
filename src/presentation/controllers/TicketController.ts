import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ReserveTicketUseCase } from '@application/useCases/tickets/ReserveTicketUseCase';

const reserveTicketSchema = z.object({
  routeId: z.string().uuid(),
  passenger: z.string().min(3),
  passengerCpf: z.string().min(11),
  seatNumber: z.string().optional()
});

/**
 * Controller responsável pelas operações de bilhetes
 */
export class TicketController {
  constructor(private reserveTicketUseCase: ReserveTicketUseCase) {}

  /**
   * Cria uma reserva de bilhete
   */
  async reserve(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Valida o token e obtém o usuário atual
      const user = request.user as { sub: string };
      const userId = user.sub;
      
      const { routeId, passenger, passengerCpf, seatNumber } = reserveTicketSchema.parse(
        request.body
      );

      const { ticket } = await this.reserveTicketUseCase.execute({
        routeId,
        userId,
        passenger,
        passengerCpf,
        seatNumber
      });

      return reply.status(201).send({ ticket });
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