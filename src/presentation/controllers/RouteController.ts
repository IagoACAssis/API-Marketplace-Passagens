import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SearchRoutesUseCase } from '../../application/useCases/routes/SearchRoutesUseCase';
import { GetRouteDetailsUseCase } from '../../application/useCases/routes/GetRouteDetailsUseCase';
import { SearchLocationsUseCase } from '../../application/useCases/routes/SearchLocationsUseCase';
import { AdvancedSearchRoutesUseCase } from '../../application/useCases/routes/AdvancedSearchRoutesUseCase';
import { CreateRouteUseCase } from '../../application/useCases/routes/CreateRouteUseCase';
import { UpdateRouteUseCase } from '../../application/useCases/routes/UpdateRouteUseCase';
import { DeleteRouteUseCase } from '../../application/useCases/routes/DeleteRouteUseCase';
import { ListCompanyRoutesUseCase } from '../../application/useCases/routes/ListCompanyRoutesUseCase';
import { TransportType } from '../../domain/entities/Route';
import { ResourceNotFoundError } from '../../domain/errors/ResourceNotFoundError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';

// Schema para validação da busca básica
const searchRouteSchema = z.object({
  origin: z.string({ required_error: 'Origem é obrigatória' }),
  destination: z.string({ required_error: 'Destino é obrigatório' }),
  date: z.string({ required_error: 'Data é obrigatória' }),
  type: z.enum([TransportType.BUS, TransportType.BOAT, TransportType.FERRY]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

// Schema para validação de parâmetros de rota
const routeParamsSchema = z.object({
  id: z.string({ required_error: 'ID da rota é obrigatório' })
});

// Schema para validação da busca de locais
const searchLocationsSchema = z.object({
  query: z.string({ required_error: 'Termo de busca é obrigatório' }),
  type: z.enum(['origin', 'destination']).optional()
});

// Schema para validação da busca avançada
const advancedSearchRouteSchema = searchRouteSchema.extend({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  companies: z.string().transform(val => val.split(',')).optional(),
  departureTimeStart: z.string().optional(),
  departureTimeEnd: z.string().optional(),
  amenities: z.string().transform(val => val.split(',')).optional()
});

// Schema para validação da criação de rota
const createRouteSchema = z.object({
  origin: z.string({ required_error: 'Origem é obrigatória' }),
  originState: z.string().optional(),
  originCountry: z.string({ required_error: 'País de origem é obrigatório' }),
  originType: z.enum(['city', 'terminal', 'airport', 'port'], { 
    required_error: 'Tipo de origem é obrigatório' 
  }),
  destination: z.string({ required_error: 'Destino é obrigatório' }),
  destinationState: z.string().optional(),
  destinationCountry: z.string({ required_error: 'País de destino é obrigatório' }),
  destinationType: z.enum(['city', 'terminal', 'airport', 'port'], { 
    required_error: 'Tipo de destino é obrigatório' 
  }),
  departureTime: z.string({ required_error: 'Horário de partida é obrigatório' }),
  arrivalTime: z.string({ required_error: 'Horário de chegada é obrigatório' }),
  price: z.number({ required_error: 'Preço é obrigatório' }).positive('Preço deve ser positivo'),
  type: z.enum([TransportType.BUS, TransportType.BOAT, TransportType.FERRY], { 
    required_error: 'Tipo de transporte é obrigatório' 
  }),
  totalSeats: z.number({ required_error: 'Número total de assentos é obrigatório' }).int().positive(),
  amenities: z.array(z.string()).optional(),
  active: z.boolean().default(true)
});

// Schema para validação da atualização de rota
const updateRouteSchema = createRouteSchema.partial();

/**
 * Controller responsável pelas rotas de transporte
 */
export class RouteController {
  constructor(
    private searchRoutesUseCase: SearchRoutesUseCase,
    private getRouteDetailsUseCase: GetRouteDetailsUseCase,
    private searchLocationsUseCase: SearchLocationsUseCase,
    private advancedSearchRoutesUseCase: AdvancedSearchRoutesUseCase,
    private createRouteUseCase: CreateRouteUseCase,
    private updateRouteUseCase: UpdateRouteUseCase,
    private deleteRouteUseCase: DeleteRouteUseCase,
    private listCompanyRoutesUseCase: ListCompanyRoutesUseCase
  ) {}

  /**
   * Busca rotas disponíveis com base nos filtros básicos
   */
  async search(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const { origin, destination, date, type, page, limit } = searchRouteSchema.parse(query);

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

  /**
   * Obtém detalhes de uma rota específica
   */
  async getDetails(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = routeParamsSchema.parse(request.params);
      
      const result = await this.getRouteDetailsUseCase.execute({
        id: params.id
      });

      return reply.send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  /**
   * Busca locais para autocomplete
   */
  async searchLocations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const { query: searchQuery, type } = searchLocationsSchema.parse(query);
      
      const result = await this.searchLocationsUseCase.execute({
        query: searchQuery,
        type
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

  /**
   * Busca avançada de rotas com filtros adicionais
   */
  async advancedSearch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const { 
        origin, destination, date, type, page, limit,
        minPrice, maxPrice, companies, departureTimeStart,
        departureTimeEnd, amenities
      } = advancedSearchRouteSchema.parse(query);
      
      const result = await this.advancedSearchRoutesUseCase.execute({
        origin,
        destination,
        date,
        type,
        page,
        limit,
        minPrice,
        maxPrice,
        companies,
        departureTimeStart,
        departureTimeEnd,
        amenities
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

  /**
   * Cria uma nova rota
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas.' });
      }
      
      const {
        origin,
        originState,
        originCountry,
        originType,
        destination,
        destinationState,
        destinationCountry,
        destinationType,
        departureTime,
        arrivalTime,
        price,
        type,
        totalSeats,
        amenities,
        active
      } = request.body as any;

      const route = await this.createRouteUseCase.execute({
        companyId,
        origin,
        originState,
        originCountry,
        originType,
        destination,
        destinationState,
        destinationCountry,
        destinationType,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price,
        type,
        totalSeats,
        amenities,
        active
      });

      return reply.code(201).send(route);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(400).send({ error: 'Erro desconhecido' });
    }
  }

  /**
   * Atualiza uma rota existente
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas.' });
      }
      
      const { id } = routeParamsSchema.parse(request.params);
      const routeData = updateRouteSchema.parse(request.body);
      
      // Converte strings de data para objetos Date, se fornecidos
      let departureTime: Date | undefined;
      let arrivalTime: Date | undefined;
      
      if (routeData.departureTime) {
        departureTime = new Date(routeData.departureTime);
        // Preserva a data/hora exata fornecida pelo usuário
        const parsedDate = new Date(routeData.departureTime);
        if (!isNaN(parsedDate.getTime())) {
          departureTime = parsedDate;
        }
      }
      
      if (routeData.arrivalTime) {
        arrivalTime = new Date(routeData.arrivalTime);
        // Preserva a data/hora exata fornecida pelo usuário
        const parsedDate = new Date(routeData.arrivalTime);
        if (!isNaN(parsedDate.getTime())) {
          arrivalTime = parsedDate;
        }
      }
      
      // Se ambas as datas forem fornecidas, verifica se a chegada é posterior à partida
      if (departureTime && arrivalTime && arrivalTime <= departureTime) {
        return reply.status(400).send({ 
          message: 'A data/hora de chegada deve ser posterior à data/hora de partida.' 
        });
      }
      
      const result = await this.updateRouteUseCase.execute({
        id,
        companyId,
        data: {
          ...routeData,
          departureTime,
          arrivalTime
        }
      });
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos.', errors: error.format() });
      }
      
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      
      if (error instanceof UnauthorizedError) {
        return reply.status(403).send({ message: error.message });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  /**
   * Exclui uma rota
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas.' });
      }
      
      const { id } = routeParamsSchema.parse(request.params);
      
      await this.deleteRouteUseCase.execute({
        id,
        companyId
      });
      
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos.', errors: error.format() });
      }
      
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      
      if (error instanceof UnauthorizedError) {
        return reply.status(403).send({ message: error.message });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  /**
   * Lista todas as rotas da empresa autenticada
   */
  async listCompanyRoutes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas.' });
      }
      
      const query = request.query as any;
      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 10;
      
      const result = await this.listCompanyRoutesUseCase.execute({
        companyId,
        page,
        limit
      });
      
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
}
