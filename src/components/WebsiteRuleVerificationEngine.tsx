import React, { useState, useRef } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Palette,
  FileText,
  RefreshCw,
  Loader2,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
  Info,
  Scale,
  ShieldAlert,
  ChevronDown,
  Layers,
  UploadCloud,
  Image as ImageIcon,
  Copy,
  AlertCircle,
  ChevronRight,
  Clock,
  BookOpen,
  Building2,
  Play,
  Megaphone,
  Tag,
  Shield,
  FileSpreadsheet,
  ArrowLeft,
  Lightbulb,
  Hourglass,
  CheckSquare
} from 'lucide-react';
import {
  BrandProfile,
  BrandDnaProfile,
  ExtractedBrandIntelligenceItem,
  DiscoveredWebPage,
  WebsiteRuleCategory,
  ContentVerificationReport
} from '../types.ts';

export interface WebsiteRuleVerificationEngineProps {
  activeBrand: BrandProfile;
  workingDna: BrandDnaProfile;
  setWorkingDna: React.Dispatch<React.SetStateAction<BrandDnaProfile | null>>;
  extractedItems: ExtractedBrandIntelligenceItem[];
  setExtractedItems: React.Dispatch<React.SetStateAction<ExtractedBrandIntelligenceItem[]>>;
  crawledPages: DiscoveredWebPage[];
  websiteUrl: string;
  handleRescanWebsite: () => Promise<void>;
  isRescanningWebsite: boolean;
  onSelectWebsiteUrl?: (url: string) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export const ALL_RULE_CATEGORIES: WebsiteRuleCategory[] = [
  'Brand Guidelines',
  'Content Policies',
  'Advertising Guidelines',
  'Logo & Visual Identity Rules',
  'Product Representation Guidelines',
  'Pricing & Promotional Restrictions',
  'Copyright & Trademark Policies',
  'Claims & Endorsement Restrictions',
  'Regulatory & Compliance Requirements',
  'Platform Publishing Rules',
  'Terms & Conditions',
  'Privacy Policy',
  'Refund & Cancellation',
  'Product & Service Rules',
  'Pricing & Payment',
  'Marketing & Communication',
  'Disclaimers',
  'Other Rules'
];

const QUICK_RULE_SETS = [
  { name: 'YouTube', domain: 'youtube.com', url: 'https://www.youtube.com' },
  { name: 'Amazon', domain: 'amazon.in', url: 'https://www.amazon.in' },
  { name: 'Flipkart', domain: 'flipkart.com', url: 'https://www.flipkart.com' },
  { name: 'Coca-Cola', domain: 'coca-cola.com', url: 'https://www.coca-cola.com' },
  { name: 'Nike', domain: 'nike.com', url: 'https://www.nike.com' },
  { name: 'FSSAI', domain: 'fssai.gov.in', url: 'https://www.fssai.gov.in' },
  { name: 'Instagram', domain: 'instagram.com', url: 'https://www.instagram.com' }
];

function inferDomainFromUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./i, '');
  } catch {
    return rawUrl || 'website.com';
  }
}

function formatDateTime(isoStr?: string): string {
  if (!isoStr) return new Date().toLocaleString();
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '642 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Generate a crisp 16:9 canvas PNG data URL for sample thumbnails so "Upload File" tab shows a real visual preview
function createSampleThumbnailDataUrl(opts: {
  variant: 'off_policy' | 'needs_review' | 'compliant';
  websiteName: string;
  headline: string;
  subline: string;
  badgeText: string;
}): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    if (opts.variant === 'off_policy') {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.55, '#7f1d1d');
      grad.addColorStop(1, '#dc2626');
    } else if (opts.variant === 'needs_review') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.6, '#78350f');
      grad.addColorStop(1, '#d97706');
    } else {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.6, '#1e3a8a');
      grad.addColorStop(1, '#059669');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative grid / frame
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 1208, 648);

    // Top badge
    ctx.fillStyle =
      opts.variant === 'off_policy'
        ? '#facc15'
        : opts.variant === 'needs_review'
        ? '#fbbf24'
        : '#34d399';
    ctx.beginPath();
    ctx.roundRect(72, 72, 460, 64, 14);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(opts.badgeText.toUpperCase(), 96, 114);

    // Main Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 62px sans-serif';
    const words = opts.headline.split(' ');
    let line = '';
    let y = 240;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > 1080) {
        ctx.fillText(line, 72, y);
        line = w;
        y += 78;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, 72, y);
      y += 78;
    }

    // Subline box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.beginPath();
    ctx.roundRect(72, Math.max(y + 10, 440), 1136, 140, 18);
    ctx.fill();

    ctx.fillStyle = opts.variant === 'off_policy' ? '#fca5a5' : opts.variant === 'needs_review' ? '#fde68a' : '#a7f3d0';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(opts.subline.slice(0, 64), 104, Math.max(y + 68, 498));

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px sans-serif';
    ctx.fillText(
      `Target Platform: ${opts.websiteName} · 1280x720 HD Thumbnail Preview`,
      104,
      Math.max(y + 116, 548)
    );

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export function WebsiteBrandBadgeIcon({
  domain,
  name,
  size = 'md'
}: {
  domain: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dom = domain.toLowerCase();
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8';

  if (dom.includes('youtube')) {
    return (
      <div
        className={`${dim} rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs`}
      >
        <Play className={size === 'sm' ? 'w-3 h-3 fill-white' : 'w-4 h-4 fill-white'} />
      </div>
    );
  }
  if (dom.includes('amazon')) {
    return (
      <div
        className={`${dim} rounded-lg bg-slate-900 text-amber-400 font-black flex items-center justify-center shrink-0 shadow-2xs text-sm`}
      >
        a
      </div>
    );
  }
  if (dom.includes('flipkart')) {
    return (
      <div
        className={`${dim} rounded-lg bg-amber-400 text-blue-700 font-black italic flex items-center justify-center shrink-0 shadow-2xs text-sm`}
      >
        f
      </div>
    );
  }
  if (dom.includes('coca-cola')) {
    return (
      <div
        className={`${dim} rounded-lg bg-red-600 text-white font-serif font-bold flex items-center justify-center shrink-0 shadow-2xs text-xs`}
      >
        CC
      </div>
    );
  }
  if (dom.includes('nike')) {
    return (
      <div
        className={`${dim} rounded-lg bg-slate-900 text-white font-black italic flex items-center justify-center shrink-0 shadow-2xs text-xs`}
      >
        ✓
      </div>
    );
  }
  if (dom.includes('fssai') || dom.includes('gov')) {
    return (
      <div
        className={`${dim} rounded-lg bg-blue-900 text-amber-300 font-bold flex items-center justify-center shrink-0 shadow-2xs text-[10px]`}
      >
        GOV
      </div>
    );
  }
  return (
    <div
      className={`${dim} rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs text-xs`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function WebsiteRuleVerificationEngine({
  activeBrand,
  workingDna,
  setWorkingDna,
  extractedItems,
  crawledPages,
  websiteUrl,
  handleRescanWebsite,
  isRescanningWebsite,
  onSelectWebsiteUrl,
  triggerToast
}: WebsiteRuleVerificationEngineProps) {
  // Category & Search Filters for Extracted Rules Dashboard
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRuleIds, setExpandedRuleIds] = useState<Set<string>>(new Set());
  const [showVisualTokensDrawer, setShowVisualTokensDrawer] = useState<boolean>(false);
  const [showAllSourcesSection, setShowAllSourcesSection] = useState<boolean>(false);

  // Upload Content & Verify State
  const [contentInputMode, setContentInputMode] = useState<'file' | 'text'>('file');
  const [contentTitle, setContentTitle] = useState<string>('Dramatic Exam Hacking Thumbnail');
  const [pastedText, setPastedText] = useState<string>('');
  const [creativeFileName, setCreativeFileName] = useState<string>('');
  const [creativeFileSize, setCreativeFileSize] = useState<number>(0);
  const [creativeBase64, setCreativeBase64] = useState<string>('');
  const [creativePreviewUrl, setCreativePreviewUrl] = useState<string>('');
  const [creativeContentType, setCreativeContentType] = useState<'image' | 'text' | 'document'>('image');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isVerifyingContent, setIsVerifyingContent] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Verification Report State
  const [verificationReport, setVerificationReport] = useState<ContentVerificationReport | null>(
    workingDna.latestVerificationReport || null
  );
  const [copiedFindingId, setCopiedFindingId] = useState<string | null>(null);
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [expandedFindingIds, setExpandedFindingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleExpandFinding = (id: string) => {
    setExpandedFindingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  React.useEffect(() => {
    if (workingDna.latestVerificationReport) {
      setVerificationReport(workingDna.latestVerificationReport);
    } else {
      setVerificationReport(null);
    }
  }, [workingDna.id, workingDna.analyzedAt, workingDna.latestVerificationReport]);

  // Derived Extraction Summary Metadata
  const effectiveSourceUrl = workingDna.sourceUrl || websiteUrl || activeBrand.website || 'https://www.youtube.com';
  const detectedWebsiteDomain =
    workingDna.websiteDomain ||
    extractedItems[0]?.sourceDomain ||
    inferDomainFromUrl(effectiveSourceUrl);
  const detectedWebsiteName =
    workingDna.detectedWebsiteName ||
    extractedItems[0]?.sourceWebsite ||
    workingDna.brandName ||
    activeBrand.name;
  const accessibleSources = crawledPages.filter(p => p.status === 'crawled');
  const restrictedSources = crawledPages.filter(p => p.status === 'inaccessible');
  const sourcesAccessedCount =
    workingDna.sourcesAccessedCount ??
    (accessibleSources.length > 0
      ? accessibleSources.length
      : Math.max(1, new Set(extractedItems.map(i => i.sourceUrl || i.originalWebsiteUrl)).size));

  // Helper: Toggle verbatim source text accordion
  const handleToggleExpandRule = (id: string) => {
    setExpandedRuleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Helper: Normalize category for an item
  const getItemCategory = (item: ExtractedBrandIntelligenceItem): WebsiteRuleCategory => {
    if (item.ruleCategory && ALL_RULE_CATEGORIES.includes(item.ruleCategory as WebsiteRuleCategory)) {
      return item.ruleCategory as WebsiteRuleCategory;
    }
    const cat = String(item.ruleCategory || item.category || item.subCategory || '').toLowerCase();
    if (cat.includes('logo') || cat.includes('visual identity') || cat.includes('swoosh') || cat.includes('glyph')) return 'Logo & Visual Identity Rules';
    if (cat.includes('brand guideline') || cat.includes('brand resource')) return 'Brand Guidelines';
    if (cat.includes('content polic') || cat.includes('community guideline')) return 'Content Policies';
    if (cat.includes('advertis') || cat.includes('ad standard') || cat.includes('responsible marketing')) return 'Advertising Guidelines';
    if (cat.includes('product representation') || cat.includes('product detail') || cat.includes('listing')) return 'Product Representation Guidelines';
    if (cat.includes('pricing') || cat.includes('promo') || cat.includes('discount') || cat.includes('payment')) return 'Pricing & Promotional Restrictions';
    if (cat.includes('copyright') || cat.includes('trademark') || cat.includes('intellectual property')) return 'Copyright & Trademark Policies';
    if (cat.includes('claim') || cat.includes('endorse') || cat.includes('review') || cat.includes('partnership')) return 'Claims & Endorsement Restrictions';
    if (cat.includes('regulatory') || cat.includes('compliance') || cat.includes('statutory') || cat.includes('emblem')) return 'Regulatory & Compliance Requirements';
    if (cat.includes('publishing') || cat.includes('contest') || cat.includes('monetiz')) return 'Platform Publishing Rules';
    if (cat.includes('refund') || cat.includes('cancellation') || cat.includes('return')) return 'Refund & Cancellation';
    if (cat.includes('privacy') || cat.includes('data protection') || cat.includes('gdpr')) return 'Privacy Policy';
    if (cat.includes('terms') || cat.includes('tos') || cat.includes('conditions')) return 'Terms & Conditions';
    if (cat.includes('product') || cat.includes('service')) return 'Product & Service Rules';
    if (cat.includes('disclaimer') || cat.includes('liability')) return 'Disclaimers';
    if (cat.includes('marketing') || cat.includes('communication')) return 'Marketing & Communication';
    return 'Other Rules';
  };

  // Filter extracted rules by category and search
  const filteredRules = extractedItems.filter(item => {
    const itemCat = getItemCategory(item);
    if (selectedCategory !== 'all' && itemCat !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = (item.ruleDescription || item.simplifiedExplanation || item.aiExplanation || '').toLowerCase().includes(q);
      const textMatch = (item.originalWebsiteText || item.originalExtractedText || '').toLowerCase().includes(q);
      const sourceMatch = (item.sourcePageTitle || '').toLowerCase().includes(q) || (item.sourceWebsite || '').toLowerCase().includes(q);
      const sectionMatch = (item.sectionHeading || item.sourceDocDetails?.sectionTitle || '').toLowerCase().includes(q);
      const urlMatch = (item.sourceUrl || item.originalWebsiteUrl || '').toLowerCase().includes(q);
      const patternMatch = item.structuredRule?.targetPatterns?.some(p => p.toLowerCase().includes(q));
      return titleMatch || descMatch || textMatch || sourceMatch || sectionMatch || urlMatch || patternMatch;
    }
    return true;
  });

  // Category counts
  const categoryCounts = ALL_RULE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = extractedItems.filter(i => getItemCategory(i) === cat).length;
    return acc;
  }, {} as Record<WebsiteRuleCategory, number>);

  const visibleCategories = ALL_RULE_CATEGORIES.filter(cat => (categoryCounts[cat] || 0) > 0);

  // Short label helper for category tabs
  const formatShortCategoryLabel = (cat: WebsiteRuleCategory): string => {
    switch (cat) {
      case 'Content Policies':
        return 'Content';
      case 'Advertising Guidelines':
        return 'Advertising';
      case 'Logo & Visual Identity Rules':
        return 'Logo & Brand';
      case 'Pricing & Promotional Restrictions':
      case 'Platform Publishing Rules':
        return 'Promotion';
      case 'Claims & Endorsement Restrictions':
        return 'Claims & Endorsements';
      case 'Copyright & Trademark Policies':
        return 'Copyright & IP';
      case 'Regulatory & Compliance Requirements':
        return 'Regulatory';
      default:
        return cat;
    }
  };

  // Handle creative file upload (Click or Drag & Drop)
  const handleCreativeFileSelected = (file?: File) => {
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      triggerToast('File exceeds 12 MB limit. Please select a smaller file.', 'error');
      return;
    }

    const name = file.name;
    setCreativeFileName(name);
    setCreativeFileSize(file.size);
    setContentTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    const isImg = file.type.startsWith('image/');
    const isDoc =
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      file.type.includes('word') ||
      name.endsWith('.pdf') ||
      file.type === 'application/pdf';

    if (isImg) {
      setCreativeContentType('image');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCreativeBase64(result);
        setCreativePreviewUrl(result);
        triggerToast(`Loaded image creative: ${name}`, 'info');
      };
      reader.readAsDataURL(file);
    } else if (isDoc) {
      setCreativeContentType('document');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCreativeBase64(result);
        setCreativePreviewUrl('');
        triggerToast(`Loaded document: ${name}`, 'info');
      };
      reader.readAsDataURL(file);
    } else {
      setCreativeContentType('text');
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setPastedText(text);
        setContentInputMode('text');
        triggerToast(`Extracted text from: ${name}`, 'info');
      };
      reader.readAsText(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCreativeFileSelected(file);
    }
  };

  // Domain-aware sample content loader that populates BOTH a visual thumbnail preview (for Upload File tab) AND text metadata
  const handleLoadSampleContent = (type: 'off_policy' | 'needs_review' | 'compliant') => {
    const dom = detectedWebsiteDomain.toLowerCase();

    if (dom.includes('youtube')) {
      if (type === 'off_policy') {
        const title = 'Dramatic Exam Hacking Thumbnail';
        const text = `🔥 EARN $10,000 IN 24 HOURS ON YOUTUBE! (100% WORKING EXAM & REVENUE HACK!)
Thumbnail Visual Elements:
- Large yellow/red text overlay: "GAIN 100K SUBSCRIBERS OVERNIGHT — GUARANTEED!"
- Doctored analytics screenshot showing $48,500 daily revenue with red arrow pointing to a fake "Instant Monetization" button
- Modified Blue YouTube Icon & Fake Verification Badge next to "Officially Endorsed by YouTube"
- Free Cash Giveaway Click Here — secret paid review with undisclosed sponsorship!`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'off_policy',
          websiteName: 'YouTube',
          headline: 'HACK ANY EXAM & EARN $10,000 IN 24 HOURS GUARANTEED!',
          subline: '100% Working Secret Trick · Officially Verified by YouTube',
          badgeText: '⚠ Misleading Claim + Fake Badge'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Dramatic_Exam_Hacking_Thumbnail.png');
        setCreativeFileSize(658432);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else if (type === 'needs_review') {
        const title = 'YouTube Sensational Thumbnail — Unverified 30-Day Challenge Claim';
        const text = `😱 I TRIED THIS NEW STUDY WORKFLOW FOR 30 DAYS... SHOCKING RESULTS!!
Thumbnail Visual Elements:
- Dramatic split-screen comparison ("Day 1 vs Day 30") with red arrow pointing to a blurred score chart
- Headline overlay: "HOW I DOUBLED MY OUTPUT IN 30 DAYS?!"
- Note: Video transcript / substantiation context is not attached to this standalone thumbnail upload.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'needs_review',
          websiteName: 'YouTube',
          headline: 'I TRIED THIS FOR 30 DAYS... SHOCKING RESULTS?!',
          subline: 'Day 1 vs Day 30 Comparison · Video Context Not Attached',
          badgeText: 'Unverified Context Sample'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Sensational_30Day_Challenge_Thumbnail.png');
        setCreativeFileSize(512800);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else {
        const title = 'YouTube Creator Integration — Compliant Campaign';
        const text = `Watch our latest tech breakdown on YouTube!
Includes paid promotion: This video is sponsored by Acme Audio (Paid promotion disclosure box enabled in YouTube Studio).
Uses 100% original licensed audio tracks and displays the unmodified official YouTube Red (#FF0000) play icon with required minimum clear space.
Official Contest Rules linked in description: YouTube is not a sponsor of this promotion and is released from all liability.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'compliant',
          websiteName: 'YouTube',
          headline: '2026 STUDIO AUDIO SETUP & COMPLETE TECH REVIEW',
          subline: 'Includes Paid Promotion · Official Unmodified Brand Assets',
          badgeText: '✓ Compliant Thumbnail'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('YouTube_Compliant_Creator_Thumbnail.png');
        setCreativeFileSize(489120);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      }
    } else if (dom.includes('nike')) {
      if (type === 'off_policy') {
        const title = 'Athletic Footwear Resale & Modified Swoosh Flyer';
        const text = `⚡ MEGA NIKE WHOLESALE CLEARANCE!
Featuring our custom Swoosh logo & modified Nike logo!
Buy 100% first copy Nike and wholesale Nike stock for commercial resale at 90% off all Nike shoes!
Stackable promo codes on all Jordan launches with unlimited lifetime returns.
Guaranteed 100% injury proof and cures joint pain instantly!`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'off_policy',
          websiteName: 'Nike',
          headline: '90% OFF WHOLESALE NIKE RESALE + MODIFIED SWOOSH!',
          subline: 'Guaranteed 100% Injury Proof · Custom Recolored Logo',
          badgeText: '⚠ Policy Violation Sample'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Nike_Violation_Promo_Banner.png');
        setCreativeFileSize(614200);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else if (type === 'needs_review') {
        const title = 'Nike Marathon Training Feature — Unverified Performance Claim';
        const text = `HOW I SHAVED 18 MINUTES OFF MY MARATHON TIME!!
Sensational headline overlay with dramatic race timer graphic.
Substantiation data and full athlete test context not attached.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'needs_review',
          websiteName: 'Nike',
          headline: 'HOW I SHAVED 18 MINUTES OFF MY MARATHON TIME?!',
          subline: 'Sensational Athlete Claim · Test Data Not Attached',
          badgeText: 'Unverified Context Sample'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Nike_Unverified_Marathon_Claim.png');
        setCreativeFileSize(534000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else {
        const title = 'Nike Move to Zero Apparel Feature';
        const text = `Explore authentic Nike athletic footwear and Move to Zero apparel made with at least 20% recycled content by weight.
Available for personal consumer purchase through authorized Nike retail channels.
Promotional codes exclude select launch products and gift cards; eligible returns accepted within the official Nike Returns Policy window.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'compliant',
          websiteName: 'Nike',
          headline: 'NIKE MOVE TO ZERO — CERTIFIED RECYCLED APPAREL',
          subline: 'At Least 20% Recycled Content by Weight · Authorized Retail',
          badgeText: '✓ Compliant Campaign'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Nike_Compliant_MoveToZero.png');
        setCreativeFileSize(492000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      }
    } else if (dom.includes('amazon')) {
      if (type === 'off_policy') {
        const title = 'Amazon Marketplace Product Listing & Review Promo';
        const text = `🏆 #1 Rated on Amazon Without Source!
Main product image features a colored background main image with "#1 Best Seller badge on image" and "Free Shipping text on main image".
Includes the Amazon Choice logo on poster and a modified Amazon Smile arrow!
Fake 95% off MRP discount! Leave a 5-star review for ₹500 cashback or free gift for positive review!`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'off_policy',
          websiteName: 'Amazon',
          headline: '#1 BEST SELLER ON AMAZON! GET ₹500 FOR 5-STAR REVIEW!',
          subline: 'Unauthorized Amazon Choice Badge + Incentivized Review Offer',
          badgeText: '⚠ Misleading / Violation'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Amazon_Violation_Listing_Banner.png');
        setCreativeFileSize(628000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else if (type === 'needs_review') {
        const title = 'Amazon Seasonal Deal Banner — Missing Reference Price Context';
        const text = `INSANE DEAL: SAVE BIG ON WIRELESS HEADPHONES TODAY!!
Dramatic price callout banner without historical 90-day reference price documentation attached.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'needs_review',
          websiteName: 'Amazon',
          headline: 'INSANE DEAL: SAVE BIG ON WIRELESS HEADPHONES TODAY!!',
          subline: 'Reference Price Substantiation Context Not Attached',
          badgeText: 'Unverified Context'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Amazon_NeedsReview_Deal_Banner.png');
        setCreativeFileSize(518000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else {
        const title = 'Amazon Sponsored Products — Compliant Listing Creative';
        const text = `Available at Amazon: Wireless Noise-Cancelling Headphones.
Main product listing image uses a pure white background (RGB 255, 255, 255) showing only the product without overlaid badges or watermarks.
Uses the approved "Available at amazon" lockup from official Amazon Brand Usage assets. Prices subject to change on Amazon.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'compliant',
          websiteName: 'Amazon',
          headline: 'WIRELESS NOISE-CANCELLING HEADPHONES — AVAILABLE AT AMAZON',
          subline: 'Pure White RGB(255,255,255) Main Image · Approved Lockup',
          badgeText: '✓ Compliant Listing'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName('Amazon_Compliant_Product_Creative.png');
        setCreativeFileSize(476000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      }
    } else {
      const prohibitedList = extractedItems
        .flatMap(r => r.structuredRule?.targetPatterns || [])
        .filter(Boolean)
        .slice(0, 4);
      const approvedList = extractedItems
        .map(r => r.structuredRule?.approvedValue || r.ruleDescription)
        .filter(Boolean)
        .slice(0, 3);

      if (type === 'off_policy') {
        const title = `${detectedWebsiteName} — Deceptive Promotional Thumbnail`;
        const text = `SPECIAL PROMOTION FOR ${detectedWebsiteName.toUpperCase()} (${detectedWebsiteDomain}):
${prohibitedList.length > 0 ? prohibitedList.map(p => `- Includes claim: "${p}"`).join('\n') : `- Officially endorsed by ${detectedWebsiteName} with 100% guaranteed returns overnight!`}
- Uses a modified ${detectedWebsiteName.toLowerCase()} logo and fabricated achievement metrics without required clear space or statutory disclaimers.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'off_policy',
          websiteName: detectedWebsiteName,
          headline: `100% GUARANTEED OVERNIGHT RESULTS — ENDORSED BY ${detectedWebsiteName.toUpperCase()}!`,
          subline: 'Modified Brand Logo + Unsubstantiated Guarantee Claim',
          badgeText: '⚠ Misleading / Violation'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName(`${detectedWebsiteName.replace(/\s+/g, '_')}_Misleading_Thumbnail.png`);
        setCreativeFileSize(642000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else if (type === 'needs_review') {
        const title = `${detectedWebsiteName} — Sensational Headline Without Context`;
        const text = `SHOCKING RESULTS AFTER 30 DAYS WITH ${detectedWebsiteName.toUpperCase()}!!
How we achieved 10x output — full case study context not attached to this creative preview.`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'needs_review',
          websiteName: detectedWebsiteName,
          headline: `SHOCKING 30-DAY RESULTS WITH ${detectedWebsiteName.toUpperCase()}?!`,
          subline: 'Sensational Presentation · Case Study Context Missing',
          badgeText: 'Unverified Context'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName(`${detectedWebsiteName.replace(/\s+/g, '_')}_Unverified_Context.png`);
        setCreativeFileSize(524000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      } else {
        const title = `${detectedWebsiteName} — Official Compliant Campaign Creative`;
        const text = `Official communication aligned with ${detectedWebsiteName} (${detectedWebsiteDomain}) published policies:
${approvedList.map(a => `- ${a}`).join('\n')}`;
        const dataUrl = createSampleThumbnailDataUrl({
          variant: 'compliant',
          websiteName: detectedWebsiteName,
          headline: `${detectedWebsiteName.toUpperCase()} OFFICIAL BRAND-COMPLIANT CAMPAIGN`,
          subline: 'Verified Claims · Approved Visual Identity & Disclosures',
          badgeText: '✓ Compliant Creative'
        });
        setContentTitle(title);
        setPastedText(text);
        setCreativeFileName(`${detectedWebsiteName.replace(/\s+/g, '_')}_Compliant_Creative.png`);
        setCreativeFileSize(482000);
        setCreativeBase64(dataUrl);
        setCreativePreviewUrl(dataUrl);
        setCreativeContentType('image');
      }
    }

    triggerToast(
      type === 'off_policy'
        ? `Loaded Misleading / Violation sample for ${detectedWebsiteName}. Click "Verify Against Extracted Rules" to run analysis.`
        : type === 'needs_review'
        ? `Loaded Unverified Context sample for ${detectedWebsiteName}.`
        : `Loaded Compliant sample for ${detectedWebsiteName}.`,
      type === 'compliant' ? 'success' : 'info'
    );
  };

  // Primary verification action: Verify Against Extracted Rules
  const handleRunVerification = async () => {
    if (extractedItems.length === 0) {
      triggerToast('Please extract website rules first before verifying content.', 'error');
      return;
    }

    if (contentInputMode === 'text' && !pastedText.trim()) {
      triggerToast('Please enter or paste the content copy to verify.', 'error');
      return;
    }

    if (contentInputMode === 'file' && !creativeBase64 && !creativeFileName && !pastedText.trim()) {
      triggerToast('Please upload a thumbnail, image, poster, or document to verify.', 'error');
      return;
    }

    setIsVerifyingContent(true);
    setVerificationError(null);

    try {
      const payload = {
        brandId: activeBrand.id,
        websiteUrl: effectiveSourceUrl,
        rules: extractedItems,
        contentType: contentInputMode === 'text' ? 'text' : creativeContentType,
        text: pastedText || '',
        base64Data: contentInputMode === 'file' ? creativeBase64 : '',
        filename: creativeFileName || 'uploaded-content.png',
        contentTitle: contentTitle || 'Marketing Creative'
      };

      const response = await fetch('/api/brand-dna/verify-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Verification failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.report) {
        throw new Error(data.error || 'Invalid verification report received from server.');
      }

      setVerificationReport(data.report);

      // Update working DNA state with latest report
      const updatedDna: BrandDnaProfile = {
        ...workingDna,
        latestVerificationReport: data.report
      };
      setWorkingDna(updatedDna);

      const statusLabel = data.report.complianceStatus || data.report.overallStatus;
      triggerToast(
        `Verification complete: ${statusLabel} (${data.report.potentialViolationsCount} violation(s), ${data.report.requiresVerificationCount} requiring verification)`,
        statusLabel === 'COMPLIANT' || statusLabel === 'Compliant' ? 'success' : 'info'
      );
    } catch (err: any) {
      console.error('[SkyNex AI] Verification failed:', err);
      setVerificationError(err?.message || 'Verification failed. Please check network connection and retry.');
      triggerToast(`Verification error: ${err?.message || 'Server error'}`, 'error');
    } finally {
      setIsVerifyingContent(false);
    }
  };

  const handleCopyFindingText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFindingId(id);
    setTimeout(() => setCopiedFindingId(null), 2000);
    triggerToast('Copied suggested correction to clipboard', 'info');
  };

  // Ensure current website is in the Active Rule Set options
  const ruleSetOptions = React.useMemo(() => {
    const exists = QUICK_RULE_SETS.some(
      q => q.domain.toLowerCase() === detectedWebsiteDomain.toLowerCase()
    );
    if (exists) return QUICK_RULE_SETS;
    return [
      {
        name: detectedWebsiteName,
        domain: detectedWebsiteDomain,
        url: effectiveSourceUrl
      },
      ...QUICK_RULE_SETS
    ];
  }, [detectedWebsiteName, detectedWebsiteDomain, effectiveSourceUrl]);

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. CLEAN WEBSITE EXTRACTION SUMMARY BAR (MATCHING REFERENCE UI)   */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Brand Icon + Website Name & Domain */}
          <div className="flex items-center gap-3.5 min-w-[200px]">
            <WebsiteBrandBadgeIcon
              domain={detectedWebsiteDomain}
              name={detectedWebsiteName}
              size="lg"
            />
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {detectedWebsiteName}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {detectedWebsiteDomain}
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-9 w-px bg-slate-200" />

          {/* Middle 1: Sources Count (Clickable to toggle View All Sources) */}
          <button
            type="button"
            onClick={() => setShowAllSourcesSection(prev => !prev)}
            className="flex items-center gap-3 text-left group cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors"
            title="Click to view all crawled & discovered website sources"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tabular-nums leading-tight flex items-center gap-1.5">
                <span>{sourcesAccessedCount}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    showAllSourcesSection ? 'rotate-180' : ''
                  }`}
                />
              </div>
              <div className="text-xs text-slate-500">Sources</div>
            </div>
          </button>

          <div className="hidden lg:block h-9 w-px bg-slate-200" />

          {/* Middle 2: Rules Extracted Count */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tabular-nums leading-tight">
                {extractedItems.length}
              </div>
              <div className="text-xs text-slate-500">Rules Extracted</div>
            </div>
          </div>

          <div className="hidden lg:block h-9 w-px bg-slate-200" />

          {/* Right: Extraction Complete Status Badge & Utility Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Extraction Complete</span>
            </span>

            <button
              type="button"
              onClick={() => setShowVisualTokensDrawer(prev => !prev)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              title="View Extracted Brand Palette & Visual Tokens"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRescanWebsite}
              disabled={isRescanningWebsite}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              title="Rescan website for updated rules"
            >
              {isRescanningWebsite ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible "View All Sources" Section */}
        {showAllSourcesSection && (
          <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>All Accessed & Discovered Website Sources ({crawledPages.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Every extracted rule below is attributed to its exact official source page and URL.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                {accessibleSources.length} Accessible · {restrictedSources.length} Restricted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {crawledPages.map(page => (
                <div
                  key={page.url}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 ${
                    page.status === 'crawled'
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate" title={page.title}>
                        {page.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5" title={page.url}>
                        {page.url}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        page.status === 'crawled'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {page.status === 'crawled' ? page.sourceKind || 'Official Source' : 'Restricted'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Type: <strong className="uppercase">{page.pageType}</strong> · {page.extractedItemsCount} rule(s) extracted
                    </span>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>View Original Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Collapsible Drawer: Visual Tokens & Palette */}
        {showVisualTokensDrawer && workingDna.colors && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Extracted Brand Visual Tokens & Palette ({detectedWebsiteName})
              </span>
              <span className="text-[11px] text-slate-500">
                Color swatches & typography standards associated with {detectedWebsiteDomain}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {workingDna.colors.map(col => (
                <div
                  key={col.hex}
                  className="p-2 rounded-lg border border-slate-200 bg-white flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div>
                    <div className="font-semibold text-slate-800 text-[11px]">{col.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{col.hex.toUpperCase()}</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {col.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. EXTRACTED RULES LIST WITH FILTER TABS & SEARCH                 */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Category Tabs + Search Input Bar */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Rules ({extractedItems.length})</span>
            </button>

            {visibleCategories.map(cat => {
              const count = categoryCounts[cat] || 0;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {cat.includes('Content') ? (
                    <Play className="w-3.5 h-3.5 text-slate-400" />
                  ) : cat.includes('Advertising') ? (
                    <Megaphone className="w-3.5 h-3.5 text-slate-400" />
                  ) : cat.includes('Logo') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {formatShortCategoryLabel(cat)} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Expandable Rule Rows */}
        <div className="p-4 space-y-2.5 max-h-[560px] overflow-y-auto">
          {filteredRules.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Scale className="w-7 h-7 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                {extractedItems.length === 0
                  ? 'No published rules extracted yet'
                  : 'No rules match this category or search filter'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {extractedItems.length === 0
                  ? 'Select a website above or enter any URL and click "Extract Rules" to discover official policies and brand guidelines.'
                  : 'Try clearing the search query or selecting "All Rules" to view all extracted policies.'}
              </p>
            </div>
          ) : (
            filteredRules.map(item => {
              const itemCat = getItemCategory(item);
              const isExpanded = expandedRuleIds.has(item.id);
              const origText = item.originalWebsiteText || item.originalExtractedText || '';
              const ruleDesc =
                item.ruleDescription ||
                item.simplifiedExplanation ||
                item.aiExplanation ||
                item.structuredRule?.ruleStatement ||
                '';
              const approvedVal = item.structuredRule?.approvedValue || '';
              const severity = item.structuredRule?.severity || 'info';
              const severityBadgeText =
                severity === 'critical'
                  ? 'High'
                  : severity === 'warning'
                  ? 'Medium'
                  : 'Low';
              const sourceUrl = item.sourceUrl || item.originalWebsiteUrl || effectiveSourceUrl;
              const sourceWebsite = item.sourceWebsite || detectedWebsiteName;
              const sourcePageTitle = item.sourcePageTitle || `${detectedWebsiteName} Official Policy Page`;
              const sectionHeading =
                item.sectionHeading ||
                item.sourceDocDetails?.sectionTitle ||
                item.subCategory ||
                'Official Policy Section';
              const extractedTimeFormatted = formatDateTime(item.extractedAt || workingDna.analyzedAt);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Summary Row */}
                  <div
                    onClick={() => handleToggleExpandRule(item.id)}
                    className="px-4 py-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {itemCat.includes('Logo') ? (
                        <WebsiteBrandBadgeIcon
                          domain={detectedWebsiteDomain}
                          name={detectedWebsiteName}
                          size="md"
                        />
                      ) : itemCat.includes('Content') ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                          <Scale className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {ruleDesc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          severity === 'critical'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                            : severity === 'warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {severityBadgeText}
                      </span>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Rule Details & Source Attribution */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-0.5">
                          Full Extracted Rule & Policy Guidance ({itemCat}):
                        </span>
                        <p>{ruleDesc}</p>
                      </div>

                      {/* Source Attribution Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-[11px]">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Source Website
                          </span>
                          <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">
                              {sourceWebsite} ({item.sourceDomain || detectedWebsiteDomain})
                            </span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Original Source Page Title
                          </span>
                          <span
                            className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5"
                            title={sourcePageTitle}
                          >
                            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{sourcePageTitle}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Relevant Section
                          </span>
                          <span
                            className="font-semibold text-slate-800 block mt-0.5 truncate"
                            title={sectionHeading}
                          >
                            {sectionHeading}
                          </span>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Exact Source URL
                          </span>
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-0.5 truncate"
                            title={sourceUrl}
                          >
                            <span className="truncate">{sourceUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Extraction Timestamp
                          </span>
                          <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{extractedTimeFormatted}</span>
                          </span>
                        </div>
                      </div>

                      {/* Approved Standard / Prohibited Triggers */}
                      {(approvedVal ||
                        (item.structuredRule?.targetPatterns &&
                          item.structuredRule.targetPatterns.length > 0)) && (
                        <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
                          {approvedVal && (
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                Approved Standard / Compliance Requirement:
                              </span>
                              <span className="font-semibold text-emerald-700">{approvedVal}</span>
                            </div>
                          )}

                          {Array.isArray(item.structuredRule?.targetPatterns) &&
                            item.structuredRule.targetPatterns.length > 0 && (
                              <div>
                                <span className="text-[11px] font-semibold text-slate-500 block">
                                  Violation Triggers / Prohibited Patterns:
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {item.structuredRule.targetPatterns.map((pat, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono"
                                    >
                                      {pat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Verbatim Policy Excerpt */}
                      {origText && (
                        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
                          <div className="text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                            Verbatim Source Policy Excerpt ({sourcePageTitle}):
                          </div>
                          <p className="whitespace-pre-wrap">{origText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. REDESIGNED UPLOAD CONTENT & VERIFY AGAINST EXTRACTED RULES      */}
      {/* ================================================================= */}
      <div id="upload-and-verify-section" className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        {/* 1. Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Upload Content & Verify Against {detectedWebsiteName} Rules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a thumbnail, image, poster, document, or text to check compliance against{' '}
                <strong className="text-slate-800">
                  {extractedItems.length} {detectedWebsiteName} rules ({detectedWebsiteDomain})
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Three Compact Demo Buttons (Red, Amber, Green) */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-xs text-slate-500 mr-1">
              Test Against <strong className="text-slate-800">{detectedWebsiteName}</strong> Rules:
            </span>

            <button
              type="button"
              onClick={() => handleLoadSampleContent('off_policy')}
              className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Load Misleading / Violation</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSampleContent('needs_review')}
              className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Load Unverified Context</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoadSampleContent('compliant')}
              className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Load Compliant</span>
            </button>
          </div>
        </div>

        {/* 2. Input Tabs (Upload File | Paste Content / Metadata) */}
        <div className="border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setContentInputMode('file')}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 text-xs font-bold cursor-pointer border-b-2 transition-all ${
              contentInputMode === 'file'
                ? 'bg-blue-50/70 text-blue-600 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setContentInputMode('text')}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 text-xs font-bold cursor-pointer border-b-2 transition-all ${
              contentInputMode === 'text'
                ? 'bg-blue-50/70 text-blue-600 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Content / Metadata</span>
          </button>
        </div>

        {/* 3. Campaign Details (Two-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
          {/* Left: Creative Campaign / Thumbnail / Asset Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              Creative Campaign / Thumbnail / Asset Title
            </label>
            <input
              type="text"
              value={contentTitle}
              onChange={e => setContentTitle(e.target.value)}
              placeholder="e.g. Dramatic Exam Hacking Thumbnail"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Right: Active Rule Set Dropdown + Separate Active Rules Counter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              Active Rule Set
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 flex items-center border border-slate-200 rounded-xl bg-slate-50/60 px-3 py-2">
                <WebsiteBrandBadgeIcon
                  domain={detectedWebsiteDomain}
                  name={detectedWebsiteName}
                  size="sm"
                />
                <select
                  value={effectiveSourceUrl}
                  onChange={e => {
                    if (onSelectWebsiteUrl) {
                      onSelectWebsiteUrl(e.target.value);
                    }
                  }}
                  aria-label="Active Rule Set"
                  className="w-full pl-2.5 pr-6 text-xs font-semibold text-slate-900 bg-transparent appearance-none focus:outline-none cursor-pointer"
                >
                  {ruleSetOptions.map(opt => (
                    <option key={opt.domain} value={opt.url}>
                      {opt.name} ({opt.domain})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3" />
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs whitespace-nowrap shrink-0 tabular-nums">
                {extractedItems.length} Rules Active
              </div>
            </div>
          </div>
        </div>

        {/* 4. File Upload Area / Paste Content Area */}
        {contentInputMode === 'file' ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf,.docx,.doc"
              onChange={e => handleCreativeFileSelected(e.target.files?.[0])}
              className="hidden"
            />

            {!creativeFileName ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFile(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFile(false);
                }}
                onDrop={handleDropFile}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDraggingFile
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-blue-200/90 hover:border-blue-400 bg-gradient-to-b from-slate-50/40 to-blue-50/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="text-base font-bold text-slate-900">
                  Drag & Drop File Here
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  or <span className="text-blue-600 font-bold hover:underline">click to browse</span>
                </div>

                {/* Supported Format Labels & Max Size */}
                <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
                  {[
                    { label: 'PNG', icon: ImageIcon },
                    { label: 'JPG', icon: ImageIcon },
                    { label: 'WebP', icon: ImageIcon },
                    { label: 'PDF', icon: FileText },
                    { label: 'DOCX', icon: FileSpreadsheet }
                  ].map(fmt => {
                    const IconComp = fmt.icon;
                    return (
                      <span
                        key={fmt.label}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs"
                      >
                        <IconComp className="w-3 h-3 text-slate-500" />
                        <span>{fmt.label}</span>
                      </span>
                    );
                  })}
                  <span className="text-xs text-slate-400 pl-1">| Max size: 12 MB</span>
                </div>
              </div>
            ) : (
              /* Uploaded File Preview Card with Filename, File Size, Remove & Replace */
              <div className="border-2 border-dashed border-blue-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50/60 to-blue-50/20 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0 w-full">
                  {creativePreviewUrl ? (
                    <img
                      src={creativePreviewUrl}
                      alt={creativeFileName}
                      className="w-40 h-24 object-cover rounded-xl border border-slate-200 bg-slate-900 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-20 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex flex-col items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                      <span className="text-[10px] font-bold uppercase mt-1">Document</span>
                    </div>
                  )}

                  <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {creativeFileName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold tabular-nums">
                        {formatFileSize(creativeFileSize)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ready for multimodal visual inspection, semantic claim analysis, and rule mapping against{' '}
                      <strong className="text-slate-700">
                        {extractedItems.length} {detectedWebsiteName} rules
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreativeFileName('');
                      setCreativeFileSize(0);
                      setCreativeBase64('');
                      setCreativePreviewUrl('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Paste Content / Metadata Mode */
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-800 block">
              Paste Thumbnail Text Overlays, Advertisement Copy, Video Metadata, or Campaign Claims
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={`Paste thumbnail headline overlays, promotional claims, or campaign copy to verify against ${detectedWebsiteName} rules...`}
              className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-xs leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{pastedText.split(/\s+/).filter(Boolean).length} words entered</span>
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Notice */}
        {verificationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Verification Notice</div>
              <p className="text-[11px] text-rose-800 leading-relaxed">{verificationError}</p>
            </div>
          </div>
        )}

        {/* 5. Verification Action Bar */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 px-1">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              We analyze your content, detect potential violations, and match findings with the{' '}
              <strong className="text-slate-900">
                {extractedItems.length} extracted {detectedWebsiteName} rules
              </strong>
              .
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunVerification}
            disabled={isVerifyingContent || extractedItems.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          >
            {isVerifyingContent ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Against Extracted Rules...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Against Extracted Rules</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. REDESIGNED VERIFICATION RESULTS DASHBOARD                      */}
      {/* ================================================================= */}
      {verificationReport && (() => {
        const actionableFindings = (verificationReport.findings || []).filter(
          f => f.status !== 'Compliant' && f.status !== 'COMPLIANT'
        );
        const actualViolationsCount = actionableFindings.filter(
          f => f.status === 'Potential Violation' || f.status === 'NON-COMPLIANT'
        ).length;
        const actualMissingInfoCount = actionableFindings.filter(
          f => f.status === 'Missing Information'
        ).length;
        const actualRequiresVerificationCount = actionableFindings.filter(
          f => f.status === 'Requires Verification' || f.status === 'NEEDS REVIEW'
        ).length;

        const complianceVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS REVIEW' =
          actualViolationsCount > 0
            ? 'NON-COMPLIANT'
            : actualRequiresVerificationCount > 0 || actualMissingInfoCount > 0
            ? 'NEEDS REVIEW'
            : 'COMPLIANT';

        // Severity filtering for findings
        const criticalFindings = actionableFindings.filter(f => f.severity === 'critical');
        const highFindings = actionableFindings.filter(
          f => f.severity === 'high' || f.severity === 'warning'
        );
        const mediumFindings = actionableFindings.filter(
          f => f.severity === 'medium' || f.severity === 'low' || f.severity === 'info'
        );

        const displayedFindings =
          findingSeverityFilter === 'critical'
            ? criticalFindings
            : findingSeverityFilter === 'high'
            ? highFindings
            : findingSeverityFilter === 'medium'
            ? mediumFindings
            : actionableFindings;

        // Dynamic Policy Source details
        const primaryFinding = actionableFindings[0];
        const primaryPolicyUrl =
          primaryFinding?.sourceUrl || effectiveSourceUrl;
        const primaryPolicyName =
          primaryFinding?.sourcePageTitle ||
          `${detectedWebsiteName} Community Guidelines`;
        const primaryPolicyCategory =
          primaryFinding?.relevantRuleCategory
            ? `${primaryFinding.relevantRuleCategory}${
                primaryFinding.sectionHeading ? ` · § ${primaryFinding.sectionHeading}` : ''
              }`
            : 'Spam, Deceptive Practices & Scams Policy';

        // Dynamic rule topics summary
        const detectedTopics = Array.from(
          new Set(
            actionableFindings
              .map(f => f.relevantRuleCategory)
              .concat(extractedItems.slice(0, 3).map(i => getItemCategory(i)))
          )
        ).slice(0, 3);
        const topicsText =
          detectedTopics.length > 0
            ? detectedTopics.join(', ').toLowerCase()
            : 'misleading content, health claims, and deceptive practices';

        return (
          <div className="space-y-6">
            {/* ============================================================= */}
            {/* 1. HEADER SECTION                                             */}
            {/* ============================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationReport(null);
                    const el = document.getElementById('upload-and-verify-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
                  title="Back to upload and verify"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                    Verification Results: {verificationReport.contentTitle}
                  </h2>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{detectedWebsiteName} Brand Check</span>
                    <span className="text-slate-300">·</span>
                    <span>{verificationReport.totalRulesChecked} rules evaluated</span>
                    <span className="text-slate-300">·</span>
                    <span>{formatDateTime(verificationReport.verifiedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Status Badge (Red, Green, Amber pill matching reference image) */}
              <div className="shrink-0">
                {complianceVerdict === 'NON-COMPLIANT' ? (
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/90 flex items-center gap-2 shadow-2xs whitespace-nowrap">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Non-Compliant</span>
                  </span>
                ) : complianceVerdict === 'COMPLIANT' ? (
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 flex items-center gap-2 shadow-2xs whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Compliant</span>
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 flex items-center gap-2 shadow-2xs whitespace-nowrap">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Needs Verification</span>
                  </span>
                )}
              </div>
            </div>

            {/* ============================================================= */}
            {/* 2. SUMMARY CARDS (4 CLEAN KPI CARDS)                           */}
            {/* ============================================================= */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Rules Checked */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
                    {verificationReport.totalRulesChecked}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Rules Checked</div>
                </div>
              </div>

              {/* Card 2: Rule Violations */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-600 tabular-nums leading-tight">
                    {actualViolationsCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Rule Violations</div>
                </div>
              </div>

              {/* Card 3: Missing Info */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Hourglass className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
                    {actualMissingInfoCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Missing Info</div>
                </div>
              </div>

              {/* Card 4: Needs Verification */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
                    {actualRequiresVerificationCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Needs Verification</div>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 3. TWO-COLUMN LAYOUT: VIOLATIONS (LEFT) & PREVIEW (RIGHT)     */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: POLICY VIOLATIONS SECTION (7 of 12 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                {/* Section Header + Filter Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Policy Violations ({actionableFindings.length})
                  </h3>

                  {/* Filter Tabs: All, Critical, High, Medium */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFindingSeverityFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        findingSeverityFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({actionableFindings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFindingSeverityFilter('critical')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        findingSeverityFilter === 'critical'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Critical ({criticalFindings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFindingSeverityFilter('high')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        findingSeverityFilter === 'high'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      High ({highFindings.length})
                    </button>
                    {mediumFindings.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFindingSeverityFilter('medium')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          findingSeverityFilter === 'medium'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Medium ({mediumFindings.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Policy Violation Cards */}
                {displayedFindings.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-slate-200/90 bg-white text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-900">
                      {actionableFindings.length === 0
                        ? 'No Policy Violations Detected'
                        : `No ${findingSeverityFilter.toUpperCase()} Violations Found`}
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {actionableFindings.length === 0
                        ? `The uploaded content complies with all evaluated brand rules from ${detectedWebsiteName}.`
                        : 'Select "All" above to inspect other findings or filter levels.'}
                    </p>
                  </div>
                ) : (
                  displayedFindings.map((fnd, idx) => {
                    const isExpanded = expandedFindingIds.has(fnd.id || String(idx));
                    const isCritical = fnd.severity === 'critical';
                    const isHigh = fnd.severity === 'high' || fnd.severity === 'warning';
                    const severityLabel = isCritical ? 'Critical' : isHigh ? 'High' : 'Medium';
                    const fndSourceUrl = fnd.sourceUrl || effectiveSourceUrl;
                    const exactExtractedRuleText =
                      fnd.exactExtractedRule || fnd.originalWebsiteText || fnd.relevantRuleTitle;
                    const detectedElementText = fnd.detectedElement || fnd.detectedContent;
                    const evidenceText =
                      fnd.imageEvidence ||
                      `Detected "${fnd.detectedContent}" in uploaded ${verificationReport.contentType} asset.`;

                    return (
                      <div
                        key={fnd.id || idx}
                        className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
                      >
                        {/* Collapsed Card Summary Area (Clickable to Toggle) */}
                        <div
                          onClick={() => handleToggleExpandFinding(fnd.id || String(idx))}
                          className="p-5 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-4">
                            {/* Left Icon Container matching reference image */}
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                isCritical
                                  ? 'bg-rose-50 text-rose-500 border border-rose-100'
                                  : isHigh
                                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                  : 'bg-amber-50/70 text-amber-600 border border-amber-100'
                              }`}
                            >
                              <ImageIcon className="w-5 h-5" />
                            </div>

                            {/* Middle Details: Title, Severity Badge, Simple Explanation, and Fix Strip */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {fnd.relevantRuleTitle}
                                </h4>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    isCritical
                                      ? 'bg-rose-100 text-rose-700'
                                      : isHigh
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {severityLabel}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                {fnd.explanation}
                              </p>

                              {/* One-Line Recommended Fix Strip matching reference UI */}
                              <div
                                className={`mt-3 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
                                  isCritical
                                    ? 'bg-rose-50/70 border border-rose-100/90 text-rose-950'
                                    : 'bg-amber-50/70 border border-amber-100/90 text-amber-950'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="truncate">
                                    <strong className="text-slate-900 font-bold mr-1">Fix:</strong>
                                    <span className="text-slate-700 font-normal">
                                      {fnd.suggestedCorrection}
                                    </span>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleCopyFindingText(fnd.id, fnd.suggestedCorrection);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs transition-colors"
                                  title="Copy recommended correction"
                                >
                                  {copiedFindingId === fnd.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>Copy Fix</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Right Expand/Collapse Arrow */}
                            <div className="shrink-0 pt-1">
                              <ChevronDown
                                className={`w-5 h-5 text-blue-600 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ======================================================= */}
                        {/* 4. EXPANDABLE VIOLATION DETAILS (6 STRUCTURED SECTIONS) */}
                        {/* ======================================================= */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-3.5 text-xs">
                            {/* A. Detected Element */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                A. Detected Element
                              </span>
                              <div className="font-mono text-xs font-semibold text-slate-900 bg-slate-100/80 px-3 py-1.5 rounded-lg break-words">
                                {detectedElementText}
                              </div>
                            </div>

                            {/* B. Evidence */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                B. Evidence from Uploaded Content
                              </span>
                              <p className="text-xs text-slate-800 leading-relaxed">
                                {evidenceText}
                              </p>
                            </div>

                            {/* C. Extracted Rule */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                C. Extracted Brand Rule ({fnd.sourceWebsite || detectedWebsiteName})
                              </span>
                              <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                                {exactExtractedRuleText}
                              </p>
                              {fnd.originalWebsiteText &&
                                fnd.originalWebsiteText !== exactExtractedRuleText && (
                                  <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1.5">
                                    "{fnd.originalWebsiteText}"
                                  </p>
                                )}
                            </div>

                            {/* D. Policy Source */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                D. Policy Source
                              </span>
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                <a
                                  href={fndSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 break-all"
                                >
                                  <span>{fndSourceUrl}</span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                                <span className="text-slate-500 font-medium">
                                  Page: <strong>{fnd.sourcePageTitle || 'Official Policy Page'}</strong>
                                  {fnd.sectionHeading ? ` · § ${fnd.sectionHeading}` : ''}
                                </span>
                              </div>
                            </div>

                            {/* E. Explanation */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1.5 leading-relaxed">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                E. Explanation
                              </span>
                              <p className="font-medium text-slate-900">{fnd.explanation}</p>
                              {fnd.visualRelationshipAnalysis && (
                                <p className="text-[11px] text-slate-600">
                                  <strong className="text-slate-800">Visual Relationship:</strong>{' '}
                                  {fnd.visualRelationshipAnalysis}
                                </p>
                              )}
                              {fnd.semanticIntentAnalysis && (
                                <p className="text-[11px] text-slate-600">
                                  <strong className="text-slate-800">Semantic Intent:</strong>{' '}
                                  {fnd.semanticIntentAnalysis}
                                </p>
                              )}
                              {fnd.contextualVerificationNote && (
                                <p className="text-[11px] text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                                  <strong>Contextual Note:</strong> {fnd.contextualVerificationNote}
                                </p>
                              )}
                            </div>

                            {/* F. Recommended Correction */}
                            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                              <span className="font-bold text-emerald-900 block">
                                F. Recommended Correction
                              </span>
                              <p className="font-medium leading-relaxed">
                                {fnd.suggestedCorrection}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* RIGHT COLUMN: CONTENT PREVIEW & BRAND RULE SOURCE (5 of 12 cols) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                {/* 5. CONTENT PREVIEW CARD */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-5 space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <WebsiteBrandBadgeIcon
                      domain={detectedWebsiteDomain}
                      name={detectedWebsiteName}
                      size="sm"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Content Preview
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {detectedWebsiteName} ({detectedWebsiteDomain})
                      </p>
                    </div>
                  </div>

                  {/* Properly Contained Preview Container */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[180px]">
                    {creativePreviewUrl ? (
                      <img
                        src={creativePreviewUrl}
                        alt={verificationReport.contentTitle}
                        className="w-full max-h-[300px] object-contain"
                      />
                    ) : (
                      <div className="p-5 text-center text-xs text-slate-400 space-y-2 w-full">
                        <FileText className="w-8 h-8 text-blue-400 mx-auto" />
                        <div className="font-semibold text-slate-200 truncate">
                          {verificationReport.contentFileName || verificationReport.contentTitle}
                        </div>
                        <p className="text-[11px] text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed text-left bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          {verificationReport.extractedTextSnippet ||
                            pastedText ||
                            'Content verified against extracted brand rules.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-700 truncate">
                    {verificationReport.contentTitle}
                  </div>
                </div>

                {/* 6. POLICY SOURCE CARD */}
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Policy Source</span>
                    </div>

                    <a
                      href={primaryPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      <span>View Policy</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {primaryPolicyName}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {primaryPolicyCategory}
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 7. ABOUT THIS CHECK (SUBTLE BOTTOM INFORMATION SECTION)       */}
            {/* ============================================================= */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-100/90 p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">About This Check</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluated against {detectedWebsiteName}'s {verificationReport.totalRulesChecked} extracted rules on {topicsText}.
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
