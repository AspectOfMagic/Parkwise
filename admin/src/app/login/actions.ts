'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Credentials, User } from '../../auth/index'
import { authenticate } from '../../auth/service'

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
    return { name: user.name }
  }
  return undefined
}

export async function logout() {
  const cookieStore = await cookies()
  
  // Delete the session cookie
  cookieStore.delete('session')
  
  // Redirect to login page
  redirect('/login')
}
