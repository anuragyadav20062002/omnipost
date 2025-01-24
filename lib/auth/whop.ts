import { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

interface WhopProfile {
  id: string
  username: string
  email: string
}

export const whopProvider = (config: OAuthUserConfig<WhopProfile>): OAuthConfig<WhopProfile> => ({
  id: "whop",
  name: "Whop",
  type: "oauth",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  authorization: {
    url: "https://api.whop.com/oauth/authorize",
    params: { scope: "read_user" }
  },
  token: "https://api.whop.com/oauth/token",
  userinfo: "https://api.whop.com/v2/me",
  profile(profile: WhopProfile) {
    return {
      id: profile.id,
      name: profile.username,
      email: profile.email
    }
  }
})

