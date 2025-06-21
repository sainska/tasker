
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, AlertCircle, Download, Upload } from "lucide-react";

const WriterDashboard = () => {
  const assignments = [
    {
      id: 1,
      title: "Marketing Strategy Analysis",
      subject: "Business",
      status: "assigned",
      deadline: "2024-01-15",
      assignedAt: "2024-01-10",
      pages: 8,
      priority: "high",
      description: "Comprehensive analysis of current marketing trends and strategies...",
      hasRevision: false
    },
    {
      id: 2,
      title: "Environmental Impact Study",
      subject: "Environmental Science",
      status: "revision_needed",
      deadline: "2024-01-20",
      assignedAt: "2024-01-08",
      pages: 12,
      priority: "standard",
      description: "Analysis of carbon footprint reduction strategies...",
      hasRevision: true,
      revisionNote: "Please expand on the cost-benefit analysis section"
    },
    {
      id: 3,
      title: "Database Design Principles",
      subject: "Computer Science",
      status: "submitted",
      deadline: "2024-01-18",
      assignedAt: "2024-01-12",
      pages: 6,
      priority: "standard",
      description: "Comprehensive guide to database normalization...",
      hasRevision: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "revision_needed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "standard": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <CheckCircle className="h-4 w-4" />;
      case "assigned": return <Clock className="h-4 w-4" />;
      case "revision_needed": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Writer Dashboard</h1>
          <p className="text-gray-600">Welcome back! You have 2 active assignments.</p>
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
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
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
                  <p className="text-2xl font-bold text-gray-900">21</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Assignments</TabsTrigger>
            <TabsTrigger value="revisions">Revisions Needed</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "assigned").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
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
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Assigned: {assignment.assignedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-1" />
                        Download Brief
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Submit Work
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="revisions" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "revision_needed").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Revision Needed
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-2">
                      {assignment.description}
                    </CardDescription>
                    {assignment.revisionNote && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Revision Notes:</p>
                        <p className="text-sm text-yellow-700">{assignment.revisionNote}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Assigned: {assignment.assignedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                        Start Revision
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download Original
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submitted" className="mt-6">
            <div className="grid gap-6">
              {assignments.filter(a => a.status === "submitted").map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Submitted
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <span>Deadline: {assignment.deadline}</span>
                      <span>Pages: {assignment.pages}</span>
                      <span>Submitted: {assignment.assignedAt}</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      Awaiting client review
                    </p>
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

export default WriterDashboard;
