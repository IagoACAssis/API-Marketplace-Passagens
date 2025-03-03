import { Route, TransportType } from '@domain/entities/Route';
import { RouteRepository } from '@domain/repositories/RouteRepository';
import { prisma } from '../client';

export class PrismaRouteRepository implements RouteRepository {
  async findById(id: string): Promise<Route | null> {
    const route = await prisma.route.findUnique({
      where: { id }
    });
    
    return route;
  }

  async create(routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
    const route = await prisma.route.create({
      data: {
        ...routeData,
        price: routeData.price as any // Convertendo para Decimal
      }
    });
    
    return {
      ...route,
      price: Number(route.price) // Convertendo Decimal para number
    };
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    const routeData = { ...data };
    
    // Converte o preço para Decimal se estiver presente
    if (routeData.price !== undefined) {
      routeData.price = routeData.price as any;
    }
    
    const route = await prisma.route.update({
      where: { id },
      data: routeData
    });
    
    return {
      ...route,
      price: Number(route.price)
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.route.delete({
      where: { id }
    });
  }

  async findByCompany(companyId: string, page: number, limit: number): Promise<{ routes: Route[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { departureTime: 'asc' }
      }),
      prisma.route.count({
        where: { companyId }
      })
    ]);
    
    return {
      routes: routes.map(route => ({
        ...route,
        price: Number(route.price)
      })),
      total
    };
  }

  async search(params: {
    origin?: string;
    destination?: string;
    date?: Date;
    type?: string;
    page: number;
    limit: number;
  }): Promise<{ routes: Route[], total: number }> {
    const { origin, destination, date, type, page, limit } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {
      active: true
    };
    
    if (origin) {
      where.origin = {
        contains: origin,
        mode: 'insensitive'
      };
    }
    
    if (destination) {
      where.destination = {
        contains: destination,
        mode: 'insensitive'
      };
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    if (type && Object.values(TransportType).includes(type as TransportType)) {
      where.type = type;
    }
    
    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: 'asc' },
        include: {
          company: {
            select: {
              tradingName: true,
              logo: true
            }
          }
        }
      }),
      prisma.route.count({ where })
    ]);
    
    return {
      routes: routes.map(route => ({
        ...route,
        price: Number(route.price)
      })),
      total
    };
  }
}
