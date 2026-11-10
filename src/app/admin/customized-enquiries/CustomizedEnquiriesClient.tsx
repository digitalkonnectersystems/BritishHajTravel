'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalPortal from '@/components/ui/ModalPortal';
import {
  Archive, CalendarDays, ChevronRight, ClipboardList, Eye, Hotel, Mail,
  MapPin, Search, SlidersHorizontal, Users, X,
} from 'lucide-react';
import {
  updateCustomizedEnquiryStatusAction,
  deleteCustomizedEnquiryAction,
} from '@/actions/customizedPackageActions';
import type { getCustomizedEnquiriesAction } from '@/actions/customizedPackageActions';

type CustomizedRow = Awaited<ReturnType<typeof getCustomizedEnquiriesAction>>[number];
type CategoryFilter = 'all' | 'hajj' | 'umrah';
const statusOptions = ['new', 'contacted', 'qualified', 'closed', 'spam'] as const;
type EnquiryStatus = (typeof statusOptions)[number];

const inputClass = 'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#020e43] focus:ring-2 focus:ring-[#020e43]/10';

function formatDate(value: Date | string | null | undefined) {
  if (!value) return 'Flexible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Flexible' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusStyle(value: string) {
  switch (value) {
    case 'new': return 'border-blue-200 bg-blue-50 text-blue-800';
    case 'contacted': return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'qualified': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'closed': return 'border-slate-200 bg-slate-100 text-slate-700';
    default: return 'border-red-200 bg-red-50 text-red-700';
  }
}

function categoryStyle(value: string) {
  return value === 'hajj'
    ? 'border-[#b50007]/20 bg-red-50 text-[#b50007]'
    : 'border-[#020e43]/15 bg-[#020e43]/5 text-[#020e43]';
}

function detailText(value: unknown, fallback = 'Not specified') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export default function CustomizedEnquiriesClient({ initialRows }: { initialRows: CustomizedRow[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<CustomizedRow | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  const counts = useMemo(() => ({
    all: initialRows.length,
    hajj: initialRows.filter(row => row.category === 'hajj').length,
    umrah: initialRows.filter(row => row.category === 'umrah').length,
  }), [initialRows]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return initialRows.filter(row =>
      (category === 'all' || row.category === category) &&
      (!query || `${row.enquiryNumber} ${row.fullName} ${row.email} ${row.phone} ${row.departureAirport}`.toLowerCase().includes(query))
    );
  }, [initialRows, category, search]);

  async function updateStatus(row: CustomizedRow, status: EnquiryStatus) {
    setBusyId(row.id);
    setError('');
    try {
      await updateCustomizedEnquiryStatusAction(row.id, status);
      router.refresh();
    } catch {
      setError('Could not update the enquiry status. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function archive(row: CustomizedRow) {
    if (!window.confirm('Archive this customization enquiry?')) return;
    setBusyId(row.id);
    setError('');
    try {
      const result = await deleteCustomizedEnquiryAction(row.id);
      if (!result.success) {
        setError(result.error || 'Could not archive the enquiry.');
        return;
      }
      if (selected?.id === row.id) setSelected(null);
      router.refresh();
    } catch {
      setError('Could not archive the enquiry. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  const statusControl = (row: CustomizedRow) => (
    <select
      aria-label={`Status for enquiry ${row.enquiryNumber}`}
      value={row.status}
      disabled={busyId !== null}
      onChange={event => void updateStatus(row, event.target.value as EnquiryStatus)}
      className={`${inputClass} h-9 min-w-[126px] px-2 text-xs font-bold capitalize ${statusStyle(row.status)}`}
    >
      {statusOptions.map(value => <option key={value} value={value}>{value}</option>)}
    </select>
  );

  const services = (row: CustomizedRow, type: 'service' | 'requirement') =>
    row.features?.filter(feature => feature.featureType === type).map(feature => feature.featureName) || [];

  const detailField = (label: string, value: unknown) => (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{detailText(value)}</dd>
    </div>
  );

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#020e43] text-white shadow-sm"><SlidersHorizontal className="h-5 w-5" /></span>
        <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight text-[#020e43] sm:text-[28px]">Customized Package Enquiries</h1><p className="mt-1 text-sm leading-relaxed text-slate-500">Review Hajj and Umrah requests, travel plans, hotel preferences and additional services.</p></div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#020e43]/5 text-[#020e43]"><ClipboardList className="h-6 w-6" /></span><div><p className="text-xs text-slate-700 font-semibold">Total Enquiries</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{counts.all}</p></div></div>
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#b50007]"><MapPin className="h-6 w-6" /></span><div><p className="text-xs text-slate-700 font-semibold">Hajj Enquiries</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{counts.hajj}</p></div></div>
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Users className="h-6 w-6" /></span><div><p className="text-xs text-slate-700 font-semibold">Umrah Enquiries</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{counts.umrah}</p></div></div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#b50007]">{error}</div>}

      <div className="flex min-w-0 flex-col gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by package category">
          {(['all', 'hajj', 'umrah'] as const).map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold capitalize transition-colors ${category === value ? 'border-[#020e43] bg-[#020e43] text-white shadow-sm' : 'border-slate-200 bg-white text-[#020e43] hover:bg-slate-50'}`}>{value}<span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${category === value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{counts[value]}</span></button>)}
        </div>
        <label className="relative block w-full min-w-0 lg:max-w-[390px]"><span className="sr-only">Search customized enquiries</span><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input className={`${inputClass} h-11 pl-10`} placeholder="Search reference, name, phone, email..." value={search} onChange={event => setSearch(event.target.value)} /></label>
      </div>

      <div className="min-w-0 rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5"><div><h2 className="font-bold text-[#020e43]">Enquiry Records</h2><p className="mt-0.5 text-xs text-slate-500">Select View details to see every travel and service preference.</p></div><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{rows.length} matching</span></div>
        <div className="hidden min-w-0 overflow-x-auto lg:block" role="region" aria-label="Customized package enquiries table" tabIndex={0}>
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#f3f6fb] text-[11px] font-bold uppercase tracking-wide text-slate-600"><tr>{['Reference / Customer', 'Category', 'Departure', 'Travelers', 'Hotel preference', 'Status', 'Actions'].map(title => <th key={title} className="px-4 py-3.5">{title}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => <tr key={row.id} className="align-top transition-colors hover:bg-[#f8faff]">
                <td className="min-w-[205px] px-4 py-4"><span className="w-auto inline-block break-all text-xs font-bold text-white bg-primary p-2.5 rounded-full">{row.enquiryNumber}</span><span className="mt-2 block break-words text-sm font-semibold text-slate-800">{row.fullName}</span><span className="mt-0.5 block break-all text-xs text-slate-500">{row.email}</span><span className="mt-1 block text-xs text-slate-500">{row.phone}</span></td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${categoryStyle(row.category)}`}>{row.category}</span></td>
                <td className="min-w-[120px] px-4 py-4"><span className="block break-words font-semibold text-slate-800">{row.departureAirport}</span><span className="mt-1 block whitespace-nowrap text-xs text-slate-500">{formatDate(row.departureDate)}</span><span className="mt-1 block text-xs text-slate-500">{row.numberOfDays} days</span></td>
                <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-700">{row.adults} adults <span className="block mt-1 font-normal text-slate-500">{row.children} children · {row.infants} infants</span></td>
                <td className="min-w-[130px] max-w-[220px] break-words px-4 py-4 text-xs leading-relaxed text-slate-700"><span className="block font-semibold text-[#020e43]">Makkah</span>{row.makkahHotel || 'Any'}<span className="mt-2 block font-semibold text-[#020e43]">Madinah</span>{row.madinahHotel || 'Any'}</td>
                <td className="px-4 py-4">{statusControl(row)}</td>
                <td className="px-4 py-4"><div className="flex flex-col items-start gap-2"><button type="button" onClick={() => setSelected(row)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#020e43]/20 bg-[#020e43]/5 px-3 py-2 text-xs font-bold text-[#020e43] hover:bg-[#020e43]/10"><Eye className="h-3.5 w-3.5" /> View details</button><button type="button" disabled={busyId !== null} onClick={() => void archive(row)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#b50007] hover:bg-red-50 disabled:opacity-50"><Archive className="h-3.5 w-3.5" /> Archive</button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-3 lg:hidden">
          {rows.map(row => <article key={row.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="break-all text-xs font-bold text-[#020e43]">{row.enquiryNumber}</p><h3 className="mt-1 break-words font-bold text-slate-800">{row.fullName}</h3></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${categoryStyle(row.category)}`}>{row.category}</span></div>
            <p className="mt-1 break-all text-xs text-slate-500">{row.email}</p><p className="mt-0.5 text-xs text-slate-500">{row.phone}</p>
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-slate-100 pt-3 text-xs"><div className="min-w-0"><span className="flex items-center gap-1 text-slate-400"><MapPin className="h-3.5 w-3.5" /> Departure</span><p className="mt-1 break-words font-semibold text-slate-800">{row.departureAirport}</p><p className="mt-0.5 text-slate-500">{formatDate(row.departureDate)}</p></div><div><span className="flex items-center gap-1 text-slate-400"><CalendarDays className="h-3.5 w-3.5" /> Duration</span><p className="mt-1 font-semibold text-slate-800">{row.numberOfDays} days</p></div><div><span className="flex items-center gap-1 text-slate-400"><Users className="h-3.5 w-3.5" /> Travelers</span><p className="mt-1 font-semibold text-slate-800">{row.adults}A · {row.children}C · {row.infants}I</p></div><div className="min-w-0"><span className="flex items-center gap-1 text-slate-400"><Hotel className="h-3.5 w-3.5" /> Hotels</span><p className="mt-1 break-words font-semibold text-slate-800">{row.makkahHotel || 'Any'} / {row.madinahHotel || 'Any'}</p></div></div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"><div className="min-w-[130px] flex-1">{statusControl(row)}</div><button type="button" onClick={() => setSelected(row)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#020e43]/20 bg-[#020e43]/5 px-3 text-xs font-bold text-[#020e43]"><Eye className="h-3.5 w-3.5" /> Details</button><button type="button" disabled={busyId !== null} onClick={() => void archive(row)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-[#b50007] disabled:opacity-50"><Archive className="h-3.5 w-3.5" /> Archive</button></div>
          </article>)}
        </div>
        {rows.length === 0 && <div className="flex flex-col items-center gap-2 px-5 py-14 text-center"><Search className="h-8 w-8 text-slate-300" /><p className="font-bold text-[#020e43]">No matching enquiries</p><p className="text-sm text-slate-500">Try a different category or search term.</p></div>}
        <div className="border-t border-slate-100 px-4 py-4 text-xs leading-relaxed text-slate-500 sm:px-5">{rows.length} matching enquiries. Additional service and requirement details are included in each enquiry&apos;s View details panel.</div>
      </div>

      {selected && (
        <ModalPortal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Enquiry details for ${selected.enquiryNumber}`}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
            onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}
          >
            <div className="w-full max-w-3xl min-w-0 max-h-[90dvh] overflow-y-auto rounded-[22px] bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-all text-xs font-bold uppercase tracking-wider text-[#b50007]">{selected.enquiryNumber}</p><h2 className="mt-1 text-xl font-bold text-[#020e43]">Customized {selected.category.toUpperCase()} enquiry</h2><p className="mt-1 text-sm text-slate-500">Complete customer and travel preferences</p></div><button type="button" aria-label="Close enquiry details" onClick={() => setSelected(null)} className="rounded-full p-2 text-white bg-red-600 hover:bg-red-700"><X className="h-5 w-5" /></button></div>
              <div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${categoryStyle(selected.category)}`}>{selected.category}</span><span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle(selected.status)}`}>{selected.status}</span></div>
              <div className="mt-6 space-y-5">
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#020e43]"><Mail className="h-4 w-4" /> Customer</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{detailField('Full name', selected.fullName)}{detailField('Phone number', selected.phone)}{detailField('Email', selected.email)}{detailField('Submitted on', formatDate(selected.createdAt))}</dl></section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#020e43]"><CalendarDays className="h-4 w-4" /> Travel details</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{detailField('Departure airport', selected.departureAirport)}{detailField('Departure date', formatDate(selected.departureDate))}{detailField('Duration', `${selected.numberOfDays} days`)}{detailField('Passengers', `${selected.adults} adults, ${selected.children} children, ${selected.infants} infants`)}{detailField('Preferred airline', selected.airlinePreference)}{detailField('Ground transportation', selected.transportation)}{detailField('Budget (GBP)', selected.budgetGbp ? `£${selected.budgetGbp}` : null)}</dl></section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#020e43]"><Hotel className="h-4 w-4" /> Accommodation</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{detailField('Makkah hotel', selected.makkahHotel || 'Any')}{detailField('Madinah hotel', selected.madinahHotel || 'Any')}{detailField('Hotel standard', selected.hotelStandard || 'Any')}{detailField('Room occupancy', selected.roomOccupancy || 'Any')}</dl></section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#020e43]"><ClipboardList className="h-4 w-4" /> Services and special requirements</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><p className="mb-2 text-xs font-bold text-slate-500">Selected services</p>{services(selected, 'service').length ? <div className="flex flex-wrap gap-2">{services(selected, 'service').map((name, index) => <span key={`${name}-${index}`} className="max-w-full break-words rounded-lg bg-[#020e43]/5 px-3 py-1.5 text-xs font-semibold text-[#020e43]">{name}</span>)}</div> : <p className="text-sm text-slate-500">None selected</p>}</div><div><p className="mb-2 text-xs font-bold text-slate-500">Special requirements</p>{services(selected, 'requirement').length ? <div className="flex flex-wrap gap-2">{services(selected, 'requirement').map((name, index) => <span key={`${name}-${index}`} className="max-w-full break-words rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#b50007]">{name}</span>)}</div> : <p className="text-sm text-slate-500">None selected</p>}</div></div><div className="mt-4 border-t border-slate-100 pt-4"><p className="mb-1 text-xs font-bold text-slate-500">Additional notes</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{selected.notes || 'No additional notes'}</p></div></section>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-1 rounded-xl bg-[#020e43] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#142762]">Close <ChevronRight className="h-4 w-4" /></button></div>
            </div>
          </div>
        </ModalPortal>
      )}
    </section>
  );
}
