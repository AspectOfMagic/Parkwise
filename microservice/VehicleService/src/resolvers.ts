import { DriverResolver } from './vehicle/driver/resolver'
import { EnforcerResolver } from './vehicle/enforcer/resolver'
export const resolvers = [DriverResolver, EnforcerResolver] as const
