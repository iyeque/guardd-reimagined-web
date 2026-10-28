import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Calendar,
  Users,
  Heart,
  Star,
  X,
  ArrowRight,
  Search,
  MapPin,
  ExternalLink,
  Globe,
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWellness } from "@/context/WellnessContext";

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface GlobalEvent {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  type: string;
  url: string;
  status: string;
  organizer: string;
  description: string;
}

interface TrendingDiscussion {
  id: number;
  platform: string;
  community: string;
  title: string;
  url: string;
  hotness: string;
  replies: number;
  postedAt: string;
}

interface Mentor {
  id: number;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  online: boolean;
}

const CommunitySupport: React.FC = () => {
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [discussions, setDiscussions] = useState<TrendingDiscussion[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("");
  const [isApplied, setIsApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', specialty: '', bio: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<HTMLInputElement>(null);

  // Function to load reCAPTCHA script and execute it
  const getRecaptchaToken = async () => {
    console.log("Mentorship Form: Requesting reCAPTCHA token...");
    if (window.grecaptcha && window.grecaptcha.execute) {
      try {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        if (!siteKey) {
          console.error("Mentorship Form: VITE_RECAPTCHA_SITE_KEY is not configured.");
          toast.error("Security configuration error. Please contact support.");
          return null;
        }
        const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
        console.log("Mentorship Form: reCAPTCHA token obtained (starts with:", token.substring(0, 10), ")");
        if (recaptchaRef.current) {
          recaptchaRef.current.value = token;
        }
        return token;
      } catch (error) {
        console.error("Mentorship Form: reCAPTCHA execution failed:", error);
        toast.error("Security check failed. Please refresh and try again.");
        return null;
      }
    } else {
      console.error("Mentorship Form: grecaptcha not found. Script error or domain issue.");
      toast.error("Security check is still loading...");
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const [communityRes] = await Promise.all([
        fetch('/api/community/data'),
      ]);
      if (!communityRes.ok) {
        throw new Error(`API returned ${communityRes.status}`);
      }
      const contentType = communityRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API returned non-JSON response");
      }
      const data = await communityRes.json();

      // Curated content is now merged server-side into /api/community/data,
      // so the client no longer needs the admin endpoint (which 401s for visitors).
      setEvents(data.events || []);
      setDiscussions(data.discussions || []);
      setMentors(data.mentors || []);
      setLastSync(new Date(data.lastSync).toLocaleTimeString());
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch community data:", error);
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (isApplied) return;
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = await getRecaptchaToken();
    if (!token) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Mentorship Form: Submitting to local API...");
      let dbResponse;
      try {
        dbResponse = await fetch("/api/mentors/apply", {
          method: "POST",
          body: JSON.stringify({ ...formData, "g-recaptcha-response": token }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (networkError) {
        console.error("Mentorship Form: Local API unreachable:", networkError);
        toast.error("Cannot reach server", {
          description: "The backend API looks unreachable. Make sure `npm run dev` is running and try again.",
          duration: 6000,
        });
        throw networkError;
      }

      if (!dbResponse.ok) {
        const errorData = await dbResponse.json();
        const detailMsg = errorData.details ? ` (${errorData.details.join(", ")})` : "";
        throw new Error((errorData.error || "Database storage failed") + detailMsg);
      }

      console.log("Mentorship Form: Submitting to Google Apps Script...");
      // Send Email Notification via Google Apps Script
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2Jk69RuNGXNLd7muFwHaUwJCNOKY1UODwBQQ1X9goIzUNlA7Lky5MM-fO-g0If9tW/exec";
      
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ...formData,
          "g-recaptcha-response": token,
          message: `Specialty: ${formData.specialty}\nBio: ${formData.bio}`
        } as unknown as Record<string, string>),
      });

      setIsApplied(true);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', specialty: '', bio: '' });

      toast.success("Application Received! Review Pending.", {
        description: `Thank you ${formData.name}! Your mentor application for the 2026 cohort is now under review.`,
        duration: 8000,
      });
    } catch (error) {
      console.error("Mentorship Form: Detailed Submission Error:", error);
      if (error instanceof Error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Please check your connection or try again later.";
      toast.error("Submission failed", {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 45000);
    return () => clearInterval(refreshInterval);
  }, []);

  const filteredEvents = useMemo(() => {
    const lower = eventSearch.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(lower) || 
      e.location.toLowerCase().includes(lower) ||
      e.type.toLowerCase().includes(lower)
    );
  }, [eventSearch, events]);

  return (
    <div className="container mx-auto px-6 py-32">
      {/* Hero Section */}
      <div className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Network Active • Sync {lastSync || 'Active'}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight">
          Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Pulse</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          The 2026 hub for proactive families. Real-time data from global platforms and upcoming 2026/27 wellness events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Trending Discussions */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                Live from Global Platforms
              </h2>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-xs font-bold uppercase tracking-tighter bg-green-500/10 px-3 py-1 rounded-lg">
                <Zap className="w-3 h-3 fill-current" /> Fast Sync Active
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {discussions.map((topic) => (
                <a 
                  href={topic.url} 
                  key={topic.id} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="bg-white/60 dark:bg-white/5 border-border hover:border-orange-500/30 transition-all duration-300 backdrop-blur-md overflow-hidden rounded-2xl shadow-lg">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
                      <div className="absolute top-0 right-0 p-4 opacity-40 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase">{topic.postedAt}</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 font-black">
                            {topic.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-black uppercase tracking-tighter">{topic.community}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors leading-tight pr-12">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                          <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {topic.replies.toLocaleString()} replies</span>
                          <span className="flex items-center gap-1.5 font-black text-orange-600/80 dark:text-orange-500/80"><Star className="w-4 h-4 fill-current" /> {topic.hotness} Activity</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:text-orange-600 group-hover:bg-orange-100 transition-all hidden md:block border border-border">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </section>

          {/* Improved Elite Mentor Section */}
          <section className="relative overflow-hidden p-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-[3rem] border-4 border-white/20 group shadow-2xl text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-md border border-white/30">
                  <ShieldCheck className="w-16 h-16 text-white animate-bounce" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase">Elite Mentor Circle</h3>
                  <p className="text-blue-100 text-lg leading-relaxed font-bold opacity-90">
                    Direct access to certified experts in digital wellness and family protection.
                  </p>
                </div>
                <Button 
                  onClick={handleApplyClick}
                  disabled={isApplied}
                  className={cn(
                    "px-12 py-8 text-xl font-black rounded-2xl shadow-2xl whitespace-nowrap transition-all hover:scale-105 active:scale-95",
                    isApplied 
                      ? "bg-green-500 text-white cursor-default hover:scale-100" 
                      : "bg-white text-blue-700 hover:bg-gray-100"
                  )}
                >
                  {isApplied ? "APPLICATION PENDING" : "APPLY TO JOIN"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer group/card">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-white border-2 border-white/30 relative">
                        {mentor.avatar}
                        {mentor.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-sm truncate">{mentor.name}</p>
                        <p className="text-[10px] text-blue-200 font-bold uppercase truncate">{mentor.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] bg-indigo-900/40 p-2 rounded-lg border border-white/10">
                      <UserCheck className="w-3 h-3 text-blue-300" />
                      <span className="font-bold text-blue-100">{mentor.specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Global Events */}
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                2026/27 Events
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Deep-indexed global resource calendar.</p>
            </div>

            {/* Event Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600" />
              <Input 
                placeholder="Search city, type, or year..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="bg-white/60 dark:bg-black/40 border-border pl-10 h-12 rounded-xl focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground animate-pulse font-bold">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground border border-dashed border-border rounded-2xl font-medium">
                  No 2026 events matching that criteria.
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-white/60 dark:bg-white/5 border-border hover:border-blue-500/20 transition-all duration-300 overflow-hidden shadow-md">
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 font-black">
                          {event.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-black uppercase">{event.date}</span>
                      </div>
                      <CardTitle className="text-lg text-foreground font-black leading-tight group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-500" /> {event.location}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium">{event.description}</p>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="ghost" className="w-full text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/10 gap-2 font-black uppercase tracking-widest text-xs h-10 border border-blue-200 dark:border-blue-500/10">
                          {event.status === 'Live Activity' ? 'Join Now' : 'Register'} <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Regional Chapters (planned) */}
          <Card className="bg-white/80 dark:bg-slate-900 border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-black">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Chapter Content Packs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                Shared game engines, localized scenarios & support links per region (no duplicate code).
              </p>
              {[
                { name: 'UAE Chapter', status: 'Planned', note: 'English + Arabic content packs; local privacy & safety scenarios' },
                { name: 'Kenya Chapter', status: 'Planned', note: 'English content pack; mobile-first & community scenarios' },
              ].map((c) => (
                <div key={c.name} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase font-black">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{c.note}</p>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground font-medium pt-1">
                Want to host a chapter in your city? <a href="mailto:hello@digitalguardianwellness.org" className="text-blue-600 dark:text-blue-400 font-black underline">Get in touch</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-blue-500/30 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Join the Elite</CardTitle>
              <CardDescription className="text-lg font-medium">Apply to become a 2026 Community Mentor.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest ml-1">Full Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Sarah Jenkins" 
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest ml-1">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="sarah@example.com" 
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-xs font-black uppercase tracking-widest ml-1">Specialty</Label>
                  <select
                    id="specialty"
                    required
                    value={formData.specialty}
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    className="h-12 w-full rounded-xl bg-muted/50 border border-border px-3 text-sm focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="" disabled>Select your specialty pillar...</option>
                    <option value="Digital Wellness / Cyber Safety">Digital Wellness / Cyber Safety</option>
                    <option value="SEN & Learning Support (LSA)">SEN & Learning Support (LSA)</option>
                    <option value="Family Support & Social Work">Family Support & Social Work</option>
                    <option value="Child & Family Mental Health">Child & Family Mental Health</option>
                    <option value="Parenting & Caregiver Support">Parenting & Caregiver Support</option>
                    <option value="Youth Mentorship & Coaching">Youth Mentorship & Coaching</option>
                    <option value="Elderly & Intergenerational Support">Elderly & Intergenerational Support</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest ml-1">Experience Summary</Label>
                  <Textarea 
                    id="bio" 
                    required 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Briefly describe your background..." 
                    className="rounded-xl bg-muted/50 border-border focus:ring-blue-500/20 min-h-[100px]"
                  />
                </div>
                
                <input type="hidden" name="g-recaptcha-response" ref={recaptchaRef} />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70"
                >
                  {isSubmitting ? "Processing Securely..." : "SUBMIT APPLICATION"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default CommunitySupport;
