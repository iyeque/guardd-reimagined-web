import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  Heart, 
  Star, 
  ArrowRight, 
  Search, 
  MapPin, 
  ExternalLink,
  Globe,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const CommunitySupport: React.FC = () => {
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [discussions, setDiscussions] = useState<TrendingDiscussion[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [liveUsers, setLiveUsers] = useState(2542);

  useEffect(() => {
    fetch('/community-data.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setDiscussions(data.discussions || []);
        setIsLoading(false);
      });

    // Simulate real-time user fluctuation
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5 - 2));
    }, 3000);
    return () => clearInterval(interval);
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
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Live Network Active • 2026 Season
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

          {/* Call to Action - Mentor Program */}
          <section className="relative overflow-hidden p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-[2.5rem] border border-border group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="relative flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
              <div className="p-6 bg-blue-100 dark:bg-blue-500/20 rounded-3xl border border-blue-200 dark:border-blue-500/30">
                <Heart className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-3xl font-black text-foreground italic tracking-tighter uppercase">Elite Mentor Circle</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  Join our exclusive 2026 circle of 12 community leaders. Share your experience and shape the future of digital parenting.
                </p>
              </div>
              <Button className="bg-foreground text-background hover:opacity-90 px-10 py-7 text-lg font-black rounded-2xl shadow-xl whitespace-nowrap">
                JOIN 2026 COHORT
              </Button>
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

          {/* Live Stats */}
          <Card className="bg-white/80 dark:bg-slate-900 border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-black">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-black text-foreground">{liveUsers.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  Families Active
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-3xl font-black text-green-600 dark:text-green-400">12</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Experts Online</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
