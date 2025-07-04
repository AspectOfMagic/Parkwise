import {PermitTypeResolver} from './permitType/resolver'
import { PermitResolver } from './permit/resolver'

export const resolvers = [PermitTypeResolver, PermitResolver] as const
