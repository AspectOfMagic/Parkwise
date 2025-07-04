export type UUID = string;

// Backend ticket structure from microservice
export interface Ticket {
  id: UUID;
  vehicle: UUID;
  cost: number;
  issued: string;    // ISO date
  deadline: string;  // ISO date
  status: string;   // 'paid' or 'unpaid' or 'challenged' or 'accepted'
  desc: string;
}

// Structure for new account creation (credentials)
export interface NewAccount {
  name: string,
  email: string,
  password: string
}

export interface CreatedAccount {
  name: string,
  email: string
}

export interface Enforcer {
  id: string,
  name: string,
  email: string
}
