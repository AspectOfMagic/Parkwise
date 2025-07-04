export interface SessionUser {
  id: string,
  role: string
}

export interface CarID {
  id: string,
}

declare global {
  namespace Express {
    export interface Request {
      user?: SessionUser
      vid?: CarID
    }
  }
}
