import fetch from 'node-fetch';

interface PermitResponse {
  data?: {
    CheckByVehicle?: {
      valid: boolean;
      permitType: string;
      expirationDate: string;
    }
  }
}

export const checkVehiclePermit = async (licensePlate: string, state: string) => {
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

    const response = await fetch('http://localhost:4002/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'plate': licensePlate,
        'state': state,
        'Authorization': 'Bearer 1'
      },
      body: body
    });

    const result = await response.json() as PermitResponse;
    return result.data?.CheckByVehicle;
  } catch (error) {
    console.error('Error checking vehicle permit:', error);
    throw new Error('Failed to check vehicle permit');
  }
};