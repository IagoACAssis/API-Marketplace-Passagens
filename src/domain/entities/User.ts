export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}