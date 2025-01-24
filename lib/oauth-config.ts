import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

interface WhopProfile {
  id: string
  username: string
  email: string
}

export function WhopProvider(config: OAuthUserConfig<WhopProfile>): OAuthConfig<WhopProfile> {
  return {
    id: "whop",
    name: "Whop",
    type: "oauth",
    authorization: {
      url: "https://api.whop.com/oauth/authorize",
      params: { scope: "read_user" }
    },
    token: "https://api.whop.com/oauth/token",
    userinfo: "https://api.whop.com/v2/me",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.username,
        email: profile.email,
      }
    },
    ...config,
  }
}

