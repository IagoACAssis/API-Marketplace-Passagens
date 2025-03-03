export interface Company {
  id: string;
  userId: string;
  cnpj: string;
  tradingName: string;
  legalName: string;
  logo?: string;
  document?: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}