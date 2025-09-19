import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, LogOut, Save, RefreshCw } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'destructive' | 'warning' | 'default';
  icon?: ReactNode;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = 'default',
  icon
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'destructive':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Save className="w-5 h-5 text-cosmic-gold" />;
    }
  };

  const getConfirmButtonProps = () => {
    switch (variant) {
      case 'destructive':
        return {
          variant: 'destructive' as const,
          className: ''
        };
      case 'warning':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-500 hover:bg-yellow-600 text-black'
        };
      default:
        return {
          variant: 'default' as const,
          className: 'bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light'
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            {...getConfirmButtonProps()}
            onClick={handleConfirm}
            className={`flex-1 ${getConfirmButtonProps().className}`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;