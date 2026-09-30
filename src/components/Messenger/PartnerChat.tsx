import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Trash2, 
  Users, 
  Check, 
  Sparkles,
  ShieldCheck,
  CheckCheck,
  X,
  AlertTriangle,
  Copy,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';
import { getPartnerForUser, getAllPartnersForUser } from '../../utils/partnerHelper';
import { pushAppNotification } from '../../utils/notifications';

interface PartnerChatProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
}

const EMOJI_REACTIONS = ['🔥', '🚀', '💡', '🎯', '❤️'];

export const PartnerChat: React.FC<PartnerChatProps> = ({ appData, onUpdateData }) => {
  const [inputText, setInputText] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastNotice, setToastNotice] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const foundersList = Object.values(appData.founders);
  const activeUser = appData.founders[appData.activeFounderId] || foundersList[0] || {
    id: 'user_1',
    name: 'You',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const connectedPartners = getAllPartnersForUser(appData, activeUser.id);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    connectedPartners[0]?.id || ''
  );

  useEffect(() => {
    if (connectedPartners.length > 0 && (!selectedPartnerId || !connectedPartners.some(p => p.id === selectedPartnerId))) {
      setSelectedPartnerId(connectedPartners[0].id);
    }
  }, [connectedPartners]);

  const partnerUser = connectedPartners.find((p) => p.id === selectedPartnerId) || connectedPartners[0] || null;
  const isPartnerConnected = !!partnerUser;

  const partnerStatus = partnerUser ? (appData.partnerStatuses[partnerUser.id] || {
    isOnline: true,
    lastSeen: 'Active now',
  }) : {
    isOnline: false,
    lastSeen: 'Not connected',
  };

  // Filter messages specifically for the selected active partner conversation
  const filteredMessages = (appData.messages || []).filter((msg) => {
    if (!partnerUser) return true;
    return (
      (msg.senderId === activeUser.id && msg.recipientId === partnerUser.id) ||
      (msg.senderId === partnerUser.id && msg.recipientId === activeUser.id) ||
      (msg.recipientId === 'all')
    );
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!isSelectionMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isSelectionMode]);

  // Send pure text message with real-time push notification & vibration
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderAvatar: activeUser.avatar,
      recipientId: selectedPartnerId || 'all',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
    };

    setInputText('');
    let updated = { ...appData, messages: [...(appData.messages || []), newMsg] };

    if (partnerUser) {
      updated = pushAppNotification(updated, {
        type: 'message',
        title: `💬 New Message from ${activeUser.name}`,
        message: textToSend,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: partnerUser.id,
        actionTab: 'chat',
        timestamp: 'Just now',
      });
    }

    saveAppData(updated, true);
    await cloudSync.syncState(updated);
    await cloudSync.sendChatMessage(newMsg);
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete a single message
  const handleDeleteMessage = async (msgId: string) => {
    const updated = { ...appData, messages: (appData.messages || []).filter((m) => m.id !== msgId) };
    saveAppData(updated, true);
    await cloudSync.syncState(updated);
    await cloudSync.deleteChatMessage(msgId);
    setToastNotice('🗑️ Message deleted');
    setTimeout(() => setToastNotice(''), 2500);
  };

  // Clear all messages
  const handleConfirmClearAll = async () => {
    const updated = { ...appData, messages: [] };
    saveAppData(updated, true);
    await cloudSync.syncState(updated);
    setIsClearModalOpen(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
    setToastNotice('🗑️ All chat messages cleared');
    setTimeout(() => setToastNotice(''), 3000);
  };

  // Delete selected batch
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const updated = { ...appData, messages: (appData.messages || []).filter((m) => !selectedIds.includes(m.id)) };
    saveAppData(updated, true);
    await cloudSync.syncState(updated);
    setToastNotice(`🗑️ Deleted ${selectedIds.length} message(s)`);
    setSelectedIds([]);
    setIsSelectionMode(false);
    setTimeout(() => setToastNotice(''), 3000);
  };

  const handleToggleSelect = (msgId: string) => {
    setSelectedIds((prev) => 
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === appData.messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(appData.messages.map((m) => m.id));
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastNotice('📋 Message text copied!');
    setTimeout(() => setToastNotice(''), 2000);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    const updated = {
      ...appData,
      messages: appData.messages.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions[emoji] || [];
        const hasReacted = currentReactions.includes(activeUser.id);
        const nextList = hasReacted
          ? currentReactions.filter((id) => id !== activeUser.id)
          : [...currentReactions, activeUser.id];
        return {
          ...m,
          reactions: {
            ...m.reactions,
            [emoji]: nextList,
          },
        };
      }),
    };
    saveAppData(updated, true);
    onUpdateData(updated);
    setShowEmojiPicker(null);
  };

  return (
    <div className="space-y-3 max-w-3xl mx-auto font-sans pb-12">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-2.5 px-4 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <span>{toastNotice}</span>
            <button onClick={() => setToastNotice('')} className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer ml-2">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Messenger Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[75vh] min-h-[520px]">
        
        {/* Chat Top Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={partnerUser ? partnerUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={partnerUser ? partnerUser.name : 'Partner'}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                partnerStatus.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {connectedPartners.length > 1 ? (
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="text-xs px-2 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold outline-none cursor-pointer"
                  >
                    {connectedPartners.map((p) => (
                      <option key={p.id} value={p.id}>💬 {p.name}</option>
                    ))}
                  </select>
                ) : (
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {partnerUser ? partnerUser.name : 'Waiting for Partner to Connect'}
                  </h3>
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  partnerStatus.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {partnerStatus.isOnline ? 'Active Now' : 'Not Linked Yet'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {partnerUser ? `${partnerUser.role} • Direct Bilateral Chat` : `Share your code ${activeUser.inviteCode} to pair`}
              </p>
            </div>
          </div>

          {/* Right Actions: Selection Mode, Clear All History */}
          <div className="flex items-center gap-1.5">
            {appData.messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isSelectionMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                  title="Select Multiple Messages to Delete"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isSelectionMode ? 'Cancel' : 'Select'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition cursor-pointer flex items-center gap-1 shadow-2xs bg-white"
                  title="Clear All Chat History / সব মেসেজ ডিলিট করুন"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clear All</span>
                </button>
              </>
            )}
            
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Private</span>
            </div>
          </div>
        </div>

        {/* Batch Selection Action Bar (when isSelectionMode is active) */}
        {isSelectionMode && (
          <div className="p-2.5 bg-indigo-600 text-white flex items-center justify-between px-4 text-xs font-bold animate-in fade-in shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="underline hover:text-indigo-200 cursor-pointer text-[11px]"
              >
                {selectedIds.length === appData.messages.length ? 'Deselect All' : 'Select All'}
              </button>
              <span>{selectedIds.length} Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                  selectedIds.length > 0
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs active:scale-95'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="p-1 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9fe]">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <MessageSquare className="w-6 h-6 stroke-2" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Direct Co-Founder Chat</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Pure lightweight text messenger. Real-time notifications and vibration alert your partner immediately.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputText("Hey! Ready for today's sprints? 🚀");
                  }}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 shadow-2xs transition cursor-pointer"
                >
                  "Hey! Ready for today's sprints? 🚀"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText("Meeting scheduled for 9 PM, see you there! 🤝");
                  }}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 shadow-2xs transition cursor-pointer"
                >
                  "Meeting scheduled for 9 PM, see you there! 🤝"
                </button>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderId === activeUser.id;
              const isSelected = selectedIds.includes(msg.id);
              const sender = appData.founders[msg.senderId] || {
                name: msg.senderName,
                avatar: msg.senderAvatar,
              };

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Selection Checkbox in Select Mode */}
                  {isSelectionMode && (
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(msg.id)}
                      className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer self-center"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 fill-indigo-50" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                  )}

                  {/* Partner Avatar for incoming messages */}
                  {!isMe && (
                    <img
                      src={sender.avatar}
                      alt={sender.name}
                      className="w-7 h-7 rounded-xl object-cover border border-white shadow-2xs mb-1 shrink-0"
                    />
                  )}

                  {/* Message Bubble Column */}
                  <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* Sender Name for incoming */}
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-500 pl-1 block">
                        {sender.name}
                      </span>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words font-medium select-text">
                        {msg.content}
                      </p>

                      {/* Timestamp & read mark */}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-mono select-none ${
                        isMe ? 'text-indigo-200' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-200 inline" />}
                      </div>

                      {/* Displayed Emoji Reactions */}
                      {msg.reactions && Object.entries(msg.reactions).some(([_, users]) => users.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/10">
                          {Object.entries(msg.reactions).map(([emoji, users]) => {
                            if (users.length === 0) return null;
                            const didIReact = users.includes(activeUser.id);
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-0.5 transition cursor-pointer ${
                                  didIReact
                                    ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                                    : 'bg-black/10 text-white'
                                }`}
                              >
                                <span>{emoji}</span>
                                {users.length > 1 && <span>{users.length}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Bubble Action Controls: Quick Emoji Reaction, Copy & 1-Tap Delete Message */}
                    <div className={`flex items-center gap-1 transition-opacity ${
                      isMe ? 'justify-end pr-1' : 'justify-start pl-1'
                    }`}>
                      {/* Emoji Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Add reaction"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>

                        {/* Floating Quick Reaction Bar */}
                        {showEmojiPicker === msg.id && (
                          <div className={`absolute bottom-6 z-20 flex items-center gap-1 p-1 bg-white rounded-full shadow-lg border border-slate-200 animate-in fade-in ${
                            isMe ? 'right-0' : 'left-0'
                          }`}>
                            {EMOJI_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className="w-7 h-7 hover:scale-125 transition flex items-center justify-center text-sm cursor-pointer rounded-full hover:bg-slate-50"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Copy Message Text */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.content)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Copy text"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {/* 1-Tap Delete Message Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete this message (মেসেজটি মুছুন)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Pure Text Fast Messenger */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-end gap-2 shrink-0">
          <div className="flex-1 relative bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none outline-none max-h-28"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
              inputText.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 stroke-2" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>

      {/* Clear All Messages Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-100 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Clear All Messages? (সব মেসেজ মুছবেন?)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete all {appData.messages.length} messages in this chat? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md transition active:scale-95"
              >
                Yes, Delete All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightweight Info Banner */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        Pure text messenger • Messages trigger instant bilateral notification & phone vibration
      </div>
    </div>
  );
};
