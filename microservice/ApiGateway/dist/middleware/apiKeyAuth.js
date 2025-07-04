"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const config_1 = __importDefault(require("../config"));
// Use the config's API keys
const API_KEYS = config_1.default.apiKeys;
const apiKeyAuth = (requiredRole) => {
    return (req, res, next) => {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            res.status(401).json({ error: 'API key is required' });
            return;
        }
        const keyDetails = API_KEYS[apiKey];
        if (!keyDetails) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }
        // Check if the role is an array or a string and verify permissions
        if (keyDetails.role !== requiredRole) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        req.apiClient = keyDetails;
        next();
    };
};
exports.apiKeyAuth = apiKeyAuth;
//# sourceMappingURL=apiKeyAuth.js.map