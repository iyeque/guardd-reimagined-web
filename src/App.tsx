import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Workshop = lazy(() => import("./pages/Workshop"));
const ScreenTimeManagement = lazy(() => import("./pages/ScreenTimeManagement"));
const FamilyDigitalAgreements = lazy(() => import("./pages/FamilyDigitalAgreements"));
const EducationalGames = lazy(() => import("./pages/EducationalGames"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route
              path="/screen-time-management"
              element={<ScreenTimeManagement />}
            />
            <Route
              path="/family-digital-agreements"
              element={<FamilyDigitalAgreements />}
            />
            <Route
              path="/educational-games"
              element={<EducationalGames />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;