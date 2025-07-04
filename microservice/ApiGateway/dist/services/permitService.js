"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVehiclePermit = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const checkVehiclePermit = async (licensePlate, state) => {
    try {
        const body = JSON.stringify({
            query: `
        query {
          CheckByVehicle {
            vehicleId
            valid
          }
        }
      `
        });
        const response = await (0, node_fetch_1.default)('http://localhost:4002/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'plate': licensePlate,
                'state': state,
                'Authorization': 'Bearer 1'
            },
            body: body
        });
        const result = await response.json();
        return result.data?.CheckByVehicle;
    }
    catch (error) {
        console.error('Error checking vehicle permit:', error);
        throw new Error('Failed to check vehicle permit');
    }
};
exports.checkVehiclePermit = checkVehiclePermit;
//# sourceMappingURL=permitService.js.map