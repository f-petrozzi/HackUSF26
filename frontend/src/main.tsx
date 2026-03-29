import { ClerkProvider } from "@clerk/clerk-react";
import { createRoot } from "react-dom/client";
import { appConfig } from "@/lib/config";
import App from "./App.tsx";
import "./index.css";

const app = appConfig.clerkPublishableKey ? (
  <ClerkProvider
    publishableKey={appConfig.clerkPublishableKey}
    afterSignOutUrl="/login"
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/onboarding"
  >
    <App />
  </ClerkProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(app);
