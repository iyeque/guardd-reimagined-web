import { Users, Monitor, BookOpen, GamepadIcon, MessageCircle, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const Services = () => {
  const services = [
    {
      icon: Monitor,
      title: "Master Your Screen Time",
      description: "Transform your family's digital habits with practical strategies for balanced and healthy screen use. Ready to reclaim your time?",
      link: "/screen-time-management"
    },
    {
      icon: Users,
      title: "Harmonize Your Digital Home",
      description: "Create clear, collaborative family agreements that foster understanding and shared responsibility online. Start building trust today.",
      link: "/family-digital-agreements"
    },
    {
      icon: BookOpen,
      title: "Unlock Expert Digital Wisdom",
      description: "Dive into our blog for cutting-edge insights, actionable tips, and research-backed strategies to empower your family's digital journey. Explore our latest articles.",
      link: "/educational-blog"
    },
    {
      icon: GamepadIcon,
      title: "Play & Learn Safely Online",
      description: "Engage with fun, interactive games designed to build essential digital citizenship and online safety skills for all ages. Discover our game library!",
      link: "/educational-games"
    },
    {
      icon: MessageCircle,
      title: "Visual Guides for Digital Life",
      description: "Access a library of engaging video content, offering clear, concise guidance on key digital wellness topics for both parents and children. Watch and learn.",
      link: "/video-resources"
    },
    {
      icon: Heart,
      title: "Your Digital Wellness Community",
      description: "Connect with a supportive network, receive expert guidance, and find the resources you need, exactly when you need them. Join our community.",
      link: "/community-support"
    }
  ];

  return (
    <section id="resources" className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Resources for Every Family
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools and resources designed to support your family's digital wellness journey, 
            from screen time management to online safety education.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link to={service.link} key={index} className="group">
              <Card
                className="h-full bg-card/50 dark:bg-card/20 border-border hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg backdrop-blur-md"
              >
                <CardHeader>
                  <service.icon className="h-12 w-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="text-foreground text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        
      </div>
    </section>
  );
};