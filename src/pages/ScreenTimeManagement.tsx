import React from 'react';
import { Clock, Shield, Smartphone, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ScreenTimeManagement: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Master Your Screen Time
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          Regain control of your digital life with practical strategies and tools designed for the modern family.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Why It Matters</h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            Excessive screen time is linked to sleep disturbances, reduced physical activity, and lower academic performance. 
            By managing screen time effectively, families can create space for meaningful connection, outdoor play, and restful sleep.
          </p>
          <ul className="space-y-4">
            {[
              "Improved Sleep Quality",
              "Better Focus and Attention",
              "Enhanced Social Skills",
              "Reduced Anxiety and Stress"
            ].map((item, index) => (
              <li key={index} className="flex items-center space-x-3 text-gray-200">
                <div className="h-2 w-2 bg-green-400 rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-black/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
           <h3 className="text-2xl font-bold text-white mb-6">Quick Stats</h3>
           <div className="space-y-6">
             <div>
               <div className="text-4xl font-bold text-green-400 mb-1">7+ Hours</div>
               <div className="text-gray-300">Average daily screen time for teens</div>
             </div>
             <div>
               <div className="text-4xl font-bold text-blue-400 mb-1">60%</div>
               <div className="text-gray-300">Parents worry about their kids' screen use</div>
             </div>
             <div>
               <div className="text-4xl font-bold text-purple-400 mb-1">2x</div>
               <div className="text-gray-300">Risk of depression with high social media use</div>
             </div>
           </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white text-center mb-12">Practical Strategies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <Card className="bg-black/60 border-green-500/30 hover:border-green-500/60 transition-all duration-300">
          <CardHeader>
            <Clock className="h-10 w-10 text-green-400 mb-4" />
            <CardTitle className="text-white">Set Clear Limits</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            Establish "tech-free" times, such as during meals and one hour before bed, to encourage better habits.
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
          <CardHeader>
            <Shield className="h-10 w-10 text-blue-400 mb-4" />
            <CardTitle className="text-white">Use Parental Controls</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            Utilize built-in settings on devices to monitor usage and set app limits appropriate for your child's age.
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
          <CardHeader>
            <Zap className="h-10 w-10 text-purple-400 mb-4" />
            <CardTitle className="text-white">Model Good Behavior</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            Children learn by watching. Demonstrate healthy screen habits by being present and putting your own phone away.
          </CardContent>
        </Card>
      </div>

      <div className="text-center bg-gradient-to-r from-green-900/40 to-blue-900/40 p-12 rounded-3xl border border-white/10">
        <Smartphone className="h-16 w-16 text-white mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Action?</h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Create a customized plan for your family with our interactive Digital Agreement tool.
        </p>
        <Link to="/family-digital-agreements">
          <Button className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6 rounded-full">
            Create Family Agreement
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ScreenTimeManagement;
