import { Ticket, UUID } from './index';

const API_URL = 'http://localhost:4001';

async function fetchGraphQL(baseUrl: string, query: string, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query
    })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export const ticketService = {
	// get all challenged tickets (query getChallenges
	getChallenges: async (token?: string): Promise<Ticket[]> => {
		const query = `
		  query {
				getChallenges {
					id
					vehicle
					cost
					issued
					deadline
					status
          desc
				}
			}
		`;
		const data = await fetchGraphQL(API_URL, query, token);
    return data.getChallenges;
	},

  acceptChallenge: async (ticketId: UUID, token?: string): Promise<Ticket> => {
    const mutation = `
      mutation {
        acceptChallenge(input: "${ticketId}") {
          id
          vehicle
          cost
          issued
          deadline
          status
        }
      }
    `
    const data = await fetchGraphQL(API_URL, mutation, token);
    return data.acceptChallenge;
  },

  rejectChallenge: async (ticketId: UUID, token?: string): Promise<Ticket> => {
    const mutation = `
      mutation {
        rejectChallenge(input: "${ticketId}") {
          id
          vehicle
          cost
          issued
          deadline
          status
        }
      }
    `
  const data = await fetchGraphQL(API_URL, mutation, token);
  return data.rejectChallenge;
  }
}
