import React, { useState, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AssignmentService } from '@/services/assignmentService';
import { SubmissionService } from '@/services/submissionService';
import { toast } from '@/components/ui/use-toast';
// @ts-expect-error: Database type is not exported from supabase/types
import type { Database } from '@/integrations/supabase/types';
import { Eye, Download, CheckCircle, XCircle } from 'lucide-react';

type Assignment = {
  id: string;
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status?: string;
  subject?: string;
  client?: { id: string; first_name?: string; last_name?: string; email: string };
  writer?: { id: string; first_name?: string; last_name?: string; email: string };
};

type Submission = Database['public']['Tables']['assignment_submissions']['Row'];

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onApprovalComplete: () => void;
}

const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onApprovalComplete
}) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmission();
    }
  }, [isOpen, assignment]);

  const fetchSubmission = async () => {
    if (!assignment) return;
    
    setLoadingSubmission(true);
    try {
      const data = await SubmissionService.getSubmissionByAssignmentId(assignment.id);
      setSubmission(data);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive"
      });
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleViewSubmission = async () => {
    if (!submission?.file_url) {
      toast({
        title: "No File",
        description: "No file attached to this submission",
        variant: "destructive"
      });
      return;
    }

    try {
      window.open(submission.file_url, '_blank');
    } catch (error) {
      console.error('Error viewing submission:', error);
      toast({
        title: "Error",
        description: "Failed to view submission",
        variant: "destructive"
      });
    }
  };

  const handleDownloadSubmission = async () => {
    if (!submission?.file_url) {
      toast({
        title: "No File",
        description: "No file attached to this submission",
        variant: "destructive"
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = submission.file_url;
      link.download = `submission-${submission.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "File download started"
      });
    } catch (error) {
      console.error('Error downloading submission:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async () => {
    if (!assignment) return;

    setLoading(true);
    try {
      // Update assignment status to approved
      await AssignmentService.updateAssignment(assignment.id, {
        status: 'approved',
        admin_notes: adminNotes || null
      });

      // Update submission status
      if (submission) {
        await SubmissionService.updateSubmission(submission.id, {
          status: 'approved',
          admin_notes: adminNotes || null
        });
      }

      toast({
        title: "Success",
        description: "Task approved successfully"
      });

      onApprovalComplete();
      handleClose();
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!assignment) return;

    setLoading(true);
    try {
      // Update assignment status to revision requested
      await AssignmentService.updateAssignment(assignment.id, {
        status: 'revision_requested',
        admin_notes: adminNotes || null
      });

      // Update submission status
      if (submission) {
        await SubmissionService.updateSubmission(submission.id, {
          status: 'revision_requested',
          admin_notes: adminNotes || null
        });
      }

      toast({
        title: "Success",
        description: "Task rejected and sent for revision"
      });

      onApprovalComplete();
      handleClose();
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: "Error",
        description: "Failed to reject task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmission(null);
    setAdminNotes('');
    onClose();
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Review and Approve Submission</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{assignment.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Subject:</span> {assignment.subject}
              </div>
              <div>
                <span className="font-medium">Budget:</span> ${assignment.budget}
              </div>
              <div>
                <span className="font-medium">Client:</span> {assignment.client ? `${assignment.client.first_name} ${assignment.client.last_name}` : 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Writer:</span> {assignment.writer ? `${assignment.writer.first_name} ${assignment.writer.last_name}` : 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Submission Details */}
          {loadingSubmission ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading submission...</p>
            </div>
          ) : submission ? (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Submission Details</h4>
                <Badge variant={submission.status === 'pending' ? 'secondary' : 'default'}>
                  {submission.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Submitted:</span> {new Date(submission.created_at).toLocaleString()}</p>
                {submission.submitted_at && (
                  <p><span className="font-medium">Submitted At:</span> {new Date(submission.submitted_at).toLocaleString()}</p>
                )}
                {submission.notes && (
                  <p><span className="font-medium">Writer Notes:</span> {submission.notes}</p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={handleViewSubmission}>
                  <Eye className="h-4 w-4 mr-1" />
                  View File
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadSubmission}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No submission found for this assignment
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add any feedback or notes about the submission..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject} 
            disabled={loading || !submission}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {loading ? 'Rejecting...' : 'Reject & Request Revision'}
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={loading || !submission}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminApprovalModal; 