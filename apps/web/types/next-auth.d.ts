import type { DefaultSession } from "next-auth"
import type { Role } from "./auth.types"

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string
      role: Role
      accessToken: string
      avatar: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    accessToken: string
    avatar: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
    accessToken: string
    avatar: string | null
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      accessToken: string
      avatar: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    accessToken: string
    avatar: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    accessToken: string
    avatar: string | null
  }
}
