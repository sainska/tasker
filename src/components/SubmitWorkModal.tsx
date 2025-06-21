import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SubmissionService } from '@/services/submissionService';
import { AssignmentService } from '@/services/assignmentService';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type Assignment = Database['public']['Tables']['assignments']['Row'];

interface SubmitWorkModalProps {
  assignment: Assignment;
  onSubmissionCreated: () => void;
}

const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({ assignment, onSubmissionCreated }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setIsLoading(true);

    try {
      let fileUrl = '';
      
      // Upload file to Supabase Storage
      if (selectedFile) {
        fileUrl = await SubmissionService.uploadFile(selectedFile, assignment.id, user.id);
      }

      // Create submission record
      const submissionData = {
        assignment_id: assignment.id,
        writer_id: user.id,
        file_url: fileUrl,
        content: content.trim(),
        submission_notes: notes.trim()
      };

      await SubmissionService.createSubmission(submissionData);

      // Update assignment status to submitted
      await AssignmentService.updateAssignment(assignment.id, {
        status: 'submitted'
      });

      toast({
        title: "Success",
        description: "Work submitted successfully!"
      });

      // Reset form
      setSelectedFile(null);
      setContent('');
      setNotes('');
      setOpen(false);
      onSubmissionCreated();
    } catch (error) {
      console.error('Error submitting work:', error);
      toast({
        title: "Error",
        description: "Failed to submit work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-1" />
          Submit Work
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>
            Submit your completed work for "{assignment.title}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label htmlFor="file" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700">
                  Click to upload file
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                PDF, DOC, DOCX, or TXT files only
              </p>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content (Optional)</Label>
            <Textarea
              id="content"
              placeholder="Paste your content here if you prefer text submission"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Submission Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or comments for the client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? "Submitting..." : "Submit Work"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitWorkModal; 