'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Field, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { getPageById, savePageAction } from '@/actions/pageActions';
import { getAllPackages } from '@/actions/packageActions';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Upload, Settings, MoveUp, MoveDown, ArrowUp, ArrowDown, GripVertical, ArrowLeft, ArrowRight } from 'lucide-react';
import AdminPackageDetailModal from '@/components/admin/AdminPackageDetailModal';
import { uploadFile, uploadFileToFtp, generateAutoAltText } from '@/lib/uploadClient';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import TiptapEditor from '@/components/admin/TiptapEditor';
import SeoSettingsForm, { SeoSettings } from '@/components/admin/SeoSettingsForm';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import { formatTravelMonth } from '@/lib/packageHelpers';

type SectionMeta = {
  type: string;
  description: string;
  pages: string[];
};

type SectionCategory = {
  category: string;
  icon: string;
  items: SectionMeta[];
};

const SECTION_CATALOG: SectionCategory[] = [
  {
    category: 'Homepage',
    icon: '🏠',
    items: [
      { type: 'Homepage Hero Banner', description: 'Full-width hero header with background image, title, subtext, badges, and quote calculator.', pages: ['Homepage'] },
      { type: 'Who We Are', description: 'Split layout with agency intro text, trust quote badge, and animated stat counters.', pages: ['Homepage'] },
      { type: 'Umrah Packages', description: 'Featured Umrah package cards with CTA button and price teaser.', pages: ['Homepage'] },
      { type: 'Travel Services', description: 'Interactive service icon grid (Umrah, Hajj, Visa, Flights, Hotels…).', pages: ['Homepage'] },
      { type: 'What We Provide', description: 'Numbered feature list alongside a full-height image — showcases key value props.', pages: ['Homepage'] },
      { type: 'Accreditations Bar', description: 'Logo bar of accreditation bodies (IATA, TICO, ACTA, Saudi Ministry).', pages: ['Homepage'] },
      { type: 'Hajj Packages', description: 'Database-driven Hajj package cards with full details and booking form.', pages: ['Homepage'] },
      { type: 'Sold Out Packages', description: 'Display previously sold out luxury packages.', pages: ['Homepage'] },
      { type: 'Visa Solutions', description: 'Visa type cards (Tourist, Business, Umrah, Hajj) with features and apply CTA.', pages: ['Homepage'] },
      { type: 'Testimonials', description: 'Google Reviews carousel with star rating, review count, and testimonial cards from happy pilgrims.', pages: ['Homepage'] },
      { type: 'Airlines', description: 'Infinite scrolling logo marquee of airline partner brands.', pages: ['Homepage'] },
      { type: 'Travel Organization', description: 'Infinite scrolling logo marquee of travel organizations.', pages: ['Homepage'] },
      { type: 'Contact', description: 'Animated Contact with dual notification (admin + user confirmation email).', pages: ['Homepage'] },
    ],
  },
  {
    category: 'About & Trust',
    icon: '🏛',
    items: [
      { type: 'Intro', description: 'Simple eyebrow + heading + body text intro block for any page.', pages: ['About', 'Any Page'] },
      { type: 'Stats Grid', description: 'Horizontal KPI stat counters (e.g. 72K+ Travelers, 25+ Years).', pages: ['About', 'Homepage'] },
      { type: 'Certifications Flip Cards', description: 'Flip-card grid showing certifications and credentials front & back.', pages: ['About'] },
    ],
  },
  {
    category: 'Packages (Umrah & Hajj)',
    icon: '🕋',
    items: [
      { type: 'Umrah Packages Grid', description: 'Database-driven Umrah package cards with price, hotel rating, and booking CTA.', pages: ['Umrah Packages', 'Homepage'] },
      { type: 'Hajj Services Grid', description: '4-column icon grid showcasing Hajj services (e.g. Pre-Hajj Meet-up, Buffet Meals, Transport, Scholar).', pages: ['Hajj Packages'] },
      { type: 'Banner 4 Grids', description: 'Banner with 4 overlapping accreditation/feature cards.', pages: ['Hajj Packages', 'Umrah Packages'] },
      { type: 'Package Brochure', description: 'Display 1 or more promotional package brochure flyers/images with responsive grid and centered single view.', pages: ['Hajj Packages', 'Umrah Packages', 'Any Page'] },
      { type: 'Packages Content (Rich Text)', description: 'Rich text editor with HTML support to describe Umrah & Hajj packages.', pages: ['Hajj Packages', 'Umrah Packages'] },
    ],
  },
  {
    category: 'Visa & Saudi',
    icon: '🪪',
    items: [
      { type: 'Visa Process Steps', description: '3-step visual process block (Apply → Review → Confirmed) for visa applicants.', pages: ['Saudi Visa'] },
    ],
  },
  {
    category: 'Airlines & Flights',
    icon: '✈️',
    items: [
      { type: 'Available Flights Grid', description: 'Live flight route cards with fare, airline, and availability status.', pages: ['Airlines'] },
      { type: 'Flight Assistance CTA', description: 'Full-width CTA encouraging visitors to contact the flight desk.', pages: ['Airlines'] },
    ],
  },
  {
    category: 'Dynamic Forms',
    icon: '📝',
    items: [
      { type: 'Quote Form', description: 'Dynamic CMS controlled get a free quote form.', pages: ['Any Page'] },
      { type: 'Package Inquiry Form', description: 'Dynamic CMS controlled package inquiry form.', pages: ['Any Page'] },
      { type: 'Package Detail Form', description: 'Dynamic CMS controlled package detail booking form.', pages: ['Any Page'] },
      { type: 'Visa Consultation Form', description: 'Dynamic CMS controlled visa consultation form.', pages: ['Any Page'] },
      { type: 'Flight Booking Form', description: 'Dynamic CMS controlled flight quote form.', pages: ['Airlines', 'Any Page'] },
      { type: 'Contact Us Form', description: 'Dynamic CMS controlled contact us form.', pages: ['Any Page'] },
      { type: 'Drop Us A Message Form', description: 'Dynamic CMS controlled drop us a message form.', pages: ['Any Page'] },
    ]
  },
  {
    category: 'Contact',
    icon: '📞',
    items: [
      { type: 'Contact Info Cards', description: 'Office address cards with phone, email, and map links for each location.', pages: ['Contact'] },
      { type: 'Contact Maps', description: 'Embedded dual Google Maps iframes for head office and branch locations.', pages: ['Contact'] },
    ],
  },
  {
    category: 'Blog & News',
    icon: '📝',
    items: [
      { type: 'Latest Blogs Grid', description: 'Grid of published blog posts with thumbnails, titles, excerpts, dates, and author badges.', pages: ['Blogs', 'Homepage', 'Any Page'] },
    ],
  },
  {
    category: 'Reviews & Testimonials',
    icon: '⭐',
    items: [
      { type: 'Testimonials', description: 'Google Reviews carousel with star rating, review count, and testimonial cards from happy pilgrims.', pages: ['Homepage', 'Hajj Packages', 'Umrah Packages', 'Any Page'] },
    ],
  },
  {
    category: 'Content & Layout',
    icon: '📄',
    items: [
      { type: 'Services Grid', description: 'Icon + heading + description service tiles in a responsive grid.', pages: ['About', 'Any Page'] },
      { type: 'Image+Text', description: 'Split image-and-text block with eyebrow, heading, body, and optional CTA.', pages: ['Any Page'] },
      { type: 'Text Block (Rich Text)', description: 'Free-form rich text editor block for long-form content.', pages: ['Any Page'] },
    ],
  },
];

// Flat list for search compatibility
const SECTION_OPTIONS = SECTION_CATALOG.flatMap((cat) => cat.items.map((i) => i.type));

interface SectionItem {
  id: string;
  type: string;
  title: string;
  data?: Record<string, any>;
}

function PageBuilderContent() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const [bannerBgImage, setBannerBgImage] = useState<string>('');
  const [bannerPosition, setBannerPosition] = useState<string>('center center');
  const [bannerSize, setBannerSize] = useState<string>('cover');
  const [bannerTitle, setBannerTitle] = useState<string>('');
  const [bannerDescription, setBannerDescription] = useState<string>('');

  // Homepage Hero Banner Specific Fields
  const [heroEyebrow, setHeroEyebrow] = useState('Est. in Canada · Licensed Pilgrimage Operator');
  const [primaryBtnLabel, setPrimaryBtnLabel] = useState('View Umrah Packages →');
  const [primaryBtnLink, setPrimaryBtnLink] = useState('/umrah-packages');
  const [secondaryBtnLabel, setSecondaryBtnLabel] = useState('Speak With an Advisor');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('/contact');
  const [badge1Top, setBadge1Top] = useState('10k+');
  const [badge1Sub, setBadge1Sub] = useState('Pilgrims Guided');
  const [badge2Top, setBadge2Top] = useState('5★ Hotels');
  const [badge2Sub, setBadge2Sub] = useState('Every Package, Every Time');

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'sections' | 'richtext' | 'seo'>('sections');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [showInMenu, setShowInMenu] = useState(true);
  const [parentPage, setParentPage] = useState('');
  const [richText, setRichText] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({});
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [draggedPackageIdx, setDraggedPackageIdx] = useState<number | null>(null);
  const [draggedBrochure, setDraggedBrochure] = useState<{ secId: string; index: number } | null>(null);

  useEffect(() => {
    getAllPackages().then(setAllPackages).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeDetailPopupModal, setActiveDetailPopupModal] = useState<{ secId: string; pIdx: number; pkg: any } | null>(null);

  const updateSectionField = (id: string, field: string, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const getFlightsOrDefault = (items: any) => {
    if (items && Array.isArray(items) && items.length > 0) return items;
    return [
      { code: "PIA", name: "Pakistan International Airlines", operatedBy: "Operated By PIA", originCode: "LHR", originCity: "London", destCode: "JED", destCity: "Jeddah", time: "14:20", price: "CAD 1,250.00" },
      { code: "PIA", name: "Pakistan International Airlines", operatedBy: "Operated By PIA", originCode: "LHR", originCity: "London", destCode: "JED", destCity: "Jeddah", time: "14:20", price: "CAD 1,250.00" },
      { code: "PIA", name: "Pakistan International Airlines", operatedBy: "Operated By PIA", originCode: "LHR", originCity: "London", destCode: "JED", destCity: "Jeddah", time: "14:20", price: "CAD 1,250.00" }
    ];
  };

  const updateSectionData = (id: string, key: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        data: {
          ...(s.data || {}),
          [key]: value,
        }
      };
    }));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSections(updated);
  };

  useEffect(() => {
    if (pageId) {
      getPageById(pageId).then((p) => {
        if (p) {
          setTitle(p.title);
          setSlug(p.slug);
          setStatus(p.status as any);
          setShowInMenu(p.showInMenu);
          setParentPage(p.parentPage || '');
          setRichText(p.richText || '');
          setMetaTitle(p.metaTitle || p.title);
          setMetaDescription(p.metaDescription || '');
          setBannerBgImage(p.bannerBgImage || '');
          setBannerPosition(p.bannerPosition || 'center center');
          setBannerSize(p.bannerSize || 'cover');
          setBannerTitle(p.bannerTitle || p.title);
          setBannerDescription(p.bannerDescription || '');

          if (p.seoSettings) {
            try {
              const parsed = typeof p.seoSettings === 'string' ? JSON.parse(p.seoSettings) : p.seoSettings;
              setSeoSettings(parsed);
            } catch (e) { }
          }

          if (p.sections) {
            try {
              const parsed = JSON.parse(p.sections);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSections(parsed);
                const heroSec = parsed.find((s: any) => s.type === 'Homepage Hero Banner' || s.type === 'Hero Slider');
                if (heroSec && heroSec.data) {
                  if (heroSec.data.heroEyebrow !== undefined) setHeroEyebrow(heroSec.data.heroEyebrow);
                  if (heroSec.data.primaryBtnLabel !== undefined) setPrimaryBtnLabel(heroSec.data.primaryBtnLabel);
                  if (heroSec.data.primaryBtnLink !== undefined) setPrimaryBtnLink(heroSec.data.primaryBtnLink);
                  if (heroSec.data.secondaryBtnLabel !== undefined) setSecondaryBtnLabel(heroSec.data.secondaryBtnLabel);
                  if (heroSec.data.secondaryBtnLink !== undefined) setSecondaryBtnLink(heroSec.data.secondaryBtnLink);
                  if (heroSec.data.badge1Top !== undefined) setBadge1Top(heroSec.data.badge1Top);
                  if (heroSec.data.badge1Sub !== undefined) setBadge1Sub(heroSec.data.badge1Sub);
                  if (heroSec.data.badge2Top !== undefined) setBadge2Top(heroSec.data.badge2Top);
                  if (heroSec.data.badge2Sub !== undefined) setBadge2Sub(heroSec.data.badge2Sub);
                }
              } else if (p.slug === '/saudi-visa' || pageId === 5) {
                setSections([
                  {
                    id: 'sv-1',
                    type: 'Visa Solutions',
                    title: 'Saudi Visa Solutions',
                    data: {
                      eyebrow: 'EXPLORE OUR',
                      title: 'Saudi Visa Solutions'
                    }
                  },
                  {
                    id: 'sv-2',
                    type: 'Visa Process Steps',
                    title: 'Saudi Visa Process Steps',
                    data: {
                      eyebrow: 'IN 3 EASY STEPS',
                      title: 'Get Your Saudi Visa',
                      email: 'saudivisa@kingtravel.com',
                      phone: '+1 905-624-8344'
                    }
                  }
                ]);
              } else if (p.slug === '/airlines' || pageId === 6) {
                setSections([
                  {
                    id: 'air-1',
                    type: 'Available Flights Grid',
                    title: 'Available Flights Grid',
                    data: {
                      eyebrow: 'AVAILABLE FLIGHTS',
                      title: 'BEST FARES, LIMITED AVAILABILITY FROM LONDON'
                    }
                  },
                  {
                    id: 'air-2',
                    type: 'Airlines',
                    title: 'Airlines We Sourced Deals From',
                    data: {
                      eyebrow: 'OUR TRUSTED PARTNERS',
                      title: 'Airlines We Sourced Deals From'
                    }
                  },
                  {
                    id: 'air-3',
                    type: 'Flight Assistance CTA',
                    title: 'Flight Booking Assistance CTA',
                    data: {
                      eyebrow: 'NEED ASSISTANCE',
                      title: 'Need Flight Booking Assistance?',
                      description: 'Speak directly with our ticketing specialists to get custom quotes, group flight discounts, and immediate confirmations.',
                      btnLabel: 'Contact Flight Desk',
                      btnLink: '/contact'
                    }
                  }
                ]);
              } else if (p.slug === '/contact' || pageId === 7) {
                setSections([
                  {
                    id: 'cnt-1',
                    type: 'Contact Info Cards',
                    title: 'Contact Info & Office Locations',
                    data: {
                      headAddress: '1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada',
                      branchAddress: '22 Ontario St S, Milton, ON L9T 2M6, Canada',
                      phone1: '+1 800-844-5464',
                      phone2: '+1 905-624-8555',
                      phone3: '+1 905-624-8344',
                      email: 'saudivisa@kingtravelcan.com'
                    }
                  },
                  {
                    id: 'cnt-2',
                    type: 'Contact',
                    title: 'Interactive Contact',
                    data: {
                      title: 'Drop Us A Message',
                      subtitle: "Fill out the form below and we'll get back to you shortly."
                    }
                  },
                  {
                    id: 'cnt-3',
                    type: 'Contact Maps',
                    title: 'Dual Office Google Maps',
                    data: {
                      headMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.1637775952674!2d-79.62528662340336!3d43.63487945347209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3897316b3bdb%3A0xc6758691a49d5a8e!2sKing%20Travel%20Can%20Ltd%20-%20Mississauga!5e0!3m2!1sen!2sca!4v1710000000000!5m2!1sen!2sca',
                      branchMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2893.6521568283307!2d-79.87981462340915!3d43.5177187791263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b6fa0d880eae9%3A0xc57548acb421436c!2s22%20Ontario%20St%20S%2C%20Milton%2C%20ON%20L9T%202M6%2C%20Canada!5e0!3m2!1sen!2sca!4v1710000000001!5m2!1sen!2sca'
                    }
                  }
                ]);
              } else if (p.slug === '/about' || pageId === 2) {
                setSections([
                  { id: '1', type: 'Stats Grid', title: 'Stats Grid' },
                  {
                    id: '2',
                    type: 'Intro',
                    title: 'Intro (About King Travel)',
                    data: {
                      eyebrow: 'ABOUT',
                      title: 'King Travel',
                      description: "For over 20 years, King Travel has been a trusted travel agency in Canada, offering Hajj and Umrah services, airline ticketing, and visa processing with unmatched expertise. We are Canada's No. 1 authorized PIA seller agency and an official agent licensed by the Ministry of Hajj & Umrah, IATA, TICO, OCTA, and ASTA."
                    }
                  },
                  {
                    id: '3',
                    type: 'Image+Text',
                    title: 'Why Choose Us',
                    data: {
                      eyebrow: 'WHY CHOOSE US',
                      title: 'Your Trusted Partner for Pilgrimage & Global Travel',
                      description: "Serving Ontario travelers for years, King Travel Can Ltd is certified by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah. We've arranged thousands of successful journeys with fast response times and secure ID checks for every booking.",
                      image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"
                    }
                  },
                  {
                    id: '4',
                    type: 'Services Grid',
                    title: 'Our Premium Travel Services',
                    data: {
                      eyebrow: 'WHAT WE PROVIDE',
                      title: 'Our Premium Travel Services'
                    }
                  },
                  {
                    id: '5',
                    type: 'Airlines',
                    title: 'Our Trusted Partners (Airlines)',
                    data: {
                      eyebrow: 'OUR TRUSTED PARTNERS',
                      title: 'Airlines we work with'
                    }
                  },
                ]);
              }
            } catch (e) {
              setSections([]);
            }
          } else if (p.slug === '/about' || pageId === 2) {
            setSections([
              { id: '1', type: 'Stats Grid', title: 'Stats Grid' },
              {
                id: '2',
                type: 'Intro',
                title: 'Intro (About King Travel)',
                data: {
                  eyebrow: 'ABOUT',
                  title: 'King Travel',
                  description: "For over 20 years, King Travel has been a trusted travel agency in Canada, offering Hajj and Umrah services, airline ticketing, and visa processing with unmatched expertise."
                }
              },
              {
                id: '3',
                type: 'Image+Text',
                title: 'Why Choose Us',
                data: {
                  eyebrow: 'WHY CHOOSE US',
                  title: 'Your Trusted Partner for Pilgrimage & Global Travel',
                  description: "Serving Ontario travelers for years, King Travel Can Ltd is certified by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah.",
                  image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"
                }
              },
              {
                id: '4',
                type: 'Services Grid',
                title: 'Our Premium Travel Services',
                data: {
                  eyebrow: 'WHAT WE PROVIDE',
                  title: 'Our Premium Travel Services'
                }
              },
              {
                id: '5',
                type: 'Airlines',
                title: 'Our Trusted Partners (Airlines)',
                data: {
                  eyebrow: 'OUR TRUSTED PARTNERS',
                  title: 'Airlines we work with'
                }
              },
            ]);
          }
        }
      });
    } else {
      setTitle('New Custom Page');
      setSlug('/new-page');
    }
  }, [pageId]);

  const addSection = (type: string) => {
    let defaultData: Record<string, any> = {
      eyebrow: type.toUpperCase(),
      title: `Heading for ${type}`,
      description: 'Add section content description here...',
    };

    if (type === 'Umrah Packages') {
      defaultData = {
        eyebrow: 'EXCLUSIVE UPCOMING',
        title: 'Umrah Packages from Canada',
        subtext: 'Departures from CAD 2,595 per person. Availability and accommodations are confirmed with every booking — contact us before reserving.',
        btnText: 'SEE ALL PACKAGES →',
        btnLink: '/umrah-packages',
      };
    } else if (type === 'Sold Out Packages') {
      defaultData = {
        eyebrow: 'Luxury Hajj Packages',
        title: 'Packages Officially<br />Sold Out',
        description: 'Departures from CAD 2,595 per person. Availability and accommodations are confirmed with every booking – contact us before reserving.',
        items: [
          {
            title: 'Hajj Package',
            month: 'May · 2026',
            price: '$18,995',
            heroImage: 'https://images.unsplash.com/photo-1553755088-ef1973c7b4a1?auto=format&fit=crop&w=700&q=80',
            includes: [
              { text: 'Return Flights from Toronto', icon: 'PlaneTakeoff', iconColor: 'text-ink-soft' },
              { text: 'Luxury Ground Transportation', icon: 'Bus', iconColor: 'text-ink-soft' },
              { text: 'Free Ihram Kit', icon: 'Shirt', iconColor: 'text-ink-soft' },
              { text: 'Registration & Visa Assistance', icon: 'FileText', iconColor: 'text-ink-soft' },
              { text: 'Imam Lead Guide & Seminar', icon: 'BookOpen', iconColor: 'text-ink-soft' },
              { text: '5 Star Hotels Makkah & Madinah', icon: 'Building2', iconColor: 'text-ink-soft' },
            ]
          }
        ]
      };
    } else if (type === 'Travel Services') {
      defaultData = {
        eyebrow: 'Travel Services',
        title: 'Select your preferred travel service',
        items: [
          { icon: 'Star', title: 'Umrah Packages', description: 'Flexible departures with flights, stays, & guidance included.', link: '/umrah-packages' },
          { icon: 'Briefcase', title: 'Hajj Packages', description: 'Fully accredited pilgrimage packages, curated end to end.', link: '/hajj-packages' },
          { icon: 'ArrowLeftRight', title: 'Airline Tickets', description: 'Best-fare flights sourced from every route into Jeddah.', link: '/airlines' },
          { icon: 'CreditCard', title: 'Saudi Visa Services', description: 'Full visa processing, handled and confirmed before departure.', link: '/saudi-visa' },
          { icon: 'Home', title: 'Hotel Booking', description: '5-star stays within walking distance of the Haram.', link: '/contact' },
          { icon: 'Globe', title: 'Global Flight Reservations', description: 'Worldwide reliable flight bookings for any itinerary.', link: '/airlines' },
          { icon: 'FileText', title: 'Travel Documentation', description: 'Guidance on every document your journey requires.', link: '/contact' },
          { icon: 'User', title: 'Group & Private Tours', description: 'Private, guided, and fully customizable itineraries.', link: '/contact' },
        ],
      };
    } else if (type === 'What We Provide') {
      defaultData = {
        eyebrow: 'WHAT WE PROVIDE',
        title: 'Lowest fares, exclusive travel deals, real trust',
        image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80',
        items: [
          { num: '01', title: 'Lowest Fares', description: 'We offer the lowest rates on the market, sourced across every route into Jeddah.' },
          { num: '02', title: 'Special Deals', description: 'Fixed-price Umrah packages with hotels, meals and transport included.' },
          { num: '03', title: 'Trusted & Certified', description: 'A fully accredited travel agency you can rely on, licensed across Canada.' },
          { num: '04', title: 'Pilgrimage Services', description: 'Visa processing, group support — the full spiritual journey, arranged.' },
        ],
      };
    } else if (type === 'Latest Blogs Grid' || type === 'Blog Posts Carousel') {
      defaultData = {
        eyebrow: 'LATEST NEWS & GUIDES',
        title: 'Articles, Tips & Spiritual Insights',
        limit: 6,
        showExcerpt: true,
        showDate: true,
      };
    } else if (type === 'Testimonials') {
      defaultData = {
        eyebrow: 'HAPPY PILGRIMS',
        title: 'What our clients say',
        reviewCount: '942',
        reviewLink: 'https://maps.app.goo.gl/1BRUoBxtt4wWw58t6',
        ctaLabel: 'Write A Review',
        apiKey: '',
        placeId: '',
        items: [
          { id: 1, name: "tamim rahimi", time: "3 months ago", avatar: "/img/tamim.png", text: "I’m a man of few words. It was an amazing experience with the Umrah package in March 2026. Everything went as expected, with no surprises. There will be a huge list if I name everyone, so a big thanks to everyone. JazakAllah khair!" },
          { id: 2, name: "Hiba M", time: "3 months ago", avatar: "/img/h.png", text: "My daughter and I just came back from a twelve day Umrah trip organized by King Travel. The trip was well planned and structured. We were very fortunate to have Imam Ismail Fetic as our guide who provided a wealth of knowledge and insights. The accomodation and the food were really nice. I highly recommend booking with King Travel." },
          { id: 3, name: "Yusra Khan", time: "3 months ago", avatar: "/img/y.png", text: "It was a very nice experience going with King travel, imam Ismail Fetic was extremely helpful answering all of our questions and giving us lectures/stories about all the places we were going to. Would highly recommend this agency for Umrah." },
          { id: 4, name: "Zeba H", time: "3 months ago", avatar: "/img/z.png", text: "We recently traveled with King Travels. Allhamdolilah it was amazing. No complains. They kept all the promises that were made to us. The 3 meals that were provided to us everyday were amazing. Our Imam Ismail Fetic and Br Irfan were amazing. Always available if help needed. Over all great group of people. Inshallah will travel with them again." },
          { id: 5, name: "Musaibah Doola", time: "3 months ago", avatar: "/img/m.png", text: "I recently booked my Umrah with King Travels. It was an amazing experience. Starting with the price of the package it was very reasonable. They gave the best accommodations and food at both locations. Best was meeting with very good knowledgeable Imams and guided. Everything went well." }
        ]
      };
    } else if (type === 'Hajj Services Grid') {
      defaultData = {
        eyebrow: 'WHAT IS INCLUDED',
        title: 'Hajj 2027 Services',
        subtitle: 'From Departure to Return, We Take Care of Every Detail of Your Hajj.',
        items: [
          { icon: 'Users', title: 'Pre-Hajj Meet up', description: 'Get to know each other and held a meeting with all Hajjis' },
          { icon: 'Handshake', title: 'Meet & Assist', description: 'A dedicated team to assist and guide' },
          { icon: 'Utensils', title: 'Buffet Meals', description: 'Segregated full board buffet food' },
          { icon: 'IdCard', title: 'Visa Acquisition', description: 'We facilitate with visa documentation and services' },
          { icon: 'Bus', title: 'Luxury Transportation', description: 'We offer luxury busses and private vehicle' },
          { icon: 'Building2', title: '5 Star Accommodation', description: 'Get a comfort living 5 star hotel facility' },
          { icon: 'BedDouble', title: 'Sofa Mattress in Mina', description: 'Premium quality sofas and mattress' },
          { icon: 'BookOpen', title: 'Guide & Scholar', description: '3 to 4 training sessions with renowned scholars' },
        ],
      };
    } else if (type === 'Banner 4 Grids') {
      defaultData = {
        items: [
          { icon: 'Shield', title: 'ATOL PROTECTED' },
          { icon: 'Building', title: 'SAUDI MINISTRY APPROVED' },
          { icon: 'Plane', title: 'IATA ACCREDITED' },
          { icon: 'Award', title: 'ABTA BONDED' },
        ],
      };
    } else if (type === 'Package Brochure') {
      defaultData = {
        eyebrow: 'Hajj Packages',
        title: 'EXPLORE OUR LUXURY HAJJ DEALS',
        description: '',
        images: [],
      };
    } else if (type === 'Text Block (Rich Text)' || type === 'Packages Content (Rich Text)') {
      defaultData = {
        content: '<p>Start writing your content here...</p>',
      };
    } else if (type === 'Stats Grid') {
      defaultData = {
        items: [
          { value: '25+', label: 'Years Serving Canada' },
          { value: '10k+', label: 'Pilgrims Guided' },
          { value: '5★', label: 'Hotels, Every Package' },
        ]
      };
    } else if (type === 'Intro') {
      defaultData = {
        eyebrow: 'ABOUT',
        title: 'King Travel',
        description: "For over 20 years, King Travel has been a trusted travel agency in Canada..."
      };
    } else if (type === 'Image+Text') {
      defaultData = {
        eyebrow: 'WHY CHOOSE US',
        title: 'Your Trusted Partner for Pilgrimage & Global Travel',
        description: "Serving Ontario travelers for years...",
        subheading: '',
        features: ['Lowest Fares', 'Special Deals', 'Trusted & Certified'],
        image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"
      };
    } else if (type === 'Services Grid') {
      defaultData = {
        eyebrow: 'WHAT WE PROVIDE',
        title: 'Our Premium Travel Services',
        items: [
          { icon: 'Star', title: 'Umrah Packages', subtitle: 'Flexible departures', description: 'With flights, stays, & guidance included.' },
        ]
      };
    } else if (type === 'Accreditations Bar') {
      defaultData = {
        items: [
          { title: 'IATA', icon: '/img/iata.png', iconType: 'image' },
          { title: 'TICO', icon: '/img/tico.png', iconType: 'image' }
        ]
      };
    } else if (type === 'Umrah Packages Grid') {
      defaultData = {
        items: []
      };
    } else if (type === 'Travel Organization') {
      defaultData = {
        eyebrow: 'LICENSED & ACCREDITED',
        title: 'Trusted Travel Organizations',
        speedMs: 30000,
        direction: 'left',
        logos: [
          { src: '/img/air/saudia.png', alt: 'Organization' },
        ]
      };
    } else if (type === 'Airlines') {
      defaultData = {
        eyebrow: 'OUR TRUSTED PARTNERS',
        title: 'Airlines We Sourced Deals From',
        speedMs: 30000,
        direction: 'left',
        logos: [
          { src: '/img/air/saudia.png', alt: 'Saudia' },
        ]
      };
    } else if (type === 'Available Flights Grid') {
      defaultData = {
        eyebrow: 'AVAILABLE FLIGHTS',
        title: 'BEST FARES, LIMITED AVAILABILITY',
        items: []
      };
    } else if (type === 'Flight Assistance CTA') {
      defaultData = {
        title: 'Need Flight Booking Assistance?',
        description: 'Speak directly with our ticketing specialists...',
        btnLabel: 'Contact Flight Desk',
        btnLink: '/contact'
      };
    } else if (type === 'Contact Info Cards') {
      defaultData = {
        card1Title: 'Head Office', headAddress: '', branchAddress: '',
        card2Title: 'Phones', phone1: '', phone2: '', phone3: '',
        card3Title: 'Email & Socials', email: '', facebookUrl: '', instagramUrl: '', linkedinUrl: '', tiktokUrl: ''
      };
    } else if (type === 'Contact') {
      defaultData = {
        title: 'Drop Us A Message',
        subtitle: "Fill out the form below and we'll get back to you shortly.",
        enabled: true,
        successMessage: 'Thank you! Your message has been received.'
      };
    } else if (type === 'Contact Maps') {
      defaultData = {
        headTitle: 'Head Office Map', headAddress: '', headMapUrl: '',
        branchTitle: 'Branch Office Map', branchAddress: '', branchMapUrl: ''
      };
    } else if (type === 'Hajj Packages') {
      defaultData = {
        eyebrow: 'Luxury Hajj Packages',
        title: 'Hajj Packages 2027',
        description: 'Luxury Hajj 2027 Packages with 5-Star Hotels...',
        items: []
      };
    } else if (type === 'Visa Solutions') {
      defaultData = {
        eyebrow: 'EXPLORE OUR',
        title: 'Saudi Visa Solutions',
        items: [
          { title: "Tourist Visa", description: "Only passport required. Explore the beauty and culture of Saudi Arabia effortlessly.", image: "/img/saudi-visa-1.webp" },
          { title: "Umrah Visa", description: "Requires passport and PR Card or other proof of residence. Start your spiritual journey with official Umrah visa services.", image: "/img/saudi-visa-2.webp" },
          { title: "Family Visit Visa", description: "Complete list of requirements sent via email. Reunite with your loved ones quickly and securely.", image: "/img/saudi-visa-3.jpg" },
          { title: "Resident Iqama Visa", description: "Get all the requirements sent to your inbox. Simplify your residency process with expert guidance.", image: "/img/saudi-visa-4.webp" },
          { title: "Business Visit Visa", description: "We'll email the full details you need. Expand your business horizons with an authorized visa service.", image: "/img/saudi-visa-5.webp" },
          { title: "Work Visa", description: "Contact us for detailed requirements via email. Begin your career in Saudi Arabia with professional assistance.", image: "/img/saudi-visa-6.jpg" },
          { title: "Personal Visit Visa", description: "Get in touch with us today to get the detailed requirements and fast-track your Saudi personal visit visa with our professional guidance.", image: "/img/riyadh.jpg" },
        ]
      };
    } else if (type === 'Certifications Flip Cards') {
      defaultData = {
        eyebrow: 'WHY THEY MATTER',
        title: 'OUR CERTIFICATIONS',
        items: [
          { logo: '/img/tico.svg', title: 'TICO', description: 'TICO regulates travel agencies in Ontario, protecting consumer prepaid funds and ensuring compliance with strict Canadian travel industry regulations.' },
          { logo: '/img/iata.svg', title: 'IATA', description: 'Being an IATA accredited agency allows us to work directly with airlines, offering competitive airfares, seamless ticketing, and exclusive deals.' },
          { logo: '/img/acta.svg', title: 'ACTA', description: 'ACTA membership advocates for ethical travel practices and professional excellence across the Canadian travel industry.' },
          { logo: '/img/asta.svg', title: 'ASTA', description: 'ASTA certification connects us with global travel standards and verified international destination management networks.' },
          { logo: '/img/atac.svg', title: 'ATAC', description: 'ATAC represents air transport excellence and safe aviation ticketing protocols across Canada.' },
          { logo: '', title: 'Saudi Ministry of Foreign Affairs', description: 'Official Saudi Ministry authorization for processing Umrah, Hajj, business, and tourist visas directly from Canada.' }
        ]
      };
    }
    const newSec: SectionItem = {
      id: String(Date.now()),
      type,
      title: `${type}`,
      data: defaultData,
    };
    setSections([...sections, newSec]);
    setEditingSectionId(newSec.id);
    setDropdownOpen(false);
  };

  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [seoModalOpen, setSeoModalOpen] = useState(false);

  const removeSection = (id: string, title?: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-3 h-3 text-red-600" />,
      title: '',
      message: `Are you sure you want to remove the section "${title || 'Untitled Section'}" from this page layout?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setSections(sections.filter(s => s.id !== id));
      },
    });
  };

  const handleSave = async (draft = false) => {
    setConfirmConfig({
      icon: '💾',
      title: draft ? 'Save Draft' : 'Update Page',
      message: draft ? 'Would you like to save this page as a draft?' : 'Would you like to publish and apply these changes to the live website?',
      confirmText: draft ? 'Save Draft' : 'Update Page',
      cancelText: 'Not now',
      variant: 'primary',
      onConfirm: async () => {
        setSaving(true);
        const updatedSections = [...sections];
        if (slug === '/' || pageId === 1) {
          const heroSecData = {
            heroEyebrow,
            title: bannerTitle || title || 'Your journey to <span>Makkah & Madinah</span>, guided with care.',
            description: bannerDescription || "King Travel plans Hajj and Umrah journeys from Canada down to the smallest detail...",
            primaryBtnLabel,
            primaryBtnLink,
            secondaryBtnLabel,
            secondaryBtnLink,
            badge1Top,
            badge1Sub,
            badge2Top,
            badge2Sub,
            bannerBgImage,
            bannerPosition,
            bannerSize,
          };
          const heroIdx = updatedSections.findIndex(s => s.type === 'Homepage Hero Banner' || s.type === 'Hero Slider');
          if (heroIdx >= 0) {
            updatedSections[heroIdx].data = heroSecData;
          } else {
            updatedSections.unshift({
              id: 'home-hero-1',
              type: 'Homepage Hero Banner',
              title: 'Homepage Hero Banner (1920px x 640px)',
              data: heroSecData,
            });
          }
        }

        const fd = new FormData();
        if (pageId) fd.append('id', String(pageId));
        fd.append('title', title);
        fd.append('slug', slug);
        fd.append('status', draft ? 'draft' : status);
        fd.append('showInMenu', String(showInMenu));
        fd.append('parentPage', parentPage);
        fd.append('sections', JSON.stringify(updatedSections));
        fd.append('richText', richText);
        fd.append('metaTitle', metaTitle);
        fd.append('metaDescription', metaDescription);
        fd.append('seoSettings', JSON.stringify(seoSettings));
        fd.append('bannerBgImage', bannerBgImage);
        fd.append('bannerPosition', bannerPosition);
        fd.append('bannerSize', bannerSize);
        fd.append('bannerTitle', bannerTitle || title);
        fd.append('bannerDescription', bannerDescription);

        const res = await savePageAction(fd);
        setSaving(false);
        if (res.success) {
          setMessage('✅ Page Saved Successfully!');
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage(`❌ Save Failed: ${res.error}`);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 font-sans text-slate-800">

      {/* ── Top Bar Breadcrumb & Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 lg:px-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/90 text-slate-700 hover:border-primary hover:bg-primary hover:text-white text-xs font-bold transition-all shadow-2xs no-underline"
          >
            ← Back to Pages
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-black text-slate-900 m-0 tracking-tight">{title || 'Page Editor'}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {message && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {message}
            </span>
          )}

          <button
            type="button"
            onClick={() => setSeoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-primary border border-emerald-300 text-xs font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Page SEO</span>
          </button>

          <Link
            href={slug || '/'}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all shadow-2xs no-underline"
          >
            👁 View Page
          </Link>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            📄 Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary hover:bg-[#00382B] text-white text-xs font-black transition-all cursor-pointer shadow-md border-none disabled:opacity-50"
          >
            {saving ? 'Saving...' : '✓ Update'}
          </button>
        </div>
      </div>

      {/* Page Banner Management & Real-Time Preview */}
      {slug === '/' || pageId === 1 ? (
        /* HOMEPAGE HERO BANNER EDITOR (1920px x 640px, MIN-HEIGHT 640px) */
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase m-0 flex items-center gap-1.5">
                👑 HOMEPAGE HERO BANNER BACKGROUND IMAGE & CONTENT (1920PX X 640PX)
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Recommended 1920px x 640px (min-height: 640px)</span>
            </div>
            {bannerBgImage && (
              <button
                type="button"
                onClick={() => setBannerBgImage('')}
                className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              >
                ⊗ Remove Image
              </button>
            )}
          </div>

          {/* Split Desktop Grid: Image Upload & Dropzone (Left) + Live 640px Hero Preview Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 5-Col Upload & Main Banner Settings */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div
                onClick={() => document.getElementById('hero-banner-file-input')?.click()}
                className="bg-slate-50/80 hover:bg-emerald-50/40 border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px]"
              >
                <input
                  type="file"
                  id="hero-banner-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadFile(file, 'banners');
                      if (url) setBannerBgImage(url);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary mb-2 text-xl">
                  ⇧
                </div>
                <span className="text-xs font-extrabold text-slate-800">
                  {bannerBgImage ? 'Click to replace hero background image' : 'Click to upload homepage hero image'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  Recommended 1920px x 640px (aspect ratio ~ 3:1, min-height 640px)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    POSITION
                  </label>
                  <select
                    value={bannerPosition}
                    onChange={(e) => setBannerPosition(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="center center">Center Center</option>
                    <option value="top center">Top Center</option>
                    <option value="bottom center">Bottom Center</option>
                    <option value="left center">Left Center</option>
                    <option value="right center">Right Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    SIZE
                  </label>
                  <select
                    value={bannerSize}
                    onChange={(e) => setBannerSize(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="cover">Cover (Default)</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto / Original</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right 7-Col Real-Time Live 640px Hero Preview Box (Matching Frontend Layout 100%) */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-xl border border-slate-900/20 p-6 md:p-8 flex flex-col justify-between text-white min-h-[320px]">
              <div
                className="absolute inset-0 z-0 transition-all duration-300"
                ref={(el) => {
                  if (el) {
                    const bgUrl = (bannerBgImage || '/img/hero.png').replace(/"/g, "'");
                    el.style.backgroundImage = `linear-gradient(100deg, rgba(10, 20, 18, .92) 0%, rgba(10, 20, 18, .72) 38%, rgba(10, 20, 18, .15) 68%), url("${bgUrl}")`;
                    el.style.backgroundPosition = bannerPosition || 'center center';
                    el.style.backgroundSize = bannerSize || 'cover';
                    el.style.backgroundRepeat = 'no-repeat';
                  }
                }}
              />

              {/* Floating Top Right Badge 1 Card (Matching Frontend) */}
              <div className="absolute right-5 top-5 z-10 bg-white/95 text-slate-900 rounded-2xl p-2.5 px-3.5 shadow-lg border border-white flex items-center gap-2.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-gold/20 border border-[#DB9E30]/40 flex items-center justify-center text-gold text-xs">
                  ★
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-none">{badge1Top}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{badge1Sub}</div>
                </div>
              </div>

              {/* Floating Bottom Right Badge 2 Card (Matching Frontend) */}
              <div className="absolute right-5 bottom-5 z-10 bg-white/95 text-slate-900 rounded-2xl p-2.5 px-3.5 shadow-lg border border-white flex items-center gap-2.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-gold/20 border border-[#DB9E30]/40 flex items-center justify-center text-gold text-xs">
                  🕌
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-none">{badge2Top}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{badge2Sub}</div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="relative z-10 max-w-md space-y-3 my-auto">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-gold">
                  {heroEyebrow || 'Est. in Canada · Licensed Pilgrimage Operator'}
                </div>
                <h1
                  className="text-xl md:text-3xl font-serif text-white m-0 font-normal tracking-tight leading-tight [&>span]:text-gold [&>em]:text-gold [&>em]:not-italic"
                  dangerouslySetInnerHTML={{ __html: bannerTitle || title || 'Your journey to <span>Makkah & Madinah</span>, guided with care.' }}
                />
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  {bannerDescription || "King Travel plans Hajj and Umrah journeys from Canada down to the smallest detail — flights, five-star stays walking distance from the Haram, visas, and guides..."}
                </p>

                {/* Primary & Secondary Buttons Matching Frontend */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="bg-gold hover:bg-[#c68e27] text-primary font-black text-xs px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer">
                    {primaryBtnLabel || 'View Umrah Packages'}
                  </span>
                  <span className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer border border-white">
                    {secondaryBtnLabel || 'Speak With an Advisor'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Grid for Banner Content Editing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                EYEBROW TAGLINE
              </label>
              <input
                type="text"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                placeholder="e.g. Est. in Canada · Licensed Pilgrimage Operator"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  TITLE (H1)
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const inputEl = document.getElementById('hero-banner-title-input') as HTMLInputElement;
                    const fullText = bannerTitle || 'Your journey to <span>Makkah & Madinah</span>, guided with care.';
                    if (inputEl && inputEl.selectionStart !== null && inputEl.selectionEnd !== null && inputEl.selectionStart !== inputEl.selectionEnd) {
                      const start = inputEl.selectionStart;
                      const end = inputEl.selectionEnd;
                      const selectedText = fullText.substring(start, end);
                      const newText = fullText.substring(0, start) + `<span>${selectedText}</span>` + fullText.substring(end);
                      setBannerTitle(newText);
                    } else {
                      if (!fullText.includes('<span>')) {
                        setBannerTitle(fullText.replace(/([A-Z][a-z0-9\s&]+)$/i, '<span>$1</span>'));
                      } else {
                        setBannerTitle(fullText.replace(/<\/?span>/g, ''));
                      }
                    }
                  }}
                  className="text-[10px] font-bold text-gold hover:bg-amber-100 bg-amber-50 px-2 py-0.5 rounded cursor-pointer border border-[#DB9E30]/30 transition-colors"
                  title="Highlight text and click to make it Gold"
                >
                  ✨ Gold Words
                </button>
              </div>
              <input
                id="hero-banner-title-input"
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Headline Title..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                SUBTEXT / DESCRIPTION
              </label>
              <input
                type="text"
                value={bannerDescription}
                onChange={(e) => setBannerDescription(e.target.value)}
                placeholder="Description paragraph..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                PRIMARY CTA BUTTON LABEL
              </label>
              <input
                type="text"
                value={primaryBtnLabel}
                onChange={(e) => setPrimaryBtnLabel(e.target.value)}
                placeholder="View Umrah Packages →"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                PRIMARY CTA LINK
              </label>
              <input
                type="text"
                value={primaryBtnLink}
                onChange={(e) => setPrimaryBtnLink(e.target.value)}
                placeholder="#packages or /umrah-packages"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                SECONDARY CTA BUTTON LABEL
              </label>
              <input
                type="text"
                value={secondaryBtnLabel}
                onChange={(e) => setSecondaryBtnLabel(e.target.value)}
                placeholder="Speak With an Advisor"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                SECONDARY CTA LINK
              </label>
              <input
                type="text"
                value={secondaryBtnLink}
                onChange={(e) => setSecondaryBtnLink(e.target.value)}
                placeholder="/contact"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 1 TOP TEXT
              </label>
              <input
                type="text"
                value={badge1Top}
                onChange={(e) => setBadge1Top(e.target.value)}
                placeholder="10k+"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 1 SUBTEXT
              </label>
              <input
                type="text"
                value={badge1Sub}
                onChange={(e) => setBadge1Sub(e.target.value)}
                placeholder="Pilgrims Guided"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 2 TOP TEXT
              </label>
              <input
                type="text"
                value={badge2Top}
                onChange={(e) => setBadge2Top(e.target.value)}
                placeholder="5★ Hotels"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 2 SUBTEXT
              </label>
              <input
                type="text"
                value={badge2Sub}
                onChange={(e) => setBadge2Sub(e.target.value)}
                placeholder="Every Package, Every Time"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD INNER PAGE BANNER EDITOR */
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase m-0 flex items-center gap-1.5">
                🖼 GLOBAL PAGE BANNER BACKGROUND IMAGE
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">This banner background image applies to hero header preview</span>
            </div>
            {bannerBgImage && (
              <button
                type="button"
                onClick={() => setBannerBgImage('')}
                className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              >
                ⊗ Remove Image
              </button>
            )}
          </div>

          {/* Split 2-Column Desktop Grid: Upload Box (Left) + Live Preview Card (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left Upload Dropzone Box */}
            <div
              onClick={() => document.getElementById('banner-file-input')?.click()}
              className="bg-slate-50/80 hover:bg-primary-50/40 border-2 border-dashed border-primary/50 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px]"
            >
              <input
                type="file"
                id="banner-file-input"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadFileToFtp(file, 'banners');
                    if (url) setBannerBgImage(url);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-primary/20 flex items-center justify-center text-primary mb-2 text-lg">
                ⇧
              </div>
              <span className="text-xs font-extrabold text-slate-800">
                {bannerBgImage ? 'Click to replace banner image' : 'Click to upload global banner image'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                Recommended 1920px x 360px (aspect ratio ~ 16:3, max 2MB)
              </span>
            </div>

            {/* Right Side Compact Real-Time Live Preview Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md flex flex-col items-center justify-center text-center p-4 text-white min-h-[140px] border border-slate-900/10">
              <div
                className="absolute inset-0 z-0 transition-all duration-300"
                ref={(el) => {
                  if (el) {
                    const bgUrl = bannerBgImage
                      ? bannerBgImage.replace(/"/g, "'")
                      : "https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg";
                    el.style.backgroundImage = `linear-gradient(rgba(10, 66, 45, 0.45), rgba(10, 66, 45, 0.45)), url("${bgUrl}")`;
                    el.style.backgroundPosition = bannerPosition || 'center center';
                    el.style.backgroundSize = bannerSize || 'cover';
                    el.style.backgroundRepeat = 'no-repeat';
                  }
                }}
              />
              <div className="relative z-10 max-w-md px-2">
                <h1
                  className="text-lg md:text-xl font-serif text-white m-0 font-normal tracking-wide [&>span]:text-gold [&>em]:text-gold [&>em]:not-italic"

                  dangerouslySetInnerHTML={{ __html: bannerTitle || title || 'Page Title' }}
                />
                {bannerDescription && (
                  <p
                    className="text-[11px] opacity-90 max-w-sm m-0 mt-1 font-light leading-snug text-white/90"

                  >
                    {bannerDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compact Input Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                POSITION
              </label>
              <select
                value={bannerPosition}
                onChange={(e) => setBannerPosition(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="center center">Center Center</option>
                <option value="top center">Top Center</option>
                <option value="bottom center">Bottom Center</option>
                <option value="left center">Left Center</option>
                <option value="right center">Right Center</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                SIZE
              </label>
              <select
                value={bannerSize}
                onChange={(e) => setBannerSize(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="cover">Cover (Default)</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto / Original</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  TITLE (H1)
                </label>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const inputEl = document.getElementById('banner-title-input') as HTMLInputElement;
                    const fullText = bannerTitle || title;
                    if (inputEl && inputEl.selectionStart !== null && inputEl.selectionEnd !== null && inputEl.selectionStart !== inputEl.selectionEnd) {
                      const start = inputEl.selectionStart;
                      const end = inputEl.selectionEnd;
                      const selectedText = fullText.substring(start, end);
                      const newText = fullText.substring(0, start) + `<span>${selectedText}</span>` + fullText.substring(end);
                      setBannerTitle(newText);
                    } else {
                      if (!fullText.includes('<span>')) {
                        setBannerTitle(fullText.replace(/([A-Z][a-z0-9\s&]+)$/i, '<span>$1</span>'));
                      } else {
                        setBannerTitle(fullText.replace(/<\/?span>/g, ''));
                      }
                    }
                  }}
                  className="text-[10px] font-bold text-gold hover:bg-amber-100 bg-amber-50 px-2 py-0.5 rounded cursor-pointer border border-[#DB9E30]/30 transition-colors"
                  title="Highlight text and click to make it Gold"
                >
                  ✨ Gold Words
                </button>
              </div>
              <input
                id="banner-title-input"
                type="text"
                placeholder={title || 'Page Title'}
                value={bannerTitle || ''}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                SUBTEXT / DESCRIPTION
              </label>
              <input
                type="text"
                placeholder="Description..."
                value={bannerDescription || ''}
                onChange={(e) => setBannerDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main 2-Column Workspace ── */}
      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">

        {/* Left Column: Title & Section Builder */}
        <div className="flex flex-col gap-5">

          {/* Title & Slug Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="mb-4">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                TITLE *
              </label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  // Auto-generate slug from title unless it's home '/'
                  if (slug !== '/') {
                    const generatedSlug = '/' + newTitle
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setSlug(generatedSlug);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                SLUG *
              </label>
              <input
                type="text"
                value={slug || ''}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Dynamic Builder Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs">

            {/* Tab Bar Header */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-4">
              {[
                { key: 'sections', label: '🧱 Page Sections (Dynamic)' },
                { key: 'richtext', label: '📝 Rich Text' },
                { key: 'seo', label: '🔍 SEO Center' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-4 py-3.5 text-xs border-x-0 border-t-0 border-b-3 font-sans transition-colors cursor-pointer ${activeTab === t.key ? 'border-b-primary text-primary font-extrabold' : 'border-b-transparent text-slate-500 font-semibold hover:text-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content Panel */}
            <div className="p-6">
              {activeTab === 'sections' && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-base font-extrabold m-0 text-slate-900">Page Sections</h3>
                      <p className="text-xs text-slate-400 mt-1 m-0">Build page layout with reorderable sections</p>
                    </div>

                    {/* Add Section Dropdown Button — Grouped by Page with Hover Preview */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(!dropdownOpen);
                          setSectionSearch('');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-[#00382B] text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm border-none"
                      >
                        <span>+ Add Section</span>
                        <span className="text-[10px]">{dropdownOpen ? '▲' : '▼'}</span>
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">

                          {/* Search */}
                          <div className="p-2 pb-2 border-b border-slate-100">
                            <input
                              type="text"
                              autoFocus
                              placeholder="🔍 Search sections..."
                              value={sectionSearch}
                              onChange={(e) => setSectionSearch(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-primary"
                            />
                          </div>

                          {/* Grouped / Filtered List */}
                          <div className="overflow-y-auto max-h-[420px] p-1.5 space-y-1">
                            {sectionSearch.trim() !== '' ? (
                              /* Flat Search Results */
                              (() => {
                                const results = SECTION_CATALOG.flatMap(cat =>
                                  cat.items
                                    .filter(item => item.type.toLowerCase().includes(sectionSearch.toLowerCase()))
                                    .map(item => ({ ...item, catIcon: cat.icon }))
                                );
                                return results.length === 0 ? (
                                  <div className="px-3 py-4 text-xs text-slate-400 font-medium text-center">
                                    No sections match &quot;{sectionSearch}&quot;
                                  </div>
                                ) : results.map(item => (
                                  <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => { addSection(item.type); setDropdownOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors border-none cursor-pointer flex items-center justify-between group"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{item.catIcon}</span>
                                      <span className="truncate max-w-[200px]">{item.type}</span>
                                    </span>
                                    <span className="text-primary opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity shrink-0">+ Add</span>
                                  </button>
                                ));
                              })()
                            ) : (
                              /* Grouped by Category */
                              SECTION_CATALOG.map(cat => (
                                <div key={cat.category}>
                                  <div className="flex items-center bg-ink/5 p-2 rounded-md gap-1.5 px-2 py-1 mt-1">
                                    <span className="text-sm">{cat.icon}</span>
                                    <span className="text-[12px] font-extrabold uppercase tracking-widest text-ink">{cat.category}</span>
                                  </div>
                                  {cat.items.map(item => (
                                    <button
                                      key={item.type}
                                      type="button"
                                      onClick={() => { addSection(item.type); setDropdownOpen(false); }}
                                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors border-none cursor-pointer flex items-center justify-between group"
                                    >
                                      <span className="truncate max-w-[210px]">{item.type}</span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {item.pages.slice(0, 1).map(pg => (
                                          <span key={pg} className="hidden group-hover:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{pg}</span>
                                        ))}
                                        <span className="text-primary opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">+ Add</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section List */}
                  <div className="flex flex-col gap-3">
                    {sections.map((sec, index) => (
                      <div
                        key={sec.id}
                        className={`border rounded-lg px-2.5 py-1 cursor-pointer text-xs font-semibold transition-colors ${editingSectionId === sec.id ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                              <button
                                disabled={index === 0}
                                onClick={() => moveSection(index, -1)}
                                className="font-sans"
                              >
                                ▲
                              </button>
                              <button
                                disabled={index === sections.length - 1}
                                onClick={() => moveSection(index, 1)}
                                className="font-sans"
                              >
                                ▼
                              </button>
                            </div>
                            <span className="flex items-center justify-center font-extrabold text-primary">
                              {sec.type.substring(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{sec.type}</div>
                              <div className="text-[11px] text-white">{sec.title || sec.data?.title || `Section ${index + 1}`}</div>
                            </div>
                          </div>

                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => setEditingSectionId(editingSectionId === sec.id ? null : sec.id)}
                              className={`border rounded-lg px-2.5 py-1 cursor-pointer text-xs font-semibold transition-colors ${editingSectionId === sec.id ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                            >
                              {editingSectionId === sec.id ? 'Close Editor' : '✎ Edit Section'}
                            </button>
                            <button
                              onClick={() => removeSection(sec.id)}
                              className="border border-red-300 bg-red-100 text-red-600 rounded-lg px-2.5 py-1 cursor-pointer text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1.5"
                              title="Delete entire section"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Section Editor Panel */}
                        {editingSectionId === sec.id && (
                          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                            {/* Universal Section Header Block (Eyebrow, Heading, Description) - Hidden for Blog sections */}
                            {sec.type !== 'Latest Blogs Grid' && sec.type !== 'Blog Posts Carousel' && sec.type !== 'Testimonials' && sec.type !== 'Hajj Services Grid' && sec.type !== 'Text Block (Rich Text)' && sec.type !== 'Packages Content (Rich Text)' && (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
                                <span className="text-[11px] font-extrabold text-primary uppercase flex items-center gap-1.5">
                                  ✏️ SECTION HEADING & BADGE CONTENT
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">SECTION EYEBROW / BADGE TEXT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.eyebrow || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'eyebrow', e.target.value)}
                                      placeholder="e.g. Exclusive Upcoming / Who We Are"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">SECTION MAIN HEADING</label>
                                    <input
                                      type="text"
                                      value={sec.data?.title || sec.title || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                      placeholder="e.g. Umrah Packages from Canada"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">SECTION SUBTITLE / INTRO PARAGRAPH</label>
                                  <textarea
                                    rows={2}
                                    value={sec.data?.description || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'description', e.target.value)}
                                    placeholder="Section introduction or sub-header details..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-sans text-slate-900 bg-white"
                                  />
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Latest Blogs Grid' || sec.type === 'Blog Posts Carousel') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                  <span className="text-xs font-extrabold text-primary uppercase">
                                    BLOG DISPLAY SETTINGS
                                  </span>
                                  <Link
                                    href="/admin/blogs/edit"
                                    target="_blank"
                                    className="bg-primary text-white rounded-md px-3 py-1 text-xs font-bold no-underline hover:bg-[#00382B] transition-colors"
                                  >
                                    Create New Blog
                                  </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">IMAGE THUMBNAIL UPLOADER</label>
                                    <ImageUploadWidget
                                      value={sec.data?.image || sec.data?.thumbnail || ''}
                                      onChange={(url) => updateSectionData(sec.id, 'image', url)}
                                      subfolder="blogs"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">TITLE (H2)</label>
                                    <input
                                      type="text"
                                      value={sec.data?.title || sec.title || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                      placeholder="Section Main Heading (H2)..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">PUBLISHED DATE</label>
                                    <input
                                      type="text"
                                      value={sec.data?.publishedDate || sec.data?.date || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'publishedDate', e.target.value)}
                                      placeholder="e.g. August 4, 2026..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                </div>

                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Blog Manager & Detail Page Popups</div>
                                    <div className="text-[11px] text-white">Manage all articles, image thumbnails, titles, dates, and rich text editor popup for each blog card.</div>
                                  </div>
                                  <Link
                                    href="/admin/blogs"
                                    target="_blank"
                                    className="bg-primary text-white px-3.5 py-1.5 rounded-lg text-xs font-bold no-underline hover:bg-[#00382B] transition-colors"
                                  >
                                    Open Blog Manager ⚙️
                                  </Link>
                                </div>
                              </div>
                            )}

                            {sec.type === 'Testimonials' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <span className="text-[11px] font-extrabold text-primary uppercase">
                                  ⭐ Testimonials Settings
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">EYEBROW LABEL</label>
                                    <input
                                      type="text"
                                      value={sec.data?.eyebrow || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'eyebrow', e.target.value)}
                                      placeholder="e.g. HAPPY PILGRIMS"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">SECTION HEADING</label>
                                    <input
                                      type="text"
                                      value={sec.data?.title || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                      placeholder="e.g. What our clients say"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">GOOGLE REVIEW COUNT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.reviewCount || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'reviewCount', e.target.value)}
                                      placeholder="e.g. 942"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">CTA BUTTON LABEL</label>
                                    <input
                                      type="text"
                                      value={sec.data?.ctaLabel || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'ctaLabel', e.target.value)}
                                      placeholder="e.g. Write A Review"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">GOOGLE PLACES API KEY</label>
                                    <input
                                      type="password"
                                      value={sec.data?.apiKey || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'apiKey', e.target.value)}
                                      placeholder="API Key"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">GOOGLE PLACE ID</label>
                                    <input
                                      type="text"
                                      value={sec.data?.placeId || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'placeId', e.target.value)}
                                      placeholder="Place ID"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">GOOGLE REVIEWS LINK (For CTA Button)</label>
                                    <input
                                      type="text"
                                      value={sec.data?.reviewLink || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'reviewLink', e.target.value)}
                                      placeholder="e.g. https://maps.app.goo.gl/..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                                    />
                                  </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">Testimonial Cards</div>
                                    <div className="text-[11px] text-white">Review cards are managed in the TestimonialsCarousel component and display automatically.</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === 'Stats Grid' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5">
                                <span className="text-[11px] font-extrabold text-primary uppercase">📊 KPI Stat Items (Value & Label)</span>
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { value: '25+', label: 'Years Serving Canada' },
                                  { value: '10,000+', label: 'Pilgrims Guided' },
                                  { value: '5★', label: 'Hotels, Every Package' }
                                ]).map((stat: any, sIdx: number) => (
                                  <div key={sIdx} className="grid grid-cols-[1fr_2fr] gap-2">
                                    <input
                                      type="text"
                                      value={stat.value || ''}
                                      placeholder="Value (e.g. 25+)"
                                      onChange={(e) => {
                                        const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                          { value: '25+', label: 'Years Serving Canada' },
                                          { value: '10,000+', label: 'Pilgrims Guided' },
                                          { value: '5★', label: 'Hotels, Every Package' }
                                        ])];
                                        currentItems[sIdx] = { ...currentItems[sIdx], value: e.target.value };
                                        updateSectionData(sec.id, 'items', currentItems);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                    />
                                    <input
                                      type="text"
                                      value={stat.label || ''}
                                      placeholder="Label (e.g. Years Serving Canada)"
                                      onChange={(e) => {
                                        const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                          { value: '25+', label: 'Years Serving Canada' },
                                          { value: '10,000+', label: 'Pilgrims Guided' },
                                          { value: '5★', label: 'Hotels, Every Package' }
                                        ])];
                                        currentItems[sIdx] = { ...currentItems[sIdx], label: e.target.value };
                                        updateSectionData(sec.id, 'items', currentItems);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {sec.type === 'Banner 4 Grids' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5">
                                <span className="text-[11px] font-extrabold text-primary uppercase">🖼 Banner 4 Grids Items (Lucide Icon & Title)</span>
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { icon: 'Shield', title: 'ATOL PROTECTED' },
                                  { icon: 'Building', title: 'SAUDI MINISTRY APPROVED' },
                                  { icon: 'Plane', title: 'IATA ACCREDITED' },
                                  { icon: 'Award', title: 'ABTA BONDED' },
                                ]).map((stat: any, sIdx: number) => (
                                  <div key={sIdx} className="grid grid-cols-[1fr_2fr] gap-2">
                                    <input
                                      type="text"
                                      value={stat.icon || ''}
                                      placeholder="Lucide Icon Name (e.g. Shield)"
                                      onChange={(e) => {
                                        const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                          { icon: 'Shield', title: 'ATOL PROTECTED' },
                                          { icon: 'Building', title: 'SAUDI MINISTRY APPROVED' },
                                          { icon: 'Plane', title: 'IATA ACCREDITED' },
                                          { icon: 'Award', title: 'ABTA BONDED' },
                                        ])];
                                        currentItems[sIdx] = { ...currentItems[sIdx], icon: e.target.value };
                                        updateSectionData(sec.id, 'items', currentItems);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                    />
                                    <input
                                      type="text"
                                      value={stat.title || ''}
                                      placeholder="Title (e.g. ATOL PROTECTED)"
                                      onChange={(e) => {
                                        const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                          { icon: 'Shield', title: 'ATOL PROTECTED' },
                                          { icon: 'Building', title: 'SAUDI MINISTRY APPROVED' },
                                          { icon: 'Plane', title: 'IATA ACCREDITED' },
                                          { icon: 'Award', title: 'ABTA BONDED' },
                                        ])];
                                        currentItems[sIdx] = { ...currentItems[sIdx], title: e.target.value };
                                        updateSectionData(sec.id, 'items', currentItems);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {(sec.type === 'Image+Text' || sec.type === 'Intro (Text + Image)' || sec.type === 'Why Choose Us') && (
                              <div className="flex flex-col gap-3.5 mt-1">
                                {/* Image Uploader Component */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                                    🖼 SECTION IMAGE UPLOADER
                                  </label>
                                  <ImageUploadWidget
                                    value={sec.data?.image || ''}
                                    onChange={(url) => updateSectionData(sec.id, 'image', url)}
                                    subfolder="sections"
                                  />
                                </div>

                                {/* Rich Text & Features Checklist Editor */}
                                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    📝 Right Section Rich Text & Checklist Items
                                  </span>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">SUBHEADING</label>
                                    <input
                                      type="text"
                                      value={sec.data?.subheading || 'Common Travel Needs We Solve'}
                                      onChange={(e) => updateSectionData(sec.id, 'subheading', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">CHECKLIST FEATURES (One per line)</label>
                                    <textarea
                                      rows={5}
                                      value={Array.isArray(sec.data?.features) ? sec.data.features.join('\n') : (sec.data?.features || [
                                        "Securing all types of Saudi visas quickly.",
                                        "Coordinating family or group Hajj packages.",
                                        "Last-minute airline ticket changes or cancellations.",
                                        "5-Star Accommodations near the Haram.",
                                        "Managing itineraries with multiple destinations.",
                                        "Handling urgent travel during peak seasons."
                                      ].join('\n'))}
                                      onChange={(e) => {
                                        const lines = e.target.value.split('\n');
                                        updateSectionData(sec.id, 'features', lines);
                                      }}
                                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-sans"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === 'Who We Are' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">IMAGE URL</label>
                                    <ImageUploadWidget
                                      value={sec.data?.image || ''}
                                      onChange={(url) => updateSectionData(sec.id, 'image', url)}
                                      subfolder="sections"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">QUOTE BADGE TEXT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.quoteBadgeText || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'quoteBadgeText', e.target.value)}
                                      className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-primary"
                                    />
                                  </div>

                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 mt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-extrabold text-primary uppercase">📊 KPI Stat Items (Value & Label)</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                            { value: '25+', label: 'Years Serving Canada' },
                                            { value: '10,000+', label: 'Pilgrims Guided' },
                                            { value: '5★', label: 'Hotels, Every Package' }
                                          ])];
                                          currentItems.push({ value: '100%', label: 'Client Satisfaction' });
                                          updateSectionData(sec.id, 'items', currentItems);
                                        }}
                                        className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:bg-[#00382B]"
                                      >
                                        + Add New KPI
                                      </button>
                                    </div>
                                    {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                      { value: '25+', label: 'Years Serving Canada' },
                                      { value: '10,000+', label: 'Pilgrims Guided' },
                                      { value: '5★', label: 'Hotels, Every Package' }
                                    ]).map((stat: any, sIdx: number, arr: any[]) => {
                                      const isFirst = sIdx === 0;
                                      const isLast = sIdx === arr.length - 1;

                                      return (
                                        <div key={sIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                                          {/* Reorder Buttons */}
                                          <div className="flex flex-col gap-0.5 shrink-0">
                                            <button
                                              type="button"
                                              disabled={isFirst}
                                              onClick={() => {
                                                if (isFirst) return;
                                                const currentItems = [...arr];
                                                const temp = currentItems[sIdx - 1];
                                                currentItems[sIdx - 1] = currentItems[sIdx];
                                                currentItems[sIdx] = temp;
                                                updateSectionData(sec.id, 'items', currentItems);
                                              }}
                                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
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
                                                const currentItems = [...arr];
                                                const temp = currentItems[sIdx + 1];
                                                currentItems[sIdx + 1] = currentItems[sIdx];
                                                currentItems[sIdx] = temp;
                                                updateSectionData(sec.id, 'items', currentItems);
                                              }}
                                              className={`p-1 rounded border border-slate-200 flex items-center justify-center transition-colors ${isLast ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                                }`}
                                              title="Move Down"
                                            >
                                              <MoveDown className="w-3 h-3" />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-[1fr_2fr] gap-2 flex-1 min-w-0">
                                            <input
                                              type="text"
                                              value={stat.value || ''}
                                              placeholder="Value (e.g. 25+)"
                                              onChange={(e) => {
                                                const currentItems = [...arr];
                                                currentItems[sIdx] = { ...currentItems[sIdx], value: e.target.value };
                                                updateSectionData(sec.id, 'items', currentItems);
                                              }}
                                              className="w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                            />
                                            <input
                                              type="text"
                                              value={stat.label || ''}
                                              placeholder="Label (e.g. Years Serving Canada)"
                                              onChange={(e) => {
                                                const currentItems = [...arr];
                                                currentItems[sIdx] = { ...currentItems[sIdx], label: e.target.value };
                                                updateSectionData(sec.id, 'items', currentItems);
                                              }}
                                              className="w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                                            />
                                          </div>

                                          {/* Delete button */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentItems = [...arr];
                                              currentItems.splice(sIdx, 1);
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 cursor-pointer flex items-center justify-center transition-colors shrink-0"
                                            title="Remove KPI"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === 'What We Provide' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">IMAGE URL</label>
                                  <ImageUploadWidget
                                    value={sec.data?.image || ''}
                                    onChange={(url) => updateSectionData(sec.id, 'image', url)}
                                    subfolder="sections"
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    Numbered Features
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [])];
                                      currentItems.push({ num: `0${currentItems.length + 1}`, title: 'New Feature', description: 'Description' });
                                      updateSectionData(sec.id, 'items', currentItems);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Feature
                                  </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.map((item: any, iIdx: number) => (
                                    <div key={iIdx} className="relative bg-slate-50 border border-slate-200 p-2.5 rounded-lg group">
                                      <button
                                        onClick={() => {
                                          const currentItems = [...(sec.data?.items || [])];
                                          currentItems.splice(iIdx, 1);
                                          updateSectionData(sec.id, 'items', currentItems);
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-md border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ✕
                                      </button>
                                      <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-2">
                                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">NUMBER</label>
                                          <input
                                            type="text"
                                            value={item.num || ''}
                                            onChange={(e) => {
                                              const currentItems = [...(sec.data?.items || [])];
                                              currentItems[iIdx].num = e.target.value;
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                          />
                                        </div>
                                        <div className="col-span-10">
                                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">TITLE</label>
                                          <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => {
                                              const currentItems = [...(sec.data?.items || [])];
                                              currentItems[iIdx].title = e.target.value;
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                          />
                                        </div>
                                      </div>
                                      <div className="mt-2">
                                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">DESCRIPTION</label>
                                        <input
                                          type="text"
                                          value={item.description || ''}
                                          onChange={(e) => {
                                            const currentItems = [...(sec.data?.items || [])];
                                            currentItems[iIdx].description = e.target.value;
                                            updateSectionData(sec.id, 'items', currentItems);
                                          }}
                                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {sec.type === 'Travel Services' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    Travel Services Grid
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentItems = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [])];
                                      currentItems.push({ icon: 'star', title: 'New Service', description: 'Description', link: '#' });
                                      updateSectionData(sec.id, 'items', currentItems);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Service
                                  </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.map((item: any, iIdx: number) => (
                                    <div key={iIdx} className="relative bg-slate-50 border border-slate-200 p-2.5 rounded-lg group">
                                      <button
                                        onClick={() => {
                                          const currentItems = [...(sec.data?.items || [])];
                                          currentItems.splice(iIdx, 1);
                                          updateSectionData(sec.id, 'items', currentItems);
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-md border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ✕
                                      </button>
                                      <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-3">
                                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">ICON (LUCIDE)</label>
                                          <input
                                            type="text"
                                            value={item.icon || ''}
                                            onChange={(e) => {
                                              const currentItems = [...(sec.data?.items || [])];
                                              currentItems[iIdx].icon = e.target.value;
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                            placeholder="e.g. Star, Plane"
                                          />
                                        </div>
                                        <div className="col-span-5">
                                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">TITLE</label>
                                          <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => {
                                              const currentItems = [...(sec.data?.items || [])];
                                              currentItems[iIdx].title = e.target.value;
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                          />
                                        </div>
                                        <div className="col-span-4">
                                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">LINK</label>
                                          <input
                                            type="text"
                                            value={item.link || ''}
                                            onChange={(e) => {
                                              const currentItems = [...(sec.data?.items || [])];
                                              currentItems[iIdx].link = e.target.value;
                                              updateSectionData(sec.id, 'items', currentItems);
                                            }}
                                            className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                          />
                                        </div>
                                      </div>
                                      <div className="mt-2">
                                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">DESCRIPTION</label>
                                        <input
                                          type="text"
                                          value={item.description || ''}
                                          onChange={(e) => {
                                            const currentItems = [...(sec.data?.items || [])];
                                            currentItems[iIdx].description = e.target.value;
                                            updateSectionData(sec.id, 'items', currentItems);
                                          }}
                                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Umrah Packages' || sec.type === 'Hajj Packages' || sec.type === 'Umrah Packages Grid' || sec.type === 'Packages Grid' || sec.type === 'Upcoming Umrah Packages' || sec.type === 'Upcoming Hajj Packages' || sec.type === 'Sold Out Packages') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                  <span className="text-xs font-extrabold text-primary uppercase">
                                    {sec.type === 'Sold Out Packages' ? '🛑 Sold Out' : ((sec.type === 'Hajj Packages' || sec.type === 'Upcoming Hajj Packages') ? '🕌 Hajj' : '🕋 Umrah')} Packages Selector
                                  </span>
                                </div>

                                <div className="text-[11px] text-white mb-2">
                                  Add packages from the dropdown below. Drag and drop to reorder.
                                </div>

                                <div className="flex flex-col gap-2">
                                  {/* Dropdown to add new packages */}
                                  <select
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-slate-50"
                                    onChange={(e) => {
                                      if (!e.target.value) return;
                                      const pkgId = Number(e.target.value);
                                      const currentIds = sec.data?.packageIds || [];
                                      if (!currentIds.includes(pkgId)) {
                                        updateSectionData(sec.id, 'packageIds', [...currentIds, pkgId]);
                                      }
                                      e.target.value = ""; // Reset dropdown
                                    }}
                                  >
                                    <option value="">+ Select a package to add</option>
                                    {allPackages
                                      .filter(p => {
                                        if (sec.type === 'Sold Out Packages') {
                                          return p.status === 'sold_out';
                                        }
                                        return p.type === ((sec.type === 'Hajj Packages' || sec.type === 'Upcoming Hajj Packages') ? 'hajj' : 'umrah');
                                      })
                                      .filter(p => !(sec.data?.packageIds || []).includes(p.id))
                                      .map(p => (
                                        <option key={p.id} value={p.id}>
                                          {sec.type === 'Sold Out Packages' ? `${p.type === 'hajj' ? '🕌 Hajj' : '🕋 Umrah'} - ` : ''}{p.title}
                                        </option>
                                      ))
                                    }
                                  </select>
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                  {(sec.data?.packageIds || []).map((id: number, idx: number) => {
                                    const pkg = allPackages.find(p => p.id === id);
                                    if (!pkg) return null;

                                    return (
                                      <div
                                        key={id}
                                        draggable
                                        onDragStart={(e) => {
                                          setDraggedPackageIdx(idx);
                                          e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          if (draggedPackageIdx === null || draggedPackageIdx === idx) return;
                                          const newIds = [...(sec.data?.packageIds || [])];
                                          const item = newIds.splice(draggedPackageIdx, 1)[0];
                                          newIds.splice(idx, 0, item);
                                          updateSectionData(sec.id, 'packageIds', newIds);
                                          setDraggedPackageIdx(idx);
                                        }}
                                        onDragEnd={() => setDraggedPackageIdx(null)}
                                        className={`flex items-center gap-3 p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing transition-colors ${draggedPackageIdx === idx ? 'border-primary shadow-md z-10' : 'border-slate-200 hover:border-slate-300 shadow-2xs'}`}
                                      >
                                        <div className="text-slate-300 cursor-grab">
                                          {/* Grip icon */}
                                          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                                            <circle cx="2" cy="2" r="2" />
                                            <circle cx="2" cy="8" r="2" />
                                            <circle cx="2" cy="14" r="2" />
                                            <circle cx="10" cy="2" r="2" />
                                            <circle cx="10" cy="8" r="2" />
                                            <circle cx="10" cy="14" r="2" />
                                          </svg>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                          <div className="text-xs font-bold text-slate-800 truncate">{pkg.title}</div>
                                          <div className="text-[10px] text-slate-500 truncate">
                                            CAD ${pkg.startingPrice} • {formatTravelMonth(pkg.month) || pkg.month}
                                          </div>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const newIds = (sec.data?.packageIds || []).filter((pid: number) => pid !== id);
                                            updateSectionData(sec.id, 'packageIds', newIds);
                                          }}
                                          className="flex-shrink-0 bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                                          title="Remove Package"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                  {(sec.data?.packageIds || []).length === 0 && (
                                    <div className="text-xs text-center text-slate-400 p-4 border border-dashed border-slate-200 rounded-lg">
                                      No packages added yet. Select from the dropdown above.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Services Grid' || sec.type === 'What We Provide') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    ✨ Services Grid Cards (Icon, Title, Subtitle & Description)
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentServices = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                        { icon: "✈️", title: "Lowest Fares", subtitle: "We Offer the Lowest Fair on Air Ticketing around the Globe.", description: "As a partner with major airlines, including PIA, King Travel Can Ltd guarantees the lowest airfares for flights to Pakistan, Saudi Arabia, and beyond." },
                                        { icon: "✨", title: "Special Deals", subtitle: "We Provide Best Prices Of All Inclusive Packages.", description: "We offer exclusive special deals on Umrah, Hajj, and international flight packages, tailored to fit your budget." },
                                        { icon: "🛡️", title: "Trusted & Certified", subtitle: "We are The Only Authorized Saudi Visa Providers Canada!", description: "Recognized by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah." },
                                        { icon: "🕌", title: "Pilgrimage Experts", subtitle: "We Offer Best Accommodations & Transports In Saudia Arabia", description: "From visa processing and ticketing to 5-star accommodations and guided tours, King Travel provides a complete pilgrimage experience." }
                                      ])];
                                      currentServices.push({ icon: "🌟", title: "New Service Card", subtitle: "Service Subtitle", description: "Service details description..." });
                                      updateSectionData(sec.id, 'items', currentServices);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Service Card
                                  </button>
                                </div>
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { icon: "✈️", title: "Lowest Fares", subtitle: "We Offer the Lowest Fair on Air Ticketing around the Globe.", description: "As a partner with major airlines, including PIA, King Travel Can Ltd guarantees the lowest airfares for flights to Pakistan, Saudi Arabia, and beyond." },
                                  { icon: "✨", title: "Special Deals", subtitle: "We Provide Best Prices Of All Inclusive Packages.", description: "We offer exclusive special deals on Umrah, Hajj, and international flight packages, tailored to fit your budget." },
                                  { icon: "🛡️", title: "Trusted & Certified", subtitle: "We are The Only Authorized Saudi Visa Providers Canada!", description: "Recognized by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah." },
                                  { icon: "🕌", title: "Pilgrimage Experts", subtitle: "We Offer Best Accommodations & Transports In Saudia Arabia", description: "From visa processing and ticketing to 5-star accommodations and guided tours, King Travel provides a complete pilgrimage experience." }
                                ]).map((svc: any, sIdx: number) => (
                                  <div key={sIdx} className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2 relative">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-extrabold text-slate-500">CARD #{sIdx + 1}</span>
                                      <button
                                        onClick={() => {
                                          const currentServices = [...sec.data?.items];
                                          currentServices.splice(sIdx, 1);
                                          updateSectionData(sec.id, 'items', currentServices);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded p-2 text-xs cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-semibold"
                                        title="Remove Card"
                                      >
                                        <Trash2 className="w-3 h-3" /> Card
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] gap-2">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">ICON</label>
                                        <input
                                          type="text"
                                          value={svc.icon || '✈️'}
                                          onChange={(e) => {
                                            const currentServices = [...sec.data?.items];
                                            currentServices[sIdx] = { ...currentServices[sIdx], icon: e.target.value };
                                            updateSectionData(sec.id, 'items', currentServices);
                                          }}
                                          className="w-full p-1.5 rounded-md border border-slate-300 text-sm text-center"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">CARD TITLE</label>
                                        <input
                                          type="text"
                                          value={svc.title || ''}
                                          onChange={(e) => {
                                            const currentServices = [...sec.data?.items];
                                            currentServices[sIdx] = { ...currentServices[sIdx], title: e.target.value };
                                            updateSectionData(sec.id, 'items', currentServices);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">SUBTITLE / TAGLINE</label>
                                      <input
                                        type="text"
                                        value={svc.subtitle || ''}
                                        onChange={(e) => {
                                          const currentServices = [...sec.data?.items];
                                          currentServices[sIdx] = { ...currentServices[sIdx], subtitle: e.target.value };
                                          updateSectionData(sec.id, 'items', currentServices);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">DESCRIPTION</label>
                                      <textarea
                                        rows={2}
                                        value={svc.description || ''}
                                        onChange={(e) => {
                                          const currentServices = [...sec.data?.items];
                                          currentServices[sIdx] = { ...currentServices[sIdx], description: e.target.value };
                                          updateSectionData(sec.id, 'items', currentServices);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-sans"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}



                            {sec.type === 'Hajj Services Grid' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    🕋 Hajj Services Grid Cards (Icon, Title & Description)
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentItems: any[] = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [])];
                                      currentItems.push({ icon: '⭐', title: 'New Service', description: 'Service description here' });
                                      updateSectionData(sec.id, 'items', currentItems);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Service Card
                                  </button>
                                </div>

                                {/* Section heading fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Eyebrow Label</label>
                                    <input
                                      type="text"
                                      value={sec.data?.eyebrow || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'eyebrow', e.target.value)}
                                      placeholder="e.g. WHAT IS INCLUDED"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Section Title (H2)</label>
                                    <input
                                      type="text"
                                      value={sec.data?.title || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                      placeholder="e.g. Hajj 2027 Services"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Subtitle / Tagline</label>
                                    <input
                                      type="text"
                                      value={sec.data?.subtitle || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'subtitle', e.target.value)}
                                      placeholder="e.g. From Departure to Return..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                    />
                                  </div>
                                </div>

                                {/* Service cards CRUD list */}
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { icon: 'Users', title: 'Pre-Hajj Meet up', description: 'Get to know each other and held a meeting with all Hajjis' },
                                  { icon: 'Handshake', title: 'Meet & Assist', description: 'A dedicated team to assist and guide' },
                                  { icon: 'Utensils', title: 'Buffet Meals', description: 'Segregated full board buffet food' },
                                  { icon: 'IdCard', title: 'Visa Acquisition', description: 'We facilitate with visa documentation and services' },
                                  { icon: 'Bus', title: 'Luxury Transportation', description: 'We offer luxury busses and private vehicle' },
                                  { icon: 'Building2', title: '5 Star Accommodation', description: 'Get a comfort living 5 star hotel facility' },
                                  { icon: 'BedDouble', title: 'Sofa Mattress in Mina', description: 'Premium quality sofas and mattress' },
                                  { icon: 'BookOpen', title: 'Guide & Scholar', description: '3 to 4 training sessions with renowned scholars' },
                                ]).map((svc: any, sIdx: number, allItems: any[]) => (
                                  <div key={sIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-extrabold text-slate-500">CARD #{sIdx + 1}</span>
                                      <button
                                        onClick={() => {
                                          const updated = [...allItems];
                                          updated.splice(sIdx, 1);
                                          updateSectionData(sec.id, 'items', updated);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded p-2 text-xs cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-semibold"
                                        title="Remove card"
                                      >
                                        <Trash2 className="w-3 h-3" /> Remove
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-[50px_1fr] gap-2">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">ICON</label>
                                        <input
                                          type="text"
                                          value={svc.icon || ''}
                                          onChange={(e) => {
                                            const updated = [...allItems];
                                            updated[sIdx] = { ...updated[sIdx], icon: e.target.value };
                                            updateSectionData(sec.id, 'items', updated);
                                          }}
                                          className="w-full p-1.5 rounded-md border border-slate-300 text-sm text-center"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">TITLE</label>
                                        <input
                                          type="text"
                                          value={svc.title || ''}
                                          onChange={(e) => {
                                            const updated = [...allItems];
                                            updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                                            updateSectionData(sec.id, 'items', updated);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">DESCRIPTION</label>
                                      <input
                                        type="text"
                                        value={svc.description || ''}
                                        onChange={(e) => {
                                          const updated = [...allItems];
                                          updated[sIdx] = { ...updated[sIdx], description: e.target.value };
                                          updateSectionData(sec.id, 'items', updated);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] bg-white"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {sec.type === 'Package Brochure' && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <div className="flex gap-2 pb-2 border-b border-slate-200">
                                  <div>
                                    <span className="text-xs font-extrabold text-primary uppercase">
                                      📸 PACKAGE BROCHURES & FLYERS (BULK UPLOADER)
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Upload 1 or more promotional flyers. 1 brochure will center, multiple will display in a responsive grid.
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-[#00382B] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Bulk Upload</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files || []);
                                          if (files.length === 0) return;
                                          const currentImages = Array.isArray(sec.data?.images) ? [...sec.data.images] : [];

                                          (async () => {
                                            for (const file of files) {
                                              const url = await uploadFile(file, 'brochures');
                                              if (url) {
                                                const alt = generateAutoAltText(file, sec.data?.title || 'Package Brochure');
                                                currentImages.push({
                                                  image: url,
                                                  alt: alt,
                                                  title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
                                                });
                                                updateSectionData(sec.id, 'images', [...currentImages]);
                                              }
                                            }
                                          })();
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentImages = Array.isArray(sec.data?.images) ? [...sec.data.images] : [];
                                        currentImages.push({ image: '', alt: 'Package Brochure', title: '' });
                                        updateSectionData(sec.id, 'images', currentImages);
                                      }}
                                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      + Add Single
                                    </button>
                                  </div>
                                </div>

                                {/* Empty state or image grid with previews */}
                                {(!sec.data?.images || !Array.isArray(sec.data.images) || sec.data.images.length === 0) ? (
                                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-50">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-primary flex items-center justify-center mb-3">
                                      <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 mb-1">No brochure images uploaded yet</p>
                                    <p className="text-xs text-slate-500 mb-4">Select multiple image files at once to upload them instantly</p>
                                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-[#00382B] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                                      <Upload className="w-4 h-4" />
                                      <span>Choose Brochure Files</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files || []);
                                          if (files.length === 0) return;
                                          const currentImages = Array.isArray(sec.data?.images) ? [...sec.data.images] : [];

                                          (async () => {
                                            for (const file of files) {
                                              const url = await uploadFile(file, 'brochures');
                                              if (url) {
                                                const alt = generateAutoAltText(file, sec.data?.title || 'Package Brochure');
                                                currentImages.push({
                                                  image: url,
                                                  alt: alt,
                                                  title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
                                                });
                                                updateSectionData(sec.id, 'images', [...currentImages]);
                                              }
                                            }
                                          })();
                                        }}
                                      />
                                    </label>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(sec.data?.images || []).map((item: any, imgIdx: number, arr: any[]) => {
                                      const imgSrc = typeof item === 'string' ? item : item?.image || '';
                                      const imgAlt = typeof item === 'string' ? 'Package Brochure' : item?.alt || '';
                                      const imgLink = typeof item === 'string' ? '' : item?.link || item?.url || '';
                                      const isDraggingThis = draggedBrochure?.secId === sec.id && draggedBrochure?.index === imgIdx;

                                      return (
                                        <div
                                          key={imgIdx}
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(imgIdx));
                                            setDraggedBrochure({ secId: sec.id, index: imgIdx });
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            if (!draggedBrochure || draggedBrochure.secId !== sec.id || draggedBrochure.index === imgIdx) return;
                                            const list = [...(sec.data?.images || [])];
                                            const [moved] = list.splice(draggedBrochure.index, 1);
                                            list.splice(imgIdx, 0, moved);
                                            updateSectionData(sec.id, 'images', list);
                                            setDraggedBrochure(null);
                                          }}
                                          onDragEnd={() => setDraggedBrochure(null)}
                                          className={`bg-slate-50 border rounded-xl p-3 flex flex-col gap-2.5 relative group shadow-sm transition-all ${isDraggingThis
                                            ? 'opacity-40 border-dashed border-primary scale-[0.98]'
                                            : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                                            }`}
                                        >
                                          <div className="flex justify-between items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                              <span
                                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                                title="Drag to reorder flyer"
                                              >
                                                <GripVertical className="w-3.5 h-3.5" />
                                              </span>
                                              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                                                FLYER #{imgIdx + 1}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                              {/* Reorder Left / Up button */}
                                              <button
                                                type="button"
                                                disabled={imgIdx === 0}
                                                onClick={() => {
                                                  if (imgIdx === 0) return;
                                                  const list = [...(sec.data?.images || [])];
                                                  const temp = list[imgIdx];
                                                  list[imgIdx] = list[imgIdx - 1];
                                                  list[imgIdx - 1] = temp;
                                                  updateSectionData(sec.id, 'images', list);
                                                }}
                                                className="border-0 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded p-1 text-[10px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move flyer backward"
                                              >
                                                <ArrowLeft className="w-3 h-3" />
                                              </button>

                                              {/* Reorder Right / Down button */}
                                              <button
                                                type="button"
                                                disabled={imgIdx === arr.length - 1}
                                                onClick={() => {
                                                  if (imgIdx === arr.length - 1) return;
                                                  const list = [...(sec.data?.images || [])];
                                                  const temp = list[imgIdx];
                                                  list[imgIdx] = list[imgIdx + 1];
                                                  list[imgIdx + 1] = temp;
                                                  updateSectionData(sec.id, 'images', list);
                                                }}
                                                className="border-0 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded p-1 text-[10px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move flyer forward"
                                              >
                                                <ArrowRight className="w-3 h-3" />
                                              </button>

                                              {/* Remove button */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = [...(sec.data?.images || [])];
                                                  updated.splice(imgIdx, 1);
                                                  updateSectionData(sec.id, 'images', updated);
                                                }}
                                                className="border-0 bg-red-100 text-red-600 rounded p-1.5 text-[11px] cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-bold ml-1"
                                                title="Remove brochure"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Image Upload Widget / Live Preview */}
                                          <ImageUploadWidget
                                            value={imgSrc}
                                            onChange={(newUrl) => {
                                              const updated = [...(sec.data?.images || [])];
                                              if (typeof updated[imgIdx] === 'string') {
                                                updated[imgIdx] = { image: newUrl, alt: imgAlt || 'Package Brochure', link: imgLink, url: imgLink };
                                              } else {
                                                updated[imgIdx] = { ...updated[imgIdx], image: newUrl };
                                              }
                                              updateSectionData(sec.id, 'images', updated);
                                            }}
                                            subfolder="brochures"
                                            hideManualUrl={false}
                                          />

                                          {/* Link URL (Optional) */}
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Link URL (Optional)</label>
                                            <input
                                              type="text"
                                              value={imgLink}
                                              onChange={(e) => {
                                                const updated = [...(sec.data?.images || [])];
                                                if (typeof updated[imgIdx] === 'string') {
                                                  updated[imgIdx] = { image: imgSrc, alt: imgAlt || 'Package Brochure', link: e.target.value, url: e.target.value };
                                                } else {
                                                  updated[imgIdx] = { ...updated[imgIdx], link: e.target.value, url: e.target.value };
                                                }
                                                updateSectionData(sec.id, 'images', updated);
                                              }}
                                              placeholder="e.g. /hajj-packages or https://wa.me/..."
                                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 bg-white"
                                            />
                                          </div>

                                          {/* Alt Text */}
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">SEO Alt Text</label>
                                            <input
                                              type="text"
                                              value={imgAlt}
                                              onChange={(e) => {
                                                const updated = [...(sec.data?.images || [])];
                                                if (typeof updated[imgIdx] === 'string') {
                                                  updated[imgIdx] = { image: imgSrc, alt: e.target.value, link: imgLink, url: imgLink };
                                                } else {
                                                  updated[imgIdx] = { ...updated[imgIdx], alt: e.target.value };
                                                }
                                                updateSectionData(sec.id, 'images', updated);
                                              }}
                                              placeholder="e.g. Luxury Hajj Package Brochure"
                                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {(sec.type === 'Text Block (Rich Text)' || sec.type === 'Packages Content (Rich Text)') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <span className="text-[11px] font-extrabold text-primary uppercase">
                                  📝 Rich Text Content Editor
                                </span>
                                <TiptapEditor
                                  value={sec.data?.content || ''}
                                  onChange={(html) => updateSectionData(sec.id, 'content', html)}
                                  minHeight="200px"
                                />
                                <p className="text-[10px] text-slate-400 m-0">
                                  Content is saved as HTML and rendered on the frontend with your site&apos;s prose styles.
                                </p>
                              </div>
                            )}

                            {(sec.type === 'Accreditations Bar' || sec.type === 'Badges Cards') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    🛡️ Accreditations & Badges Cards (Lucide / FontAwesome / SVG)
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentBadges = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                        { title: 'ATOL PROTECTED', icon: 'fa-solid fa-shield-halved', iconType: 'fontawesome' },
                                        { title: 'SAUDI MINISTRY APPROVED', icon: 'fa-solid fa-mosque', iconType: 'fontawesome' },
                                        { title: 'IATA ACCREDITED', icon: 'fa-solid fa-plane-departure', iconType: 'fontawesome' },
                                        { title: 'ABTA BONDED', icon: 'fa-solid fa-stamp', iconType: 'fontawesome' }
                                      ])];
                                      currentBadges.push({ title: 'NEW ACCREDITATION BADGE', icon: 'fa-solid fa-certificate', iconType: 'fontawesome' });
                                      updateSectionData(sec.id, 'items', currentBadges);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Badge Card
                                  </button>
                                </div>
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { title: 'ATOL PROTECTED', icon: 'fa-solid fa-shield-halved', iconType: 'fontawesome' },
                                  { title: 'SAUDI MINISTRY APPROVED', icon: 'fa-solid fa-primary fa-mosque', iconType: 'fontawesome' },
                                  { title: 'IATA ACCREDITED', icon: 'fa-solid fa-plane-departure', iconType: 'fontawesome' },
                                  { title: 'ABTA BONDED', icon: 'fa-solid fa-stamp', iconType: 'fontawesome' }
                                ]).map((badge: any, bIdx: number) => (
                                  <div key={bIdx} className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 grid grid-cols-[1.5fr_1.5fr_1fr_auto] gap-2 items-center">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">TITLE / BADGE</label>
                                      <input
                                        type="text"
                                        value={badge.title || ''}
                                        onChange={(e) => {
                                          const currentBadges = [...sec.data?.items];
                                          currentBadges[bIdx] = { ...currentBadges[bIdx], title: e.target.value };
                                          updateSectionData(sec.id, 'items', currentBadges);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-bold text-slate-900"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">ICON CLASS / NAME</label>
                                      <input
                                        type="text"
                                        value={badge.icon || ''}
                                        placeholder="fa-solid fa-shield / shield"
                                        onChange={(e) => {
                                          const currentBadges = [...sec.data?.items];
                                          currentBadges[bIdx] = { ...currentBadges[bIdx], icon: e.target.value };
                                          updateSectionData(sec.id, 'items', currentBadges);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] text-slate-900"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">ENGINE</label>
                                      <select
                                        value={badge.iconType || 'fontawesome'}
                                        onChange={(e) => {
                                          const currentBadges = [...sec.data?.items];
                                          currentBadges[bIdx] = { ...currentBadges[bIdx], iconType: e.target.value };
                                          updateSectionData(sec.id, 'items', currentBadges);
                                        }}
                                        className="w-full p-1.5 rounded-md border border-slate-300 text-[11px] text-slate-900"
                                      >
                                        <option value="fontawesome">FontAwesome</option>
                                        <option value="lucide">Lucide Icon</option>
                                        <option value="emoji">Emoji</option>
                                      </select>
                                    </div>
                                    <div className="pt-3.5">
                                      <button
                                        onClick={() => {
                                          const currentBadges = [...sec.data?.items];
                                          currentBadges.splice(bIdx, 1);
                                          updateSectionData(sec.id, 'items', currentBadges);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded-md p-1.5 cursor-pointer hover:bg-red-200 transition-colors flex items-center justify-center"
                                        title="Remove badge"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(sec.type === 'Visa Solutions' || sec.type === 'Visa Cards') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    🇸🇦 Visa Solutions Cards Manager (7 Visa Types)
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentVisas = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [
                                        { title: "Tourist Visa", description: "Only passport required. Explore the beauty and culture of Saudi Arabia effortlessly.", image: "/img/saudi-visa-1.webp" },
                                        { title: "Umrah Visa", description: "Requires passport and PR Card or other proof of residence.", image: "/img/saudi-visa-2.webp" },
                                        { title: "Family Visit Visa", description: "Complete list of requirements sent via email.", image: "/img/saudi-visa-3.jpg" }
                                      ])];
                                      currentVisas.push({ title: "New Visa Category", description: "Visa category description...", image: "/img/saudi-visa-1.webp" });
                                      updateSectionData(sec.id, 'items', currentVisas);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Visa Card
                                  </button>
                                </div>
                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { title: "Tourist Visa", description: "Only passport required. Explore the beauty and culture of Saudi Arabia effortlessly.", image: "/img/saudi-visa-1.webp" },
                                  { title: "Umrah Visa", description: "Requires passport and PR Card or other proof of residence. Start your spiritual journey with official Umrah visa services.", image: "/img/saudi-visa-2.webp" },
                                  { title: "Family Visit Visa", description: "Complete list of requirements sent via email. Reunite with your loved ones quickly and securely.", image: "/img/saudi-visa-3.jpg" },
                                  { title: "Resident Iqama Visa", description: "Get all the requirements sent to your inbox. Simplify your residency process with expert guidance.", image: "/img/saudi-visa-4.webp" },
                                  { title: "Business Visit Visa", description: "We'll email the full details you need. Expand your business horizons with an authorized visa service.", image: "/img/saudi-visa-5.webp" },
                                  { title: "Work Visa", description: "Contact us for detailed requirements via email. Begin your career in Saudi Arabia with professional assistance.", image: "/img/saudi-visa-6.jpg" },
                                  { title: "Personal Visit Visa", description: "Get in touch with us today to get the detailed requirements and fast-track your Saudi personal visit visa.", image: "/img/riyadh.jpg" }
                                ]).map((vCard: any, vIdx: number) => (
                                  <div key={vIdx} className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-extrabold text-slate-500">VISA CARD #{vIdx + 1}</span>
                                      <button
                                        onClick={() => {
                                          const currentVisas = [...sec.data?.items];
                                          currentVisas.splice(vIdx, 1);
                                          updateSectionData(sec.id, 'items', currentVisas);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded p-2 text-xs cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-semibold"
                                        title="Remove Card"
                                      >
                                        <Trash2 className="w-3 h-3" /> Card
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-[1fr_2fr] gap-2">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">VISA TITLE</label>
                                        <input
                                          type="text"
                                          value={vCard.title || ''}
                                          onChange={(e) => {
                                            const currentVisas = [...sec.data?.items];
                                            currentVisas[vIdx] = { ...currentVisas[vIdx], title: e.target.value };
                                            updateSectionData(sec.id, 'items', currentVisas);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">IMAGE URL</label>
                                        <ImageUploadWidget
                                          value={vCard.image || ''}
                                          onChange={(url) => {
                                            const currentVisas = [...sec.data?.items];
                                            currentVisas[vIdx] = { ...currentVisas[vIdx], image: url };
                                            updateSectionData(sec.id, 'items', currentVisas);
                                          }}
                                          subfolder="visas"
                                          compact={true}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">DESCRIPTION</label>
                                      <textarea
                                        rows={2}
                                        value={vCard.description || ''}
                                        onChange={(e) => {
                                          const currentVisas = [...sec.data?.items];
                                          currentVisas[vIdx] = { ...currentVisas[vIdx], description: e.target.value };
                                          updateSectionData(sec.id, 'items', currentVisas);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-sans"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(sec.type === 'Visa Process Steps' || sec.type === '3 Easy Steps') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    📝 Visa Process Timeline Steps & Contact Info Manager
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentSteps = [...((sec.data?.steps && Array.isArray(sec.data.steps)) ? sec.data.steps : [
                                        { number: 1, title: "Apply & Share Your Details", description: "Fill out our quick application form and share your travel details. Our team will review your requirements and guide you on the best Saudi visa option for your needs." },
                                        { number: 2, title: "Submit Required Documents", description: "Provide the necessary documents such as your passport and photos. We'll verify everything and ensure your application meets all Saudi visa requirements." },
                                        { number: 3, title: "Sit Back & Get Your Visa", description: "We handle the complete visa processing on your behalf. Once approved, your Saudi visa will be delivered to you quickly and securely." }
                                      ])];
                                      currentSteps.push({
                                        number: currentSteps.length + 1,
                                        title: `New Step ${currentSteps.length + 1}`,
                                        description: "Step details description..."
                                      });
                                      updateSectionData(sec.id, 'steps', currentSteps);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add New Step Card
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">EMAIL CONTACT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.email || 'saudivisa@kingtravel.com'}
                                      onChange={(e) => updateSectionData(sec.id, 'email', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">PHONE CONTACT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.phone || '+1 905-624-8344'}
                                      onChange={(e) => updateSectionData(sec.id, 'phone', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                </div>

                                {/* Step Cards CRUD */}
                                {((sec.data?.steps && Array.isArray(sec.data.steps) && sec.data.steps.length > 0) ? sec.data.steps : [
                                  { number: 1, title: "Apply & Share Your Details", description: "Fill out our quick application form and share your travel details. Our team will review your requirements and guide you on the best Saudi visa option for your needs." },
                                  { number: 2, title: "Submit Required Documents", description: "Provide the necessary documents such as your passport and photos. We'll verify everything and ensure your application meets all Saudi visa requirements." },
                                  { number: 3, title: "Sit Back & Get Your Visa", description: "We handle the complete visa processing on your behalf. Once approved, your Saudi visa will be delivered to you quickly and securely." }
                                ]).map((st: any, stIdx: number) => (
                                  <div key={stIdx} className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-slate-800">STEP CARD #{stIdx + 1}</span>
                                      <button
                                        onClick={() => {
                                          const currentSteps = [...sec.data?.steps];
                                          currentSteps.splice(stIdx, 1);
                                          updateSectionData(sec.id, 'steps', currentSteps);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded p-2 text-xs cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-semibold"
                                        title="Remove Step"
                                      >
                                        <Trash2 className="w-3 h-3" /> Step
                                      </button>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">STEP TITLE</label>
                                      <input
                                        type="text"
                                        value={st.title || ''}
                                        onChange={(e) => {
                                          const currentSteps = [...sec.data?.steps];
                                          currentSteps[stIdx] = { ...currentSteps[stIdx], title: e.target.value };
                                          updateSectionData(sec.id, 'steps', currentSteps);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">STEP DESCRIPTION</label>
                                      <textarea
                                        rows={2}
                                        value={st.description || ''}
                                        onChange={(e) => {
                                          const currentSteps = [...sec.data?.steps];
                                          currentSteps[stIdx] = { ...currentSteps[stIdx], description: e.target.value };
                                          updateSectionData(sec.id, 'steps', currentSteps);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px] font-sans"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(sec.type === 'Available Flights Grid' || sec.type === 'Flights Cards') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-extrabold text-primary uppercase">
                                    ✈️ Available Flights & Fares Cards Manager
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                      currentFlights.push({
                                        code: "SV",
                                        name: "Saudi Arabian Airlines",
                                        operatedBy: "Operated By Saudia",
                                        originCode: "YYZ",
                                        originCity: "Toronto",
                                        destCode: "JED",
                                        destCity: "Jeddah",
                                        time: "16:45",
                                        price: "CAD 1,450.00"
                                      });
                                      updateSectionData(sec.id, 'items', currentFlights);
                                    }}
                                    className="bg-primary text-white border-none rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                                  >
                                    + Add Flight Card
                                  </button>
                                </div>

                                {getFlightsOrDefault(sec.data?.items).map((fl: any, fIdx: number) => (
                                  <div key={fIdx} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col gap-4 relative mt-2 group">
                                    <div className="absolute top-2 right-2">
                                      <button
                                        onClick={() => {
                                          const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                          currentFlights.splice(fIdx, 1);
                                          updateSectionData(sec.id, 'items', currentFlights);
                                        }}
                                        className="border-0 bg-red-100/50 text-red-600 hover:text-red-500 rounded p-1.5 cursor-pointer transition-colors flex items-center"
                                        title="Remove Flight"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                      {/* Left Side: Logo & Airline */}
                                      <div className="flex items-center gap-4 w-full md:w-[35%] pr-2">
                                        <div className="w-14 h-14 bg-primary text-white rounded flex items-center justify-center font-bold text-sm shrink-0">
                                          <input
                                            type="text"
                                            value={fl.code || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], code: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="bg-transparent text-white text-center w-full font-bold outline-none placeholder:text-white/50 uppercase"
                                            placeholder="PIA"
                                            title="Airline Code"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1 w-full relative">
                                          <input
                                            type="text"
                                            value={fl.name || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], name: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="font-bold text-slate-800 text-sm border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-colors w-full bg-transparent p-0"
                                            placeholder="Airline Name"
                                            title="Airline Name"
                                          />
                                          <input
                                            type="text"
                                            value={fl.operatedBy || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], operatedBy: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="text-xs text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-colors w-full bg-transparent p-0"
                                            placeholder="Operated By..."
                                            title="Operated By"
                                          />
                                        </div>
                                      </div>

                                      {/* Middle: Route & Time */}
                                      <div className="flex items-center justify-between flex-1 w-full gap-2">
                                        <div className="flex flex-col items-center flex-1">
                                          <input
                                            type="text"
                                            value={fl.originCode || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], originCode: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="font-bold text-lg text-slate-800 text-center w-16 border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0 uppercase"
                                            placeholder="LHR"
                                            title="Origin Code"
                                          />
                                          <input
                                            type="text"
                                            value={fl.originCity || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], originCity: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="text-xs text-slate-400 text-center w-20 border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent mt-0.5 p-0"
                                            placeholder="London"
                                            title="Origin City"
                                          />
                                        </div>

                                        <div className="flex-1 flex items-center justify-center relative px-2 min-w-[40px]">
                                          <div className="w-full border-t border-dashed border-slate-300 absolute top-1/2 -translate-y-1/2"></div>
                                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center relative z-10">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                                          </div>
                                        </div>

                                        <div className="flex flex-col items-center flex-1">
                                          <input
                                            type="text"
                                            value={fl.destCode || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], destCode: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="font-bold text-lg text-slate-800 text-center w-16 border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0 uppercase"
                                            placeholder="JED"
                                            title="Destination Code"
                                          />
                                          <input
                                            type="text"
                                            value={fl.destCity || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], destCity: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="text-xs text-slate-400 text-center w-20 border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent mt-0.5 p-0"
                                            placeholder="Jeddah"
                                            title="Destination City"
                                          />
                                        </div>

                                        <div className="w-px h-10 bg-slate-200 mx-2 hidden md:block"></div>

                                        <div className="flex flex-col items-center w-16 shrink-0">
                                          <input
                                            type="text"
                                            value={fl.time || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], time: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="font-bold text-[15px] text-slate-800 text-center w-full border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0"
                                            placeholder="14:20"
                                            title="Flight Time"
                                          />
                                          <input
                                            type="text"
                                            value={fl.timeOriginCode || ''}
                                            onChange={(e) => {
                                              const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                              currentFlights[fIdx] = { ...currentFlights[fIdx], timeOriginCode: e.target.value };
                                              updateSectionData(sec.id, 'items', currentFlights);
                                            }}
                                            className="text-[10px] text-slate-400 mt-0.5 uppercase w-full text-center border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0"
                                            placeholder={fl.originCode || 'LHR'}
                                            title="Time Origin Code"
                                          />
                                        </div>
                                      </div>

                                      {/* Right Side: Price & Button */}
                                      <div className="flex flex-col items-end justify-center w-full md:w-1/4 shrink-0 gap-1.5 md:pl-2">
                                        <input
                                          type="text"
                                          value={fl.price || ''}
                                          onChange={(e) => {
                                            const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                            currentFlights[fIdx] = { ...currentFlights[fIdx], price: e.target.value };
                                            updateSectionData(sec.id, 'items', currentFlights);
                                          }}
                                          className="font-bold text-lg md:text-xl text-slate-900 text-right w-full border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0 placeholder:text-slate-300"
                                          placeholder="CAD 1,250.00"
                                          title="Price"
                                        />
                                        <input
                                          type="text"
                                          value={fl.bookingUrl || ''}
                                          onChange={(e) => {
                                            const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                            currentFlights[fIdx] = { ...currentFlights[fIdx], bookingUrl: e.target.value };
                                            updateSectionData(sec.id, 'items', currentFlights);
                                          }}
                                          className="text-xs bg-primary text-white text-center font-bold px-3 py-2 rounded-md outline-none w-full border border-transparent focus:border-emerald-300 placeholder:text-white/50"
                                          placeholder="Booking URL..."
                                          title="Booking URL"
                                        />
                                      </div>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-3 mt-1 flex justify-between items-center text-[10px] text-slate-400 gap-4">
                                      <span className="whitespace-nowrap">FLIGHT #{fIdx + 1}</span>
                                      <input
                                        type="text"
                                        value={fl.priceSubtext || ''}
                                        onChange={(e) => {
                                          const currentFlights = [...getFlightsOrDefault(sec.data?.items)];
                                          currentFlights[fIdx] = { ...currentFlights[fIdx], priceSubtext: e.target.value };
                                          updateSectionData(sec.id, 'items', currentFlights);
                                        }}
                                        className="text-right w-full border-b border-transparent hover:border-slate-300 focus:border-primary outline-none bg-transparent p-0"
                                        placeholder="Price Per Person (Incl. Taxes & Fees)"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(sec.type === 'Airlines' || sec.type === 'Travel Organization' || sec.type === 'Partners Marquee' || sec.type === 'Logo Carousel' || sec.type === 'Airlines Logo Carousel') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 mt-1">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                  <span className="text-xs font-extrabold text-primary uppercase">
                                    {sec.type === 'Travel Organization' ? '🏢 TRAVEL ORGANIZATION LOGO CAROUSEL' : '✈️ AIRLINES LOGO CAROUSEL & PARTNERS MANAGER'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">CAROUSEL SPEED (MS)</label>
                                    <input
                                      type="number"
                                      step="1000"
                                      placeholder="35000"
                                      value={sec.data?.speedMs !== undefined ? sec.data.speedMs : 35000}
                                      onChange={(e) => updateSectionData(sec.id, 'speedMs', Number(e.target.value))}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">SCROLL DIRECTION</label>
                                    <select
                                      value={sec.data?.direction || 'left'}
                                      onChange={(e) => updateSectionData(sec.id, 'direction', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                                    >
                                      <option value="left">⬅️ Left</option>
                                      <option value="right">➡️ Right</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Multi Logo Uploader & Draggable Grid */}
                                <div className="flex flex-col mt-2">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-slate-600">
                                      🖼️ Upload & Manage Logos (Drag to reorder)
                                    </span>
                                    <div className="flex gap-2">
                                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-[#00382B] text-white text-[10px] font-bold cursor-pointer transition-colors">
                                        <Upload className="w-3.5 h-3.5" /> Upload Multiple Logos
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          className="hidden"
                                          onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length === 0) return;
                                            const currentLogos = (sec.data?.logos && Array.isArray(sec.data.logos)) ? [...sec.data.logos] : [
                                              { src: '/img/a-1.png', alt: 'Saudi Airlines' },
                                              { src: '/img/a-2.png', alt: 'Emirates' },
                                              { src: '/img/a-3.png', alt: 'Qatar Airways' },
                                              { src: '/img/a-4.png', alt: 'Turkish Airlines' },
                                              { src: '/img/a-5.png', alt: 'Etihad Airways' },
                                              { src: '/img/a-6.png', alt: 'EgyptAir' },
                                              { src: '/img/a-7.png', alt: 'Royal Jordanian' },
                                              { src: '/img/a-8.png', alt: 'Gulf Air' },
                                              { src: '/img/a-9.png', alt: 'Air Canada' },
                                            ];

                                            (async () => {
                                              for (const file of files) {
                                                const url = await uploadFileToFtp(file, 'logos');
                                                if (url) {
                                                  currentLogos.push({ src: url, alt: file.name.replace(/\.[^/.]+$/, "") });
                                                  updateSectionData(sec.id, 'logos', [...currentLogos]);
                                                }
                                              }
                                            })();
                                          }}
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentLogos = (sec.data?.logos && Array.isArray(sec.data.logos)) ? [...sec.data.logos] : [
                                            { src: '/img/a-1.png', alt: 'Saudi Airlines' },
                                            { src: '/img/a-2.png', alt: 'Emirates' },
                                            { src: '/img/a-3.png', alt: 'Qatar Airways' },
                                            { src: '/img/a-4.png', alt: 'Turkish Airlines' },
                                            { src: '/img/a-5.png', alt: 'Etihad Airways' },
                                            { src: '/img/a-6.png', alt: 'EgyptAir' },
                                            { src: '/img/a-7.png', alt: 'Royal Jordanian' },
                                            { src: '/img/a-8.png', alt: 'Gulf Air' },
                                            { src: '/img/a-9.png', alt: 'Air Canada' },
                                          ];
                                          currentLogos.push({ src: '', alt: 'New Partner' });
                                          updateSectionData(sec.id, 'logos', currentLogos);
                                        }}
                                        className="font-bold cursor-pointer text-slate-900"
                                      >
                                        + Add Logo URL
                                      </button>
                                    </div>
                                  </div>

                                  {/* Logo Cards Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                    {((sec.data?.logos && Array.isArray(sec.data.logos)) ? sec.data.logos : [
                                      { src: '/img/a-1.png', alt: 'Saudi Airlines' },
                                      { src: '/img/a-2.png', alt: 'Emirates' },
                                      { src: '/img/a-3.png', alt: 'Qatar Airways' },
                                      { src: '/img/a-4.png', alt: 'Turkish Airlines' },
                                      { src: '/img/a-5.png', alt: 'Etihad Airways' },
                                      { src: '/img/a-6.png', alt: 'EgyptAir' },
                                      { src: '/img/a-7.png', alt: 'Royal Jordanian' },
                                      { src: '/img/a-8.png', alt: 'Gulf Air' },
                                      { src: '/img/a-9.png', alt: 'Air Canada' },
                                    ]).map((logoItem: any, lIdx: number, allLogos: any[]) => (
                                      <div
                                        key={lIdx}
                                        draggable
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData('text/plain', lIdx.toString());
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                          if (isNaN(draggedIdx) || draggedIdx === lIdx) return;
                                          const updated = [...allLogos];
                                          const [reordered] = updated.splice(draggedIdx, 1);
                                          updated.splice(lIdx, 0, reordered);
                                          updateSectionData(sec.id, 'logos', updated);
                                        }}
                                        className="flex flex-col relative bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow gap-2"
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                                            ⋮⋮ LOGO #{lIdx + 1}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = allLogos.filter((_, i) => i !== lIdx);
                                              updateSectionData(sec.id, 'logos', updated);
                                            }}
                                            className="flex items-center justify-center cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                                            title="Remove logo"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        {/* Logo Upload & Preview */}
                                        <div className="w-full flex justify-center items-center py-2 bg-slate-50 rounded-md border border-slate-100">
                                          <ImageUploadWidget
                                            value={logoItem.src || ''}
                                            onChange={(url) => {
                                              const updated = [...allLogos];
                                              updated[lIdx] = { ...updated[lIdx], src: url };
                                              updateSectionData(sec.id, 'logos', updated);
                                            }}
                                            subfolder="logos"
                                            compact={true}
                                            hideManualUrl={true}
                                          />
                                        </div>

                                        {/* Alt Text Input */}
                                        <div className="mt-1">
                                          <input
                                            type="text"
                                            placeholder="Airline / Partner Name"
                                            value={logoItem.alt || ''}
                                            onChange={(e) => {
                                              const updated = [...allLogos];
                                              updated[lIdx] = { ...updated[lIdx], alt: e.target.value };
                                              updateSectionData(sec.id, 'logos', updated);
                                            }}
                                            className="w-full text-xs px-2 py-1.5 rounded-md border border-slate-200 focus:border-primary outline-none"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Certifications Flip Cards' || sec.type === 'Our Certifications') && (
                              <div className="flex flex-col gap-5 p-6 bg-white border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                  <span className="text-sm font-extrabold text-primary uppercase tracking-wide">
                                    🏅 Certifications 3D Flip Cards Manager
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-ink-lt mb-1">EYEBROW TEXT</label>
                                    <input
                                      type="text"
                                      value={sec.data?.eyebrow || 'WHY THEY MATTER'}
                                      onChange={(e) => updateSectionData(sec.id, 'eyebrow', e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-ink-lt mb-1">SECTION TITLE</label>
                                    <input
                                      type="text"
                                      value={sec.data?.title || 'OUR CERTIFICATIONS'}
                                      onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                  </div>
                                </div>

                                {/* Background Image Upload & Preview Row */}
                                <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                  <label className="block text-[10px] font-bold text-slate-500">
                                    SECTION BACKGROUND IMAGE
                                  </label>
                                  <div className="grid grid-cols-[150px_1fr] gap-6 items-center">
                                    {/* Image Live Preview */}
                                    <div className="flex items-center justify-center relative w-[150px] h-[100px] rounded-lg overflow-hidden border border-slate-300 bg-white">
                                      {sec.data?.bgImage ? (
                                        <img src={sec.data.bgImage} alt="Background preview" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-xs text-slate-400">No Image</span>
                                      )}
                                    </div>

                                    {/* Upload Button + File Input */}
                                    <div className="flex flex-col gap-3">
                                      <div className="w-full">
                                        <ImageUploadWidget
                                          value={sec.data?.bgImage || ''}
                                          onChange={(url) => updateSectionData(sec.id, 'bgImage', url)}
                                          subfolder="backgrounds"
                                        />
                                      </div>
                                      <span className="text-xs text-slate-500">Upload background image (JPG, PNG, WebP) for the section. Suggested size: 1920x800px.</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Certification Flip Cards Editor List with Drag-and-Drop & Preview */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm font-extrabold text-slate-800">
                                      Flip Cards Items ({((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : []).length})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentItems = (sec.data?.items && Array.isArray(sec.data.items)) ? [...sec.data.items] : [];
                                        currentItems.push({
                                          logo: '',
                                          title: 'New Accreditation',
                                          description: 'Add detailed certification description here.',
                                          linkUrl: ''
                                        });
                                        updateSectionData(sec.id, 'items', currentItems);
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer text-white bg-primary hover:bg-emerald-800 transition-colors shadow-sm"
                                    >
                                      + Add Certification Card
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                      { logo: '/img/tico-logo.png', title: 'TICO - Travel Industry Council of Ontario', description: 'TICO regulates travel agencies in Ontario, protecting consumer prepaid funds and ensuring compliance with strict Canadian travel industry regulations.' },
                                      { logo: '/img/iata-logo.png', title: 'IATA - International Air Transport Association', description: 'Being an IATA accredited agency allows us to work directly with airlines, offering competitive airfares, seamless ticketing, and exclusive deals.' },
                                      { logo: '/img/acta-logo.png', title: 'ACTA - Association of Canadian Travel Agencies', description: 'ACTA membership advocates for ethical travel practices and professional excellence across the Canadian travel industry.' },
                                      { logo: '/img/asta-logo.png', title: 'ASTA - American Society of Travel Advisors', description: 'ASTA certification connects us with global travel standards and verified international destination management networks.' },
                                      { logo: '/img/atac-logo.png', title: 'ATAC - Air Transportation Association of Canada', description: 'ATAC represents air transport excellence and safe aviation ticketing protocols across Canada.' },
                                      { logo: '/img/mofa-logo.png', title: 'Saudi Ministry of Foreign Affairs', description: 'Official Saudi Ministry authorization for processing Umrah, Hajj, business, and tourist visas directly from Canada.' }
                                    ]).map((item: any, cIdx: number, allCards: any[]) => (
                                      <div
                                        key={cIdx}
                                        draggable
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData('text/plain', String(cIdx));
                                          e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                                          if (isNaN(fromIndex) || fromIndex === cIdx) return;
                                          const updated = [...allCards];
                                          const [movedCard] = updated.splice(fromIndex, 1);
                                          updated.splice(cIdx, 0, movedCard);
                                          updateSectionData(sec.id, 'items', updated);
                                        }}
                                        className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors shadow-sm cursor-grab active:cursor-grabbing"
                                      >
                                        {/* Card Top Drag Handle & Delete Button */}
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1" title="Drag to reorder card">
                                            <span className="text-slate-400">⋮⋮</span> Card #{cIdx + 1}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = allCards.filter((_, i) => i !== cIdx);
                                              updateSectionData(sec.id, 'items', updated);
                                            }}
                                            className="flex items-center justify-center w-6 h-6 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                            title="Remove card"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>

                                        {/* Logo Upload & Preview */}
                                        <div className="mb-1">
                                          <label className="block text-[10px] font-bold text-ink-lt mb-1">FRONT LOGO</label>
                                          <ImageUploadWidget
                                            value={item.logo || ''}
                                            onChange={(url) => {
                                              const current = [...allCards];
                                              current[cIdx] = { ...current[cIdx], logo: url };
                                              updateSectionData(sec.id, 'items', current);
                                            }}
                                            subfolder="uploads"
                                            compact={true}
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-ink-lt mb-1">BACKSIDE TITLE</label>
                                          <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => {
                                              const current = [...allCards];
                                              current[cIdx] = { ...current[cIdx], title: e.target.value };
                                              updateSectionData(sec.id, 'items', current);
                                            }}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-ink-lt mb-1">BACKSIDE DESCRIPTION</label>
                                          <textarea
                                            rows={3}
                                            value={item.description || ''}
                                            onChange={(e) => {
                                              const current = [...allCards];
                                              current[cIdx] = { ...current[cIdx], description: e.target.value };
                                              updateSectionData(sec.id, 'items', current);
                                            }}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-y"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Flight Assistance CTA' || sec.type === 'Flight Desk CTA') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <span className="text-[11px] font-extrabold text-primary uppercase">
                                  📞 Flight Booking Assistance CTA Banner Manager
                                </span>
                                <div className="grid grid-cols-2 gap-8">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">BUTTON LABEL</label>
                                    <input
                                      type="text"
                                      value={sec.data?.btnLabel || 'Contact Flight Desk'}
                                      onChange={(e) => updateSectionData(sec.id, 'btnLabel', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">BUTTON LINK</label>
                                    <input
                                      type="text"
                                      value={sec.data?.btnLink || '/contact'}
                                      onChange={(e) => updateSectionData(sec.id, 'btnLink', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Contact Info Cards' || sec.type === 'Contact Bar') && (
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-5">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                                      <i className="fa-solid fa-map-location-dot text-sm"></i>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Contact Info Cards & Locations Manager
                                      </h4>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Configure addresses, phone lines, emails, and direct social URLs for contact cards
                                      </p>
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    3 Live Cards
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {/* Card 1: Locations Box */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3.5 hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-location-dot"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">Card 1: Locations Info</span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                                          Card Title
                                        </label>
                                        <input
                                          type="text"
                                          value={sec.data?.card1Title || 'OUR LOCATIONS'}
                                          onChange={(e) => updateSectionData(sec.id, 'card1Title', e.target.value)}
                                          placeholder="e.g. OUR LOCATIONS"
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                          Head Office Address
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={sec.data?.headAddress || '1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada'}
                                          onChange={(e) => updateSectionData(sec.id, 'headAddress', e.target.value)}
                                          placeholder="Enter head office full address..."
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                          Branch Office Address
                                        </label>
                                        <textarea
                                          rows={2}
                                          value={sec.data?.branchAddress || '22 Ontario St S, Milton, ON L9T 2M6, Canada'}
                                          onChange={(e) => updateSectionData(sec.id, 'branchAddress', e.target.value)}
                                          placeholder="Enter branch office full address..."
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 2: Support Box */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3.5 hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-phone"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">Card 2: 24/7 Phone Support</span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                                          Card Title
                                        </label>
                                        <input
                                          type="text"
                                          value={sec.data?.card2Title || '24/7 SUPPORT'}
                                          onChange={(e) => updateSectionData(sec.id, 'card2Title', e.target.value)}
                                          placeholder="e.g. 24/7 SUPPORT"
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                      </div>

                                      {/* Dynamic Support Rows Manager with Tab Switches */}
                                      <div className="flex flex-col gap-2.5">
                                        {(() => {
                                          const supportList: any[] = (sec.data?.supportItems && Array.isArray(sec.data.supportItems) && sec.data.supportItems.length > 0)
                                            ? sec.data.supportItems
                                            : [
                                              { phone: sec.data?.phone1 || '+1 800-844-5464', label: '', text: sec.data?.phone1 || '+1 800-844-5464', url: `tel:${(sec.data?.phone1 || '+18008445464').replace(/\s+/g, '')}`, openInNewTab: false },
                                              { phone: sec.data?.phone2 || '+1 905-624-8555', label: 'Reservation', text: `${sec.data?.phone2 || '+1 905-624-8555'} - Reservation`, url: `tel:${(sec.data?.phone2 || '+19056248555').replace(/\s+/g, '')}`, openInNewTab: false },
                                              { phone: sec.data?.phone3 || '+1 905-624-8344', label: 'Saudi Visa', text: `${sec.data?.phone3 || '+1 905-624-8344'} - Saudi Visa`, url: `tel:${(sec.data?.phone3 || '+19056248344').replace(/\s+/g, '')}`, openInNewTab: false },
                                            ];

                                          return supportList.map((item: any, cIdx: number) => {
                                            const isFirst = cIdx === 0;
                                            const isLast = cIdx === supportList.length - 1;

                                            return (
                                              <div key={cIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                      type="button"
                                                      disabled={isFirst}
                                                      onClick={() => {
                                                        if (isFirst) return;
                                                        const updated = [...supportList];
                                                        const temp = updated[cIdx - 1];
                                                        updated[cIdx - 1] = updated[cIdx];
                                                        updated[cIdx] = temp;
                                                        updateSectionData(sec.id, 'supportItems', updated);
                                                      }}
                                                      className={`p-1 rounded-md border border-slate-200 flex items-center justify-center transition-colors ${isFirst ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
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
                                                        const updated = [...supportList];
                                                        const temp = updated[cIdx + 1];
                                                        updated[cIdx + 1] = updated[cIdx];
                                                        updated[cIdx] = temp;
                                                        updateSectionData(sec.id, 'supportItems', updated);
                                                      }}
                                                      className={`p-1 rounded-md border border-slate-200 flex items-center justify-center transition-colors ${isLast ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs'
                                                        }`}
                                                      title="Move Down"
                                                    >
                                                      <MoveDown className="w-3 h-3" />
                                                    </button>
                                                  </div>

                                                  <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-[9px] font-bold text-slate-600">New Tab</span>
                                                      <Switch
                                                        checked={item.openInNewTab ?? false}
                                                        onChange={(val) => {
                                                          const updated = [...supportList];
                                                          updated[cIdx] = { ...updated[cIdx], openInNewTab: val };
                                                          updateSectionData(sec.id, 'supportItems', updated);
                                                        }}
                                                      />
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updated = supportList.filter((_: any, i: number) => i !== cIdx);
                                                        updateSectionData(sec.id, 'supportItems', updated);
                                                      }}
                                                      className="text-white hover:bg-red-700 bg-red-600 border-none rounded-md p-1 cursor-pointer flex items-center justify-center transition-colors"
                                                      title="Remove row"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 w-full">
                                                  <input
                                                    type="text"
                                                    placeholder="Phone / Text (e.g. +1905-624-8555)"
                                                    value={item.phone || item.text || ''}
                                                    onChange={(e) => {
                                                      const updated = [...supportList];
                                                      const phoneVal = e.target.value;
                                                      const labelVal = item.label || '';
                                                      const combined = labelVal ? `${phoneVal} - ${labelVal}` : phoneVal;

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
                                                      updateSectionData(sec.id, 'supportItems', updated);
                                                    }}
                                                    className="p-1.5 rounded border border-slate-300 text-xs font-medium bg-white"
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="Label (e.g. Reservation)"
                                                    value={item.label || ''}
                                                    onChange={(e) => {
                                                      const updated = [...supportList];
                                                      const labelVal = e.target.value;
                                                      const phoneVal = item.phone || item.text || '';
                                                      const combined = labelVal ? `${phoneVal} - ${labelVal}` : phoneVal;
                                                      updated[cIdx] = {
                                                        ...updated[cIdx],
                                                        label: labelVal,
                                                        phone: phoneVal,
                                                        text: combined
                                                      };
                                                      updateSectionData(sec.id, 'supportItems', updated);
                                                    }}
                                                    className="p-1.5 rounded border border-slate-300 text-xs font-medium bg-white"
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="Action Link (e.g. tel:+19056248555)"
                                                    value={item.url || ''}
                                                    onChange={(e) => {
                                                      const updated = [...supportList];
                                                      updated[cIdx] = { ...updated[cIdx], url: e.target.value };
                                                      updateSectionData(sec.id, 'supportItems', updated);
                                                    }}
                                                    className="p-1.5 rounded border border-slate-300 text-xs font-mono bg-white"
                                                  />
                                                </div>
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 3: Email Box */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3.5 hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-envelope"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">Card 3: Email & Socials</span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                                          Card Title
                                        </label>
                                        <input
                                          type="text"
                                          value={sec.data?.card3Title || 'EMAIL US'}
                                          onChange={(e) => updateSectionData(sec.id, 'card3Title', e.target.value)}
                                          placeholder="e.g. EMAIL US"
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                          Official Email Address
                                        </label>
                                        <input
                                          type="email"
                                          value={sec.data?.email || 'saudivisa@kingtravelcan.com'}
                                          onChange={(e) => updateSectionData(sec.id, 'email', e.target.value)}
                                          placeholder="info@kingtravelcan.com"
                                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic Social Media Links Manager (With SVG Uploaders) */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800 uppercase">
                                        📱 Social Media Profiles (With SVG Icons)
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentSocials = sec.data?.socialLinks && Array.isArray(sec.data.socialLinks)
                                          ? [...sec.data.socialLinks]
                                          : [
                                            { name: 'Facebook', url: sec.data?.facebookUrl || 'https://www.facebook.com/kingtravelcan', icon: '/img/fb.svg', openInNewTab: true },
                                            { name: 'Instagram', url: sec.data?.instagramUrl || 'https://www.instagram.com/kingtravelcan/', icon: '/img/insta.svg', openInNewTab: true },
                                            { name: 'LinkedIn', url: sec.data?.linkedinUrl || 'https://ca.linkedin.com/company/kingtravelcan', icon: '/img/in.svg', openInNewTab: true },
                                            { name: 'TikTok', url: sec.data?.tiktokUrl || 'https://www.tiktok.com/@kingtravelcan', icon: '/img/tik.svg', openInNewTab: true },
                                          ];
                                        currentSocials.push({ name: 'New Network', url: 'https://', icon: '', openInNewTab: true });
                                        updateSectionData(sec.id, 'socialLinks', currentSocials);
                                      }}
                                      className="bg-primary hover:bg-[#00382B] text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 transition-colors"
                                    >
                                      <i className="fa-solid fa-plus text-[10px]"></i> Add Social Icon
                                    </button>
                                  </div>

                                  {(() => {
                                    const socialList: any[] = (sec.data?.socialLinks && Array.isArray(sec.data.socialLinks) && sec.data.socialLinks.length > 0)
                                      ? sec.data.socialLinks
                                      : [
                                        { name: 'Facebook', url: sec.data?.facebookUrl || 'https://www.facebook.com/kingtravelcan', icon: sec.data?.facebookIcon || '/img/fb.svg', openInNewTab: true },
                                        { name: 'Instagram', url: sec.data?.instagramUrl || 'https://www.instagram.com/kingtravelcan/', icon: sec.data?.instagramIcon || '/img/insta.svg', openInNewTab: true },
                                        { name: 'LinkedIn', url: sec.data?.linkedinUrl || 'https://ca.linkedin.com/company/kingtravelcan', icon: sec.data?.linkedinIcon || '/img/in.svg', openInNewTab: true },
                                        { name: 'TikTok', url: sec.data?.tiktokUrl || 'https://www.tiktok.com/@kingtravelcan', icon: sec.data?.tiktokIcon || '/img/tik.svg', openInNewTab: true },
                                        { name: 'Twitter X', url: sec.data?.twitterUrl || 'https://twitter.com/kingtravelcan', icon: sec.data?.twitterIcon || '/img/x.svg', openInNewTab: true },
                                        { name: 'Pinterest', url: sec.data?.pinterestUrl || 'https://pinterest.com/kingtravelcan', icon: sec.data?.pinterestIcon || '/img/pinterest.svg', openInNewTab: true },
                                      ];

                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {socialList.map((item: any, sIdx: number) => (
                                          <div key={sIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                                            <div className="flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                Icon #{sIdx + 1}: {item.name || 'Social Link'}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = socialList.filter((_: any, i: number) => i !== sIdx);
                                                  updateSectionData(sec.id, 'socialLinks', updated);
                                                }}
                                                className="text-white hover:bg-red-700 bg-red-600 border-none rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition-colors"
                                                title="Remove icon"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>

                                            <div className="flex gap-3 items-center">
                                              <div className="w-10 h-10 bg-primary rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
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
                                                      const updated = [...socialList];
                                                      updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                                                      updateSectionData(sec.id, 'socialLinks', updated);
                                                    }}
                                                    className="p-1.5 rounded border border-slate-300 text-xs bg-white"
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="Target URL (https://...)"
                                                    value={item.url || ''}
                                                    onChange={(e) => {
                                                      const updated = [...socialList];
                                                      updated[sIdx] = { ...updated[sIdx], url: e.target.value };
                                                      updateSectionData(sec.id, 'socialLinks', updated);
                                                    }}
                                                    className="p-1.5 rounded border border-slate-300 text-xs font-mono bg-white"
                                                  />
                                                </div>

                                                <div className="flex gap-2 items-center justify-between">
                                                  <label className="flex bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded text-[10px] font-bold cursor-pointer gap-1.5 items-center transition-colors">
                                                    <Upload className="w-3 h-3" /> Upload SVG
                                                    <input
                                                      type="file"
                                                      accept=".svg,image/svg+xml"
                                                      className="hidden"
                                                      onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                          if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
                                                            alert('Please upload an SVG file (.svg format only).');
                                                            return;
                                                          }
                                                          const url = await uploadFileToFtp(file, 'social');
                                                          if (url) {
                                                            const updated = [...socialList];
                                                            updated[sIdx] = { ...updated[sIdx], icon: url };
                                                            updateSectionData(sec.id, 'socialLinks', updated);
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
                                                        const updated = [...socialList];
                                                        updated[sIdx] = { ...updated[sIdx], openInNewTab: val };
                                                        updateSectionData(sec.id, 'socialLinks', updated);
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}



                            {["Quote Form", "Package Inquiry Form", "Package Detail Form", "Visa Consultation Form", "Flight Booking Form", "Contact Us Form", "Drop Us A Message Form"].includes(sec.type) && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <span className="text-[11px] font-extrabold text-primary uppercase">
                                  📝 Dynamic Form Settings
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">BACKGROUND COLOR</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. #F0FAF0 or transparent"
                                      value={sec.data?.bgColor || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'bgColor', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">MAX WIDTH (e.g. 1280px)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 1280px"
                                      value={sec.data?.maxWidth || ''}
                                      onChange={(e) => updateSectionData(sec.id, 'maxWidth', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Contact Maps' || sec.type === 'Google Maps') && (
                              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 mt-1">
                                <span className="text-[11px] font-extrabold text-primary uppercase">
                                  🗺️ Dual Office Google Maps Manager
                                </span>
                                <div className="grid grid-cols-2 gap-8 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                                  {/* Head Office Map Controls */}
                                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-800">📍 Head Office Location</span>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">LOCATION TITLE</label>
                                      <input
                                        type="text"
                                        value={sec.data?.headTitle || 'Head Office'}
                                        onChange={(e) => updateSectionData(sec.id, 'headTitle', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">LOCATION ADDRESS</label>
                                      <input
                                        type="text"
                                        value={sec.data?.headAddress || '1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada'}
                                        onChange={(e) => updateSectionData(sec.id, 'headAddress', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">HEAD MAP EMBED URL</label>
                                      <input
                                        type="text"
                                        value={sec.data?.headMapUrl || ''}
                                        placeholder="https://www.google.com/maps/embed?..."
                                        onChange={(e) => updateSectionData(sec.id, 'headMapUrl', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                  </div>

                                  {/* Branch Office Map Controls */}
                                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-800">📍 Branch Office Location</span>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">LOCATION TITLE</label>
                                      <input
                                        type="text"
                                        value={sec.data?.branchTitle || 'Branch Office'}
                                        onChange={(e) => updateSectionData(sec.id, 'branchTitle', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">LOCATION ADDRESS</label>
                                      <input
                                        type="text"
                                        value={sec.data?.branchAddress || '22 Ontario St S, Milton, ON L9T 2M6, Canada'}
                                        onChange={(e) => updateSectionData(sec.id, 'branchAddress', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">BRANCH MAP EMBED URL</label>
                                      <input
                                        type="text"
                                        value={sec.data?.branchMapUrl || ''}
                                        placeholder="https://www.google.com/maps/embed?..."
                                        onChange={(e) => updateSectionData(sec.id, 'branchMapUrl', e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}





                            {(sec.type === 'Contact') && (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center text-sm font-bold shadow-xs">
                                      <i className="fa-solid fa-address-book"></i>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-bold text-white m-0">Contact &amp; Support Info Manager</h3>
                                      <p className="text-[11px] text-white m-0">Configure contact details, landlines, WhatsApp desks &amp; office addresses displayed beside the homepage form.</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-primary px-2.5 py-1 rounded-full border border-emerald-200">
                                    Homepage Contact
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {/* Group 1: Section Headings & Email */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-heading"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">1. Section Headings &amp; Email</span>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                        Eyebrow Tag
                                      </label>
                                      <input
                                        type="text"
                                        value={sec.data?.eyebrow !== undefined ? sec.data.eyebrow : 'GET IN TOUCH'}
                                        onChange={(e) => updateSectionData(sec.id, 'eyebrow', e.target.value)}
                                        placeholder="e.g. GET IN TOUCH"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                        Main Section Title
                                      </label>
                                      <input
                                        type="text"
                                        value={sec.data?.title !== undefined ? sec.data.title : 'Drop Us A Message'}
                                        onChange={(e) => updateSectionData(sec.id, 'title', e.target.value)}
                                        placeholder="e.g. Drop Us A Message"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                      />
                                    </div>

                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                                          General Support Email
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-bold text-slate-500">New Tab</span>
                                          <Switch
                                            checked={sec.data?.emailNewTab ?? true}
                                            onChange={(val) => updateSectionData(sec.id, 'emailNewTab', val)}
                                          />
                                        </div>
                                      </div>
                                      <input
                                        type="email"
                                        value={sec.data?.email !== undefined ? sec.data.email : 'info@kingtravelcan.com'}
                                        onChange={(e) => updateSectionData(sec.id, 'email', e.target.value)}
                                        placeholder="info@kingtravelcan.com"
                                        className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-slate-800 outline-none bg-white focus:border-primary"
                                      />
                                    </div>

                                    {/* <div>
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                        Office Hours
                                      </label>
                                      <input
                                        type="text"
                                        value={sec.data?.officeHours !== undefined ? sec.data.officeHours : 'Mon–Sat, 9am – 7pm EST'}
                                        onChange={(e) => updateSectionData(sec.id, 'officeHours', e.target.value)}
                                        placeholder="Mon–Sat, 9am – 7pm EST"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                      />
                                    </div> */}
                                  </div>

                                  {/* Group 2: Landlines & WhatsApp (Dynamic Lists) */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-phone"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">2. Landlines &amp; WhatsApp Links</span>
                                    </div>

                                    {/* Sub-section A: Landlines List */}
                                    <div className="flex flex-col gap-2.5">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                          <i className="fa-solid fa-phone-volume text-primary"></i> Landlines
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentList: any[] = (sec.data?.landlines && Array.isArray(sec.data.landlines))
                                              ? [...sec.data.landlines]
                                              : [
                                                { number: sec.data?.tollFree || '+1 800 844 5464', label: 'Toll Free / Main', openInNewTab: sec.data?.tollFreeNewTab ?? true },
                                                { number: sec.data?.localNum1 || '+1 905-624-8555', label: 'Local Line 2', openInNewTab: sec.data?.localNum1NewTab ?? true },
                                              ];
                                            currentList.push({ number: '', label: '', openInNewTab: true });
                                            updateSectionData(sec.id, 'landlines', currentList);
                                          }}
                                          className="text-[10px] font-bold bg-primary hover:bg-[#00382B] text-white px-2.5 py-1 rounded-md border-none cursor-pointer flex items-center gap-1 transition-colors"
                                        >
                                          <i className="fa-solid fa-plus text-[9px]"></i> Add Landline
                                        </button>
                                      </div>

                                      {(() => {
                                        const landlinesList: any[] = (sec.data?.landlines && Array.isArray(sec.data.landlines) && sec.data.landlines.length > 0)
                                          ? sec.data.landlines
                                          : [
                                            { number: sec.data?.tollFree !== undefined ? sec.data.tollFree : '+1 800 844 5464', label: 'Toll Free / Main', openInNewTab: sec.data?.tollFreeNewTab ?? true },
                                            { number: sec.data?.localNum1 !== undefined ? sec.data.localNum1 : '+1 905-624-8555', label: 'Local Line 2', openInNewTab: sec.data?.localNum1NewTab ?? true },
                                          ];

                                        return (
                                          <div className="flex flex-col gap-2">
                                            {landlinesList.map((item: any, lIdx: number) => (
                                              <div key={lIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                                                    Landline #{lIdx + 1}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-[9px] font-bold text-slate-500">New Tab</span>
                                                      <Switch
                                                        checked={item.openInNewTab ?? true}
                                                        onChange={(val) => {
                                                          const updated = [...landlinesList];
                                                          updated[lIdx] = { ...updated[lIdx], openInNewTab: val };
                                                          updateSectionData(sec.id, 'landlines', updated);
                                                        }}
                                                      />
                                                    </div>
                                                    {landlinesList.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updated = landlinesList.filter((_: any, i: number) => i !== lIdx);
                                                          updateSectionData(sec.id, 'landlines', updated);
                                                        }}
                                                        className="text-white hover:bg-red-700 bg-red-600 border-none rounded p-1 cursor-pointer flex items-center justify-center transition-colors"
                                                        title="Remove Landline"
                                                      >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <input
                                                    type="text"
                                                    value={item.number || ''}
                                                    onChange={(e) => {
                                                      const updated = [...landlinesList];
                                                      updated[lIdx] = { ...updated[lIdx], number: e.target.value };
                                                      updateSectionData(sec.id, 'landlines', updated);
                                                    }}
                                                    placeholder="Number (e.g. +1 800 844 5464)"
                                                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-slate-800 outline-none bg-white focus:border-primary"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={item.label || ''}
                                                    onChange={(e) => {
                                                      const updated = [...landlinesList];
                                                      updated[lIdx] = { ...updated[lIdx], label: e.target.value };
                                                      updateSectionData(sec.id, 'landlines', updated);
                                                    }}
                                                    placeholder="Label (e.g. Toll Free / Main)"
                                                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 outline-none bg-white focus:border-primary"
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {/* Sub-section B: WhatsApp Numbers List */}
                                    <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                          <i className="fa-brands fa-whatsapp text-primary"></i> WhatsApp Numbers
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentList: any[] = (sec.data?.whatsappList && Array.isArray(sec.data.whatsappList))
                                              ? [...sec.data.whatsappList]
                                              : [
                                                { number: sec.data?.waReservation || '905-624-8555', label: sec.data?.waReservationLabel || 'Reservation', openInNewTab: sec.data?.waReservationNewTab ?? true },
                                                { number: sec.data?.waVisa || '647-982-8555', label: sec.data?.waVisaLabel || 'Saudi Visa', openInNewTab: sec.data?.waVisaNewTab ?? true },
                                              ];
                                            currentList.push({ number: '', label: '', openInNewTab: true });
                                            updateSectionData(sec.id, 'whatsappList', currentList);
                                          }}
                                          className="text-[10px] font-bold bg-primary hover:bg-[#00382B] text-white px-2.5 py-1 rounded-md border-none cursor-pointer flex items-center gap-1 transition-colors"
                                        >
                                          <i className="fa-solid fa-plus text-[9px]"></i> Add WhatsApp
                                        </button>
                                      </div>

                                      {(() => {
                                        const waList: any[] = (sec.data?.whatsappList && Array.isArray(sec.data.whatsappList) && sec.data.whatsappList.length > 0)
                                          ? sec.data.whatsappList
                                          : [
                                            { number: sec.data?.waReservation !== undefined ? sec.data.waReservation : '905-624-8555', label: sec.data?.waReservationLabel !== undefined ? sec.data.waReservationLabel : 'Reservation', openInNewTab: sec.data?.waReservationNewTab ?? true },
                                            { number: sec.data?.waVisa !== undefined ? sec.data.waVisa : '647-982-8555', label: sec.data?.waVisaLabel !== undefined ? sec.data.waVisaLabel : 'Saudi Visa', openInNewTab: sec.data?.waVisaNewTab ?? true },
                                          ];

                                        return (
                                          <div className="flex flex-col gap-2">
                                            {waList.map((item: any, wIdx: number) => (
                                              <div key={wIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                                                    WhatsApp #{wIdx + 1}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-[9px] font-bold text-slate-500">New Tab</span>
                                                      <Switch
                                                        checked={item.openInNewTab ?? true}
                                                        onChange={(val) => {
                                                          const updated = [...waList];
                                                          updated[wIdx] = { ...updated[wIdx], openInNewTab: val };
                                                          updateSectionData(sec.id, 'whatsappList', updated);
                                                        }}
                                                      />
                                                    </div>
                                                    {waList.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updated = waList.filter((_: any, i: number) => i !== wIdx);
                                                          updateSectionData(sec.id, 'whatsappList', updated);
                                                        }}
                                                        className="text-white hover:bg-red-700 bg-red-600 border-none rounded p-1 cursor-pointer flex items-center justify-center transition-colors"
                                                        title="Remove WhatsApp"
                                                      >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <input
                                                    type="text"
                                                    placeholder="Number (e.g. 905-624-8555)"
                                                    value={item.number || ''}
                                                    onChange={(e) => {
                                                      const updated = [...waList];
                                                      updated[wIdx] = { ...updated[wIdx], number: e.target.value };
                                                      updateSectionData(sec.id, 'whatsappList', updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-slate-800 outline-none bg-white focus:border-primary"
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="Label (e.g. Reservation)"
                                                    value={item.label || ''}
                                                    onChange={(e) => {
                                                      const updated = [...waList];
                                                      updated[wIdx] = { ...updated[wIdx], label: e.target.value };
                                                      updateSectionData(sec.id, 'whatsappList', updated);
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 outline-none bg-white focus:border-primary"
                                                  />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Group 3: Office Addresses */}
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-primary flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-location-dot"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">3. Physical Office Locations</span>
                                    </div>

                                    {/* Head Office */}
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                                          Head Office Address
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-bold text-slate-500">New Tab</span>
                                          <Switch
                                            checked={sec.data?.headOfficeNewTab ?? true}
                                            onChange={(val) => updateSectionData(sec.id, 'headOfficeNewTab', val)}
                                          />
                                        </div>
                                      </div>
                                      <textarea
                                        value={sec.data?.headOffice !== undefined ? sec.data.headOffice : '1325 Eglinton Ave E Suite Number 218,\nMississauga, ON L4W 4L9, Canada'}
                                        onChange={(e) => updateSectionData(sec.id, 'headOffice', e.target.value)}
                                        placeholder="1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, Canada"
                                        rows={2}
                                        className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs leading-relaxed text-slate-800 outline-none bg-white focus:border-primary"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Google Maps URL (Optional: https://maps.app.goo.gl/...)"
                                        value={sec.data?.headOfficeMapUrl !== undefined ? sec.data.headOfficeMapUrl : 'https://maps.app.goo.gl/1BRUoBxtt4wWw58t6'}
                                        onChange={(e) => updateSectionData(sec.id, 'headOfficeMapUrl', e.target.value)}
                                        className="w-full px-2.5 py-1 rounded-md border border-slate-300 text-[11px] font-mono text-slate-700 outline-none bg-white focus:border-primary"
                                      />
                                    </div>

                                    {/* Branch Office */}
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                                          Branch Office Address
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-bold text-slate-500">New Tab</span>
                                          <Switch
                                            checked={sec.data?.branchOfficeNewTab ?? true}
                                            onChange={(val) => updateSectionData(sec.id, 'branchOfficeNewTab', val)}
                                          />
                                        </div>
                                      </div>
                                      <textarea
                                        value={sec.data?.branchOffice !== undefined ? sec.data.branchOffice : '22 Ontario St S,\nMilton, ON L9T 2M6, Canada'}
                                        onChange={(e) => updateSectionData(sec.id, 'branchOffice', e.target.value)}
                                        placeholder="22 Ontario St S, Milton, ON L9T 2M6, Canada"
                                        rows={2}
                                        className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs leading-relaxed text-slate-800 outline-none bg-white focus:border-primary"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Google Maps URL (Optional: https://maps.app.goo.gl/...)"
                                        value={sec.data?.branchOfficeMapUrl !== undefined ? sec.data.branchOfficeMapUrl : 'https://maps.app.goo.gl/U6B4fci2Jas4sh6S6'}
                                        onChange={(e) => updateSectionData(sec.id, 'branchOfficeMapUrl', e.target.value)}
                                        className="w-full px-2.5 py-1 rounded-md border border-slate-300 text-[11px] font-mono text-slate-700 outline-none bg-white focus:border-primary"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {(sec.type === 'Testimonials') && (
                              <div className="flex flex-col bg-white">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="text-xs font-bold text-slate-800">
                                    ⭐ TESTIMONIALS MANAGER
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentReviews = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [])];
                                      currentReviews.push({
                                        id: Date.now(),
                                        name: "New Reviewer",
                                        time: "Just now",
                                        avatar: "/img/round-logo.png",
                                        text: "Enter review text here..."
                                      });
                                      updateSectionData(sec.id, 'items', currentReviews);
                                    }}
                                    className="font-extrabold cursor-pointer"
                                  >
                                    + Add Review
                                  </button>
                                </div>

                                <div className="mb-6">
                                  <label className="block text-[9px] font-bold text-slate-500 mb-0.5">AUTOPLAY SPEED (MILLISECONDS)</label>
                                  <input
                                    type="number"
                                    value={sec.data?.autoplaySpeed || 3500}
                                    onChange={(e) => updateSectionData(sec.id, 'autoplaySpeed', e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                    min="1000"
                                    step="500"
                                  />
                                </div>

                                {((sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0) ? sec.data.items : [
                                  { id: 1, name: "Sample Name", time: "3 months ago", avatar: "/img/tamim.png", text: "Amazing experience..." }
                                ]).map((review: any, rIdx: number) => (
                                  <div key={review.id || rIdx} className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex flex-col gap-2 relative mt-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-extrabold text-slate-500">REVIEW #{rIdx + 1}</span>
                                      <button
                                        onClick={() => {
                                          const reviews = [...(sec.data?.items || [])];
                                          reviews.splice(rIdx, 1);
                                          updateSectionData(sec.id, 'items', reviews);
                                        }}
                                        className="border-0 bg-red-100 text-red-600 rounded p-2 text-xs cursor-pointer hover:bg-red-200 transition-colors flex items-center gap-1 font-semibold"
                                        title="Remove Review"
                                      >
                                        <Trash2 className="w-3 h-3" /> Remove
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">REVIEWER NAME</label>
                                        <input
                                          type="text"
                                          value={review.name || ''}
                                          onChange={(e) => {
                                            const reviews = [...(sec.data?.items || [])];
                                            reviews[rIdx] = { ...reviews[rIdx], name: e.target.value };
                                            updateSectionData(sec.id, 'items', reviews);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">TIME AGO</label>
                                        <input
                                          type="text"
                                          value={review.time || ''}
                                          onChange={(e) => {
                                            const reviews = [...(sec.data?.items || [])];
                                            reviews[rIdx] = { ...reviews[rIdx], time: e.target.value };
                                            updateSectionData(sec.id, 'items', reviews);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">AVATAR URL</label>
                                      <input
                                        type="text"
                                        value={review.avatar || ''}
                                        onChange={(e) => {
                                          const reviews = [...(sec.data?.items || [])];
                                          reviews[rIdx] = { ...reviews[rIdx], avatar: e.target.value };
                                          updateSectionData(sec.id, 'items', reviews);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                    <div className="mt-2">
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">REVIEW TEXT</label>
                                      <textarea
                                        rows={3}
                                        value={review.text || ''}
                                        onChange={(e) => {
                                          const reviews = [...(sec.data?.items || [])];
                                          reviews[rIdx] = { ...reviews[rIdx], text: e.target.value };
                                          updateSectionData(sec.id, 'items', reviews);
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-[11px]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}



                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'richtext' && (
                <div>
                  <textarea
                    value={richText || ''}
                    onChange={(e) => setRichText(e.target.value)}
                    placeholder="Enter rich text page content here..."
                    rows={10}
                    className="w-full"
                  />
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Meta Information</h3>
                    <div>
                      <label className="block font-extrabold text-slate-500 text-xs mb-1">META TITLE</label>
                      <input type="text" value={metaTitle || ''} onChange={(e) => setMetaTitle(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-500 text-xs mb-1">META DESCRIPTION</label>
                      <textarea rows={3} value={metaDescription || ''} onChange={(e) => setMetaDescription(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-primary" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Sitemap & Indexing Settings</h3>
                    <SeoSettingsForm data={seoSettings} onChange={setSeoSettings} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Settings */}
        <div className="flex flex-col gap-5">
          {/* Status & Visibility Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">PAGE STATUS</span>
                <span className="text-[11px] text-white">Visibility on live website</span>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer shadow-2xs"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Show in menu</span>
                <span className="text-[11px] text-white font-medium">Include link in site header nav</span>
              </div>
              <Field orientation="horizontal">
                <Switch id="switch-show-in-menu" checked={showInMenu} onChange={setShowInMenu} />
              </Field>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span>⏱</span>
              <span>Auto-saves draft state dynamically</span>
            </div>
          </div>
        </div>

      </div>
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      <AdminPackageDetailModal
        isOpen={!!activeDetailPopupModal}
        onClose={() => setActiveDetailPopupModal(null)}
        pkg={activeDetailPopupModal?.pkg}
        onSave={(updatedPkg) => {
          if (!activeDetailPopupModal) return;
          const { secId, pIdx } = activeDetailPopupModal;
          const sec = sections.find((s) => s.id === secId);
          if (sec) {
            const pkgs = [...((sec.data?.items && Array.isArray(sec.data.items)) ? sec.data.items : [])];
            pkgs[pIdx] = updatedPkg;
            updateSectionData(secId, 'items', pkgs);
          }
        }}
      />
      <SeoCenterModal
        isOpen={seoModalOpen}
        onClose={() => setSeoModalOpen(false)}
        pageData={{
          id: pageId || 1,
          title: title || 'Page',
          slug: slug || '/',
          metaTitle,
          metaDescription,
          bannerBgImage,
          sections,
        }}
        onSaveSuccess={() => {
          if (pageId) {
            getPageById(pageId).then((p) => {
              if (p) {
                if (p.metaTitle) setMetaTitle(p.metaTitle);
                if (p.metaDescription) setMetaDescription(p.metaDescription);
              }
            });
          }
        }}
      />
    </div>
  );
}

export default function PageBuilderPage() {
  return (
    <AdminLayout user={{ name: 'Admin', role: 'super_admin' }}>
      <Suspense fallback={<div className="font-sans">Loading Page Editor...</div>}>
        <PageBuilderContent />
      </Suspense>
    </AdminLayout>
  );
}
