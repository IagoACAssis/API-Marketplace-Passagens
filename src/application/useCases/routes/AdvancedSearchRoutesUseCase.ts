import { Route } from '../../../domain/entities/Route';
import { RouteRepository } from '../../../domain/repositories/RouteRepository';

interface AdvancedSearchRoutesUseCaseRequest {
  origin: string;
  destination: string;
  date: string | Date;
  type?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  companies?: string[];
  departureTimeStart?: string;
  departureTimeEnd?: string;
  amenities?: string[];
}

interface AdvancedSearchRoutesUseCaseResponse {
  routes: Route[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Caso de uso para busca avançada de rotas com filtros adicionais
 */
export class AdvancedSearchRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: AdvancedSearchRoutesUseCaseRequest): Promise<AdvancedSearchRoutesUseCaseResponse> {
    const { 
      origin, destination, date, type, page = 1, limit = 10,
      minPrice, maxPrice, companies, departureTimeStart,
      departureTimeEnd, amenities
    } = request;
    
    // Converte a data para um objeto Date se for uma string
    let dateObj: Date | undefined;
    if (date && typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    }
    
    // Busca rotas com filtros avançados
    const { routes, total } = await this.routeRepository.advancedSearch({
      origin,
      destination,
      date: dateObj,
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