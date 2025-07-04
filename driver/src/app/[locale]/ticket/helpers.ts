
import { Ticket } from '../../../verify';

export const selectAllTicketsHelper = (
tickets: Record<string, Ticket[]>,
selectedVehicleId: string | null,
selectedTicketIds: string[]
): string[] => {
if (!selectedVehicleId) return selectedTicketIds;
const vehicleTickets = tickets[selectedVehicleId] || [];
return selectedTicketIds.length === vehicleTickets.length
    ? []
    : vehicleTickets.map(t => t.id);
};