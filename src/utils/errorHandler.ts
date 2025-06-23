
import { toast } from '@/components/ui/use-toast';

export interface AppError {
  code?: string;
  message: string;
  details?: any;
}

export const ErrorHandler = {
  handleAuthError(error: any): string {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || error.error_description || error.error || 'Authentication failed';
    
    // Handle specific auth errors
    switch (error.code || error.error) {
      case 'invalid_credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'user_not_found':
        return 'No account found with this email address.';
      case 'too_many_requests':
        return 'Too many login attempts. Please wait a moment and try again.';
      case 'email_not_confirmed':
        return 'Please verify your email address before signing in.';
      case 'weak_password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'signup_disabled':
        return 'New registrations are currently disabled.';
      case 'email_address_invalid':
        return 'Please enter a valid email address.';
      default:
        return message;
    }
  },

  handleApiError(error: any): string {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || 'An error occurred while processing your request';
    
    // Handle specific API errors
    if (error.code === 'PGRST116') {
      return 'No data found';
    }
    
    if (error.code === '23505') {
      return 'This record already exists';
    }
    
    if (error.code === '23503') {
      return 'Cannot delete this record as it is referenced by other data';
    }
    
    return message;
  },

  showError(error: any, title: string = 'Error') {
    const message = this.handleApiError(error);
    toast({
      title,
      description: message,
      variant: 'destructive'
    });
  },

  showAuthError(error: any) {
    const message = this.handleAuthError(error);
    toast({
      title: 'Authentication Error',
      description: message,
      variant: 'destructive'
    });
  },

  showSuccess(message: string, title: string = 'Success') {
    toast({
      title,
      description: message
    });
  }
};
