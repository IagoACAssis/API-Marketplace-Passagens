import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RouteTemplateRepository } from '../../domain/repositories/RouteTemplateRepository';
import { TransportType } from '../../domain/entities/Route';
  
// Schema para validação da criação de template de rota
const createRouteTemplateSchema = z.object({
  origin: z.string().min(1, 'Origem é obrigatória'),
  originState: z.string().optional(),
  originCountry: z.string().min(2, 'País de origem é obrigatório'),
  originType: z.enum(['city', 'terminal', 'airport', 'port']),
  destination: z.string().min(1, 'Destino é obrigatório'),
  destinationState: z.string().optional(),
  destinationCountry: z.string().min(2, 'País de destino é obrigatório'),
  destinationType: z.enum(['city', 'terminal', 'airport', 'port']),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1, 'Deve selecionar pelo menos um dia da semana'),
  price: z.number().positive('Preço deve ser positivo'),
  type: z.enum([TransportType.BUS, TransportType.BOAT, TransportType.FERRY]),
  totalSeats: z.number().int().positive('Número de assentos deve ser positivo'),
  active: z.boolean().default(true)
});

// Schema para validação da atualização de template de rota
const updateRouteTemplateSchema = createRouteTemplateSchema.partial();

// Schema para validação de parâmetros de rota
const routeTemplateParamsSchema = z.object({
  id: z.string().uuid('ID inválido')
});

// Schema para paginação
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

export class RouteTemplateController {
  constructor(
    private routeTemplateRepository: RouteTemplateRepository
  ) {}

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const { page, limit } = paginationSchema.parse(query);
      
      const result = await this.routeTemplateRepository.findAll(page, limit);
      
      return reply.send({
        templates: result.templates,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasMore: page < Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = routeTemplateParamsSchema.parse(request.params);
      
      const template = await this.routeTemplateRepository.findById(id);
      
      if (!template) {
        return reply.status(404).send({ message: 'Template de rota não encontrado' });
      }
      
      // Converter o campo daysOfWeek de volta para array para a resposta
      const templateWithParsedDays = {
        ...template,
        daysOfWeek: tryParseJson(template.daysOfWeek, [])
      };
      
      return reply.send({ template: templateWithParsedDays });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas' });
      }
      
      const templateData = createRouteTemplateSchema.parse(request.body);
      
      // Converter o array de dias da semana para string JSON
      const daysOfWeekJson = JSON.stringify(templateData.daysOfWeek);
      
      const newTemplate = await this.routeTemplateRepository.create({
        ...templateData,
        daysOfWeek: daysOfWeekJson,
        companyId
      });
      
      // Converter o campo daysOfWeek de volta para array para a resposta
      const templateWithParsedDays = {
        ...newTemplate,
        daysOfWeek: tryParseJson(newTemplate.daysOfWeek, [])
      };
      
      return reply.status(201).send({ template: templateWithParsedDays });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas' });
      }
      
      const { id } = routeTemplateParamsSchema.parse(request.params);
      const updateData = updateRouteTemplateSchema.parse(request.body);
      
      // Verifica se o template pertence à empresa
      const existingTemplate = await this.routeTemplateRepository.findById(id);
      
      if (!existingTemplate) {
        return reply.status(404).send({ message: 'Template de rota não encontrado' });
      }
      
      if (existingTemplate.companyId !== companyId) {
        return reply.status(403).send({ message: 'Você não tem permissão para atualizar este template' });
      }
      
      // Se dias da semana foram atualizados, converte para JSON
      const dataToUpdate: any = { ...updateData };
      if (updateData.daysOfWeek) {
        dataToUpdate.daysOfWeek = JSON.stringify(updateData.daysOfWeek);
      }
      
      const updatedTemplate = await this.routeTemplateRepository.update(id, dataToUpdate);
      
      // Converter o campo daysOfWeek de volta para array para a resposta
      const templateWithParsedDays = {
        ...updatedTemplate,
        daysOfWeek: tryParseJson(updatedTemplate.daysOfWeek, [])
      };
      
      return reply.send({ template: templateWithParsedDays });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas' });
      }
      
      const { id } = routeTemplateParamsSchema.parse(request.params);
      
      // Verifica se o template pertence à empresa
      const existingTemplate = await this.routeTemplateRepository.findById(id);
      
      if (!existingTemplate) {
        return reply.status(404).send({ message: 'Template de rota não encontrado' });
      }
      
      if (existingTemplate.companyId !== companyId) {
        return reply.status(403).send({ message: 'Você não tem permissão para remover este template' });
      }
      
      await this.routeTemplateRepository.delete(id);
      
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }

  async findByCompany(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.user as { companyId: string };
      
      if (!companyId) {
        return reply.status(403).send({ message: 'Acesso permitido apenas para empresas' });
      }
      
      const query = request.query as any;
      const { page, limit } = paginationSchema.parse(query);
      
      const result = await this.routeTemplateRepository.findByCompanyId(companyId, page, limit);
      
      // Converter o campo daysOfWeek de volta para array para cada template na resposta
      const templatesWithParsedDays = result.templates.map(template => ({
        ...template,
        daysOfWeek: tryParseJson(template.daysOfWeek, [])
      }));
      
      return reply.send({
        templates: templatesWithParsedDays,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasMore: page < Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros inválidos', errors: error.format() });
      }
      
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      
      return reply.status(500).send({ message: 'Erro interno do servidor' });
    }
  }
}

// Função auxiliar para fazer parse seguro de JSON
function tryParseJson<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Erro ao fazer parse do JSON:', error);
    return defaultValue;
  }
} 