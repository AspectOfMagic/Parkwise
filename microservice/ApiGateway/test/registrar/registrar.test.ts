import { it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';


import registrarRoutes from '../../src/routes/registrar';
import * as ticketService from '../../src/services/ticketService';

vi.mock('../../src/services/ticketService', () => ({
  checkStudentTickets: vi.fn()
}));

vi.mock('../../src/middleware/apiKeyAuth', () => ({
  apiKeyAuth: () => (req: Request, res: Response, next: NextFunction) => next()
}));

const app = express();
app.use('/api/registrar', registrarRoutes);

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return ticket information when provided with a valid email', async () => {
  const mockTicketInfo = {
    hasOutstandingTickets: true,
    outstandingCount: 2,
    totalOwed: 125,
    tickets: [
      { id: '1', issueDate: '2025-06-01', amount: 75, paid: false, dueDate: '2025-06-15' },
      { id: '2', issueDate: '2025-06-03', amount: 50, paid: false, dueDate: '2025-06-17' }
    ]
  };

  vi.spyOn(ticketService, 'checkStudentTickets').mockResolvedValue(mockTicketInfo);

  const response = await request(app)
    .get('/api/registrar/student-tickets')
    .query({ email: 'student@university.edu' });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(mockTicketInfo);
  expect(ticketService.checkStudentTickets).toHaveBeenCalledWith('student@university.edu');
});

it('should return 400 error when email is not provided', async () => {
  const response = await request(app)
    .get('/api/registrar/student-tickets');

  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: 'Student email is required' });
  expect(ticketService.checkStudentTickets).not.toHaveBeenCalled();
});

it('should return 500 error when ticket service throws an error', async () => {
  vi.spyOn(ticketService, 'checkStudentTickets').mockRejectedValue(new Error('Service error'));

  const response = await request(app)
    .get('/api/registrar/student-tickets')
    .query({ email: 'student@university.edu' });

  expect(response.status).toBe(500);
  expect(response.body).toEqual({ error: 'Internal server error' });
  expect(ticketService.checkStudentTickets).toHaveBeenCalledWith('student@university.edu');
});
