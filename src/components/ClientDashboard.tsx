
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, AlertCircle, Plus, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const assignments = [
    {
      id: 1,
      title: "Marketing Strategy Analysis",
      subject: "Business",
      status: "in_progress",
      deadline: "2024-01-15",
      submittedAt: "2024-01-10",
      pages: 8,
      budget: 150,
      writer: "Professional Writer",
      description: "Comprehensive analysis of current marketing trends and strategies...",
      hasUpdate: true
    },
    {
      id: 2,
      title: "Environmental Impact Study", 
      subject: "Environmental Science",
      status: "completed",
      deadline: "2024-01-20",
      submittedAt: "2024-01-08",
      pages: 12,
      budget: 200,
      writer: "Expert Researcher",
      description: "Analysis of carbon footprint reduction strategies...",
      hasUpdate: false
    },
    {
      id: 3,
      title: "Database Design Project",
      subject: "Computer Science", 
      status: "revision_requested",
      deadline: "2024-01-18",
      submittedAt: "2024-01-12",
      pages: 6,
      budget: 120,
      writer: "Technical Writer", 
      description: "Comprehensive database design documentation...",
      hasUpdate: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "revision_requested": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "revision_requested": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.first_name || 'Client'}! You have 2 active assignments.
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">9</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needs Review</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="revisions">Revisions</TabsTrigger>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "in_progress").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                      {assignment.hasUpdate && (
                        <Badge className="bg-blue-100 text-blue-800">New Update</Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                      <span>Writer: {assignment.writer}</span>
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Budget: ${assignment.budget}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Progress
                      </Button>
                      <Button variant="outline" size="sm">
                        Message Writer
                      </Button>
                      <Button variant="outline" size="sm">
                        Download Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "completed").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                      <span>Writer: {assignment.writer}</span>
                      <span>Completed: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Paid: ${assignment.budget}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Download Final
                      </Button>
                      <Button variant="outline" size="sm">
                        Leave Review
                      </Button>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="revisions" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "revision_requested").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Revision Requested
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                      <span>Writer: {assignment.writer}</span>
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Budget: ${assignment.budget}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                        Review Changes
                      </Button>
                      <Button variant="outline" size="sm">
                        Add Comments
                      </Button>
                      <Button variant="outline" size="sm">
                        Approve Work
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                      <span>Writer: {assignment.writer}</span>
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Budget: ${assignment.budget}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
