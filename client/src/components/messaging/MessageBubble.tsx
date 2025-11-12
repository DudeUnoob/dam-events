'use client';

import { MessageWithStatus } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Check, CheckCheck, Clock, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageWithStatus;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
  senderName?: string; // Name of the message sender
  currentUserName?: string; // Name of current user
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  isGrouped = false,
  senderName,
  currentUserName
}: MessageBubbleProps) {
  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = isOwnMessage ? currentUserName : senderName;
  const initials = getInitials(displayName);
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case 'sending':
        return <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />;
      case 'sent':
        return <Check className="h-3.5 w-3.5 text-slate-400" />;
      case 'delivered':
        return message.read ? (
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
        ) : (
          <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
        );
      case 'failed':
        return null; // Handled separately in MessageThread
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      className={`flex items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } ${isGrouped ? 'mt-0.5' : 'mt-4'}`}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
          <span>{initials}</span>
        </div>
      )}
      {!isOwnMessage && !showAvatar && <div className="w-8" />}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] sm:max-w-[60%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name for received messages */}
        {!isOwnMessage && !isGrouped && senderName && (
          <span className="text-xs font-medium text-slate-600 mb-1 px-1">
            {senderName}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
            message.status === 'failed'
              ? 'bg-red-50 border border-red-300 text-red-900'
              : isOwnMessage
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
          } ${
            message.status === 'sending' ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Message metadata */}
        {!isGrouped && (
          <div
            className={`flex items-center gap-1.5 mt-1 px-1 ${
              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <span className="text-xs text-slate-500">
              {formatRelativeTime(message.created_at)}
            </span>

            {/* Status icon for own messages */}
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Avatar spacing for sent messages */}
      {isOwnMessage && <div className="w-8" />}
    </div>
  );
}
