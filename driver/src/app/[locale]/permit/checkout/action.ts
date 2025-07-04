'use server'

import { cookies } from 'next/headers'

export async function SetCheckout() {
  const cookieStore = await cookies();
  const pid = cookieStore.get('permit')?.value;
  const token = cookieStore.get('session')?.value;

  const res = await fetch('http://localhost:4002/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetPermitTypeByID($id: String!) {
          GetPermitTypeByID(id: $id) {
            id
            classname
            type
            price
          }
        }
        `,
        variables: {
          id: pid
        },
    }),
  })

  const response = await res.json()
  return response.data.GetPermitTypeByID.price
}

