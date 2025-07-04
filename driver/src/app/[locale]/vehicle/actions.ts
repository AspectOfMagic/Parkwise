'use server'

import { cookies } from 'next/headers';

import {Vehicle} from '../../../verify/index'
import {vehicleService} from '../../../verify/service'
import {verifyAuth} from '../../../auth/service'

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
    await verifyAuth(token);


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

export async function registerVehicle(make: string, model: string, plate: string, year:string, color:string,  state:string): Promise<Vehicle|undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }

    try {
      const vehicle = await vehicleService.registerVehicle(make, model, plate, year, color, state, token);
      return vehicle;
    } catch(error) {
      console.log(error)
    }
  } catch(error) {
    console.log(error)
  }
}

export async function deleteVehicle(plate: string, state: string): Promise<Vehicle|undefined> {
  try {
    const token = await getSessionToken();
    if (!token) {
      throw new Error('Missing session token!');
    }
    await verifyAuth(token);

    try {
      const vehicle = await vehicleService.deleteVehicle(plate, state, token);
      return vehicle;
    } catch(err) {
      console.log(err)
    }
  } catch(err) {
    console.log(err)
  }
}