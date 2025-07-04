import {
  Body,
  Controller,
  Path,
  Post,
  Get,
  Request,
  Response,
  Security,
  Route,
} from 'tsoa'

import * as express from 'express'

import {createdProfile, Credentials, Authenticated, AuthenticatedDriver, newAccountCredentials, Enforcer, Driver, EnforcerID} from '.'
import {SessionUser} from '../types/express'
import {AuthService} from './service'

@Route()
export class AuthController extends Controller {
  @Post('login')
  @Response('401', 'Unauthorized')
  public async login(
    @Body() credentials: Credentials,
  ): Promise<Authenticated|undefined> {
    return new AuthService().loginDriver(credentials)
      .then(async (user: AuthenticatedDriver|undefined): Promise<AuthenticatedDriver|undefined> => {
        if (!user) {
          this.setStatus(401)
        }
        return user
      })
  }

  @Post('loginEnforcer')
  @Response('401', 'Unauthorized')
  public async loginEnforcer(
    @Body() credentials: Credentials,
  ): Promise<Authenticated|undefined> {
    return new AuthService().loginEnforcer(credentials)
      .then(async (user: Authenticated|undefined): Promise<Authenticated|undefined> => {
        if (!user) {
          this.setStatus(401)
        }
        return user
      })
  }

  @Post('loginAdmin')
  @Response('401', 'Unauthorized')
  public async loginAdmin(
    @Body() credentials: Credentials,
  ): Promise<Authenticated|undefined> {
    return new AuthService().loginAdmin(credentials)
      .then(async (user: Authenticated|undefined): Promise<Authenticated|undefined> => {
        if (!user) {
          this.setStatus(401)
        }
        return user
      })
  }
  
  @Get('checkDriver')
  @Security("jwt", ["driver"])
  @Response('401', 'Unauthorized')
  public async checkDriver(
    @Request() request: express.Request
  ): Promise<SessionUser|undefined> {
    // Nothing to check, Express middleware will have rejected the request
    // by now if the caller is unauthorized
    return new Promise((resolve) => {
      resolve(request.user)
    })
  }

  @Get('checkEnforcer')
  @Security("jwt", ["enforcer"])
  @Response('401', 'Unauthorized')
  public async checkEnforcer(
    @Request() request: express.Request
  ): Promise<SessionUser|undefined> {
    return new Promise((resolve) => {
      resolve(request.user)
    })
  }

  @Get('checkAdmin')
  @Security("jwt", ["admin"])
  @Response('401', 'Unauthorized')
  public async checkAdmin(
    @Request() request: express.Request
  ): Promise<SessionUser|undefined> {
    return new Promise((resolve) => {
      resolve(request.user)
    })
  }

  @Post('signup')
  @Response('400', 'Bad Request')
  public async signup(
    @Body() credentials: newAccountCredentials
  ): Promise<AuthenticatedDriver|undefined> {
    const account = await new AuthService().createAccount(credentials)
    if (account) {
      this.setStatus(201)
      return account
    }
    this.setStatus(400)
    return undefined;
  }

  @Post('createEnforcer')
  @Response('400', 'Bad Request')
  public async createEnforcer(
    @Body() enforcerCreds: newAccountCredentials
  ): Promise<createdProfile|undefined> {
    const account = await new AuthService().createEnforcer(enforcerCreds)
    if (account) {
      this.setStatus(201)
      return account
    }
    this.setStatus(400)
    return undefined;
  }

  @Get('getEnforcers')
  @Security("jwt", ["admin"])
  @Response('401', 'Unauthorized')
  public async getEnforcers(): Promise<Enforcer[]> {
    const enforcers = await new AuthService().getEnforcers()
    return enforcers
  }

  @Post('deleteEnforcer')
  @Security("jwt", ["admin"])
  @Response('401', 'Unauthorized')
  public async deleteEnforcer(
    @Body() enforcerID: EnforcerID
  ): Promise <Enforcer|undefined> {
    console.log('EnforcerID: ', enforcerID.id)
    const deleted = await new AuthService().deleteEnforcer(enforcerID)
    return deleted
  }

  @Get('getDriver/{driverId}')
  @Response('401', 'Unauthorized')
  public async getDriver(
    @Path() driverId: string
  ): Promise<Driver|undefined> {
    const driver = await new AuthService().getDriverInfo(driverId)
    return driver
  }

  @Post('googleLogin')
  @Response('401', 'Unauthorized')
  public async googleLogin(
    @Body() body: { credential: string }
  ): Promise<AuthenticatedDriver | undefined> {
    try {
      const result = await new AuthService().googleLogin(body.credential);
      if (!result) {
        this.setStatus(401);
        return undefined;
      }
      return result;
    } catch {
      this.setStatus(400);
      return undefined;
    }
  }
}
