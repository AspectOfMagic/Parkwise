'use server'

import { cookies } from 'next/headers';
import { ticketService } from '../../../../verify/service'
import { Ticket } from '@/verify';

export async function SetCheckout() {
  const cookieStore = await cookies();
  const ticketJson = cookieStore.get('tickets')?.value
  const token = cookieStore.get('session')?.value;


  let tickets
  if (ticketJson) {
    tickets = JSON.parse(ticketJson)
    const ticketArr = await ticketService.getTicketById(tickets[0], token)
    const ticket = ticketArr as unknown as Ticket;
    return ticket.cost * 100
  }
}

