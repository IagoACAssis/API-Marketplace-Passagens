import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateCompanyUseCase } from '../../application/useCases/companies/CreateCompanyUseCase';  
import { UpdateCompanyUseCase } from '../../application/useCases/companies/UpdateCompanyUseCase';
import { DeleteCompanyUseCase } from '../../application/useCases/companies/DeleteCompanyUseCase';
import { ListCompaniesUseCase } from '../../application/useCases/companies/ListCompaniesUseCase';
import { ApproveCompanyUseCase } from '../../application/useCases/companies/ApproveCompanyUseCase';
import { RejectCompanyUseCase } from 'src/application/useCases/companies/RejectCompanyUseCase';

const createCompanySchema = z.object({
  tradingName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  legalName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(11, 'Telefone deve ter no mínimo 11 caracteres'),
  address: z.string().min(3, 'Endereço deve ter no mínimo 3 caracteres'),
});

const updateCompanySchema = z.object({
  tradingName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  legalName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(11, 'Telefone deve ter no mínimo 11 caracteres'),
  address: z.string().min(3, 'Endereço deve ter no mínimo 3 caracteres'),
});

export class CompanyController {
  constructor(
    private createCompanyUseCase: CreateCompanyUseCase,
    private updateCompanyUseCase: UpdateCompanyUseCase,
    private deleteCompanyUseCase: DeleteCompanyUseCase,
    private listCompaniesUseCase: ListCompaniesUseCase,
    private approveCompanyUseCase: ApproveCompanyUseCase,
    private rejectCompanyUseCase: RejectCompanyUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {      
      const { tradingName, legalName, cnpj, email, phone, address } = createCompanySchema.parse(request.body);

      const company = await this.createCompanyUseCase.execute({       
        tradingName,
        legalName,
        cnpj,
        email,
        phone,
        address                
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
      const { tradingName, legalName, cnpj, email, phone, address } = updateCompanySchema.parse(request.body);

      const company = await this.updateCompanyUseCase.execute(id, {
        tradingName,
        legalName,
        cnpj,
        email,
        phone,
        address
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

      const result = await this.approveCompanyUseCase.execute(id);

      return reply.send({ result });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
  
  async reject(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason?: string };

      const result = await this.rejectCompanyUseCase.execute(id, reason);

      return reply.send({ result });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor.' });
    }
  }
 
}