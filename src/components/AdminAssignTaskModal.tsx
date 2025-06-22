import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssignmentService } from '@/services/assignmentService';
import { UserService } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';

type User = any;
type Assignment = any;

interface AdminAssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onAssignmentUpdated: () => void;
}

const AdminAssignTaskModal: React.FC<AdminAssignTaskModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onAssignmentUpdated
}) => {
  const [writerId, setWriterId] = useState<string>('');
  const [assignedPrice, setAssignedPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [writers, setWriters] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWriters();
      if (assignment) {
        setAssignedPrice(assignment.budget?.toString() || '');
      }
    }
  }, [isOpen, assignment]);

  const fetchWriters = async () => {
    try {
      const data = await UserService.getUsersByRole('writer');
      // Filter only active writers
      const activeWriters = data?.filter(writer => writer.is_active) || [];
      setWriters(activeWriters);
    } catch (error) {
      console.error('Error fetching writers:', error);
      toast({
        title: "Error",
        description: "Failed to load writers",
        variant: "destructive"
      });
    }
  };

  const handleAssignTask = async () => {
    if (!writerId || !assignedPrice || !assignment) {
      toast({
        title: "Error",
        description: "Please select a writer and set the assigned price",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(assignedPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update assignment with writer and new price
      await AssignmentService.updateAssignment(assignment.id, {
        writer_id: writerId,
        budget: price,
        status: 'assigned',
        admin_notes: notes || null
      });

      toast({
        title: "Success",
        description: "Task assigned successfully"
      });

      onAssignmentUpdated();
      handleClose();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWriterId('');
    setAssignedPrice('');
    setNotes('');
    onClose();
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Task to Writer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Assignment Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{assignment.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Subject:</span> {assignment.subject}
              </div>
              <div>
                <span className="font-medium">Original Budget:</span> ${assignment.budget}
              </div>
              <div>
                <span className="font-medium">Deadline:</span> {new Date(assignment.deadline).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status:</span> {assignment.status}
              </div>
            </div>
          </div>

          {/* Writer Selection */}
          <div className="space-y-2">
            <Label htmlFor="writer">Select Writer</Label>
            <Select value={writerId} onValueChange={setWriterId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a writer" />
              </SelectTrigger>
              <SelectContent>
                {writers.map((writer) => (
                  <SelectItem key={writer.id} value={writer.id}>
                    {writer.first_name} {writer.last_name} ({writer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Assigned Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={assignedPrice}
              onChange={(e) => setAssignedPrice(e.target.value)}
              placeholder="Enter assigned price"
            />
            <p className="text-xs text-gray-500">
              This is the amount the writer will receive for completing this task
            </p>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for the writer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAssignTask} disabled={loading || !writerId || !assignedPrice}>
            {loading ? 'Assigning...' : 'Assign Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAssignTaskModal; 