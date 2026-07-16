import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { cn } from './utils';

type AppDialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDialogSize;
  className?: string;
  contentClassName?: string;
  backgroundHeader?: string
}

const sizeClasses: Record<AppDialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'md',
  className,
  contentClassName,
  backgroundHeader
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('top-[calc((100dvh-64px-env(safe-area-inset-bottom))/2)] grid-rows-[auto_minmax(0,1fr)_auto] max-h-[calc(100dvh-80px-env(safe-area-inset-bottom))] gap-0 overflow-hidden rounded-2xl border-0 border-slate-200 bg-white p-0 shadow-2xl outline-none ring-0 sm:top-1/2 sm:max-h-[calc(100vh-2rem)]', sizeClasses[size], className)}>
        <DialogHeader className={`rounded-t-2xl border-b border-[#003A78] bg-[#004A98] px-5 py-5 pr-14 text-left sm:px-6 ${backgroundHeader}`}>
          <div className="flex items-start gap-3.5">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/20">
                <Icon className="h-5 w-5" />
              </div>
            )}

            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-base font-bold tracking-tight text-white sm:text-lg">
                {title}
              </DialogTitle>

              {description && (
                <DialogDescription className="mt-1.5 max-w-2xl text-sm leading-5 text-blue-100">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className={cn('m-1 min-h-0 space-y-1 overflow-y-auto p-4 sm:p-5', contentClassName)}>
          {children}
        </div>

        {footer && (
          <DialogFooter className="border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { AppDialogProps, AppDialogSize };
