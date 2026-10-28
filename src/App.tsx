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

// Per-route canonical + og:url. The HTML shell is shared by every route, so a
// static tag would wrongly claim every page is the homepage. Setting it from
// the router keeps the signal correct for crawlers that execute JavaScript.
const SITE_ORIGIN = "https://digitalguardianwellness.org";

function CanonicalTag() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
    const url = SITE_ORIGIN + path;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
    let og = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!og) {
      og = document.createElement("meta");
      og.setAttribute("property", "og:url");
      document.head.appendChild(og);
    }
    og.content = url;

    // Per-route title + description
    const meta = ROUTE_META[path] || ROUTE_META["/"];
    document.title = meta.title;
    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    desc.content = meta.description;
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement("meta"); ogTitle.setAttribute("property", "og:title"); document.head.appendChild(ogTitle); }
    ogTitle.content = meta.title;
    let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement("meta"); ogDesc.setAttribute("property", "og:description"); document.head.appendChild(ogDesc); }
    ogDesc.content = meta.description;
  }, [pathname]);
  return null;
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": { title: "Digital Guardian Wellness - Digital Wellness Reimagined", description: "Take control of your digital life with DigitalGuard. Screen time management, digital wellness, and online safety for families." },
  "/blog": { title: "Digital Wellness Blog | Digital Guardian", description: "Curated articles on screen time, online safety, privacy, and digital wellness for families." },
  "/videos": { title: "Video Resources | Digital Guardian", description: "Curated YouTube videos on internet safety, screen time, and digital citizenship for families and kids." },
  "/community": { title: "Community Hub | Digital Guardian", description: "Connect with mentors, regional chapters (UAE, Kenya), and curated digital wellness discussions." },
  "/family-commitments": { title: "Family Commitments | Digital Guardian", description: "Create and track shared family commitments for healthy technology use." },
  "/family-agreements": { title: "Family Digital Agreements | Digital Guardian", description: "Shared rules families set together for healthy technology use." },
  "/screen-time": { title: "Screen Time Management | Digital Guardian", description: "Tools and guides to manage screen time for your family." },
  "/games": { title: "Educational Games | Digital Guardian", description: "Interactive games teaching digital wellness and online safety to kids." },
  "/workshops": { title: "Workshops | Digital Guardian", description: "Interactive workshops and stories for the whole family." },
  "/course": { title: "Course | Digital Guardian", description: "Digital wellness course for families." },
  "/privacy": { title: "Privacy Policy | Digital Guardian", description: "Privacy policy for Digital Guardian Wellness." },
  "/terms": { title: "Terms of Service | Digital Guardian", description: "Terms of service for Digital Guardian Wellness." },
};

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
          <CanonicalTag />
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
