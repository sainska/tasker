
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageService } from '@/services/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorHandler } from '@/utils/errorHandler';

interface AdminMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId?: string;
  recipientId: string;
  onMessageSent: () => void;
}

const AdminMessageModal = ({ isOpen, onClose, assignmentId, recipientId, onMessageSent }: AdminMessageModalProps) => {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      ErrorHandler.showError(new Error('Please enter a message'), 'Validation Error');
      return;
    }

    if (!profile || !recipientId) {
      ErrorHandler.showError(new Error('Missing required information'), 'Error');
      return;
    }

    setLoading(true);
    try {
      await MessageService.createMessage({
        sender_id: profile.id,
        recipient_id: recipientId,
        assignment_id: assignmentId || '',
        message: message.trim(),
        is_read: false
      });

      ErrorHandler.showSuccess('Message sent successfully');
      
      setMessage('');
      onMessageSent();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      ErrorHandler.showError(error, 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to the user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !message.trim()}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminMessageModal;
