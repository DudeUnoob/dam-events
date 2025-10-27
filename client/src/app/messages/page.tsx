'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { MessageThread } from '@/components/messaging/MessageThread';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchLeads = async () => {
      setLoading(true);
      setError(null);

      try {
        const role = user.role === 'vendor' ? 'vendor' : 'planner';
        const response = await fetch(`/api/leads?role=${role}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setLeads(data.data);
          // Auto-select first lead
          if (data.data.length > 0 && !selectedLead) {
            setSelectedLead(data.data[0].id);
          }
        } else {
          setError(data.error?.message || 'Failed to fetch conversations');
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user, authLoading]);

  const currentLead = leads.find((l) => l.id === selectedLead);

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
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <ErrorState title="Failed to load conversations" message={error} />
              </div>
            ) : leads.length > 0 ? (
              leads.map((lead) => (
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
                          {user?.role === 'vendor'
                            ? lead.event?.event_type || 'Event'
                            : lead.vendor?.business_name || 'Vendor'}
                        </h3>
                        <Badge variant={lead.status === 'booked' ? 'success' : 'default'}>
                          {lead.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {user?.role === 'vendor'
                          ? `${lead.event?.guest_count} guests • $${lead.event?.budget?.toLocaleString()}`
                          : lead.package?.name || 'Package'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  {user?.role === 'vendor'
                    ? 'Wait for planners to request quotes'
                    : 'Request quotes from packages to start conversations'}
                </p>
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
                currentUserId={user!.id}
                receiverId={
                  user?.role === 'vendor'
                    ? currentLead.planner_id
                    : currentLead.vendor?.user_id || ''
                }
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
