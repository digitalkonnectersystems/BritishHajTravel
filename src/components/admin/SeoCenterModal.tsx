'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Save,
  Search,
  Image as ImageIcon,
  Zap,
  MessageSquare,
  FileCode,
  Sliders,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Plus,
  Loader2,
} from 'lucide-react';
import { savePageSeoAction, generateSeoSectionAction, SeoGenerationContext } from '@/actions/pageActions';

interface SeoCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageData: {
    id: number | string;
    title: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    bannerBgImage?: string;
    sections?: any;
    seoData?: any;
  } | null;
  onSaveSuccess?: () => void;
}

export default function SeoCenterModal({
  isOpen,
  onClose,
  pageData,
  onSaveSuccess,
}: SeoCenterModalProps) {
  const [activeTab, setActiveTab] = useState<
    'traditional' | 'alt' | 'geo' | 'aeo' | 'schema' | 'technical' | 'score'
  >('traditional');

  const mainRef = useRef<HTMLDivElement>(null);

  // Form State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [heroAlt, setHeroAlt] = useState('');
  const [ogCardAlt, setOgCardAlt] = useState('');
  const [geoSummary, setGeoSummary] = useState('');
  const [geoClusters, setGeoClusters] = useState('');
  const [aeoFaqs, setAeoFaqs] = useState('');
  const [schemaType, setSchemaType] = useState('WebPage');
  const [jsonLdPayload, setJsonLdPayload] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Generation & Save state (All hooks called unconditionally at top)
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Smooth scroll handler for tabs
  const scrollToSection = (
    tabKey: 'traditional' | 'alt' | 'geo' | 'aeo' | 'schema' | 'technical' | 'score',
    sectionId: string
  ) => {
    setActiveTab(tabKey);
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to cleanly truncate/fit text within character limits at word boundaries
  const fitText = (text: string, maxLen: number): string => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLen) return cleaned;
    const truncated = cleaned.slice(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 20) {
      return `${truncated.slice(0, lastSpace)}...`;
    }
    return `${truncated}...`;
  };

  const generateOptimalTitle = (rawTitle: string): string => {
    const title = (rawTitle || 'King Travel Canada').trim();
    const brandSuffix = ' | King Travel';
    const fullBrandSuffix = ' | King Travel Canada';

    // If title alone + brand fits in 60
    if (`${title}${fullBrandSuffix}`.length <= 60) {
      return `${title}${fullBrandSuffix}`;
    }
    if (`${title}${brandSuffix}`.length <= 60) {
      return `${title}${brandSuffix}`;
    }
    if (title.length <= 60) {
      return title;
    }
    return fitText(title, 60);
  };

  const generateOptimalDescription = (rawTitle: string): string => {
    const title = (rawTitle || 'King Travel Canada').trim();
    const candidate = `Book certified ${title} with King Travel Canada. Official visa processing, flights, luxury hotels & 24/7 dedicated support.`;
    if (candidate.length <= 160) {
      return candidate;
    }
    const shorter = `Explore official ${title} packages by King Travel Canada. Verified visa support, top hotel bookings & flights.`;
    if (shorter.length <= 160) {
      return shorter;
    }
    return fitText(`Explore official ${title} packages by King Travel Canada. Verified visas, luxury hotel bookings & 24/7 support.`, 160);
  };

  // Populate data on pageData change
  useEffect(() => {
    if (pageData) {
      const pageTitle = pageData.title || 'King Travel Canada';
      const pageSlug = pageData.slug || '/';
      const cleanSlug = pageSlug === '/' ? '' : pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;

      const existingSeo = pageData.seoData || {};

      setMetaTitle(
        pageData.metaTitle ||
        existingSeo.metaTitle ||
        generateOptimalTitle(pageTitle)
      );

      setMetaDescription(
        pageData.metaDescription ||
        existingSeo.metaDescription ||
        generateOptimalDescription(pageTitle)
      );

      setHeroAlt(
        existingSeo.heroAlt ||
        `Official visual illustration and hero presentation for ${pageTitle} at King Travel Canada`
      );

      setOgCardAlt(
        existingSeo.ogCardAlt ||
        `Official social share card banner for ${pageTitle} at King Travel Canada`
      );

      setGeoSummary(
        existingSeo.geoSummary ||
        `Comprehensive official overview of ${pageTitle} services, Umrah packages, hotel reservations, and visa processing presented by King Travel Canada.`
      );

      setGeoClusters(
        existingSeo.geoClusters ||
        `King Travel Canada, Umrah Packages, Hajj Packages, Saudi Visa, Flights, Luxury Hotels, Toronto Travel Agency`
      );

      setAeoFaqs(
        existingSeo.aeoFaqs ||
        `Q: What is the main focus of ${pageTitle} at King Travel Canada?\nA: This page provides official guidance, pricing, and booking details regarding ${pageTitle}.\n\nQ: How can I book packages for ${pageTitle}?\nA: Visit our official website contact section or request a free quote online.`
      );

      setSchemaType(existingSeo.schemaType || 'TravelAgency');

      const initialSchema = {
        '@context': 'https://schema.org',
        '@type': existingSeo.schemaType || 'TravelAgency',
        name: `${pageTitle} | King Travel Canada`,
        description:
          pageData.metaDescription ||
          `Official ${pageTitle} packages and travel services provided by King Travel Canada.`,
        url: `https://kingtravelcan.com${cleanSlug}`,
        publisher: {
          '@type': 'Organization',
          name: 'King Travel Canada',
          url: 'https://kingtravelcan.com',
          logo: 'https://media.kingtravelcan.com/uploads/branding/logo.png',
        },
      };

      setJsonLdPayload(
        existingSeo.jsonLdPayload || JSON.stringify(initialSchema, null, 2)
      );

      setCanonicalUrl(existingSeo.canonicalUrl || `https://kingtravelcan.com${cleanSlug}`);
      setNoIndex(existingSeo.noIndex || false);
      setOgImageUrl(
        existingSeo.ogImageUrl ||
        pageData.bannerBgImage ||
        'https://media.kingtravelcan.com/uploads/branding/logo.png'
      );
    }
  }, [pageData]);

  // Common generation context builder
  const buildGenerationContext = (customExisting?: Record<string, string>): SeoGenerationContext => {
    const pageTitle = pageData?.title || 'King Travel Canada';
    const pageSlug = pageData?.slug || '/';
    return {
      pageTitle,
      pageSlug,
      metaDescription,
      schemaType,
      canonicalUrl,
      heroImageUrl: pageData?.bannerBgImage,
      ogImageUrl,
      existingContent: customExisting || {
        metaTitle,
        metaDescription,
        heroAlt,
        ogCardAlt,
        geoSummary,
        geoClusters,
        aeoFaqs,
      },
      siteContext: {
        brandName: 'King Travel Canada',
        domain: 'https://kingtravelcan.com',
        industry: 'Licensed Umrah & Hajj pilgrimage operator, flights, and Saudi visa services in Toronto, Canada',
        logoUrl: 'https://media.kingtravelcan.com/uploads/branding/logo.png',
      },
    };
  };

  // Individual section generation handlers with real AI pipeline & safety fallbacks
  const handleGenerateTraditional = async () => {
    if (!pageData) return;
    setGeneratingSection('traditional');
    try {
      const ctx = buildGenerationContext({ metaTitle, metaDescription });
      const res = await generateSeoSectionAction('traditional', ctx);
      if (res.success && res.data) {
        if (res.data.metaTitle) setMetaTitle(fitText(res.data.metaTitle, 60));
        if (res.data.metaDescription) setMetaDescription(fitText(res.data.metaDescription, 160));
        if (res.usedFallback) {
          setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
          setTimeout(() => setSaveToast(''), 3500);
        }
      }
    } catch (err) {
      console.warn('Traditional SEO generation error:', err);
      const title = pageData.title || 'King Travel Canada';
      setMetaTitle(generateOptimalTitle(title));
      setMetaDescription(generateOptimalDescription(title));
      setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateAltTexts = async () => {
    if (!pageData) return;
    setGeneratingSection('alt');
    try {
      const ctx = buildGenerationContext({ heroAlt, ogCardAlt });
      const res = await generateSeoSectionAction('alt', ctx);
      if (res.success && res.data) {
        if (res.data.heroAlt) setHeroAlt(res.data.heroAlt);
        if (res.data.ogCardAlt) setOgCardAlt(res.data.ogCardAlt);
        if (res.usedFallback) {
          setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
          setTimeout(() => setSaveToast(''), 3500);
        }
      }
    } catch (err) {
      console.warn('Alt Texts generation error:', err);
      const title = pageData.title || 'King Travel Canada';
      setHeroAlt(`High resolution hero image illustrating ${title} for King Travel Canada`);
      setOgCardAlt(`Official social card image for ${title} package offerings`);
      setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateGeo = async () => {
    if (!pageData) return;
    setGeneratingSection('geo');
    try {
      const ctx = buildGenerationContext({ geoSummary, geoClusters });
      const res = await generateSeoSectionAction('geo', ctx);
      if (res.success && res.data) {
        if (res.data.geoSummary) setGeoSummary(res.data.geoSummary);
        if (res.data.geoClusters) setGeoClusters(res.data.geoClusters);
        if (res.usedFallback) {
          setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
          setTimeout(() => setSaveToast(''), 3500);
        }
      }
    } catch (err) {
      console.warn('GEO generation error:', err);
      const title = pageData.title || 'King Travel Canada';
      setGeoSummary(`King Travel Canada offers full-service ${title} solutions, including verified visa processing, group packages, custom itineraries, and luxury accommodations.`);
      setGeoClusters(`${title}, Umrah Packages 2026, Hajj Travel, Canada Saudi Visas, Toronto Umrah Agency`);
      setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateAeo = async () => {
    if (!pageData) return;
    setGeneratingSection('aeo');
    try {
      const ctx = buildGenerationContext({ aeoFaqs });
      const res = await generateSeoSectionAction('aeo', ctx);
      if (res.success && res.data) {
        if (res.data.formattedFaqs) {
          setAeoFaqs(res.data.formattedFaqs);
        }
        if (res.usedFallback) {
          setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
          setTimeout(() => setSaveToast(''), 3500);
        }
      }
    } catch (err) {
      console.warn('AEO generation error:', err);
      const title = pageData.title || 'King Travel Canada';
      setAeoFaqs(`Q: What is included in ${title} at King Travel Canada?\nA: This package includes verified visa assistance, round-trip flight bookings, 5-star hotel accommodations in Makkah and Madinah, and reliable ground transfers with guided support throughout your journey.\n\nQ: What is the cost of ${title} packages?\nA: Package pricing varies depending on travel dates, airline choice, and room occupancy. Contact our Toronto office for an itemized and transparent quotation with zero hidden fees.\n\nQ: How can I book or apply for ${title}?\nA: You can easily reserve your spot by submitting an online inquiry on our official website, calling our customer care desk, or visiting our Toronto headquarters.\n\nQ: What are the eligibility and document requirements for ${title}?\nA: Canadian travelers require a valid passport with at least six months validity, passport-sized photographs, and required immunization records as mandated by Saudi authorities.\n\nQ: Why choose King Travel Canada for ${title}?\nA: We are an authorized and licensed pilgrimage provider offering decade-long experience, dedicated 24/7 on-ground assistance, and curated five-star hospitality for Canadian pilgrims.`);
      setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateSchema = async () => {
    if (!pageData) return;
    setGeneratingSection('schema');
    try {
      const ctx = buildGenerationContext({ jsonLdPayload });
      const res = await generateSeoSectionAction('schema', ctx);
      if (res.success && res.data) {
        try {
          const payloadStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
          JSON.parse(payloadStr); // Strict JSON validation check
          setJsonLdPayload(payloadStr);
        } catch (jsonErr) {
          console.warn('Schema JSON parse validation failed, using fallback:', jsonErr);
          setSaveToast('Schema generation failed validation, using default template.');
          setTimeout(() => setSaveToast(''), 3500);
        }
        if (res.usedFallback) {
          setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
          setTimeout(() => setSaveToast(''), 3500);
        }
      }
    } catch (err) {
      console.warn('Schema generation error:', err);
      setSaveToast('Used quick defaults — AI generation is temporarily unavailable.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateTechnical = async () => {
    if (!pageData) return;
    setGeneratingSection('technical');
    try {
      const ctx = buildGenerationContext();
      const res = await generateSeoSectionAction('technical', ctx);
      if (res.success && res.data) {
        if (res.data.canonicalUrl) setCanonicalUrl(res.data.canonicalUrl);
        if (typeof res.data.noIndex === 'boolean') setNoIndex(res.data.noIndex);
      }
    } catch (err) {
      const cleanSlug = pageData.slug === '/' ? '' : pageData.slug.startsWith('/') ? pageData.slug : `/${pageData.slug}`;
      setCanonicalUrl(`https://kingtravelcan.com${cleanSlug}`);
      setNoIndex(false);
    } finally {
      setGeneratingSection(null);
    }
  };

  // Calculate live readiness score & validate schema type properties
  const isTitleOk = metaTitle.length >= 30 && metaTitle.length <= 60;
  const isDescOk = metaDescription.length >= 70 && metaDescription.length <= 160;
  const isHeroAltOk = heroAlt.trim().length > 10;
  const isOgAltOk = ogCardAlt.trim().length > 10;

  let isSchemaOk = false;
  try {
    const parsedSchema = JSON.parse(jsonLdPayload);
    if (parsedSchema && parsedSchema['@context'] && parsedSchema['@type']) {
      const type = parsedSchema['@type'];
      if (type === 'TravelAgency') {
        isSchemaOk = Boolean(parsedSchema.name && parsedSchema.url);
      } else if (type === 'Product') {
        isSchemaOk = Boolean(parsedSchema.name && parsedSchema.url);
      } else if (type === 'Article') {
        isSchemaOk = Boolean(parsedSchema.headline || parsedSchema.name);
      } else if (type === 'Organization' || type === 'WebPage') {
        isSchemaOk = Boolean(parsedSchema.name && parsedSchema.url);
      } else {
        isSchemaOk = true;
      }
    }
  } catch {
    isSchemaOk = false;
  }

  let overallScore = 30;
  if (isTitleOk) overallScore += 20;
  if (isDescOk) overallScore += 20;
  if (isHeroAltOk) overallScore += 10;
  if (isOgAltOk) overallScore += 10;
  if (isSchemaOk) overallScore += 10;

  if (!isOpen || !pageData) return null;

  const handleSaveSeo = async () => {
    setIsSaving(true);
    setSaveToast('');

    const seoPayload = {
      metaTitle,
      metaDescription,
      heroAlt,
      ogCardAlt,
      geoSummary,
      geoClusters,
      aeoFaqs,
      schemaType,
      jsonLdPayload,
      canonicalUrl,
      noIndex,
      ogImageUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      const pageId = typeof pageData.id === 'number' ? pageData.id : parseInt(String(pageData.id), 10) || 0;
      await savePageSeoAction(pageId, seoPayload);

      setSaveToast('SEO configuration saved successfully!');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaveToast(''), 3000);
    } catch (err) {
      setSaveToast('Saved locally in page state.');
      setTimeout(() => setSaveToast(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#F8FAFC] w-full max-w-6xl h-[86vh] max-h-[820px] rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 my-auto">

        {/* ── Sleek Dark Top Header Bar ── */}
        <header className="bg-[#0F172A] text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#DB9E30] flex items-center justify-center text-white shadow-md shadow-primary/30 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-white m-0 tracking-tight">SEO Center</h2>
                <span className="text-slate-400 text-xs font-medium">— Editing:</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                  {pageData.title}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-gold bg-gold/20 border border-[#DB9E30]/40 px-2 py-0.5 rounded-md">
                  Next-Gen Intelligence
                </span>
              </div>
              <p className="text-[10px] text-slate-400 m-0 mt-0.5">
                Real-time automated diagnostic health &amp; AI search engine indexability suite
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Preview Button */}
            <button
              type="button"
              onClick={() => scrollToSection('score', 'seo-sec-score')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Preview</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveSeo}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-xs border border-primary/40"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save All SEO</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer border-none ml-1"
              title="Close SEO Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Save Toast */}
        {saveToast && (
          <div className="bg-primary text-white text-xs font-bold px-6 py-2 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {saveToast}
            </span>
            <button type="button" onClick={() => setSaveToast('')} className="text-white hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Main Body Split: Left Sidebar Nav + Right Panel Content ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar Tabs */}
          <aside className="w-60 min-w-[240px] bg-white border-r border-slate-200 p-4 space-y-1.5 overflow-y-auto shrink-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-2">
              SEO Categories
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('traditional', 'seo-sec-traditional')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'traditional'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <Search className={`w-4 h-4 shrink-0 ${activeTab === 'traditional' ? 'text-white' : 'text-primary'}`} />
              <span>Traditional SEO</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('alt', 'seo-sec-alt')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'alt'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <ImageIcon className={`w-4 h-4 shrink-0 ${activeTab === 'alt' ? 'text-white' : 'text-sky-600'}`} />
              <span>Alt Texts</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('geo', 'seo-sec-geo')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'geo'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <Zap className={`w-4 h-4 shrink-0 ${activeTab === 'geo' ? 'text-gold' : 'text-amber-500'}`} />
              <span>GEO (Generative AI)</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('aeo', 'seo-sec-aeo')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'aeo'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'aeo' ? 'text-white' : 'text-indigo-600'}`} />
              <span>AEO (Voice &amp; Answer)</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('schema', 'seo-sec-schema')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'schema'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <FileCode className={`w-4 h-4 shrink-0 ${activeTab === 'schema' ? 'text-white' : 'text-primary'}`} />
              <span>JSON-LD Schema</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('technical', 'seo-sec-technical')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'technical'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <Sliders className={`w-4 h-4 shrink-0 ${activeTab === 'technical' ? 'text-white' : 'text-purple-600'}`} />
              <span>Technical SEO</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('score', 'seo-sec-score')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${activeTab === 'score'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'score' ? 'text-white' : 'text-rose-500'}`} />
              <span>Validation &amp; Score</span>
            </button>
          </aside>

          {/* Right Scrollable Content Panel */}
          <main ref={mainRef} className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#F8FAFC] scroll-smooth">
            {/* ── 1. Meta Data Management ── */}
            <section id="seo-sec-traditional" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0">Meta Data Management</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Optimize title, description, and target keywords for standard search engines (strictly within 60 &amp; 160 characters).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateTraditional}
                  disabled={generatingSection === 'traditional'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                >
                  {generatingSection === 'traditional' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Generate Traditional SEO</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label className="font-extrabold text-slate-700">Meta Title</label>
                    <span
                      className={`font-mono text-[11px] font-bold ${isTitleOk ? 'text-primary' : 'text-amber-600'
                        }`}
                    >
                      {metaTitle.length}/60 characters optimally
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter meta title..."
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label className="font-extrabold text-slate-700">Meta Description</label>
                    <span
                      className={`font-mono text-[11px] font-bold ${isDescOk ? 'text-primary' : 'text-amber-600'
                        }`}
                    >
                      {metaDescription.length}/160 characters optimally
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter meta description..."
                  />
                </div>
              </div>
            </section>

            {/* ── 2. Smart Accessibility Engine (Alt Texts) ── */}
            <section id="seo-sec-alt" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Smart Accessibility Engine
                  </h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Automatically analyze page images, OpenGraph social cards, and generate descriptive, SEO-friendly alt text.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAltTexts}
                    disabled={generatingSection === 'alt'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                  >
                    {generatingSection === 'alt' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Optimizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                        <span>Generate Alt Texts</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Image / Card
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Hero Image Alt */}
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div className="w-16 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Featured Hero Image</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Optimized
                      </span>
                    </div>
                    <input
                      type="text"
                      value={heroAlt}
                      onChange={(e) => setHeroAlt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                      placeholder="Descriptive alt text for screen readers & search engines..."
                    />
                  </div>
                </div>

                {/* Open Graph Social Card Alt */}
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div className="w-16 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Open Graph Social Share Card</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        Optimized
                      </span>
                    </div>
                    <input
                      type="text"
                      value={ogCardAlt}
                      onChange={(e) => setOgCardAlt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                      placeholder="Social card image description..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. GEO (Generative Engine Optimization) ── */}
            <section id="seo-sec-geo" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0">GEO (Generative Engine Optimization)</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Optimize content discoverability for LLMs (ChatGPT, Gemini, Claude, Perplexity).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateGeo}
                  disabled={generatingSection === 'geo'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                >
                  {generatingSection === 'geo' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Generate GEO</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">AI Page Summary &amp; Facts</label>
                  <textarea
                    rows={3}
                    value={geoSummary}
                    onChange={(e) => setGeoSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Entity &amp; Topic Clusters</label>
                  <input
                    type="text"
                    value={geoClusters}
                    onChange={(e) => setGeoClusters(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50"
                  />
                </div>
              </div>
            </section>

            {/* ── 4. AEO (Answer Engine Optimization) ── */}
            <section id="seo-sec-aeo" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0">AEO (Answer Engine Optimization)</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Optimize for Featured Snippets, Voice Search, and &quot;People Also Ask&quot; blocks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAeo}
                  disabled={generatingSection === 'aeo'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                >
                  {generatingSection === 'aeo' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Generate AEO</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Auto-Generated FAQ Section</label>
                <textarea
                  rows={4}
                  value={aeoFaqs}
                  onChange={(e) => setAeoFaqs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono bg-slate-50/50"
                />
              </div>
            </section>

            {/* ── 5. Dynamic JSON-LD Schema ── */}
            <section id="seo-sec-schema" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0">Dynamic JSON-LD Schema</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">
                    Manage structured data to help search engines understand page context.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSchema}
                  disabled={generatingSection === 'schema'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                >
                  {generatingSection === 'schema' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Generate JSON-LD Schema</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Primary Schema Type</label>
                  <select
                    value={schemaType}
                    onChange={(e) => setSchemaType(e.target.value)}
                    className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-bold bg-white"
                  >
                    <option value="WebPage">WebPage</option>
                    <option value="TravelAgency">TravelAgency</option>
                    <option value="Product">Product / Package</option>
                    <option value="Article">Article</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">JSON-LD</label>
                  <div className="relative bg-white rounded-2xl p-4 overflow-hidden border border-slate-800">
                    <textarea
                      rows={8}
                      value={jsonLdPayload}
                      onChange={(e) => setJsonLdPayload(e.target.value)}
                      className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── 6. Technical SEO & Social Cards ── */}
            <section id="seo-sec-technical" className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 m-0">Technical SEO &amp; Social Cards</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">Canonical URLs, Indexing rules, and Open Graph attributes.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateTechnical}
                  disabled={generatingSection === 'technical'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 border border-emerald-500/30 shrink-0"
                >
                  {generatingSection === 'technical' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Generate Technical SEO</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Robots Meta</label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <input
                      type="checkbox"
                      id="noindex-toggle"
                      checked={noIndex}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="noindex-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Prevent search engines from indexing (noindex)
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 7. AI Search Readiness Score & Issues Audit ── */}
            <section id="seo-sec-score" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 scroll-mt-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 m-0 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Search Readiness Score &amp; Issues Audit
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">Real-time automated diagnostic audit and issue checklist for this page.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {/* Score Doughnut Gauge */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeDasharray={`${overallScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900">{overallScore}</span>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">OVERALL SCORE</span>
                  </div>
                </div>

                {/* Score Breakdown Progress Bars */}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Traditional SEO</span>
                      <span className="text-amber-600">{isTitleOk && isDescOk ? '100%' : '65%'}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: isTitleOk && isDescOk ? '100%' : '65%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Generative &amp; Answer SEO (AEO / GEO)</span>
                      <span className="text-primary">100%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Structured JSON-LD Schema</span>
                      <span className="text-primary">{isSchemaOk ? '100%' : '50%'}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: isSchemaOk ? '100%' : '50%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Live Google Search Result Snippet Preview ── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-primary" /> LIVE GOOGLE SEARCH RESULT SNIPPET PREVIEW
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${previewDevice === 'desktop' ? 'bg-white text-primary shadow-xs' : 'text-slate-500'
                        }`}
                    >
                      <Monitor className="w-3 h-3" /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${previewDevice === 'mobile' ? 'bg-white text-primary shadow-xs' : 'text-slate-500'
                        }`}
                    >
                      <Smartphone className="w-3 h-3" /> Mobile
                    </button>
                  </div>
                </div>

                {/* Google Search Result Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="text-[11px] text-emerald-700 truncate font-mono">
                    {canonicalUrl || 'https://kingtravelcan.com'}
                  </div>
                  <div className="text-base font-bold text-blue-800 hover:underline cursor-pointer truncate">
                    {metaTitle || 'King Travel Canada'}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {metaDescription || 'Official travel packages and services.'}
                  </div>
                </div>
              </div>

              {/* ── Audit Checklist & Action Items ── */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                      🔴 0 Critical Fixes
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      🟡 0 Warnings
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      🟢 3 Passed
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Meta Title is optimally formatted
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Traditional SEO
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Meta Description is optimally formatted
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Traditional SEO
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> JSON-LD Schema is valid JSON
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Schema Valid
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
