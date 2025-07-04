'use server'

import { cookies } from 'next/headers';

import {Vehicle} from '../../../../verify/index'
import {vehicleService} from '../../../../verify/service'

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value;
}

export async function getVehicles(): Promise<Vehicle[]|undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }
    try {
      const vehicles = await vehicleService.getVehicles(token);
      return vehicles;
    } catch(error) {
      console.log(error)
    }
  } catch(err) {
    console.log(err)
  }
}