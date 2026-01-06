import React, { useState } from 'react';
import { Check, Download, FileText, Printer, Shield, Clock, Heart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FamilyDigitalAgreements: React.FC = () => {
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    "device-free-meals": true,
    "no-devices-bedroom": true,
    "ask-permission": true,
    "kind-words": true,
    "private-info": true,
    "report-bullying": true,
  });

  const toggleAgreement = (key: string) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    toast.success("Preparing agreement for printing...");
    // In a real app, this would generate a PDF or trigger window.print()
    setTimeout(() => window.print(), 1000);
  };

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Family Digital Agreement
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
          Building trust and understanding through shared promises. Customize your family's digital rules together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Screen Time & Balance */}
          <Card className="bg-black/60 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white text-2xl">Screen Time & Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgreementItem 
                id="device-free-meals"
                label="We promise to keep meal times device-free to focus on family conversation."
                checked={agreements["device-free-meals"]}
                onChange={() => toggleAgreement("device-free-meals")}
              />
              <AgreementItem 
                id="no-devices-bedroom"
                label="We will charge devices outside the bedroom overnight to ensure good sleep."
                checked={agreements["no-devices-bedroom"]}
                onChange={() => toggleAgreement("no-devices-bedroom")}
              />
              <AgreementItem 
                id="ask-permission"
                label="We will ask for permission before downloading new apps or games."
                checked={agreements["ask-permission"]}
                onChange={() => toggleAgreement("ask-permission")}
              />
            </CardContent>
          </Card>

          {/* Section 2: Safety & Privacy */}
          <Card className="bg-black/60 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-white text-2xl">Safety & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgreementItem 
                id="private-info"
                label="We will never share personal info (address, school, phone) with strangers online."
                checked={agreements["private-info"]}
                onChange={() => toggleAgreement("private-info")}
              />
              <AgreementItem 
                id="passwords"
                label="We will share passwords with parents but keep them secret from friends."
                checked={agreements["passwords"] || false}
                onChange={() => toggleAgreement("passwords")}
              />
            </CardContent>
          </Card>

          {/* Section 3: Kindness & Respect */}
          <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Heart className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white text-2xl">Kindness & Respect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgreementItem 
                id="kind-words"
                label="We will use kind words online, just as we would in person."
                checked={agreements["kind-words"]}
                onChange={() => toggleAgreement("kind-words")}
              />
              <AgreementItem 
                id="report-bullying"
                label="We will tell a parent or trusted adult if we see cyberbullying or something scary."
                checked={agreements["report-bullying"]}
                onChange={() => toggleAgreement("report-bullying")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Summary & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Your Agreement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Selected Promises:</span>
                    <span className="text-xl font-bold text-green-400">
                      {Object.values(agreements).filter(Boolean).length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Review your choices and print the agreement to sign it together as a family.
                  </p>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={handlePrint}
                      className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Printer className="h-5 w-5" />
                      Print Agreement
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 py-6 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-bold mb-2">Family Tip</h4>
                  <p className="text-sm text-gray-300">
                    Revisit this agreement every 3-6 months as your children grow and technology changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AgreementItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const AgreementItem: React.FC<AgreementItemProps> = ({ id, label, checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`
      flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border
      ${checked 
        ? 'bg-white/10 border-green-500/50' 
        : 'bg-transparent border-white/5 hover:bg-white/5'}
    `}
  >
    <div className={`
      mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
      ${checked ? 'bg-green-500 border-green-500' : 'border-gray-400'}
    `}>
      {checked && <Check className="h-4 w-4 text-white" />}
    </div>
    <span className={`text-lg ${checked ? 'text-white' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

export default FamilyDigitalAgreements;
