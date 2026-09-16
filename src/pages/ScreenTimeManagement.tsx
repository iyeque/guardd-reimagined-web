import React, { useState, useEffect } from 'react';
import { Clock, Shield, Smartphone, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWellness } from "@/context/WellnessContext";

const ScreenTimeManagement: React.FC = () => {
  const [claims, setClaims] = useState<{slug:string;value:string;label:string;context:string}[]>([]);
  useEffect(() => {
    fetch('/api/claims').then(r => r.ok ? r.json() : []).then(data => setClaims(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);
  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-7xl font-black text-foreground mb-6">
          Master Your Screen Time
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
          Regain control of your digital life with practical strategies and tools designed for the modern family.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-foreground">Why It Matters</h2>
          <p className="text-lg text-muted-foreground leading-relaxed font-medium">
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
              <li key={index} className="flex items-center space-x-3 text-foreground font-bold">
                <div className="h-3 w-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/60 dark:bg-black/40 p-10 rounded-3xl border border-border backdrop-blur-md shadow-xl">
           <h3 className="text-2xl font-black text-foreground mb-8">Quick Stats</h3>
           <div className="space-y-8">
             <div>
               <div className="text-5xl font-black text-green-600 dark:text-green-400 mb-1 tracking-tighter">{claims.find(c => c.slug === "avg_screen_teens")?.value || "7+ Hours"}</div>
               <div className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{claims.find(c => c.slug === "avg_screen_teens")?.label || "Average daily screen time for teens"}</div>
             </div>
             <div>
               <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-1 tracking-tighter">{claims.find(c => c.slug === "parents_worry")?.value || "60%"}</div>
               <div className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{claims.find(c => c.slug === "parents_worry")?.label || "Parents worry about their kids' screen use"}</div>
             </div>
             <div>
               <div className="text-5xl font-black text-purple-600 dark:text-purple-400 mb-1 tracking-tighter">{claims.find(c => c.slug === "depression_risk")?.value || "2x"}</div>
               <div className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{claims.find(c => c.slug === "depression_risk")?.label || "Risk of depression with high social media use"}</div>
             </div>
           </div>
        </div>
      </div>

      <h2 className="text-4xl font-black text-foreground text-center mb-12">Practical Strategies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <Card className="bg-white/60 dark:bg-black/40 border-border hover:border-green-500/60 transition-all duration-300 rounded-3xl p-4 shadow-lg backdrop-blur-md">
          <CardHeader>
            <Clock className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
            <CardTitle className="text-2xl font-black text-foreground">Set Clear Limits</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground font-medium leading-relaxed">
            Establish "tech-free" times, such as during meals and one hour before bed, to encourage better habits.
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-black/40 border-border hover:border-blue-500/60 transition-all duration-300 rounded-3xl p-4 shadow-lg backdrop-blur-md">
          <CardHeader>
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
            <CardTitle className="text-2xl font-black text-foreground">Use Parental Controls</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground font-medium leading-relaxed">
            Utilize built-in settings on devices to monitor usage and set app limits appropriate for your child's age.
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-black/40 border-border hover:border-purple-500/60 transition-all duration-300 rounded-3xl p-4 shadow-lg backdrop-blur-md">
          <CardHeader>
            <Zap className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
            <CardTitle className="text-2xl font-black text-foreground">Model Good Behavior</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground font-medium leading-relaxed">
            Children learn by watching. Demonstrate healthy screen habits by being present and putting your own phone away.
          </CardContent>
        </Card>
      </div>

      <div className="text-center bg-gradient-to-br from-green-500/10 to-blue-500/10 p-16 rounded-[3rem] border border-border shadow-2xl backdrop-blur-md">
        <Smartphone className="h-20 w-20 text-green-600 dark:text-white mx-auto mb-8 animate-bounce" />
        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">Ready to Take Action?</h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Create a customized plan for your family with our interactive Digital Agreement tool.
        </p>
        <Link to="/family-digital-agreements">
          <Button className="bg-green-600 dark:bg-green-500 hover:bg-green-700 text-white text-xl px-12 py-8 rounded-2xl font-black shadow-xl shadow-green-500/20">
            Create Family Agreement
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ScreenTimeManagement;
