import {
  Field,
  ObjectType,
  InputType,
}
  from "type-graphql"

import {
  IsDateString,
  IsUUID,
  IsNumber,
  IsString,
  IsIn
} from "class-validator"

@InputType()
export class NewTicket {
  @Field()
  @IsString()
  vehicle!: string

  @Field()
  @IsNumber()
  cost!: number
}

@ObjectType()
export class Ticket {
  @Field()
  @IsUUID()
  id!: string

  @Field()
  @IsString()
  vehicle!: string

  @Field()
  @IsNumber()
  cost!: number

  @Field()
  @IsDateString()
  issued!: string

  @Field()
  @IsDateString()
  deadline!: string

  @Field()
  @IsString()
  @IsIn(["paid", "unpaid", "late", "accepted"])
  status!: string

  @Field({ nullable: true})
  @IsString()
  desc?: string
}
