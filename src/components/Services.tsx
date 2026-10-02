import { Users, Monitor, BookOpen, GamepadIcon, MessageCircle, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BreathingButton } from "./wellness/BreathingButton";
import { useWellness } from "@/context/WellnessContext";

export const Services = () => {
  const { mode } = useWellness();
  
  const services = [
    {
      icon: Monitor,
      title: "Master Your Screen Time",
      description: "Transform your family's digital habits with practical strategies for balanced and healthy screen use. Ready to reclaim your time?",
      link: "/screen-time",
      tags: ['parent', 'family']
    },
    {
      icon: Users,
      title: "Harmonize Your Digital Home",
      description: "Create clear, collaborative family agreements that foster understanding and shared responsibility online. Start building trust today.",
      link: "/family-agreements",
      tags: ['parent', 'family']
    },
    {
      icon: BookOpen,
      title: "Unlock Expert Digital Wisdom",
      description: "Dive into our blog for cutting-edge insights, actionable tips, and research-backed strategies to empower your family's digital journey. Explore our latest articles.",
      link: "/blog",
      tags: ['parent', 'child', 'family']
    },
    {
      icon: GamepadIcon,
      title: "Play & Learn Safely Online",
      description: "Engage with fun, interactive games designed to build essential digital citizenship and online safety skills for all ages. Discover our game library!",
      link: "/games",
      tags: ['child', 'family']
    },
    {
      icon: MessageCircle,
      title: "Visual Guides for Digital Life",
      description: "Access a library of engaging video content, offering clear, concise guidance on key digital wellness topics for both parents and children. Watch and learn.",
      link: "/videos",
      tags: ['child', 'parent', 'family']
    },
    {
      icon: Heart,
      title: "Your Digital Wellness Community",
      description: "Connect with a supportive network, receive expert guidance, and find the resources you need, exactly when you need them. Join our community.",
      link: "/community",
      tags: ['parent', 'family']
    }
  ];

  const filteredServices = services.filter(s => s.tags.includes(mode));

  return (
    <section id="resources" className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {mode === 'child' ? 'Fun Things to Do!' : 'Resources for Your Family'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {mode === 'child' 
              ? 'Check out these games and videos made just for you to learn about the internet!' 
              : 'Comprehensive tools and resources designed to support your family\'s digital wellness journey.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredServices.map((service, index) => (
            <Link to={service.link} key={index} className="group">
              <Card
                className={`h-full border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg backdrop-blur-md ${
                   mode === 'child' 
                   ? 'bg-white/60 dark:bg-white/10 border-orange-300 dark:border-orange-400/20 hover:border-orange-500' 
                   : 'bg-white/60 dark:bg-card/20 hover:border-cyan-500/50'
                }`}
              >
                <CardHeader>
                  <service.icon className={`h-12 w-12 mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    mode === 'child' ? 'text-orange-600 dark:text-orange-400' : 'text-cyan-600 dark:text-cyan-500'
                  }`} />
                  <CardTitle className="text-foreground text-xl font-bold tracking-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link to="/workshop" data-tour="workshop-cta">
            <BreathingButton>
              {mode === 'child' ? 'Start Your First Adventure' : 'View All Tools & Workshops'}
            </BreathingButton>
          </Link>
        </div>
      </div>
    </section>
  );
};