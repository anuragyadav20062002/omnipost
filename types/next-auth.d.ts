import type { DefaultSession, Profile as DefaultProfile } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      accessToken?: string
    } & DefaultSession["user"]
  }

  interface Profile extends DefaultProfile {
    id: string
    username: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    accessToken?: string
  }
}

