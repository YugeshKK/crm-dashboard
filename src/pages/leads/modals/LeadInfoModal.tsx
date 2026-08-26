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


export interface ILeadInfoModalProps {
  isLeadInfoOpen: boolean;
  setIsLeadInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  leadData?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    owner: string;
    created: string;
    // optional fields you may add later
    email?: string;
    leadScore?: number;
    expectedValue?: number;
    createdAt?: string;
  };
}

export function LeadInfoModal({
  isLeadInfoOpen,
  setIsLeadInfoOpen,
  leadData,
}: ILeadInfoModalProps) {
  if (!leadData) return null;

  const initials = `${leadData.firstName?.[0] || ''}${leadData.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Sheet open={isLeadInfoOpen} onOpenChange={setIsLeadInfoOpen}>
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] p-0 overflow-y-auto bg-white"
      >
        {/* Close button */}
        <SheetClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <span className="sr-only">Close</span>
        </SheetClose>

        {/* Lead Header */}
        <div className="p-6 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
              {initials || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">
                {leadData.firstName} {leadData.lastName}
              </h2>
              <p className="text-sm text-gray-500 truncate">{leadData.company}</p>
              <p className="text-sm text-gray-500 truncate">{leadData.phone}</p>
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <StatusBadge status={leadData.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Source</p>
              <p className="text-sm">{leadData.source || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Owner</p>
              <p className="text-sm">{leadData.owner || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Created</p>
              <p className="text-sm">{leadData.created || '—'}</p>
            </div>
            {/* Optional fields – show only if they exist */}
            {leadData.email && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm">{leadData.email}</p>
              </div>
            )}
            {leadData.leadScore !== undefined && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Lead Score</p>
                <p className="text-sm font-medium">{leadData.leadScore}/100</p>
              </div>
            )}
            {leadData.expectedValue !== undefined && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Expected Value</p>
                <p className="text-sm font-medium">₹ {leadData.expectedValue.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Overview, Activity, Notes, Follow-ups */}
        <div className="border-t">
          <div className="flex border-b">
            {['Overview', 'Activity', 'Notes', 'Follow-ups'].map((tab) => (
              <button
                key={tab}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent data-[active=true]:border-blue-500 data-[active=true]:text-blue-600"
                data-active={tab === 'Overview'}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {/* Overview content */}
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Contact:</strong> {leadData.firstName} {leadData.lastName}</p>
              <p><strong>Company:</strong> {leadData.company}</p>
              <p><strong>Phone:</strong> {leadData.phone}</p>
              <p><strong>Source:</strong> {leadData.source || '—'}</p>
              <p><strong>Owner:</strong> {leadData.owner || '—'}</p>
              <p><strong>Created:</strong> {leadData.created || '—'}</p>
              {leadData.email && <p><strong>Email:</strong> {leadData.email}</p>}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default LeadInfoModal;