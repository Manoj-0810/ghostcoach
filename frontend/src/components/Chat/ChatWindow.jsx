import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory } from '../../services/api';
import { Send, MessageCircle, Bot, User, Loader2 } from 'lucide-react';

export default function ChatWindow({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await getChatHistory(sessionId);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    // Optimistically add user message
    const userMsg = { role: 'USER', content: msg, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, msg);
      const aiMsg = res.data.data;
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'ASSISTANT',
        content: 'Sorry, I couldn\'t process your message. Please try again.',
        createdAt: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="glass-card flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800/50">
        <MessageCircle className="w-5 h-5 text-ghost-400" />
        <h3 className="font-display font-semibold text-white">Coach Chat</h3>
        <span className="text-xs text-gray-500 ml-auto">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-ghost-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-10 h-10 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">Ask Ghost Coach about your session</p>
            <p className="text-gray-600 text-xs mt-1">Get drill tips, technique explanations, and more</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))
        )}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-ghost-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-ghost-400" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ghost-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-ghost-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-ghost-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-800/50">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your technique..."
            className="input-field flex-1 py-2.5 text-sm"
            maxLength={2000}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl gradient-bg text-white disabled:opacity-40 
                       hover:opacity-90 transition-all shadow-lg shadow-ghost-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function formatMessage(content) {
  if (!content) return null;

  // Pre-process continuous text from AI: split numbering or coach cues into lines
  // Replace spacing before "**1.", "**2.", "*Coach's Cue:*" with double newlines
  const preProcessed = content
    .replace(/\s+\*\*(\d+\.)/g, '\n\n**$1')
    .replace(/\s+\*Coach's\s+Cue:\*/gi, '\n\n*Coach\'s Cue:*');

  // Split content by paragraph gaps (double newlines)
  const paragraphs = preProcessed.split(/\n\n+/);

  return paragraphs.map((paragraph, pIdx) => {
    const lines = paragraph.split('\n');

    return (
      <div key={pIdx} className="mb-5 last:mb-0 text-left space-y-2.5">
        {lines.map((line, lIdx) => {
          const cleanLine = line.trim();
          if (!cleanLine) return null;

          // Check if line matches a numbered list prefix like "1. " or "**1. "
          const numberMatch = cleanLine.match(/^(\*?\*?)(\d+)\.\s+(.*)/);
          const bulletMatch = cleanLine.match(/^([-*•]\s+)(.*)/);

          let prefix = null;
          let remainingText = cleanLine;

          if (numberMatch) {
            const num = numberMatch[2];
            prefix = (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ghost-500/20 text-ghost-400 text-[10.5px] font-bold mr-2 flex-shrink-0 mt-0.5 select-none">
                {num}
              </span>
            );
            // Reconstruct the remaining text by putting the bold tags back if they were outside the number
            remainingText = numberMatch[1] + numberMatch[3];
          } else if (bulletMatch) {
            prefix = (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 mr-2.5 flex-shrink-0 mt-2 select-none" />
            );
            remainingText = bulletMatch[2];
          }

          // Inline styling helper for bold (**) and italics (*)
          const renderInlineStyles = (text) => {
            const parts = [];
            const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(text)) !== null) {
              const matchText = match[0];
              const matchIndex = match.index;

              // Preceding plain text
              if (matchIndex > lastIndex) {
                parts.push(text.substring(lastIndex, matchIndex));
              }

              if (matchText.startsWith('**') && matchText.endsWith('**')) {
                parts.push(
                  <strong key={matchIndex} className="font-semibold text-white">
                    {matchText.substring(2, matchText.length - 2)}
                  </strong>
                );
              } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
                parts.push(
                  <em key={matchIndex} className="italic text-ghost-300">
                    {matchText.substring(1, matchText.length - 1)}
                  </em>
                );
              }

              lastIndex = regex.lastIndex;
            }

            if (lastIndex < text.length) {
              parts.push(text.substring(lastIndex));
            }

            return parts.length > 0 ? parts : text;
          };

          return (
            <div
              key={lIdx}
              className={`flex items-start leading-relaxed text-gray-300 font-sans tracking-wide text-[14px] ${
                prefix ? 'py-0.5' : ''
              }`}
            >
              {prefix}
              <span className="flex-1">
                {renderInlineStyles(remainingText)}
              </span>
            </div>
          );
        })}
      </div>
    );
  });
}

function ChatBubble({ message }) {
  const isUser = message.role === 'USER';
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-brand-500/20' : 'bg-ghost-500/20'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-brand-400" />
        ) : (
          <Bot className="w-4 h-4 text-ghost-400" />
        )}
      </div>
      <div className={`max-w-[78%] ${isUser ? 'text-right' : ''}`}>
        <div className={`px-5 py-3.5 rounded-2xl ${
          isUser
            ? 'bg-brand-600/20 text-gray-200 rounded-tr-md border border-brand-500/20 text-left'
            : message.isError
              ? 'bg-danger-500/10 text-danger-400 rounded-tl-md border border-danger-500/20 text-left'
              : 'glass-card rounded-tl-md text-gray-300 text-left'
        }`}>
          {isUser ? (
            <p className="text-[13.5px] leading-relaxed text-gray-200">{message.content}</p>
          ) : (
            formatMessage(message.content)
          )}
        </div>
        <span className="text-[10px] text-gray-600 mt-1 inline-block px-1">{time}</span>
      </div>
    </div>
  );
}
