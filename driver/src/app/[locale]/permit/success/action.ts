'use server';

import { cookies } from 'next/headers';

export async function CreatePermit() {
  console.log('creating permit');
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const plate = cookieStore.get('plate')?.value;
  const state = cookieStore.get('state')?.value;
  const permit = cookieStore.get('permit')?.value;

  if (!token || !plate || !state || !permit) {
    console.error('Missing required cookies: session, plate, or permit');
    return null;
  }

  const res = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'plate': `${plate}`,
      'state': `${state}`,
    },
    body: JSON.stringify({
      query: `
                    mutation CreatePermit($type: ID!, $start: DateTimeISO!) {
            CreatePermit (type: $type, start: $start){
              id
              holder
              vehicle
              info {
                id
                type
                price
                classname
              }
              active
              expiration
            }
          }
        `,
      variables: {
        type: permit,
        start: new Date().toISOString(), // Use ISO string format
      },
    }),
  })
  const response = await res.json()
  console.log(response)
  if (response.errors === undefined) {
    return true
  }
  return false
}
