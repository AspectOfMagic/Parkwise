import {
	Resolver,
	Authorized,
	Mutation,
	Query,
	Arg,
	Args,
} from 'type-graphql'

import {ID} from "type-graphql"
import { CreatePermitType, PermitType, UpdatePermitType } from './schema';
import { PermitTypeService } from './service';

@Resolver()
export class PermitTypeResolver {
  @Authorized("admin")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [PermitType])
  async GetPermitIDs(
  ): Promise<PermitType[]> {
    return new PermitTypeService().adminlist()
  }
  
  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [PermitType])
  async GetPermitTypes(
  ): Promise<PermitType[]> {
    return new PermitTypeService().list()
  }

  @Authorized("driver")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => PermitType)
  async GetPermitTypeByID(
    @Arg("id", () => String) id: string
  ): Promise<PermitType> {
    return new PermitTypeService().byID(id)
  }

  @Authorized("admin")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => PermitType)
  async CreatePermitType(
    @Args() permitargs: CreatePermitType,
  ): Promise<PermitType> {
    return new PermitTypeService().new(permitargs.classname, permitargs.type, permitargs.price)
  }

  @Authorized("admin")
  @Mutation(() => PermitType)
  async DeleteType(
    @Arg("id", () => ID) id: string
  ): Promise<PermitType> {
    return new PermitTypeService().delete(id)
  }


  @Authorized("admin")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => PermitType)
  async UpdatePrice(
    @Args() permitargs: UpdatePermitType,
  ): Promise<PermitType> {
    return new PermitTypeService().updatePrice(permitargs.id, permitargs.price)
  }
}
