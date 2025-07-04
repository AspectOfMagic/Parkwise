export interface SessionUser {
  id: string;
}

export interface Credentials {
  email: string,
  password: string
}

export interface Authenticated {
  name: string,
  accessToken: string
}

export interface User {
  name: string
}
