import {
  Resolver,
  Authorized,
  Mutation,
  Args,
  UseMiddleware,
  Query,
  Ctx
} from 'type-graphql'
import { ValidateVehicle, EnforcerValidateVehicle } from '../middleware/validate'
import { PermitService } from './service'
import { CreatePermit, Permit, VehiclePermitCheck, VID } from './schema'
import { Request } from 'express'

@Resolver()
export class PermitResolver {

  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Permit)
  @UseMiddleware(ValidateVehicle)
  async CreatePermit(
    @Args() permit: CreatePermit,
    @Ctx() { user, vid }: Request
  ): Promise<Permit> {
    return new PermitService().CreatePermit(user?.id, vid?.id, permit.type, permit.start)
  }

  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [VID])
  async PermittedVehicles(
    @Ctx() { user }: Request
  ): Promise<VID[]> {
    return new PermitService().PermittedVehicles(user?.id)
  }

  @Authorized("enforcer")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => VehiclePermitCheck)
  @UseMiddleware(EnforcerValidateVehicle)
  async CheckByVehicle(
    @Ctx() { vid }: Request
  ): Promise<VehiclePermitCheck> {
    return new PermitService().enforcerCheck(vid?.id)
  }
}
