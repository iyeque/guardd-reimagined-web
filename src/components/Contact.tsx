
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Let's Connect
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions about digital wellness? Need support for your family's journey? 
            We're here to help every step of the way.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-white/90 border-green-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-800 text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  className="bg-white border-green-200 text-slate-800 placeholder:text-slate-400"
                />
                <Input 
                  placeholder="Last Name" 
                  className="bg-white border-green-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <Input 
                placeholder="Email Address" 
                type="email"
                className="bg-white border-green-200 text-slate-800 placeholder:text-slate-400"
              />
              <Input 
                placeholder="Family Size (optional)" 
                className="bg-white border-green-200 text-slate-800 placeholder:text-slate-400"
              />
              <Textarea 
                placeholder="How can we help your family's digital wellness journey?"
                rows={5}
                className="bg-white border-green-200 text-slate-800 placeholder:text-slate-400"
              />
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                Start the Conversation
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-8" id="support">
            <div className="bg-white/90 border border-green-200/50 rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-slate-800 text-lg font-semibold">Email Support</h3>
                  <p className="text-slate-600">hello@digitalguard.com</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 border border-blue-200/50 rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-slate-800 text-lg font-semibold">Family Support</h3>
                  <p className="text-slate-600">+1 (555) 123-FAMILY</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 border border-purple-200/50 rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-slate-800 text-lg font-semibold">Visit Us</h3>
                  <p className="text-slate-600">123 Family Wellness Center<br />Community District, CA 90210</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-300/50 rounded-lg p-6">
              <h3 className="text-slate-800 text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-slate-600 mb-4">
                Join our community of families supporting each other on their digital wellness journey.
              </p>
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                Join Our Community
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
