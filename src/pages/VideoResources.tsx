import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Youtube, ExternalLink, PlayCircle } from 'lucide-react';

const VideoResources: React.FC = () => {
  const channelId = "UCCRU5NVBA7hyl18jXAICwaA";
  const uploadsPlaylistId = "UUCRU5NVBA7hyl18jXAICwaA"; // Derived from channel ID for "Uploads" playlist

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-7xl font-black text-foreground mb-6">
          Video Resources
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 font-medium">
          Watch our latest guides, tutorials, and expert interviews on digital wellness and family safety.
        </p>
        
        <a 
          href={`https://www.youtube.com/channel/${channelId}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 py-8 text-xl font-black gap-3 shadow-xl shadow-red-500/20">
            <Youtube className="h-8 w-8" />
            Visit Our YouTube Channel
          </Button>
        </a>
      </div>

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Featured / Latest Videos Player */}
        <Card className="bg-white/60 dark:bg-black/60 border-border overflow-hidden shadow-2xl backdrop-blur-md rounded-[2.5rem]">
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylistId}`}
                title="Latest Videos"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-10">
              <h2 className="text-3xl font-black text-foreground mb-4 flex items-center gap-4">
                <PlayCircle className="h-8 w-8 text-red-600" />
                Latest Uploads
              </h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                Browse our most recent videos directly from our YouTube channel. Updated weekly with new digital wellness content.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Video Categories / Placeholders (Future Expansion) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/40 dark:bg-black/40 border border-border rounded-[2rem] p-8 hover:border-red-500/30 transition-all shadow-lg backdrop-blur-md">
            <h3 className="text-2xl font-black text-foreground mb-4">Tutorials</h3>
            <p className="text-muted-foreground font-medium mb-6">Step-by-step guides on setting up parental controls and privacy settings.</p>
            <Button variant="link" className="text-red-600 dark:text-red-400 p-0 h-auto hover:text-red-700 font-bold text-lg">
              Coming Soon <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-white/40 dark:bg-black/40 border border-border rounded-[2rem] p-8 hover:border-red-500/30 transition-all shadow-lg backdrop-blur-md">
            <h3 className="text-2xl font-black text-foreground mb-4">Expert Talks</h3>
            <p className="text-muted-foreground font-medium mb-6">Interviews with child psychologists and cyber safety experts.</p>
            <Button variant="link" className="text-red-600 dark:text-red-400 p-0 h-auto hover:text-red-700 font-bold text-lg">
              Coming Soon <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-white/40 dark:bg-black/40 border border-border rounded-[2rem] p-8 hover:border-red-500/30 transition-all shadow-lg backdrop-blur-md">
            <h3 className="text-2xl font-black text-foreground mb-4">Webinars</h3>
            <p className="text-muted-foreground font-medium mb-6">Recordings of our past community workshops and Q&A sessions.</p>
            <Button variant="link" className="text-red-600 dark:text-red-400 p-0 h-auto hover:text-red-700 font-bold text-lg">
              Coming Soon <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoResources;
