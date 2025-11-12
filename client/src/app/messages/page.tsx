'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { MessageThread } from '@/components/messaging/MessageThread';
import { ConversationList } from '@/components/messaging/ConversationList';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';
import { MessageSquare, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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
          // Auto-select first lead on desktop
          if (data.data.length > 0 && !selectedLead && window.innerWidth >= 768) {
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
  }, [user, authLoading, selectedLead]);

  const currentLead = leads.find((l) => l.id === selectedLead);

  const handleSelectLead = (leadId: string) => {
    // Instant UI update - no delay
    setSelectedLead(leadId);
    // On mobile, open the thread view instantly
    if (window.innerWidth < 768) {
      setIsMobileViewOpen(true);
    }
  };

  const handleCloseMobileView = () => {
    setIsMobileViewOpen(false);
  };

  // Get sender name for typing indicator
  const getSenderName = () => {
    if (!currentLead) return 'User';

    if (user?.role === 'vendor') {
      // Vendor viewing planner's event
      return currentLead.event?.event_type || currentLead.events?.event_type || currentLead.users?.full_name || 'Planner';
    } else {
      // Planner viewing vendor
      return currentLead.vendor?.business_name || currentLead.vendors?.business_name || 'Vendor';
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading || authLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md p-8">
          <ErrorState title="Failed to load conversations" message={error} />
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex h-full max-w-7xl">
        {/* Conversations List - Hidden on mobile when thread is open */}
        <div
          className={`w-full md:w-96 md:block transition-all duration-200 ${
            isMobileViewOpen ? 'hidden' : 'block'
          }`}
        >
          <ConversationList
            leads={leads}
            selectedLeadId={selectedLead}
            onSelectLead={handleSelectLead}
            currentUserId={user!.id}
            userRole={user!.role}
          />
        </div>

        {/* Message Thread - Full width on mobile */}
        <div
          className={`flex-1 transition-all duration-200 ${
            isMobileViewOpen || selectedLead ? 'block' : 'hidden md:block'
          }`}
        >
          {currentLead ? (
            <div className="h-full flex flex-col">
              {/* Thread Header */}
              <div className="border-b border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={handleCloseMobileView}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {getInitials(getSenderName())}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {getSenderName()}
                  </h3>
                  {(currentLead.event || currentLead.events) && (
                    <p className="text-sm text-slate-600 truncate">
                      {((currentLead.event || currentLead.events)?.event_date) && formatDate((currentLead.event || currentLead.events)!.event_date)}
                      {((currentLead.event || currentLead.events)?.event_date) && ' • '}
                      {(currentLead.event || currentLead.events)?.guest_count} guests • $
                      {(currentLead.event || currentLead.events)?.budget.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  leadId={currentLead.id}
                  currentUserId={user!.id}
                  receiverId={
                    user?.role === 'vendor'
                      ? currentLead.planner_id
                      : currentLead.vendor?.user_id || currentLead.vendors?.user_id || ''
                  }
                  senderName={getSenderName()}
                  currentUserName={user!.full_name || 'You'}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-white border-l border-slate-200">
              <div className="text-center px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-primary-600" />
                </div>
                <p className="text-lg font-medium text-slate-900">No conversation selected</p>
                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                  Select a conversation from the list to view messages and start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
