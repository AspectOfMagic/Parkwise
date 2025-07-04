export interface TicketID {
  id: string
}

export interface VehicleID {
  id: string
}

export interface SessionUser {
  id: string,
  role: string
}

declare global {
  namespace Express {
    export interface Request {
      user?: SessionUser
    }
  }
}