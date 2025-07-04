'use server'

import { cookies } from 'next/headers';

import { Ticket, Vehicle } from '../../../verify/index'
import { ticketService, vehicleService } from '../../../verify/service'
import { verifyAuth } from '../../../auth/service'

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value;
}

export async function getVehicles(): Promise<Vehicle[] | undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }
    try {
      const vehicles = await vehicleService.getVehicles(token);
      return vehicles;
    } catch (error) {
      console.log(error)
    }
  } catch (err) {
    console.log(err)
  }
}

export async function getTickets(vehicleId: string): Promise<Ticket[] | undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }
    await verifyAuth(token);
    try {
      const tickets = await ticketService.getTickets(vehicleId, token);
      return tickets;
    } catch (err) {
      console.log(err)
    }
  } catch (err) {
    console.log(err)
  }
}

export async function challengeTicket(ticketId: string, desc: string): Promise<Ticket | undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }
    await verifyAuth(token);
    try {
      const ticket = await ticketService.challengeTicket(ticketId, desc, token);
      return ticket;
    } catch (err) {
      console.log('Error occurred:', err)
    }
  } catch (err) {
    console.log('Error occurred:', err)
  }
}