export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}

export interface Payment {
  id: string;
  ticketId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}