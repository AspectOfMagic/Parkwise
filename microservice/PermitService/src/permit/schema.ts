import { Field, ObjectType, ArgsType, ID } from "type-graphql"
import "reflect-metadata";
import { IsDate } from "class-validator";
import { PermitType } from "../permitType/schema";


//TODO: implement numbered permits only exist when approved for annual or limit amount given per day
@ObjectType()
export class Permit {
  constructor(
    id: string,
    holder: string,
    vehicle: string,
    info: { id: string, type: string, price: string, classname: string },
    active: Date,
    expiration: Date,) {
    this.id = id
    this.holder = holder
    this.vehicle = vehicle
    this.info = new PermitType(info.id, info.classname, info.type, info.price)
    this.active = new Date(active)
    this.expiration = new Date(expiration)
    const now = new Date()
    this.status = now >= this.active && now <= this.expiration;
  }
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  holder!: string

  @Field(() => ID)
  vehicle!: string

  @Field()
  info!: PermitType

  @Field()
  @IsDate()
  active!: Date

  @Field()
  @IsDate()
  expiration!: Date
  
  @Field()
  status!: boolean
}

@ObjectType()
export class VehiclePermitCheck {
  constructor(vehicleId: string, valid: boolean) {
    this.vehicleId = vehicleId;
    this.valid = valid;
  }

  @Field(() => ID)
  vehicleId!: string;

  @Field(() => Boolean)
  valid!: boolean;
}

@ObjectType()
export class VID {
  constructor(
    vehicle: string
  ) {
    this.vehicle = vehicle
  }
  @Field(() => ID)
  vehicle!: string
}

@ArgsType()
export class CreatePermit {
  @Field(() => ID)
  type!: string

  @Field()
  @IsDate()
  start!: Date
}
