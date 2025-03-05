import { ApproveCompanyUseCase } from "@/application/useCases/companies/ApproveCompanyUseCase";
import { CreateCompanyUseCase } from "@/application/useCases/companies/CreateCompanyUseCase";
import { DeleteCompanyUseCase } from "@/application/useCases/companies/DeleteCompanyUseCase";
import { ListCompaniesUseCase } from "@/application/useCases/companies/ListCompaniesUseCase";
import { UpdateCompanyUseCase } from "@/application/useCases/companies/UpdateCompanyUseCase";
import { PrismaCompanyRepository } from "@/infrastructure/database/prisma/repositories/PrismaCompanyRepository";
import { FastifyInstance } from "fastify";
import { CompanyController } from "../controllers/CompanyController";
import { authenticate } from "../middlewares/authenticate";

export async function companyRoutes(app: FastifyInstance) {

  app.addHook('onRequest', authenticate);

  // Inicializa dependências
  const companyRepository = new PrismaCompanyRepository();
  const approveCompanyUseCase = new ApproveCompanyUseCase(companyRepository);
  const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
  const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
  const listCompaniesUseCase = new ListCompaniesUseCase(companyRepository);
  const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);

  const companyController = new CompanyController(createCompanyUseCase, updateCompanyUseCase, deleteCompanyUseCase, listCompaniesUseCase, approveCompanyUseCase);

  // Rotas
  app.get('/list', (req, reply) => companyController.list(req, reply));
  app.post('/create', (req, reply) => companyController.create(req, reply));
  app.patch('/:id/update', (req, reply) => companyController.update(req, reply));
  app.delete('/:id/delete', (req, reply) => companyController.delete(req, reply));
  app.patch('/:id/approve', (req, reply) => companyController.approve(req, reply));
}