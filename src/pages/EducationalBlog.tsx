import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Search,
  BookOpen,
  Filter
} from 'lucide-react';
import { toast } from "sonner";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  url: string;
  source: string;
}

const EducationalBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetch('/blog-resources.json')
      .then(res => res.json())
      .then(data => {
        setPosts(data.resources || []);
        setIsDataLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load resources:", err);
        toast.error("Failed to load resource database.");
      });
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    const lowerTerm = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowerTerm) ||
      post.category.toLowerCase().includes(lowerTerm) ||
      post.source.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, posts]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 9);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Digital Wellness Blog
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          Access our complete database of {isDataLoaded ? posts.length.toLocaleString() : '1,000+'} expert-vetted resources.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto mb-12 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" />
          <Input 
            type="text"
            placeholder="Search 1,000+ articles by topic, category, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border-white/10 text-white pl-12 h-16 text-lg rounded-2xl focus:border-green-400 focus:ring-green-400/20 backdrop-blur-xl shadow-2xl"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {['All', 'Safety', 'Health', 'Education', 'Parenting', 'Technology', 'Privacy', 'Mental Health'].map((cat) => (
            <Badge 
              key={cat}
              onClick={() => setSearchTerm(cat === 'All' ? '' : cat)}
              className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-all border ${
                (searchTerm === cat || (cat === 'All' && searchTerm === ''))
                  ? 'bg-green-500 text-black border-green-400 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 text-gray-400 text-sm flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-green-400" />
          <span>Showing <span className="text-white font-bold">{displayedPosts.length}</span> of <span className="text-white font-bold">{filteredPosts.length}</span> resources</span>
        </div>
        {searchTerm && (
          <Button variant="link" onClick={() => setSearchTerm('')} className="text-green-400 h-auto p-0">
            Clear Search
          </Button>
        )}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {displayedPosts.map((post) => (
          <Card key={post.id} className="bg-black/40 border-white/5 hover:border-green-500/30 transition-all duration-300 group flex flex-col h-full hover:shadow-2xl hover:shadow-green-900/10 backdrop-blur-md">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex justify-between items-start">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-none px-2 py-0.5 text-xs">
                  {post.category}
                </Badge>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold bg-black/40 px-2 py-1 rounded">
                  {post.source}
                </span>
              </div>
              <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors leading-tight line-clamp-2">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pb-2">
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter className="pt-2 pb-6 flex items-center justify-between border-t border-white/5 mt-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
              </div>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8 px-3 rounded-lg font-semibold flex items-center gap-1">
                  Visit <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {isDataLoaded && displayedPosts.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No matching resources found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            We couldn't find any articles matching "{searchTerm}". Try a different keyword or category.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
            className="mt-6 border-white/20 text-white hover:bg-white/10"
          >
            View All Resources
          </Button>
        </div>
      )}

      {/* Load More */}
      {displayedPosts.length < filteredPosts.length && (
        <div className="text-center">
          <Button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-12 py-6 text-lg h-auto transition-all disabled:opacity-50 min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching...
              </div>
            ) : (
              `Load More (${filteredPosts.length - displayedPosts.length} remaining)`
            )}
          </Button>
        </div>
      )}
      
      {/* Footer Info */}
      <div className="mt-24 text-center text-sm text-gray-500">
        <p>Database last updated: {new Date().toLocaleDateString()}</p>
        <p>All links are vetted by our Digital Wellness Review Board.</p>
      </div>
    </div>
  );
};

export default EducationalBlog;
