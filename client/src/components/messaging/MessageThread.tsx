'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { MessageWithStatus } from '@/types';
import { Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useToast } from '@/components/ui/Toast';

interface MessageThreadProps {
  leadId: string;
  currentUserId: string;
  receiverId: string;
  senderName?: string; // Other person's name
  currentUserName?: string; // Current user's name
  initialMessages?: MessageWithStatus[];
}

export function MessageThread({
  leadId,
  currentUserId,
  receiverId,
  senderName,
  currentUserName,
  initialMessages = []
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageWithStatus[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const { showToast } = useToast();

  // Typing indicator
  const { isOtherUserTyping, notifyTyping, stopTyping } = useTypingIndicator(leadId, currentUserId);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?leadId=${leadId}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setMessages(data.data.map((msg: any) => ({
            ...msg,
            status: 'delivered' as const
          })));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        showToast('Failed to load messages', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [leadId, showToast]);

  // Subscribe to new messages with Realtime
  useEffect(() => {
    setRealtimeStatus('connecting');

    const channel = supabase
      .channel(`messages:${leadId}`, {
        config: {
          broadcast: { self: false }, // Don't receive own broadcasts
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log('📨 New message received via Realtime:', payload);
          const newMsg = payload.new as MessageWithStatus;

          setMessages((prev) => {
            // Check if this is an optimistic update we need to replace
            const optimisticIndex = prev.findIndex(m =>
              m.tempId && m.content === newMsg.content && m.sender_id === newMsg.sender_id
            );

            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
              const updated = [...prev];
              updated[optimisticIndex] = {
                ...newMsg,
                status: 'delivered'
              };
              return updated;
            }

            // Check for actual duplicates by ID
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
            }

            // Add new message
            return [...prev, { ...newMsg, status: 'delivered' }];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log('✏️ Message updated via Realtime:', payload);
          const updatedMsg = payload.new as MessageWithStatus;
          setMessages((prev) =>
            prev.map(m => m.id === updatedMsg.id ? { ...updatedMsg, status: 'delivered' } : m)
          );
        }
      )
      .subscribe((status, error) => {
        console.log('🔌 Realtime subscription status:', status, error);

        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected for messages');
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime connection error:', error);
          setRealtimeStatus('disconnected');
          showToast('Real-time updates disconnected. Messages may not sync.', 'error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime connection timed out');
          setRealtimeStatus('disconnected');
          showToast('Connection timed out. Trying to reconnect...', 'error');
        } else if (status === 'CLOSED') {
          console.log('🔌 Realtime connection closed');
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      console.log('🔌 Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
      setRealtimeStatus('disconnected');
    };
  }, [leadId, supabase, showToast]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isOtherUserTyping]);

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (m) => m.receiver_id === currentUserId && !m.read && m.status !== 'sending'
      );

      for (const message of unreadMessages) {
        try {
          await fetch(`/api/messages/${message.id}/read`, {
            method: 'PUT',
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    };

    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, currentUserId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Optimistic update - add message immediately
    const optimisticMessage: MessageWithStatus = {
      id: tempId,
      tempId,
      lead_id: leadId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: messageContent,
      read: false,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);
    stopTyping();

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          content: messageContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        // Update optimistic message with real data
        setMessages(prev =>
          prev.map(m =>
            m.tempId === tempId
              ? { ...data.data, status: 'sent' as const }
              : m
          )
        );
        textareaRef.current?.focus();
      } else {
        throw new Error(data.error?.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Mark message as failed
      setMessages(prev =>
        prev.map(m =>
          m.tempId === tempId
            ? { ...m, status: 'failed' as const, error: error.message }
            : m
        )
      );

      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, leadId, currentUserId, receiverId, stopTyping, showToast]);

  const handleRetry = useCallback(async (message: MessageWithStatus) => {
    if (!message.tempId) return;

    // Update status to sending
    setMessages(prev =>
      prev.map(m => m.tempId === message.tempId ? { ...m, status: 'sending' as const, error: undefined } : m)
    );

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          content: message.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setMessages(prev =>
          prev.map(m =>
            m.tempId === message.tempId
              ? { ...data.data, status: 'sent' as const }
              : m
          )
        );
        showToast('Message sent', 'success');
      } else {
        throw new Error(data.error?.message || 'Failed to send message');
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.tempId === message.tempId
            ? { ...m, status: 'failed' as const, error: error.message }
            : m
        )
      );
      showToast('Failed to retry message', 'error');
    }
  }, [leadId, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      notifyTyping();
    }
  };

  // Group consecutive messages from the same sender
  const groupMessages = (msgs: MessageWithStatus[]) => {
    const grouped: Array<{ message: MessageWithStatus; isGrouped: boolean }> = [];

    msgs.forEach((msg, index) => {
      const prevMsg = msgs[index - 1];
      const isGrouped = prevMsg && prevMsg.sender_id === msg.sender_id;
      grouped.push({ message: msg, isGrouped });
    });

    return grouped;
  };

  const groupedMessages = groupMessages(messages);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Connection Status Indicator */}
      {realtimeStatus !== 'connected' && (
        <div className={`px-4 py-2 text-sm text-center ${
          realtimeStatus === 'connecting'
            ? 'bg-yellow-50 text-yellow-800 border-b border-yellow-200'
            : 'bg-red-50 text-red-800 border-b border-red-200'
        }`}>
          {realtimeStatus === 'connecting' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Connecting to real-time messaging...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Real-time messaging disconnected. Messages may not sync automatically.
            </span>
          )}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1">
        {groupedMessages.length > 0 ? (
          <>
            {groupedMessages.map(({ message, isGrouped }) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const showAvatar = !isGrouped;

              return (
                <div key={message.tempId || message.id}>
                  <MessageBubble
                    message={message}
                    isOwnMessage={isOwnMessage}
                    showAvatar={showAvatar}
                    isGrouped={isGrouped}
                    senderName={senderName}
                    currentUserName={currentUserName}
                  />

                  {/* Failed message retry option */}
                  {isOwnMessage && message.status === 'failed' && (
                    <div className="flex justify-end mb-2 animate-in fade-in slide-in-from-right-2">
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-700">Failed to send</span>
                        <button
                          onClick={() => handleRetry(message)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isOtherUserTyping && <TypingIndicator senderName={senderName} />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-slate-600 font-medium">No messages yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="resize-none min-h-[44px] max-h-32 border-slate-300 focus:border-primary-500 focus:ring-primary-500 transition-all"
              disabled={sending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="lg"
            className="h-11 w-11 p-0 flex-shrink-0 transition-all hover:scale-105"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
