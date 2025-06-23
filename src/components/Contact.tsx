
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to secure your digital infrastructure? Contact our cybersecurity 
            experts for a free consultation and security assessment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-slate-800/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  className="bg-slate-700/50 border-cyan-500/20 text-white placeholder:text-gray-400"
                />
                <Input 
                  placeholder="Last Name" 
                  className="bg-slate-700/50 border-cyan-500/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Input 
                placeholder="Email Address" 
                type="email"
                className="bg-slate-700/50 border-cyan-500/20 text-white placeholder:text-gray-400"
              />
              <Input 
                placeholder="Company Name" 
                className="bg-slate-700/50 border-cyan-500/20 text-white placeholder:text-gray-400"
              />
              <Textarea 
                placeholder="Tell us about your security needs..."
                rows={5}
                className="bg-slate-700/50 border-cyan-500/20 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                Request Free Consultation
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Mail className="h-8 w-8 text-cyan-400" />
                <div>
                  <h3 className="text-white text-lg font-semibold">Email Us</h3>
                  <p className="text-gray-300">security@digitalguard.com</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Phone className="h-8 w-8 text-cyan-400" />
                <div>
                  <h3 className="text-white text-lg font-semibold">Call Us</h3>
                  <p className="text-gray-300">+1 (555) 123-SECURE</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <MapPin className="h-8 w-8 text-cyan-400" />
                <div>
                  <h3 className="text-white text-lg font-semibold">Visit Us</h3>
                  <p className="text-gray-300">123 Cyber Security Blvd<br />Tech District, CA 90210</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-2">Emergency Response</h3>
              <p className="text-gray-300 mb-4">
                Experiencing a security incident? Our emergency response team is available 24/7.
              </p>
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                Emergency Hotline: +1 (555) 911-HACK
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
