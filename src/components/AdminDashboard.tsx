import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, DollarSign, TrendingUp, Eye, MessageSquare, CheckCircle, UserPlus, Calendar, Trash2, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AssignmentService } from '@/services/assignmentService';
import { UserService } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import AdminUserManagementModal from '@/components/AdminUserManagementModal';
import AdminAssignTaskModal from '@/components/AdminAssignTaskModal';
import AdminMessageModal from '@/components/AdminMessageModal';
import AdminApprovalModal from '@/components/AdminApprovalModal';
import NotificationBell from '@/components/NotificationBell';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_active?: boolean;
  phone?: string;
};

interface AdminStats {
  totalUsers: number;
  totalAssignments: number;
  totalRevenue: number;
  activeWriters: number;
  pendingAssignments: number;
  completedAssignments: number;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAssignments: 0,
    totalRevenue: 0,
    activeWriters: 0,
    pendingAssignments: 0,
    completedAssignments: 0
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchStats();
    fetchAssignments();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await UserService.getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const assignmentsData = await AssignmentService.getAllAssignments();
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await UserService.getAllUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserUpdated = () => {
    fetchUsers();
    fetchStats();
  };

  const handleAssignmentUpdated = () => {
    fetchAssignments();
    fetchStats();
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowApprovalModal(true);
  };

  const handleMessageUser = (user: Profile) => {
    setSelectedUser(user);
    setShowMessageModal(true);
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      submitted: 'bg-orange-100 text-orange-800',
      revision_requested: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      writer: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, assignments, and monitor platform activity</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Button onClick={() => setShowUserModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Manage Users
          </Button>
          <Button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Writers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWriters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>
                Manage and monitor all assignments in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assignments found
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                        </div>
                        {getStatusBadge(assignment.status)}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Budget: ${assignment.budget}</span>
                        <span>Due: {assignment.due_date ? formatDate(assignment.due_date) : 'Not set'}</span>
                        <span>Created: {formatDate(assignment.created_at)}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {getRoleBadge(user.role)}
                          <Badge variant={user.is_active !== false ? "default" : "secondary"}>
                            {user.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Joined: {formatDate(user.created_at)}</span>
                        <span>Status: {user.is_active !== false ? 'Active' : 'Inactive'}</span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMessageUser(user)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active !== false)}
                        >
                          {user.is_active !== false ? 'Deactivate' : 'Activate'}
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
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AdminUserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUserUpdated={handleUserUpdated}
      />

      <AdminAssignTaskModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssignmentCreated={handleAssignmentUpdated}
      />

      <AdminMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipientId={selectedUser?.id || ''}
        onMessageSent={handleUserUpdated}
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
