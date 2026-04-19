import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  Clock,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { toast } from "sonner";
import { Link, useLocation } from 'react-router-dom';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface Application {
  id: number;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  status: string;
  createdAt: string;
}

const Admin: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const adminKey = queryParams.get('key');

  const [messages, setMessages] = useState<Message[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchAdminData = async () => {
    if (!adminKey) {
      setAuthError(true);
      setIsLoading(false);
      return;
    }

    try {
      const [msgRes, appRes] = await Promise.all([
        fetch(`/api/admin/messages?key=${adminKey}`),
        fetch(`/api/admin/applications?key=${adminKey}`)
      ]);

      if (msgRes.status === 401 || appRes.status === 401) {
        setAuthError(true);
        return;
      }

      const [msgData, appData] = await Promise.all([
        msgRes.json(),
        appRes.json()
      ]);
      setMessages(msgData);
      setApplications(appData);
    } catch (error) {
      console.error("Admin fetch failed", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/community/sync?key=${adminKey}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success("Community Data Synced!", {
          description: `Last sync: ${new Date(data.lastSync).toLocaleTimeString()}`
        });
        // Refresh the view
        fetchAdminData();
      } else {
        throw new Error(data.error || "Sync failed with unknown error");
      }
    } catch (error: any) {
      toast.error("Sync failed", {
        description: error.message || "Please check server logs for details."
      });
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-6 text-center">
        <Shield className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4 text-foreground">Access Denied</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          You must provide a valid admin key in the URL to access this dashboard.
        </p>
        <Link to="/" className="mt-8">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-4">
            <Shield className="w-10 h-10 text-blue-600" />
            Admin <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">Manage your community and communications.</p>
        </div>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl flex items-center gap-3 transition-all hover:scale-105"
        >
          <RefreshCw className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "SYNCING..." : "SYNC COMMUNITY DATA"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Messages */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Contact Inquiries ({messages.length})
          </h2>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <Card className="bg-white/40 dark:bg-white/5 border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground font-medium">
                  No messages received yet.
                </CardContent>
              </Card>
            ) : (
              messages.map((msg) => (
                <Card key={msg.id} className="bg-white/60 dark:bg-white/5 border-border hover:border-green-500/20 transition-all shadow-lg rounded-2xl">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">{msg.name}</CardTitle>
                        <CardDescription className="text-sm font-bold text-blue-600">{msg.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-muted-foreground bg-muted/30 p-4 rounded-xl italic leading-relaxed">
                      "{msg.message}"
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Mentor Applications */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            Mentor Applications ({applications.length})
          </h2>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="bg-white/40 dark:bg-white/5 border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground font-medium">
                  No applications received yet.
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <Card key={app.id} className="bg-white/60 dark:bg-white/5 border-border hover:border-purple-500/20 transition-all shadow-lg rounded-2xl overflow-hidden">
                  <div className="bg-purple-600 h-2 w-full" />
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">{app.name}</CardTitle>
                        <CardDescription className="text-sm font-bold text-blue-600">{app.email}</CardDescription>
                        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-black mt-2">
                          {app.specialty}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-black uppercase text-[10px]">
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-4">
                    <div className="text-muted-foreground font-medium text-sm">
                      <span className="text-foreground font-black uppercase text-[10px] block mb-1">Background:</span>
                      {app.bio}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 font-bold">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg flex items-center gap-1 font-bold">
                        <Trash2 className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
