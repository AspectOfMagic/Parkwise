import {
  Ctx,
	Resolver,
	Authorized,
	Mutation,
	Query,
	Arg,
} from 'type-graphql'

import {TicketService} from './service'
import {Ticket, NewTicket} from './schema'
import { Request } from "express";

@Resolver()
export class TicketResolver {
  @Authorized("driver")
  @Query(() => [Ticket])
  async getTickets(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) vehicleId: string,
  ): Promise<Ticket[]> {
    return new TicketService().get(vehicleId)
  }

  @Authorized("driver")
  @Query(() => Ticket)
  async getTicketById(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) id: string,
  ): Promise<Ticket> {
    return new TicketService().getbyId(id)
  }

  @Authorized("enforcer")
  @Mutation(() => Ticket)
  async makeTicket(
    @Arg("newTicket", () => NewTicket) newTicket: NewTicket,
    @Ctx() ctx: { headers: { authorization?: string } }
  ): Promise<Ticket> {
    const token = ctx.headers.authorization;
    return new TicketService().make(newTicket, token)
  }

  @Authorized("driver")
  @Mutation(() => Ticket)
  async payTicket(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) ticketId: string,
    @Ctx() {user}: Request
  ): Promise<Ticket> {
    return new TicketService().pay(user?.id, ticketId)
  }

  @Authorized("driver")
  @Mutation(() => Ticket)
  async challengeTicket(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) ticketId: string,
    @Arg("desc", () => String) desc: string
  ): Promise<Ticket> {
    return new TicketService().challenge(ticketId, desc)
  }

  @Authorized("admin")
  @Query(() => [Ticket])
  async getChallenges(
  ): Promise<Ticket[]> {
    return new TicketService().getChallenges()
  }

  @Authorized("admin")
  @Mutation(() => Ticket)
  async acceptChallenge(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) ticketId: string,
  ): Promise<Ticket> {
    return new TicketService().acceptChallenge(ticketId)
  }

  @Authorized("admin")
  @Mutation(() => Ticket)
  async rejectChallenge(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Arg("input", type => String) ticketId: string,
  ): Promise<Ticket> {
    return new TicketService().rejectChallenge(ticketId)
  }
}
