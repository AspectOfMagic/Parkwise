"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const permitService_1 = require("../services/permitService");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/police/permit
 * @desc    Check if a vehicle has a valid permit
 * @access  External (requires police API key)
 */
router.get('/permit', (0, apiKeyAuth_1.apiKeyAuth)('police'), async (req, res) => {
    try {
        const { licensePlate, state } = req.query;
        if (!licensePlate || !state) {
            res.status(400).json({
                error: 'License plate and state are required'
            });
            return;
        }
        const permitInfo = await (0, permitService_1.checkVehiclePermit)(licensePlate.toString(), state.toString());
        res.json(permitInfo);
    }
    catch (error) {
        console.error('Error in police permit endpoint:', error);
        res.status(500).json({
            error: 'Failed to check vehicle permit',
        });
    }
});
exports.default = router;
//# sourceMappingURL=police.js.map