'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageThread } from '@/components/messaging/MessageThread';
import { Lead, Message } from '@/types';
import { formatDate } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

// Mock data
const mockLeads: (Lead & { unreadCount: number })[] = [
  {
    id: '1',
    event_id: 'event-1',
    vendor_id: 'vendor-1',
    package_id: 'package-1',
    planner_id: 'planner-1',
    status: 'quoted',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
    unreadCount: 2,
    event: {
      id: 'event-1',
      planner_id: 'planner-1',
      event_date: '2025-03-15',
      budget: 5000,
      guest_count: 150,
      location_address: '123 University Ave, Austin, TX',
      location_lat: 30.2672,
      location_lng: -97.7431,
      event_type: 'Spring Formal',
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    lead_id: '1',
    sender_id: 'vendor-1',
    receiver_id: 'planner-1',
    content: 'Thank you for your interest! I would love to host your Spring Formal. Our venue can accommodate 150 guests comfortably.',
    read: true,
    created_at: '2025-01-20T11:00:00Z',
  },
  {
    id: '2',
    lead_id: '1',
    sender_id: 'planner-1',
    receiver_id: 'vendor-1',
    content: 'Great! Can you provide more details about the catering options? We have several dietary restrictions to accommodate.',
    read: true,
    created_at: '2025-01-20T14:00:00Z',
  },
];

export default function MessagesPage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(mockLeads[0]?.id || null);

  const currentLead = mockLeads.find((l) => l.id === selectedLead);

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex h-full max-w-7xl">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
            <p className="text-sm text-slate-600">All conversations</p>
          </div>

          <div className="overflow-y-auto">
            {mockLeads.length > 0 ? (
              mockLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead.id)}
                  className={`w-full border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                    selectedLead === lead.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">
                          {lead.event?.event_type}
                        </h3>
                        {lead.unreadCount > 0 && (
                          <Badge variant="danger" className="text-xs">
                            {lead.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(lead.event?.event_date || '')}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        Last message preview...
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1">
          {currentLead ? (
            <Card className="h-full rounded-none border-0">
              {/* Thread Header */}
              <div className="border-b border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900">
                  {currentLead.event?.event_type}
                </h3>
                <p className="text-sm text-slate-600">
                  {formatDate(currentLead.event?.event_date || '')} •{' '}
                  {currentLead.event?.guest_count} guests •{' '}
                  ${currentLead.event?.budget.toLocaleString()}
                </p>
              </div>

              <MessageThread
                leadId={currentLead.id}
                currentUserId="planner-1"
                initialMessages={mockMessages}
              />
            </Card>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-4 text-slate-500">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
