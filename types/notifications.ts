export interface Notification {
    id: string;
    type: 'warning' | 'error' | 'success' | 'info';
    message: string;
    actionLink?: string;
    actionText?: string;
  }
  
  