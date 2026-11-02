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
  Building2
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
    return d.toLocaleString(undefined, {
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

export default function WebsiteRuleVerificationEngine({
  activeBrand,
  workingDna,
  setWorkingDna,
  extractedItems,
  crawledPages,
  websiteUrl,
  handleRescanWebsite,
  isRescanningWebsite,
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
  const [contentTitle, setContentTitle] = useState<string>('Campaign Creative & Copy Verification');
  const [pastedText, setPastedText] = useState<string>('');
  const [creativeFileName, setCreativeFileName] = useState<string>('');
  const [creativeBase64, setCreativeBase64] = useState<string>('');
  const [creativePreviewUrl, setCreativePreviewUrl] = useState<string>('');
  const [creativeContentType, setCreativeContentType] = useState<'image' | 'text' | 'document'>('image');
  const [isVerifyingContent, setIsVerifyingContent] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Verification Report State
  const [verificationReport, setVerificationReport] = useState<ContentVerificationReport | null>(
    workingDna.latestVerificationReport || null
  );
  const [copiedFindingId, setCopiedFindingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (workingDna.latestVerificationReport) {
      setVerificationReport(workingDna.latestVerificationReport);
    } else {
      setVerificationReport(null);
    }
  }, [workingDna.id, workingDna.analyzedAt, workingDna.latestVerificationReport]);

  // Derived Extraction Summary Metadata
  const effectiveSourceUrl = workingDna.sourceUrl || websiteUrl || activeBrand.website || 'https://example.com';
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
    (accessibleSources.length > 0 ? accessibleSources.length : Math.max(1, new Set(extractedItems.map(i => i.sourceUrl || i.originalWebsiteUrl)).size));
  const extractionStatusText =
    workingDna.extractionStatus ||
    (restrictedSources.length > 0
      ? 'Completed (Public Sources Only — Some Pages Restricted)'
      : 'Completed — Official Public Sources Verified');
  const lastExtractionTimestamp = formatDateTime(workingDna.analyzedAt || workingDna.updatedAt);

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

  // Category counts (show categories that have items, or core categories if empty)
  const categoryCounts = ALL_RULE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = extractedItems.filter(i => getItemCategory(i) === cat).length;
    return acc;
  }, {} as Record<WebsiteRuleCategory, number>);

  const visibleCategories = ALL_RULE_CATEGORIES.filter(cat => (categoryCounts[cat] || 0) > 0);

  // Handle creative file upload
  const handleCreativeFileSelected = (file?: File) => {
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      triggerToast('File exceeds 12 MB limit. Please select a smaller file.', 'error');
      return;
    }

    const name = file.name;
    setCreativeFileName(name);
    setContentTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    const isImg = file.type.startsWith('image/');
    const isDoc = name.endsWith('.docx') || name.endsWith('.doc') || file.type.includes('word') || name.endsWith('.pdf');

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

  // Domain-aware sample content loader so test creatives match whichever website was extracted!
  const handleLoadSampleContent = (type: 'off_policy' | 'compliant') => {
    const dom = detectedWebsiteDomain.toLowerCase();
    setContentInputMode('text');
    setCreativeBase64('');
    setCreativePreviewUrl('');
    setCreativeContentType('text');

    if (dom.includes('youtube')) {
      if (type === 'off_policy') {
        setContentTitle('YouTube Creator Giveaway & Sponsored Video Promo');
        setPastedText(
          `🔥 OFFICIAL YOUTUBE SPONSORED GIVEAWAY!
Features our custom Blue YouTube Icon & Modified YouTube Logo!
Click the link to get guaranteed 100k subscribers and free cash giveaway click here!
Includes a secret paid review with undisclosed sponsorship and unlicensed music track — no copyright infringement intended.
Officially endorsed by YouTube!`
        );
        setCreativeFileName('YouTube_OffPolicy_Promo.txt');
      } else {
        setContentTitle('YouTube Creator Integration — Compliant Campaign');
        setPastedText(
          `Watch our latest tech breakdown on YouTube!
Includes paid promotion: This video is sponsored by Acme Audio (Paid promotion disclosure box enabled in YouTube Studio).
Uses 100% original licensed audio tracks and displays the unmodified official YouTube Red (#FF0000) play icon with required minimum clear space.
Official Contest Rules linked in description: YouTube is not a sponsor of this promotion and is released from all liability.`
        );
        setCreativeFileName('YouTube_Compliant_Promo.txt');
      }
    } else if (dom.includes('nike')) {
      if (type === 'off_policy') {
        setContentTitle('Athletic Footwear Resale & Modified Swoosh Flyer');
        setPastedText(
          `⚡ MEGA NIKE WHOLESALE CLEARANCE!
Featuring our custom Swoosh logo & modified Nike logo!
Buy 100% first copy Nike and wholesale Nike stock for commercial resale at 90% off all Nike shoes!
Stackable promo codes on all Jordan launches with unlimited lifetime returns.
Guaranteed 100% injury proof and cures joint pain instantly!`
        );
        setCreativeFileName('Nike_Violation_Flyer.txt');
      } else {
        setContentTitle('Nike Move to Zero Apparel Feature');
        setPastedText(
          `Explore authentic Nike athletic footwear and Move to Zero apparel made with at least 20% recycled content by weight.
Available for personal consumer purchase through authorized Nike retail channels.
Promotional codes exclude select launch products and gift cards; eligible returns accepted within the official Nike Returns Policy window.`
        );
        setCreativeFileName('Nike_Compliant_Campaign.txt');
      }
    } else if (dom.includes('amazon')) {
      if (type === 'off_policy') {
        setContentTitle('Amazon Marketplace Product Listing & Review Promo');
        setPastedText(
          `🏆 #1 Rated on Amazon Without Source!
Main product image features a colored background main image with "#1 Best Seller badge on image" and "Free Shipping text on main image".
Includes the Amazon Choice logo on poster and a modified Amazon Smile arrow!
Fake 95% off MRP discount! Leave a 5-star review for ₹500 cashback or free gift for positive review!`
        );
        setCreativeFileName('Amazon_Listing_Violation.txt');
      } else {
        setContentTitle('Amazon Sponsored Products — Compliant Listing Creative');
        setPastedText(
          `Available at Amazon: Wireless Noise-Cancelling Headphones.
Main product listing image uses a pure white background (RGB 255, 255, 255) showing only the product without overlaid badges or watermarks.
Uses the approved "Available at amazon" lockup from official Amazon Brand Usage assets. Prices subject to change on Amazon.`
        );
        setCreativeFileName('Amazon_Compliant_Listing.txt');
      }
    } else {
      // Dynamic construction from the currently extracted website rules!
      const prohibitedList = extractedItems
        .flatMap(r => r.structuredRule?.targetPatterns || [])
        .filter(Boolean)
        .slice(0, 4);
      const approvedList = extractedItems
        .map(r => r.structuredRule?.approvedValue || r.ruleDescription)
        .filter(Boolean)
        .slice(0, 3);

      if (type === 'off_policy') {
        setContentTitle(`${detectedWebsiteName} — Draft Promotional Ad (Policy Check)`);
        setPastedText(
          `SPECIAL PROMOTION FOR ${detectedWebsiteName.toUpperCase()} (${detectedWebsiteDomain}):
${prohibitedList.length > 0 ? prohibitedList.map(p => `- Includes claim: "${p}"`).join('\n') : `- Officially endorsed by ${detectedWebsiteName} with 100% guaranteed returns!`}
- Uses a modified ${detectedWebsiteName.toLowerCase()} logo without required clear space or statutory disclaimers.`
        );
        setCreativeFileName(`${detectedWebsiteName.replace(/\s+/g, '_')}_Violation_Draft.txt`);
      } else {
        setContentTitle(`${detectedWebsiteName} — Official Compliant Campaign Copy`);
        setPastedText(
          `Official communication aligned with ${detectedWebsiteName} (${detectedWebsiteDomain}) published policies:
${approvedList.map(a => `- ${a}`).join('\n')}`
        );
        setCreativeFileName(`${detectedWebsiteName.replace(/\s+/g, '_')}_Compliant_Copy.txt`);
      }
    }

    triggerToast(
      type === 'off_policy'
        ? `Loaded sample non-compliant content for ${detectedWebsiteName}. Click "Verify Against Extracted Rules" to test violation detection.`
        : `Loaded sample compliant content for ${detectedWebsiteName}.`,
      type === 'off_policy' ? 'info' : 'success'
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

    if (contentInputMode === 'file' && !creativeBase64 && !creativeFileName) {
      triggerToast('Please upload an advertisement image, poster, or document to verify.', 'error');
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
        text: contentInputMode === 'text' ? pastedText : pastedText || '',
        base64Data: contentInputMode === 'file' ? creativeBase64 : '',
        filename: creativeFileName || 'uploaded-content',
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

      triggerToast(
        `Verification complete: ${data.report.overallStatus} (${data.report.potentialViolationsCount} violation(s) detected)`,
        data.report.overallStatus === 'Compliant' ? 'success' : 'info'
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

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* EXTRACTION SUMMARY BANNER & COLLAPSIBLE "VIEW ALL SOURCES"        */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Universal Website Rule Extraction Summary
              </span>
              {workingDna.websiteCategory && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-medium">
                  {workingDna.websiteCategory}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Saved in Brand DNA</span>
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 flex-wrap">
              <span>{detectedWebsiteName}</span>
              <span className="text-xs font-mono font-normal text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                {detectedWebsiteDomain}
              </span>
            </h2>
            {workingDna.limitationNotice && (
              <p className="text-[11px] text-slate-300 max-w-3xl leading-relaxed">
                {workingDna.limitationNotice}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAllSourcesSection(prev => !prev)}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>View All Sources ({crawledPages.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showAllSourcesSection ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowVisualTokensDrawer(prev => !prev)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-blue-300" />
              <span>Visual Tokens</span>
            </button>

            <button
              type="button"
              onClick={handleRescanWebsite}
              disabled={isRescanningWebsite}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              {isRescanningWebsite ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rescanning...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan Website</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6 Mandatory Extraction Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/70 border-b border-slate-200">
          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Detected Website Name
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate" title={detectedWebsiteName}>
              {detectedWebsiteName}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Website Domain
            </div>
            <div className="text-xs font-mono font-semibold text-blue-700 mt-1 truncate" title={detectedWebsiteDomain}>
              {detectedWebsiteDomain}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sources Accessed
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {sourcesAccessedCount} Official Source{sourcesAccessedCount === 1 ? '' : 's'}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rules Extracted
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1">
              {extractedItems.length} Active Rule{extractedItems.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Extraction Status
            </div>
            <div className="text-[11px] font-semibold text-slate-800 mt-1 leading-snug" title={extractionStatusText}>
              {extractionStatusText}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Last Extraction Timestamp
            </div>
            <div className="text-[11px] font-medium text-slate-800 mt-1">
              {lastExtractionTimestamp}
            </div>
          </div>
        </div>

        {/* Collapsible "View All Sources" Section */}
        {showAllSourcesSection && (
          <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
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
                      {page.status === 'crawled'
                        ? page.sourceKind || 'Official Source'
                        : 'Restricted'}
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
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
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

        {/* Dynamic Category Filter Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`pb-2.5 px-2.5 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
              selectedCategory === 'all'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Extracted Rules ({extractedItems.length})</span>
          </button>

          {visibleCategories.map(cat => {
            const count = categoryCounts[cat] || 0;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`pb-2.5 px-2.5 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800 border-transparent'
                }`}
              >
                <span>
                  {cat} ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${detectedWebsiteName} rules, section headings, source titles, or URLs...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredRules.length} of {extractedItems.length} source-attributed rules for{' '}
            <strong className="text-slate-800">{detectedWebsiteName}</strong>
          </div>
        </div>

        {/* Extracted Rule Cards List with Mandatory Source Attribution */}
        <div className="p-5 space-y-4 max-h-[680px] overflow-y-auto">
          {filteredRules.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Scale className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                {extractedItems.length === 0
                  ? 'No published rules extracted yet'
                  : 'No rules match this category or search filter'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {extractedItems.length === 0
                  ? 'Enter any public website URL above and click "Extract Website Rules" to discover its official policies, brand guidelines, and content restrictions.'
                  : 'Try clearing the search query or selecting "All Extracted Rules" to view all extracted policies.'}
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
                  className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-2xs hover:border-blue-300 transition-colors"
                >
                  {/* 1. Rule Category & Rule Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {itemCat}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            severity === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : severity === 'warning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {severity} severity
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          Source Website: <strong className="text-slate-800">{sourceWebsite}</strong>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span>View Original Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* 2. Rule Description */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200/70">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Rule Description:
                    </span>
                    <p>{ruleDesc}</p>
                  </div>

                  {/* 3. Mandatory Source Attribution Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-50/50 border border-slate-200/80 text-[11px]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Source Website
                      </span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">{sourceWebsite} ({item.sourceDomain || detectedWebsiteDomain})</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Original Source Page Title
                      </span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5" title={sourcePageTitle}>
                        <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">{sourcePageTitle}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Relevant Section or Heading
                      </span>
                      <span className="font-semibold text-slate-800 block mt-0.5 truncate" title={sectionHeading}>
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
                        Extraction Date & Time
                      </span>
                      <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{extractedTimeFormatted}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4. Actionable Verification Conditions */}
                  {(approvedVal || (item.structuredRule?.targetPatterns && item.structuredRule.targetPatterns.length > 0)) && (
                    <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/30 space-y-2 text-xs">
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

                  {/* 5. Expandable Accordion: Original Website Text (Verbatim Quote) */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleExpandRule(item.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <span>
                        {isExpanded ? 'Hide Verbatim Source Text' : 'View Verbatim Source Excerpt'}
                      </span>
                    </button>

                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>View Original Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
                      <div className="text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Verbatim Source Policy Excerpt ({sourcePageTitle}):
                      </div>
                      <p className="whitespace-pre-wrap">{origText || ruleDesc}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. UPLOAD CONTENT & VERIFY AGAINST EXTRACTED RULES                 */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Upload Content & Verify Against {detectedWebsiteName} Rules
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload an image, poster, document, or paste text to verify compliance against all {extractedItems.length} extracted rules from{' '}
              <strong className="text-slate-700">{detectedWebsiteDomain}</strong>.
            </p>
          </div>

          {/* Domain-Aware Quick Sample Loaders */}
          <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">
              Test {detectedWebsiteName} Rules:
            </span>
            <button
              type="button"
              onClick={() => handleLoadSampleContent('off_policy')}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
            >
              Load Violation Sample ({detectedWebsiteName})
            </button>
            <button
              type="button"
              onClick={() => handleLoadSampleContent('compliant')}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
            >
              Load Compliant Sample ({detectedWebsiteName})
            </button>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-4 text-xs font-semibold border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setContentInputMode('file')}
            className={`flex items-center gap-1.5 pb-1 cursor-pointer transition-colors ${
              contentInputMode === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload File (Image / Poster / PDF / DOCX)</span>
          </button>

          <button
            type="button"
            onClick={() => setContentInputMode('text')}
            className={`flex items-center gap-1.5 pb-1 cursor-pointer transition-colors ${
              contentInputMode === 'text'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Content Copy / Ad Text</span>
          </button>
        </div>

        {/* Content Title Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Creative Campaign / Asset Title
            </label>
            <input
              type="text"
              value={contentTitle}
              onChange={e => setContentTitle(e.target.value)}
              placeholder={`e.g. ${detectedWebsiteName} Promotional Banner`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Active Rule Set Connected
            </label>
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>
                Source: <strong className="text-slate-800">{detectedWebsiteName}</strong> ({detectedWebsiteDomain})
              </span>
              <span className="font-bold text-blue-600">{extractedItems.length} Rules Active</span>
            </div>
          </div>
        </div>

        {/* FILE UPLOAD MODE */}
        {contentInputMode === 'file' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf,.docx,.doc"
              onChange={e => handleCreativeFileSelected(e.target.files?.[0])}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
            >
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-slate-800 text-sm">
                {creativeFileName
                  ? `Selected File: ${creativeFileName}`
                  : 'Click or drag & drop to upload an image, poster, or document'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPG, WebP, PDF, DOCX (Max 12 MB). Compares visual & text claims against {detectedWebsiteName} extracted rules.
              </p>
            </div>

            {creativePreviewUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <img
                  src={creativePreviewUrl}
                  alt="Creative preview"
                  className="w-24 h-24 object-contain rounded-lg border border-slate-300 bg-white"
                />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{creativeFileName}</div>
                  <div className="text-slate-500">Image ready for multimodal OCR and rule verification</div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreativeFileName('');
                      setCreativeBase64('');
                      setCreativePreviewUrl('');
                    }}
                    className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEXT PASTE MODE */}
        {contentInputMode === 'text' && (
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 block">
              Paste Advertisement Copy, Video Description, Product Listing, or Campaign Text
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={`Paste headline, body copy, promotional claims, or campaign text to verify against ${detectedWebsiteName} rules...`}
              className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-xs"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{pastedText.split(/\s+/).filter(Boolean).length} words entered</span>
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Notice */}
        {verificationError && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Verification Notice</div>
              <p className="text-[11px] text-rose-800 leading-relaxed">{verificationError}</p>
            </div>
          </div>
        )}

        {/* Primary Verification Action Button */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <p className="text-[11px] text-slate-500">
            Automatically identifies violated rules, explains why they are violated, suggests compliant corrections, and links to the original source URL.
          </p>

          <button
            type="button"
            onClick={handleRunVerification}
            disabled={isVerifyingContent || extractedItems.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            {isVerifyingContent ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Against {detectedWebsiteName} Rules...</span>
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
      {/* 6. VERIFICATION RESULTS SECTION                                    */}
      {/* ================================================================= */}
      {verificationReport && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Verification Results: {verificationReport.contentTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evaluated against {verificationReport.totalRulesChecked} extracted rules from{' '}
                <span className="font-semibold text-slate-700">{detectedWebsiteName} ({detectedWebsiteDomain})</span> at{' '}
                {formatDateTime(verificationReport.verifiedAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  verificationReport.overallStatus === 'Compliant'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : verificationReport.overallStatus === 'Potential Violation'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : verificationReport.overallStatus === 'Missing Information'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                {verificationReport.overallStatus === 'Compliant' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>Overall: {verificationReport.overallStatus}</span>
              </span>
            </div>
          </div>

          {/* 5 Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs text-slate-500 font-medium">Rules Checked</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {verificationReport.totalRulesChecked}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-center">
              <div className="text-xs text-slate-500 font-medium">Findings Matched</div>
              <div className="text-lg font-bold text-blue-600 mt-0.5">
                {verificationReport.rulesMatched}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 text-center">
              <div className="text-xs text-rose-700 font-medium">Rule Violations</div>
              <div className="text-lg font-bold text-rose-800 mt-0.5">
                {verificationReport.potentialViolationsCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-center">
              <div className="text-xs text-amber-700 font-medium">Missing Info</div>
              <div className="text-lg font-bold text-amber-800 mt-0.5">
                {verificationReport.missingInformationCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 text-center">
              <div className="text-xs text-blue-700 font-medium">Requires Verification</div>
              <div className="text-lg font-bold text-blue-800 mt-0.5">
                {verificationReport.requiresVerificationCount}
              </div>
            </div>
          </div>

          {/* Detailed Verification Findings List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Rule-by-Rule Verification Findings ({verificationReport.findings.length})
            </h3>

            {verificationReport.findings.map((fnd, idx) => {
              const isViolation = fnd.status === 'Potential Violation';
              const isMissing = fnd.status === 'Missing Information';
              const isVerify = fnd.status === 'Requires Verification';
              const fndSourceUrl = fnd.sourceUrl || effectiveSourceUrl;

              return (
                <div
                  key={fnd.id || idx}
                  className={`rounded-xl border p-4 space-y-3.5 transition-all ${
                    isViolation
                      ? 'border-rose-200 bg-rose-50/30'
                      : isMissing
                      ? 'border-amber-200 bg-amber-50/30'
                      : isVerify
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-emerald-200 bg-emerald-50/20'
                  }`}
                >
                  {/* Finding Header: Violated Rule & Category */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isViolation
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isMissing
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isVerify
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {fnd.status}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                          {fnd.relevantRuleCategory}
                        </span>

                        {fnd.severity && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              fnd.severity === 'critical'
                                ? 'bg-rose-200 text-rose-900'
                                : fnd.severity === 'warning'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {fnd.severity}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        {isViolation ? 'Violated Rule: ' : 'Matched Rule: '}
                        {fnd.relevantRuleTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={fndSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 rounded-md flex items-center gap-1 shadow-2xs"
                      >
                        <span>View Original Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyFindingText(fnd.id, fnd.suggestedCorrection)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                        title="Copy suggested correction to clipboard"
                      >
                        {copiedFindingId === fnd.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px]">Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Detected Content */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      Detected Content in Uploaded Creative:
                    </span>
                    <span className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      "{fnd.detectedContent}"
                    </span>
                  </div>

                  {/* Why It Is Violated */}
                  <div className="text-xs text-slate-800 leading-relaxed space-y-1">
                    <span className="font-bold text-slate-900 block">
                      {isViolation ? 'Why It Violates the Rule:' : 'Verification Analysis:'}
                    </span>
                    <p>{fnd.explanation}</p>
                  </div>

                  {/* Correction Suggestion */}
                  <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold text-emerald-900 block">
                      Correction Suggestion:
                    </span>
                    <p className="font-medium">{fnd.suggestedCorrection}</p>
                  </div>

                  {/* Original Website Text Excerpt */}
                  {fnd.originalWebsiteText && (
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono leading-relaxed border border-slate-800">
                      <span className="text-[10px] font-sans font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">
                        Original Source Policy Excerpt:
                      </span>
                      <p>"{fnd.originalWebsiteText}"</p>
                    </div>
                  )}

                  {/* Source Attribution Footer for Verification */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>
                          Source Website: <strong>{fnd.sourceWebsite || detectedWebsiteName}</strong>
                        </span>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        Page: <strong>{fnd.sourcePageTitle || 'Official Policy Page'}</strong>
                      </span>
                      {fnd.sectionHeading && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>
                            Section: <strong>{fnd.sectionHeading}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    <a
                      href={fndSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span className="truncate max-w-[260px]">{fndSourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal Compliance Disclaimer Banner */}
          <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800 block">
                Statutory & Legal Scope Disclaimer
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {verificationReport.legalDisclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
