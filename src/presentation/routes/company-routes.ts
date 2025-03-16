import { ApproveCompanyUseCase } from "../../application/useCases/companies/ApproveCompanyUseCase";
import { CreateCompanyUseCase } from "../../application/useCases/companies/CreateCompanyUseCase";
import { DeleteCompanyUseCase } from "../../application/useCases/companies/DeleteCompanyUseCase";
import { ListCompaniesUseCase } from "../../application/useCases/companies/ListCompaniesUseCase";
import { UpdateCompanyUseCase } from "../../application/useCases/companies/UpdateCompanyUseCase";
import { PrismaCompanyRepository } from "../../infrastructure/database/prisma/repositories/PrismaCompanyRepository";
import { FastifyInstance } from "fastify";
import { CompanyController } from "../controllers/CompanyController";
import { authenticate } from "../middlewares/authenticate";
import { verifyJwt } from "../middlewares/verify-jwt";
import { isAdmin } from "../middlewares/isAdmin";
import { RejectCompanyUseCase } from "../../application/useCases/companies/RejectCompanyUseCase";
export async function companyRoutes(app: FastifyInstance) {

  app.addHook('onRequest', authenticate);

  // Inicializa dependências
  const companyRepository = new PrismaCompanyRepository();
  const approveCompanyUseCase = new ApproveCompanyUseCase(companyRepository);
  const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
  const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
  const listCompaniesUseCase = new ListCompaniesUseCase(companyRepository);
  const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
  const rejectCompanyUseCase = new RejectCompanyUseCase(companyRepository);

  const companyController = new CompanyController(createCompanyUseCase, updateCompanyUseCase, deleteCompanyUseCase, listCompaniesUseCase, approveCompanyUseCase, rejectCompanyUseCase);
  
  app.addHook('onRequest', verifyJwt);
  app.addHook('onRequest', isAdmin);
  // Rotas
  app.get('/list', (req, reply) => companyController.list(req, reply));
  app.post('/create', (req, reply) => companyController.create(req, reply));
  app.patch('/:id', (req, reply) => companyController.update(req, reply));
  app.delete('/:id', (req, reply) => companyController.delete(req, reply));
  app.patch('/:id/approve', (req, reply) => companyController.approve(req, reply));
  app.patch('/:id/reject', (req, reply) => companyController.reject(req, reply));
 
}