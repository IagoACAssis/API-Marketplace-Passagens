import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export interface Payment {
  id: string;
  userId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: Prisma.Decimal | number;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}