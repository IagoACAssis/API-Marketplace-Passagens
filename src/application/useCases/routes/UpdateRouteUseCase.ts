import { Route, TransportType, LocationType } from '../../../domain/entities/Route';
import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { ResourceNotFoundError } from '../../../domain/errors/ResourceNotFoundError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

interface UpdateRouteUseCaseRequest {
  id: string;
  companyId: string;
  data: {
    origin?: string;
    originState?: string;
    originCountry?: string;
    originType?: LocationType;
    destination?: string;
    destinationState?: string;
    destinationCountry?: string;
    destinationType?: LocationType;
    departureTime?: Date;
    arrivalTime?: Date;
    price?: number;
    type?: TransportType;
    totalSeats?: number;
    amenities?: string[];
    active?: boolean;
  };
}

interface UpdateRouteUseCaseResponse {
  route: Route;
}

/**
 * Caso de uso para atualização de uma rota existente
 */
export class UpdateRouteUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: UpdateRouteUseCaseRequest): Promise<UpdateRouteUseCaseResponse> {
    const { id, companyId, data } = request;

    // Busca a rota existente
    const existingRoute = await this.routeRepository.findById(id);

    if (!existingRoute) {
      throw new ResourceNotFoundError('Rota não encontrada');
    }

    // Verifica se a rota pertence à empresa
    if (existingRoute.companyId !== companyId) {
      throw new UnauthorizedError('Você não tem permissão para atualizar esta rota');
    }

    // Se ambas as datas forem fornecidas, verifica se a chegada é posterior à partida
    if (data.departureTime && data.arrivalTime && data.arrivalTime <= data.departureTime) {
      throw new Error('A data/hora de chegada deve ser posterior à data/hora de partida');
    }

    // Se apenas uma das datas for fornecida, verifica em relação à data existente
    if (data.departureTime && !data.arrivalTime && data.departureTime >= existingRoute.arrivalTime) {
      throw new Error('A nova data/hora de partida deve ser anterior à data/hora de chegada existente');
    }

    if (!data.departureTime && data.arrivalTime && data.arrivalTime <= existingRoute.departureTime) {
      throw new Error('A nova data/hora de chegada deve ser posterior à data/hora de partida existente');
    }

    // Extrai as amenidades para processamento separado
    const { amenities, ...routeData } = data;

    // Atualiza a rota
    const updatedRoute = await this.routeRepository.update(id, routeData);

    // Se houver amenidades, atualiza-as
    if (amenities !== undefined) {
      await this.routeRepository.setRouteAmenities(id, amenities);
    }

    return {
      route: updatedRoute
    };
  }
} 