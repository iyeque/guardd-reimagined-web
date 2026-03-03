import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Youtube, ExternalLink, PlayCircle, ShieldCheck, Users, GraduationCap, Clock, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Video {
  id: string;
  ytId: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
  category: string;
}

interface VideoCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  videos: Video[];
}

const VideoResources: React.FC = () => {
  const channelId = "UCCRU5NVBA7hyl18jXAICwaA";
  
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [requestTopic, setRequestTopic] = useState("");
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [featuredUrl, setFeaturedUrl] = useState("qwUSyXCnAGs");
  const [isLoading, setIsLoading] = useState(true);
  const [adblockSuspected, setAdblockSuspected] = useState(false);

  const extractVideoId = (url: string) => {
    if (!url) return "";
    if (url.length === 11 && !url.includes("/") && !url.includes("?")) return url;
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id || url;
      }
      if (host.endsWith("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v && v.length === 11) return v;
        const parts = u.pathname.split("/").filter(Boolean);
        const embedIdx = parts.indexOf("embed");
        if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
        const shortsIdx = parts.indexOf("shorts");
        if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
      }
      return url;
    } catch {
      return url;
    }
  };

  const getEmbedUrl = (url: string) => {
    const id = extractVideoId(url);
    const base = adblockSuspected ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
    return `${base}/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  };

  const getWatchUrl = (url: string) => {
    const id = extractVideoId(url);
    return `https://www.youtube.com/watch?v=${id}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}video-resources.json`);
        const data = await response.json();
        setCategories(data.categories || []);
        if (data.featuredVideoId) setFeaturedUrl(data.featuredVideoId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching video resources:', error);
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    let cleared = false;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    const timer = window.setTimeout(() => {
      if (!cleared) setAdblockSuspected(true);
    }, 4000);
    s.onload = () => {
      window.clearTimeout(timer);
    };
    s.onerror = () => {
      window.clearTimeout(timer);
      setAdblockSuspected(true);
    };
    document.head.appendChild(s);
    return () => {
      cleared = true;
      window.clearTimeout(timer);
      s.remove();
    };
  }, []);

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed!", {
      description: "You'll receive the latest digital wellness guides every Friday.",
    });
    setEmail("");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Request Received!", {
      description: `We've added "${requestTopic}" to our production queue. You'll be notified if we create this tutorial!`,
    });
    setIsRequestModalOpen(false);
    setRequestTopic("");
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="h-8 w-8 text-red-600" />;
      case 'GraduationCap': return <GraduationCap className="h-8 w-8 text-red-600" />;
      case 'Users': return <Users className="h-8 w-8 text-red-600" />;
      default: return <PlayCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const VideoCard = ({ video }: { video: Video }) => {
    const vId = extractVideoId(video.ytId);
    return (
      <Card 
        key={video.id} 
        className="bg-white/60 dark:bg-slate-900/60 border-border hover:border-red-500/30 transition-all duration-300 group cursor-pointer backdrop-blur-md rounded-3xl overflow-hidden shadow-lg flex flex-col h-full min-w-[300px] md:min-w-[350px] snap-start"
        onClick={() => setSelectedVideo({id: video.ytId, title: video.title})}
      >
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
          <img 
            src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800';
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
             <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-all drop-shadow-2xl scale-90 group-hover:scale-100" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
            <Clock className="w-3 h-3" /> {video.duration}
          </div>
        </div>
        <CardHeader className="p-6 flex-grow">
          <div className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {video.category}
          </div>
          <CardTitle className="text-xl font-black text-foreground group-hover:text-red-600 transition-colors leading-tight line-clamp-2">{video.title}</CardTitle>
          <CardDescription className="text-sm font-medium mt-3 line-clamp-2 leading-relaxed">{video.description}</CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 mt-auto">
          <Button variant="ghost" className="w-full text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 font-black flex items-center gap-2 group/btn">
             WATCH NOW <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    );
  };

  const HorizontalScroll = ({ category }: { category: VideoCategory }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <section key={category.id} className="space-y-8 relative">
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-4">
            {getIcon(category.icon)}
            <h2 className="text-3xl font-black text-foreground uppercase italic">{category.title}</h2>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="rounded-full border-border bg-white/50 dark:bg-black/50" onClick={() => scroll('left')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full border-border bg-white/50 dark:bg-black/50" onClick={() => scroll('right')}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {category.videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </section>
    );
  };

  const channelThumbnails = [
    { url: 'https://youtu.be/76C7tauF-oI', title: 'Digital Guardian Guide' },
    { url: 'https://youtu.be/YW4N-wdiwe8', title: 'Email Security' },
    { url: 'https://youtu.be/QZsqRG14UyE', title: 'YourSixOS Demo' },
    { url: 'https://youtu.be/JhoDgE31eNQ', title: 'Google Family Link' },
    { url: 'https://youtu.be/OiIX2Jzjhko', title: 'Router Safety' },
    { url: 'https://youtu.be/2ccUPADdBWk', title: 'Digital Trust' },
  ];

  return (
    <div className="container mx-auto px-6 py-32">
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedVideo(null)}>
           <button onClick={() => setSelectedVideo(null)} className="absolute top-8 right-8 text-white/60 hover:text-white p-2 z-[210]">
             <X className="w-10 h-10" />
           </button>
           <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative" onClick={e => e.stopPropagation()}>
             {adblockSuspected && (
               <a
                 href={getWatchUrl(selectedVideo.id)}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="absolute z-[215] top-4 left-4 bg-white/90 text-black font-black text-xs px-3 py-2 rounded-full hover:bg-white"
               >
                 Open on YouTube
               </a>
             )}
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(selectedVideo.id)}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                onError={() => setAdblockSuspected(true)}
              ></iframe>
           </div>
        </div>
      )}

      {/* Request Tutorial Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-red-500/30 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Request Topic</CardTitle>
              <CardDescription className="text-lg font-medium">What digital safety guide should we create next?</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1">Topic or Device</label>
                  <input 
                    required 
                    value={requestTopic}
                    onChange={e => setRequestTopic(e.target.value)}
                    placeholder="e.g. Setting up Discord for kids" 
                    className="w-full h-14 px-4 rounded-xl bg-muted/50 border-border focus:ring-red-500/20 outline-none border-2 focus:border-red-500/50 transition-all font-bold"
                  />
                </div>
                <Button type="submit" className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                  SUBMIT REQUEST
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          <PlayCircle className="w-3 h-3" />
          On-Demand Learning Hub
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight">
          Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-500">Academy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          Expert guides, tutorials, and deep-dive interviews curated to help your family flourish in the digital age.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`https://www.youtube.com/channel/${channelId}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 py-8 text-xl font-black gap-3 shadow-xl shadow-red-500/20">
              <Youtube className="h-8 w-8" />
              Visit Channel
            </Button>
          </a>
          <Button 
            variant="outline" 
            className="border-border text-foreground hover:bg-muted rounded-2xl px-10 py-8 text-xl font-black gap-3 shadow-lg"
            onClick={() => setIsRequestModalOpen(true)}
          >
             Request a Tutorial
          </Button>
        </div>
      </div>

      <div className="space-y-24">
        {/* Main Featured Video from Official Channel */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                 <PlayCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-foreground italic uppercase">Featured Video</h2>
                 <p className="text-muted-foreground font-medium">Direct training from our Digital Guardian library.</p>
              </div>
           </div>
           {adblockSuspected && (
             <div className="mb-4 px-4 py-3 rounded-2xl bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold">
               Video playback may be blocked by an ad blocker. Whitelist youtube.com and youtube-nocookie.com or use the Open on YouTube option.
             </div>
           )}
           <Card className="bg-white/60 dark:bg-slate-900/40 border-border overflow-hidden shadow-2xl backdrop-blur-xl rounded-[3rem] border-2 border-red-500/10">
            <CardContent className="p-0">
              <div className="aspect-video w-full bg-slate-950">
                <iframe
                  className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                  src={getEmbedUrl(featuredUrl)}
                  title="Featured Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onError={() => setAdblockSuspected(true)}
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Thumbnails from the same channel */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {channelThumbnails.map(thumb => {
               const vId = extractVideoId(thumb.url);
               return (
                 <div 
                   key={vId} 
                   className="aspect-video rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all group relative"
                   onClick={() => setSelectedVideo({id: thumb.url, title: thumb.title})}
                 >
                    <img 
                      src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`} 
                      className="w-full h-full object-cover" 
                      alt={thumb.title} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <PlayCircle className="text-white w-8 h-8" />
                    </div>
                 </div>
               );
             })}
          </div>
        </section>

        {/* Dynamic Categorized Sections with Horizontal Scroll */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground font-bold animate-pulse uppercase tracking-widest">Loading Academy resources...</div>
        ) : (
          categories.map((category) => (
            <HorizontalScroll key={category.id} category={category} />
          ))
        )}
      </div>
      
      {/* Newsletter / CTA */}
      <Card className="mt-32 bg-gradient-to-br from-red-600 to-red-800 rounded-[4rem] p-16 text-center text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
         <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Stay Updated</h2>
            <p className="text-xl font-bold opacity-90 leading-relaxed">
              New tutorials and expert interviews are added every Friday. Subscribe to get the latest guides delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="flex-1 h-16 rounded-2xl bg-white/20 border border-white/30 px-6 text-lg font-bold placeholder:text-white/60 focus:outline-none focus:ring-4 focus:ring-white/20"
               />
               <Button 
                 onClick={handleSubscribe}
                 className="h-16 px-12 bg-white text-red-700 hover:bg-red-50 font-black text-xl rounded-2xl shadow-2xl transition-transform hover:scale-105"
               >
                 SUBSCRIBE
               </Button>
            </div>
         </div>
      </Card>
    </div>
  );
};

export default VideoResources;
