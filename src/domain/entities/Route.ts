export enum TransportType {
  BUS = 'BUS',
  BOAT = 'BOAT',
  FERRY = 'FERRY'
}

export interface Route {
  id: string;
  companyId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  type: TransportType;
  capacity: number;
  availableSeats: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}