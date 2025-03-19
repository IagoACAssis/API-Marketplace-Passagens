import { RouteTemplate } from '../entities/RouteTemplate';

export interface RouteTemplateRepository {
  findById(id: string): Promise<RouteTemplate | null>;
  findAll(page?: number, limit?: number): Promise<{ templates: RouteTemplate[], total: number }>;
  create(routeTemplate: Omit<RouteTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RouteTemplate>;
  update(id: string, data: Partial<RouteTemplate>): Promise<RouteTemplate>;
  delete(id: string): Promise<void>;
  
  // Método específico para encontrar templates baseado em origem e destino
  findByOriginAndDestination(
    origin: string,
    destination: string,
    type?: string
  ): Promise<RouteTemplate[]>;
  
  // Método para encontrar templates por empresa
  findByCompanyId(companyId: string, page?: number, limit?: number): Promise<{ templates: RouteTemplate[], total: number }>;
} 