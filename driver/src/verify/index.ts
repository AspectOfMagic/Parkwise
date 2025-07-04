export type UUID = string;

export interface Ticket{
  id: UUID;
  vehicle: UUID;
  cost: number;
  issued: string; // ISO date string
  deadline: string; // ISO date string
  status: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  state: string;
}

export interface Permit {
  id: UUID;
  type: string;
  vehicle: string;
  active: string;
  expiration: string;
  requested: string;
}