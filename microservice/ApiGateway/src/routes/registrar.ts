import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { checkStudentTickets } from '../services/ticketService';

const router = Router();

/**
 * @route   GET /api/registrar/student-tickets
 * @desc    Check if a student has outstanding tickets
 * @access  External (requires registrar API key)
 */
router.get(
  '/student-tickets',
  apiKeyAuth('registrar'),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.query;

      if (!email) {
        res.status(400).json({
          error: 'Student email is required'
        });
        return;
      }

      const ticketInfo = await checkStudentTickets(email.toString());

      res.json(ticketInfo);
    } catch (error) {
      console.error('Error in registrar tickets endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;