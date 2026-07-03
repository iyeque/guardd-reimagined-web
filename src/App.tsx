import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

// Global Scroll and Hash Handler
const GlobalScrollHandler = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [pathname, hash]);

  return null;
};

const Index = lazy(() => import("./pages/Index"));
const Workshop = lazy(() => import("./pages/Workshop"));
const ScreenTimeManagement = lazy(() => import("./pages/ScreenTimeManagement"));
const FamilyDigitalAgreements = lazy(() => import("./pages/FamilyDigitalAgreements"));
const FamilyCommitments = lazy(() => import("./pages/FamilyCommitments"));
const EducationalGames = lazy(() => import("./pages/EducationalGames"));
const EducationalBlog = lazy(() => import("./pages/EducationalBlog"));
const VideoResources = lazy(() => import("./pages/VideoResources"));
const CommunitySupport = lazy(() => import("./pages/CommunitySupport"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Layout = lazy(() => import("./components/Layout"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalScrollHandler />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase tracking-tighter text-2xl animate-pulse">Loading Platform...</div>}>
          <Routes>
            <Route element={<Layout />}>
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
                path="/family-commitments"
                element={<FamilyCommitments />}
              />
              <Route
                path="/educational-games"
                element={<EducationalGames />}
              />
              <Route
                path="/educational-blog"
                element={<EducationalBlog />}
              />
              <Route
                path="/video-resources"
                element={<VideoResources />}
              />
              <Route
                path="/community-support"
                element={<CommunitySupport />}
              />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
