import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Globe,
  Instagram,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UploadCloud,
  Palette,
  Type as TypeIcon,
  Scan,
  Layout,
  MessageSquare,
  FileText,
  Save,
  RefreshCw,
  Loader2,
  Check,
  X,
  Plus,
  Trash2,
  Download,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Eye,
  Sliders,
  Image as ImageIcon,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Layers,
  FileCheck,
  ShoppingBag,
  ShieldAlert,
  History,
  Filter,
  Search,
  Info,
  BookOpen,
  Scale,
  Award,
  Database,
  ArrowUpDown,
  Lock,
  Radio
} from 'lucide-react';
import {
  BrandProfile,
  BrandDnaProfile,
  BrandDnaColor,
  BrandConsistencyCheckResult,
  BrandDnaIntelligenceCategory,
  BrandDnaVerificationStatus,
  DiscoveredWebPage,
  ExtractedBrandIntelligenceItem,
  BrandDnaRescanDiffItem
} from '../types.ts';
import WebsiteRuleVerificationEngine from './WebsiteRuleVerificationEngine.tsx';

interface BrandDnaWorkspaceProps {
  activeBrand: BrandProfile;
  onBrandUpdated: (updatedBrand: BrandProfile) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export default function BrandDnaWorkspace({
  activeBrand,
  onBrandUpdated,
  triggerToast
}: BrandDnaWorkspaceProps) {
  // Source Mode: 'website' | 'social'
  const [sourceMode, setSourceMode] = useState<'website' | 'social'>('website');

  // Website Analysis Input State
  const [websiteUrl, setWebsiteUrl] = useState<string>(
    activeBrand.brandDnaProfile?.sourceType === 'website' && activeBrand.brandDnaProfile?.sourceUrl
      ? activeBrand.brandDnaProfile.sourceUrl
      : `${window.location.origin}/sample-brand-site/${activeBrand.id === 'novapay' ? 'novapay' : 'astrafin'}`
  );
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState<boolean>(false);
  const [isRescanningWebsite, setIsRescanningWebsite] = useState<boolean>(false);
  const [analysisStepText, setAnalysisStepText] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Social Media Analysis Input State
  const [instagramUrl, setInstagramUrl] = useState<string>('');
  const [socialCaptionSample, setSocialCaptionSample] = useState<string>('');
  const [socialRefImages, setSocialRefImages] = useState<
    { filename: string; base64Data: string; previewUrl: string }[]
  >([]);
  const [isAnalyzingSocial, setIsAnalyzingSocial] = useState<boolean>(false);
  const socialFileInputRef = useRef<HTMLInputElement>(null);

  // Active Working Brand DNA Profile (Editable before & after saving)
  const [workingDna, setWorkingDna] = useState<BrandDnaProfile | null>(
    activeBrand.brandDnaProfile || null
  );

  // 5 Categories + Discovered Pages + Visual Tokens Tabs
  const [activeDnaTab, setActiveDnaTab] = useState<
    | 'all'
    | 'visual_identity'
    | 'website_policies_rules'
    | 'product_intelligence'
    | 'brand_communication'
    | 'approved_facts'
    | 'discovered_pages'
    | 'visual_tokens'
  >('all');

  // Extracted Items & Discovered Pages State
  const [extractedItems, setExtractedItems] = useState<ExtractedBrandIntelligenceItem[]>(
    activeBrand.brandDnaProfile?.extractedItems || []
  );
  const [crawledPages, setCrawledPages] = useState<DiscoveredWebPage[]>(
    activeBrand.brandDnaProfile?.crawledPages || []
  );
  const [rescanDiffs, setRescanDiffs] = useState<BrandDnaRescanDiffItem[] | null>(
    activeBrand.brandDnaProfile?.rescanDiffs || null
  );
  const [showRescanModal, setShowRescanModal] = useState<boolean>(false);
  const [showDiscoveredPagesDrawer, setShowDiscoveredPagesDrawer] = useState<boolean>(false);

  // Human Review & Selection State
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [expandedTextItemIds, setExpandedTextItemIds] = useState<Set<string>>(new Set());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemDraft, setEditingItemDraft] = useState<ExtractedBrandIntelligenceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Brand Knowledge Sync State
  const [isSyncingKnowledge, setIsSyncingKnowledge] = useState<boolean>(false);
  const [syncSummary, setSyncSummary] = useState<{
    rules?: number;
    assets?: number;
    sourceDocs?: number;
    products?: number;
    rulesAdded?: number;
    assetsUpdated?: number;
    sourcesAdded?: number;
    productsAdded?: number;
  } | null>(
    activeBrand.brandDnaProfile?.syncedKnowledgeCounts || null
  );

  const [isEditingDna, setIsEditingDna] = useState<boolean>(false);
  const [isSavingDna, setIsSavingDna] = useState<boolean>(false);

  // New Content Consistency Checker State
  const [creativeTitle, setCreativeTitle] = useState<string>('Campaign Social Banner Draft');
  const [creativeCaption, setCreativeCaption] = useState<string>('');
  const [creativeFileName, setCreativeFileName] = useState<string>('');
  const [creativeBase64, setCreativeBase64] = useState<string>('');
  const [creativePreviewUrl, setCreativePreviewUrl] = useState<string>('');
  const [isCheckingConsistency, setIsCheckingConsistency] = useState<boolean>(false);
  const [consistencyError, setConsistencyError] = useState<string | null>(null);
  const [activeCheckResult, setActiveCheckResult] = useState<BrandConsistencyCheckResult | null>(
    activeBrand.consistencyChecks?.[0] || null
  );
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const creativeInputRef = useRef<HTMLInputElement>(null);

  // One-Click Change State
  const [isApplyingFix, setIsApplyingFix] = useState<boolean>(false);
  const [fixError, setFixError] = useState<string | null>(null);

  // Sync workingDna and state when switching brands
  useEffect(() => {
    setWorkingDna(activeBrand.brandDnaProfile || null);
    setExtractedItems(activeBrand.brandDnaProfile?.extractedItems || []);
    setCrawledPages(activeBrand.brandDnaProfile?.crawledPages || []);
    setRescanDiffs(activeBrand.brandDnaProfile?.rescanDiffs || null);
    setSyncSummary(activeBrand.brandDnaProfile?.syncedKnowledgeCounts || null);
    setSelectedItemIds(new Set());
    setExpandedTextItemIds(new Set());
    setEditingItemId(null);
    setEditingItemDraft(null);

    const latestCheck = activeBrand.consistencyChecks?.[0] || null;
    setActiveCheckResult(latestCheck);
    if (latestCheck) {
      setSelectedIssueIds(new Set(latestCheck.issues.map(i => i.id)));
    } else {
      setSelectedIssueIds(new Set());
    }
    setAnalysisError(null);
    setConsistencyError(null);
    setFixError(null);
    setWebsiteUrl(
      activeBrand.brandDnaProfile?.sourceType === 'website' && activeBrand.brandDnaProfile?.sourceUrl
        ? activeBrand.brandDnaProfile.sourceUrl
        : `${window.location.origin}/sample-brand-site/${activeBrand.id === 'novapay' ? 'novapay' : 'astrafin'}`
    );
  }, [activeBrand.id, activeBrand.brandDnaProfile]);

  // ---------------------------------------------------------------------------
  // 1. COMPREHENSIVE WEBSITE INTELLIGENCE & MULTI-PAGE CRAWLING
  // ---------------------------------------------------------------------------
  const handleAnalyzeWebsite = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (overrideUrl ?? websiteUrl).trim();
    if (!targetUrl) {
      setAnalysisError('Please enter a company website URL to analyze.');
      return;
    }

    setIsAnalyzingWebsite(true);
    setAnalysisError(null);
    setAnalysisStepText('Connecting to website & validating security policies...');

    const t1 = setTimeout(() => {
      setAnalysisStepText('Discovering internal pages: Terms, Privacy, Refund, Shipping, Pricing, Products, FAQs...');
    }, 400);
    const t2 = setTimeout(() => {
      setAnalysisStepText('Crawling accessible pages & reporting any restricted/inaccessible links...');
    }, 1100);
    const t3 = setTimeout(() => {
      setAnalysisStepText('Extracting 5 Intelligence Categories: Visual Identity, Policies, Products, Voice & Facts...');
    }, 1800);

    try {
      const res = await fetch('/api/brand-dna/crawl-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrand.id,
          websiteUrl: targetUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not crawl the specified website URL.');
      }

      setWorkingDna(data.dnaProfile);
      setExtractedItems(data.extractedItems || []);
      setCrawledPages(data.crawledPages || []);
      setRescanDiffs(data.rescanDiffs || null);
      setSelectedItemIds(new Set());
      setEditingItemId(null);
      setIsEditingDna(false);

      const crawledCount = (data.crawledPages || []).filter((p: DiscoveredWebPage) => p.status === 'crawled').length;
      const restrictedCount = (data.crawledPages || []).filter((p: DiscoveredWebPage) => p.status === 'inaccessible').length;
      const itemsCount = (data.extractedItems || []).length;

      triggerToast(
        `Crawled ${crawledCount} pages (${restrictedCount} restricted/inaccessible reported). Extracted ${itemsCount} actionable intelligence items across 5 categories. Review and approve below!`,
        'success'
      );
    } catch (err: any) {
      setAnalysisError(err?.message || 'Website crawling failed.');
      triggerToast(`Website crawling failed: ${err?.message}`, 'error');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzingWebsite(false);
      setAnalysisStepText('');
    }
  };

  // ---------------------------------------------------------------------------
  // 1b. WEBSITE RESCAN & POLICY/PRICING CHANGE DETECTION
  // ---------------------------------------------------------------------------
  const handleRescanWebsite = async () => {
    setIsRescanningWebsite(true);
    setAnalysisError(null);
    setAnalysisStepText('Rescanning website and comparing against previous brand snapshot...');

    try {
      const res = await fetch('/api/brand-dna/rescan-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrand.id,
          websiteUrl: websiteUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Rescan failed.');
      }

      setWorkingDna(data.dnaProfile);
      setExtractedItems(data.extractedItems || []);
      setCrawledPages(data.crawledPages || []);
      setRescanDiffs(data.rescanDiffs || []);

      if (Array.isArray(data.rescanDiffs) && data.rescanDiffs.length > 0) {
        setShowRescanModal(true);
        triggerToast(`Rescan complete: ${data.rescanDiffs.length} change(s) / new updates detected!`, 'info');
      } else {
        triggerToast('Rescan complete: No policy or pricing modifications detected. Verified content is current.', 'success');
      }
    } catch (err: any) {
      setAnalysisError(err?.message || 'Rescan could not be completed.');
      triggerToast(`Rescan failed: ${err?.message}`, 'error');
    } finally {
      setIsRescanningWebsite(false);
      setAnalysisStepText('');
    }
  };

  // ---------------------------------------------------------------------------
  // 1c. HUMAN REVIEW ACTIONS (APPROVE, REJECT, EDIT, BATCH)
  // ---------------------------------------------------------------------------
  const handleApproveItem = (itemId: string) => {
    setExtractedItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, verificationStatus: 'approved' as const } : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          i.id === itemId ? { ...i, verificationStatus: 'approved' as const } : i
        ),
        isSaved: false
      });
    }
    triggerToast('Item marked as Approved. Click "Save & Sync to Brand Knowledge" to activate.', 'info');
  };

  const handleRejectItem = (itemId: string) => {
    setExtractedItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, verificationStatus: 'rejected' as const } : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          i.id === itemId ? { ...i, verificationStatus: 'rejected' as const } : i
        ),
        isSaved: false
      });
    }
    triggerToast('Item marked as Rejected. It will not be synced to active Brand Rules.', 'info');
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleBatchApprove = () => {
    if (selectedItemIds.size === 0) return;
    setExtractedItems(prev =>
      prev.map(i => (selectedItemIds.has(i.id) ? { ...i, verificationStatus: 'approved' as const } : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          selectedItemIds.has(i.id) ? { ...i, verificationStatus: 'approved' as const } : i
        ),
        isSaved: false
      });
    }
    const count = selectedItemIds.size;
    setSelectedItemIds(new Set());
    triggerToast(`Approved ${count} selected item(s). Click "Save & Sync to Brand Knowledge" to activate.`, 'success');
  };

  const handleBatchReject = () => {
    if (selectedItemIds.size === 0) return;
    setExtractedItems(prev =>
      prev.map(i => (selectedItemIds.has(i.id) ? { ...i, verificationStatus: 'rejected' as const } : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          selectedItemIds.has(i.id) ? { ...i, verificationStatus: 'rejected' as const } : i
        ),
        isSaved: false
      });
    }
    const count = selectedItemIds.size;
    setSelectedItemIds(new Set());
    triggerToast(`Rejected ${count} selected item(s).`, 'info');
  };

  const handleApproveAllCurrent = (itemsToApprove: ExtractedBrandIntelligenceItem[]) => {
    const ids = new Set(itemsToApprove.map(i => i.id));
    setExtractedItems(prev =>
      prev.map(i => (ids.has(i.id) ? { ...i, verificationStatus: 'approved' as const } : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          ids.has(i.id) ? { ...i, verificationStatus: 'approved' as const } : i
        ),
        isSaved: false
      });
    }
    triggerToast(`Approved all ${ids.size} item(s) in this view. Click "Save & Sync to Brand Knowledge" to finalize.`, 'success');
  };

  const handleToggleExpandText = (itemId: string) => {
    setExpandedTextItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleStartEditItem = (item: ExtractedBrandIntelligenceItem) => {
    setEditingItemId(item.id);
    setEditingItemDraft({ ...item, structuredRule: { ...item.structuredRule } });
  };

  const handleSaveItemEdit = () => {
    if (!editingItemDraft) return;
    setExtractedItems(prev =>
      prev.map(i => (i.id === editingItemDraft.id ? editingItemDraft : i))
    );
    if (workingDna) {
      setWorkingDna({
        ...workingDna,
        extractedItems: (workingDna.extractedItems || []).map(i =>
          i.id === editingItemDraft.id ? editingItemDraft : i
        ),
        isSaved: false
      });
    }
    setEditingItemId(null);
    setEditingItemDraft(null);
    triggerToast('Updated intelligence item details.', 'success');
  };

  // ---------------------------------------------------------------------------
  // 1d. SYNC APPROVED INTELLIGENCE INTO 4 EXISTING BRAND KNOWLEDGE TABS
  // ---------------------------------------------------------------------------
  const handleSyncKnowledge = async () => {
    if (!workingDna) return;
    setIsSyncingKnowledge(true);
    try {
      const approvedIds = extractedItems
        .filter(i => i.verificationStatus === 'approved')
        .map(i => i.id);
      const rejectedIds = extractedItems
        .filter(i => i.verificationStatus === 'rejected')
        .map(i => i.id);

      const res = await fetch(`/api/brand-dna/${activeBrand.id}/sync-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedItemIds: approvedIds,
          rejectedItemIds: rejectedIds,
          editedItems: extractedItems,
          dnaProfile: {
            ...workingDna,
            extractedItems
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync to Brand Knowledge.');
      }

      onBrandUpdated(data.brand);
      setWorkingDna(data.dnaProfile);
      setExtractedItems(data.dnaProfile.extractedItems || []);
      setSyncSummary(data.syncedCounts);

      triggerToast(
        `✓ Synced to Brand Knowledge: ${data.syncedCounts.rulesAdded} Rules, ${data.syncedCounts.assetsUpdated} Assets, ${data.syncedCounts.sourcesAdded} Sources, ${data.syncedCounts.productsAdded} Products!`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Knowledge sync failed: ${err?.message}`, 'error');
    } finally {
      setIsSyncingKnowledge(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. INSTAGRAM / SOCIAL MEDIA BRAND DNA ANALYSIS
  // ---------------------------------------------------------------------------
  const handleSocialFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAnalysisError(null);

    const remainingSlots = Math.max(0, 6 - socialRefImages.length);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setAnalysisError(`File "${file.name}" is not a supported image format.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setAnalysisError(`File "${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        setSocialRefImages(prev => [
          ...prev,
          {
            filename: file.name,
            base64Data: resultStr,
            previewUrl: resultStr
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLoadSampleSocialPosts = async () => {
    try {
      setAnalysisError(null);
      setIsAnalyzingSocial(true);
      setAnalysisStepText('Loading official sample social reference posts...');
      const samplePaths = [
        { path: '/assets/sample-ads/novapay-ad-compliant.png', name: 'novapay-social-post-1.png' }
      ];
      const loaded: { filename: string; base64Data: string; previewUrl: string }[] = [];

      for (const sp of samplePaths) {
        const res = await fetch(sp.path);
        if (!res.ok) throw new Error('Could not load sample social post asset');
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        loaded.push({
          filename: sp.name,
          base64Data: dataUrl,
          previewUrl: dataUrl
        });
      }

      setSocialRefImages(loaded);
      setInstagramUrl('https://www.instagram.com/novapay.official/');
      setSocialCaptionSample(
        'NovaPay — Fast, secure payment processing for modern enterprises. Subscribe today for ₹999/month.'
      );
      triggerToast('Loaded sample social reference post. Click "Analyze Social Reference Content" to extract Brand DNA.', 'info');
    } catch (err: any) {
      setAnalysisError(`Could not load sample reference posts: ${err?.message}`);
    } finally {
      setIsAnalyzingSocial(false);
      setAnalysisStepText('');
    }
  };

  const handleAnalyzeSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingSocial(true);
    setAnalysisError(null);
    setAnalysisStepText('Inspecting reference images, extracting color histograms & OCR copy...');

    try {
      const res = await fetch('/api/brand-dna/analyze-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrand.id,
          instagramUrl: instagramUrl.trim(),
          referenceImages: socialRefImages.map(img => ({
            filename: img.filename,
            base64Data: img.base64Data
          })),
          captionSample: socialCaptionSample.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Social media analysis failed.');
      }

      setWorkingDna(data.dnaProfile);
      setIsEditingDna(false);
      triggerToast(
        `Extracted Brand DNA from ${socialRefImages.length} social reference post(s). Review and save your profile below!`,
        'success'
      );
    } catch (err: any) {
      setAnalysisError(err?.message || 'Social media analysis could not be completed.');
      triggerToast(err?.message || 'Social analysis requires reference images', 'error');
    } finally {
      setIsAnalyzingSocial(false);
      setAnalysisStepText('');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. EDIT & SAVE BRAND DNA PROFILE
  // ---------------------------------------------------------------------------
  const handleSaveBrandDnaProfile = async () => {
    if (!workingDna) return;
    setIsSavingDna(true);
    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dnaProfile: workingDna })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Brand DNA Profile');

      setWorkingDna(data.dnaProfile);
      setIsEditingDna(false);
      onBrandUpdated(data.brand);
      triggerToast(`Saved Brand DNA Profile for ${activeBrand.name} persistently!`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to save Brand DNA Profile: ${err?.message}`, 'error');
    } finally {
      setIsSavingDna(false);
    }
  };

  const handleUpdateColor = (idx: number, updates: Partial<BrandDnaColor>) => {
    if (!workingDna) return;
    const nextColors = workingDna.colors.map((c, i) => (i === idx ? { ...c, ...updates } : c));
    setWorkingDna({ ...workingDna, colors: nextColors, isSaved: false });
  };

  const handleAddColorSwatch = () => {
    if (!workingDna) return;
    const newSwatch: BrandDnaColor = {
      name: 'Custom Brand Swatch',
      hex: '#3B82F6',
      role: 'accent',
      usageNotes: 'Custom added brand color token',
      confidence: 1.0,
      sourceEvidence: 'Manual Brand Manager configuration'
    };
    setWorkingDna({
      ...workingDna,
      colors: [...workingDna.colors, newSwatch],
      isSaved: false
    });
  };

  const handleRemoveColorSwatch = (idx: number) => {
    if (!workingDna || workingDna.colors.length <= 1) return;
    setWorkingDna({
      ...workingDna,
      colors: workingDna.colors.filter((_, i) => i !== idx),
      isSaved: false
    });
  };

  // ---------------------------------------------------------------------------
  // 4. NEW CONTENT CONSISTENCY CHECKER
  // ---------------------------------------------------------------------------
  const handleCreativeFileSelected = (file: File | undefined) => {
    if (!file) return;
    setConsistencyError(null);
    if (!file.type.startsWith('image/')) {
      setConsistencyError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setConsistencyError('File size exceeds the 10 MB limit.');
      return;
    }
    setCreativeFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setCreativeBase64(resultStr);
      setCreativePreviewUrl(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleCreativeForCheck = async (variant: 'off_brand' | 'compliant') => {
    try {
      setConsistencyError(null);
      const assetPath =
        variant === 'off_brand'
          ? '/assets/sample-ads/novapay-ad-wrong-logo.png'
          : '/assets/sample-ads/novapay-ad-compliant.png';
      const fileName =
        variant === 'off_brand'
          ? 'novapay-ad-wrong-logo.png'
          : 'novapay-ad-compliant.png';

      const res = await fetch(assetPath);
      if (!res.ok) throw new Error('Sample creative asset not found');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setCreativeFileName(fileName);
      setCreativeBase64(dataUrl);
      setCreativePreviewUrl(dataUrl);
      setCreativeTitle(
        variant === 'off_brand'
          ? 'Q4 Promo Draft (Unapproved Logo & Red Palette)'
          : 'Q4 Official Brand-Compliant Banner'
      );
      setCreativeCaption(
        variant === 'off_brand'
          ? 'Nova Pay guarantees risk-free profits! Subscribe for ₹499/month.'
          : 'NovaPay — Fast, secure payment processing. Subscribe for ₹999/month.'
      );
      triggerToast(
        `Loaded "${fileName}". Click "Check Brand Consistency" to evaluate against saved Brand DNA!`,
        'info'
      );
    } catch (err: any) {
      setConsistencyError(`Could not load sample creative: ${err?.message}`);
    }
  };

  const handleRunConsistencyCheck = async () => {
    if (!activeBrand.brandDnaProfile && workingDna) {
      // Auto-save workingDna first so backend has the profile
      await handleSaveBrandDnaProfile();
    }
    if (!creativeBase64) {
      setConsistencyError('Please upload a creative image or load a sample creative first.');
      return;
    }

    setIsCheckingConsistency(true);
    setConsistencyError(null);
    setFixError(null);

    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/check-consistency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: creativeFileName || 'creative.png',
          base64Image: creativeBase64,
          creativeTitle: creativeTitle.trim() || 'Uploaded Creative',
          captionText: creativeCaption.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Consistency check failed');

      setActiveCheckResult(data.checkResult);
      setSelectedIssueIds(new Set((data.checkResult.issues || []).map((i: any) => i.id)));
      onBrandUpdated(data.brand);
      triggerToast(
        `Consistency check complete: Score ${data.checkResult.overallScore}/100 (${data.checkResult.issues.length} issue(s) found).`,
        data.checkResult.overallScore >= 85 ? 'success' : 'info'
      );
    } catch (err: any) {
      setConsistencyError(err?.message || 'Consistency check failed.');
      triggerToast(`Consistency check failed: ${err?.message}`, 'error');
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. ONE-CLICK CHANGE: FIX BRAND INCONSISTENCIES
  // ---------------------------------------------------------------------------
  const handleToggleIssueForFix = (issueId: string) => {
    setSelectedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) next.delete(issueId);
      else next.add(issueId);
      return next;
    });
  };

  const handleApplyOneClickFix = async () => {
    if (!activeCheckResult) return;
    if (selectedIssueIds.size === 0) {
      setFixError('Please select at least one detected issue to remediate.');
      return;
    }

    setIsApplyingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/one-click-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: activeCheckResult.id,
          selectedIssueIds: Array.from(selectedIssueIds)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate corrected creative');

      setActiveCheckResult(data.checkResult);
      onBrandUpdated(data.brand);
      triggerToast(
        `One-Click Change complete! Generated brand-compliant creative with ${data.correctionAppliedSummary?.length || 1} remediation(s).`,
        'success'
      );
    } catch (err: any) {
      setFixError(err?.message || 'One-Click Change failed.');
      triggerToast(`One-Click Change failed: ${err?.message}`, 'error');
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleApproveCreative = async (status: 'approved' | 'revision_requested') => {
    if (!activeCheckResult) return;
    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/approve-creative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: activeCheckResult.id,
          approvalStatus: status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update approval status');
      setActiveCheckResult(data.checkResult);
      onBrandUpdated(data.brand);
      triggerToast(
        status === 'approved'
          ? 'Approved corrected creative for campaign publication!'
          : 'Marked creative for designer revision.',
        'success'
      );
    } catch (err: any) {
      triggerToast(`Failed to update status: ${err?.message}`, 'error');
    }
  };

  const hasSavedProfile = Boolean(activeBrand.brandDnaProfile?.isSaved);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ================================================================= */}
      {/* 1. SECTION HEADER & WORKFLOW BAR                                  */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand DNA Analyzer</h1>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">
            Learn your brand. Maintain consistency. Create with confidence.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Analyze your company’s live website or social media reference content to extract a structured Brand DNA Profile (colors, typography, logo usage, visual patterns, and voice), then check new creatives and apply One-Click Change remediations.
          </p>
        </div>

        {/* Saved Profile Status & Quick Re-analyze */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasSavedProfile ? (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold leading-tight">Saved Brand DNA Active</div>
                <div className="text-[10px] text-emerald-700">
                  {activeBrand.name} · Updated {activeBrand.brandDnaProfile?.updatedAt.slice(0, 10)}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <InfoIcon />
              <span>No Brand DNA saved for {activeBrand.name} yet</span>
            </div>
          )}
        </div>
      </div>

      {/* End-to-End Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-blue-50/70 text-slate-900">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            1
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Connect & Analyze</div>
            <div className="text-[10px] text-slate-500 truncate">Website or Social Reference</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            workingDna ? 'bg-blue-50/70 text-slate-900' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              workingDna ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Review & Save DNA</div>
            <div className="text-[10px] text-slate-500 truncate">
              {hasSavedProfile ? 'Saved to Brand Profile' : 'Edit & Save Rules'}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            activeCheckResult ? 'bg-blue-50/70 text-slate-900' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              activeCheckResult ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Check Consistency</div>
            <div className="text-[10px] text-slate-500 truncate">
              {activeCheckResult ? `Score: ${activeCheckResult.overallScore}/100` : 'Upload New Creative'}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            activeCheckResult?.correctedImageUrl ? 'bg-emerald-50 text-emerald-950' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              activeCheckResult?.correctedImageUrl
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            4
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">One-Click Change</div>
            <div className="text-[10px] text-slate-500 truncate">
              {activeCheckResult?.correctedImageUrl ? 'Before & After Ready' : 'Auto-Remediate Issues'}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SOURCE ANALYSIS PANEL (WEBSITE OR INSTAGRAM / SOCIAL MEDIA)    */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
        {/* Source Option Tabs */}
        <div className="border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setSourceMode('website');
                setAnalysisError(null);
              }}
              className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                sourceMode === 'website'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>1. Analyze Website</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceMode('social');
                setAnalysisError(null);
              }}
              className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                sourceMode === 'social'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>2. Analyze Instagram / Social Media</span>
            </button>
          </div>

          {/* Previously Saved Brand DNA Profiles Switcher */}
          {(activeBrand.brandDnaHistory?.length || 0) > 0 && (
            <div className="flex items-center gap-2 pb-2 text-xs">
              <span className="text-slate-500">Saved Snapshots:</span>
              <select
                value={workingDna?.id || ''}
                onChange={e => {
                  const found = activeBrand.brandDnaHistory?.find(h => h.id === e.target.value);
                  if (found) setWorkingDna(found);
                }}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 bg-slate-50 font-medium"
              >
                {(activeBrand.brandDnaHistory || []).map(h => (
                  <option key={h.id} value={h.id}>
                    {h.sourceType === 'website' ? 'Website' : 'Social'} — {h.updatedAt.slice(0, 10)} ({Math.round(h.overallConfidence * 100)}% conf)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* OPTION 1: UNIVERSAL WEBSITE RULE EXTRACTION */}
        {sourceMode === 'website' && (
          <form onSubmit={e => handleAnalyzeWebsite(e)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Enter Any Public Website URL (Platforms, Brands, E-Commerce, Corporate, Government, etc.)
                </label>
                <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
                  <span className="text-slate-400">Try universal extraction:</span>
                  {[
                    { label: 'YouTube', url: 'https://www.youtube.com' },
                    { label: 'Nike', url: 'https://www.nike.com' },
                    { label: 'Amazon', url: 'https://www.amazon.in' },
                    { label: 'Flipkart', url: 'https://www.flipkart.com' },
                    { label: 'Coca-Cola', url: 'https://www.coca-cola.com' },
                    { label: 'Instagram', url: 'https://www.instagram.com' },
                    { label: 'FSSAI Gov', url: 'https://www.fssai.gov.in' },
                    { label: 'NovaPay Sample', url: `${window.location.origin}/sample-brand-site/novapay` }
                  ].map((ex, idx) => (
                    <React.Fragment key={ex.label}>
                      {idx > 0 && <span className="text-slate-300">·</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setWebsiteUrl(ex.url);
                          handleAnalyzeWebsite(undefined, ex.url);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                      >
                        {ex.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={e => {
                      setWebsiteUrl(e.target.value);
                      if (analysisError) setAnalysisError(null);
                    }}
                    placeholder="Enter any website URL (e.g., https://www.youtube.com, https://www.nike.com, https://www.amazon.in, https://www.coca-cola.com)"
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingWebsite || isRescanningWebsite}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                >
                  {isAnalyzingWebsite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting Website Rules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Website Rules</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRescanWebsite}
                  disabled={isAnalyzingWebsite || isRescanningWebsite}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  title="Rescan website to detect new pages or modified policy terms"
                >
                  {isRescanningWebsite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Rescanning...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>Rescan Website</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p className="text-[11px] text-slate-500">
                  Automatically detects the website, domain, and organization, crawls accessible official policy & brand guideline pages, and extracts source-attributed rules for content verification.
                </p>

                {crawledPages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDiscoveredPagesDrawer(!showDiscoveredPagesDrawer)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {crawledPages.filter(p => p.status === 'crawled').length} pages crawled,{' '}
                      {crawledPages.filter(p => p.status === 'inaccessible').length} restricted
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDiscoveredPagesDrawer ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Quick Collapsible Discovered Pages Overview */}
              {showDiscoveredPagesDrawer && crawledPages.length > 0 && (
                <div className="mt-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Discovered Internal Pages ({crawledPages.length})</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Reporting public crawl status & restricted pages
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {crawledPages.map(page => (
                      <div
                        key={page.url}
                        className={`p-2.5 rounded-lg border text-[11px] flex items-start justify-between gap-2 ${
                          page.status === 'crawled'
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-rose-50/80 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{page.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{page.path}</div>
                          {page.status === 'inaccessible' && (
                            <div className="text-[10px] text-rose-700 font-medium mt-0.5">
                              {page.errorMessage || `HTTP ${page.httpStatus} Access Restricted`}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            page.status === 'crawled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {page.status === 'crawled' ? `HTTP ${page.httpStatus}` : 'RESTRICTED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(isAnalyzingWebsite || isRescanningWebsite) && analysisStepText && (
              <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 flex items-center gap-3 text-xs text-blue-950">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span className="font-medium">{analysisStepText}</span>
              </div>
            )}
          </form>
        )}

        {/* OPTION 2: INSTAGRAM / SOCIAL MEDIA ANALYSIS */}
        {sourceMode === 'social' && (
          <form onSubmit={handleAnalyzeSocial} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-blue-600" />
                  <span>Instagram & Social Media Reference Analysis</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter an Instagram profile URL for reference attribution and upload 1–6 reference post images or screenshots. Because Instagram blocks unauthenticated automated feed scraping, SkyNex AI never fabricates posts—it extracts real color histograms, OCR typography, layout patterns, and tone directly from your uploaded reference visuals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleSocialPosts}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-semibold text-[11px] shrink-0 cursor-pointer transition-colors"
              >
                Load Sample Reference Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instagram / Social Profile URL (Optional Attribution)
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/brandname/"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sample Post Caption / Copy (Optional for Brand Voice)
                </label>
                <input
                  type="text"
                  value={socialCaptionSample}
                  onChange={e => setSocialCaptionSample(e.target.value)}
                  placeholder="Paste a typical post caption to analyze tone and messaging..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reference Post Image Uploader */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Reference Post Images or Screenshots ({socialRefImages.length}/6)
                </label>
                {socialRefImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSocialRefImages([])}
                    className="text-[11px] text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    Clear All Images
                  </button>
                )}
              </div>

              <input
                ref={socialFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={e => handleSocialFilesSelected(e.target.files)}
                className="hidden"
              />

              <div
                onClick={() => socialFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
              >
                <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-slate-800">
                  Click to upload reference social post images or screenshots
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports PNG, JPG, WebP (up to 6 images, max 10 MB each)
                </div>
              </div>

              {socialRefImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {socialRefImages.map((img, idx) => (
                    <div
                      key={`${img.filename}-${idx}`}
                      className="relative group rounded-lg border border-slate-200 bg-white p-2 shadow-2xs"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.filename}
                        className="w-full h-24 object-contain rounded bg-slate-900/5"
                      />
                      <div className="text-[10px] font-medium text-slate-700 truncate mt-1">
                        {img.filename}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSocialRefImages(prev => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/75 text-white hover:bg-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAnalyzingSocial}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isAnalyzingSocial ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Social Posts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Social Reference Content</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Honest Error Display */}
        {analysisError && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Analysis Notice</div>
              <p className="text-[11px] text-rose-800 leading-relaxed">{analysisError}</p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 4. EXTRACTED RULES DASHBOARD, 5. UPLOAD & VERIFY, 6. RESULTS      */}
      {/* ================================================================= */}
      {workingDna && (
        <WebsiteRuleVerificationEngine
          activeBrand={activeBrand}
          workingDna={workingDna}
          setWorkingDna={setWorkingDna}
          extractedItems={extractedItems}
          setExtractedItems={setExtractedItems}
          crawledPages={crawledPages}
          websiteUrl={websiteUrl}
          handleRescanWebsite={handleRescanWebsite}
          isRescanningWebsite={isRescanningWebsite}
          triggerToast={triggerToast}
        />
      )}
    </div>
  );
}

function InfoIcon() {
  return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
}
