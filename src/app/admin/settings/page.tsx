'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { updateBrowserFavicon } from '@/components/FaviconSync';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import { uploadFile, uploadFileToFtp, generateAutoAltText, sanitizeMediaUrl } from '@/lib/uploadClient';
import {
  getNavItems,
  saveNavItemsAction,
  getPagesList,
  getFooterData,
  saveFooterSettingsAction,
  getSiteIdentity,
  saveSiteIdentityAction,
  getShareTools,
  saveShareToolsAction,
  getGlobalCss,
  saveGlobalCssAction,
  getLoginAuthSettings,
  saveLoginAuthSettingsAction,
  getDisclaimerSettings,
  saveDisclaimerSettingsAction,
  getFormsSettings,
  saveFormsSettingsAction,
  getSeoIntelligenceSettings,
  saveSeoIntelligenceSettingsAction,
} from '@/actions/pageActions';
import { getEmailDeliveryLogsAction } from '@/actions/logActions';
import {
  getResponsiveEmailTemplateHtml,
  CANONICAL_FORM_SUBJECTS,
  FORM_SAMPLE_DATA,
  CanonicalFormSubject,
} from '@/lib/emailTemplate';
import {
  getUsersList,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from '@/actions/userActions';
import { getEnquiriesList, deleteEnquiriesBulkAction, markEnquiriesReadAction, updateEnquiryStatus } from '@/actions/enquiryActions';
import { Field, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import GlassNotificationModal from '@/components/ui/GlassNotificationModal';
import {
  Trash2,
  Upload,
  MoveUp,
  MoveDown,
  Check,
  Save,
  CloudUpload,
  Plus,
  Edit2,
  Key,
  Eye,
  EyeOff,
  X,
  Pencil,
  Globe,
  Search,
  ExternalLink,
  Copy,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const TABS = [
  { id: 'header-footer', label: 'Header & Footer', icon: '🎨' },
  { id: 'seo', label: 'SEO Intelligence', icon: '🔍' },
  { id: 'identity', label: 'Site Identity', icon: '🏢' },
  { id: 'share', label: 'Share Tools', icon: '🔗' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'auth', label: 'Login Auth', icon: '🔐' },
  { id: 'popup', label: 'Disclaimer Popup', icon: '🚨' },
  { id: 'css', label: 'Global CSS', icon: '💻' },
  { id: 'forms', label: 'Forms', icon: '📝' },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('header-footer');
  const [subTab, setSubTab] = useState<'header' | 'footer'>('header');

  // 3D Glassmorphism Notification State
  const [notificationConfig, setNotificationConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showNotification = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setNotificationConfig({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Form states
  const [siteName, setSiteName] = useState('King Travel Canada');
  const [altText, setAltText] = useState('Official King Travel Canada Logo');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [customCss, setCustomCss] = useState('/* Add custom CSS rules here */');

  // Navigation Builder State
  const [navTree, setNavTree] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagesList, setPagesList] = useState<any[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Drag-and-drop state (native HTML5 — no external library)
  const dragL1Id = useRef<string | null>(null);           // dragged level-1 item id
  const dragL2Key = useRef<string | null>(null);          // dragged level-2 item: "parentId::subId"
  const [dragOverL1, setDragOverL1] = useState<string | null>(null);
  const [dragOverL2, setDragOverL2] = useState<string | null>(null); // "parentId::subId"

  // Footer Builder State
  const [footerData, setFooterData] = useState<any>({});
  const [footerSaveMsg, setFooterSaveMsg] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);

  // Site Identity State
  const [identityData, setIdentityData] = useState<any>({
    siteName: 'King Travel Canada',
    tagline: '',
    logo: '/img/logo.png',
    logoAlt: 'King Travel Canada Logo',
    favicon: '/img/favicon.ico',
    faviconAlt: 'King Travel Favicon',
  });
  const [identitySaveMsg, setIdentitySaveMsg] = useState<string | null>(null);



  useEffect(() => {
    if (identityData?.favicon) {
      updateBrowserFavicon(identityData.favicon);
    }
  }, [identityData?.favicon]);

  // Share Tools State
  const [shareData, setShareData] = useState<any>({
    enabled: true,
    iconStyle: 'rounded-square',
    iconSize: 40,
    colorScheme: 'brand-colors',
    gapFromEdge: 20,
    verticalPosition: 'center',
    sidebarEdge: 'right',
    showLabels: true,
    hideOnScrollDown: false,
    openBehavior: 'popup',
    delayBeforeShowing: 0,
    excludePages: '/cart, /checkout, /private',
    urlToShare: 'current',
    customShareUrl: '',
    utmParameters: false,
    trackClicks: true,
    gaEventName: 'share_click',
    activePlatforms: [
      { id: 'facebook', name: 'Facebook', enabled: true, color: '#1877F2' },
      { id: 'whatsapp', name: 'WhatsApp', enabled: true, color: '#25D366' },
      { id: 'x', name: 'X (Twitter)', enabled: true, color: '#000000' },
      { id: 'email', name: 'Email', enabled: true, color: '#EA4335' },
      { id: 'linkedin', name: 'LinkedIn', enabled: true, color: '#0A66C2' },
      { id: 'pinterest', name: 'Pinterest', enabled: true, color: '#E60023' },
      { id: 'telegram', name: 'Telegram', enabled: true, color: '#24A1DE' },
    ],
  });
  const [shareSaveMsg, setShareSaveMsg] = useState<string | null>(null);
  const [savingShare, setSavingShare] = useState(false);
  const [cssSaveMsg, setCssSaveMsg] = useState<string | null>(null);

  // SEO Intelligence State
  const [seoData, setSeoData] = useState<any>({
    siteIndexingEnabled: true,
    googleSearchConsoleCode: '',
    googleAnalyticsId: '',
    googleAnalyticsEnabled: true,
    sitemapLastGenerated: null,
    sitemapTotalUrls: 0,
  });
  const [seoSaveMsg, setSeoSaveMsg] = useState<string | null>(null);
  const [savingSeo, setSavingSeo] = useState(false);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapActionMsg, setSitemapActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sitemapStats, setSitemapStats] = useState<{ totalUrls: number; sizeKb: string; lastGenerated: string | null }>({
    totalUrls: 0,
    sizeKb: '0',
    lastGenerated: null,
  });

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [userFormData, setUserFormData] = useState<any>({
    id: 0,
    name: '',
    email: '',
    password: '',
    role: 'admin',
    active: true,
    badgeBg: '#0F766E',
    badgeTextColor: '#FFFFFF',
  });
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [userSaveMsg, setUserSaveMsg] = useState<string | null>(null);

  // Login Auth state
  const [loginAuthData, setLoginAuthData] = useState<any>({
    backgroundImage: '',
    backgroundAlt: '',
    footerText: '© 2026 King Travel Can Ltd. All Rights Reserved.',
    maintenanceMode: false,
  });
  const [loginSaveMsg, setLoginSaveMsg] = useState<string | null>(null);
  const [savingLogin, setSavingLogin] = useState(false);

  // Disclaimer Popup state
  const [disclaimerData, setDisclaimerData] = useState<any>({
    enabled: false,
    image: '',
    altText: 'Disclaimer Popup Image',
  });
  const [disclaimerSaveMsg, setDisclaimerSaveMsg] = useState<string | null>(null);
  const [savingDisclaimer, setSavingDisclaimer] = useState(false);

  // Forms Manager state
  const [formsSubTab, setFormsSubTab] = useState<
    'all' | 'emailConfigs' | 'emailTemplate' | 'inbox' | 'sentHistory' | 'emailLogs'
  >('all');
  const [editingFormKey, setEditingFormKey] = useState<string | null>(null);

  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [inboxEnquiries, setInboxEnquiries] = useState<any[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
  const [selectedInboxItems, setSelectedInboxItems] = useState<number[]>([]);
  const [isDeletingInboxItems, setIsDeletingInboxItems] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [activeInboxMsg, setActiveInboxMsg] = useState<any>(null);

  const fetchInbox = async () => {
    setIsLoadingInbox(true);
    try {
      const res = await getEnquiriesList();
      if (res && Array.isArray(res)) setInboxEnquiries(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInbox(false);
    }
  };

  const handleToggleInboxItem = (id: number) => {
    setSelectedInboxItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedInbox = async () => {
    if (selectedInboxItems.length === 0) return;
    setIsDeletingInboxItems(true);
    try {
      await deleteEnquiriesBulkAction(selectedInboxItems);
      setSelectedInboxItems([]);
      await fetchInbox();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingInboxItems(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = inboxEnquiries.filter(i => i.status === 'new');
    if (unreadItems.length === 0) return;
    setIsMarkingRead(true);
    try {
      const idsToMark = unreadItems.map(i => i.id);
      await markEnquiriesReadAction(idsToMark);
      await fetchInbox();
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const filteredInboxEnquiries = inboxEnquiries.filter((item) => {
    if (inboxFilter === 'unread') return item.status === 'new';
    return true;
  });

  const fetchEmailLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await getEmailDeliveryLogsAction();
      if (res.success && res.logs) {
        setEmailLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'forms') {
      if (formsSubTab === 'emailLogs') {
        fetchEmailLogs();
        const interval = setInterval(() => {
          fetchEmailLogs();
        }, 10000);
        return () => clearInterval(interval);
      }
      if (formsSubTab === 'inbox') {
        fetchInbox();
        const interval = setInterval(() => {
          fetchInbox();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [activeTab, formsSubTab]);

  const [formFieldsState, setFormFieldsState] = useState<Record<string, Array<{ id: string; label: string; type: string; placeholder: string; required: boolean }>>>({
    quoteForm: [
      { id: '1', label: 'Your Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
      { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
      { id: '4', label: 'Select Your Package', type: 'select', placeholder: 'Select your package choice', required: true },
      { id: '5', label: 'Departure Date', type: 'date', placeholder: 'mm/dd/yyyy', required: true },
      { id: '6', label: 'Number of Adults', type: 'number', placeholder: '1', required: true },
    ],
    // ── Merged Umrah Package Form (Detail Page + Popup Modal) ──
    packageDetailForm: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1', required: true },
      { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
      { id: '4', label: 'Adults', type: 'select', placeholder: '1', required: true },
      { id: '5', label: 'Children', type: 'select', placeholder: '0', required: false },
      { id: '6', label: 'Infants', type: 'select', placeholder: '0', required: false },
      { id: '7', label: 'Select Start Date', type: 'date', placeholder: 'e.g. March 25, 2025', required: true },
      { id: '8', label: 'Package Type', type: 'select', placeholder: 'CAD 2,695 - Quad Occupancy', required: true },
    ],
    // ── Merged Hajj Package Form (Detail Page + Popup Modal) ──
    hajjPackageDetailForm: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1', required: true },
      { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
      { id: '4', label: 'Adults', type: 'select', placeholder: '1', required: true },
      { id: '5', label: 'Children', type: 'select', placeholder: '0', required: false },
      { id: '6', label: 'Infants', type: 'select', placeholder: '0', required: false },
      { id: '7', label: 'Package Type', type: 'select', placeholder: 'CAD 12,995 - Quad Occupancy', required: true },
    ],
    hajjCustomizeForm: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
      { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
      { id: '4', label: 'Room Occupancy', type: 'select', placeholder: 'Quad / Triple / Double', required: true },
    ],
    contact: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Email Address', type: 'email', placeholder: 'name@example.com', required: true },
      { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', label: 'Subject', type: 'text', placeholder: 'Inquiry subject', required: false },
      { id: '5', label: 'Message', type: 'textarea', placeholder: 'Write your message here...', required: true },
    ],
    packageInquiry: [
      { id: '1', label: 'Pilgrim Name', type: 'text', placeholder: 'Lead pilgrim full name', required: true },
      { id: '2', label: 'Contact Phone', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
      { id: '3', label: 'Email Address', type: 'email', placeholder: 'name@example.com', required: true },
      { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select package choice', required: true },
      { id: '5', label: 'Number of Travelers', type: 'text', placeholder: 'e.g. 4 adults', required: true },
      { id: '6', label: 'Special Notes', type: 'textarea', placeholder: 'Any special requests...', required: false },
    ],
    visaConsultation: [
      { id: '1', label: 'Applicant Name', type: 'text', placeholder: 'Full passport name', required: true },
      { id: '2', label: 'Nationality', type: 'text', placeholder: 'e.g. Canadian', required: true },
      { id: '3', label: 'Passport Type', type: 'select', placeholder: 'Regular / Diplomatic', required: true },
      { id: '4', label: 'Destination', type: 'text', placeholder: 'Saudi Arabia', required: true },
      { id: '5', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
      { id: '6', label: 'Consultation Details', type: 'textarea', placeholder: 'Describe your visa needs...', required: false },
    ],
    flightInquiry: [
      { id: '1', label: 'Full Name (As per Passport)', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Email Address', type: 'email', placeholder: 'example@email.com', required: true },
      { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 890', required: true },
      { id: '4', label: 'Departure City', type: 'text', placeholder: 'e.g. London', required: true },
      { id: '5', label: 'Destination City', type: 'text', placeholder: 'e.g. Jeddah', required: true },
      { id: '6', label: 'Travel Date', type: 'date', placeholder: 'e.g. March 10, 2025', required: true },
      { id: '7', label: 'Return Date (if round trip)', type: 'date', placeholder: 'e.g. March 20, 2025', required: false },
      { id: '8', label: 'Trip Type', type: 'select', placeholder: 'One-Way / Round Trip', required: true },
      { id: '9', label: 'Passengers', type: 'select', placeholder: '1, 2, 3...', required: true },
      { id: '10', label: 'Class', type: 'select', placeholder: 'Economy / Business / First Class', required: true },
      { id: '11', label: 'Message', type: 'richtext', placeholder: 'Special request (seat, baggage, meal preference...)', required: false },
    ],
    dropUsMessage: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Email Address', type: 'email', placeholder: 'Email Address', required: true },
      { id: '3', label: 'Phone Number', type: 'tel', placeholder: 'Phone Number', required: false },
      { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select Package', required: false },
      { id: '5', label: 'Message', type: 'textarea', placeholder: 'Your Message', required: false },
    ],
    blogSidebarForm: [
      { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
      { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
      { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
      { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select Hajj or Umrah package', required: true },
      { id: '5', label: 'Travel Month', type: 'select', placeholder: 'Preferred travel month', required: false },
      { id: '6', label: 'Adults', type: 'select', placeholder: '1', required: true },
      { id: '7', label: 'Children', type: 'select', placeholder: '0', required: false },
    ],
  });

  const [emailConfigs, setEmailConfigs] = useState<{
    sendToEmail: string;
    emailSubjectLine: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    successHeading: string;
    successDescription: string;
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    smtpEncryption: string;
    formRoutes?: Record<string, string>;
    formCcRoutes?: Record<string, string>;
    formBccRoutes?: Record<string, string>;
    formRoutingRules?: Array<{ id: string; forms: string[]; sendTo: string; cc: string; bcc: string }>;
  }>({
    sendToEmail: 'saudivisa@kingtravelcan.com',
    emailSubjectLine: 'New Pilgrimage Form Submission',
    fromName: 'King Travel Canada',
    fromEmail: 'no-reply@kingtravelcan.com',
    replyTo: 'no-reply@kingtravelcan.com',
    successHeading: 'Message Sent Successfully!',
    successDescription: 'Thank you for contacting King Travel Canada. We will respond within 24 hours.',
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    formRoutes: {},
    formCcRoutes: {},
    formBccRoutes: {},
    formRoutingRules: [
      { id: 'rule_1', forms: ['quoteForm', 'hajjCustomizeForm', 'contact', 'dropUsMessage'], sendTo: 'saudivisa@kingtravelcan.com', cc: '', bcc: '' },
      { id: 'rule_2', forms: ['packageDetailForm', 'hajjPackageDetailForm', 'packageInquiry', 'blogSidebarForm'], sendTo: 'booking@kingtravelcan.com', cc: '', bcc: '' },
      { id: 'rule_3', forms: ['visaConsultation'], sendTo: 'visas@kingtravelcan.com', cc: '', bcc: '' },
      { id: 'rule_4', forms: ['flightInquiry'], sendTo: 'flights@kingtravelcan.com', cc: '', bcc: '' },
    ],
  });

  const [selectedTemplateSubject, setSelectedTemplateSubject] =
    useState<CanonicalFormSubject>('Get a Free Quote Form');

  const [emailTemplateHtml, setEmailTemplateHtml] = useState<string>(() =>
    getResponsiveEmailTemplateHtml(
      'Get a Free Quote Form',
      FORM_SAMPLE_DATA['Get a Free Quote Form']
    )
  );

  const [formsData, setFormsData] = useState<any>({
    quoteForm: { title: 'Homepage Hero Banner — Get a Free Quote Form', subtitle: 'Inline quote form embedded in the Homepage & Umrah landing page hero banner.', recipientEmail: 'saudivisa@kingtravelcan.com', successMessage: 'Thank you! Your quote request has been received.', enabled: true, buttonText: 'Submit Quote' },
    packageDetailForm: { title: 'Umrah Package Booking Form (Detail Page & Popup Modal)', subtitle: 'Primary booking form used across individual Umrah detail pages (/package/[slug]) and the “Book Now” popup modal.', recipientEmail: 'booking@kingtravelcan.com', successMessage: 'Your package booking request has been submitted.', enabled: true, buttonText: 'Book Package' },
    hajjPackageDetailForm: { title: 'Hajj Package Booking Form (Detail Page & Popup Modal)', subtitle: 'Dedicated booking form used across individual Hajj detail pages (/package/[slug]) and the “Book Now” popup modal.', recipientEmail: 'booking@kingtravelcan.com', successMessage: 'Your Hajj package booking request has been submitted.', enabled: true, buttonText: 'Book Hajj 2027' },
    hajjCustomizeForm: { title: 'Hajj Page — Customize Your Hajj Package Form', subtitle: 'Inline quote form on the /hajj page for custom Hajj 2027 package requests.', recipientEmail: 'saudivisa@kingtravelcan.com', successMessage: 'Thank you! Your Hajj inquiry has been received.', enabled: true, buttonText: 'Submit Hajj Inquiry' },
    contact: { title: 'Contact Page — Enquiry Form', subtitle: 'Primary contact form on the /contact page for general enquiries & support.', recipientEmail: 'saudivisa@kingtravelcan.com', successMessage: 'Thank you! Your message has been received.', enabled: true, buttonText: 'Send Message' },
    packageInquiry: { title: 'Pilgrimage Package — Custom Inquiry Form', subtitle: 'Dynamic inquiry form placed on Umrah/Hajj package listing pages via Page Builder.', recipientEmail: 'booking@kingtravelcan.com', successMessage: 'Package inquiry submitted successfully!', enabled: true, buttonText: 'Submit Package Inquiry' },
    visaConsultation: { title: 'Visa Services — Consultation Form', subtitle: 'Saudi eVisa & Pilgrimage visa consultation form placed via Page Builder on visa pages.', recipientEmail: 'visas@kingtravelcan.com', successMessage: 'Visa application submitted!', enabled: true, buttonText: 'Submit Visa Request' },
    flightInquiry: { title: 'Flights Page — Booking Inquiry Form', subtitle: 'Flight quote & booking assistance form on the flights page.', recipientEmail: 'flights@kingtravelcan.com', successMessage: 'Flight request received!', enabled: true, buttonText: 'Request Booking' },
    dropUsMessage: { title: 'General — Drop Us A Message Form', subtitle: 'General purpose contact form used across multiple pages via Page Builder.', recipientEmail: 'saudivisa@kingtravelcan.com', successMessage: 'Thank you! Your message has been received.', enabled: true, buttonText: 'Send Enquiry' },
    blogSidebarForm: { title: 'Blog Detail Page — Sidebar Booking Form', subtitle: 'Sticky sidebar booking widget shown on every blog/article detail page.', recipientEmail: 'booking@kingtravelcan.com', successMessage: 'Your booking inquiry has been submitted.', enabled: true, buttonText: 'Book Your Trip' },
  });
  const [formsSaveMsg, setFormsSaveMsg] = useState<string | null>(null);
  const [savingForms, setSavingForms] = useState(false);

  useEffect(() => {
    getNavItems().then(items => {
      if (items && Array.isArray(items)) setNavTree(items);
    });
    getPagesList().then(pages => {
      if (pages && Array.isArray(pages)) setPagesList(pages);
    });
    getFooterData().then(data => {
      if (data) setFooterData(data);
    });
    getSiteIdentity().then(data => {
      if (data) {
        setIdentityData({
          ...data,
          logo: sanitizeMediaUrl(data.logo),
          favicon: sanitizeMediaUrl(data.favicon),
        });
      }
    });
    getShareTools().then(data => {
      if (data) {
        let finalData = { ...data };
        if (typeof window !== 'undefined') {
          const localShare = localStorage.getItem('king_travel_share_tools');
          if (localShare) {
            try {
              const parsedLocal = JSON.parse(localShare);
              if (parsedLocal && parsedLocal.enabled !== undefined) {
                finalData.enabled = parsedLocal.enabled;
              }
            } catch (e) { }
          }
        }
        setShareData(finalData);
      }
    });
    if (typeof window !== 'undefined') {
      const localShare = localStorage.getItem('king_travel_share_tools');
      if (localShare) {
        try {
          setShareData(JSON.parse(localShare));
        } catch (e) { }
      }
    }
    getGlobalCss().then(css => {
      if (css) setCustomCss(css);
    });
    getUsersList().then(list => {
      if (list && Array.isArray(list)) setUsersList(list);
    });
    getLoginAuthSettings().then(data => {
      if (data) setLoginAuthData(data);
    });
    getDisclaimerSettings().then(data => {
      if (data) setDisclaimerData(data);
    });
    getSeoIntelligenceSettings().then(data => {
      if (data) {
        setSeoData((prev: any) => ({
          ...prev,
          ...data,
          siteIndexingEnabled: data.siteIndexingEnabled !== undefined ? Boolean(data.siteIndexingEnabled) : (prev.siteIndexingEnabled ?? true),
        }));
        if (data.sitemapTotalUrls || data.sitemapLastGenerated) {
          setSitemapStats({
            totalUrls: data.sitemapTotalUrls || 0,
            sizeKb: data.sitemapSizeKb || '0',
            lastGenerated: data.sitemapLastGenerated || null,
          });
        }
      }
    });
    getFormsSettings().then(data => {
      if (data) {
        const loadedData = data.formsData || data;
        setFormsData((prev: any) => ({
          ...prev,
          ...loadedData,
        }));
        if (data.formFieldsState) {
          setFormFieldsState((prev) => {
            const merged = { ...prev, ...data.formFieldsState };
            Object.keys(prev).forEach((k) => {
              if (!merged[k] || merged[k].length === 0) {
                merged[k] = prev[k];
              }
            });
            return merged;
          });
        }
        if (data.emailConfigs) {
          setEmailConfigs((prev) => ({
            ...prev,
            ...data.emailConfigs,
          }));
        } else if (typeof window !== 'undefined') {
          const localEmailCfg = localStorage.getItem('king_travel_email_configs');
          if (localEmailCfg) {
            try { setEmailConfigs(JSON.parse(localEmailCfg)); } catch (e) { }
          }
        }
        if (data.emailTemplateHtml) setEmailTemplateHtml(data.emailTemplateHtml);
      }
    });
    if (typeof window !== 'undefined') {
      const localEmailCfg = localStorage.getItem('king_travel_email_configs');
      if (localEmailCfg) {
        try { setEmailConfigs(JSON.parse(localEmailCfg)); } catch (e) { }
      }
    }
  }, []);

  const handleSaveSeoSettings = async () => {
    setSavingSeo(true);
    setSeoSaveMsg(null);
    try {
      const res = await saveSeoIntelligenceSettingsAction(seoData);
      if (res.success) {
        setSeoSaveMsg('✓ SEO Intelligence settings saved successfully!');
        showNotification(
          'SEO Settings Saved',
          'Search engine indexing, Google Search Console, Google Analytics, and Sitemap configurations updated successfully.',
          'success'
        );
      } else {
        showNotification('Error Saving SEO', res.error || 'Failed to save SEO settings', 'error');
      }
    } catch (err: any) {
      showNotification('Error', err.message || 'An unexpected error occurred', 'error');
    } finally {
      setSavingSeo(false);
      setTimeout(() => setSeoSaveMsg(null), 4000);
    }
  };

  const handleRefreshSitemap = async () => {
    setSitemapLoading(true);
    setSitemapActionMsg(null);
    try {
      const res = await fetch('/api/sitemap/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const nowStr = new Date().toLocaleString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const sizeInKb = (data.sizeInBytes / 1024).toFixed(1);
        setSitemapStats({
          totalUrls: data.urlCount,
          sizeKb: sizeInKb,
          lastGenerated: nowStr,
        });
        const updatedSeo = {
          ...seoData,
          sitemapTotalUrls: data.urlCount,
          sitemapSizeKb: sizeInKb,
          sitemapLastGenerated: nowStr,
        };
        setSeoData(updatedSeo);
        await saveSeoIntelligenceSettingsAction(updatedSeo);

        setSitemapActionMsg({
          type: 'success',
          text: `Sitemap successfully generated! Included ${data.urlCount} eligible URLs (${sizeInKb} KB).`,
        });
        showNotification(
          'Sitemap Refreshed',
          `Successfully scanned and compiled ${data.urlCount} URLs into /sitemap.xml`,
          'success'
        );
      } else {
        setSitemapActionMsg({
          type: 'error',
          text: `Failed to generate sitemap: ${data.error || 'Unknown error'}`,
        });
        showNotification('Sitemap Error', data.error || 'Failed to generate sitemap', 'error');
      }
    } catch (err: any) {
      setSitemapActionMsg({
        type: 'error',
        text: `Error refreshing sitemap: ${err.message}`,
      });
      showNotification('Error', err.message, 'error');
    } finally {
      setSitemapLoading(false);
      setTimeout(() => setSitemapActionMsg(null), 5000);
    }
  };

  const handleSaveFormsSettings = async () => {
    setSavingForms(true);
    setFormsSaveMsg(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('king_travel_email_configs', JSON.stringify(emailConfigs));
      localStorage.setItem('king_travel_forms_settings', JSON.stringify({
        formsData,
        formFieldsState,
        emailConfigs,
        emailTemplateHtml,
      }));
    }

    const fullPayload = {
      formsData,
      formFieldsState,
      emailConfigs,
      emailTemplateHtml,
    };

    const res = await saveFormsSettingsAction(fullPayload);
    setSavingForms(false);
    if (res.success) {
      setFormsSaveMsg('✅ Email & Form Configurations Saved Successfully!');
      setTimeout(() => setFormsSaveMsg(null), 4000);
      if ((res as any).warning) {
        showNotification('Configurations Saved', 'Form & Email configurations saved to session cache! ' + (res as any).warning, 'warning');
      } else {
        showNotification('Configurations Published!', 'Form routing, email addresses, and form input fields updated & published live!', 'success');
      }
    } else {
      showNotification('Save Failed', (res as any).error || 'Failed to save forms configuration.', 'error');
    }
  };

  const handleInitiateRemoveForm = (formKey: string, formTitle: string) => {
    setConfirmConfig({
      title: `Remove ${formTitle}?`,
      message: `Are you sure you want to completely remove "${formTitle}"? This will permanently delete this form configuration from the database.`,
      icon: '🗑️',
      confirmText: 'Yes, Delete Form',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => handleRemoveFormCompletely(formKey),
    });
  };

  const handleRemoveFormCompletely = async (formKey: string) => {
    const updatedFormsData = { ...formsData };
    delete updatedFormsData[formKey];

    const updatedFormFieldsState = { ...formFieldsState };
    delete updatedFormFieldsState[formKey];

    setFormsData(updatedFormsData);
    setFormFieldsState(updatedFormFieldsState);

    if (editingFormKey === formKey) {
      setEditingFormKey(null);
    }

    setSavingForms(true);
    const fullPayload = {
      formsData: updatedFormsData,
      formFieldsState: updatedFormFieldsState,
      emailConfigs,
      emailTemplateHtml,
    };
    const res = await saveFormsSettingsAction(fullPayload);
    setSavingForms(false);

    if (res.success) {
      showNotification('Form Deleted', 'Form completely removed from database!', 'success');
    } else {
      showNotification('Remove Failed', (res as any).error || 'Failed to remove form from database.', 'error');
    }
  };

  const handleOpenAddUser = () => {
    setUserFormData({
      id: 0,
      name: '',
      email: '',
      password: '',
      role: 'admin',
      active: true,
      badgeBg: '#0F766E',
      badgeTextColor: '#FFFFFF',
    });
    setUserModalMode('create');
    setShowModalPassword(false);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: any) => {
    setUserFormData({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'admin',
      active: user.active ?? true,
      badgeBg: user.badgeBg || '#0F766E',
      badgeTextColor: user.badgeTextColor || '#FFFFFF',
    });
    setUserModalMode('edit');
    setShowModalPassword(false);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) {
      showNotification('Validation Error', 'Name and Email are required fields.', 'warning');
      return;
    }

    if (userModalMode === 'create') {
      const res = await createUserAction(userFormData);
      if (res.success) {
        setUserModalOpen(false);
        const updated = await getUsersList();
        setUsersList(updated);
        showNotification('User Created', 'New administrator user created successfully!', 'success');
      } else {
        showNotification('Creation Failed', res.error || 'Failed to create user.', 'error');
      }
    } else {
      const res = await updateUserAction(userFormData.id, userFormData);
      if (res.success) {
        setUserModalOpen(false);
        const updated = await getUsersList();
        setUsersList(updated);
        showNotification('User Updated', 'Administrator user details updated successfully!', 'success');
      } else {
        showNotification('Update Failed', res.error || 'Failed to update user.', 'error');
      }
    }
  };

  const handleDeleteUser = (id: number, name: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-3 h-3 text-red-600" />,
      title: 'Delete User Account',
      message: `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteUserAction(id);
        if (res.success) {
          const updated = await getUsersList();
          setUsersList(updated);
          setUserSaveMsg('✅ User Deleted!');
          setTimeout(() => setUserSaveMsg(null), 3000);
        }
      },
    });
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserFormData((prev: any) => ({ ...prev, password: pwd }));
    setShowModalPassword(true);
  };

  const handleSaveLoginAuth = async () => {
    setSavingLogin(true);
    const res = await saveLoginAuthSettingsAction(loginAuthData);
    setSavingLogin(false);
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('maintenance_updated', { detail: { maintenanceMode: loginAuthData.maintenanceMode } }));
      }
      setLoginSaveMsg('✅ Login Auth Settings Saved!');
      setTimeout(() => setLoginSaveMsg(null), 3000);
    }
  };

  const handleSaveDisclaimer = async () => {
    setSavingDisclaimer(true);
    const res = await saveDisclaimerSettingsAction(disclaimerData);
    setSavingDisclaimer(false);
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('disclaimer_updated', { detail: disclaimerData }));
      }
      setDisclaimerSaveMsg('✅ Disclaimer Popup Settings Saved!');
      setTimeout(() => setDisclaimerSaveMsg(null), 3000);
    }
  };

  const handleSaveNav = async (updatedTree: any[]) => {
    setNavTree(updatedTree);
    const res = await saveNavItemsAction(updatedTree);
    if (res.success) {
      setSaveMsg('✅ Navigation Menu Updated!');
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleSaveNavItem = (updatedItem: any) => {
    if (!updatedItem || !updatedItem.label) return;

    let found = false;
    const recursiveUpdate = (items: any[]): any[] => {
      return items.map((item) => {
        if (item.id === updatedItem.id) {
          found = true;
          return { ...item, label: updatedItem.label, url: updatedItem.url };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: recursiveUpdate(item.children) };
        }
        return item;
      });
    };

    let newTree = recursiveUpdate(navTree);

    if (!found) {
      if (updatedItem.parentId) {
        const addSub = (items: any[]): any[] => {
          return items.map((item) => {
            if (item.id === updatedItem.parentId) {
              return {
                ...item,
                children: [...(item.children || []), { id: updatedItem.id, label: updatedItem.label, url: updatedItem.url, level: updatedItem.level, children: [] }]
              };
            }
            if (item.children && item.children.length > 0) {
              return { ...item, children: addSub(item.children) };
            }
            return item;
          });
        };
        newTree = addSub(navTree);
      } else {
        newTree = [...navTree, { id: updatedItem.id, label: updatedItem.label, url: updatedItem.url, level: 1, children: [] }];
      }
    }

    handleSaveNav(newTree);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveFooter = () => {
    setConfirmConfig({
      icon: '💾',
      title: 'Save Footer Settings',
      message: 'Would you like to publish and apply these updated Footer links, logos, and switches to the live website?',
      confirmText: 'Save & Publish',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        const res = await saveFooterSettingsAction(footerData);
        if (res.success) {
          setFooterSaveMsg('✅ Footer Settings Saved & Published!');
          setTimeout(() => setFooterSaveMsg(null), 4000);
        }
      },
    });
  };

  const handleSaveIdentity = () => {
    const updatedIdentity = {
      ...identityData,
    };
    setConfirmConfig({
      icon: '🏷️',
      title: 'Save Site Identity',
      message: 'Would you like to publish these updated branding assets, logo, site name, and tagline to the live website?',
      confirmText: 'Save & Publish',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('king_travel_site_identity', JSON.stringify(updatedIdentity));
          window.dispatchEvent(new Event('identity_updated'));
          if (updatedIdentity.favicon) {
            updateBrowserFavicon(updatedIdentity.favicon);
          }
        }
        const res = await saveSiteIdentityAction(updatedIdentity);
        if (res.success) {
          if (res.warning) {
            showNotification('Site Identity Saved', 'Branding settings saved to session cache! ' + res.warning, 'warning');
          } else {
            showNotification('Site Identity Published!', 'Site identity & branding updated successfully!', 'success');
          }
        }
      },
    });
  };

  const handleSaveHeaderAll = async () => {
    const updatedIdentity = {
      ...identityData,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('king_travel_site_identity', JSON.stringify(updatedIdentity));
      window.dispatchEvent(new Event('identity_updated'));
    }
    const res = await saveSiteIdentityAction(updatedIdentity);
    await handleSaveNav(navTree);
    if (res.success) {
      if (res.warning) {
        showNotification('Header Settings Saved', 'Header settings & navigation saved to session cache! ' + res.warning, 'warning');
      } else {
        showNotification('Header Settings Published!', 'Header navigation, logo, and site identity published live successfully!', 'success');
      }
    }
  };

  const handleSaveShareTools = async () => {
    setSavingShare(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('king_travel_share_tools', JSON.stringify(shareData));
    }
    const res = await saveShareToolsAction(shareData);
    setSavingShare(false);
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('share_tools_updated'));
      }
      setShareSaveMsg('✅ Share Tools Configuration Saved!');
      setTimeout(() => setShareSaveMsg(null), 3000);
    }
  };

  const handleSaveCss = () => {
    setConfirmConfig({
      icon: '💻',
      title: 'Save Custom CSS Overrides',
      message: 'Would you like to apply these custom CSS overrides live to your entire website?',
      confirmText: 'Save & Apply',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        const res = await saveGlobalCssAction(customCss);
        if (res.success) {
          setCssSaveMsg('✅ Custom CSS Overrides Saved & Applied!');
          setTimeout(() => setCssSaveMsg(null), 4000);
        }
      },
    });
  };

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="flex flex-col gap-6 font-sans text-slate-800">

        {/* ── Page Header ── */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Settings</h1>
          </div>
          <p className="text-ink-lt mt-1 mb-0">
            Manage global interface settings, brand identity, navigation builders, and system options.
          </p>
        </div>

        {/* ── Top Multi-Tab Bar ── */}
        <div className="flex gap-2 flex-wrap bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${activeTab === t.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Header & Footer Sub-Tabs ── */}
        {activeTab === 'header-footer' && (
          <div className="flex justify-between items-center">
            <div className="flex gap-2.5">
              <button
                onClick={() => setSubTab('header')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${subTab === 'header' ? 'border-primary bg-[#e6f4f1] text-primary' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                📋 Header Builder
              </button>
              <button
                onClick={() => setSubTab('footer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${subTab === 'footer' ? 'border-primary bg-[#e6f4f1] text-primary' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                👣 Footer Builder
              </button>
            </div>
            {subTab === 'header' && (
              <button
                type="button"
                onClick={handleSaveHeaderAll}
                className="bg-primary text-white hover:bg-[#00382B] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border-none"
              >
                <Save className="w-4 h-4 text-emerald-300" /> Save Header Settings
              </button>
            )}
          </div>
        )}

        {/* ── Main Tab Content Box ── */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col gap-7">

          {/* ================= TAB 1: HEADER & FOOTER ================= */}
          {activeTab === 'header-footer' && subTab === 'header' && (
            <div className="flex flex-col gap-6">
              {/* Logo & Identity Panel */}
              <div className="border-b border-slate-100 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider m-0">
                    🖼 LOGO &amp; IDENTITY
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveIdentity}
                    className="bg-primary text-white hover:bg-[#00382B] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-300" /> Save Logo &amp; Identity
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                  <div className="h-28 bg-primary rounded-xl p-3 flex flex-col items-center justify-center border border-slate-300 shadow-2xs">
                    {identityData.logo ? (
                      <img
                        src={identityData.logo}
                        alt="Logo Preview"
                        className="max-h-16 max-w-full object-contain drop-shadow-xs"
                      />
                    ) : (
                      <span className="text-xs text-white font-bold">No Logo</span>
                    )}
                    <span className="text-[9px] text-emerald-200 mt-1.5 font-bold">Live Preview</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Header Logo Image
                      </label>
                      <div className="w-full">
                        <ImageUploadWidget
                          value={identityData.logo || ''}
                          onChange={(url: string) => setIdentityData({ ...identityData, logo: url })}
                          subfolder="branding"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          SITE NAME (TEXT FALLBACK)
                        </label>
                        <input
                          type="text"
                          value={identityData.siteName || ''}
                          onChange={(e) => setIdentityData({ ...identityData, siteName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-primary font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          ALTERNATIVE TEXT
                        </label>
                        <input
                          type="text"
                          value={identityData.logoAlt || ''}
                          onChange={(e) => setIdentityData({ ...identityData, logoAlt: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-primary font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu Builder (Multi-level & Colorized) */}
              <div className="border-b border-slate-100 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">
                      NAVIGATION MENU BUILDER
                    </h3>
                    {saveMsg && <span className="text-xs font-bold text-primary">{saveMsg}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({ id: String(Date.now()), label: '', url: '', level: 1, parentId: null, children: [] });
                      setIsModalOpen(true);
                    }}
                    className="bg-primary text-white hover:bg-[#00382B] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-1"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Render Multi-level Colorized Menu Tree — drag-and-drop enabled */}
                <div className="flex flex-col gap-2">
                  {navTree.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1.5"
                      draggable
                      onDragStart={(e) => {
                        dragL1Id.current = item.id;
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragL1Id.current && dragL1Id.current !== item.id) {
                          setDragOverL1(item.id);
                        }
                      }}
                      onDragLeave={() => setDragOverL1(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId = dragL1Id.current;
                        dragL1Id.current = null;
                        setDragOverL1(null);
                        if (!fromId || fromId === item.id) return;
                        const fromIdx = navTree.findIndex((t) => t.id === fromId);
                        const toIdx = navTree.findIndex((t) => t.id === item.id);
                        if (fromIdx === -1 || toIdx === -1) return;
                        const updated = [...navTree];
                        const [moved] = updated.splice(fromIdx, 1);
                        updated.splice(toIdx, 0, moved);
                        handleSaveNav(updated);
                      }}
                      onDragEnd={() => { dragL1Id.current = null; setDragOverL1(null); }}
                      style={{ opacity: dragL1Id.current === item.id ? 0.4 : 1 }}
                    >
                      {/* Level 1: White/Emerald Card */}
                      <div
                        className="flex items-center justify-between p-3 rounded-xl border border-emerald-800/20 bg-gradient-to-r from-emerald-50/70 to-white shadow-xs transition-all"
                        style={dragOverL1 === item.id ? { borderLeft: '3px solid #004B39', background: 'linear-gradient(to right, #d1fae5, white)' } : {}}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-ink-lt font-bold text-xs cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⋮⋮</span>
                          <span className="font-bold text-xs text-slate-800">{item.label}</span>
                          {item.children && item.children.length > 0 && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {item.children.length} sub
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-mono">{item.url}</span>
                          <button
                            type="button"
                            title="Add Sub Item"
                            onClick={() => {
                              setEditingItem({ id: String(Date.now()), label: '', url: '', level: 2, parentId: item.id, children: [] });
                              setIsModalOpen(true);
                            }}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded border-none"
                          >
                            + Sub
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem({ ...item });
                              setIsModalOpen(true);
                            }}
                            className="flex gap-1 px-3 py-1.5 rounded-lg bg-gold/50 text-primary no-underline text-[11px] font-bold hover:bg-gold transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newTree = navTree.filter(t => t.id !== item.id);
                              handleSaveNav(newTree);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Level 2 Sub-items — drag within parent only */}
                      {item.children && item.children.map((sub: any) => {
                        const l2key = `${item.id}::${sub.id}`;
                        return (
                          <div
                            key={sub.id}
                            className="ml-6 flex flex-col gap-1.5"
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              dragL2Key.current = l2key;
                              dragL1Id.current = null; // prevent level-1 drag from firing
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (dragL2Key.current && dragL2Key.current !== l2key) {
                                setDragOverL2(l2key);
                              }
                            }}
                            onDragLeave={() => setDragOverL2(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const fromKey = dragL2Key.current;
                              dragL2Key.current = null;
                              setDragOverL2(null);
                              if (!fromKey || fromKey === l2key) return;
                              const [fromParentId, fromSubId] = fromKey.split('::');
                              if (fromParentId !== item.id) return; // cross-parent not allowed
                              const children = item.children as any[];
                              const fromIdx = children.findIndex((c: any) => c.id === fromSubId);
                              const toIdx = children.findIndex((c: any) => c.id === sub.id);
                              if (fromIdx === -1 || toIdx === -1) return;
                              const updatedChildren = [...children];
                              const [moved] = updatedChildren.splice(fromIdx, 1);
                              updatedChildren.splice(toIdx, 0, moved);
                              const updatedTree = navTree.map(t =>
                                t.id === item.id ? { ...t, children: updatedChildren } : t
                              );
                              handleSaveNav(updatedTree);
                            }}
                            onDragEnd={() => { dragL2Key.current = null; setDragOverL2(null); }}
                            style={{ opacity: dragL2Key.current === l2key ? 0.4 : 1 }}
                          >
                            <div
                              className="flex items-center justify-between p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 shadow-xs transition-all"
                              style={dragOverL2 === l2key ? { borderLeft: '3px solid #0d9488', background: '#ccfbf1' } : {}}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-teal-400 font-bold text-xs cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">↳ ⋮⋮</span>
                                <span className="font-bold text-xs text-teal-900">{sub.label}</span>
                                {sub.children && sub.children.length > 0 && (
                                  <span className="text-[10px] font-extrabold bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full">
                                    {sub.children.length} sub
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-teal-700 font-mono">{sub.url}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItem({ ...sub, parentId: item.id });
                                    setIsModalOpen(true);
                                  }}
                                  className="flex gap-1 px-3 py-1.5 rounded-lg bg-gold/50 text-primary no-underline text-[11px] font-bold hover:bg-gold transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTree = navTree.map(t => {
                                      if (t.id === item.id) {
                                        return { ...t, children: t.children.filter((c: any) => c.id !== sub.id) };
                                      }
                                      return t;
                                    });
                                    handleSaveNav(newTree);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Level 3 Sub-items (not draggable — keep existing behaviour) */}
                            {sub.children && sub.children.map((sub3: any) => (
                              <div key={sub3.id} className="ml-6 flex items-center justify-between p-2 rounded-lg border border-sky-200 bg-sky-50 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-sky-400 font-bold text-xs">↳↳ ⋮⋮</span>
                                  <span className="font-bold text-xs text-sky-900">{sub3.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-sky-700 font-mono">{sub3.url}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItem({ ...sub3, parentId: sub.id });
                                      setIsModalOpen(true);
                                    }}
                                    className="text-xs text-sky-800 font-bold cursor-pointer border-none bg-transparent"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTree = navTree.map(t => {
                                        if (t.id === item.id) {
                                          return {
                                            ...t,
                                            children: t.children.map((c: any) => {
                                              if (c.id === sub.id) {
                                                return { ...c, children: c.children.filter((c3: any) => c3.id !== sub3.id) };
                                              }
                                              return c;
                                            })
                                          };
                                        }
                                        return t;
                                      });
                                      handleSaveNav(newTree);
                                    }}
                                    className="text-xs text-red-500 font-bold cursor-pointer border-none bg-transparent"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility Toggles */}
              {/* <div className="border-b border-slate-100 pb-6">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4">
                  👁 VISIBILITY TOGGLES
                </h3>
                <div className="flex flex-col gap-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold">Search Bar</div>
                      <div className="text-[11px] text-ink-lt">Show the search input in the header</div>
                    </div>
                    <Field orientation="horizontal">
                      <Switch id="switch-search-bar" checked={showSearchBar} onChange={setShowSearchBar} />
                    </Field>
                  </div>
                </div>
              </div> */}

              {/* Bottom Action Save Bar */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                <div>
                  {identitySaveMsg && <span className="text-xs font-bold text-primary">{identitySaveMsg}</span>}
                </div>
                <button
                  type="button"
                  onClick={handleSaveHeaderAll}
                  className="bg-primary text-white hover:bg-[#00382B] px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
                >
                  <Save className="w-4 h-4 text-emerald-300" /> Save Header Settings
                </button>
              </div>
            </div>
          )}

          {/* ================= FOOTER BUILDER PANEL ================= */}
          {activeTab === 'header-footer' && subTab === 'footer' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider m-0">
                  👣 FOOTER BRANDING, COLUMNS &amp; SWITCHES
                </h3>
                {footerSaveMsg && <span className="text-xs font-bold text-primary">{footerSaveMsg}</span>}
              </div>

              {/* Footer Logo & Tagline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
                <span className="text-xs font-bold text-primary uppercase">1. Footer Brand Logo &amp; Tagline</span>
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                  <div className="h-24 bg-primary rounded-xl p-3 flex flex-col items-center justify-center border border-slate-300">
                    {footerData.logo ? (
                      <img src={footerData.logo} alt="Footer Logo Preview" className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-white font-bold">No Logo</span>
                    )}
                    <span className="text-[9px] text-emerald-200 mt-1">Live Preview</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Footer Logo Image</label>
                      <div className="w-full">
                        <ImageUploadWidget
                          value={footerData.logo || ''}
                          onChange={(url: string) => setFooterData({ ...footerData, logo: url })}
                          subfolder="logos"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brand Tagline Description</label>
                      <textarea
                        rows={2}
                        value={footerData.tagline || ''}
                        onChange={(e) => setFooterData({ ...footerData, tagline: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links Manager */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase">2. Follow Us Social Links (With New Tab Switch)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = [...(footerData.socialLinks || [])];
                      current.push({ name: 'New Network', url: 'https://', icon: '', openInNewTab: true });
                      setFooterData({ ...footerData, socialLinks: current });
                    }}
                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer"
                  >
                    + Add Social Icon
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(footerData.socialLinks || []).map((item: any, sIdx: number) => (
                    <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Icon #{sIdx + 1}: {item.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (footerData.socialLinks || []).filter((_: any, i: number) => i !== sIdx);
                            setFooterData({ ...footerData, socialLinks: updated });
                          }}
                          className="text-white hover:bg-red-700 bg-red-600 border-none rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-primary rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-200">
                          {item.icon ? (
                            <img src={item.icon} alt={item.name} className="w-6 h-6 max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-white font-bold">SVG</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Name (e.g. Facebook)"
                              value={item.name || ''}
                              onChange={(e) => {
                                const updated = [...footerData.socialLinks];
                                updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                                setFooterData({ ...footerData, socialLinks: updated });
                              }}
                              className="p-1.5 rounded border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Target URL (https://...)"
                              value={item.url || ''}
                              onChange={(e) => {
                                const updated = [...footerData.socialLinks];
                                updated[sIdx] = { ...updated[sIdx], url: e.target.value };
                                setFooterData({ ...footerData, socialLinks: updated });
                              }}
                              className="p-1.5 rounded border border-slate-300 text-xs font-mono"
                            />
                          </div>
                          <div className="flex gap-2 items-center justify-between">
                            <label className="flex bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded text-[10px] font-bold cursor-pointer gap-2 items-center transition-colors">
                              <CloudUpload className="w-3 h-3" /> Upload SVG
                              <input
                                type="file"
                                accept=".svg,image/svg+xml"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
                                      showNotification('Invalid File Type', 'Please upload an SVG icon (.svg format only).', 'error');
                                      return;
                                    }
                                    const url = await uploadFileToFtp(file, 'social');
                                    if (url) {
                                      const updated = [...footerData.socialLinks];
                                      updated[sIdx] = { ...updated[sIdx], icon: url };
                                      setFooterData({ ...footerData, socialLinks: updated });
                                    }
                                  }
                                }}
                              />
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-600">Open in New Tab</span>
                              <Switch
                                checked={item.openInNewTab ?? true}
                                onChange={(val) => {
                                  const updated = [...footerData.socialLinks];
                                  updated[sIdx] = { ...updated[sIdx], openInNewTab: val };
                                  setFooterData({ ...footerData, socialLinks: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges Manager */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase">3. Trust Accreditation Badges (SVG Format)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = [...(footerData.trustBadges || [])];
                      current.push({ name: 'New Badge', icon: '' });
                      setFooterData({ ...footerData, trustBadges: current });
                    }}
                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer"
                  >
                    + Add Trust Badge
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(footerData.trustBadges || []).map((badge: any, bIdx: number) => (
                    <div key={bIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2 items-center text-center">
                      <div className="h-12 w-full bg-slate-100 rounded-lg p-1 flex items-center justify-center border border-slate-200">
                        {badge.icon ? (
                          <img src={badge.icon} alt={badge.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-ink-lt font-bold">{badge.name || 'SVG Icon'}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={badge.name || ''}
                        onChange={(e) => {
                          const updated = [...footerData.trustBadges];
                          updated[bIdx] = { ...updated[bIdx], name: e.target.value };
                          setFooterData({ ...footerData, trustBadges: updated });
                        }}
                        className="w-full p-1 rounded border border-slate-300 text-[10px] text-center font-bold"
                      />
                      <div className="flex gap-1 w-full justify-between items-center">
                        <label className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors">
                          Upload SVG
                          <input
                            type="file"
                            accept=".svg,image/svg+xml"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
                                  showNotification('Invalid File Type', 'Please upload an SVG icon (.svg format only).', 'error');
                                  return;
                                }
                                const url = await uploadFileToFtp(file, 'badges');
                                if (url) {
                                  const updated = [...footerData.trustBadges];
                                  updated[bIdx] = { ...updated[bIdx], icon: url };
                                  setFooterData({ ...footerData, trustBadges: updated });
                                }
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (footerData.trustBadges || []).filter((_: any, i: number) => i !== bIdx);
                            setFooterData({ ...footerData, trustBadges: updated });
                          }}
                          className="text-white hover:bg-red-700 text-xs bg-red-600 border-none rounded-lg p-1.5 cursor-pointer font-bold flex items-center justify-center transition-colors"
                          title="Remove badge"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 & 3: Services & Sitemap Menu Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Services Column */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase">4. Services Column Links</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = [...(footerData.servicesLinks || [])];
                        current.push({ label: 'New Service Link', url: '/' });
                        setFooterData({ ...footerData, servicesLinks: current });
                      }}
                      className="bg-primary text-white px-2.5 py-1 rounded text-xs font-bold border-none cursor-pointer"
                    >
                      + Add Link
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerData.servicesTitle || 'SERVICES'}
                    onChange={(e) => setFooterData({ ...footerData, servicesTitle: e.target.value })}
                    className="p-2 rounded-lg border border-slate-300 text-xs font-bold text-primary"
                  />
                  <div className="flex flex-col gap-2">
                    {(footerData.servicesLinks || []).map((link: any, lIdx: number) => {
                      const isFirst = lIdx === 0;
                      const isLast = lIdx === (footerData.servicesLinks || []).length - 1;

                      return (
                        <div key={lIdx} className="flex gap-1.5 items-center">
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => {
                                if (isFirst) return;
                                const updated = [...footerData.servicesLinks];
                                const temp = updated[lIdx - 1];
                                updated[lIdx - 1] = updated[lIdx];
                                updated[lIdx] = temp;
                                setFooterData({ ...footerData, servicesLinks: updated });
                              }}
                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                }`}
                              title="Move Up"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => {
                                if (isLast) return;
                                const updated = [...footerData.servicesLinks];
                                const temp = updated[lIdx + 1];
                                updated[lIdx + 1] = updated[lIdx];
                                updated[lIdx] = temp;
                                setFooterData({ ...footerData, servicesLinks: updated });
                              }}
                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isLast ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                }`}
                              title="Move Down"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Label"
                            value={link.label || ''}
                            onChange={(e) => {
                              const updated = [...footerData.servicesLinks];
                              updated[lIdx] = { ...updated[lIdx], label: e.target.value };
                              setFooterData({ ...footerData, servicesLinks: updated });
                            }}
                            className="flex-1 p-1.5 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            value={link.url || ''}
                            onChange={(e) => {
                              const updated = [...footerData.servicesLinks];
                              updated[lIdx] = { ...updated[lIdx], url: e.target.value };
                              setFooterData({ ...footerData, servicesLinks: updated });
                            }}
                            className="flex-1 p-1.5 rounded border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (footerData.servicesLinks || []).filter((_: any, i: number) => i !== lIdx);
                              setFooterData({ ...footerData, servicesLinks: updated });
                            }}
                            className="text-white hover:bg-red-700 text-xs bg-red-600 border-none rounded-lg p-1.5 cursor-pointer font-bold flex items-center justify-center transition-colors shrink-0"
                            title="Remove link"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sitemap Column */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase">5. Sitemap Column Links</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = [...(footerData.sitemapLinks || [])];
                        current.push({ label: 'New Page Link', url: '/' });
                        setFooterData({ ...footerData, sitemapLinks: current });
                      }}
                      className="bg-primary text-white px-2.5 py-1 rounded text-xs font-bold border-none cursor-pointer"
                    >
                      + Add Link
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerData.sitemapTitle || 'SITEMAP'}
                    onChange={(e) => setFooterData({ ...footerData, sitemapTitle: e.target.value })}
                    className="p-2 rounded-lg border border-slate-300 text-xs font-bold text-primary"
                  />
                  <div className="flex flex-col gap-2">
                    {(footerData.sitemapLinks || []).map((link: any, lIdx: number) => {
                      const isFirst = lIdx === 0;
                      const isLast = lIdx === (footerData.sitemapLinks || []).length - 1;

                      return (
                        <div key={lIdx} className="flex gap-1.5 items-center">
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => {
                                if (isFirst) return;
                                const updated = [...footerData.sitemapLinks];
                                const temp = updated[lIdx - 1];
                                updated[lIdx - 1] = updated[lIdx];
                                updated[lIdx] = temp;
                                setFooterData({ ...footerData, sitemapLinks: updated });
                              }}
                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                }`}
                              title="Move Up"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => {
                                if (isLast) return;
                                const updated = [...footerData.sitemapLinks];
                                const temp = updated[lIdx + 1];
                                updated[lIdx + 1] = updated[lIdx];
                                updated[lIdx] = temp;
                                setFooterData({ ...footerData, sitemapLinks: updated });
                              }}
                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isLast ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                }`}
                              title="Move Down"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Label"
                            value={link.label || ''}
                            onChange={(e) => {
                              const updated = [...footerData.sitemapLinks];
                              updated[lIdx] = { ...updated[lIdx], label: e.target.value };
                              setFooterData({ ...footerData, sitemapLinks: updated });
                            }}
                            className="flex-1 p-1.5 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            value={link.url || ''}
                            onChange={(e) => {
                              const updated = [...footerData.sitemapLinks];
                              updated[lIdx] = { ...updated[lIdx], url: e.target.value };
                              setFooterData({ ...footerData, sitemapLinks: updated });
                            }}
                            className="flex-1 p-1.5 rounded border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (footerData.sitemapLinks || []).filter((_: any, i: number) => i !== lIdx);
                              setFooterData({ ...footerData, sitemapLinks: updated });
                            }}
                            className="text-white hover:bg-red-700 text-xs bg-red-600 border-none rounded-lg p-1.5 cursor-pointer font-bold flex items-center justify-center transition-colors shrink-0"
                            title="Remove link"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Column 4: Customer Support Items */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase">6. Customer Support Column (With New Tab Switches)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = [...(footerData.supportItems || [])];
                      current.push({ phone: '', label: '', text: 'New Support Detail', url: '', openInNewTab: false });
                      setFooterData({ ...footerData, supportItems: current });
                    }}
                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer"
                  >
                    + Add Support Row
                  </button>
                </div>

                <input
                  type="text"
                  value={footerData.supportTitle || '24/7 CUSTOMER SUPPORT'}
                  onChange={(e) => setFooterData({ ...footerData, supportTitle: e.target.value })}
                  className="p-2 rounded-lg border border-slate-300 text-xs font-bold text-primary"
                />

                <div className="flex flex-col gap-2.5">
                  {(footerData.supportItems || []).map((item: any, cIdx: number) => {
                    const isFirst = cIdx === 0;
                    const isLast = cIdx === (footerData.supportItems || []).length - 1;

                    return (
                      <div key={cIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => {
                              if (isFirst) return;
                              const updated = [...footerData.supportItems];
                              const temp = updated[cIdx - 1];
                              updated[cIdx - 1] = updated[cIdx];
                              updated[cIdx] = temp;
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className={`p-1.5 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                              }`}
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => {
                              if (isLast) return;
                              const updated = [...footerData.supportItems];
                              const temp = updated[cIdx + 1];
                              updated[cIdx + 1] = updated[cIdx];
                              updated[cIdx] = temp;
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className={`p-1.5 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${isLast ? 'opacity-30 cursor-not-allowed bg-slate-50 text-ink-lt' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                              }`}
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                          <input
                            type="text"
                            placeholder="Phone / Text (e.g. +1905-624-8555)"
                            value={item.phone || item.text || ''}
                            onChange={(e) => {
                              const updated = [...footerData.supportItems];
                              const phoneVal = e.target.value;
                              const labelVal = item.label || '';
                              const combined = labelVal ? `${phoneVal} - ${labelVal}` : phoneVal;

                              // Auto-generate tel/mailto if url is empty or matches previous
                              let autoUrl = item.url;
                              if (!autoUrl || autoUrl.startsWith('tel:') || autoUrl.startsWith('mailto:')) {
                                if (phoneVal.includes('@')) {
                                  autoUrl = `mailto:${phoneVal.trim()}`;
                                } else if (phoneVal.replace(/[^0-9+]/g, '').length > 5) {
                                  autoUrl = `tel:${phoneVal.replace(/[^0-9+]/g, '')}`;
                                }
                              }

                              updated[cIdx] = {
                                ...updated[cIdx],
                                phone: phoneVal,
                                label: labelVal,
                                text: combined,
                                url: autoUrl || updated[cIdx].url || ''
                              };
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className="p-1.5 rounded border border-slate-300 text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Label (e.g. Reservation, Saudi Visa)"
                            value={item.label || ''}
                            onChange={(e) => {
                              const updated = [...footerData.supportItems];
                              const labelVal = e.target.value;
                              const phoneVal = item.phone || item.text || '';
                              const combined = labelVal ? `${phoneVal} - ${labelVal}` : phoneVal;
                              updated[cIdx] = {
                                ...updated[cIdx],
                                label: labelVal,
                                phone: phoneVal,
                                text: combined
                              };
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className="p-1.5 rounded border border-slate-300 text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Action Link (e.g. tel:+19056248555 or mailto:...)"
                            value={item.url || ''}
                            onChange={(e) => {
                              const updated = [...footerData.supportItems];
                              updated[cIdx] = { ...updated[cIdx], url: e.target.value };
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className="p-1.5 rounded border border-slate-300 text-xs font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600">Open in New Tab</span>
                            <Switch
                              checked={item.openInNewTab ?? false}
                              onChange={(val) => {
                                const updated = [...footerData.supportItems];
                                updated[cIdx] = { ...updated[cIdx], openInNewTab: val };
                                setFooterData({ ...footerData, supportItems: updated });
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (footerData.supportItems || []).filter((_: any, i: number) => i !== cIdx);
                              setFooterData({ ...footerData, supportItems: updated });
                            }}
                            className="text-white hover:bg-red-700 bg-red-600 border-none rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Bottom Bar: Copyright & Developer Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Copyright Text</label>
                  <input
                    type="text"
                    value={footerData.copyrightText || ''}
                    onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Developer Attribution Text &amp; URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={footerData.developerText || ''}
                      onChange={(e) => setFooterData({ ...footerData, developerText: e.target.value })}
                      className="flex-1 p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                    />
                    <input
                      type="text"
                      value={footerData.developerUrl || ''}
                      onChange={(e) => setFooterData({ ...footerData, developerUrl: e.target.value })}
                      className="w-40 p-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveFooter}
                  className="bg-primary text-white px-7 py-2.5 rounded-xl font-extrabold text-xs border-none cursor-pointer shadow-md hover:bg-[#00382B] transition-colors"
                >
                  💾 Save Footer Settings
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SEO INTELLIGENCE ================= */}
          {activeTab === 'seo' && (
            <div className="flex flex-col gap-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" /> SEO Intelligence &amp; Search Engine Indexing
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Configure search engine crawl indexing, XML sitemaps, Google Search Console verification, and Google Analytics 4 (GA4).
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {seoSaveMsg && (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {seoSaveMsg}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={savingSeo}
                    onClick={handleSaveSeoSettings}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#00382B] transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {savingSeo ? 'Saving...' : 'Save SEO Settings'}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${seoData.siteIndexingEnabled
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
                }`}>
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${seoData.siteIndexingEnabled
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                    }`}>
                    {seoData.siteIndexingEnabled ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold m-0">
                        {seoData.siteIndexingEnabled ? 'Search Engine Indexing is Active' : 'Search Engine Indexing is Blocked (NoIndex)'}
                      </h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${seoData.siteIndexingEnabled
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-900 border-red-300'
                        }`}>
                        {seoData.siteIndexingEnabled ? '🟢 Indexable by Google' : '🔴 NoIndex / Disallow'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 mb-0 leading-relaxed max-w-2xl">
                      {seoData.siteIndexingEnabled
                        ? 'Googlebot and other compliant search engines are permitted to crawl and index your public website pages, packages, blogs, and visa services.'
                        : 'Googlebot and web crawlers are instructed NOT to index pages (disallow /). Search engine visibility is blocked.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-700">Allow Indexing</span>
                  <Switch
                    checked={Boolean(seoData.siteIndexingEnabled ?? true)}
                    onChange={(checked: boolean) => {
                      if (!checked) {
                        setConfirmConfig({
                          title: '⚠️ Block Search Engine Crawling?',
                          message: 'Disabling site indexing adds "Disallow: /" to robots.txt and "noindex" tags across public pages. This will cause pages to disappear from Google search results. Are you sure?',
                          confirmText: 'Yes, Block Indexing',
                          variant: 'danger',
                          onConfirm: () => {
                            setSeoData({ ...seoData, siteIndexingEnabled: false });
                            setConfirmConfig(null);
                          },
                        });
                      } else {
                        setSeoData({ ...seoData, siteIndexingEnabled: true });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Canonical Website Origin Configuration Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    🌐
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Production Canonical Site URL</h3>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                      The authoritative public HTTPS domain used to generate canonical meta tags, XML sitemaps, and robots.txt.
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <input
                    type="url"
                    value={seoData.canonicalSiteUrl || ''}
                    onChange={(e) => setSeoData({ ...seoData, canonicalSiteUrl: e.target.value.trim() })}
                    placeholder="https://www.kingtravelcan.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-slate-800 outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* 2x2 Grid of Management Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* 1. XML Sitemap Management Card */}
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 flex flex-col gap-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        🗺️
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">XML Sitemap</h3>
                        <p className="text-[11px] text-slate-500 m-0">Dynamically generated XML sitemap for search engine crawlers.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={sitemapLoading}
                      onClick={handleRefreshSitemap}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                      title="Regenerate XML Sitemap"
                    >
                      <RefreshCw className={`w-3 h-3 ${sitemapLoading ? 'animate-spin text-primary' : ''}`} />
                      {sitemapLoading ? 'Regenerating...' : 'Refresh Sitemap'}
                    </button>
                  </div>

                  {sitemapActionMsg && (
                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${sitemapActionMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                      {sitemapActionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{sitemapActionMsg.text}</span>
                    </div>
                  )}

                  {/* Sitemap Live URL Display & Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Canonical Sitemap Endpoint</label>
                      <span className="text-[10px] font-bold text-ink-lt uppercase">
                        Type: XML URLSET
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-800 select-all truncate">
                        {seoData.canonicalSiteUrl
                          ? `${seoData.canonicalSiteUrl.replace(/\/+$/, '')}/sitemap.xml`
                          : (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
                            ? `${window.location.origin}/sitemap.xml`
                            : 'https://www.kingtravelcan.com/sitemap.xml')}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const url = seoData.canonicalSiteUrl
                            ? `${seoData.canonicalSiteUrl.replace(/\/+$/, '')}/sitemap.xml`
                            : (typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://www.kingtravelcan.com/sitemap.xml');
                          navigator.clipboard.writeText(url);
                          showNotification('Copied', 'Sitemap URL copied to clipboard!', 'success');
                        }}
                        className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Copy Sitemap URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-primary hover:bg-[#00382B] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Open Sitemap in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Sitemap Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-ink-lt uppercase block mb-0.5">ELIGIBLE URLS</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {sitemapStats.totalUrls > 0 ? sitemapStats.totalUrls : (seoData.sitemapTotalUrls || 'Auto-computed')}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-ink-lt uppercase block mb-0.5">SITEMAP SIZE</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {sitemapStats.sizeKb && sitemapStats.sizeKb !== '0' ? `${sitemapStats.sizeKb} KB` : (seoData.sitemapSizeKb ? `${seoData.sitemapSizeKb} KB` : 'Dynamic')}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-ink-lt uppercase block mb-0.5">LAST GENERATED</span>
                      <span className="text-xs font-semibold text-slate-700 block truncate" title={sitemapStats.lastGenerated || seoData.sitemapLastGenerated || 'Dynamic on crawler request'}>
                        {sitemapStats.lastGenerated || seoData.sitemapLastGenerated || 'On crawler visit'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-bold text-emerald-900 block mb-0.5">✓ Automatic Multi-Entity Coverage</span>
                    Includes published CMS pages, available Umrah &amp; Hajj packages, live visa service offerings, and published blog posts with clean URLs. Automatically excludes drafts and pages marked no-index.
                  </div>
                </div>

                {/* 2. Robots.txt Directives & Diagnostics Card */}
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 flex flex-col gap-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                        🤖
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">Robots.txt Configuration</h3>
                        <p className="text-[11px] text-slate-500 m-0">Crawler instructions served at /robots.txt.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = seoData.canonicalSiteUrl
                            ? `${seoData.canonicalSiteUrl.replace(/\/+$/, '')}/robots.txt`
                            : (typeof window !== 'undefined' ? `${window.location.origin}/robots.txt` : 'https://www.kingtravelcan.com/robots.txt');
                          navigator.clipboard.writeText(url);
                          showNotification('Copied', 'robots.txt URL copied to clipboard!', 'success');
                        }}
                        className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Copy robots.txt URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3" /> View robots.txt
                      </a>
                    </div>
                  </div>

                  {/* Effective Served Directives */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-2 font-mono text-[11px] text-slate-800">
                    <div className="flex items-center justify-between text-ink-lt uppercase text-[10px] font-bold border-b border-slate-100 pb-1">
                      <span>EFFECTIVE ROBOTS.TXT DIRECTIVES</span>
                      <span className={seoData.siteIndexingEnabled ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                        {seoData.siteIndexingEnabled ? '● HEALTHY' : '● BLOCKED'}
                      </span>
                    </div>
                    {seoData.siteIndexingEnabled ? (
                      <div className="space-y-1">
                        <div>User-agent: *</div>
                        <div className="text-emerald-700 font-bold">Allow: /</div>
                        <div className="text-slate-500">Disallow: /admin/</div>
                        <div className="text-slate-500">Disallow: /api/</div>
                        {Array.isArray(seoData.additionalDisallowPaths) && seoData.additionalDisallowPaths.map((p: string, pIdx: number) => (
                          <div key={pIdx} className="text-amber-700">Disallow: {p}</div>
                        ))}
                        <div className="text-blue-700 font-bold pt-1">
                          Sitemap: {seoData.canonicalSiteUrl
                            ? `${seoData.canonicalSiteUrl.replace(/\/+$/, '')}/sitemap.xml`
                            : (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
                              ? `${window.location.origin}/sitemap.xml`
                              : 'https://www.kingtravelcan.com/sitemap.xml')}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-red-800 font-bold">
                        <div>User-agent: *</div>
                        <div className="text-red-700">Disallow: /</div>
                        <div className="text-[10px] text-red-600 font-normal"># Search engine indexing disabled by admin</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Disallow Routes Controls */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Additional Disallow Paths (Optional)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. /private/ or /staging-preview"
                        id="newDisallowPathInput"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.currentTarget.value || '').trim();
                            if (val && val.startsWith('/') && val !== '/') {
                              const current = seoData.additionalDisallowPaths || [];
                              if (!current.includes(val)) {
                                setSeoData({ ...seoData, additionalDisallowPaths: [...current, val] });
                              }
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-1 p-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newDisallowPathInput') as HTMLInputElement;
                          if (input) {
                            const val = (input.value || '').trim();
                            if (val && val.startsWith('/') && val !== '/') {
                              const current = seoData.additionalDisallowPaths || [];
                              if (!current.includes(val)) {
                                setSeoData({ ...seoData, additionalDisallowPaths: [...current, val] });
                              }
                              input.value = '';
                            }
                          }
                        }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Add Path
                      </button>
                    </div>

                    {Array.isArray(seoData.additionalDisallowPaths) && seoData.additionalDisallowPaths.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {seoData.additionalDisallowPaths.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs">
                            {p}
                            <button
                              type="button"
                              onClick={() => {
                                setSeoData({
                                  ...seoData,
                                  additionalDisallowPaths: seoData.additionalDisallowPaths.filter((item: string) => item !== p),
                                });
                              }}
                              className="text-ink-lt hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Google Search Console Card */}
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 flex flex-col gap-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        🌐
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">Google Search Console</h3>
                        <p className="text-[11px] text-slate-500 m-0">Verify website ownership and submit sitemaps to Google.</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${seoData.googleSearchConsoleCode
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                      {seoData.googleSearchConsoleCode ? '✓ Configured' : 'Not Connected'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      HTML Verification Code / Tag
                    </label>
                    <input
                      type="text"
                      value={seoData.googleSearchConsoleCode || ''}
                      onChange={(e) => {
                        let val = e.target.value;
                        const match = val.match(/content=["']([^"']+)["']/i);
                        if (match && match[1]) {
                          val = match[1];
                        }
                        setSeoData({ ...seoData, googleSearchConsoleCode: val });
                      }}
                      placeholder="e.g. d_y3Z59b09vF6P8_..."
                      className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1.5">
                      Paste either your verification code or the full <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[10px] text-slate-800">&lt;meta name=&quot;google-site-verification&quot;&gt;</code> tag provided by Google Search Console.
                    </span>
                  </div>

                  {/* Submission Shortcut */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Submit to Google Search Console</span>
                      <a
                        href="https://search.google.com/search-console"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        Open Search Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
                      After entering your verification tag, verify ownership in Google Search Console, then navigate to <strong>Sitemaps</strong> in GSC and submit <code className="text-primary font-bold">sitemap.xml</code>.
                    </p>
                  </div>
                </div>

                {/* 4. Google Analytics 4 (GA4) Card */}
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 flex flex-col gap-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                        📊
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">Google Analytics 4 (GA4)</h3>
                        <p className="text-[11px] text-slate-500 m-0">Live visitor tracking and user behavior analytics.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${seoData.googleAnalyticsId && (seoData.googleAnalyticsEnabled ?? true)
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                        {seoData.googleAnalyticsId && (seoData.googleAnalyticsEnabled ?? true) ? '● Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      GA4 Measurement ID
                    </label>
                    <input
                      type="text"
                      value={seoData.googleAnalyticsId || ''}
                      onChange={(e) => setSeoData({ ...seoData, googleAnalyticsId: e.target.value.trim().toUpperCase() })}
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1.5">
                      Found in Google Analytics &gt; Admin &gt; Data Streams &gt; Web stream details.
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Enable Global Tracking</span>
                      <span className="text-[11px] text-slate-500">Inject gtag.js script across all public website pages.</span>
                    </div>
                    <Switch
                      checked={Boolean(seoData.googleAnalyticsEnabled ?? true)}
                      onChange={(checked: boolean) => setSeoData({ ...seoData, googleAnalyticsEnabled: checked })}
                    />
                  </div>
                </div>

              </div>

              {/* 5. Indexing Readiness & Health Checklist */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col gap-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 m-0">Search Engine Indexing Readiness Checklist</h3>
                      <p className="text-[11px] text-slate-500 m-0">Deterministic verification of all search engine discoverability prerequisites.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Crawler Access (Robots.txt)</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${seoData.siteIndexingEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {seoData.siteIndexingEnabled ? 'Passed' : 'Blocked'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">XML Sitemap Endpoint</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Passed (/sitemap.xml)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Canonical Site URL</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${seoData.canonicalSiteUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {seoData.canonicalSiteUrl ? 'Configured' : 'Default / Fallback'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Google Search Console</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${seoData.googleSearchConsoleCode ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {seoData.googleSearchConsoleCode ? 'Tag Injected' : 'Not Connected'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Google Analytics 4 (GA4)</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${seoData.googleAnalyticsId && (seoData.googleAnalyticsEnabled ?? true) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {seoData.googleAnalyticsId && (seoData.googleAnalyticsEnabled ?? true) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">HTTPS Protocol</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Enforced (HTTPS)
                    </span>
                  </div>
                </div>

                {/* Contextual Guidance */}
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  {seoData.siteIndexingEnabled ? (
                    <div>
                      <strong>💡 SEO Foundation Status:</strong> Search engine crawlers can reach public pages, your sitemap is dynamically generated at <code className="font-bold">/sitemap.xml</code>, and robots.txt directives are active. Verify your ownership in Google Search Console to monitor real-time Google indexing metrics.
                    </div>
                  ) : (
                    <div>
                      <strong>⚠️ Indexing Disabled:</strong> The website is currently returning <code className="font-bold">Disallow: /</code> and <code className="font-bold">noindex</code> directives. Enable <strong>Allow Indexing</strong> when the site is ready for public search engine indexing.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Save Bar */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={savingSeo}
                  onClick={handleSaveSeoSettings}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-extrabold text-xs border-none cursor-pointer shadow-md hover:bg-[#00382B] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingSeo ? 'Saving Settings...' : 'Save SEO Intelligence Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SITE IDENTITY (Exact Template Match) ================= */}
          {activeTab === 'identity' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0">Site Identity</h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Manage your website&apos;s core branding and metadata.</p>
                </div>
                <div className="flex items-center gap-3">
                  {identitySaveMsg && <span className="text-xs font-bold text-primary">{identitySaveMsg}</span>}
                  <button
                    type="button"
                    onClick={handleSaveIdentity}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3 h-3" /> Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Card: Basic Information */}
                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-5">
                  <h3 className="text-sm font-bold text-slate-800 m-0">Basic Information</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={identityData.siteName || ''}
                      onChange={(e) => setIdentityData({ ...identityData, siteName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 bg-emerald-50/30 text-xs font-semibold text-slate-900 outline-none focus:border-primary"
                      placeholder="Enter site name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Tagline / Description</label>
                    <textarea
                      rows={3}
                      value={identityData.tagline || ''}
                      onChange={(e) => setIdentityData({ ...identityData, tagline: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 bg-emerald-50/30 text-xs font-medium text-slate-900 outline-none focus:border-primary"
                      placeholder="Describe your site for search engines and headers..."
                    />
                  </div>

                  {/* ── WhatsApp: Header Button ── */}
                  <div className="pt-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-[#25D366] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.126 1.526 5.865L0 24l6.335-1.499A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.653-.49-5.187-1.348l-.372-.22-3.762.89.944-3.658-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Header WhatsApp Button</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subtext / Label Above Number</label>
                        <input
                          type="text"
                          value={identityData.whatsappHeaderLabel || ''}
                          onChange={(e) => setIdentityData({ ...identityData, whatsappHeaderLabel: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-primary"
                          placeholder="e.g. Book Hajj & Umrah"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Display Number / Text</label>
                        <input
                          type="text"
                          value={identityData.whatsappHeaderText || ''}
                          onChange={(e) => setIdentityData({ ...identityData, whatsappHeaderText: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-primary"
                          placeholder="e.g. +1 905-624-8344"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WhatsApp URL (wa.me/...)</label>
                        <input
                          type="text"
                          value={identityData.whatsappHeaderUrl || ''}
                          onChange={(e) => setIdentityData({ ...identityData, whatsappHeaderUrl: e.target.value, whatsappFloatUrl: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-primary"
                          placeholder="https://wa.me/19056248344?text=Hi..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── WhatsApp: Floating Bottom Button ── */}
                  <div className="pt-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-[#25D366] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.126 1.526 5.865L0 24l6.335-1.499A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.653-.49-5.187-1.348l-.372-.22-3.762.89.944-3.658-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Floating Bottom-Right WhatsApp Button</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WhatsApp URL (wa.me/...)</label>
                        <input
                          type="text"
                          value={identityData.whatsappFloatUrl || ''}
                          onChange={(e) => setIdentityData({ ...identityData, whatsappFloatUrl: e.target.value, whatsappHeaderUrl: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-primary"
                          placeholder="https://wa.me/19056248344?text=Hi..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tooltip / Aria Label</label>
                        <input
                          type="text"
                          value={identityData.whatsappFloatLabel || ''}
                          onChange={(e) => setIdentityData({ ...identityData, whatsappFloatLabel: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-primary"
                          placeholder="e.g. Chat on WhatsApp"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Branding Assets */}
                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-5">
                  <h3 className="text-sm font-bold text-slate-800 m-0">Branding Assets</h3>

                  {/* Site Logo Uploader & Preview */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-700">Site Logo</label>
                    <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center relative min-h-[140px] text-center">
                      {identityData.logo ? (
                        <img src={identityData.logo} alt="Site Logo" className="max-h-24 max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-ink-lt font-bold">Click to upload site logo</span>
                      )}
                      <div className="flex gap-2 items-center mt-3">
                        <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" /> {identityData.logo ? 'Change Logo Image' : 'Upload Logo Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadFileToFtp(file, 'branding');
                                if (url) {
                                  const autoAlt = generateAutoAltText(file, identityData.siteName || 'Official Logo');
                                  setIdentityData((prev: any) => ({ ...prev, logo: url, logoAlt: autoAlt }));
                                }
                              }
                            }}
                          />
                        </label>
                        {identityData.logo && (
                          <button
                            type="button"
                            onClick={() => setIdentityData({ ...identityData, logo: '' })}
                            className="px-3 py-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Site Favicon Uploader & Preview */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/60">
                    <label className="block text-xs font-bold text-slate-700">Site Favicon</label>
                    <div className="w-[140px] h-[140px]">
                      <ImageUploadWidget
                        value={identityData.favicon || ''}
                        onChange={(url) => {
                          setIdentityData((prev: any) => ({ ...prev, favicon: url }));
                          if (url) updateBrowserFavicon(url);
                        }}
                      />
                    </div>
                    <span className="text-xs text-ink-lt font-bold mt-1">Recommended: .ico, .png, .svg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SHARE TOOLS (Exact Template Match) ================= */}
          {activeTab === 'share' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0">Share Tools</h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Configure the global floating share sidebar for your website.</p>
                </div>
                <div className="flex items-center gap-3">
                  {shareSaveMsg && <span className="text-xs font-bold text-primary">{shareSaveMsg}</span>}
                  <button
                    type="button"
                    disabled={savingShare}
                    onClick={handleSaveShareTools}
                    className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {savingShare ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>

              {/* Grid Layout: Config Panels on Left, Live Preview Mockup on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Left 2 Columns: Settings Sections */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                  {/* 1. Display Settings */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Display Settings</h3>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Enable Share Sidebar</div>
                        <div className="text-[11px] text-white">Turn the floating share tools on or off globally.</div>
                      </div>
                      <Switch
                        checked={shareData.enabled === true || shareData.enabled === 'true'}
                        onChange={(val) => setShareData({ ...shareData, enabled: val })}
                      />
                    </div>
                  </div>

                  {/* 2. Appearance & Style */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Appearance &amp; Style</h3>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Icon Style</label>
                      <div className="flex gap-3 flex-wrap">
                        {['Rounded Square', 'Circle', 'Flat', 'Minimal'].map((style) => {
                          const val = style.toLowerCase().replace(' ', '-');
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setShareData({ ...shareData, iconStyle: val })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${shareData.iconStyle === val
                                ? 'bg-primary text-white border-primary'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                }`}
                            >
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Icon Size</span>
                        <span>{shareData.iconSize || 40}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="64"
                        value={shareData.iconSize || 40}
                        onChange={(e) => setShareData({ ...shareData, iconSize: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Color Scheme</label>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { label: 'Brand Colors', val: 'brand-colors' },
                          { label: 'Monochrome', val: 'monochrome' },
                          { label: 'Custom', val: 'custom' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setShareData({ ...shareData, colorScheme: item.val })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${shareData.colorScheme === item.val
                              ? 'bg-primary text-white border-primary'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {shareData.colorScheme === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Background Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={shareData.customBgColor || '#004B39'}
                                onChange={(e) => setShareData({ ...shareData, customBgColor: e.target.value })}
                                className="w-8 h-8 rounded border-none cursor-pointer"
                              />
                              <input
                                type="text"
                                value={shareData.customBgColor || '#004B39'}
                                onChange={(e) => setShareData({ ...shareData, customBgColor: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Text / Icon Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={shareData.customTextColor || '#ffffff'}
                                onChange={(e) => setShareData({ ...shareData, customTextColor: e.target.value })}
                                className="w-8 h-8 rounded border-none cursor-pointer"
                              />
                              <input
                                type="text"
                                value={shareData.customTextColor || '#ffffff'}
                                onChange={(e) => setShareData({ ...shareData, customTextColor: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Gap from Edge (px)</label>
                        <input
                          type="number"
                          value={shareData.gapFromEdge ?? 20}
                          onChange={(e) => setShareData({ ...shareData, gapFromEdge: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vertical Position</label>
                        <select
                          value={shareData.verticalPosition || 'center'}
                          onChange={(e) => setShareData({ ...shareData, verticalPosition: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sidebar Edge</label>
                      <select
                        value={shareData.sidebarEdge || 'right'}
                        onChange={(e) => setShareData({ ...shareData, sidebarEdge: e.target.value })}
                        className="w-48 p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Behavior Settings */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Behavior Settings</h3>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Show Labels</div>
                        <div className="text-[11px] text-white">Display platform name text.</div>
                      </div>
                      <Switch
                        checked={shareData.showLabels ?? true}
                        onChange={(val) => setShareData({ ...shareData, showLabels: val })}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Hide on Scroll Down</div>
                        <div className="text-[11px] text-white">Auto-hide when scrolling down.</div>
                      </div>
                      <Switch
                        checked={shareData.hideOnScrollDown ?? false}
                        onChange={(val) => setShareData({ ...shareData, hideOnScrollDown: val })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Open Behavior</label>
                        <select
                          value={shareData.openBehavior || 'popup'}
                          onChange={(e) => setShareData({ ...shareData, openBehavior: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold"
                        >
                          <option value="popup">New Tab / Popup</option>
                          <option value="same-tab">Same Tab</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Delay Before Showing (ms)</label>
                        <input
                          type="number"
                          value={shareData.delayBeforeShowing ?? 0}
                          onChange={(e) => setShareData({ ...shareData, delayBeforeShowing: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Exclude Pages</label>
                      <input
                        type="text"
                        value={shareData.excludePages || ''}
                        onChange={(e) => setShareData({ ...shareData, excludePages: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-mono"
                        placeholder="/cart, /checkout, /private"
                      />
                      <span className="text-[10px] text-ink-lt mt-1 block">Enter paths separated by commas where the sidebar should not appear.</span>
                    </div>
                  </div>

                  {/* 4. Share URL Settings */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Share URL Settings</h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">URL to Share</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            name="urlToShare"
                            value="current"
                            checked={shareData.urlToShare === 'current'}
                            onChange={() => setShareData({ ...shareData, urlToShare: 'current' })}
                            className="accent-primary"
                          />
                          Current Page URL
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            name="urlToShare"
                            value="custom"
                            checked={shareData.urlToShare === 'custom'}
                            onChange={() => setShareData({ ...shareData, urlToShare: 'custom' })}
                            className="accent-primary"
                          />
                          Custom URL
                        </label>
                      </div>
                      {shareData.urlToShare === 'custom' && (
                        <input
                          type="text"
                          value={shareData.customShareUrl || ''}
                          onChange={(e) => setShareData({ ...shareData, customShareUrl: e.target.value })}
                          className="w-full mt-2 p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                          placeholder="/special-offer"
                        />
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-800">UTM Parameters</div>
                        <div className="text-[11px] text-white">Append UTM tags to shared links.</div>
                      </div>
                      <Switch
                        checked={shareData.utmParameters ?? false}
                        onChange={(val) => setShareData({ ...shareData, utmParameters: val })}
                      />
                    </div>
                  </div>

                  {/* 5. Analytics */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Analytics</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Track Share Clicks</div>
                        <div className="text-[11px] text-white">Send events to Google Analytics.</div>
                      </div>
                      <Switch
                        checked={shareData.trackClicks ?? true}
                        onChange={(val) => setShareData({ ...shareData, trackClicks: val })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GA Event Name</label>
                      <input
                        type="text"
                        value={shareData.gaEventName || 'share_click'}
                        onChange={(e) => setShareData({ ...shareData, gaEventName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* 6. Active Platforms (Drag/Reorder & Toggle) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider m-0">Active Platforms</h3>
                    <span className="text-[11px] text-white">Drag/reorder or toggle checkbox to enable/disable sharing channels.</span>

                    <div className="flex flex-col gap-2">
                      {(shareData.activePlatforms || []).map((p: any, pIdx: number) => (
                        <div key={p.id || pIdx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-emerald-50/10">
                          <div className="flex items-center gap-3">
                            <span className="text-ink-lt font-bold text-xs cursor-move">⋮⋮</span>
                            <input
                              type="checkbox"
                              checked={p.enabled ?? true}
                              onChange={(e) => {
                                const updated = [...shareData.activePlatforms];
                                updated[pIdx] = { ...updated[pIdx], enabled: e.target.checked };
                                setShareData({ ...shareData, activePlatforms: updated });
                              }}
                              className="accent-primary w-4 h-4 rounded cursor-pointer"
                            />
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" ref={(el) => { if (el) el.style.backgroundColor = p.color || '#004B39'; }}>
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{p.name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={pIdx === 0}
                              onClick={() => {
                                const updated = [...shareData.activePlatforms];
                                const temp = updated[pIdx - 1];
                                updated[pIdx - 1] = updated[pIdx];
                                updated[pIdx] = temp;
                                setShareData({ ...shareData, activePlatforms: updated });
                              }}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={pIdx === shareData.activePlatforms.length - 1}
                              onClick={() => {
                                const updated = [...shareData.activePlatforms];
                                const temp = updated[pIdx + 1];
                                updated[pIdx + 1] = updated[pIdx];
                                updated[pIdx] = temp;
                                setShareData({ ...shareData, activePlatforms: updated });
                              }}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Dynamic Live Preview Mockup Browser Window */}
                <div className="sticky top-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-ink-lt ml-2">Live Web Preview</span>
                  </div>

                  {/* Wireframe Web Page Content */}
                  <div className="relative bg-slate-950 rounded-xl p-4 min-h-[380px] overflow-hidden flex flex-col gap-3 border border-slate-800">
                    <div className="h-6 bg-slate-800 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-850 rounded-sm w-full"></div>
                    <div className="h-3 bg-slate-850 rounded-sm w-5/6"></div>
                    <div className="h-28 bg-slate-850 rounded-lg w-full mt-2"></div>

                    {/* Floating Share Bar Render in Preview */}
                    {shareData.enabled && (
                      <div
                        className="absolute flex flex-col gap-2 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-2xl border border-slate-200 transition-all duration-300"
                        ref={(el) => {
                          if (el) {
                            const isLeft = shareData.sidebarEdge === 'left';
                            const edgePx = `${Math.max(6, (shareData.gapFromEdge || 20) / 2)}px`;
                            if (isLeft) {
                              el.style.left = edgePx;
                              el.style.right = 'auto';
                            } else {
                              el.style.right = edgePx;
                              el.style.left = 'auto';
                            }
                            el.style.top = shareData.verticalPosition === 'top' ? '20px' : shareData.verticalPosition === 'bottom' ? 'auto' : '50%';
                            el.style.bottom = shareData.verticalPosition === 'bottom' ? '20px' : 'auto';
                            el.style.transform = shareData.verticalPosition === 'center' ? 'translateY(-50%)' : 'none';
                          }
                        }}
                      >
                        {(shareData.activePlatforms || [])
                          .filter((p: any) => p.enabled)
                          .map((p: any) => {
                            let bg = p.color || '#004B39';
                            let txtColor = '#ffffff';
                            if (shareData.colorScheme === 'monochrome') {
                              bg = '#334155';
                            } else if (shareData.colorScheme === 'custom') {
                              bg = shareData.customBgColor || '#004B39';
                              txtColor = shareData.customTextColor || '#ffffff';
                            }

                            const radiusClass =
                              shareData.iconStyle === 'circle'
                                ? 'rounded-full'
                                : shareData.iconStyle === 'flat'
                                  ? 'rounded-none'
                                  : shareData.iconStyle === 'minimal'
                                    ? 'rounded-md shadow-none'
                                    : 'rounded-lg';

                            return (
                              <div
                                key={p.id}
                                className={`flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform hover:scale-105 ${radiusClass}`}
                                ref={(el) => {
                                  if (el) {
                                    el.style.backgroundColor = bg;
                                    el.style.color = txtColor;
                                    el.style.padding = shareData.showLabels ? '4px 8px' : '6px';
                                  }
                                }}
                              >
                                <span className="text-[11px] font-extrabold flex items-center justify-center w-4 h-4" ref={(el) => { if (el) el.style.color = txtColor; }}>
                                  {p.name.charAt(0)}
                                </span>
                                {shareData.showLabels && (
                                  <span className="text-[9px] font-bold pr-1" ref={(el) => { if (el) el.style.color = txtColor; }}>{p.name}</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-ink-lt text-center">Changes reflect live in preview above based on selected options.</span>
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 5: USERS MANAGEMENT ================= */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0">User Management</h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Manage administrators and restricted editors</p>
                </div>
                <div className="flex items-center gap-3">
                  {userSaveMsg && <span className="text-xs font-bold text-primary">{userSaveMsg}</span>}
                  <button
                    type="button"
                    onClick={handleOpenAddUser}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="p-4 pl-6">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-ink-lt font-normal">
                          No users found. Click &quot;Add User&quot; to create your first account.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900">{u.name}</span>
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold inline-block"
                                    ref={(el) => {
                                      if (el) {
                                        el.style.backgroundColor = u.badgeBg || '#0F766E';
                                        el.style.color = u.badgeTextColor || '#FFFFFF';
                                      }
                                    }}
                                  >
                                    Badge
                                  </span>
                                </div>
                                <div className="text-[11px] text-ink-lt font-medium">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="capitalize font-semibold text-slate-700">
                              {u.role === 'super_admin'
                                ? 'Full Admin'
                                : u.role === 'admin'
                                  ? 'Full Admin'
                                  : u.role === 'content_editor'
                                    ? 'Content Editor'
                                    : u.role === 'enquiry_manager'
                                      ? 'Enquiry Manager'
                                      : 'SEO Manager'}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.active ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-block">
                                Active
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold inline-block">
                                Disabled
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric',
                              })
                              : '6/2/2026'}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add / Edit User Modal */}
              {userModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-base font-extrabold text-slate-900 m-0">
                        {userModalMode === 'create' ? 'Add New User' : 'Edit User'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setUserModalOpen(false)}
                        className="text-ink-lt hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={userFormData.name}
                          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                          placeholder="e.g. Abdullah Khan"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                          placeholder="user@kingtravelcan.com"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            {userModalMode === 'edit' ? 'Password (Leave blank to keep unchanged)' : 'Password'}
                          </label>
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                          >
                            <Key className="w-3 h-3" /> Auto-generate
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type={showModalPassword ? 'text' : 'password'}
                            value={userFormData.password}
                            onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                            className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowModalPassword(!showModalPassword)}
                            className="absolute right-3 text-ink-lt hover:text-slate-600 border-none bg-transparent cursor-pointer"
                          >
                            {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {userFormData.password && userFormData.password.length > 0 && (() => {
                          const pw = userFormData.password;
                          let strength = 0;
                          if (pw.length >= 8) strength += 1;
                          if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) strength += 1;
                          if (/\d/.test(pw)) strength += 1;
                          if (/[^a-zA-Z\d]/.test(pw)) strength += 1;

                          let label = 'Weak';
                          let percent = 25;
                          let color = 'bg-red-500';
                          let textColor = 'text-red-500';

                          if (strength === 2) {
                            label = 'Average';
                            percent = 50;
                            color = 'bg-orange-500';
                            textColor = 'text-orange-500';
                          } else if (strength === 3) {
                            label = 'Normal';
                            percent = 75;
                            color = 'bg-yellow-500';
                            textColor = 'text-yellow-600';
                          } else if (strength >= 4) {
                            label = 'Strong';
                            percent = 100;
                            color = 'bg-primary';
                            textColor = 'text-emerald-700';
                          }

                          return (
                            <div className="mt-2.5">
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${color}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-wider mt-1">
                                <span className={textColor}>{label}</span>
                                <span className="text-ink-lt font-semibold lowercase">{percent}% secure</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Role Assignment</label>
                          <select
                            value={userFormData.role}
                            onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                          >
                            <option value="admin">Full Admin</option>
                            <option value="content_editor">Restricted Editor</option>
                            <option value="enquiry_manager">Enquiry Manager</option>
                            <option value="seo_manager">SEO Manager</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                          <select
                            value={userFormData.active ? 'active' : 'disabled'}
                            onChange={(e) => setUserFormData({ ...userFormData, active: e.target.value === 'active' })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
                          >
                            <option value="active">Active (Allowed)</option>
                            <option value="disabled">Disabled (Blocked)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">User Badge Custom Colors</label>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <span>Preview:</span>
                            <span
                              className="px-2.5 py-0.5 rounded-md text-xs font-bold transition-colors"
                              ref={(el) => {
                                if (el) {
                                  el.style.backgroundColor = userFormData.badgeBg || '#0F766E';
                                  el.style.color = userFormData.badgeTextColor || '#FFFFFF';
                                }
                              }}
                            >
                              {userFormData.name || 'User'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Background</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={userFormData.badgeBg || '#0F766E'}
                                onChange={(e) => setUserFormData({ ...userFormData, badgeBg: e.target.value })}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={userFormData.badgeBg || '#0F766E'}
                                onChange={(e) => setUserFormData({ ...userFormData, badgeBg: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Text Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={userFormData.badgeTextColor || '#FFFFFF'}
                                onChange={(e) => setUserFormData({ ...userFormData, badgeTextColor: e.target.value })}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={userFormData.badgeTextColor || '#FFFFFF'}
                                onChange={(e) => setUserFormData({ ...userFormData, badgeTextColor: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setUserModalOpen(false)}
                          className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-[#00382B] cursor-pointer"
                        >
                          {userModalMode === 'create' ? 'Create User' : 'Update User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: LOGIN AUTH SETTINGS ================= */}
          {activeTab === 'auth' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0">Login Authentication UI Settings</h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Configure the cinematic 3D login screen&apos;s background, logo, and footer text.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {loginSaveMsg && <span className="text-xs font-bold text-primary">{loginSaveMsg}</span>}
                  <button
                    type="button"
                    disabled={savingLogin}
                    onClick={handleSaveLoginAuth}
                    className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {savingLogin ? 'Saving...' : 'Save Login Settings'}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col gap-5 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Background Image Uploader */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-700">Login Page Background Image</label>
                    <div className="p-6 rounded-2xl border border-slate-300 bg-slate-500/80 flex flex-col items-center justify-center relative min-h-[160px] text-center overflow-hidden">
                      {loginAuthData.backgroundImage ? (
                        <img
                          src={loginAuthData.backgroundImage}
                          alt="Login Background"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-200 font-bold z-10">Upload background image</span>
                      )}
                      <div className="flex gap-2 items-center z-10 bg-slate-900/60 p-2 rounded-xl backdrop-blur-xs">
                        <label className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" /> {loginAuthData.backgroundImage ? 'Change Image' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadFileToFtp(file, 'branding');
                                if (url) setLoginAuthData({ ...loginAuthData, backgroundImage: url });
                              }
                            }}
                          />
                        </label>
                        {loginAuthData.backgroundImage && (
                          <button
                            type="button"
                            onClick={() => setLoginAuthData({ ...loginAuthData, backgroundImage: '' })}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-[10px] font-bold text-ink-lt uppercase tracking-wider mb-1.5">
                        ALTERNATIVE TEXT
                      </label>
                      <input
                        type="text"
                        value={loginAuthData.backgroundAlt || ''}
                        onChange={(e) => setLoginAuthData({ ...loginAuthData, backgroundAlt: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold outline-none"
                        placeholder="Describe this image for accessibility..."
                      />
                      <span className="text-[10px] text-ink-lt mt-1 block">
                        Upload a high-quality background for the login page (1920x1080 recommended).
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Footer Text */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-700">Login Footer Text</label>
                    <input
                      type="text"
                      value={loginAuthData.footerText || ''}
                      onChange={(e) => setLoginAuthData({ ...loginAuthData, footerText: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 bg-emerald-50/20 text-xs font-semibold outline-none focus:border-primary"
                      placeholder="© 2026 King Travel Can Ltd. All Rights Reserved."
                    />
                  </div>
                </div>

                {/* System Maintenance Section */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span>⚠️</span> System Maintenance
                  </h3>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-amber-500/10 border border-amber-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Maintenance Mode</div>
                      <div className="text-[11px] text-slate-600">
                        When active, the frontend will display a maintenance page. You will still be able to access the admin panel.
                      </div>
                    </div>
                    <Switch
                      checked={loginAuthData.maintenanceMode ?? false}
                      onChange={(val) => setLoginAuthData({ ...loginAuthData, maintenanceMode: val })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: DISCLAIMER POPUP SETTINGS ================= */}
          {activeTab === 'popup' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    <span>🚩</span> Disclaimer Popup Settings
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Configure the disclaimer image that appears on the homepage when a user visits the site.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Box: Disclaimer Image Uploader */}
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-bold text-slate-700">Disclaimer Image</label>
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center relative min-h-[180px] group hover:border-primary transition-colors">
                    {disclaimerData.image ? (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden flex items-center justify-center bg-slate-900/10">
                        <img src={disclaimerData.image} alt="Disclaimer" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5" /> Change Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadFile(file, 'banners');
                                  if (url) setDisclaimerData({ ...disclaimerData, image: url });
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDisclaimerData({ ...disclaimerData, image: '' })}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-primary flex items-center justify-center mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 mb-0.5">Click to upload or drag and drop</div>
                        <div className="text-[11px] text-ink-lt">WebP, PNG &amp; SVG (max. 50KB)</div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                  const url = await uploadFileToFtp(file, 'banners');
                              if (url) setDisclaimerData({ ...disclaimerData, image: url });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-lt mt-1">Upload the image to be shown in the popup.</span>
                </div>

                {/* Right Box: Enable Disclaimer Popup Switch */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex justify-between items-center">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 mb-1">Enable Disclaimer Popup</div>
                    <div className="text-xs text-slate-500">Toggle whether the disclaimer popup is active on the homepage.</div>
                  </div>
                  <Switch
                    checked={disclaimerData.enabled ?? false}
                    onChange={(val) => setDisclaimerData({ ...disclaimerData, enabled: val })}
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4">
                {disclaimerSaveMsg && <span className="text-xs font-bold text-primary">{disclaimerSaveMsg}</span>}
                <button
                  type="button"
                  disabled={savingDisclaimer}
                  onClick={handleSaveDisclaimer}
                  className="bg-primary text-white px-8 py-3 rounded-full text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingDisclaimer ? 'Saving...' : 'Save Disclaimer Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 8: GLOBAL CSS OVERRIDES ================= */}
          {activeTab === 'css' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    <span>🎨</span> Global CSS Overrides
                  </h2>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Write custom CSS to override styles across the entire frontend and backend. These styles will be injected with maximum priority.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900 overflow-hidden shadow-xl bg-[#040817]">
                <textarea
                  rows={16}
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  className="w-full p-6 font-mono text-xs !text-white bg-transparent outline-none resize-y leading-relaxed border-none focus:ring-0"
                  placeholder="/* Add your custom CSS here */ body { /* overrides */ }"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                {cssSaveMsg && <span className="text-xs font-bold text-primary">{cssSaveMsg}</span>}
                <button
                  type="button"
                  onClick={handleSaveCss}
                  className="bg-primary text-white px-8 py-3 rounded-full text-xs font-extrabold hover:bg-[#00382B] transition-colors border-none cursor-pointer shadow-md"
                >
                  Save CSS Overrides
                </button>
              </div>
            </div>
          )}

          {/* ================= FORMS TAB ================= */}
          {activeTab === 'forms' && (
            <div className="flex flex-col gap-6">
              {/* FORMS MANAGEMENT Header with Universal Save Form Button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div>
                  <span className="text-2xl font-serif font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    FORMS MANAGEMENT
                  </span>
                  <p className="text-xs text-ink-lt mt-1 mb-0">
                    Configure titles, email routing, notification templates, submission inbox, and form field inputs across King Travel.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {formsSaveMsg && (
                    <span className="text-xs font-bold text-primary animate-in fade-in">
                      {formsSaveMsg}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveFormsSettings}
                    disabled={savingForms}
                    className="bg-primary hover:bg-[#00382B] text-white px-6 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer border-none shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4 text-emerald-300" />
                    {savingForms
                      ? 'Saving Settings...'
                      : formsSubTab === 'emailConfigs'
                        ? 'Save Email Configs'
                        : formsSubTab === 'emailTemplate'
                          ? 'Save Email Template'
                          : 'Save Forms'}
                  </button>
                </div>
              </div>

              {/* Sub-tabs Navigation Pills Bar (Only Core Email & All Forms Tabs) */}
              <div className="flex items-center gap-2 bg-[#E6ECEB] p-2 rounded-2xl border border-slate-200/80 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Forms', icon: '📋' },
                  { id: 'emailConfigs', label: 'Email Configs', icon: '⚙️' },
                  { id: 'emailTemplate', label: 'Email Template', icon: '🎨' },
                  { id: 'inbox', label: 'Inbox', icon: '📥' },
                  { id: 'emailLogs', label: 'Email Logs', icon: '📊' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setFormsSubTab(st.id as any);
                      setEditingFormKey(null);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border border-transparent cursor-pointer flex items-center gap-2 whitespace-nowrap ${formsSubTab === st.id
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200'
                      }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* ── 1. ALL FORMS SUB-TAB (Grids of all forms with Status Dropdowns & Field Inputs Manager) ── */}
              {formsSubTab === 'all' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 m-0">All Dynamic Website Forms</h3>
                      <p className="text-xs text-ink-lt mt-1 mb-0">Overview of active forms, field inputs count, recipient routing, and field manager.</p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                      {Object.keys(formsData).length} Active Forms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(formsData).map((formKey) => {
                      const DEFAULT_META: Record<string, { title: string; icon: string; desc: string }> = {
                        quoteForm: { title: 'Homepage Hero Banner — Get a Free Quote Form', icon: '🏠', desc: 'Inline quote form in the homepage & Umrah landing page hero banner.' },
                        packageDetailForm: { title: 'Umrah Package Booking Form (Detail Page & Popup Modal)', icon: '📊', desc: 'Primary booking form used on individual Umrah package detail pages and the “Book Now” popup modal.' },
                        hajjPackageDetailForm: { title: 'Hajj Package Booking Form (Detail Page & Popup Modal)', icon: '🕋', desc: 'Dedicated booking form used on individual Hajj package detail pages and the “Book Now” popup modal.' },
                        hajjCustomizeForm: { title: 'Hajj Page — Customize Your Hajj Package Form', icon: '✨', desc: 'Inline custom Hajj 2027 quote form on the /hajj page.' },
                        contact: { title: 'Contact Page — Enquiry Form', icon: '💬', desc: 'Primary contact form on the /contact page for general enquiries.' },
                        packageInquiry: { title: 'Pilgrimage Package — Custom Inquiry Form', icon: '🕋', desc: 'Dynamic inquiry form on Umrah/Hajj package listing pages via Page Builder.' },
                        visaConsultation: { title: 'Visa Services — Consultation Form', icon: '📜', desc: 'Saudi eVisa & Pilgrimage visa consultation form via Page Builder.' },
                        flightInquiry: { title: 'Flights Page — Booking Inquiry Form', icon: '✈️', desc: 'Flight quote & booking assistance form on the flights page.' },
                        dropUsMessage: { title: 'General — Drop Us A Message Form', icon: '📬', desc: 'General purpose contact form used across multiple pages via Page Builder.' },
                        blogSidebarForm: { title: 'Blog Detail Page — Sidebar Booking Form', icon: '📝', desc: 'Sticky sidebar booking widget shown on every blog/article detail page.' },
                      };

                      const cfg = formsData[formKey] || {};
                      const meta = DEFAULT_META[formKey] || {
                        title: cfg.title || formKey,
                        icon: '📝',
                        desc: cfg.subtitle || 'Custom dynamic form.',
                      };
                      const fieldsList = formFieldsState[formKey] || [];
                      const isEditingThisForm = editingFormKey === formKey;
                      const f = { key: formKey, title: meta.title, icon: meta.icon, desc: meta.desc };

                      return (
                        <div
                          key={f.key}
                          className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${isEditingThisForm
                            ? 'bg-gold/50 border-[#DB9E30] shadow-md'
                            : 'bg-white border-gold shadow-2xs hover:border-gold/30'
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{f.icon}</span>
                                <div>
                                  <h4 className="text-base font-extrabold text-slate-900 m-0">{f.title}</h4>
                                  <span className="text-[10px] font-mono font-bold text-ink-lt bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                    🗄️ DB Table: {
                                      formKey === 'quoteForm' ? 'quote_enquiries' :
                                        formKey === 'packageDetailForm' ? 'package_booking_enquiries' :
                                          formKey === 'hajjPackageDetailForm' ? 'package_booking_enquiries' :
                                            formKey === 'contact' ? 'contact_enquiries' :
                                              formKey === 'dropUsMessage' ? 'contact_enquiries' :
                                                formKey === 'visaConsultation' ? 'visa_enquiries' :
                                                  formKey === 'flightInquiry' ? 'flight_enquiries' :
                                                    formKey === 'hajjCustomizeForm' ? 'quote_enquiries' :
                                                      formKey === 'blogSidebarForm' ? 'package_booking_enquiries' : 'enquiries'
                                    }
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Interactive Status Dropdown (Active vs Disabled) */}
                                <select
                                  value={cfg.enabled ?? true ? 'active' : 'disabled'}
                                  onChange={(e) => {
                                    const isAct = e.target.value === 'active';
                                    setFormsData((prev: any) => ({
                                      ...prev,
                                      [f.key]: { ...prev[f.key], enabled: isAct },
                                    }));
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold outline-none cursor-pointer border transition-colors ${cfg.enabled ?? true
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-50 text-gold border-[#DB9E30]/50 font-bold'
                                    }`}
                                >
                                  <option value="active">● Active</option>
                                  <option value="disabled">● Disabled</option>
                                </select>

                                {/* X Remove Button (Rounded Red) */}
                                <button
                                  type="button"
                                  onClick={() => handleInitiateRemoveForm(f.key, f.title)}
                                  title={`Remove ${f.title}`}
                                  className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-200 text-white hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed mb-4">{f.desc}</p>

                            <div className="mb-4">
                              <div className="text-[11px] font-bold text-ink-lt uppercase tracking-wider mb-2">
                                Form Input Fields ({fieldsList.length}):
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {fieldsList.map((field) => (
                                  <span key={field.id} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 flex items-center gap-1">
                                    <span>{field.label}</span>
                                    {field.required && <span className="text-red-500 font-bold">*</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.enabled ?? true
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-gold bg-amber-50 border-[#DB9E30]/30'
                              }`}>
                              ● {cfg.enabled ?? true ? 'Active on Frontend' : 'Disabled (Blurred Overlay)'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingFormKey(isEditingThisForm ? null : f.key)}
                              className="text-xs font-extrabold text-primary hover:underline cursor-pointer bg-transparent border-none"
                            >
                              {isEditingThisForm ? 'Close Field Manager ✕' : 'Manage Fields & UI →'}
                            </button>
                          </div>

                          {/* Inline Field Inputs & Real-Time Form UI Manager (Wrapped inside clean inner container) */}
                          {isEditingThisForm && (
                            <div className="mt-5 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DB9E30]/40 shadow-sm flex flex-col gap-5 animate-in fade-in">
                              {/* Header Banner */}
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 text-sm shadow-2xs font-bold">
                                    ⚙️
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-extrabold text-slate-900 m-0 uppercase tracking-wider">
                                      MANAGE INPUT FIELDS FOR {f.title}
                                    </h5>
                                    <p className="text-[11px] text-white m-0 mt-0.5">Reorder fields, add new inputs, or change field labels.</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newField = {
                                      id: Date.now().toString(),
                                      label: 'New Field Input',
                                      type: 'text',
                                      placeholder: 'Enter...',
                                      required: false,
                                    };
                                    setFormFieldsState((prev) => ({
                                      ...prev,
                                      [f.key]: [...(prev[f.key] || []), newField],
                                    }));
                                  }}
                                  className="bg-primary hover:bg-[#00382B] text-white px-4 py-2 rounded-xl text-xs font-extrabold border-none cursor-pointer flex items-center gap-1.5 shadow-xs transition-all hover:shadow-md shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Field Input
                                </button>
                              </div>

                              {/* Clean Row-by-Row Field Inputs List */}
                              <div className="flex flex-col gap-3">
                                {fieldsList.map((field, idx) => (
                                  <div
                                    key={field.id}
                                    className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 overflow-hidden w-full"
                                  >
                                    {/* Left Controls: Move arrows + Label + Type dropdown */}
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      {/* Move Up/Down Controls */}
                                      <div className="flex flex-col gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shrink-0">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => {
                                            if (idx === 0) return;
                                            const updated = [...fieldsList];
                                            const temp = updated[idx - 1];
                                            updated[idx - 1] = updated[idx];
                                            updated[idx] = temp;
                                            setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                          }}
                                          className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-20 border-none cursor-pointer transition-colors"
                                          title="Move Up"
                                        >
                                          <MoveUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === fieldsList.length - 1}
                                          onClick={() => {
                                            if (idx === fieldsList.length - 1) return;
                                            const updated = [...fieldsList];
                                            const temp = updated[idx + 1];
                                            updated[idx + 1] = updated[idx];
                                            updated[idx] = temp;
                                            setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                          }}
                                          className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-20 border-none cursor-pointer transition-colors"
                                          title="Move Down"
                                        >
                                          <MoveDown className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Editable Field Label */}
                                      <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => {
                                          const updated = [...fieldsList];
                                          updated[idx].label = e.target.value;
                                          setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                        }}
                                        className="flex-1 min-w-[100px] px-3.5 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-slate-50/40 focus:bg-white truncate"
                                        placeholder="Field Label"
                                      />

                                      <select
                                        value={field.type}
                                        onChange={(e) => {
                                          const updated = [...fieldsList];
                                          updated[idx].type = e.target.value;
                                          setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                        }}
                                        className="px-3 py-2 border border-slate-200 rounded-full text-xs font-medium text-slate-700 bg-slate-50/50 outline-none focus:border-primary focus:bg-white cursor-pointer transition-all shrink-0 max-w-[140px]"
                                      >
                                        <option value="text">Text Input</option>
                                        <option value="email">Email Input</option>
                                        <option value="tel">Phone / Tel Input</option>
                                        <option value="date">Date Picker</option>
                                        <option value="select">Dropdown Select</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="richtext">Rich Text Editor</option>
                                        <option disabled>──────────</option>
                                        <option value="dropdown_packages">Packages Dropdown</option>
                                        <option value="dropdown_numbers_1_6">Numbers Dropdown (1 - 6+)</option>
                                        <option value="dropdown_flight_type">Trip Type Dropdown</option>
                                        <option value="dropdown_flight_class">Flight Class Dropdown</option>
                                        <option value="bubble_tabs_journey">Journey Type Tabs</option>
                                        <option value="dropdown_tab_package">Journey Package Dropdown</option>
                                      </select>
                                    </div>

                                    {/* Right Controls: Required Switch & Trash Icon */}
                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
                                        <span className="text-[11px] font-semibold text-slate-600">Required</span>
                                        <Switch
                                          checked={field.required}
                                          onChange={(checked: boolean) => {
                                            const updated = [...fieldsList];
                                            updated[idx].required = checked;
                                            setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                          }}
                                        />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = fieldsList.filter((_, i) => i !== idx);
                                          setFormFieldsState((prev) => ({ ...prev, [f.key]: updated }));
                                        }}
                                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all shrink-0"
                                        title="Delete Field Input"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Clean Live Frontend Form UI Preview */}
                              <div className="mt-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                    <span>👁</span> LIVE FRONTEND FORM PREVIEW ({f.title})
                                  </div>
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                    ● Live Sync
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                  {fieldsList.map((fd) => {
                                    const isFullWidth = fd.type === 'textarea' || fd.type === 'richtext';
                                    return (
                                      <div key={fd.id} className={isFullWidth ? 'sm:col-span-2' : ''}>
                                        <label className="text-xs font-extrabold text-slate-700 block mb-1">
                                          {fd.label} {fd.required && <span className="text-red-500 font-bold">*</span>}
                                        </label>
                                        {fd.type === 'textarea' || fd.type === 'richtext' ? (
                                          <div className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/70 min-h-[60px] text-ink-lt font-medium">
                                            {fd.type === 'richtext' ? '✍️ Rich Text Editor' : fd.placeholder || `Enter ${fd.label.toLowerCase()}...`}
                                          </div>
                                        ) : fd.type === 'select' ? (
                                          <select disabled className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/70 outline-none font-medium">
                                            <option>{fd.placeholder || `Select ${fd.label.toLowerCase()}...`}</option>
                                          </select>
                                        ) : fd.type === 'date' ? (
                                          <input
                                            type="date"
                                            readOnly
                                            className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/70 outline-none font-medium"
                                          />
                                        ) : (
                                          <input
                                            type={fd.type === 'tel' ? 'tel' : fd.type === 'email' ? 'email' : 'text'}
                                            readOnly
                                            placeholder={fd.placeholder || `Enter ${fd.label.toLowerCase()}...`}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/70 outline-none font-medium"
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black tracking-wide uppercase opacity-90 cursor-not-allowed shadow-xs mt-1"
                                >
                                  {cfg.buttonText || 'Submit Inquiry'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 2. EMAIL CONFIGS SUB-TAB (Redesigned Executive UI) ── */}
              {formsSubTab === 'emailConfigs' && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-2xs flex flex-col gap-6">
                  {/* Notification & Email Routing Settings Box */}
                  <div className="p-6 lg:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-primary border border-emerald-100 flex items-center justify-center text-xl shadow-2xs font-bold">
                          ✉️
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 uppercase tracking-wider m-0">NOTIFICATION &amp; EMAIL ROUTING SETTINGS</h4>
                          <p className="text-xs text-slate-500 mt-0.5 mb-0">Where website form submissions are delivered and how outgoing email notifications appear to recipients.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {formsSaveMsg && (
                          <span className="text-xs font-bold text-primary animate-in fade-in">
                            {formsSaveMsg}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveFormsSettings}
                          disabled={savingForms}
                          className="bg-primary hover:bg-[#00382B] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer border-none shadow-md flex items-center gap-2"
                        >
                          <Save className="w-4 h-4 text-emerald-300" />
                          {savingForms ? 'Saving Email Configs...' : 'Save Email Configs'}
                        </button>
                      </div>
                    </div>

                    {/* ── 1. TOP SECTION: Per-Form Email Routing Rules (Multi-Form per Card) ── */}
                    {(() => {
                      const FORM_META: Record<string, { title: string; icon: string }> = {
                        quoteForm: { title: 'Homepage Hero Banner — Get a Free Quote Form', icon: '🏠' },
                        packageDetailForm: { title: 'Umrah Package Booking Form (Detail Page & Popup Modal)', icon: '📊' },
                        hajjPackageDetailForm: { title: 'Hajj Package Booking Form (Detail Page & Popup Modal)', icon: '🕋' },
                        hajjCustomizeForm: { title: 'Hajj Page — Customize Your Hajj Package Form', icon: '✨' },
                        contact: { title: 'Contact Page — Enquiry Form', icon: '💬' },
                        packageInquiry: { title: 'Pilgrimage Package — Custom Inquiry Form', icon: '🕋' },
                        visaConsultation: { title: 'Visa Services — Consultation Form', icon: '📜' },
                        flightInquiry: { title: 'Flights Page — Booking Inquiry Form', icon: '✈️' },
                        dropUsMessage: { title: 'General — Drop Us A Message Form', icon: '📬' },
                        blogSidebarForm: { title: 'Blog Detail Page — Sidebar Booking Form', icon: '📝' },
                      };
                      const allFormKeys = Object.keys(formsData);
                      const rules = emailConfigs.formRoutingRules || [];

                      // All form keys already assigned across ALL rules
                      const allAssignedForms = rules.flatMap(r => r.forms);

                      const updateRule = (id: string, patch: Partial<{ forms: string[]; sendTo: string; cc: string; bcc: string }>) => {
                        setEmailConfigs(prev => ({
                          ...prev,
                          formRoutingRules: (prev.formRoutingRules || []).map(r =>
                            r.id === id ? { ...r, ...patch } : r
                          ),
                        }));
                      };

                      const removeRule = (id: string) => {
                        setEmailConfigs(prev => ({
                          ...prev,
                          formRoutingRules: (prev.formRoutingRules || []).filter(r => r.id !== id),
                        }));
                      };

                      const addRule = () => {
                        const unassigned = allFormKeys.find(k => !allAssignedForms.includes(k) && formsData[k]?.enabled !== false);
                        setEmailConfigs(prev => ({
                          ...prev,
                          formRoutingRules: [
                            ...(prev.formRoutingRules || []),
                            { id: `rule_${Date.now()}`, forms: unassigned ? [unassigned] : [], sendTo: '', cc: '', bcc: '' },
                          ],
                        }));
                      };

                      return (
                        <div className="flex flex-col gap-4">
                          {/* Section Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-base">🔀</span>
                                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 m-0">PER-FORM SEND TO EMAIL ROUTING</h5>
                                <span className="text-[10px] font-extrabold bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">+ CC &amp; BCC Supported</span>
                              </div>
                              <p className="text-xs text-slate-500 m-0 leading-relaxed">
                                Group multiple forms into dedicated routing rules. Each rule assigns a primary <strong>Send To</strong> email address, optional <strong>CC (Carbon Copy)</strong>, and optional <strong>BCC (Blind Carbon Copy)</strong> recipients.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={addRule}
                              className="flex items-center gap-1.5 bg-primary hover:bg-[#00382B] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border-none cursor-pointer shadow-md transition-all whitespace-nowrap shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Routing Rule
                            </button>
                          </div>

                          {/* Routing Rule Cards */}
                          <div className="flex flex-col gap-3">
                            {rules.length === 0 && (
                              <div className="text-center py-8 text-ink-lt text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                                No routing rules configured. Click <strong>Add Routing Rule</strong> to get started.
                              </div>
                            )}

                            {rules.map((rule, rIdx) => {
                              // Available forms for THIS rule's selector = unassigned globally + already in this rule
                              const availableForThisRule = allFormKeys.filter(
                                k => rule.forms.includes(k) || !allAssignedForms.includes(k)
                              );

                              return (
                                <div
                                  key={rule.id}
                                  className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all overflow-hidden"
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-primary to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                                  <div className="p-4 flex flex-col gap-4">

                                    {/* ── TOP: Multi-Form Chip Selector + Delete Card ── */}
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">SEND TO EMAIL ADDRESS</span>
                                          <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-px rounded-full font-bold">
                                            {rule.forms.length} Selected
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeRule(rule.id)}
                                          className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center border border-red-200 hover:border-red-600 cursor-pointer transition-all shrink-0"
                                          title="Delete this routing rule"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Selected form chips */}
                                      <div className="flex flex-wrap gap-1.5">
                                        {rule.forms.map(fKey => {
                                          const fm = FORM_META[fKey] || { title: fKey, icon: '📝' };
                                          const isFormDisabled = formsData[fKey]?.enabled === false;
                                          return (
                                            <span
                                              key={fKey}
                                              className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs ${isFormDisabled
                                                ? 'bg-slate-100/90 border-slate-300 text-ink-lt'
                                                : 'bg-white border-slate-200 text-slate-700'
                                                }`}
                                            >
                                              <span>{fm.icon}</span>
                                              <span>{fm.title}</span>
                                              {isFormDisabled && (
                                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-px rounded-md">
                                                  Disabled
                                                </span>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => updateRule(rule.id, { forms: rule.forms.filter(f => f !== fKey) })}
                                                className="ml-0.5 w-3.5 h-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none p-0"
                                                title={`Remove ${fm.title}`}
                                              >
                                                <X className="w-2 h-2" />
                                              </button>
                                            </span>
                                          );
                                        })}

                                        {/* Add form dropdown — only unassigned forms + empty option */}
                                        {availableForThisRule.filter(k => !rule.forms.includes(k)).length > 0 && (
                                          <select
                                            value=""
                                            onChange={(e) => {
                                              const newForm = e.target.value;
                                              if (newForm && !rule.forms.includes(newForm)) {
                                                // Prevent adding disabled forms
                                                if (formsData[newForm]?.enabled !== false) {
                                                  updateRule(rule.id, { forms: [...rule.forms, newForm] });
                                                }
                                              }
                                            }}
                                            className="h-7 px-2 py-0.5 bg-white border border-dashed border-slate-300 hover:border-primary rounded-lg text-[10px] font-bold text-slate-500 hover:text-primary outline-none cursor-pointer transition-colors"
                                          >
                                            <option value="">✚ Add Form...</option>
                                            {availableForThisRule
                                              .filter(k => !rule.forms.includes(k))
                                              .map(k => {
                                                const km = FORM_META[k] || { title: k, icon: '' };
                                                const isFormDisabled = formsData[k]?.enabled === false;
                                                return (
                                                  <option
                                                    key={k}
                                                    value={k}
                                                    disabled={isFormDisabled}
                                                    className={isFormDisabled ? 'text-ink-lt bg-slate-50 font-normal italic' : 'text-slate-800 font-bold'}
                                                  >
                                                    {km.icon} {km.title} {isFormDisabled ? '— (Disabled)' : ''}
                                                  </option>
                                                );
                                              })}
                                          </select>
                                        )}
                                      </div>
                                    </div>

                                    {/* ── BOTTOM: Send To + CC + BCC single inputs ── */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                                      {/* SEND TO */}
                                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Send To Email</span>
                                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-px rounded-full font-bold border border-emerald-200">Admin Recipient</span>
                                        </div>
                                        <input
                                          type="email"
                                          placeholder="e.g. booking@kingtravelcan.com"
                                          value={rule.sendTo}
                                          onChange={(e) => updateRule(rule.id, { sendTo: e.target.value })}
                                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono font-semibold text-slate-800 shadow-2xs placeholder:text-ink-lt"
                                        />
                                        <p className="text-[10px] text-emerald-700/70 m-0">Destination email address for selected forms</p>
                                      </div>

                                      {/* CC */}
                                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-violet-50/60 border border-violet-200/60">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">CC Emails</span>
                                          <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-px rounded-full font-bold border border-violet-200">Carbon Copy</span>
                                        </div>
                                        <input
                                          type="email"
                                          placeholder="cc@domain.com"
                                          value={rule.cc}
                                          onChange={(e) => updateRule(rule.id, { cc: e.target.value })}
                                          className="w-full px-3 py-2 bg-white border border-violet-200 rounded-xl text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 font-mono font-semibold text-slate-800 shadow-2xs placeholder:text-ink-lt"
                                        />
                                        <p className="text-[10px] text-violet-700/70 m-0">Optional — leave blank for no CC</p>
                                      </div>

                                      {/* BCC */}
                                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-sky-50/60 border border-sky-200/60">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">BCC Emails</span>
                                          <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-px rounded-full font-bold border border-sky-200">Blind Carbon Copy</span>
                                        </div>
                                        <input
                                          type="email"
                                          placeholder="bcc@domain.com"
                                          value={rule.bcc || ''}
                                          onChange={(e) => updateRule(rule.id, { bcc: e.target.value })}
                                          className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10 font-mono font-semibold text-slate-800 shadow-2xs placeholder:text-ink-lt"
                                        />
                                        <p className="text-[10px] text-sky-700/70 m-0">Optional — leave blank for no BCC</p>
                                      </div>

                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── 2. GENERAL EMAIL NOTIFICATION SETTINGS ── */}
                    <div className="mt-2 pt-6 border-t border-slate-200/70 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email Subject Line */}
                      <div className="flex flex-col gap-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 hover:border-slate-300 transition-colors md:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" /> EMAIL SUBJECT LINE
                          </label>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Smart Tags Enabled</span>
                        </div>
                        <p className="text-[11px] text-slate-500 m-0">Use [subject] or [name] as dynamic smart tags in subject.</p>
                        <input
                          type="text"
                          value={emailConfigs.emailSubjectLine}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, emailSubjectLine: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold text-slate-800 shadow-2xs mt-1"
                        />
                      </div>

                      {/* From Name */}
                      <div className="flex flex-col gap-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 hover:border-slate-300 transition-colors">
                        <label className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">FROM NAME</label>
                        <p className="text-[11px] text-slate-500 m-0">Display sender name shown to email recipients.</p>
                        <input
                          type="text"
                          value={emailConfigs.fromName}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, fromName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold text-slate-800 shadow-2xs mt-1"
                        />
                      </div>

                      {/* From Email */}
                      <div className="flex flex-col gap-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 hover:border-slate-300 transition-colors">
                        <label className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">FROM EMAIL</label>
                        <p className="text-[11px] text-slate-500 m-0">Must match authenticated sender address.</p>
                        <input
                          type="email"
                          value={emailConfigs.fromEmail}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, fromEmail: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono font-bold text-slate-800 shadow-2xs mt-1"
                        />
                      </div>

                      {/* Reply-To Email */}
                      <div className="flex flex-col gap-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 hover:border-slate-300 transition-colors md:col-span-2">
                        <label className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">REPLY-TO EMAIL ADDRESS</label>
                        <p className="text-[11px] text-slate-500 m-0">When admin clicks Reply in their inbox, email goes here. Leave blank to use submitter&apos;s email address.</p>
                        <input
                          type="email"
                          value={emailConfigs.replyTo}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, replyTo: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono font-bold text-slate-800 shadow-2xs mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SMTP Environment Connection (.env Configured) Card ── */}
                  <div className="p-6 lg:p-7 rounded-3xl bg-gradient-to-r from-[#071814] via-[#0E2C24] to-primary text-white border border-[#DB9E30]/30 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gold/20 border border-[#DB9E30]/40 flex items-center justify-center text-xl shadow-xs">
                            ⚡
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-white uppercase tracking-wider m-0 flex items-center gap-2">
                              SMTP MAIL SERVER CONNECTION (.env CONFIGURED)
                            </h4>
                            <p className="text-xs text-emerald-100/70 mt-0.5 mb-0">Real-time email dispatch engine powered securely via server environment variables.</p>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> ● Active via .env File
                        </span>
                      </div>

                      {/* Active .env Configuration Parameters Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                        <div className="p-3.5 rounded-2xl bg-[#051410]/70 border border-emerald-500/20 backdrop-blur-md">
                          <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest block mb-1">
                            SMTP SERVER HOST
                          </span>
                          <span className="text-xs font-mono font-bold text-white block truncate">
                            smtp.kingtravelcan.com
                          </span>
                          <span className="text-[10px] text-ink-lt mt-0.5 block">Configured in process.env.SMTP_HOST</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#051410]/70 border border-emerald-500/20 backdrop-blur-md">
                          <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest block mb-1">
                            PORT &amp; ENCRYPTION
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-300 block">
                            Port 587 (STARTTLS)
                          </span>
                          <span className="text-[10px] text-ink-lt mt-0.5 block">Configured in process.env.SMTP_PORT</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#051410]/70 border border-emerald-500/20 backdrop-blur-md">
                          <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest block mb-1">
                            AUTHENTICATED ACCOUNT
                          </span>
                          <span className="text-xs font-mono font-bold text-white block truncate">
                            no-reply@kingtravelcan.com
                          </span>
                          <span className="text-[10px] text-ink-lt mt-0.5 block">Configured in process.env.SMTP_USER</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#051410]/70 border border-emerald-500/20 backdrop-blur-md">
                          <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest block mb-1">
                            SECURITY MODE
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-300 block">
                            🔒 Environment Protected
                          </span>
                          <span className="text-[10px] text-ink-lt mt-0.5 block">Password secured in .env</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Message Box */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider m-0">SUCCESS MESSAGE</h4>
                        <p className="text-xs text-slate-500 mt-0.5 mb-0">Shown to the user immediately after a successful form submission.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel className="font-bold text-xs text-slate-700 uppercase">SUCCESS HEADING</FieldLabel>
                        <input
                          type="text"
                          value={emailConfigs.successHeading}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, successHeading: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-semibold"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="font-bold text-xs text-slate-700 uppercase">SUCCESS DESCRIPTION</FieldLabel>
                        <input
                          type="text"
                          value={emailConfigs.successDescription}
                          onChange={(e) => setEmailConfigs({ ...emailConfigs, successDescription: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary font-semibold"
                        />
                      </Field>
                    </div>

                    {/* Bottom Action Save Bar for Email Configs */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                      <div>
                        {formsSaveMsg && <span className="text-xs font-bold text-primary">{formsSaveMsg}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveFormsSettings}
                        disabled={savingForms}
                        className="bg-primary hover:bg-[#00382B] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
                      >
                        <Save className="w-4 h-4 text-emerald-300" />
                        {savingForms ? 'Saving Email Configs...' : 'Save Email Configs'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. EMAIL TEMPLATE SUB-TAB (Matching Screenshot 2: Form Subjects Switcher, HTML Editor & Real-Time Preview) ── */}
              {formsSubTab === 'emailTemplate' && (
                <div className="flex flex-col gap-6">
                  {/* Top Bar: Title + Form Subject Selector + Reset Button */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                        ✉️ EMAIL TEMPLATE CONFIGURATION
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-0">
                        Select and preview responsive HTML notification templates for each of King Travel&apos;s 7 dynamic form subjects.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const sampleData = FORM_SAMPLE_DATA[selectedTemplateSubject];
                          const html = getResponsiveEmailTemplateHtml(selectedTemplateSubject, sampleData);
                          setEmailTemplateHtml(html);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🔄</span> Reset to Default
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveFormsSettings}
                        disabled={savingForms}
                        className="bg-primary hover:bg-[#00382B] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-300" />
                        {savingForms ? 'Saving...' : 'Save Template'}
                      </button>
                    </div>
                  </div>

                  {/* ── 7 Canonical Form Subject Switcher Pills ── */}
                  <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex flex-col gap-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      SELECT FORM SUBJECT TEMPLATE
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                      {CANONICAL_FORM_SUBJECTS.map((subject) => {
                        const isSelected = selectedTemplateSubject === subject;
                        const iconMap: Record<CanonicalFormSubject, string> = {
                          'Get a Free Quote Form': '🏠',
                          'Umrah Package Booking Form': '📊',
                          'Hajj Package Booking Form': '🕋',
                          'Contact Inquiry Form': '💬',
                          'Flights Booking Inquiry Form': '✈️',
                          'Drop Us A Message Form': '📬',
                          'Blog Detail Page': '📝',
                        };

                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => {
                              setSelectedTemplateSubject(subject);
                              const sampleData = FORM_SAMPLE_DATA[subject];
                              const html = getResponsiveEmailTemplateHtml(subject, sampleData);
                              setEmailTemplateHtml(html);
                            }}
                            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected
                              ? 'bg-emerald-900 text-white border-primary shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                          >
                            <span className="text-base">{iconMap[subject]}</span>
                            <span className="text-xs font-extrabold leading-tight">
                              {subject}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Code Editor & Real-Time Preview Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* HTML Editor Panel */}
                    <div className="bg-[#0B132B] rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col gap-3 text-white">
                      <div className="flex items-center justify-between text-xs font-bold text-ink-lt border-b border-slate-800 pb-3">
                        <span className="flex items-center gap-2">
                          <span>&lt;/&gt; HTML EDITOR</span>
                          <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                            {selectedTemplateSubject}
                          </span>
                        </span>
                        <span className="text-[10px] text-emerald-400">Live Code Mode</span>
                      </div>
                      <textarea
                        rows={18}
                        value={emailTemplateHtml}
                        onChange={(e) => setEmailTemplateHtml(e.target.value)}
                        className="w-full bg-transparent font-sans text-xs !text-white outline-none resize-y leading-relaxed border-none focus:ring-0"
                      />
                    </div>

                    {/* Real-Time Preview Panel */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          REAL-TIME EMAIL TEMPLATE PREVIEW
                        </span>
                        <span className="text-[11px] font-extrabold text-primary">
                          Subject: {selectedTemplateSubject}
                        </span>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 min-h-[420px] overflow-auto">
                        <iframe
                          srcDoc={emailTemplateHtml}
                          title="Email Template Preview"
                          className="w-full h-[400px] border-none rounded-xl bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 4. INBOX SUB-TAB (Matching Screenshot 3) ── */}
              {formsSubTab === 'inbox' && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-2xs flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                        📩 Inbox
                        <button onClick={fetchInbox} className={`bg-transparent border-none cursor-pointer text-ink-lt hover:text-slate-600 transition-colors ${isLoadingInbox ? 'animate-spin' : ''}`}>
                          🔄
                        </button>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 mb-0 font-medium">Real-time incoming lead submissions across all active forms.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedInboxItems.length > 0 && (
                        <button
                          onClick={handleDeleteSelectedInbox}
                          disabled={isDeletingInboxItems}
                          className="text-xs font-extrabold text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg cursor-pointer bg-transparent border-none flex items-center gap-1 transition-colors"
                        >
                          {isDeletingInboxItems ? 'DELETING...' : `DELETE (${selectedInboxItems.length})`}
                        </button>
                      )}
                      <button
                        onClick={handleMarkAllRead}
                        disabled={isMarkingRead}
                        type="button"
                        className="text-xs font-extrabold text-primary hover:underline cursor-pointer bg-transparent border-none"
                      >
                        {isMarkingRead ? 'MARKING...' : 'MARK ALL READ'}
                      </button>
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => setInboxFilter('all')}
                          type="button"
                          className={`px-3 py-1 rounded-lg border-none cursor-pointer transition-colors ${inboxFilter === 'all' ? 'bg-primary text-white' : 'text-slate-600 bg-transparent'}`}
                        >
                          ALL
                        </button>
                        <button
                          onClick={() => setInboxFilter('unread')}
                          type="button"
                          className={`px-3 py-1 rounded-lg border-none cursor-pointer transition-colors ${inboxFilter === 'unread' ? 'bg-primary text-white' : 'text-slate-600 bg-transparent'}`}
                        >
                          UNREAD
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100 max-h-[820px] overflow-y-auto pr-2 scroll-smooth [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                    {filteredInboxEnquiries.length > 0 ? (
                      filteredInboxEnquiries.map((item: any, idx: number) => {
                        const dateStr = new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <div key={idx} onClick={() => setActiveInboxMsg(item)} className={`py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors gap-4 cursor-pointer ${item.status === 'new' ? 'bg-slate-50/30' : ''}`}>
                            <div className="flex items-start gap-4">
                              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 cursor-pointer accent-primary"
                                  checked={selectedInboxItems.includes(item.id)}
                                  onChange={() => handleToggleInboxItem(item.id)}
                                />
                              </div>
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <h5 className="m-0 text-sm font-bold text-slate-900">{item.email}</h5>
                                  {item.status === 'new' && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await updateEnquiryStatus(item.id, 'contacted');
                                        await fetchInbox();
                                      }}
                                      className="w-2 h-2 rounded-full bg-emerald-500 cursor-pointer border-none p-0 outline-none hover:scale-125 transition-transform"
                                      title="Mark as read"
                                    />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 m-0 max-w-xl truncate">{item.message || `Inquiry for ${item.preferredPackageType || 'service'}`}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                                  {item.type ? item.type.replace('_', ' ').toUpperCase() : 'CONTACT'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-ink-lt font-medium md:text-right">{dateStr}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-ink-lt font-medium">{isLoadingInbox ? 'Loading inbox...' : 'No incoming submissions found.'}</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 5. EMAIL LOGS SUB-TAB (Matching Screenshot 5) ── */}
              {formsSubTab === 'emailLogs' && (
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-2xs flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                        EMAIL DELIVERY LOGS
                        <button onClick={fetchEmailLogs} className={`bg-transparent border-none cursor-pointer text-ink-lt hover:text-slate-600 transition-colors ${isLoadingLogs ? 'animate-spin' : ''}`}>
                          🔄
                        </button>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 mb-0 font-medium">Real-time tracking of form notification emails sent to administrators.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-ink-lt font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">DATE &amp; TIME</th>
                          <th className="py-3 px-4">FORM ID</th>
                          <th className="py-3 px-4">STATUS</th>
                          <th className="py-3 px-4">SENT TO</th>
                          <th className="py-3 px-4">DETAILS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {emailLogs.length > 0 ? (
                          emailLogs.map((log: any, idx: number) => {
                            const dateStr = new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">{dateStr}</td>
                                <td className="py-3 px-4 font-mono font-bold text-emerald-800">{log.formId}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    • {log.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-700">{log.sentTo}</td>
                                <td className="py-3 px-4 text-slate-500 max-w-[250px] truncate" title={log.details || ''}>{log.details}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-ink-lt font-medium">{isLoadingLogs ? 'Loading logs...' : 'No email delivery logs found.'}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= OTHER TABS PLACEHOLDER ================= */}
          {activeTab !== 'header-footer' && activeTab !== 'seo' && activeTab !== 'identity' && activeTab !== 'share' && activeTab !== 'users' && activeTab !== 'auth' && activeTab !== 'popup' && activeTab !== 'css' && activeTab !== 'forms' && (
            <div className="p-6 text-center text-slate-500">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {TABS.find((t) => t.id === activeTab)?.label} Configuration
              </h3>
              <p className="text-xs">Advanced settings for {activeTab} can be managed here.</p>
            </div>
          )}

        </div>
      </div>

      {/* Navigation Item Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" /> Edit Navigation Item
              </h3>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page / Menu Title</label>
                <input
                  type="text"
                  value={editingItem.label || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="e.g. About Us, Licenses, Hajj Packages"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page URL / Slug Path</label>
                <input
                  type="text"
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="e.g. /about, /certified-travel-agency-in-canada"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-primary font-mono"
                />
              </div>

              {pagesList && pagesList.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Or Select Existing Website Page</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = pagesList.find(p => p.slug === e.target.value);
                      if (selected) {
                        setEditingItem({ ...editingItem, label: selected.title, url: selected.slug });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none cursor-pointer bg-slate-50"
                  >
                    <option value="">-- Choose Page --</option>
                    {pagesList.map(p => (
                      <option key={p.id} value={p.slug}>{p.title} ({p.slug})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveNavItem(editingItem)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#00382B] text-white text-xs font-extrabold border-none cursor-pointer shadow-md"
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* 3D Glassmorphism Centric Notification Modal */}
      <GlassNotificationModal
        isOpen={notificationConfig.isOpen}
        type={notificationConfig.type}
        title={notificationConfig.title}
        message={notificationConfig.message}
        onClose={() => setNotificationConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Drawer for Inbox Message */}
      {activeInboxMsg && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setActiveInboxMsg(null)} />
          <div className="relative w-full max-w-2xl bg-slate-50 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">

            {/* Drawer Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h3 className="font-bold text-slate-900 m-0 text-base">Message Details</h3>
              <button onClick={() => setActiveInboxMsg(null)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200 cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body - Email Template Design */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-xl mx-auto flex flex-col font-sans">

                {/* Email Header */}
                <div className="bg-primary px-8 py-10 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-[#E7BE6E] border border-[#E7BE6E] rounded-full px-4 py-1.5 uppercase tracking-widest mb-6">
                    INQUIRY RECEIVED
                  </span>
                  <div className="mb-2">
                    <img
                      src="/images_KTC/logos/2026-08/logo.png"
                      alt="King Travel Canada"
                      className="h-8 md:h-10 w-auto object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[#a5d6c8] text-sm m-0 font-medium tracking-wide">
                    Licensed Hajj &amp; Umrah Travel Operator
                  </p>
                </div>

                {/* Email Content */}
                <div className="p-8 pb-10">
                  <h2 className="text-slate-900 font-bold text-xl m-0 mb-4">
                    {activeInboxMsg.type === 'quote_request' ? 'New Quote Request Received' : 'New Inquiry Received'}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed m-0 mb-8">
                    A new inquiry has been received via the website form. The submission details and lead contact information are listed below:
                  </p>

                  {/* Date Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-8 text-sm">
                    <span className="text-lg">📅</span>
                    <span className="text-slate-600 font-medium">Date: <strong className="text-slate-900 ml-1">{new Date(activeInboxMsg.createdAt || new Date()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                  </div>

                  {/* Details Section */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📋</span>
                    <h3 className="font-bold text-primary text-sm uppercase tracking-wider m-0">
                      SUBMITTED FORM DETAILS
                    </h3>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Ticket Reference #</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600 font-mono text-xs">{activeInboxMsg.enquiryNumber || `TKT-${Math.floor(Math.random() * 1000000)}`}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Full Name</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{activeInboxMsg.fullName || 'N/A'}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Email Address</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-[#0066cc] hover:underline cursor-pointer break-all">
                        <a href={`mailto:${activeInboxMsg.email}`}>{activeInboxMsg.email}</a>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Phone Number</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{activeInboxMsg.phone || 'N/A'}</div>
                    </div>
                    {activeInboxMsg.whatsapp && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">WhatsApp Number</div>
                        <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{activeInboxMsg.whatsapp}</div>
                      </div>
                    )}
                    {(activeInboxMsg.city || activeInboxMsg.province) && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Location</div>
                        <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{[activeInboxMsg.city, activeInboxMsg.province].filter(Boolean).join(', ')}</div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Selected Package / Service</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{activeInboxMsg.preferredPackageType || 'General Inquiry'}</div>
                    </div>
                    {activeInboxMsg.departureMonth && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Departure</div>
                        <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">{activeInboxMsg.departureMonth}</div>
                      </div>
                    )}
                    {(activeInboxMsg.adults > 0 || activeInboxMsg.children > 0) && (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Passengers</div>
                        <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600">Adults: {activeInboxMsg.adults || 0}, Children: {activeInboxMsg.children || 0}, Infants: {activeInboxMsg.infants || 0}</div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/3 bg-slate-50 px-5 py-4 font-bold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200">Message</div>
                      <div className="w-full sm:w-2/3 px-5 py-4 text-slate-600 whitespace-pre-wrap">{activeInboxMsg.message || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-[#111827] px-8 py-10 flex flex-col items-center text-center">
                  <h3 className="text-white font-bold m-0 mb-3 text-sm">King Travel Canada Ltd.</h3>
                  <p className="text-ink-lt text-[11px] leading-relaxed m-0 mb-6 max-w-sm">
                    1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada<br />
                    TICO &amp; IATA Licensed Pilgrimage &amp; Flight Operator
                  </p>
                  <a href="#" className="text-[#E7BE6E] text-xs font-bold hover:underline mb-8">
                    Visit Official Website →
                  </a>
                  <p className="text-slate-500 text-[10px] m-0">
                    © {new Date().getFullYear()} King Travel Canada Ltd. All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}