
import { Heart, ArrowRight, Users, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-3xl"></div>
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Nurturing
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Healthy Digital</span>
              <br />Habits for Families
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto">
              Empower your family with tools, resources, and guidance to build a balanced, 
              healthy relationship with technology. Together, we can create positive digital experiences.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-8 py-4">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 text-lg px-8 py-4">
            Explore Resources
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-6 hover:border-green-300/70 transition-all shadow-lg">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Family-Centered</h3>
            <p className="text-slate-600">Resources designed for parents, children, and families to grow together</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 hover:border-blue-300/70 transition-all shadow-lg">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Safe & Secure</h3>
            <p className="text-slate-600">Evidence-based strategies to keep your family safe online</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-xl p-6 hover:border-purple-300/70 transition-all shadow-lg">
            <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Educational</h3>
            <p className="text-slate-600">Fun, interactive learning experiences for the whole family</p>
          </div>
        </div>
      </div>
    </section>
  );
};
