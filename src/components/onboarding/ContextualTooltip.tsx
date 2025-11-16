import { ReactNode, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualTooltipProps {
  content: string;
  children?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  showIcon?: boolean;
}

export default function ContextualTooltip({
  content,
  children,
  side = 'top',
  className,
  showIcon = true,
}: ContextualTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        {children || (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full",
              "w-5 h-5 text-muted-foreground hover:text-foreground",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              className
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {showIcon && <HelpCircle className="w-4 h-4" />}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs text-sm bg-popover border-primary/20 shadow-lg"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}