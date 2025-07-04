import 'server-only';

import { SessionUser, Credentials, Authenticated } from '.';

export async function verifyAuth(token: string | undefined): Promise<SessionUser> {
  if (!token) {
    throw new Error('Unauthorized - No token provided');
  }

  try {
    const response = await fetch('http://localhost:3010/api/v0/checkEnforcer', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.status !== 200) {
      throw new Error('Unauthorized');
    }

    return await response.json();
  } catch (error) {
    console.log(error);
    throw new Error('Unauthorized');
  }
}

export async function authenticate(credentials: Credentials): Promise<Authenticated | undefined> {
  console.log('Authenticating with credentials:', credentials);

  const response = await fetch('http://localhost:3010/api/v0/loginEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Authentication failed (${response.status}):`, errorText);
    throw new Error(`Authentication failed with status ${response.status}: ${errorText}`);
  }

  return await response.json();
}