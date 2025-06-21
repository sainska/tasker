import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { NewAssignmentModal } from "./NewAssignmentModal";

const ClientDashboard = () => {
  const [showNewAssignment, setShowNewAssignment] = useState(false);

  const assignments = [
    {
      id: 1,
      title: "Marketing Strategy Analysis",
      subject: "Business",
      status: "in_progress",
      deadline: "2024-01-15",
      submittedAt: "2024-01-10",
      description: "Comprehensive analysis of current marketing trends...",
      revisions: 0
    },
    {
      id: 2,
      title: "React Development Tutorial",
      subject: "Computer Science",
      status: "completed",
      deadline: "2024-01-12",
      submittedAt: "2024-01-08",
      description: "Step-by-step guide for React beginners...",
      revisions: 1
    },
    {
      id: 3,
      title: "Environmental Impact Study",
      subject: "Environmental Science",
      status: "revision_requested",
      deadline: "2024-01-20",
      submittedAt: "2024-01-12",
      description: "Analysis of carbon footprint reduction strategies...",
      revisions: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "revision_requested": return "bg-yellow-100 text-yellow-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
          <Button onClick={() => setShowNewAssignment(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
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
                  <p className="text-2xl font-bold text-gray-900">3</p>
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
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revisions</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="revision_requested">Revisions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Submitted: {assignment.submittedAt}</span>
                      <span>Revisions: {assignment.revisions}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {assignment.status === "revision_requested" && (
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Request Revision
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="in_progress" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "in_progress").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Submitted: {assignment.submittedAt}</span>
                      <span>Revisions: {assignment.revisions}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {assignment.status === "revision_requested" && (
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Request Revision
                        </Button>
                      )}
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
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Submitted: {assignment.submittedAt}</span>
                      <span>Revisions: {assignment.revisions}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {assignment.status === "revision_requested" && (
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Request Revision
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="revision_requested" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "revision_requested").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Submitted: {assignment.submittedAt}</span>
                      <span>Revisions: {assignment.revisions}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {assignment.status === "revision_requested" && (
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Request Revision
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewAssignmentModal 
        open={showNewAssignment} 
        onClose={() => setShowNewAssignment(false)} 
      />
    </div>
  );
};

export default ClientDashboard;
