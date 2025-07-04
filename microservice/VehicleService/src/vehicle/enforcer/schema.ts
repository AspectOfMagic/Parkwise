import { 
  Field,
  ArgsType, 
  ObjectType,
  } from "type-graphql"
import { 
  Matches,
  Length,
} from "class-validator"
import "reflect-metadata";

import { LICENSE_PLATE_REGEX, LICENSE_PLATE_MESSAGE, LICENSE_PLATE_LENGTH_MESSAGE, USState } from "../driver/schema";

@ObjectType()
export class Owner {
  constructor(id: string, name: string, email: string) {
      this.id = id
      this.name = name
      this.email = email
  }
  @Field()
  id!: string
  @Field()
  name!: string
  @Field()
  email!: string
}

@ArgsType()
export class SearchArgs {
  @Field()
  @Matches(LICENSE_PLATE_REGEX, { message: LICENSE_PLATE_MESSAGE })
  @Length(1, 10, { message: LICENSE_PLATE_LENGTH_MESSAGE })
  plate!: string;

  @Field(()=>USState)
  state!: USState
}

/*@InputType()
export class VehicleId {
  @Field()
  @IsUUID()
  id!: string
}*/
