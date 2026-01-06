import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Users, Heart, Star, ArrowRight } from 'lucide-react';

const CommunitySupport: React.FC = () => {
  const forumTopics = [
    {
      id: 1,
      title: "Managing Screen Time for Teens",
      author: "Sarah J.",
      replies: 24,
      tag: "Parenting",
      hot: true
    },
    {
      id: 2,
      title: "Best Parental Control Apps 2024",
      author: "Mike T.",
      replies: 156,
      tag: "Tech Reviews",
      hot: true
    },
    {
      id: 3,
      title: "Dealing with Cyberbullying: A Guide",
      author: "Dr. Emily R.",
      replies: 42,
      tag: "Safety",
      hot: false
    },
    {
      id: 4,
      title: "Digital Detox Weekend Ideas",
      author: "WellnessMom",
      replies: 18,
      tag: "Lifestyle",
      hot: false
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Cyber Safety Workshop for Parents",
      date: "Jan 15, 2024",
      time: "7:00 PM EST",
      type: "Webinar"
    },
    {
      id: 2,
      title: "Q&A with Child Psychologist",
      date: "Jan 22, 2024",
      time: "6:00 PM EST",
      type: "Live Stream"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Community Hub
        </h1>
        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
          Connect with other families, share experiences, and get expert advice on navigating the digital world together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Discussion Forums */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Trending Discussions
              </h2>
              <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
                New Topic
              </Button>
            </div>
            
            <div className="space-y-4">
              {forumTopics.map((topic) => (
                <Card key={topic.id} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                            {topic.tag}
                          </Badge>
                          {topic.hot && (
                            <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                              <Star className="w-3 h-3 fill-current" /> Hot Topic
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Started by <span className="text-gray-300">{topic.author}</span> • {topic.replies} replies
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Volunteer Section */}
          <section className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Heart className="w-8 h-8 text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Become a Community Mentor</h3>
                <p className="text-gray-300">
                  Share your knowledge and help other parents navigate digital safety challenges.
                </p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px]">
                Join Program
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column - Events & Stats */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </p>
                  <Button size="sm" variant="link" className="text-blue-400 p-0 h-auto mt-2 hover:text-blue-300">
                    Register Now →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-white">2.5k+</div>
                  <div className="text-xs text-gray-400">Active Families</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-white">150+</div>
                  <div className="text-xs text-gray-400">Expert Articles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunitySupport;
