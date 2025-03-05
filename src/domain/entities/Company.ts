export interface Company {
  id: string;  
  cnpj: string;
  tradingName: string;
  legalName: string;
  logo?: string;
  document?: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}