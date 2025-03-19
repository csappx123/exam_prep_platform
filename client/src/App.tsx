import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import TestsPage from "@/pages/tests/index";
import TakeTestPage from "@/pages/tests/take";
import TestResultsPage from "@/pages/tests/results";
import UsersPage from "@/pages/admin/users";
import TestManagementPage from "@/pages/admin/test-management";
import QuestionBankPage from "@/pages/admin/question-bank";
import ProfilePage from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/tests" component={TestsPage} />
      <ProtectedRoute path="/tests/take/:id" component={TakeTestPage} />
      <ProtectedRoute path="/tests/results/:id" component={TestResultsPage} />
      
      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin/users" 
        component={UsersPage}
        allowedRoles={['admin']} 
      />
      <ProtectedRoute 
        path="/admin/test-management" 
        component={TestManagementPage}
        allowedRoles={['admin', 'teacher']} 
      />
      <ProtectedRoute 
        path="/admin/question-bank" 
        component={QuestionBankPage}
        allowedRoles={['admin', 'teacher']} 
      />
      
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
