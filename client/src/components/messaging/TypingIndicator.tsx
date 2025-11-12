'use client';

interface TypingIndicatorProps {
  senderName?: string;
}

export function TypingIndicator({ senderName = 'User' }: TypingIndicatorProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(senderName);

  return (
    <div className="flex items-end gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
        <span>{initials}</span>
      </div>

      {/* Typing bubble */}
      <div className="flex flex-col items-start">
        <div className="rounded-2xl rounded-bl-md px-5 py-3 bg-white border border-slate-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          </div>
        </div>
        <span className="text-xs text-slate-500 mt-1 px-1">
          {senderName} is typing...
        </span>
      </div>
    </div>
  );
}
