import { Request } from "express";
import { MiddlewareFn } from "type-graphql";

export const ValidateVehicle: MiddlewareFn<Request> = async ({ context }, next) => {
  const plate = context.headers.plate;
  const state = context.headers.state;
  if (!plate || !state) {
    throw new Error("Missing License");
  }
  try {
    const data = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${context.headers.authorization}`,
      },
      body: JSON.stringify({
        query: `
          query ConfirmMyVehicle($plate: String!, $state: USState!) {
            ConfirmMyVehicle(plate: $plate, state: $state) {
              id
            }
          }
        `,
        variables: {
          plate: plate,
          state: state,
        },
      }),
    }).then(response => {
      if (response.status != 200) {
        return false
      }
      else {
        return response.json()
      }
    })
    if (data) {
      console.log(data);
      context.vid = { id: data.data.ConfirmMyVehicle.id }
    }
    return next()
  } catch {
    throw new Error("Failure to Fetch");
  }
};

export const EnforcerValidateVehicle: MiddlewareFn<Request> = async ({ context }, next) => {
  const plate = context.headers.plate;
  const state = context.headers.state;
  if (!plate || !state) {
    throw new Error("Missing License");
  }
  try {
    const data = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${context.headers.authorization}`,
      },
      body: JSON.stringify({
        query: `
          query GetByPlate($plate: String!, $state: USState!) {
            GetByPlate(plate: $plate, state: $state) {
              id
            }
          }
        `,
        variables: {
          plate: plate,
          state: state,
        },
      }),
    }).then(response => {
      if (response.status != 200) {
        return false
      }
      else {
        return response.json()
      }
    })
    if (data) {
      context.vid = { id: data.data.GetByPlate.id }
    }
    return next()
  } catch {
    throw new Error("Failure to Fetch");
  }
};
