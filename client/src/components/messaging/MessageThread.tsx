'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Message } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Send } from 'lucide-react';

interface MessageThreadProps {
  leadId: string;
  currentUserId: string;
  initialMessages?: Message[];
}

export function MessageThread({ leadId, currentUserId, initialMessages = [] }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);

    // TODO: Implement message sending with Supabase
    const mockMessage: Message = {
      id: `msg-${Date.now()}`,
      lead_id: leadId,
      sender_id: currentUserId,
      receiver_id: 'other-user',
      content: newMessage,
      read: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, mockMessage]);
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => {
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
          })
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
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
