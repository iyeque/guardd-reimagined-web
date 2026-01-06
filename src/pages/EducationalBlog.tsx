import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

const EducationalBlog: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Impact of Blue Light on Sleep",
      excerpt: "Understanding how screen exposure before bed affects your child's circadian rhythm and quality of sleep.",
      category: "Health",
      readTime: "5 min read",
      date: "Oct 12, 2025",
      image: "bg-gradient-to-br from-blue-900 to-indigo-900"
    },
    {
      id: 2,
      title: "Navigating Cyberbullying: A Parent's Guide",
      excerpt: "Recognizing the signs of cyberbullying and practical steps to take if your child is involved.",
      category: "Safety",
      readTime: "8 min read",
      date: "Oct 08, 2025",
      image: "bg-gradient-to-br from-red-900 to-pink-900"
    },
    {
      id: 3,
      title: "Top 10 Educational Apps for 2025",
      excerpt: "A curated list of apps that combine fun gameplay with genuine learning outcomes for ages 6-12.",
      category: "Education",
      readTime: "6 min read",
      date: "Sep 28, 2025",
      image: "bg-gradient-to-br from-green-900 to-emerald-900"
    },
    {
      id: 4,
      title: "Setting Healthy Boundaries for Gaming",
      excerpt: "How to manage video game time without conflict and encourage a balanced digital diet.",
      category: "Wellness",
      readTime: "7 min read",
      date: "Sep 15, 2025",
      image: "bg-gradient-to-br from-purple-900 to-violet-900"
    },
    {
      id: 5,
      title: "Social Media Readiness Checklist",
      excerpt: "Is your teen ready for social media? Use this checklist to assess maturity and safety awareness.",
      category: "Parenting",
      readTime: "10 min read",
      date: "Sep 01, 2025",
      image: "bg-gradient-to-br from-orange-900 to-yellow-900"
    },
    {
      id: 6,
      title: "Digital Footprints Explained",
      excerpt: "Teaching kids about the long-term impact of what they post and share online.",
      category: "Privacy",
      readTime: "4 min read",
      date: "Aug 22, 2025",
      image: "bg-gradient-to-br from-gray-800 to-slate-900"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Digital Wellness Blog
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          Expert insights, parenting tips, and the latest research on raising digital natives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {blogPosts.map((post) => (
          <Card key={post.id} className="bg-black/60 border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group flex flex-col h-full">
            <div className={`h-48 w-full ${post.image} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
              <Badge className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-none">
                {post.category}
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
              </div>
              <CardTitle className="text-xl text-white group-hover:text-green-400 transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-300 line-clamp-3">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-900/20 p-0 h-auto font-semibold flex items-center gap-2">
                Read Article <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-8 py-6 text-lg">
          Load More Articles
        </Button>
      </div>
    </div>
  );
};

export default EducationalBlog;
