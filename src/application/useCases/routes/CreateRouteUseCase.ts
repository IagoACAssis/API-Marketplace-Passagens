import { Route, TransportType, LocationType } from '../../../domain/entities/Route';
import { RouteRepository } from '../../../domain/repositories/RouteRepository';

interface CreateRouteUseCaseRequest {
  companyId: string;
  origin: string;
  originState?: string;
  originCountry: string;
  originType: LocationType;
  destination: string;
  destinationState?: string;
  destinationCountry: string;
  destinationType: LocationType;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  type: TransportType;
  totalSeats: number;
  amenities?: string[];
  active?: boolean;
}

interface CreateRouteUseCaseResponse {
  route: Route;
}

/**
 * Caso de uso para criação de uma nova rota
 */
export class CreateRouteUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: CreateRouteUseCaseRequest): Promise<CreateRouteUseCaseResponse> {
    const {
      companyId,
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
      active = true
    } = request;

    // Verifica se a data de chegada é posterior à data de partida
    if (arrivalTime <= departureTime) {
      throw new Error('A data/hora de chegada deve ser posterior à data/hora de partida');
    }

    // Cria a rota
    const route = await this.routeRepository.create({
      companyId,
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
      active
    });

    // Se houver comodidades, associa-as à rota
    if (amenities && amenities.length > 0) {
      await this.routeRepository.setRouteAmenities(route.id, amenities);
    }

    return {
      route
    };
  }
} 