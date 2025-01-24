import { createAppIframeSDK } from "@whop-apps/sdk";

// Define a type for the auth property
type AuthMethods = {
  login: () => Promise<void>;
  checkout: (options: { plan: string }) => Promise<void>;
};

// Update the ExtendedWhopApp type to include the auth property
type ExtendedWhopApp = ReturnType<typeof createAppIframeSDK> & {
  getRedirectUrl: (options: { path: string }) => Promise<{ url: string }>;
  openExternalUrl: (options: { url: string }) => Promise<void>;
  auth: AuthMethods;
};

export const ExtendedWhopApp: ExtendedWhopApp = createAppIframeSDK({
  onMessage: {},
}) as ExtendedWhopApp;

export const initiateWhopAuth = async () => {
  try {
    if (typeof ExtendedWhopApp.auth?.login === 'function') {
      await ExtendedWhopApp.auth.login();
    } else {
      const { url } = await ExtendedWhopApp.getRedirectUrl({
        path: "/auth/callback",
      });
      await ExtendedWhopApp.openExternalUrl({ url });
    }
  } catch (error) {
    console.error("Error initiating Whop auth:", error);
    throw error;
  }
};

export const initiateWhopCheckout = async (planId: string) => {
  try {
    if (typeof ExtendedWhopApp.auth?.checkout === 'function') {
      await ExtendedWhopApp.auth.checkout({ plan: planId });
    } else {
      const { url } = await ExtendedWhopApp.getRedirectUrl({
        path: `/checkout/${planId}`,
      });
      await ExtendedWhopApp.openExternalUrl({ url });
    }
  } catch (error) {
    console.error("Error initiating Whop checkout:", error);
    throw error;
  }
};

