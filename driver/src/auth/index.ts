export interface SessionUser {
  id: string;
}

export interface Credentials {
  email: string,
  password: string
}

export interface Authenticated {
  name: string,
  email: string,
  accessToken: string
}

export interface User {
  name: string,
  email: string
}

export interface NewAccountCredentials {
  name: string,
  email: string,
  password: string
}
