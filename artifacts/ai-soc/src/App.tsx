import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Cameras from "./pages/cameras";
import Events from "./pages/events";
import Alerts from "./pages/alerts";
import Incidents from "./pages/incidents";
import Zones from "./pages/zones";
import AlertRules from "./pages/alert-rules";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(217, 91%, 60%)",
    colorForeground: "hsl(210, 40%, 98%)",
    colorMutedForeground: "hsl(215, 20%, 65%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(222, 47%, 6%)",
    colorInput: "hsl(217, 32%, 17%)",
    colorInputForeground: "hsl(210, 40%, 98%)",
    colorNeutral: "hsl(217, 32%, 17%)",
    fontFamily: "'JetBrains Mono', monospace",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "rounded border border-[hsl(217,32%,17%)] bg-[hsl(222,47%,6%)] w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[hsl(210,40%,98%)] font-bold tracking-wider uppercase",
    headerSubtitle: "text-[hsl(215,20%,65%)] text-sm",
    socialButtonsBlockButtonText: "text-[hsl(210,40%,98%)] font-medium",
    formFieldLabel: "text-[hsl(215,20%,65%)] text-xs uppercase tracking-wider",
    footerActionLink: "text-[hsl(217,91%,60%)] hover:text-[hsl(217,91%,70%)]",
    footerActionText: "text-[hsl(215,20%,65%)]",
    dividerText: "text-[hsl(215,20%,65%)] text-xs",
    identityPreviewEditButton: "text-[hsl(217,91%,60%)]",
    formFieldSuccessText: "text-[hsl(142,71%,45%)]",
    alertText: "text-[hsl(210,40%,98%)]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-[hsl(217,32%,17%)] bg-[hsl(222,47%,8%)] hover:bg-[hsl(222,47%,12%)] transition-colors",
    formButtonPrimary: "bg-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,50%)] text-white font-bold tracking-wider uppercase",
    formFieldInput: "bg-[hsl(217,32%,13%)] border-[hsl(217,32%,20%)] text-[hsl(210,40%,98%)] font-mono placeholder:text-[hsl(215,20%,40%)]",
    footerAction: "border-t border-[hsl(217,32%,17%)] bg-[hsl(222,47%,5%)]",
    dividerLine: "bg-[hsl(217,32%,17%)]",
    alert: "border border-[hsl(0,84%,30%)] bg-[hsl(0,84%,10%)] rounded",
    otpCodeFieldInput: "bg-[hsl(217,32%,13%)] border-[hsl(217,32%,20%)] text-[hsl(210,40%,98%)] font-mono",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-primary font-mono font-bold tracking-widest uppercase text-sm mb-1">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12,2 22,7 22,17 12,22 2,17 2,7"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            AI-SOC Cloud
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">Security Operations Platform</p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/dashboard`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-primary font-mono font-bold tracking-widest uppercase text-sm mb-1">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12,2 22,7 22,17 12,22 2,17 2,7"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            AI-SOC Cloud
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">Security Operations Platform</p>
        </div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={`${basePath}/dashboard`}
        />
      </div>
    </div>
  );
}

function AppRouter() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your SOC dashboard",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start monitoring with AI-SOC Cloud",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/cameras" component={() => <ProtectedRoute component={Cameras} />} />
            <Route path="/events" component={() => <ProtectedRoute component={Events} />} />
            <Route path="/alerts" component={() => <ProtectedRoute component={Alerts} />} />
            <Route path="/incidents" component={() => <ProtectedRoute component={Incidents} />} />
            <Route path="/zones" component={() => <ProtectedRoute component={Zones} />} />
            <Route path="/alert-rules" component={() => <ProtectedRoute component={AlertRules} />} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRouter />
    </WouterRouter>
  );
}

export default App;
