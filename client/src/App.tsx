import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/index";
import Schedule from "@/pages/schedule";
import Settings from "@/pages/settings";
import ProfessorSemanal from "@/pages/professor-semanal";
import Status from "@/pages/status";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/settings" component={Settings} />
      <Route path="/professor-semanal" component={ProfessorSemanal} />
      <Route path="/compartilhado" component={ProfessorSemanal} /> {/* Rota para visualizações compartilhadas */}
      <Route path="/status" component={Status} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
