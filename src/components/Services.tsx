
import { Users, Monitor, BookOpen, GamepadIcon, MessageCircle, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Services = () => {
  const services = [
    {
      icon: Monitor,
      title: "Screen Time Management",
      description: "Learn healthy boundaries and create balanced screen time routines that work for your family."
    },
    {
      icon: Users,
      title: "Family Digital Agreements",
      description: "Build collaborative agreements that help everyone understand expectations and responsibilities."
    },
    {
      icon: BookOpen,
      title: "Educational Blog",
      description: "Expert insights, tips, and research-backed strategies for digital wellness and family safety."
    },
    {
      icon: GamepadIcon,
      title: "Interactive Games",
      description: "Fun, educational games that teach digital citizenship and online safety skills."
    },
    {
      icon: MessageCircle,
      title: "Video Resources",
      description: "Engaging video content covering digital wellness topics for parents and children."
    },
    {
      icon: Heart,
      title: "Ongoing Support",
      description: "Access to community support, expert guidance, and resources when you need them most."
    }
  ];

  return (
    <section id="resources" className="py-20 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Resources for Every Family
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive tools and resources designed to support your family's digital wellness journey, 
            from screen time management to online safety education.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-white/80 border-green-200/50 hover:border-green-300/70 transition-all hover:shadow-lg">
              <CardHeader>
                <service.icon className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-slate-800 text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 text-base">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
