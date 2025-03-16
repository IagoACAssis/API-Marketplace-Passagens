import { Route } from '../entities/Route';

export interface Location {
  id: string;
  name: string;
  state?: string;
  country: string;
  type: 'city' | 'terminal' | 'airport' | 'port';
}

export interface RouteRepository {
  findById(id: string): Promise<Route | null>;
  create(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  update(id: string, data: Partial<Route>): Promise<Route>;
  delete(id: string): Promise<void>;
  findByCompany(companyId: string, page: number, limit: number): Promise<{ routes: Route[], total: number }>;
  
  // Busca básica de rotas
  search(params: {
    origin?: string;
    destination?: string;
    date?: Date;
    type?: string;
    page: number;
    limit: number;
  }): Promise<{ routes: Route[], total: number }>;
  
  // Busca avançada de rotas com filtros adicionais
  advancedSearch(params: {
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
  }): Promise<{ routes: Route[], total: number }>;
  
  // Busca de locais para autocomplete
  searchLocations(query: string, type?: 'origin' | 'destination'): Promise<Location[]>;
  
  // Obter assentos disponíveis para uma rota
  getAvailableSeats(routeId: string): Promise<number>;
  
  // Obter comodidades de uma rota
  getRouteAmenities(routeId: string): Promise<string[]>;
  
  // Definir comodidades de uma rota
  setRouteAmenities(routeId: string, amenityIds: string[]): Promise<void>;
  
  // Obter informações da empresa de uma rota
  getRouteCompany(routeId: string): Promise<{
    id: string;
    tradingName: string;
    legalName: string;
  }>;
  
  // Verificar se uma rota tem tickets ativos
  hasActiveTickets(routeId: string): Promise<boolean>;
}