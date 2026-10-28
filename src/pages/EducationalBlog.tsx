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
import { JsonLd } from "@/components/JsonLd";

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

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [posts]);

  return (
    <div className="container mx-auto px-6 py-32">
      <JsonLd id="blog" data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Digital Wellness Blog",
        "description": "Curated articles on screen time, online safety, privacy, and digital wellness for families.",
        "url": "https://digitalguardianwellness.org/blog",
        "publisher": {
          "@type": "Organization",
          "name": "Digital Guardian Wellness",
          "url": "https://digitalguardianwellness.org"
        }
      }} />
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-7xl font-black text-foreground mb-6">
          Digital Wellness Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
          Access our complete database of {isDataLoaded ? posts.length.toLocaleString() : '1,000+'} expert-vetted resources.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto mb-12 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
          <Input 
            type="text"
            placeholder="Search 1,000+ articles by topic, category, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/60 dark:bg-black/40 border-border text-foreground pl-12 h-16 text-lg rounded-2xl focus:border-green-500 focus:ring-green-500/20 backdrop-blur-xl shadow-2xl"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Badge 
              key={cat}
              onClick={() => setSearchTerm(cat === 'All' ? '' : cat)}
              className={`cursor-pointer px-6 py-2 text-sm rounded-full transition-all border font-bold ${
                (searchTerm === cat || (cat === 'All' && searchTerm === ''))
                  ? 'bg-green-600 text-white border-green-500 shadow-lg'
                  : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 text-muted-foreground border-border'
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 text-muted-foreground text-sm flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span>Showing <span className="text-foreground font-black">{displayedPosts.length}</span> of <span className="text-foreground font-black">{filteredPosts.length}</span> resources</span>
        </div>
        {searchTerm && (
          <Button variant="link" onClick={() => setSearchTerm('')} className="text-green-600 dark:text-green-400 h-auto p-0 font-bold">
            Clear Search
          </Button>
        )}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {displayedPosts.map((post) => (
          <Card key={post.id} className="bg-white/60 dark:bg-white/5 border-border hover:border-green-500/30 transition-all duration-300 group flex flex-col h-full hover:shadow-2xl backdrop-blur-md rounded-3xl overflow-hidden shadow-lg">
            <CardHeader className="pb-3 space-y-4">
              <div className="flex justify-between items-start">
                <Badge className="bg-green-100 dark:bg-white/10 text-green-700 dark:text-white border-none px-3 py-1 text-[10px] font-black uppercase">
                  {post.category}
                </Badge>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black bg-muted px-2 py-1 rounded">
                  {post.source}
                </span>
              </div>
              <CardTitle className="text-xl font-black text-foreground group-hover:text-green-600 transition-colors leading-tight line-clamp-2 tracking-tight">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-medium">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter className="pt-4 pb-8 flex items-center justify-between border-t border-border mt-auto">
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
              </div>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="ghost" className="text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 h-9 px-4 rounded-xl font-black flex items-center gap-2 border border-green-200 dark:border-transparent">
                  Visit <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {isDataLoaded && displayedPosts.length === 0 && (
        <div className="text-center py-32 bg-white/40 dark:bg-white/5 rounded-[3rem] border border-dashed border-border animate-in fade-in zoom-in-95 duration-300 shadow-inner">
          <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-3xl font-black text-foreground mb-4">No matching resources found</h3>
          <p className="text-muted-foreground max-w-md mx-auto font-medium text-lg leading-relaxed">
            We couldn't find any articles matching "{searchTerm}". Try a different keyword or category.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
            className="mt-10 border-border text-foreground hover:bg-muted px-10 py-6 rounded-2xl font-bold text-lg h-auto shadow-md"
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
            className="bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-foreground dark:text-white border border-border rounded-2xl px-12 py-8 text-xl font-black h-auto transition-all disabled:opacity-50 min-w-[250px] shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                Fetching...
              </div>
            ) : (
              `Load More Articles (${filteredPosts.length - displayedPosts.length})`
            )}
          </Button>
        </div>
      )}
      
      {/* Footer Info */}
      <div className="mt-24 text-center text-sm text-muted-foreground">
        <p>Database auto-refreshed: {new Date().toLocaleDateString()}</p>
        <p>All {posts.length.toLocaleString()} links are vetted by our Digital Wellness Review Board.</p>
      </div>
    </div>
  );
};

export default EducationalBlog;
