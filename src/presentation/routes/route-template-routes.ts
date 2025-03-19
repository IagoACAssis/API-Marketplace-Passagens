import { FastifyInstance } from 'fastify';
import { RouteTemplateController } from '../controllers/RouteTemplateController';
import { PrismaRouteTemplateRepository } from '../../infrastructure/database/prisma/repositories/PrismaRouteTemplateRepository';
import { verifyJwt } from '../middlewares/verify-jwt';

export async function routeTemplateRoutes(app: FastifyInstance) {
  // Todas as rotas são protegidas
  app.addHook('onRequest', verifyJwt);
  
  const routeTemplateRepository = new PrismaRouteTemplateRepository();
  const routeTemplateController = new RouteTemplateController(routeTemplateRepository);
  
  // Listar templates da empresa autenticada (deve vir antes da rota com parâmetro)
  app.get('/company-templates', (req, reply) => routeTemplateController.findByCompany(req, reply));
  
  // Listar todos os templates
  app.get('/', (req, reply) => routeTemplateController.findAll(req, reply));
  
  // Buscar template por ID
  app.get('/:id', (req, reply) => routeTemplateController.findById(req, reply));
  
  // Criar novo template
  app.post('/', (req, reply) => routeTemplateController.create(req, reply));
  
  // Atualizar template
  app.put('/:id', (req, reply) => routeTemplateController.update(req, reply));
  
  // Excluir template
  app.delete('/:id', (req, reply) => routeTemplateController.delete(req, reply));
} 