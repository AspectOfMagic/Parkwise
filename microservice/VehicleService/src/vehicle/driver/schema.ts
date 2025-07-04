import { 
  Field,
  ObjectType, 
  ArgsType, 
  registerEnumType,
  Int,
  InputType} from "type-graphql"
import { 
  Matches,
  Length} from "class-validator"
import "reflect-metadata";

export const LICENSE_PLATE_REGEX = /^[A-Z0-9]{1,4}[- ]?[A-Z0-9]{1,4}$/;
export const LICENSE_PLATE_MESSAGE = "License plate format is invalid";
export const LICENSE_PLATE_LENGTH_MESSAGE = "License plate must be between 1 and 10 characters";

export enum USState {
  AL = "AL", AK = "AK", AZ = "AZ", AR = "AR", CA = "CA",
  CO = "CO", CT = "CT", DE = "DE", FL = "FL", GA = "GA",
  HI = "HI", ID = "ID", IL = "IL", IN = "IN", IA = "IA",
  KS = "KS", KY = "KY", LA = "LA", ME = "ME", MD = "MD",
  MA = "MA", MI = "MI", MN = "MN", MS = "MS", MO = "MO",
  MT = "MT", NE = "NE", NV = "NV", NH = "NH", NJ = "NJ",
  NM = "NM", NY = "NY", NC = "NC", ND = "ND", OH = "OH",
  OK = "OK", OR = "OR", PA = "PA", RI = "RI", SC = "SC",
  SD = "SD", TN = "TN", TX = "TX", UT = "UT", VT = "VT",
  VA = "VA", WA = "WA", WV = "WV", WI = "WI", WY = "WY"
}

registerEnumType(USState, {
  name: "USState",
  description: "Two-letter US state abbreviation"
});

@ObjectType()
export class Vehicle {
  constructor(
    id: string, 
    plate: string,
    make: string, 
    model: string,
    year: number,
    color: string,
    state: string,
    ) {
    this.id = id
    this.plate = plate
    this.make = make
    this.model = model
    this.year = year
    this.color = color
    this.state = state
    
  }
	@Field()
	id!: string

  @Field()
  @Matches(LICENSE_PLATE_REGEX, { message: LICENSE_PLATE_MESSAGE })
  @Length(1, 10, { message: LICENSE_PLATE_LENGTH_MESSAGE })
  plate!: string;

	@Field()
	make!: string

	@Field()
	model!: string

  @Field(() => Int)
	year!: number

  @Field()
	color!: string

  @Field()
  state!: string;
}

@ArgsType()
export class RegisterArgs {
  @Field()
  @Matches(LICENSE_PLATE_REGEX, { message: LICENSE_PLATE_MESSAGE })
  @Length(1, 10, { message: LICENSE_PLATE_LENGTH_MESSAGE })
  plate!: string;

  @Field()
	make!: string

  @Field()
	model!: string

  @Field(() => Int)
	year!: number

  @Field()
	color!: string

  @Field(() => USState)
  state!: USState;
}

@InputType()
export class LicensePlate {
	@Field()
  @Matches(LICENSE_PLATE_REGEX, { message: LICENSE_PLATE_MESSAGE })
  @Length(1, 10, { message: LICENSE_PLATE_LENGTH_MESSAGE })
  plate!: string;
}