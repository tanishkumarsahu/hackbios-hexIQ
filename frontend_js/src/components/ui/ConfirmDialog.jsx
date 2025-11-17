import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  icon: Icon = AlertCircle
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`min-w-[80px] ${
              confirmVariant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : confirmVariant === 'warning'
                ? 'bg-orange-600 hover:bg-orange-700'
                : ''
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
