interface Ticket {
    id: string | number;
    issueDate: string;
    amount: number;
    paid: boolean;
    dueDate: string;
}
export declare const checkStudentTickets: (email: string) => Promise<{
    hasOutstandingTickets: boolean;
    outstandingCount: number;
    totalOwed: number;
    tickets: Ticket[];
}>;
export {};
