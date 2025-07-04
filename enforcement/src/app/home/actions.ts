'use server'

import { cookies } from 'next/headers';

import { VehiclePermitStatus, TicketResult, UUID } from '../../verify/index';
import { vehicleService, permitService, ticketService } from '../../verify/service';
import { verifyAuth } from '../../auth/service';

// Get session token from cookies
async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value;
}

// Check if a vehicle has a valid permit
export async function checkVehiclePermit(licensePlate: string, state: string): Promise<VehiclePermitStatus> {
  try {
    const token = await getSessionToken();
    await verifyAuth(token);

    try {
      // Get vehicle information
      const vehicle = await vehicleService.getByLicensePlate(licensePlate, state, token);

      try {
        const permitCheck = await permitService.checkValidity(licensePlate, state, token);
        vehicle.id = permitCheck.vehicleId;

        return {
          vehicle,
          hasValidPermit: permitCheck.valid,
          message: permitCheck.valid
            ? 'Vehicle has a valid permit'
            : 'No valid permit found for this vehicle'
        };
      } catch (error) {
        // Failed to check permit validity
        console.log(error);
        return {
          vehicle,
          hasValidPermit: false,
          message: 'Unable to verify permit status'
        };
      }
    } catch (error) {
      // Vehicle not found
      console.log(error);
      return {
        vehicle: null,
        hasValidPermit: false,
        message: 'Vehicle not found in the system'
      };
    }
  } catch (error) {
    // Authentication or other error
    console.log(error);
    throw new Error('Unauthorized or service unavailable');
  }
}

// Issue a ticket for a vehicle
export async function issueTicket(ticketData: {
  licensePlate: string;
  location: string;
  violation: string;
  amount: number;
  vehicleId: UUID;
}): Promise<TicketResult> {
  try {
    const token = await getSessionToken();

    // Verify user is authenticated and get enforcer ID
    const user = await verifyAuth(token);

    if (!user || !user.id) {
      return {
        success: false,
        message: 'Unauthorized - not logged in'
      };
    }

    const enforcerId = user.id;

    // Map to the format expected by the microservice
    const newTicket = {
      vehicle: ticketData.vehicleId,
      cost: ticketData.amount,
      // Store additional data as metadata if needed by the UI
      metadata: {
        licensePlate: ticketData.licensePlate,
        location: ticketData.location,
        violation: ticketData.violation,
        enforcerId: enforcerId,
        timestamp: new Date().toISOString()
      }
    };

    // Create the ticket
    const ticket = await ticketService.create(newTicket, token);

    // Map the response back to the format expected by the UI
    const adaptedTicket = {
      id: ticket.id,
      vehicleId: ticket.vehicle,
      licensePlate: ticketData.licensePlate,
      timestamp: ticket.issued,
      location: ticketData.location,
      violation: ticketData.violation,
      amount: ticket.cost,
      isPaid: ticket.status === 'paid',
      enforcerId
    };

    return {
      success: true,
      ticket: adaptedTicket,
      message: 'Ticket issued successfully'
    };
  } catch (error) {
    console.error('Error issuing ticket:', error);
    return {
      success: false,
      message: 'Failed to issue ticket'
    };
  }
}
