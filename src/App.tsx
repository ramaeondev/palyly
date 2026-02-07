import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PortalGuard } from "@/components/auth/PortalGuard";
import Landing from "./pages/Landing";
import LandingAlt from "./pages/LandingAlt";
import LandingAlt2 from "./pages/LandingAlt2";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientEmployees from "./pages/ClientEmployees";
import ClientForm from "./pages/ClientForm";
import EmployeeForm from "./pages/EmployeeForm";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Payslips from "./pages/Payslips";
import Payroll from "./pages/Payroll";
import Templates from "./pages/Templates";
import Permissions from "./pages/Permissions";
import ClientPortal from "./pages/ClientPortal";
import EmployeePortal from "./pages/EmployeePortal";
import AcceptInvite from "./pages/AcceptInvite";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing-alt-1" element={<LandingAlt />} />
            <Route path="/landing-alt-2" element={<LandingAlt2 />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Portal routes - strictly isolated */}
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/employee-portal" element={<EmployeePortal />} />
            
            {/* Dedicated form pages - can open in new window */}
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:clientId/edit" element={<ClientForm />} />
            <Route path="/clients/:clientId/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:employeeId/edit" element={<EmployeeForm />} />
            
            {/* Firm dashboard routes - protected by PortalGuard */}
            <Route path="/dashboard" element={
              <PortalGuard allowedPortal="firm">
                <Dashboard />
              </PortalGuard>
            } />
            <Route path="/clients" element={
              <PortalGuard allowedPortal="firm">
                <Clients />
              </PortalGuard>
            } />
            <Route path="/clients/:clientId/employees" element={
              <PortalGuard allowedPortal="firm">
                <ClientEmployees />
              </PortalGuard>
            } />
            <Route path="/users" element={
              <PortalGuard allowedPortal="firm">
                <Users />
              </PortalGuard>
            } />
            <Route path="/settings" element={
              <PortalGuard allowedPortal="firm">
                <Settings />
              </PortalGuard>
            } />
            <Route path="/templates" element={
              <PortalGuard allowedPortal="firm">
                <Templates />
              </PortalGuard>
            } />
            <Route path="/payslips" element={
              <PortalGuard allowedPortal="firm">
                <Payslips />
              </PortalGuard>
            } />
            <Route path="/payroll" element={
              <PortalGuard allowedPortal="firm">
                <Payroll />
              </PortalGuard>
            } />
            <Route path="/permissions" element={
              <PortalGuard allowedPortal="firm">
                <Permissions />
              </PortalGuard>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
