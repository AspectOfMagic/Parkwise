"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const ticketService_1 = require("../services/ticketService");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/registrar/student-tickets
 * @desc    Check if a student has outstanding tickets
 * @access  External (requires registrar API key)
 */
router.get('/student-tickets', (0, apiKeyAuth_1.apiKeyAuth)('registrar'), async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            res.status(400).json({
                error: 'Student email is required'
            });
            return;
        }
        const ticketInfo = await (0, ticketService_1.checkStudentTickets)(email.toString());
        res.json(ticketInfo);
    }
    catch (error) {
        console.error('Error in registrar tickets endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=registrar.js.map