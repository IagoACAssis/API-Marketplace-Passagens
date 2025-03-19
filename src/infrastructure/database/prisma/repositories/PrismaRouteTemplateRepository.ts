import { prisma } from '../../../../infrastructure/database/prisma/client';
import { RouteTemplate } from '../../../../domain/entities/RouteTemplate';
import { RouteTemplateRepository } from '../../../../domain/repositories/RouteTemplateRepository';
import { TransportType } from '../../../../domain/entities/Route';

export class PrismaRouteTemplateRepository implements RouteTemplateRepository {
  async findById(id: string): Promise<RouteTemplate | null> {
    const routeTemplate = await prisma.routeTemplate.findUnique({
      where: { id }
    });
    
    return routeTemplate ? {
      ...routeTemplate,
      originState: routeTemplate.originState || undefined,
      destinationState: routeTemplate.destinationState || undefined,
      type: routeTemplate.type as TransportType
    } : null;
  }
  
  async findAll(page = 1, limit = 10): Promise<{ templates: RouteTemplate[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [routeTemplates, total] = await Promise.all([
      prisma.routeTemplate.findMany({
        take: limit,
        skip
      }),
      prisma.routeTemplate.count()
    ]);
    
    return {
      templates: routeTemplates.map(template => ({
        ...template,
        originState: template.originState || undefined,
        destinationState: template.destinationState || undefined,
        type: template.type as TransportType
      })),
      total
    };
  }
  
  async create(routeTemplate: Omit<RouteTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RouteTemplate> {
    const newRouteTemplate = await prisma.routeTemplate.create({
      data: routeTemplate
    });
    
    return {
      ...newRouteTemplate,
      originState: newRouteTemplate.originState || undefined,
      destinationState: newRouteTemplate.destinationState || undefined,
      type: newRouteTemplate.type as TransportType
    }; 
  }
  
  async update(id: string, data: Partial<RouteTemplate>): Promise<RouteTemplate> {
    const updatedRouteTemplate = await prisma.routeTemplate.update({
      where: { id },
      data
    });
    
    return {
      ...updatedRouteTemplate,
      originState: updatedRouteTemplate.originState || undefined,
      destinationState: updatedRouteTemplate.destinationState || undefined,
      type: updatedRouteTemplate.type as TransportType
    };
  }
  
  async delete(id: string): Promise<void> {
    await prisma.routeTemplate.delete({
      where: { id }
    });
  }
  
  async findByOriginAndDestination(
    origin: string,
    destination: string,
    type?: string
  ): Promise<RouteTemplate[]> {
    const routeTemplates = await prisma.routeTemplate.findMany({
      where: {
        origin,
        destination,
        ...(type ? { type } : {}),
        active: true
      }
    });
    
    return routeTemplates.map(template => ({
      ...template,
      originState: template.originState || undefined,
      destinationState: template.destinationState || undefined,
      type: template.type as TransportType
    }));
  }
  
  async findByCompanyId(companyId: string, page = 1, limit = 10): Promise<{ templates: RouteTemplate[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [routeTemplates, total] = await Promise.all([
      prisma.routeTemplate.findMany({
        where: { companyId },
        take: limit,
        skip
      }),
      prisma.routeTemplate.count({
        where: { companyId }
      })
    ]);
    
    return {
      templates: routeTemplates.map(template => ({
        ...template,
        originState: template.originState || undefined,
        destinationState: template.destinationState || undefined,
        type: template.type as TransportType
      })),
      total
    };
  }
} 