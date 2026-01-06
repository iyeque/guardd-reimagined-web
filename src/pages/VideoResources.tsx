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
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Video Resources
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
          Watch our latest guides, tutorials, and expert interviews on digital wellness and family safety.
        </p>
        
        <a 
          href={`https://www.youtube.com/channel/${channelId}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg gap-2">
            <Youtube className="h-6 w-6" />
            Visit Our YouTube Channel
          </Button>
        </a>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Featured / Latest Videos Player */}
        <Card className="bg-black/60 border-red-500/30 overflow-hidden shadow-2xl shadow-red-900/10 backdrop-blur-sm">
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
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-red-500" />
                Latest Uploads
              </h2>
              <p className="text-gray-300">
                Browse our most recent videos directly from our YouTube channel.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Video Categories / Placeholders (Future Expansion) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Tutorials</h3>
            <p className="text-gray-400 text-sm mb-4">Step-by-step guides on setting up parental controls and privacy settings.</p>
            <Button variant="link" className="text-red-400 p-0 h-auto hover:text-red-300">
              Coming Soon <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Expert Talks</h3>
            <p className="text-gray-400 text-sm mb-4">Interviews with child psychologists and cyber safety experts.</p>
            <Button variant="link" className="text-red-400 p-0 h-auto hover:text-red-300">
              Coming Soon <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Webinars</h3>
            <p className="text-gray-400 text-sm mb-4">Recordings of our past community workshops and Q&A sessions.</p>
            <Button variant="link" className="text-red-400 p-0 h-auto hover:text-red-300">
              Coming Soon <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoResources;
