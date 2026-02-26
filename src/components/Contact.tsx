
import { Mail, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Let's Connect
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about digital wellness? Need support for your family's journey? 
            We're here to help every step of the way.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight">Send a Message</h3>
            <p className="text-muted-foreground mb-8 font-medium italic">We typically respond within 24 hours.</p>
            
            <form 
              action="https://formspree.io/f/mqaebrjr" 
              method="POST"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                  <Input 
                    name="firstName"
                    required
                    placeholder="Enter first name" 
                    className="bg-white/50 dark:bg-white/5 border-border text-foreground h-14 rounded-xl focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                  <Input 
                    name="lastName"
                    required
                    placeholder="Enter last name" 
                    className="bg-white/50 dark:bg-white/5 border-border text-foreground h-14 rounded-xl focus:ring-green-500/20"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <Input 
                  name="email"
                  required
                  placeholder="name@example.com" 
                  type="email"
                  className="bg-white/50 dark:bg-white/5 border-border text-foreground h-14 rounded-xl focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                <Textarea 
                  name="message"
                  required
                  placeholder="How can we help your family today?"
                  rows={5}
                  className="bg-white/50 dark:bg-white/5 border-border text-foreground rounded-2xl focus:ring-green-500/20 p-4"
                />
              </div>

              <input type="hidden" name="_subject" value="New Contact Form Submission - DigitalGuard" />
              
              <Button type="submit" className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Submit Request
              </Button>
            </form>
          </div>
          
          <div className="space-y-8" id="support">
            <div className="bg-white/90 dark:bg-slate-900/90 border border-green-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-foreground text-lg font-bold">Middle East Support</h3>
                  <p className="text-muted-foreground text-sm">UAE: Call <strong>116111</strong> (Child Protection)</p>
                  <p className="text-muted-foreground text-sm">Saudi Arabia: <strong>116111</strong> | Jordan: <strong>110</strong></p>
                  <p className="text-muted-foreground text-sm">Egypt: <strong>16000</strong> | Qatar: <strong>919</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 border border-blue-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-foreground text-lg font-bold">Crisis & 988 Lifeline</h3>
                  <p className="text-muted-foreground text-sm">USA/Canada: Call or Text <strong>988</strong></p>
                  <p className="text-muted-foreground text-sm">Text <strong>HOME</strong> to <strong>741741</strong></p>
                  <p className="text-muted-foreground text-sm">UK: Text <strong>85258</strong> | Ireland: <strong>50808</strong></p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 dark:bg-slate-900/90 border border-purple-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-foreground text-lg font-bold">Childhelp Hotline</h3>
                  <p className="text-muted-foreground text-sm">Call <strong>1-800-4-A-CHILD</strong> (1-800-422-4453)</p>
                  <p className="text-muted-foreground text-sm">Serving the USA and Canada</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-300/30 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-foreground text-xl font-bold mb-2">Global Help Resources</h3>
              <p className="text-muted-foreground mb-4 font-medium">
                Access a worldwide network of helplines for children and families.
              </p>
              <a href="https://www.childhelplineinternational.org/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#4FD1C5] hover:bg-[#38B2AC] text-white font-bold rounded-xl shadow-lg">
                  Find Your Local Hotline
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
