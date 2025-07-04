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
