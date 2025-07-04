import {
	Resolver,
	Authorized,
	Query,
  Arg,
	Args,
} from 'type-graphql'

import {Vehicle} from '../driver/schema'
import {EnforcerService} from './service'
import { Owner, SearchArgs } from './schema';

@Resolver()
export class EnforcerResolver {
  @Authorized("enforcer")
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => Vehicle)
  async GetByPlate(
		@Args() VehicleInfo: SearchArgs,
  ): Promise<Vehicle> {
    return new EnforcerService().GetByPlate(VehicleInfo.plate, VehicleInfo.state)
  }

  @Authorized("enforcer")
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => Owner)
  async GetOwner(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
		@Arg("vehicleID", type => String) id: string,
  ): Promise<Owner> {
    return new EnforcerService().getOwner(id)
  }
}
