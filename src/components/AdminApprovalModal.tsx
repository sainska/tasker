
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SubmissionService } from '@/services/submissionService';
import { AssignmentService } from '@/services/assignmentService';
import { Database } from '@/integrations/supabase/types';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onApprovalComplete: () => void;
}

const AdminApprovalModal = ({ isOpen, onClose, assignment, onApprovalComplete }: AdminApprovalModalProps) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (assignment && isOpen) {
      fetchSubmission();
    }
  }, [assignment, isOpen]);

  const fetchSubmission = async () => {
    if (!assignment) return;
    
    try {
      const submissionData = await SubmissionService.getSubmissionByAssignment(assignment.id);
      setSubmission(submissionData);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submission details",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async () => {
    if (!assignment || !submission) return;
    
    setLoading(true);
    try {
      // Update assignment status to completed
      await AssignmentService.updateAssignment(assignment.id, {
        status: 'completed'
      });

      toast({
        title: "Success",
        description: "Assignment approved and marked as completed"
      });
      
      onApprovalComplete();
      onClose();
    } catch (error) {
      console.error('Error approving assignment:', error);
      toast({
        title: "Error",
        description: "Failed to approve assignment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!assignment || !adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide revision notes",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Update assignment status to revision requested
      await AssignmentService.updateAssignment(assignment.id, {
        status: 'revision_requested',
        admin_notes: adminNotes
      });

      toast({
        title: "Success",
        description: "Revision requested successfully"
      });
      
      onApprovalComplete();
      onClose();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Assignment Submission</DialogTitle>
          <DialogDescription>
            Review the submitted work and approve or request revisions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Assignment Details
                {getStatusBadge(assignment.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Title</Label>
                <p className="text-sm text-gray-600">{assignment.title}</p>
              </div>
              <div>
                <Label className="font-medium">Description</Label>
                <p className="text-sm text-gray-600">{assignment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Budget</Label>
                  <p className="text-sm text-gray-600">${assignment.budget}</p>
                </div>
                <div>
                  <Label className="font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">
                    {assignment.due_date ? formatDate(assignment.due_date) : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Details */}
          {submission && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Work</CardTitle>
                <CardDescription>
                  Submitted on {formatDate(submission.submitted_at || submission.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Content</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>
                
                {submission.submission_notes && (
                  <div>
                    <Label className="font-medium">Writer's Notes</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{submission.submission_notes}</p>
                    </div>
                  </div>
                )}

                {submission.file_url && (
                  <div>
                    <Label className="font-medium">Attached File</Label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(submission.file_url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View File
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Review Section */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-notes">Review Notes (required for revision requests)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Provide feedback or revision instructions..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRequestRevision}
            disabled={loading || !adminNotes.trim()}
          >
            Request Revision
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Approve & Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminApprovalModal;
