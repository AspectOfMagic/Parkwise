import { Field, ObjectType, ArgsType, ID, Float} from "type-graphql"
import "reflect-metadata";

@ObjectType()
export class PermitType {
  constructor(
    id: string,
    classname: string,
    type: string,
    price: string) {
      this.id = id 
      this.classname = classname
      this.type = type
      this.price = parseFloat(price)
  }
  @Field(() => ID)
  id!: string

  @Field()
  classname!: string

  @Field()
  type!: string
  
  @Field()
  price!: number 
}

@ArgsType()
export class CreatePermitType {
  @Field()
  classname!: string

  @Field()
  type!: string
  
  @Field(() => Float)
  price!: number 
}

@ArgsType()
export class UpdatePermitType {
  @Field(() => ID)
  id!: string
  
  @Field(() => Float)
  price!: number 
}