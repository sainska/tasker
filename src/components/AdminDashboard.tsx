
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, FileText, Clock, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const assignments = [
    {
      id: 1,
      title: "Marketing Strategy Analysis",
      clientId: "C001",
      writerId: "W105",
      writerName: "John Smith",
      subject: "Business",
      status: "in_progress",
      deadline: "2024-01-15",
      priority: "high",
      submittedAt: "2024-01-10",
      budget: 200,
      pages: 8
    },
    {
      id: 2,
      title: "Environmental Impact Study",
      clientId: "C002",
      writerId: "unassigned",
      writerName: null,
      subject: "Environmental Science",
      status: "pending_assignment",
      deadline: "2024-01-20",
      priority: "standard",
      submittedAt: "2024-01-12",
      budget: 150,
      pages: 12
    },
    {
      id: 3,
      title: "React Development Tutorial",
      clientId: "C003",
      writerId: "W102",
      writerName: "Sarah Johnson",
      subject: "Computer Science",
      status: "completed",
      deadline: "2024-01-12",
      priority: "standard",
      submittedAt: "2024-01-08",
      budget: 180,
      pages: 6
    }
  ];

  const writers = [
    { id: "W101", name: "Alice Brown", specialties: ["Business", "Economics"], rating: 4.9, active: 2 },
    { id: "W102", name: "Sarah Johnson", specialties: ["Computer Science", "Mathematics"], rating: 4.8, active: 1 },
    { id: "W103", name: "Mike Wilson", specialties: ["Literature", "History"], rating: 4.7, active: 0 },
    { id: "W104", name: "Emma Davis", specialties: ["Science", "Environmental Science"], rating: 4.9, active: 1 },
    { id: "W105", name: "John Smith", specialties: ["Business", "Marketing"], rating: 4.6, active: 1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending_assignment": return "bg-yellow-100 text-yellow-800";
      case "revision_requested": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage assignments, writers, and client relationships</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Writers</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Assignment Management</TabsTrigger>
            <TabsTrigger value="writers">Writer Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assignments" className="mt-6">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search assignments..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_assignment">Pending Assignment</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignments List */}
            <div className="grid gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                      <Badge variant="secondary">Client: {assignment.clientId}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Writer:</span>
                        <p className="font-medium">
                          {assignment.writerName || "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <p className="font-medium">{assignment.deadline}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <p className="font-medium">${assignment.budget}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Pages:</span>
                        <p className="font-medium">{assignment.pages}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignment.writerId === "unassigned" ? (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Assign Writer
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Reassign Writer
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact Client
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="writers" className="mt-6">
            <div className="grid gap-6">
              {writers.map((writer) => (
                <Card key={writer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{writer.name}</CardTitle>
                      <Badge variant="outline">ID: {writer.id}</Badge>
                      <Badge className={writer.active > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {writer.active > 0 ? `${writer.active} Active` : "Available"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Rating: {writer.rating}/5</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Specialties:</span>
                      <div className="flex gap-2 mt-1">
                        {writer.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        Assignment History
                      </Button>
                      <Button size="sm" variant="outline">
                        Performance Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Overview of platform performance and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">92%</p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">4.7</p>
                      <p className="text-sm text-gray-600">Avg. Client Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">2.3</p>
                      <p className="text-sm text-gray-600">Avg. Revisions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">5.2</p>
                      <p className="text-sm text-gray-600">Avg. Days to Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
