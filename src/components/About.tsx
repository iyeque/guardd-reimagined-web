
import { CheckCircle } from "lucide-react";

export const About = () => {
  const features = [
    "ISO 27001 Certified Security Standards",
    "24/7 Security Operations Center (SOC)",
    "AI-Powered Threat Detection",
    "Zero-Trust Security Architecture",
    "Compliance with GDPR, HIPAA, PCI DSS",
    "Expert Cybersecurity Consultants"
  ];

  return (
    <section id="about" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose DigitalGuard?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              With over a decade of experience in cybersecurity, we've protected thousands 
              of organizations from cyber threats. Our cutting-edge technology and expert 
              team ensure your digital assets remain secure.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-2xl rounded-lg"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-cyan-400 mb-2">15+</div>
                <div className="text-gray-300 mb-6">Years of Excellence</div>
                
                <div className="text-4xl font-bold text-cyan-400 mb-2">Zero</div>
                <div className="text-gray-300 mb-6">Successful Breaches</div>
                
                <div className="text-4xl font-bold text-cyan-400 mb-2">50ms</div>
                <div className="text-gray-300">Average Detection Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
