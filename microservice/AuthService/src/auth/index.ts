
export interface Credentials {
  email: string,
  password: string
}

export interface Authenticated {
  name: string,
  accessToken: string
}

export interface AuthenticatedDriver {
  name: string,
  email: string,
  accessToken: string
}

export interface newAccountCredentials {
  name: string,
  email: string,
  password: string
}

export interface createdProfile {
  name: string,
  email: string
}

export interface Enforcer {
  id: string,
  name: string,
  email: string
}

export interface Driver {
  name: string,
  email: string
}

export interface EnforcerID {
  id: string;
}
