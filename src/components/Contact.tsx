
import { useState, useEffect, useRef } from "react";
import { Mail, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null); 
  const recaptchaRef = useRef<HTMLInputElement>(null);

  // Function to load reCAPTCHA script and execute it
  const getRecaptchaToken = async () => {
    console.log("Contact Form: Requesting reCAPTCHA token...");
    if (window.grecaptcha && window.grecaptcha.execute) {
      try {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        if (!siteKey) {
          console.error("Contact Form: VITE_RECAPTCHA_SITE_KEY is not configured.");
          toast.error("Security configuration error. Please contact support.");
          return null;
        }
        const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
        console.log("Contact Form: reCAPTCHA token obtained (starts with:", token.substring(0, 10), ")");
        if (recaptchaRef.current) {
          recaptchaRef.current.value = token;
        }
        return token;
      } catch (error) {
        console.error("Contact Form: reCAPTCHA execution failed:", error);
        toast.error("Security check failed. Please refresh the page and try again.");
        return null;
      }
    } else {
      console.error("Contact Form: grecaptcha not found. Script may have failed to load or domain is not authorized.");
      toast.error("Security script is still loading. Please wait a few seconds.");
      return null;
    }
  };

  const validate = (data: Record<string, FormDataEntryValue>) => {
    const newErrors: Record<string, string> = {};
    const firstName = data.firstName as string;
    const lastName = data.lastName as string;
    const email = data.email as string;
    const message = data.message as string;

    if (!firstName?.trim()) newErrors.firstName = "First name is required";
    if (!lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (!message?.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    // CRITICAL: Capture form element immediately before await to avoid React pooling issues
    const formElement = e.currentTarget;
    setIsSubmitting(true);

    const token = await getRecaptchaToken();
    if (!token) {
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(formElement);
    formData.append('g-recaptcha-response', token);

    const data = Object.fromEntries(formData.entries());

    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Contact Form: Submitting to local API...");
      const dbResponse = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!dbResponse.ok) {
        console.warn("Contact Form: Database storage failed, but continuing with Google Script submission.");
      } else {
        console.log("Contact Form: Local API submission successful.");
      }

      console.log("Contact Form: Submitting to Google Apps Script...");
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2Jk69RuNGXNLd7muFwHaUwJCNOKY1UODwBQQ1X9goIzUNlA7Lky5MM-fO-g0If9tW/exec";

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data as unknown as Record<string, string>),
      });

      console.log("Contact Form: Submission complete (no-cors).");
      toast.success("Message sent successfully!", {
        description: "We have received your message and will be in touch shortly.",
      });
      
      if (formRef.current) formRef.current.reset();
      if (recaptchaRef.current) recaptchaRef.current.value = '';
      
    } catch (error) {
      console.error("Contact Form: Submission error:", error);
      toast.error("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.grecaptcha) {
        console.log("Contact Form: reCAPTCHA initialized successfully.");
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval); 
  }, []);

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
              ref={formRef}
              onSubmit={handleSubmit}
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
                  {errors.firstName && <p className="text-xs text-red-500 mt-1 ml-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                  <Input 
                    name="lastName"
                    required
                    placeholder="Enter last name" 
                    className="bg-white/50 dark:bg-white/5 border-border text-foreground h-14 rounded-xl focus:ring-green-500/20"
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1 ml-1">{errors.lastName}</p>}
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
                {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
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
                {errors.message && <p className="text-xs text-red-500 mt-1 ml-1">{errors.message}</p>}
              </div>
              
              <input type="hidden" name="g-recaptcha-response" ref={recaptchaRef} />
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? "Processing Securely..." : "Submit Request"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4">
                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
              </p>
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
