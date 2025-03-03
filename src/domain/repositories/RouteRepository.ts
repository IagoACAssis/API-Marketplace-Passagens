import { Route } from '../entities/Route';

export interface RouteRepository {
  findById(id: string): Promise<Route | null>;
  create(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  update(id: string, data: Partial<Route>): Promise<Route>;
  delete(id: string): Promise<void>;
  findByCompany(companyId: string, page: number, limit: number): Promise<{ routes: Route[], total: number }>;
  search(params: {
    origin?: string;
    destination?: string;
    date?: Date;
    type?: string;
    page: number;
    limit: number;
  }): Promise<{ routes: Route[], total: number }>;
}