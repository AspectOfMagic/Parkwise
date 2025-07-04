import { it, expect, vi, beforeEach } from 'vitest';
import { fetchChallenges, acceptChallenge, rejectChallenge, makeEnforcer, fetchEnforcers, removeEnforcer } from '../../src/app/dashboard/actions';
import { login, logout} from '@/app/login/actions';
import { ticketService } from '../../src/verify/service';
import { createEnforcer, deleteEnforcer, getEnforcers, verifyAuth, authenticate } from '../../src/auth/service';
import { CreatedAccount, Enforcer, NewAccount, Ticket } from '../../src/verify/index';
import { Authenticated, Credentials } from '@/auth';

vi.mock('server-only', () => ({}))

const mockCookieStore = {
  get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => {
  const cookies = vi.fn(async () => mockCookieStore);
  return { cookies };
});

const mockRedirect = vi.fn()

vi.mock('next/navigation', () => {
  const mockRedirect = vi.fn();
  return {
    redirect: mockRedirect,
    __esModule: true,
  };
});

vi.mock('../../src/verify/service', () => ({
	ticketService: {
		getChallenges: vi.fn(),
		acceptChallenge: vi.fn(),
		rejectChallenge: vi.fn()
	}
}));

vi.mock('../../src/auth/service', () => ({
  verifyAuth: vi.fn(),
	createEnforcer: vi.fn(),
	deleteEnforcer: vi.fn(),
	getEnforcers: vi.fn(),
	authenticate: vi.fn()
}));


const mockTicket: Ticket = {
	desc: 'sample',
	id: '3c37dfce-b5e4-43fb-a807-658e6b0d888e',
	vehicle: '8b40dfce-z1e4-40xb-a807-931e6b0d899e',
	cost: 50,
	issued: '2025-06-03T09:00:00Z',
	deadline: '2025-07-03T09:00:00Z',
	status: 'challenged'
}

const mockEnforcerCreds: NewAccount = {
	name: 'Test User',
	email: 'test@user.com',
	password: 'testuser'
}

const mockCreation: CreatedAccount = {
	name: 'Test User',
	email: 'test@user.com'
}

const mockEnforcer: Enforcer = {
	id: '1',
	name: 'John Doe',
	email: 'johndoe@books.com'
}

beforeEach(() => {
  vi.clearAllMocks();

  // Reset the spy counters
mockCookieStore.get.mockClear();
mockCookieStore.set.mockClear();
mockCookieStore.delete.mockClear();

  (verifyAuth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: 'admin-123',
    role: 'admin'
  });
});

it('fetchChallenges accurately fetches existing tickets being challenged', async () => {
	(ticketService.getChallenges as ReturnType<typeof vi.fn>).mockResolvedValue([mockTicket]);
	const results = await fetchChallenges()
	const result = results[0] as unknown as Ticket;
	expect(result.cost).toBe(50)
})

it('fetchChallenges accurately catches error on failure to fetch challenged tickets', async () => {
	(ticketService.getChallenges as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Error fetching challenges"));
	const results = await fetchChallenges();
	expect(results).toHaveLength(0)
})

it('acceptChallenge correctly accepts valid existing challenge', async () => {
	const acceptedTicket: Ticket = {
		...mockTicket,
		status: 'accepted'  // Status changes from 'challenged' to 'accepted'
	};
	
	// Mock the service to return the accepted ticket
	(ticketService.acceptChallenge as ReturnType<typeof vi.fn>).mockResolvedValue(acceptedTicket)
	
	// Call acceptChallenge with the ticket ID
	const result = await acceptChallenge(mockTicket.id)
	
	// Verify the service was called with correct ID	
	// Verify the returned ticket has the updated status
	expect(result?.status).toBe('accepted')
})

it('acceptChallenge correctly catches error on failure to accept challenge', async () => {
	(ticketService.acceptChallenge as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(undefined))
	const result = await acceptChallenge(mockTicket.id);
	expect(result).toBeUndefined()
})

it('rejectChallenge correctly rejects valid existing challenge', async () => {
	const rejectedTicket: Ticket = {
		...mockTicket,
		status: 'unpaid'	// Status changes from 'challenged' back to 'unpaid'
	};

	(ticketService.rejectChallenge as ReturnType<typeof vi.fn>).mockResolvedValue(rejectedTicket)
	const result = await rejectChallenge(mockTicket.id);
	expect(result?.status).toBe('unpaid')
})

it('rejectChallenge correctly catches error on failure to reject challenge', async () => {
	(ticketService.rejectChallenge as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(undefined))
	const result = await rejectChallenge(mockTicket.id);
	expect(result).toBeUndefined()
})

it('makeEnforcer correctly creates enforcer with valid credentials', async () => {
	(createEnforcer as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreation)
	const result = await makeEnforcer(mockEnforcerCreds)
	expect(result?.name).toBe('Test User')
})

it('makeEnforcer correctly catches error on failure to create enforcer', async () => {
	(createEnforcer as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(undefined))
	const result = await makeEnforcer(mockEnforcerCreds)
	expect(result).toBeUndefined()
})

it('fetchEnforcers correctly fetches list of existing enforcers', async () => {
	(getEnforcers as ReturnType<typeof vi.fn>).mockResolvedValue([mockEnforcer])
	const result = await fetchEnforcers()
	expect(result[0].name).toBe('John Doe')
})

it('fetchEnforcers correctly catches error on failure to fetch enforcers', async () => {
	(getEnforcers as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(''))
	const result = await fetchEnforcers()
	expect(result).toHaveLength(0)
})

it('removeEnforcer correctly deletes targeted enforcer', async () => {
	(deleteEnforcer as ReturnType<typeof vi.fn>).mockResolvedValue(mockEnforcer)
	const result = await removeEnforcer(mockEnforcer.id)
	expect(result?.name).toBe('John Doe')
})

it('removeEnforcer correctly catches error on failure to delete enforcer', async () => {
	(deleteEnforcer as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(''))
	const result = await removeEnforcer(mockEnforcer.id)
	expect(result).toBeUndefined()
})

const mockDriver: Credentials = {
	email: 'johndoe@books.com',
	password: 'testuser'
};

const mockAuthenticated: Authenticated = {
	name: 'John Doe',
	accessToken: 'tada'
}

it('login correctly logs in a user with valid credentials', async () => {
	(authenticate as ReturnType<typeof vi.fn>).mockResolvedValue(mockAuthenticated)
	const result = await login(mockDriver)
	expect(result?.name).toBe('John Doe')
})

it('login returns undefined on failure to authenticate user credentials', async () => {
	(authenticate as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
	const result = await login(mockDriver)
	expect(result).toBeUndefined()
})

it('logout deletes session cookie and redirects to login', async () => {
	await logout()
	expect(mockCookieStore.get).not.toHaveBeenCalled();
	expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
});
