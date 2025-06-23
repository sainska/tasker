
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, DollarSign, TrendingUp, LogOut, Search, Filter, Eye, Download, MessageSquare, Settings } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AssignmentService } from '@/services/assignmentService';
import { UserService } from '@/services/userService';
import { SubmissionService } from '@/services/submissionService';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import AdminAssignTaskModal from './AdminAssignTaskModal';
import AdminMessageModal from './AdminMessageModal';
import AdminApprovalModal from './AdminApprovalModal';

type Assignment = Database['public']['Tables']['assignments']['Row'] & {
  client?: { id: string; first_name?: string; last_name?: string; email: string };
  writer?: { id: string; first_name?: string; last_name?: string; email: string };
};

type User = Database['public']['Tables']['profiles']['Row'] & {
  is_active?: boolean;
};

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssignments: 0,
    totalRevenue: 0,
    activeWriters: 0,
    pendingAssignments: 0,
    completedAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchAssignments = async () => {
    try {
      const data = await AssignmentService.getAllAssignments();
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const adminStats = await UserService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAssignments(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDownloadSubmission = async (submissionId: string) => {
    try {
      const submission = await SubmissionService.getSubmissionById(submissionId);
      
      if (submission.file_url) {
        const link = document.createElement('a');
        link.href = submission.file_url;
        link.download = `submission-${submissionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success",
          description: "File download started"
        });
      } else {
        toast({
          title: "No File",
          description: "No file attached to this submission",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading submission:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleViewSubmission = async (submissionId: string) => {
    try {
      const submission = await SubmissionService.getSubmissionById(submissionId);
      
      if (submission.file_url) {
        window.open(submission.file_url, '_blank');
      } else {
        toast({
          title: "No File",
          description: "No file attached to this submission",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error viewing submission:', error);
      toast({
        title: "Error",
        description: "Failed to view submission",
        variant: "destructive"
      });
    }
  };

  const handleMessageUser = (assignment?: Assignment, user?: User) => {
    setSelectedAssignment(assignment || null);
    setSelectedUser(user || null);
    setShowMessageModal(true);
  };

  const handleAssignTask = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignModal(true);
  };

  const handleApproveTask = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowApprovalModal(true);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UserService.toggleUserStatus(userId, !currentStatus);
      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await UserService.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: 'client' | 'writer' | 'admin') => {
    try {
      await UserService.changeUserRole(userId, newRole);
      toast({
        title: "Success",
        description: `User role changed to ${newRole} successfully`
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: "Failed to change user role",
        variant: "destructive"
      });
    }
  };

  const handleAssignmentUpdated = () => {
    fetchAssignments();
    fetchStats();
  };

  const handleUserUpdated = () => {
    fetchUsers();
    fetchStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "submitted": return "bg-purple-100 text-purple-800";
      case "revision_requested": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-cyan-100 text-cyan-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "client": return "bg-blue-100 text-blue-800";
      case "writer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    return user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.first_name || 'Admin'}! System overview and management.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowMessageModal(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Writers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeWriters}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assignments" className="mt-6">
            {/* Search and Filter */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="revision_requested">Revision Requested</option>
              </select>
            </div>

            <div className="grid gap-6">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline">{assignment.subject}</Badge>
                      <Badge className={getStatusColor(assignment.status)}>
                        <span className="capitalize">{assignment.status?.replace('_', ' ')}</span>
                      </Badge>
                      {assignment.document_type && (
                        <Badge variant="outline" className="bg-gray-50">
                          {assignment.document_type}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.description}
                    </CardDescription>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                      <span>Client: {assignment.client ? `${assignment.client.first_name} ${assignment.client.last_name}` : 'Unknown'}</span>
                      <span>Writer: {assignment.writer ? `${assignment.writer.first_name} ${assignment.writer.last_name}` : 'Unassigned'}</span>
                      <span>Deadline: {formatDate(assignment.deadline)}</span>
                      <span>Budget: ${assignment.budget}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageUser(assignment)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      
                      {!assignment.writer_id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignTask(assignment)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Assign Writer
                        </Button>
                      )}
                      
                      {assignment.status === 'submitted' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveTask(assignment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review & Approve
                        </Button>
                      )}
                      
                      {assignment.status === 'submitted' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewSubmission(assignment.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadSubmission(assignment.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAssignments.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <span>Email: {user.email}</span>
                      <span>Joined: {formatDate(user.created_at)}</span>
                      <span>Status: {user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageUser(undefined, user)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id, user.is_active || false)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value as 'client' | 'writer' | 'admin')}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="client">Client</option>
                        <option value="writer">Writer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AdminMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        assignmentId={selectedAssignment?.id}
        userId={selectedUser?.id}
        onMessageSent={handleUserUpdated}
      />

      <AdminAssignTaskModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        assignment={selectedAssignment}
        onAssignmentUpdated={handleAssignmentUpdated}
      />

      <AdminApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        assignment={selectedAssignment}
        onApprovalComplete={handleAssignmentUpdated}
      />
    </div>
  );
};

export default AdminDashboard;
