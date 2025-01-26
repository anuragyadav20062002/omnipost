import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scope: string;
  usesPKCE?: boolean;
}



interface FacebookPageData {
  access_token: string;
  id: string;
  name: string;
  tasks: string[];
  instagram_business_account?: {
    id: string;
    username: string;
  };
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_account: {
    id: string;
    username: string;
  } | null;
}

const configs: Record<string, OAuthConfig> = {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read tweet.write users.read offline.access',
    usesPKCE: true,
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    authorizationUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,public_profile,email',
    usesPKCE: false,
  },
  instagram: {
    clientId: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
    authorizationUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts',
    usesPKCE: false,
  }
};

function generateCodeVerifier(): string {
  const buffer = randomBytes(32);
  return buffer.toString('base64url');
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function getAuthUrl(platform: string): Promise<{ url: string; state: string; codeVerifier?: string }> {
  const config = configs[platform];
  if (!config) throw new Error(`Unsupported platform: ${platform}`);

  const state = uuidv4();
  const url = new URL(config.authorizationUrl);
  url.searchParams.append('client_id', config.clientId);
  url.searchParams.append('redirect_uri', config.redirectUri);
  url.searchParams.append('scope', config.scope);
  url.searchParams.append('state', state);
  url.searchParams.append('response_type', 'code');

  if (config.usesPKCE) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    return { url: url.toString(), state, codeVerifier };
  } else {
    return { url: url.toString(), state };
  }
}

async function handleFacebookCallback(accessToken: string, config: OAuthConfig) {
  try {
    // Get user details
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User fetch error:', errorData);
      throw new Error('Failed to fetch user details');
    }

    const userData = await userResponse.json();
    console.log('User data:', JSON.stringify(userData, null, 2));

    // Get long-lived user access token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.clientId}&client_secret=${config.clientSecret}&fb_exchange_token=${accessToken}`
    );

    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.text();
      console.error('Long-lived token error:', errorData);
      throw new Error('Failed to get long-lived access token');
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    const longLivedUserToken = longLivedTokenData.access_token;

    // Fetch pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token&access_token=${longLivedUserToken}`
    );

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.text();
      console.error('Pages fetch error:', errorData);
      throw new Error('Failed to fetch pages');
    }

    const pagesData = await pagesResponse.json();
    console.log('Pages data:', JSON.stringify(pagesData, null, 2));

    return {
      access_token: longLivedUserToken,
      expires_at: Date.now() + (longLivedTokenData.expires_in * 1000),
      user_id: userData.id,
      name: userData.name,
      pages: pagesData.data
    };
  } catch (error) {
    console.error('Error in Facebook callback:', error);
    throw error;
  }
}


async function handleInstagramCallback(accessToken: string, config: OAuthConfig) {
  try {
    // First, verify the access token and get user details
    const debugTokenResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${config.clientId}|${config.clientSecret}`
    );
    
    if (!debugTokenResponse.ok) {
      const errorData = await debugTokenResponse.text();
      console.error('Token debug error:', errorData);
      throw new Error('Failed to verify access token');
    }

    const debugTokenData = await debugTokenResponse.json();
    console.log('Debug token data:', JSON.stringify(debugTokenData, null, 2));

    // Get user details
    const userResponse = await fetch(
      `https://graph.facebook.com/v17.0/me?access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User fetch error:', errorData);
      throw new Error('Failed to fetch user details');
    }

    const userData = await userResponse.json();
    console.log('User data:', JSON.stringify(userData, null, 2));

    // Fetch Facebook pages with Instagram accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v17.0/${userData.id}/accounts?fields=name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`
    );
    
    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.text();
      console.error('Facebook pages fetch error:', errorData);
      throw new Error(`Failed to fetch Facebook pages: ${errorData}`);
    }

    const pagesData = await pagesResponse.json();
    console.log('Pages data:', JSON.stringify(pagesData, null, 2));

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('No Facebook pages found. Please create a Facebook Page first.');
    }

    // Find the first page with an Instagram business account
    const pageWithInstagram = pagesData.data.find(
      (page: FacebookPageData) => page.instagram_business_account
    );

    if (!pageWithInstagram) {
      throw new Error('No Instagram business account found. Please ensure you have connected your Instagram business account to your Facebook Page.');
    }

    // Get long-lived page access token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.clientId}&client_secret=${config.clientSecret}&fb_exchange_token=${pageWithInstagram.access_token}`
    );

    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.text();
      console.error('Long-lived token error:', errorData);
      throw new Error('Failed to get long-lived page access token');
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    
    return {
      access_token: accessToken,
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      user_id: userData.id,
      page_id: pageWithInstagram.id,
      page_access_token: longLivedTokenData.access_token,
      instagram_account_id: pageWithInstagram.instagram_business_account.id,
    };
  } catch (error) {
    console.error('Error in Instagram account fetch:', error);
    throw error;
  }
}

export async function handleCallback(
  platform: string,
  code: string,
  userId: string,
  codeVerifier?: string
): Promise<{
  [x: string]: any;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user_id?: string;
  page_id?: string;
  page_access_token?: string;
  pages?: FacebookPage[];
}> {
  console.log(`Handling callback for ${platform}`);
  const config = configs[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
    });

    if (config.usesPKCE && codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    console.log(`Sending token request to ${config.tokenUrl}`);
    console.log('Request params:', params.toString());

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (platform === 'twitter') {
      const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    } else {
      params.append('client_secret', config.clientSecret);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: headers,
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token exchange error:', errorData);
      throw new Error(`Failed to exchange code for token: ${response.statusText}. Error: ${errorData}`);
    }

    const tokenData = await response.json();
    console.log('Token data received:', JSON.stringify(tokenData, null, 2));

    if (platform === 'facebook') {
      return await handleFacebookCallback(tokenData.access_token, config);
    } else if (platform === 'instagram') {
      return await handleInstagramCallback(tokenData.access_token, config);
    } else if (platform === 'twitter') {
      // Verify the Twitter token has the correct scopes
      const scopes = tokenData.scope.split(' ');
      if (!scopes.includes('tweet.write')) {
        throw new Error('Twitter token does not have tweet.write permission');
      }
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
      user_id: tokenData.user_id,
    };
  } catch (error) {
    console.error(`Error in handleCallback for ${platform}:`, error);
    throw error;
  }
}

// async function refreshTwitterToken(refreshToken: string): Promise<string> {
//   const config = configs.twitter;
//   const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
//   const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

//   const response = await fetch(tokenUrl, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Basic ${basicAuth}`,
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken
//     })
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error('Twitter token refresh error:', errorText);
//     throw new Error(`Twitter token refresh error: ${errorText}`);
//   }

//   const data = await response.json();
//   if (!data.access_token) {
//     throw new Error('No access token received from Twitter');
//   }

//   // Verify the refreshed token has the correct scopes
//   const scopes = data.scope.split(' ');
//   if (!scopes.includes('tweet.write')) {
//     throw new Error('Refreshed Twitter token does not have tweet.write permission');
//   }

//   return data.access_token;
// }
