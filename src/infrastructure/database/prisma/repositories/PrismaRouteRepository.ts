import { Route, TransportType, LocationType } from '../../../../domain/entities/Route';
import { RouteRepository, Location } from '../../../../domain/repositories/RouteRepository';
import { prisma } from '../client'; 
import { TicketStatus } from '@prisma/client';

export class PrismaRouteRepository implements RouteRepository {
  async findById(id: string): Promise<Route | null> {
    const route = await prisma.route.findUnique({
      where: { id }
    });
    
    if (!route) return null;

    return {
      ...route,
      type: route.type as TransportType,
      originType: route.originType as LocationType,
      destinationType: route.destinationType as LocationType,
      price: Number(route.price),
      originState: route.originState || undefined,
      destinationState: route.destinationState || undefined
    };
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
      type: route.type as TransportType,
      originType: route.originType as LocationType,
      destinationType: route.destinationType as LocationType,
      price: Number(route.price),
      originState: route.originState || undefined,
      destinationState: route.destinationState || undefined
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
      type: route.type as TransportType,
      originType: route.originType as LocationType,
      destinationType: route.destinationType as LocationType,
      price: Number(route.price),
      originState: route.originState || undefined,
      destinationState: route.destinationState || undefined
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
        type: route.type as TransportType,
        originType: route.originType as LocationType,
        destinationType: route.destinationType as LocationType,
        price: Number(route.price),
        originState: route.originState || undefined,
        destinationState: route.destinationState || undefined
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
          
      };
    }
    
    if (destination) {
      where.destination = {
        contains: destination,            
      };
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    
    if (type && Object.values(TransportType).includes(type as TransportType)) {
      where.type = type;
    }
    console.log(where);
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
        type: route.type as TransportType,
        originType: route.originType as LocationType,
        destinationType: route.destinationType as LocationType,
        price: Number(route.price),
        originState: route.originState || undefined,
        destinationState: route.destinationState || undefined
      })),
      total
    };
  }

  async advancedSearch(params: {
    origin: string;
    destination: string;
    date?: Date;
    type?: string;
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    companies?: string[];
    departureTimeStart?: string;
    departureTimeEnd?: string;
    amenities?: string[];
  }): Promise<{ routes: Route[], total: number }> {
    const { 
      origin, destination, date, type, page, limit,
      minPrice, maxPrice, companies, departureTimeStart,
      departureTimeEnd, amenities
    } = params;
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      active: true,
      origin: {
        contains: origin,
        
      },
      destination: {
        contains: destination,
        
      }
    };
    
    // Filtro por data
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    // Filtro por tipo de transporte
    if (type && Object.values(TransportType).includes(type as TransportType)) {
      where.type = type;
    }
    
    // Filtro por preço mínimo
    if (minPrice !== undefined) {
      where.price = {
        ...where.price,
        gte: minPrice
      };
    }
    
    // Filtro por preço máximo
    if (maxPrice !== undefined) {
      where.price = {
        ...where.price,
        lte: maxPrice
      };
    }
    
    // Filtro por empresas
    if (companies && companies.length > 0) {
      where.companyId = {
        in: companies
      };
    }
    
    // Filtro por horário de partida
    if (departureTimeStart || departureTimeEnd) {
      where.departureTime = {
        ...where.departureTime
      };
      
      if (departureTimeStart) {
        const [hours, minutes] = departureTimeStart.split(':').map(Number);
        const startTime = new Date(date || new Date());
        startTime.setHours(hours, minutes, 0, 0);
        
        where.departureTime.gte = startTime;
      }
      
      if (departureTimeEnd) {
        const [hours, minutes] = departureTimeEnd.split(':').map(Number);
        const endTime = new Date(date || new Date());
        endTime.setHours(hours, minutes, 59, 999);
        
        where.departureTime.lte = endTime;
      }
    }
    
    // Filtro por comodidades
    let routesWithAmenities: string[] = [];
    if (amenities && amenities.length > 0) {
      const amenitiesRoutes = await prisma.routeAmenity.findMany({
        where: {
          amenityId: {
            in: amenities
          }
        },
        select: {
          routeId: true
        }
      });
      
      routesWithAmenities = amenitiesRoutes.map(ra => ra.routeId);
      
      if (routesWithAmenities.length > 0) {
        where.id = {
          in: routesWithAmenities
        };
      } else {
        // Se não houver rotas com as comodidades solicitadas, retorna vazio
        return { routes: [], total: 0 };
      }
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
              id: true,
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
        type: route.type as TransportType,
        originType: route.originType as LocationType,
        destinationType: route.destinationType as LocationType,
        price: Number(route.price),
        originState: route.originState || undefined,
        destinationState: route.destinationState || undefined
      })),
      total
    };
  }
  
  async searchLocations(query: string, type?: 'origin' | 'destination'): Promise<Location[]> {
    // Busca locais distintos com base nas rotas existentes
    let locations: Location[] = [];
    
    if (!type || type === 'origin') {
      const originLocations = await prisma.route.findMany({
        where: {
          origin: {
            contains: query,
           
          },
          active: true
        },
        select: {
          origin: true,
          originState: true,
          originCountry: true,
          originType: true
        },
        distinct: ['origin']
      });
      
      locations = [
        ...locations,
        ...originLocations.map(loc => ({
          id: `origin-${loc.origin}`,
          name: loc.origin,
          state: loc.originState || undefined,
          country: loc.originCountry,
          type: loc.originType as 'city' | 'terminal' | 'airport' | 'port'
        }))
      ];
    }
    
    if (!type || type === 'destination') {
      const destinationLocations = await prisma.route.findMany({
        where: {
          destination: {
            contains: query,
          },
          active: true
        },
        select: {
          destination: true,
          destinationState: true,
          destinationCountry: true,
          destinationType: true
        },
        distinct: ['destination']
      });
      
      locations = [
        ...locations,
        ...destinationLocations.map(loc => ({
          id: `destination-${loc.destination}`,
          name: loc.destination,
          state: loc.destinationState || undefined,
          country: loc.destinationCountry,
          type: loc.destinationType as 'city' | 'terminal' | 'airport' | 'port'
        }))
      ];
    }
    
    // Remove duplicatas (mesmo nome)
    const uniqueLocations = locations.filter((loc, index, self) =>
      index === self.findIndex(l => l.name === loc.name)
    );
    
    return uniqueLocations;
  }
  
  async getAvailableSeats(routeId: string): Promise<number> {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      select: { totalSeats: true }
    });
    
    if (!route) {
      return 0;
    }
    
    // Conta os tickets vendidos para esta rota
    const soldTickets = await prisma.ticket.count({
      where: {
        routeId,
        status: {
          in: [TicketStatus.RESERVED, TicketStatus.PAID, TicketStatus.USED]
        }
      }
    });
    
    return Math.max(0, route.totalSeats - soldTickets);
  }
  
  async getRouteAmenities(routeId: string): Promise<string[]> {
    const routeAmenities = await prisma.routeAmenity.findMany({
      where: { routeId },
      include: {
        amenity: {
          select: { name: true }
        }
      }
    });
    
    return routeAmenities.map(ra => ra.amenity.name);
  }
  
  async getRouteCompany(routeId: string): Promise<{ id: string; name: string; logo?: string }> {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        company: {
          select: {
            id: true,
            tradingName: true,
            logo: true
          }
        }
      }
    });
    
    if (!route || !route.company) {
      throw new Error('Empresa não encontrada para esta rota');
    }
    
    return {
      id: route.company.id,
      name: route.company.tradingName,
      logo: route.company.logo || undefined
    };
  }

  async setRouteAmenities(routeId: string, amenityIds: string[]): Promise<void> {
    // Primeiro, remove todas as comodidades existentes para esta rota
    await prisma.routeAmenity.deleteMany({
      where: { routeId }
    });
    
    // Se não houver novas comodidades, retorna
    if (amenityIds.length === 0) {
      return;
    }
    
    // Cria as novas associações de comodidades
    const routeAmenities = amenityIds.map(amenityId => ({
      routeId,
      amenityId
    }));
    
    await prisma.routeAmenity.createMany({
      data: routeAmenities
    });
  }
  
  async hasActiveTickets(routeId: string): Promise<boolean> {
    const ticketCount = await prisma.ticket.count({
      where: {
        routeId,
        status: {
          in: [TicketStatus.RESERVED, TicketStatus.PAID, TicketStatus.USED]
        }
      }
    });
    
    return ticketCount > 0;
  }
}
