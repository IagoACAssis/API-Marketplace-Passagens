import { Route } from '../../../domain/entities/Route';
import { RouteRepository } from '../../../domain/repositories/RouteRepository';

interface ListCompanyRoutesUseCaseRequest {
  companyId: string;
  page?: number;
  limit?: number;
}

interface ListCompanyRoutesUseCaseResponse {
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
 * Caso de uso para listar todas as rotas de uma empresa
 */
export class ListCompanyRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(request: ListCompanyRoutesUseCaseRequest): Promise<ListCompanyRoutesUseCaseResponse> {
    const { companyId, page = 1, limit = 10 } = request;

    const { routes, total } = await this.routeRepository.findByCompany(companyId, page, limit);

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