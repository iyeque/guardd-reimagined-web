
import { CheckCircle } from "lucide-react";

export const About = () => {
  const features = [
    "Evidence-Based Approaches",
    "Family-Centered Design",
    "Age-Appropriate Content",
    "Expert-Reviewed Resources",
    "Community Support Network",
    "Ongoing Educational Updates"
  ];

  return (
    <section id="about" className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose DigitalGuard?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We believe technology should enhance family life, not complicate it. Our mission 
              is to empower families with the knowledge, tools, and support needed to create 
              healthy digital habits that last a lifetime.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-foreground text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-2xl rounded-lg"></div>
            <div className="relative bg-transparent/90 backdrop-blur-sm border border-green-200/50 rounded-lg p-8 shadow-xl">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">5+</div>
                <div className="text-muted-foreground mb-6">Years of Experience</div>
                
                <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-muted-foreground mb-6">Family Satisfaction</div>
                
                <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-muted-foreground">Community Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
