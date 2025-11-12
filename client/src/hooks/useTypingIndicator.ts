import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TypingState {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

export function useTypingIndicator(leadId: string, currentUserId: string) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const supabase = createClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Notify others that current user is typing
  const notifyTyping = useCallback(() => {
    if (!channelRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing event
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        isTyping: true,
        timestamp: Date.now(),
      },
    });

    // Automatically stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId: currentUserId,
            isTyping: false,
            timestamp: Date.now(),
          },
        });
      }
    }, 3000);
  }, [currentUserId]);

  // Stop typing notification
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          isTyping: false,
          timestamp: Date.now(),
        },
      });
    }
  }, [currentUserId]);

  // Subscribe to typing events
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${leadId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const typingState = payload as TypingState;

        // Only update if it's not the current user
        if (typingState.userId !== currentUserId) {
          setIsOtherUserTyping(typingState.isTyping);

          // Auto-clear typing indicator after 5 seconds
          if (typingState.isTyping) {
            setTimeout(() => {
              setIsOtherUserTyping(false);
            }, 5000);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [leadId, currentUserId, supabase]);

  return {
    isOtherUserTyping,
    notifyTyping,
    stopTyping,
  };
}
