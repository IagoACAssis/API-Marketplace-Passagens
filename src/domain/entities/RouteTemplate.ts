import { TransportType } from './Route';

export interface RouteTemplate {
  id: string;
  companyId: string;
  origin: string;
  originState?: string;
  originCountry: string;
  originType: string;
  destination: string;
  destinationState?: string;
  destinationCountry: string;
  destinationType: string;
  departureTime: string; // Formato HH:MM
  arrivalTime: string;   // Formato HH:MM
  daysOfWeek: string;    // JSON: "[0,1,2,3,4,5,6]"
  price: number;
  type: TransportType;
  totalSeats: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
} 