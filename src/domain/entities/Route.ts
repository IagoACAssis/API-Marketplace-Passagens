export enum TransportType {
  BUS = 'BUS',
  BOAT = 'BOAT',
  FERRY = 'FERRY'
}

export type LocationType = 'city' | 'terminal' | 'airport' | 'port';

export interface Route {
  id: string;
  companyId: string;
  
  // Origem
  origin: string;
  originState?: string;
  originCountry: string;
  originType: LocationType;
  
  // Destino
  destination: string;
  destinationState?: string;
  destinationCountry: string;
  destinationType: LocationType;
  
  // Horários
  departureTime: Date;
  arrivalTime: Date;
  
  // Detalhes
  price: number;
  type: TransportType;
  totalSeats: number;
  active: boolean;
  isVirtual?: boolean;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}