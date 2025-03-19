import { SearchRoutesUseCase } from '../../application/useCases/routes/SearchRoutesUseCase';
import { PrismaRouteRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteRepository';
import { PrismaRouteTemplateRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteTemplateRepository';
import { DynamicRouteGenerationService } from '../../application/services/DynamicRouteGenerationService';

export function makeSearchRoutesUseCase() {
  const routeRepository = new PrismaRouteRepository();
  const routeTemplateRepository = new PrismaRouteTemplateRepository();
  const dynamicRouteService = new DynamicRouteGenerationService(
    routeTemplateRepository,
    routeRepository
  );
  
  const searchRoutesUseCase = new SearchRoutesUseCase(
    routeRepository,
    dynamicRouteService
  );
  
  return searchRoutesUseCase;
} 