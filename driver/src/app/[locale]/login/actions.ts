'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Credentials, User, NewAccountCredentials } from '../../../auth/index'
import { authenticate, register, googleLogin } from '../../../auth/service'

export async function login(credentials: Credentials) : Promise<User|undefined> {
  const user = await authenticate(credentials)
  if (user) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = user.accessToken
    const cookieStore = await cookies()
   
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    return { name: user.name, email: user.email }
  }
  return undefined
}

export async function signup(credentials: NewAccountCredentials): Promise<User|undefined> {
  const newAccountCredentials = await register(credentials)
  if (newAccountCredentials) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = newAccountCredentials.accessToken
    const cookieStore = await cookies()
   
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    return { name: newAccountCredentials.name, email: newAccountCredentials.email }
  }
  return undefined
}

export async function googleLoginAction(idToken: string): Promise<User|undefined> {
  const user = await googleLogin(idToken)
  if (user) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const session = user.accessToken
    const cookieStore = await cookies()
   
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    return { name: user.name, email: user.email }
  }
  return undefined
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}