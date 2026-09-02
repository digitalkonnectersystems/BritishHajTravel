'use client';

import React, { useState } from 'react';
import { submitQuoteEnquiryAction } from '@/actions/enquiryActions';
import SubmissionSuccessModal from '@/components/SubmissionSuccessModal';

export default function CustomizeHajjPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    occupancy: 'Quad Occupancy',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalRef, setModalRef] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    setLoading(true);
    try {
      const res = await submitQuoteEnquiryAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        packageType: `Customize Hajj 2027 (${formData.occupancy})`,
        numberOfPilgrims: 1,
      });

      setLoading(false);
      if (res.success) {
        setModalMsg(res.message || 'Thank you! Your message has been received. Our team will contact you shortly.');
        if (res.enquiryNumber) setModalRef(res.enquiryNumber);
        setModalOpen(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          occupancy: 'Quad Occupancy',
          message: '',
        });
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 py-12">
      <div className="wrap">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="eyebrow justify-center">Tailored Pilgrimage</div>
          <h1 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
            Customize Your Hajj Package <span className="text-[var(--gold)]">2027</span>
          </h1>
          <p className="text-slate-600">
            Tailor your stay, accommodations, group guides, and travel arrangements according to your personal requirements.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="field">
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#004B39]"
                />
              </div>
              <div className="field">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#004B39]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="field">
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  maxLength={11}
                  value={formData.phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    const startsWithPlus = val.startsWith("+");
                    const digits = val.replace(/[^0-9]/g, "");
                    val = (startsWithPlus ? "+" : "") + digits;
                    if (val.length > 11) val = val.slice(0, 11);
                    setFormData({ ...formData, phone: val });
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#004B39]"
                />
              </div>
              <div className="field">
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Occupancy</label>
                <select
                  value={formData.occupancy}
                  onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#004B39] cursor-pointer"
                >
                  <option value="Quad Occupancy">Quad Occupancy</option>
                  <option value="Triple Occupancy">Triple Occupancy</option>
                  <option value="Double Occupancy">Double Occupancy</option>
                  <option value="Single Occupancy">Single Occupancy</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="block text-xs font-bold text-slate-700 mb-1">Special Requests or Custom Requirements</label>
              <textarea
                rows={4}
                placeholder="Tell us your dates, preferred hotels, or additional services..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#004B39] resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004B39] hover:bg-[#00382B] text-white font-extrabold text-xs py-4 rounded-2xl transition-all uppercase tracking-wider cursor-pointer border-none shadow-md disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Custom Hajj Inquiry'}
            </button>
          </form>
        </div>
      </div>

      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
        referenceNumber={modalRef}
      />
    </main>
  );
}
