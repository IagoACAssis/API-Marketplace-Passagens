import { RouteRepository } from '../../../domain/repositories/RouteRepository';

interface SearchLocationsUseCaseRequest {
  query: string;
  type?: 'origin' | 'destination';
}

interface Location {
  id: string;
  name: string;
  state?: string;
  country: string;
  type: 'city' | 'terminal' | 'airport' | 'port';
}

interface SearchLocationsUseCaseResponse {
  locations: Location[];
}

/**
 * Caso de uso para busca de locais para autocomplete
 */
export class SearchLocationsUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: SearchLocationsUseCaseRequest): Promise<SearchLocationsUseCaseResponse> {
    const { query, type } = request;
    
    // Busca locais que correspondem à consulta
    const locations = await this.routeRepository.searchLocations(query, type);
    
    return {
      locations
    };
  }
} 