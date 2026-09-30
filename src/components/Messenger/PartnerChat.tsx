import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Users, 
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { ChatMessage, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';

interface PartnerChatProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

const EMOJI_REACTIONS = ['🔥', '🚀', '💡', '🎯', '❤️'];

export const PartnerChat: React.FC<PartnerChatProps> = ({ appData, onUpdateData }) => {
  const [activeView, setActiveView] = useState<'chat' | 'scratchpad'>('chat');
  const [inputText, setInputText] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [scratchpadText, setScratchpadText] = useState(appData.sharedScratchpad || '');
  const [copiedScratchpad, setCopiedScratchpad] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const partnerUser = appData.partnerConnection.pairedUserId && appData.founders[appData.partnerConnection.pairedUserId]
    ? appData.founders[appData.partnerConnection.pairedUserId]
    : foundersList.find((f) => f.id !== activeUser.id) || {
        id: 'user_2',
        name: 'Co-Founder Partner',
        role: 'Creative & Strategy',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      };

  useEffect(() => {
    setScratchpadText(appData.sharedScratchpad || '');
  }, [appData.sharedScratchpad]);

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appData.messages, activeView]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      recipientId: recipientFilter,
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };

    const updated = {
      ...appData,
      messages: [...appData.messages, newMsg],
    };
    saveAppData(updated);
    onUpdateData(updated);
    setInputText('');
  };

  const handleDeleteMessage = (msgId: string) => {
    const updated = {
      ...appData,
      messages: appData.messages.filter((m) => m.id !== msgId),
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleClearAllMessages = () => {
    const updated = {
      ...appData,
      messages: [],
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    const updatedMsgs = appData.messages.map((m) => {
      if (m.id !== msgId) return m;
      const currentList = m.reactions[emoji] || [];
      const hasReacted = currentList.includes(activeUser.id);
      const newList = hasReacted
        ? currentList.filter((uid) => uid !== activeUser.id)
        : [...currentList, activeUser.id];

      return {
        ...m,
        reactions: {
          ...m.reactions,
          [emoji]: newList,
        },
      };
    });

    const updated = { ...appData, messages: updatedMsgs };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleScratchpadChange = (newVal: string) => {
    setScratchpadText(newVal);
    const updated = {
      ...appData,
      sharedScratchpad: newVal,
      scratchpadLastUpdated: new Date().toISOString(),
    };
    saveAppData(updated);
    onUpdateData(updated);
  };

  const handleCopyScratchpad = () => {
    navigator.clipboard.writeText(scratchpadText);
    setCopiedScratchpad(true);
    setTimeout(() => setCopiedScratchpad(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([scratchpadText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aimsh-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="app-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Partner Messenger & Shared Notes
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Private co-founder communication channel with synchronized scratchpad.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeView === 'chat'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat ({appData.messages.length})
          </button>
          <button
            onClick={() => setActiveView('scratchpad')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeView === 'scratchpad'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Scratchpad
          </button>
        </div>
      </div>

      {activeView === 'chat' ? (
        /* Messenger View */
        <div className="app-card flex flex-col h-[560px] overflow-hidden">
          
          {/* Chat Partner Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={partnerUser.avatar}
                  alt={partnerUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {partnerUser.name}
                </h4>
                <p className="text-[10px] text-slate-500">{partnerUser.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">
                Synced Mode
              </span>
              {appData.messages.length > 0 && (
                <button
                  onClick={handleClearAllMessages}
                  className="p-1 px-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition flex items-center gap-1"
                  title="Clear all messages"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {appData.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No messages yet</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Send a quick update, link, or voice note to collaborate with your co-founder.
                </p>
              </div>
            ) : (
              appData.messages.map((msg) => {
                const isMe = msg.senderId === activeUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`group/msg flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-medium">
                      <span>{isMe ? 'You' : msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className={`relative flex items-center gap-1.5 max-w-[88%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`p-3 rounded-2xl text-xs break-words ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Delete Single Message Button */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                        title="Delete message"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1 px-1">
                      {EMOJI_REACTIONS.map((em) => {
                        const count = msg.reactions[em]?.length || 0;
                        const userReacted = msg.reactions[em]?.includes(activeUser.id);

                        return (
                          <button
                            key={em}
                            onClick={() => handleToggleReaction(msg.id, em)}
                            className={`text-[11px] px-1.5 py-0.5 rounded-full border transition flex items-center gap-0.5 ${
                              userReacted
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                : count > 0
                                ? 'bg-white border-slate-200 text-slate-600'
                                : 'opacity-0 hover:opacity-100 bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <span>{em}</span>
                            {count > 0 && <span className="text-[10px] font-mono">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer with Partner Selector */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Recipient Target Selector */}
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">To:</span>
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Partners</option>
                {foundersList
                  .filter((f) => f.id !== activeUser.id)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.role})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message in any language (বাংলা, English)..."
                className="flex-1 app-input px-3.5 py-2 text-xs"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>

        </div>
      ) : (
        /* Shared Scratchpad View */
        <div className="app-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Live Co-Founder Scratchpad
              </h3>
              <p className="text-[11px] text-slate-500">
                Shared draft pad for video hooks, pitch outlines, and quick meeting notes.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyScratchpad}
                className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
              >
                {copiedScratchpad ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScratchpad ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          <textarea
            value={scratchpadText}
            onChange={(e) => handleScratchpadChange(e.target.value)}
            placeholder="Write shared strategy notes, video hooks, client call bullet points... (auto-saved)"
            rows={14}
            className="w-full app-input p-3.5 font-mono text-xs leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Real-time sync active across partner devices</span>
            <span>Last updated: {new Date(appData.scratchpadLastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

    </div>
  );
};
