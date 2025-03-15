import { FastifyInstance } from 'fastify';
import { RouteController } from '../controllers/RouteController';
import { SearchRoutesUseCase } from '../../application/useCases/routes/SearchRoutesUseCase';
import { PrismaRouteRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteRepository';
import { GetRouteDetailsUseCase } from '../../application/useCases/routes/GetRouteDetailsUseCase';
import { SearchLocationsUseCase } from '../../application/useCases/routes/SearchLocationsUseCase';
import { AdvancedSearchRoutesUseCase } from '../../application/useCases/routes/AdvancedSearchRoutesUseCase';
import { CreateRouteUseCase } from '../../application/useCases/routes/CreateRouteUseCase';
import { UpdateRouteUseCase } from '../../application/useCases/routes/UpdateRouteUseCase';
import { DeleteRouteUseCase } from '../../application/useCases/routes/DeleteRouteUseCase';
import { ListCompanyRoutesUseCase } from '../../application/useCases/routes/ListCompanyRoutesUseCase';
import { verifyJwt } from '../middlewares/verify-jwt';
import { verifyCompanyRole } from '../middlewares/verify-company-role';


export async function routeRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const routeRepository = new PrismaRouteRepository();
  
  // Inicializa casos de uso
  const searchRoutesUseCase = new SearchRoutesUseCase(routeRepository);
  const getRouteDetailsUseCase = new GetRouteDetailsUseCase(routeRepository);
  const searchLocationsUseCase = new SearchLocationsUseCase(routeRepository);
  const advancedSearchRoutesUseCase = new AdvancedSearchRoutesUseCase(routeRepository);
  const createRouteUseCase = new CreateRouteUseCase(routeRepository);
  const updateRouteUseCase = new UpdateRouteUseCase(routeRepository);
  const deleteRouteUseCase = new DeleteRouteUseCase(routeRepository);
  const listCompanyRoutesUseCase = new ListCompanyRoutesUseCase(routeRepository);
  
  // Inicializa controlador
  const routeController = new RouteController(
    searchRoutesUseCase,
    getRouteDetailsUseCase,
    searchLocationsUseCase,
    advancedSearchRoutesUseCase,
    createRouteUseCase,
    updateRouteUseCase,
    deleteRouteUseCase,
    listCompanyRoutesUseCase
  );

  // Rotas públicas (sem autenticação)
  
  // Rotas de busca básica
  app.get('/search', (req, reply) => routeController.search(req, reply));
  
  // Rota para busca de locais (autocomplete)
  app.get('/locations', (req, reply) => routeController.searchLocations(req, reply));
  
  // Rota para busca avançada
  app.get('/search/advanced', (req, reply) => routeController.advancedSearch(req, reply));
  
  // Rota para detalhes de uma viagem específica
  app.get('/:id', (req, reply) => routeController.getDetails(req, reply));
  
  // Rotas protegidas (requerem autenticação e permissão de empresa)
  
  // Grupo de rotas para gestão (requer autenticação)
  app.register(async (protectedRoutes) => {
    // Aplica middleware de autenticação
    protectedRoutes.addHook('onRequest', verifyJwt);
    // Aplica middleware de verificação de papel de empresa
    protectedRoutes.addHook('onRequest', verifyCompanyRole);

    // Listar rotas da empresa
    protectedRoutes.get('/company', (req, reply) => routeController.listCompanyRoutes(req, reply));

    // Criar nova rota
    protectedRoutes.post('/', (req, reply) => routeController.create(req, reply));
    
    // Atualizar rota existente
    protectedRoutes.put('/:id', (req, reply) => routeController.update(req, reply));
    
    // Excluir rota
    protectedRoutes.delete('/:id', (req, reply) => routeController.delete(req, reply));
  });
}