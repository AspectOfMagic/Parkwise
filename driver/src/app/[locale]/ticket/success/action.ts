'use server';

import { cookies } from 'next/headers';
import { ticketService } from '../../../../verify/service'


export async function PayTicket() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const ticket = cookieStore.get('tickets')?.value

    if (!token) {
      throw new Error('Missing session token!');
    }
    if (!ticket) {
      throw new Error('Missing ticket cookie!');
    }
    try {
      const id = JSON.parse(ticket);
      console.log(id[0])
      const tickets = await ticketService.payTicket(id[0], token);
      console.log(ticket)
      return tickets;
    } catch(err) {
      console.log(err)
    }
  } catch(err) {
    console.log(err)
  }
}