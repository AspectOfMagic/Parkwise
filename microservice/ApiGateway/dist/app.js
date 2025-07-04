"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const police_1 = __importDefault(require("./routes/police"));
const registrar_1 = __importDefault(require("./routes/registrar"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    // Less restrictive helmet settings for external API
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
    exposedHeaders: ['X-Total-Count']
}));
app.use(express_1.default.json());
// Rate limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all routes
app.use(apiLimiter);
// Routes
app.use('/api/police', police_1.default);
app.use('/api/registrar', registrar_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map