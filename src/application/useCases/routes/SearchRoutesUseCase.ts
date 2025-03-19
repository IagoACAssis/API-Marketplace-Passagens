import { RouteRepository } from '../../../domain/repositories/RouteRepository';
import { DynamicRouteGenerationService } from '../../services/DynamicRouteGenerationService';
import { DateUtils } from '../../../presentation/utils/date-utils';

interface SearchRoutesUseCaseRequest {
  origin?: string;
  destination?: string;
  date?: string | Date;
  type?: string;
  page?: number;
  limit?: number;
  numberOfPassengers?: number;
}

/**
 * Caso de uso para busca de rotas disponíveis
 */
export class SearchRoutesUseCase {
  constructor(
    private routeRepository: RouteRepository,
    private dynamicRouteService: DynamicRouteGenerationService
  ) {}

  async execute(request: SearchRoutesUseCaseRequest) {
    const { origin, destination, date, type, page = 1, limit = 10, numberOfPassengers = 1 } = request;
    
    // Se não tiver origem e destino, busca apenas rotas existentes
    if (!origin || !destination) {
      return this.searchExistingRoutes(request);
    }
    
    // Converte a data para um objeto Date se for uma string
    let dateObj: Date | undefined;
    if (date && typeof date === 'string') {
      dateObj = DateUtils.parseToUTC(date);
    } else if (date instanceof Date) {
      dateObj = DateUtils.startOfDayUTC(date);
    } else {
      // Se não tem data, busca apenas rotas existentes
      return this.searchExistingRoutes(request);
    }
    
    // Busca rotas existentes no banco de dados
    const { routes, total } = await this.routeRepository.search({
      origin,
      destination,
      date: dateObj,
      type,
      page,
      limit
    });
    
    // Se a data for hoje ou em até 30 dias, gera rotas dinâmicas
    const now = DateUtils.startOfDayUTC(new Date());
    
    const thirtyDaysFromNow = DateUtils.addDaysUTC(now, 30);
    thirtyDaysFromNow.setUTCHours(23, 59, 59, 999);
    
    let allRoutes = [...routes];
    
    // Verifica se a data está entre a data atual e 30 dias a partir da data atual
    if (dateObj && dateObj >= now && dateObj <= thirtyDaysFromNow) {
      try {
        // Gera rotas dinâmicas para complementar as existentes
        // Passa as rotas existentes para evitar consulta duplicada
        const dynamicRoutes = await this.dynamicRouteService.generateRoutes(
          {
            origin,
            destination,
            date: dateObj,
            type,
            numberOfPassengers
          },
          routes // Passa as rotas existentes como parâmetro
        );
        
        // Adiciona rotas dinâmicas que não conflitem com as existentes
        for (const dynamicRoute of dynamicRoutes) {
          // Verifica se já existe uma rota com o mesmo horário e empresa
          const existingRoute = routes.find(route => 
            route.companyId === dynamicRoute.companyId &&
            route.departureTime.getUTCHours() === dynamicRoute.departureTime.getUTCHours() &&
            Math.abs(route.departureTime.getUTCMinutes() - dynamicRoute.departureTime.getUTCMinutes()) <= 5
          );
          
          if (!existingRoute) {
            allRoutes.push(dynamicRoute);
          }
        }
        
        // Ordena por horário de partida
        allRoutes.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());
        
        // Limita ao número máximo de resultados por página
        if (allRoutes.length > limit) {
          allRoutes = allRoutes.slice(0, limit);
        }
      } catch (error) {
        console.error('Erro ao gerar rotas dinâmicas:', error);
        // Em caso de erro, retorna apenas as rotas existentes
      }
    }
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      routes: allRoutes,
      meta: {
        total: allRoutes.length > total ? allRoutes.length : total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    };
  }
  
  /**
   * Busca apenas rotas existentes no banco de dados
   */
  private async searchExistingRoutes(request: SearchRoutesUseCaseRequest) {
    const { origin, destination, date, type, page = 1, limit = 10 } = request;
    
    // Converte a data para um objeto Date se for uma string
    let dateObj: Date | undefined;
    if (date && typeof date === 'string') {
      dateObj = DateUtils.parseToUTC(date);
    } else if (date instanceof Date) {
      dateObj = DateUtils.startOfDayUTC(date);
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