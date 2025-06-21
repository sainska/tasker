
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Shield, CheckCircle, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/auth';
    
    switch (profile.role) {
      case 'admin': return '/admin-dashboard';
      case 'writer': return '/writer-dashboard';
      case 'client': return '/client-dashboard';
      default: return '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Tasker</h1>
          </div>
          <nav className="hidden md:flex space-x-6 items-center">
            {user && profile ? (
              <>
                <span className="text-gray-600">
                  Welcome, {profile.first_name || profile.email}
                </span>
                <Link 
                  to={getDashboardLink()} 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-gray-600 hover:text-blue-600 transition-colors">Client Portal</Link>
                <Link to="/auth" className="text-gray-600 hover:text-blue-600 transition-colors">Writer Portal</Link>
                <Link to="/auth" className="text-gray-600 hover:text-blue-600 transition-colors">Admin</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Seamless Assignment Management
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect clients with professional writers through our secure, anonymous platform. 
          Track progress, ensure quality, and deliver exceptional results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user && profile ? (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to={getDashboardLink()}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/auth">Post Assignment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">Join as Writer</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>For Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Post your assignments securely. Track progress in real-time. 
                Request revisions without direct writer contact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>For Writers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Receive curated assignments. Focus on quality work. 
                Get feedback through our secure system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Admin Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Manage assignments efficiently. Match clients with writers. 
                Ensure quality and satisfaction.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Tasker?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Anonymous System", desc: "Complete privacy between clients and writers" },
              { icon: CheckCircle, title: "Quality Assured", desc: "Admin oversight ensures high standards" },
              { icon: Users, title: "Expert Writers", desc: "Vetted professionals for every subject" },
              { icon: FileText, title: "Easy Tracking", desc: "Monitor progress every step of the way" }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <benefit.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Tasker</span>
          </div>
          <p className="text-gray-400 mb-6">
            Connecting clients and writers through secure, professional assignment management.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
