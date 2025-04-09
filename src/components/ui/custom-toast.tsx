
import React from 'react';
import { toast, Toaster as SonnerToaster, ToasterProps } from 'sonner';
import { X } from 'lucide-react';

export const CustomToaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: Infinity, // Toasts won't auto-dismiss
        classNames: {
          toast: 'group relative border-solid border border-gray-200 rounded-md bg-white p-4 shadow-md',
          success: 'bg-green-50 border-green-200',
          error: 'bg-red-50 border-red-200',
          info: 'bg-blue-50 border-blue-200',
          warning: 'bg-yellow-50 border-yellow-200',
        },
      }}
    />
  );
};

interface ToastProps extends Omit<React.ComponentProps<typeof toast>, 'message'> {
  message: string;
}

export const showToast = (props: ToastProps) => {
  const { message, ...rest } = props;
  
  const toastContent = (
    <div className="flex items-start justify-between w-full pr-6">
      <span>{message}</span>
      <button 
        onClick={() => toast.dismiss()} 
        className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
  
  return toast(toastContent, rest);
};

// Export custom toast functions
export const customToast = {
  success: (message: string) => showToast({ message, type: 'success' }),
  error: (message: string) => showToast({ message, type: 'error' }),
  info: (message: string) => showToast({ message, type: 'info' }),
  warning: (message: string) => showToast({ message, type: 'warning' }),
  custom: showToast,
};
