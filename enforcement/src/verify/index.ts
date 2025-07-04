export type UUID = string;

export interface Vehicle {
  id: UUID;
  plate: string;
  make: string;
  model: string;
  year?: number;
  ownerId: UUID;
}

export interface Permit {
  id: UUID;
  holder: UUID;
  type: UUID;
  vehicle: UUID;
  data: {
    active: string;   // ISO date
    expires: string;  // ISO date
    deleted: string;  // "0" or "1"
  };
}

// Backend ticket structure from microservice
export interface BackendTicket {
  id: UUID;
  vehicle: UUID;
  cost: number;
  issued: string;    // ISO date
  deadline: string;  // ISO date
  status: string;    // 'paid' or 'unpaid'
}

// Frontend ticket structure for UI display
export interface Ticket {
  id: UUID;
  vehicleId: UUID;
  licensePlate: string;
  timestamp: string;  // ISO date
  location: string;
  violation: string;
  amount: number;
  isPaid: boolean;
  enforcerId: UUID;
}

// Input for creating a new ticket
export interface NewTicket {
  vehicle: UUID;
  cost: number;
  metadata?: {
    licensePlate: string;
    location: string;
    violation: string;
    enforcerId: UUID;
    timestamp: string;
  };
}

export interface VehiclePermitStatus {
  vehicle: Vehicle | null;
  // permit: Permit | null;
  hasValidPermit: boolean;
  message: string;
}

export interface TicketResult {
  success: boolean;
  ticket?: Ticket;
  message: string;
}
