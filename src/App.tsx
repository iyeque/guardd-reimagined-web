import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Shield } from "lucide-react";
import { ProfileProvider } from "@/context/ProfileContext";
import { WellnessProvider } from "@/context/WellnessContext";
import { COOKIE_CONSENT_KEY } from "@/lib/profiles";

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
const ProfileTransfer = lazy(() => import("./pages/ProfileTransfer"));

const queryClient = new QueryClient();

const App = () => (
  <ProfileProvider>
    <WellnessProvider>
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
                <Route path="/screen-time" element={<ScreenTimeManagement />} />
                <Route path="/screen-time-management" element={<Navigate to="/screen-time" replace />} />
                <Route path="/family-agreements" element={<FamilyDigitalAgreements />} />
                <Route path="/family-digital-agreements" element={<Navigate to="/family-agreements" replace />} />
                <Route path="/family-commitments" element={<FamilyCommitments />} />
                <Route path="/games" element={<EducationalGames />} />
                <Route path="/blog" element={<EducationalBlog />} />
                <Route path="/videos" element={<VideoResources />} />
                <Route path="/community" element={<CommunitySupport />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/transfer" element={<ProfileTransfer />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
          <Analytics beforeSend={(event) => {
            if (typeof window !== "undefined" && localStorage.getItem(COOKIE_CONSENT_KEY) !== "accept") { return null; }
            return event;
          }} />
        </TooltipProvider>
      </QueryClientProvider>
    </WellnessProvider>
    </ProfileProvider>
  );

export default App;
