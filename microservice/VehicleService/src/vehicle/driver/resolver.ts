import {
	Resolver,
	Authorized,
	Mutation,
	Query,
	Args,
	Ctx,
} from 'type-graphql'

import {Vehicle, RegisterArgs} from './schema'
import { SearchArgs } from '../enforcer/schema';
import {DriverService} from './service'
import { Request } from "express";

@Resolver()
export class DriverResolver {
  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [Vehicle])
  async GetMyVehicles(
		@Ctx() {user}: Request
  ): Promise<Vehicle[]> {
    return new DriverService().GetMyVehicles(
      user?.id)
  }
	
  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Vehicle)
  async RegisterVehicle(
    @Args() VehicleInfo: RegisterArgs,
		@Ctx() {user}: Request
  ): Promise<Vehicle> {
    return new DriverService().RegisterVehicle(
      user?.id, 
      VehicleInfo.plate, 
      VehicleInfo.make, 
      VehicleInfo.model, 
      VehicleInfo.year, 
      VehicleInfo.color, 
      VehicleInfo.state)
  }

  @Authorized("driver")
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	@Mutation (returns => Vehicle)
	async DeleteMyVehicle(
		 
    @Args() Info: SearchArgs,
    @Ctx() {user}: Request
	): Promise <Vehicle> {
		return new DriverService().DeleteMyVehicle(user?.id, Info.plate, Info.state)
	}

  @Authorized("driver")
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	@Query (returns => Vehicle)
	async ConfirmMyVehicle(
		 
    @Args() Info: SearchArgs,
    @Ctx() {user}: Request
	): Promise <Vehicle> {
		return new DriverService().ConfirmMyVehicle(user?.id, Info.plate, Info.state)
	}

}
