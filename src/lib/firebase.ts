import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";

const app = initializeApp({
    apiKey: import.meta.env.VITE_GCP_API_KEY,
    authDomain: import.meta.env.VITE_GCP_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_GCP_PROJECT_ID,
});
export const auth = getAuth(app);
export const google = new GoogleAuthProvider();
export const facebook = new FacebookAuthProvider();
export const apple = new OAuthProvider("apple.com");