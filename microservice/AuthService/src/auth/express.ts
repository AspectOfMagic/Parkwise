import {Request} from "express"
import {AuthService} from './service'
import {SessionUser} from '../types/express'

export function expressAuthentication(
  request: Request,
   
  securityName: string,
   
  scopes?: string[]
): Promise<SessionUser> {
  const role = scopes ? scopes[0] : undefined;
  switch (role) {
    case 'driver':
      return new AuthService().checkDriver(request.headers.authorization);
    case 'enforcer':
      return new AuthService().checkEnforcer(request.headers.authorization);
    case 'admin':
      return new AuthService().checkAdmin(request.headers.authorization);
    default:
      return Promise.reject(new Error('Unknown role'));
  }
}

