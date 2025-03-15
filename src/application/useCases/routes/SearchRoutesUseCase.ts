import { RouteRepository } from '../../../domain/repositories/RouteRepository';

interface SearchRoutesUseCaseRequest {
  origin?: string;
  destination?: string;
  date?: string | Date;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Caso de uso para busca de rotas disponíveis
 */
export class SearchRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: SearchRoutesUseCaseRequest) {
    const { origin, destination, date, type, page = 1, limit = 10 } = request;
    
    // Converte a data para um objeto Date se for uma string
    let dateObj: Date | undefined;
    if (date && typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    }
    
    const { routes, total } = await this.routeRepository.search({
      origin,
      destination,
      date: dateObj,
      type,
      page,
      limit
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      routes,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    };
  }
}