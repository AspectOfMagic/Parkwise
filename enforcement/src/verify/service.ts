import { Vehicle, BackendTicket, NewTicket } from '.';

const VEHICLE_URL = 'http://localhost:4000';
const TICKET_URL = 'http://localhost:4001';
const PERMIT_URL = 'http://localhost:4002';

// Helper function for GraphQL requests with authentication
async function fetchGraphQL(baseUrl: string, query: string, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Sending request with headers:', headers);
  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query
    })
  });

  const result = await response.json();

  console.log('Response:', result);

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export const vehicleService = {
  getByLicensePlate: async (licensePlate: string, state: string, token?: string): Promise<Vehicle> => {
    const query = `
      query {
        GetByPlate(plate: "${licensePlate}", state: ${state}) {
          make
          model
          plate
          state
        }
      }
    `;

    const data = await fetchGraphQL(VEHICLE_URL, query, token);
    return data.GetByPlate;
  },
};

export const permitService = {
  checkValidity: async (licensePlate: string, state: string, token?: string): Promise<{ valid: boolean, vehicleId: string }> => {
    const query = `
      query {
        CheckByVehicle {
          valid
          vehicleId
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    headers['plate'] = licensePlate;
    headers['state'] = state;

    console.log('Checking permit validity for plate:', licensePlate);
    console.log('Sending headers:', headers);

    const response = await fetch(`${PERMIT_URL}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: query,
      }),
    });

    const result = await response.json();
    console.log('Permit check result:', result);

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return {
      valid: result.data.CheckByVehicle.valid,
      vehicleId: result.data.CheckByVehicle.vehicleId
    };
  },
};

export const ticketService = {
  create: async (ticket: NewTicket, token?: string): Promise<BackendTicket> => {
    const mutation = `
      mutation {
        makeTicket(newTicket: {
          vehicle: "${ticket.vehicle}", 
          cost: ${ticket.cost}
        }) {
          id
          vehicle
          cost
          issued
          deadline
          status
        }
      }
    `;

    const data = await fetchGraphQL(TICKET_URL, mutation, token);
    return data.makeTicket;
  },
};
