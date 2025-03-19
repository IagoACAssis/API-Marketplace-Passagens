import { RouteTemplateRepository } from '../../domain/repositories/RouteTemplateRepository';
import { RouteRepository } from '../../domain/repositories/RouteRepository';
import { LocationType, Route, TransportType } from '../../domain/entities/Route';
import { format, parse } from 'date-fns';
import { DateUtils } from '../../presentation/utils/date-utils';

interface RouteSearchParams {
  origin: string;
  destination: string;
  date: Date;
  type?: string;
  numberOfPassengers?: number;
}

export class DynamicRouteGenerationService {
  constructor(
    private routeTemplateRepository: RouteTemplateRepository,
    private routeRepository: RouteRepository
  ) {}
  
  /**
   * Gera rotas dinâmicas para uma data específica com base nos templates
   */
  async generateRoutes(params: RouteSearchParams, existingRoutesInput?: Route[]): Promise<Route[]> {
    const { origin, destination, date, type, numberOfPassengers = 1 } = params;
    
    // 1. Buscar templates de rota que correspondem à origem e destino
    const templates = await this.routeTemplateRepository.findByOriginAndDestination(
      origin,
      destination,
      type
    );
    
    if (templates.length === 0) {
      return [];
    }
    
    // 2. Filtrar templates pelo dia da semana
    const dayOfWeek = DateUtils.getDayOfWeekUTC(date);
    const matchingTemplates = templates.filter(template => {
      try {
        // Parse a string JSON para array de dias da semana
        const daysOfWeek = JSON.parse(template.daysOfWeek) as number[];
        return daysOfWeek.includes(dayOfWeek);
      } catch (error) {
        console.error(`Erro ao fazer parse do JSON de daysOfWeek para template ${template.id}:`, error);
        return false;
      }
    });
    
    if (matchingTemplates.length === 0) {
      return [];
    }
    
    // 3. Verificar se a rota já existe no banco para esta data
    const searchDate = DateUtils.startOfDayUTC(date);
    const nextDay = DateUtils.addDaysUTC(searchDate, 1);
    
    let existingRoutes;

    // Usar rotas passadas como parâmetro se disponíveis, evitando consulta duplicada
    if (existingRoutesInput) {
      existingRoutes = { routes: existingRoutesInput };
    } else {
      existingRoutes = await this.routeRepository.search({
        origin,
        destination,
        date: searchDate,
        type,
        page: 1,
        limit: 100 // Buscar um limite maior para ter certeza de pegar todas as rotas do dia
      });
    }
    
    // 4. Para cada template, gerar uma rota virtual ou retornar a física se existir
    const dynamicRoutes: Route[] = [];
    
    for (const template of matchingTemplates) {
      // Verificar se já existe rota física para este template na data
      const departureHour = parseInt(template.departureTime.split(':')[0]);
      const departureMinute = parseInt(template.departureTime.split(':')[1]);
      
      // Buscar em rotas existentes com horário próximo (margem de 5 minutos)
      const existingRoute = existingRoutes.routes.find(route => {
        const routeHour = route.departureTime.getUTCHours();
        const routeMinute = route.departureTime.getUTCMinutes();
        
        return (
          routeHour === departureHour && 
          Math.abs(routeMinute - departureMinute) <= 5 &&
          route.companyId === template.companyId
        );
      });
      
      if (existingRoute) {
        // Se a rota já existe e tem assentos suficientes, incluí-la no resultado
        const availableSeats = await this.routeRepository.getAvailableSeats(existingRoute.id);
        if (availableSeats >= numberOfPassengers) {
          dynamicRoutes.push(existingRoute);
        }
      } else {
        // Criar uma rota virtual baseada no template
        const departureTime = new Date(date);
        departureTime.setUTCHours(departureHour, departureMinute, 0);
        
        const arrivalHour = parseInt(template.arrivalTime.split(':')[0]);
        const arrivalMinute = parseInt(template.arrivalTime.split(':')[1]);
        
        const arrivalTime = new Date(date);
        arrivalTime.setUTCHours(arrivalHour, arrivalMinute, 0);
        
        // Se a hora de chegada for menor que a partida, provavelmente é no dia seguinte
        if (arrivalTime < departureTime) {
          arrivalTime.setUTCDate(arrivalTime.getUTCDate() + 1);
        }
        
        // Criar rota virtual (sem id real do banco)
        const virtualRoute: Route = {
          id: `virtual-${template.id}-${DateUtils.formatUTC(date)}`,
          companyId: template.companyId,
          origin: template.origin,
          originState: template.originState,
          originCountry: template.originCountry,
          originType: template.originType as LocationType,
          destination: template.destination,
          destinationState: template.destinationState,
          destinationCountry: template.destinationCountry,
          destinationType: template.destinationType as LocationType,
          departureTime,
          arrivalTime,
          price: template.price,
          type: template.type,
          totalSeats: template.totalSeats,
          active: true,
          isVirtual: true, // Marcador para identificar rotas virtuais
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        dynamicRoutes.push(virtualRoute);
      }
    }
    
    return dynamicRoutes;
  }
  
  /**
   * Materializa uma rota virtual, criando-a no banco de dados
   */
  async materializeRoute(virtualRouteId: string): Promise<Route> {
    // Extrair informações do ID virtual
    // O formato é "virtual-UUID-YYYY-MM-DD"
    // Precisamos extrair o UUID completo e a data
    const virtualPrefix = "virtual-";
    
    if (!virtualRouteId.startsWith(virtualPrefix)) {
      throw new Error('ID de rota virtual inválido');
    }
    
    // Remove o prefixo "virtual-"
    const withoutPrefix = virtualRouteId.substring(virtualPrefix.length);
    
    // Extrai os últimos 10 caracteres (YYYY-MM-DD)
    const dateStr = withoutPrefix.substring(withoutPrefix.length - 10);
    
    // Extrai o UUID (tudo entre o prefixo e a data)
    const templateId = withoutPrefix.substring(0, withoutPrefix.length - 11); // -11 para considerar o hífen antes da data
    
    console.log(`Materializando rota: templateId=${templateId}, data=${dateStr}`);
    
    // Buscar o template
    const template = await this.routeTemplateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template de rota não encontrado');
    }
    
    // Criar data de partida
    const departureDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    const departureHour = parseInt(template.departureTime.split(':')[0]);
    const departureMinute = parseInt(template.departureTime.split(':')[1]);
    
    const departureTime = new Date(departureDate);
    departureTime.setUTCHours(departureHour, departureMinute, 0);
    
    const arrivalHour = parseInt(template.arrivalTime.split(':')[0]);
    const arrivalMinute = parseInt(template.arrivalTime.split(':')[1]);
    
    const arrivalTime = new Date(departureDate);
    arrivalTime.setUTCHours(arrivalHour, arrivalMinute, 0);
    
    // Se a hora de chegada for menor que a partida, provavelmente é no dia seguinte
    if (arrivalTime < departureTime) {
      arrivalTime.setUTCDate(arrivalTime.getUTCDate() + 1);
    }
    
    // Verificar se a rota já não foi criada (para evitar duplicação)
    const existingRoutes = await this.routeRepository.search({
      origin: template.origin,
      destination: template.destination,
      date: departureDate,
      page: 1,
      limit: 100
    });
    
    const existingRoute = existingRoutes.routes.find(route => {
      const routeHour = route.departureTime.getUTCHours();
      const routeMinute = route.departureTime.getUTCMinutes();
      
      return (
        routeHour === departureHour && 
        Math.abs(routeMinute - departureMinute) <= 5 &&
        route.companyId === template.companyId
      );
    });
    
    if (existingRoute) {
      return existingRoute;
    }
    
    try {
      // Criar rota física no banco
      const route = await this.routeRepository.create({
        companyId: template.companyId,
        origin: template.origin,
        originState: template.originState,
        originCountry: template.originCountry,
        originType: template.originType as LocationType,
        destination: template.destination,
        destinationState: template.destinationState,
        destinationCountry: template.destinationCountry,
        destinationType: template.destinationType as LocationType,
        departureTime,
        arrivalTime,
        price: template.price,
        type: template.type as TransportType,
        totalSeats: template.totalSeats,
        active: true
      });
      
      return route;
    } catch (error) {
      console.error('Erro ao materializar rota virtual:', error);
      throw new Error('Falha ao criar rota física a partir do template');
    }
  }
} 