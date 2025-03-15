import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { ResourceNotFoundError } from '../../../domain/errors/ResourceNotFoundError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

interface DeleteRouteUseCaseRequest {
  id: string;
  companyId: string;
}

/**
 * Caso de uso para exclusão de uma rota
 */
export class DeleteRouteUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: DeleteRouteUseCaseRequest): Promise<void> {
    const { id, companyId } = request;

    // Busca a rota existente
    const existingRoute = await this.routeRepository.findById(id);

    if (!existingRoute) {
      throw new ResourceNotFoundError('Rota não encontrada');
    }

    // Verifica se a rota pertence à empresa
    if (existingRoute.companyId !== companyId) {
      throw new UnauthorizedError('Você não tem permissão para excluir esta rota');
    }

    // Verifica se há tickets associados à rota
    const hasTickets = await this.routeRepository.hasActiveTickets(id);

    if (hasTickets) {
      // Em vez de excluir, apenas desativa a rota
      await this.routeRepository.update(id, { active: false });
    } else {
      // Se não houver tickets, exclui a rota
      await this.routeRepository.delete(id);
    }
  }
} 