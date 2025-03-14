export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  companyId?: string | null;
  name: string;
  email: string;
  passwordHash: string;
  cpf?: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}