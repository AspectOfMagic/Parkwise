import { AuthChecker } from "type-graphql"
import { Request } from "express"


export const expressAuthChecker: AuthChecker<Request> = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { root, args, context, info }, roles,) => 
{
  try {
    if (roles.includes("driver")) {
      const data = await fetch('http://localhost:3010/api/v0/checkDriver', {
        method: 'GET',
        headers: {
          'Authorization': `${context.headers.authorization}`,
        }
      })
      .then(response => { 
        if (response.status != 200) {
          return false
        }
        else {
          return response.json()
        }
      })
      if (data) {
        context.user = data
      }
      return context.user ? true : false
    } 
    else if (roles.includes("enforcer")) {
      const data = await fetch('http://localhost:3010/api/v0/checkEnforcer', {
        method: 'GET',
        headers: {
          'Authorization': `${context.headers.authorization}`,
        }
      })
      .then(response => { 
        if (response.status != 200) {
          return false
        }
        else {
          return response.json()
        }
      })
      if (data) {
        context.user = data
        return true
      }
      return false
    } 
    else if (roles.includes("admin")) {
      const data = await fetch('http://localhost:3010/api/v0/checkAdmin', {
        method: 'GET',
        headers: {
          'Authorization': `${context.headers.authorization}`,
        }
      })
      .then(response => { 
        if (response.status != 200) {
          return false
        }
        else {
          return response.json()
        }
      })
      if (data) {
        context.user = data
      }
      return context.user ? true : false
    }
    return false
  } catch {
    return false
  }
}
