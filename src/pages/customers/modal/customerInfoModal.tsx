import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/table/DataTable';

export interface CustomerInfoModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
  customerData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    owner: string;
    created: string;
    lastContact: string;
  };
}

export function CustomerInfoModal({
  isOpen,
  onOpenChange,
  customerData,
}: CustomerInfoModalProps) {
  if (!customerData) return null;

  const initials = `${customerData.firstName?.[0] || ''}${customerData.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] p-0 overflow-y-auto bg-background"
      >
        <SheetClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        </SheetClose>

        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
              {initials || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">
                {customerData.firstName} {customerData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{customerData.company}</p>
              <p className="text-sm text-muted-foreground truncate">{customerData.phone}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Status</p>
              <StatusBadge status={customerData.status} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Source</p>
              <p className="text-sm">{customerData.source || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Owner</p>
              <p className="text-sm">{customerData.owner || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Created</p>
              <p className="text-sm">{customerData.created || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase">Last Contact</p>
              <p className="text-sm">{customerData.lastContact || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase">Email</p>
              <p className="text-sm">{customerData.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Tabs (Optional) */}
        <div className="border-t">
          <div className="flex border-b">
            {['Overview', 'Activity', 'Notes', 'Follow-ups'].map((tab) => (
              <button
                key={tab}
                className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent data-[active=true]:border-blue-500 data-[active=true]:text-blue-600"
                data-active={tab === 'Overview'}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            <div className="space-y-2 text-sm text-foreground">
              <p><strong>Contact:</strong> {customerData.firstName} {customerData.lastName}</p>
              <p><strong>Company:</strong> {customerData.company}</p>
              <p><strong>Phone:</strong> {customerData.phone}</p>
              <p><strong>Email:</strong> {customerData.email}</p>
              <p><strong>Source:</strong> {customerData.source || '—'}</p>
              <p><strong>Owner:</strong> {customerData.owner || '—'}</p>
              <p><strong>Created:</strong> {customerData.created || '—'}</p>
              <p><strong>Last Contact:</strong> {customerData.lastContact || '—'}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CustomerInfoModal;