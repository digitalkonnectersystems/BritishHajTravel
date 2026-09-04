'use client';

import { useState } from 'react';
import { updateEnquiryStatus, deleteEnquiryAction } from '@/actions/enquiryActions';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Search, Filter } from 'lucide-react';

interface EnquiriesClientProps {
  initialEnquiries: any[];
}

const FORM_TAG_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  quote_request: { label: 'Quote Request', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  package_enquiry: { label: 'Package Booking', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  general_contact: { label: 'Contact Message', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  visa_enquiry: { label: 'Visa Inquiry', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  flight_enquiry: { label: 'Flight Inquiry', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function EnquiriesClient({ initialEnquiries }: EnquiriesClientProps) {
  const [enquiries, setEnquiries] = useState<any[]>(initialEnquiries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formTypeTab, setFormTypeTab] = useState('all');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);

  const filtered = enquiries.filter((e) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (e.enquiryNumber && e.enquiryNumber.toLowerCase().includes(q)) ||
      (e.fullName && e.fullName.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesFormTab = formTypeTab === 'all' || e.type === formTypeTab;
    return matchesSearch && matchesStatus && matchesFormTab;
  });

  const newCount = enquiries.filter((e) => e.status === 'new').length;

  const handleStatusChange = async (id: number, newStatus: string) => {
    await updateEnquiryStatus(id, newStatus as any);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    setSaveMsg('Enquiry status updated!');
    setTimeout(() => setSaveMsg(null), 2500);
  };

  const handleDelete = (id: number, refNum: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      title: `Delete Query ${refNum}?`,
      message: `Are you sure you want to delete form query "${refNum}"? This will remove it permanently from the database.`,
      confirmText: 'Yes, Delete Query',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteEnquiryAction(id);
        if (res.success) {
          setEnquiries((prev) => prev.filter((e) => e.id !== id));
          setSaveMsg('Query deleted.');
          setTimeout(() => setSaveMsg(null), 2500);
        } else {
          alert(res.error || 'Failed to delete query.');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Forms Queries</h1>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Manage, track, and process all incoming website form submissions across dedicated database tables
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-bold text-primary animate-in fade-in">{saveMsg}</span>}
          <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            🔥 {newCount} New Queries
          </span>
        </div>
      </div>

      {/* Form Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {[
          { key: 'all', label: 'All Forms Queries' },
          { key: 'quote_request', label: 'Quote Requests (quote_enquiries)' },
          { key: 'package_enquiry', label: 'Package Bookings (package_booking_enquiries)' },
          { key: 'general_contact', label: 'Contact Messages (contact_enquiries)' },
          { key: 'visa_enquiry', label: 'Visa Requests (visa_enquiries)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFormTypeTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border cursor-pointer whitespace-nowrap ${formTypeTab === tab.key
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref ID, name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">● New Queries</option>
            <option value="contacted">● Contacted</option>
            <option value="quotation_sent">● Quotation Sent</option>
            <option value="booked">● Booked</option>
            <option value="closed">● Closed</option>
            <option value="spam">● Spam</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Form Tag</th>
                <th className="py-3 px-4">Pilgrim Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Package / Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No form queries found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const tagInfo = FORM_TAG_CONFIG[item.type] || {
                    label: item.type || 'Form Query',
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-amber-600 text-xs">
                        {item.enquiryNumber || `QT-${item.id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${tagInfo.bg} ${tagInfo.text} ${tagInfo.border}`}
                        >
                          ● {tagInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.fullName}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.city || 'UK'} {item.province}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{item.phone}</div>
                        <div className="text-[10px] text-slate-400">{item.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-primary">
                        {item.preferredPackageType || item.type}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status || 'new'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold outline-none cursor-pointer border ${item.status === 'new'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : item.status === 'booked'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                          <option value="new">● New</option>
                          <option value="contacted">● Contacted</option>
                          <option value="quotation_sent">● Quote Sent</option>
                          <option value="booked">● Booked</option>
                          <option value="closed">● Closed</option>
                          <option value="spam">● Spam</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.enquiryNumber || `QT-${item.id}`)}
                          title="Delete Query"
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  );
}
