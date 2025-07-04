import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { checkVehiclePermit } from '../services/permitService';

const router = Router();

/**
 * @route   GET /api/police/permit
 * @desc    Check if a vehicle has a valid permit
 * @access  External (requires police API key)
 */
router.get(
  '/permit',
  apiKeyAuth('police'),
  async (req: Request, res: Response) => {
    try {
      const { licensePlate, state } = req.query;

      if (!licensePlate || !state) {
        res.status(400).json({
          error: 'License plate and state are required'
        });
        return;
      }

      const permitInfo = await checkVehiclePermit(
        licensePlate.toString(),
        state.toString()
      );

      res.json(permitInfo);
    } catch (error) {
      console.error('Error in police permit endpoint:', error);
      res.status(500).json({
        error: 'Failed to check vehicle permit',
      });
    }
  }
);

export default router;