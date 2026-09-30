import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ExternalLink, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgencyClient, SharedAppData } from '../../types';
import { saveAppData } from '../../utils/storage';
import { pushAppNotification, triggerMobileAlert } from '../../utils/notifications';

interface AgencyClientsHubProps {
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onBackToHome?: () => void;
}

export const AgencyClientsHub: React.FC<AgencyClientsHubProps> = ({
  appData,
  onUpdateData,
  onBackToHome,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<AgencyClient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [status, setStatus] = useState<AgencyClient['status']>('Active / Retainer');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');

  const activeUser = appData.founders[appData.activeFounderId] || {
    id: 'user_1',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const clients: AgencyClient[] = appData.clients || [];

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const activeCount = clients.filter((c) => c.status === 'Active / Retainer').length;
  const leadCount = clients.filter((c) => c.status === 'Lead' || c.status === 'Negotiation').length;
  const deliveredCount = clients.filter((c) => c.status === 'Delivered').length;

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    if (editingClient) {
      // Update existing
      const updatedClients = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              name: clientName.trim(),
              service: service.trim() || 'Agency Service',
              dealValue: dealValue.trim() || '$0',
              status,
              nextAction: nextAction.trim() || 'Follow up',
              notes: notes.trim(),
              contact: contact.trim(),
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      const updated = {
        ...appData,
        clients: updatedClients,
      };

      saveAppData(updated);
      onUpdateData(updated);
      setEditingClient(null);
    } else {
      // Create new
      const newClient: AgencyClient = {
        id: `client-${Date.now()}`,
        name: clientName.trim(),
        service: service.trim() || 'Agency Service',
        dealValue: dealValue.trim() || '$0',
        status,
        nextAction: nextAction.trim() || 'Follow up with client',
        notes: notes.trim(),
        contact: contact.trim(),
        addedBy: activeUser.id,
        addedByName: activeUser.name,
        createdAt: new Date().toISOString(),
      };

      triggerMobileAlert({
        title: `🤝 New Client Added!`,
        message: `${activeUser.name} added "${clientName.trim()}" (${dealValue.trim() || '$0'}) to the client sheet.`,
        vibratePattern: [200, 100, 200],
      });

      const partnerId = appData.partnerConnection.pairedUserId || 'all';

      const updated = pushAppNotification(
        {
          ...appData,
          clients: [newClient, ...clients],
        },
        {
          type: 'client',
          title: `🤝 New Client: ${clientName.trim()}`,
          message: `${activeUser.name} added "${clientName.trim()}" (${dealValue.trim() || '$0'}) for ${service.trim() || 'services'}.`,
          senderId: activeUser.id,
          senderName: activeUser.name,
          senderAvatar: activeUser.avatar,
          targetUserId: partnerId,
          actionTab: 'clients',
          timestamp: 'Just now',
        }
      );

      onUpdateData(updated);
    }

    // Reset Form
    setClientName('');
    setService('');
    setDealValue('');
    setStatus('Active / Retainer');
    setNextAction('');
    setNotes('');
    setContact('');
    setIsAddModalOpen(false);
  };

  const handleEditClick = (client: AgencyClient) => {
    setEditingClient(client);
    setClientName(client.name);
    setService(client.service);
    setDealValue(client.dealValue);
    setStatus(client.status);
    setNextAction(client.nextAction);
    setNotes(client.notes);
    setContact(client.contact || '');
    setIsAddModalOpen(true);
  };

  const [deleteNotice, setDeleteNotice] = useState('');

  const handleDeleteClient = (clientId: string, clientTitle: string) => {
    const updatedClients = clients.filter((c) => c.id !== clientId);
    const updated = {
      ...appData,
      clients: updatedClients,
    };
    saveAppData(updated, true);
    onUpdateData(updated);
    setDeleteNotice(`🗑️ Client "${clientTitle}" deleted.`);
    setTimeout(() => setDeleteNotice(''), 3000);
  };

  const getStatusColor = (st: AgencyClient['status']) => {
    switch (st) {
      case 'Active / Retainer':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Negotiation':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Lead':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans pb-16">
      
      {/* Delete / Action Notice Toast */}
      {deleteNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs">
          <span>{deleteNotice}</span>
          <button onClick={() => setDeleteNotice('')} className="text-amber-700 font-bold">✕</button>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-mono">
              Agency CRM Sheet
            </span>
            <span className="text-xs font-bold text-slate-500">
              {clients.length} Clients Total
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Client Sheet & Pipeline (ক্লাইয়েন্ট শিট)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active clients, deals, retainers & next action deliverables with bilateral real-time sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
            >
              Back to Dashboard
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingClient(null);
              setClientName('');
              setService('');
              setDealValue('');
              setStatus('Active / Retainer');
              setNextAction('');
              setNotes('');
              setContact('');
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-slate-900/15 cursor-pointer transition"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>+ Add New Client</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Retainers</span>
          <p className="text-xl font-black text-emerald-600">{activeCount}</p>
          <span className="text-[10px] text-slate-500">Ongoing client contracts</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pipeline Leads</span>
          <p className="text-xl font-black text-blue-600">{leadCount}</p>
          <span className="text-[10px] text-slate-500">In discussions & proposals</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Delivered</span>
          <p className="text-xl font-black text-purple-600">{deliveredCount}</p>
          <span className="text-[10px] text-slate-500">Projects completed</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sync Status</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-800">Live Bilateral</span>
          </div>
          <span className="text-[10px] text-slate-500">Shared with partner</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, service, or note..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-9 text-xs outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-[11px] font-bold">
          {['all', 'Active / Retainer', 'Negotiation', 'Lead', 'Delivered'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Clients' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Clients Sheet Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {clients.length === 0 ? 'No Clients Added Yet' : 'No matching clients found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {clients.length === 0
                ? 'Your client sheet is clean. Click below to add your first active client, retainer, or pipeline lead.'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
          {clients.length === 0 && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Client</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 pl-5">Client & Business</th>
                  <th className="p-3.5">Service / Deliverable</th>
                  <th className="p-3.5">Deal Value</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Next Action</th>
                  <th className="p-3.5">Logged By</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{client.name}</p>
                          {client.contact && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{client.contact}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">{client.service}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {client.dealValue}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{client.nextAction}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {client.addedByName || 'Founder'}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT CLIENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                  <Briefcase className="w-4 h-4 stroke-2" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingClient ? 'Edit Client Record' : 'Add New Client / Retainer'}
                  </h3>
                  <p className="text-xs text-slate-500">Logs directly to your agency spreadsheet & syncs with partner.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Client / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Media, Sarah Miller"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-semibold"
                    required
                    autoFocus
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Service / Package <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="e.g. 15 Reels / Mo, Web Design"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deal Value ($ or ৳)</label>
                  <input
                    type="text"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. $1,500/mo or ৳45,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AgencyClient['status'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Active / Retainer">Active / Retainer</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Lead">Lead</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Action / Due Step</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Send first 5 video drafts today at 4pm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email / Phone (Optional)</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. client@brand.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Deliverables Link</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Drive folder link or requirements"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black shadow-md cursor-pointer"
                >
                  {editingClient ? 'Update Client' : 'Save & Alert Partner'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
