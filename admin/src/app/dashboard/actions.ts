'use server'

import { cookies } from 'next/headers';
import { verifyAuth, createEnforcer, deleteEnforcer, getEnforcers } from '../../auth/service';
import { Ticket, UUID, NewAccount, CreatedAccount, Enforcer } from '@/verify';
import { ticketService } from '@/verify/service';

// Get session token from cookies
async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value;
}

export async function fetchChallenges(): Promise<Ticket[]> {
		const token = await getSessionToken();
    await verifyAuth(token);
		try {
			const challenges = await ticketService.getChallenges(token)
			return challenges
		} catch (err) {
			console.error(err)
			return []
		}
}

export async function acceptChallenge(ticketId: UUID): Promise<Ticket|undefined> {
	const token = await getSessionToken();
    await verifyAuth(token);
		try {
			const challenges = await ticketService.acceptChallenge(ticketId, token)
			return challenges
		} catch (err) {
			console.error(err)
			return undefined
		}
}

export async function rejectChallenge(ticketId: UUID): Promise<Ticket|undefined> {
	const token = await getSessionToken();
  await verifyAuth(token);
	try {
		const challenges = await ticketService.rejectChallenge(ticketId, token)
		return challenges
	} catch (err) {
		console.error(err)
		return undefined
	}
}

export async function makeEnforcer(credentials: NewAccount): Promise<CreatedAccount|undefined> {
	const token = await getSessionToken();
  await verifyAuth(token);
	try {
		const creation = await createEnforcer(credentials)
		return creation
	} catch (err) {
		console.error(err)
		return undefined
	}
}

export async function fetchEnforcers(): Promise<Enforcer[]> {
	const token = await getSessionToken();
  await verifyAuth(token);
	try {
		const enforcers = await getEnforcers(token)
		return enforcers
	} catch (err) {
		console.error(err)
		return []
	}
}

export async function removeEnforcer(enforcerId: string): Promise<Enforcer | undefined> {
	const token = await getSessionToken();
	await verifyAuth(token);
	try {
		const enforcer = await deleteEnforcer(token, enforcerId)
		return enforcer
	} catch (err) {
		console.error(err)
		return undefined
	}
}
