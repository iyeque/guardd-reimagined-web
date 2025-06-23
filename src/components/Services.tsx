
import { Shield, Server, Users, Zap, FileCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Services = () => {
  const services = [
    {
      icon: Shield,
      title: "Endpoint Protection",
      description: "Comprehensive security for all your devices and endpoints with real-time threat detection."
    },
    {
      icon: Server,
      title: "Network Security",
      description: "Advanced firewall and network monitoring to prevent unauthorized access and data breaches."
    },
    {
      icon: Users,
      title: "Identity Management",
      description: "Secure user authentication and access control with multi-factor authentication."
    },
    {
      icon: Zap,
      title: "Incident Response",
      description: "Rapid response team to contain and mitigate security incidents before they escalate."
    },
    {
      icon: FileCheck,
      title: "Compliance Auditing",
      description: "Ensure your organization meets industry standards and regulatory requirements."
    },
    {
      icon: AlertTriangle,
      title: "Vulnerability Assessment",
      description: "Regular security assessments to identify and address potential weaknesses."
    }
  ];

  return (
    <section id="services" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Security Solutions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive cybersecurity services designed to protect your business 
            from the most sophisticated threats in today's digital landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              <CardHeader>
                <service.icon className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle className="text-white text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base">
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
