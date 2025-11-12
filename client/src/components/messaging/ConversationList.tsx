'use client';

import { useEffect, useState, useCallback } from 'react';
import { Lead, Message } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ConversationListProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  currentUserId: string;
  userRole: 'planner' | 'vendor' | 'admin';
}

interface ConversationWithMeta extends Lead {
  lastMessage?: Message;
  unreadCount: number;
}

export function ConversationList({
  leads,
  selectedLeadId,
  onSelectLead,
  currentUserId,
  userRole,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  // Enrich conversations with meta data
  const enrichConversations = useCallback(async () => {
    const enriched = await Promise.all(
      leads.map(async (lead) => {
        // Get last message
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('lead_id', lead.id)
          .eq('receiver_id', currentUserId)
          .eq('read', false);

        return {
          ...lead,
          lastMessage: messages?.[0],
          unreadCount: count || 0,
        };
      })
    );

    setConversations(enriched);
  }, [leads, currentUserId, supabase]);

  // Initial fetch
  useEffect(() => {
    if (leads.length > 0) {
      enrichConversations();
    } else {
      setConversations([]);
    }
  }, [leads, enrichConversations]);

  // Subscribe to ALL message changes for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Instantly update conversations
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === newMessage.lead_id) {
                return {
                  ...conv,
                  lastMessage: newMessage,
                  unreadCount:
                    newMessage.receiver_id === currentUserId
                      ? conv.unreadCount + 1
                      : conv.unreadCount,
                };
              }
              return conv;
            })
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;

          // Decrease unread count when message is read
          if (updatedMessage.read) {
            setConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === updatedMessage.lead_id) {
                  return {
                    ...conv,
                    unreadCount: Math.max(0, conv.unreadCount - 1),
                  };
                }
                return conv;
              })
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversation list real-time connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations
    .filter((conv) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const eventType = conv.event?.event_type?.toLowerCase() || conv.events?.event_type?.toLowerCase() || '';
      const businessName = conv.vendor?.business_name?.toLowerCase() || conv.vendors?.business_name?.toLowerCase() || '';
      const packageName = conv.package?.name?.toLowerCase() || conv.packages?.name?.toLowerCase() || '';
      const plannerName = conv.users?.full_name?.toLowerCase() || '';

      return (
        eventType.includes(searchLower) ||
        businessName.includes(searchLower) ||
        packageName.includes(searchLower) ||
        plannerName.includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by last message time
      const aTime = a.lastMessage?.created_at || a.created_at;
      const bTime = b.lastMessage?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
        <p className="text-sm text-slate-600">
          {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
        </p>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isSelected = selectedLeadId === conv.id;
            const displayName =
              userRole === 'vendor'
                ? conv.event?.event_type || conv.events?.event_type || conv.users?.full_name || 'Planner'
                : conv.vendor?.business_name || conv.vendors?.business_name || 'Vendor';

            return (
              <button
                key={conv.id}
                onClick={() => onSelectLead(conv.id)}
                className={`w-full border-b border-slate-100 p-4 text-left transition-all duration-150 hover:bg-slate-50 active:bg-slate-100 ${
                  isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md transition-transform duration-150 hover:scale-105">
                    {getInitials(displayName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold truncate transition-colors ${
                          conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {displayName}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatRelativeTime(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate transition-all ${
                          conv.unreadCount > 0
                            ? 'font-medium text-slate-900'
                            : 'text-slate-600'
                        }`}
                      >
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-xs font-semibold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={conv.status === 'booked' ? 'success' : 'default'} className="text-xs">
                        {conv.status}
                      </Badge>
                      {userRole === 'vendor' && (conv.event || conv.events) && (
                        <span className="text-xs text-slate-500">
                          {(conv.event || conv.events)?.guest_count} guests • ${(conv.event || conv.events)?.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {userRole === 'vendor'
                ? 'Wait for planners to request quotes'
                : 'Request quotes from packages to start conversations'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
