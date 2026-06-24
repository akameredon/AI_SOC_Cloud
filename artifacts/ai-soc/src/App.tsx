import { Layout } from "@/components/layout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "./pages/dashboard";
import Cameras from "./pages/cameras";
import Events from "./pages/events";
import Alerts from "./pages/alerts";
import Incidents from "./pages/incidents";
import Zones from "./pages/zones";
import AlertRules from "./pages/alert-rules";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cameras" component={Cameras} />
        <Route path="/events" component={Events} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/incidents" component={Incidents} />
        <Route path="/zones" component={Zones} />
        <Route path="/alert-rules" component={AlertRules} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
