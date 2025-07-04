import 'server-only';

import { SessionUser, Credentials, Authenticated } from '.';
import { CreatedAccount, NewAccount, Enforcer } from '@/verify';

export async function verifyAuth(token: string | undefined): Promise<SessionUser> {
  if (!token) {
    throw new Error('Unauthorized - No token provided');
  }

  try {
    const response = await fetch('http://localhost:3010/api/v0/checkAdmin', {
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
  const response = await fetch('http://localhost:3010/api/v0/loginAdmin', {
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

    // Authentication failures (unauthorized)
  return await response.json();
}

export async function createEnforcer(credentials: NewAccount): Promise<CreatedAccount|undefined> {
  const response = await fetch('http://localhost:3010/api/v0/createEnforcer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  // Handle different error cases with specific messages
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Authentication failed (${response.status}):`, errorText);
    throw new Error(`Authentication failed with status ${response.status}: ${errorText}`);
  }

    // Authentication failures (unauthorized)
  return await response.json();
}

export async function getEnforcers(token: string | undefined): Promise<Enforcer[]> {
  const response = await fetch('http://localhost:3010/api/v0/getEnforcers', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Authentication failed (${response.status}):`, errorText);
    throw new Error(`Authentication failed with status ${response.status}: ${errorText}`);
  }
  // Authentication failures (unauthorized)
  return await response.json();
}

export async function deleteEnforcer(token: string | undefined, enforcerId: string): Promise<Enforcer> {
  const response = await fetch('http://localhost:3010/api/v0/deleteEnforcer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: enforcerId})
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Authentication failed (${response.status}):`, errorText);
    throw new Error(`Authentication failed with status ${response.status}: ${errorText}`);
  }

    // Authentication failures (unauthorized)
  return await response.json();
}
