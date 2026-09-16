import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Shield } from "lucide-react";
import { ProfileProvider } from "@/context/ProfileContext";

function GlobalScrollHandler() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); }
    else {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); }
      else { setTimeout(() => { const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: "smooth" }); }, 300); }
    }
  }, [pathname, hash]);
  return null;
}

const Index = lazy(() => import("./pages/Index"));
const Workshop = lazy(() => import("./pages/Workshop"));
const Workshops = lazy(() => import("./pages/Workshops").then(m => ({ default: m.Workshops })));
const WorkshopDetail = lazy(() => import("./pages/WorkshopDetail").then(m => ({ default: m.WorkshopDetail })));
const Course = lazy(() => import("./pages/Course").then(m => ({ default: m.Course })));
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
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

const queryClient = new QueryClient();

const App = () => (
  <ProfileProvider>
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
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/workshop/:workshopId" element={<WorkshopDetail />} />
                <Route path="/course" element={<Course />} />
                <Route path="/screen-time-management" element={<ScreenTimeManagement />} />
                <Route path="/family-digital-agreements" element={<FamilyDigitalAgreements />} />
                <Route path="/family-commitments" element={<FamilyCommitments />} />
                <Route path="/educational-games" element={<EducationalGames />} />
                <Route path="/educational-blog" element={<EducationalBlog />} />
                <Route path="/video-resources" element={<VideoResources />} />
                <Route path="/community-support" element={<CommunitySupport />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
          <Analytics beforeSend={(event) => {
            if (typeof window !== "undefined" && localStorage.getItem("dg_cookie_consent") !== "accept") { return null; }
            return event;
          }} />
        </TooltipProvider>
      </QueryClientProvider>
    </ProfileProvider>
);

export default App;