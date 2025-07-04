"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStudentTickets = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const checkStudentTickets = async (email) => {
    try {
        const response = await (0, node_fetch_1.default)('http://localhost:4002/graphql', {
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
        const result = await response.json();
        const tickets = result.data?.ticketsByEmail || [];
        return {
            hasOutstandingTickets: tickets.some(ticket => !ticket.paid),
            outstandingCount: tickets.filter(ticket => !ticket.paid).length,
            totalOwed: tickets
                .filter(ticket => !ticket.paid)
                .reduce((sum, ticket) => sum + ticket.amount, 0),
            tickets
        };
    }
    catch (error) {
        console.error('Error checking student tickets:', error);
        throw new Error('Failed to check student tickets');
    }
};
exports.checkStudentTickets = checkStudentTickets;
//# sourceMappingURL=ticketService.js.map