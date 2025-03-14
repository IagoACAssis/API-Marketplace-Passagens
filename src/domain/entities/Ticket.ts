export enum TicketStatus {
  RESERVED = 'RESERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  USED = 'USED'
}

export interface Ticket {
  id: string;
  routeId: string;
  userId: string;
  status: TicketStatus;
  ticketCode: string;
  passenger: string;
  passengerCpf: string;
  seatNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
