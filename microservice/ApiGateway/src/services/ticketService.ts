import fetch from 'node-fetch';

interface Ticket {
  id: string | number;
  issueDate: string;
  amount: number;
  paid: boolean;
  dueDate: string;
}

interface TicketResponse {
  data?: {
    ticketsByEmail?: Ticket[];
  }
}

export const checkStudentTickets = async (email: string) => {
  try {
    const response = await fetch('http://localhost:4002/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query CheckStudentTickets($email: String!) {
            ticketsByEmail(email: $email) {
              id
              issueDate
              amount
              paid
              dueDate
            }
          }
        `,
        variables: { email }
      })
    });

    const result = await response.json() as TicketResponse;
    const tickets = result.data?.ticketsByEmail || [];

    return {
      hasOutstandingTickets: tickets.some(ticket => !ticket.paid),
      outstandingCount: tickets.filter(ticket => !ticket.paid).length,
      totalOwed: tickets
        .filter(ticket => !ticket.paid)
        .reduce((sum, ticket) => sum + ticket.amount, 0),
      tickets
    };
  } catch (error) {
    console.error('Error checking student tickets:', error);
    throw new Error('Failed to check student tickets');
  }
};