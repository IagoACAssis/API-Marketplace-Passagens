import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SearchRoutesUseCase } from '@application/useCases/routes/SearchRoutesUseCase';
import { TransportType } from '@domain/entities/Route';

const searchRouteSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
  type: z.enum([TransportType.BUS, TransportType.BOAT, TransportType.FERRY]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10)
});

/**
 * Controller responsável pelas rotas de transporte
 */
export class RouteController {
  constructor(private searchRoutesUseCase: SearchRoutesUseCase) {}

  /**
   * Busca rotas disponíveis com base nos filtros
   */
  async search(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const { origin, destination, date, type, page, limit } = searchRouteSchema.parse({
        ...query,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10
      });

      const result = await this.searchRoutesUseCase.execute({
        origin,
        destination,
        date,
        type,
        page,
        limit
      });

      return reply.send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros de busca inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
}