import { Route } from '../../../domain/entities/Route';
import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { ResourceNotFoundError } from '../../../domain/errors/ResourceNotFoundError';

interface GetRouteDetailsUseCaseRequest {
  id: string;
}

interface GetRouteDetailsUseCaseResponse {
  route: Route;
  availableSeats: number;
  amenities: string[];
  company: {
    id: string;
    tradingName: string;
    legalName: string;
    
  };
}

/**
 * Caso de uso para obter detalhes de uma rota específica
 */
export class GetRouteDetailsUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: GetRouteDetailsUseCaseRequest): Promise<GetRouteDetailsUseCaseResponse> {
    const { id } = request;
    
    const route = await this.routeRepository.findById(id);
    
    if (!route) {
      throw new ResourceNotFoundError('Rota não encontrada');
    }
    
    // Busca informações adicionais sobre a rota
    const availableSeats = await this.routeRepository.getAvailableSeats(id);
    const amenities = await this.routeRepository.getRouteAmenities(id);
    const company = await this.routeRepository.getRouteCompany(id);
    
    return {
      route,
      availableSeats,
      amenities,
      company: {
        id: company.id,
        tradingName: company.tradingName,
        legalName: company.legalName               
      } 
    };
  }
} 