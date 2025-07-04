'use server';

import { cookies } from 'next/headers';

export async function getPermits() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  
  if (!token) {
    console.error('Missing required cookies: session');
    return null;
  }

  const res = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
                    query {
            GetPermitTypes {
              id
              classname
              type
              price
            }
          }
        `
    }),
  })

  const response = await res.json()
  if (response.errors === undefined) {
    return response.data.GetPermitTypes
  }
  return undefined
}