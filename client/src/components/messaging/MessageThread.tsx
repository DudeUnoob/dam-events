'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MessageThreadProps {
  leadId: string;
  currentUserId: string;
  receiverId: string;
  initialMessages?: Message[];
}

export function MessageThread({
  leadId,
  currentUserId,
  receiverId,
  initialMessages = []
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?leadId=${leadId}`);
        const data = await response.json();

        if (response.ok && data.data) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [leadId]);

  // Subscribe to new messages with Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, supabase]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (m) => m.receiver_id === currentUserId && !m.read
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          receiverId,
          content: newMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        // Message will be added via Realtime subscription
        setNewMessage('');
      } else {
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500">No messages yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="self-end"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
