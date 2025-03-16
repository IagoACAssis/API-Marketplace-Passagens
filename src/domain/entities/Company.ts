import { CompanyStatus } from "@prisma/client";

export interface Company {
  id: string;  
  tradingName?: string;
  legalName?: string;
  cnpj: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: CompanyStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}