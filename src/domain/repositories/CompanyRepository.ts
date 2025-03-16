import { Company } from '../entities/Company';

export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;  
  findByCNPJ(cnpj: string): Promise<Company | null>;
  create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
  update(id: string, data: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
  listAll(page: number, limit: number): Promise<{ companies: Company[], total: number }>;
  approve(id: string): Promise<Company>;
  reject(id: string, reason: string): Promise<Company>;
}