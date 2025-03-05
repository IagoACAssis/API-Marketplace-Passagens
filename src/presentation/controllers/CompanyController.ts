import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateCompanyUseCase } from '@application/useCases/companies/CreateCompanyUseCase';
import { UpdateCompanyUseCase } from '@application/useCases/companies/UpdateCompanyUseCase';
import { DeleteCompanyUseCase } from '@application/useCases/companies/DeleteCompanyUseCase';
import { ListCompaniesUseCase } from '@application/useCases/companies/ListCompaniesUseCase';
import { ApproveCompanyUseCase } from '@application/useCases/companies/ApproveCompanyUseCase';

const createCompanySchema = z.object({
  cnpj: z.string().min(14, 'CNPJ deve ter 14 caracteres'),
  tradingName: z.string().min(3, 'Nome fantasia deve ter no mínimo 3 caracteres'),
  legalName: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres'),
  logo: z.string().optional(),
  document: z.string().optional()
});

const updateCompanySchema = z.object({
  tradingName: z.string().optional(),
  legalName: z.string().optional(),
  logo: z.string().optional(),
  document: z.string().optional()
});

export class CompanyController {
  constructor(
    private createCompanyUseCase: CreateCompanyUseCase,
    private updateCompanyUseCase: UpdateCompanyUseCase,
    private deleteCompanyUseCase: DeleteCompanyUseCase,
    private listCompaniesUseCase: ListCompaniesUseCase,
    private approveCompanyUseCase: ApproveCompanyUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {      
      const { cnpj, tradingName, legalName, logo, document } = createCompanySchema.parse(request.body);

      const company = await this.createCompanyUseCase.execute({       
        cnpj,
        tradingName,
        legalName,
        logo,
        document
      });

      return reply.status(201).send({ company });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { tradingName, legalName, logo, document } = updateCompanySchema.parse(request.body);

      const company = await this.updateCompanyUseCase.execute(id, {
        tradingName,
        legalName,
        logo,
        document
      });

      return reply.send({ company });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados de entrada inválidos.', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      await this.deleteCompanyUseCase.execute(id);

      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 10;

      const result = await this.listCompaniesUseCase.execute(page, limit);

      return reply.send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }

  async approve(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const company = await this.approveCompanyUseCase.execute(id);

      return reply.send({ company });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
}