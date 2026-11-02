import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  FileText,
  Clock,
  Plus,
  Upload,
  MoreVertical,
  Search,
  Sliders,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Image as ImageIcon,
  ImagePlus,
  ShoppingBag,
  Loader2,
  Save,
  BookOpen,
  Edit3,
  Copy,
  Play,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Palette,
  Scan,
  ShieldAlert,
  Ban,
  MessageSquare,
  Scale,
  BarChart3,
  Type,
  Eye,
  Building2,
  ArrowRight,
  ExternalLink,
  FileCheck,
  ShieldCheck,
  Dna
} from 'lucide-react';
import {
  BrandProfile,
  BrandRule,
  RuleApprovalStatus,
  BrandProduct,
  BrandProductStatus
} from '../types.ts';

interface BrandKnowledgeWorkspaceProps {
  activeBrand: BrandProfile;
  brands: Record<string, BrandProfile>;
  activeBrandId: string;
  onSelectBrand: (brandId: string) => void;
  onOpenAddBrandModal: () => void;
  onOpenRemoveBrandModal: (brand: BrandProfile, e: React.MouseEvent) => void;
  onOpenCreateRule: (mode: 'manual' | 'ai_text' | 'pdf' | 'test') => void;
  onOpenEditRule: (rule: BrandRule) => void;
  onOpenTestRule: (rule: BrandRule) => void;
  onToggleRuleApproval: (rule: BrandRule, targetStatus: RuleApprovalStatus) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
  onDuplicateRule: (rule: BrandRule) => Promise<void>;
  onOpenDeleteAllModal: () => void;
  onUndoRuleAction: () => void;
  isUndoingRules: boolean;
  undoStackEntries: { rules: BrandRule[]; label: string; timestamp: string }[];
  ruleSearchQuery: string;
  setRuleSearchQuery: (q: string) => void;
  onNavigateToDna: () => void;
  onBrandUpdated?: (updatedBrand: BrandProfile) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

const RULES_PER_PAGE = 8;

const PRODUCT_CATEGORIES = [
  'Merchandise',
  'Apparel',
  'Stationery',
  'Hardware & Terminals',
  'Digital & SaaS',
  'Packaging'
];

export default function BrandKnowledgeWorkspace({
  activeBrand,
  brands,
  activeBrandId,
  onSelectBrand,
  onOpenAddBrandModal,
  onOpenRemoveBrandModal,
  onOpenCreateRule,
  onOpenEditRule,
  onOpenTestRule,
  onToggleRuleApproval,
  onDeleteRule,
  onDuplicateRule,
  onOpenDeleteAllModal,
  onUndoRuleAction,
  isUndoingRules,
  undoStackEntries,
  ruleSearchQuery,
  setRuleSearchQuery,
  onNavigateToDna,
  onBrandUpdated,
  triggerToast
}: BrandKnowledgeWorkspaceProps) {
  // Primary Workspace Tabs: 'rules' | 'assets' | 'sources' | 'products'
  const [activeMainTab, setActiveMainTab] = useState<'rules' | 'assets' | 'sources' | 'products'>('rules');

  // Header Menus
  const [isHeaderBrandOpen, setIsHeaderBrandOpen] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);

  // Attention Banner Dismiss State
  const [isAttentionBannerDismissed, setIsAttentionBannerDismissed] = useState(false);

  // Filters State (Rules)
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [severityFilter, setSeverityFilter] = useState<string>('All Severities');
  const [sourceFilter, setSourceFilter] = useState<string>('All Sources');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Row 3-dot Menu & Delete Confirmation Modal State
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [rulePendingDelete, setRulePendingDelete] = useState<BrandRule | null>(null);
  const [isDeletingSingleRule, setIsDeletingSingleRule] = useState<boolean>(false);

  // =========================================================================
  // PRODUCTS TAB STATE & FORM
  // =========================================================================
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All Categories');
  const [productStatusFilter, setProductStatusFilter] = useState<string>('All Statuses');
  const [isProductFiltersOpen, setIsProductFiltersOpen] = useState<boolean>(false);
  const [productVerifiedPriceOnly, setProductVerifiedPriceOnly] = useState<boolean>(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [openProductMenuId, setOpenProductMenuId] = useState<string | null>(null);

  // Right-hand Add / Edit Product Panel
  const [isProductPanelOpen, setIsProductPanelOpen] = useState<boolean>(true);
  const [productInputMethod, setProductInputMethod] = useState<'upload_image' | 'product_label' | 'manual_entry'>('upload_image');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductFormInPanel, setShowProductFormInPanel] = useState<boolean>(false);

  // AI Image Extraction & Identifier Lookup State
  const [isExtractingProductImage, setIsExtractingProductImage] = useState<boolean>(false);
  const [productIdentifierQuery, setProductIdentifierQuery] = useState<string>('');
  const [isLookingUpProduct, setIsLookingUpProduct] = useState<boolean>(false);
  const [isSavingProduct, setIsSavingProduct] = useState<boolean>(false);
  const [extractedOcrPreview, setExtractedOcrPreview] = useState<string>('');
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // Editable Product Details Form State
  const [prodFormName, setProdFormName] = useState<string>('');
  const [prodFormBrandName, setProdFormBrandName] = useState<string>(activeBrand?.name || 'NovaPay');
  const [prodFormSubtitle, setProdFormSubtitle] = useState<string>('');
  const [prodFormCategory, setProdFormCategory] = useState<string>('Merchandise');
  const [prodFormSku, setProdFormSku] = useState<string>('');
  const [prodFormStatus, setProdFormStatus] = useState<BrandProductStatus>('Active');
  const [prodFormImageUrl, setProdFormImageUrl] = useState<string>('');
  const [prodFormDescription, setProdFormDescription] = useState<string>('');
  const [prodFormSpecifications, setProdFormSpecifications] = useState<string>('');
  const [prodFormPrice, setProdFormPrice] = useState<string>('');
  const [prodFormPriceVerified, setProdFormPriceVerified] = useState<boolean>(false);
  const [prodFormPackaging, setProdFormPackaging] = useState<string>('');
  const [prodFormColors, setProdFormColors] = useState<string>('#2563EB, #0F172A');
  const [prodFormLogoPlacement, setProdFormLogoPlacement] = useState<string>('');
  const [prodFormVisualNotes, setProdFormVisualNotes] = useState<string>('');
  const [prodFormApprovedClaims, setProdFormApprovedClaims] = useState<string>('');
  const [prodFormProhibitedClaims, setProdFormProhibitedClaims] = useState<string>('');
  const [prodFormSourceRef, setProdFormSourceRef] = useState<string>('');
  const [prodFormSourceType, setProdFormSourceType] = useState<'manual' | 'image_ocr' | 'product_lookup' | 'official_catalog'>('manual');
  const [prodFormUncertainFields, setProdFormUncertainFields] = useState<string[]>([]);

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsHeaderBrandOpen(false);
      }
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setIsOverflowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ruleSearchQuery, categoryFilter, statusFilter, severityFilter, sourceFilter, activeBrandId]);

  // Dynamic Rule Counts
  const allRules = activeBrand?.rules || [];
  const totalRulesCount = allRules.length;
  const approvedCount = allRules.filter(r => r.status === 'Approved').length;
  const draftCount = allRules.filter(r => r.status === 'Draft').length;
  const unverifiedCount = allRules.filter(r => r.status === 'Unverified').length;
  const needsAttentionCount = draftCount + unverifiedCount;

  // Re-show attention banner if new draft/unverified rules appear
  useEffect(() => {
    if (needsAttentionCount > 0) {
      setIsAttentionBannerDismissed(false);
    }
  }, [needsAttentionCount]);

  // Distinct Sources for Advanced Filter & Sources Tab
  const distinctSources = useMemo(() => {
    const map = new Map<
      string,
      {
        sourceName: string;
        rules: BrandRule[];
        approvedCount: number;
        draftCount: number;
        unverifiedCount: number;
        categories: Set<string>;
      }
    >();

    allRules.forEach(r => {
      const key = (r.sourceDocumentName || r.sourceRef || 'Brand Guidelines').trim();
      const existing = map.get(key) || {
        sourceName: key,
        rules: [],
        approvedCount: 0,
        draftCount: 0,
        unverifiedCount: 0,
        categories: new Set<string>()
      };
      existing.rules.push(r);
      if (r.status === 'Approved') existing.approvedCount += 1;
      else if (r.status === 'Draft') existing.draftCount += 1;
      else existing.unverifiedCount += 1;
      existing.categories.add(r.category);
      map.set(key, existing);
    });

    return Array.from(map.values());
  }, [allRules]);

  // Helper to get display category name matching reference image
  const getDisplayCategory = (rule: BrandRule): string => {
    if (rule.id === 'MSG-003' || rule.category === 'Pricing & Facts') {
      return 'Messaging & Claims';
    }
    if (rule.id === 'PRF-008' && rule.category === 'Performance & Claims') {
      return 'Legal & Compliance';
    }
    return rule.category;
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return allRules.filter(r => {
      // 1. Category Filter
      let matchesCat = true;
      if (categoryFilter !== 'All Categories') {
        const displayCat = getDisplayCategory(r);
        if (categoryFilter === 'Messaging & Claims') {
          matchesCat =
            r.category === 'Messaging & Claims' ||
            r.category === 'Pricing & Facts' ||
            r.category === 'Performance & Claims' ||
            displayCat === 'Messaging & Claims';
        } else if (categoryFilter === 'Prohibited Claim') {
          matchesCat = r.category === 'Prohibited Claim' || r.category === 'Prohibited Content';
        } else if (categoryFilter === 'Legal & Compliance') {
          matchesCat = r.category === 'Legal & Compliance' || displayCat === 'Legal & Compliance';
        } else {
          matchesCat = r.category === categoryFilter || displayCat === categoryFilter;
        }
      }

      // 2. Status Filter
      let matchesStatus = true;
      if (statusFilter === 'Approved') {
        matchesStatus = r.status === 'Approved';
      } else if (statusFilter === 'Draft') {
        matchesStatus = r.status === 'Draft';
      } else if (statusFilter === 'Unverified') {
        matchesStatus = r.status === 'Unverified';
      } else if (statusFilter === 'Needs Attention') {
        matchesStatus = r.status === 'Draft' || r.status === 'Unverified';
      }

      // 3. Severity Filter (Advanced)
      let matchesSev = true;
      if (severityFilter !== 'All Severities') {
        const ruleSev =
          r.severityLevel ||
          (r.severity === 'critical' ? 'Critical' : r.severity === 'warning' ? 'High' : 'Low');
        matchesSev = ruleSev === severityFilter;
      }

      // 4. Source Filter (Advanced)
      let matchesSource = true;
      if (sourceFilter !== 'All Sources') {
        matchesSource =
          r.sourceRef === sourceFilter ||
          r.sourceDocumentName === sourceFilter ||
          r.sourceRef.includes(sourceFilter);
      }

      // 5. Search Query
      const q = ruleSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.ruleStatement.toLowerCase().includes(q) ||
        r.approvedValue.toLowerCase().includes(q) ||
        r.sourceRef.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.targetPatterns.some(p => p.toLowerCase().includes(q));

      return matchesCat && matchesStatus && matchesSev && matchesSource && matchesSearch;
    });
  }, [allRules, categoryFilter, statusFilter, severityFilter, sourceFilter, ruleSearchQuery]);

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filteredRules.length / RULES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * RULES_PER_PAGE;
  const paginatedRules = filteredRules.slice(startIdx, startIdx + RULES_PER_PAGE);

  // Rule Icon Renderer (Matches Reference Image Row Icons)
  const renderRuleRowIcon = (rule: BrandRule) => {
    const idUpper = rule.id.toUpperCase();
    if (idUpper.startsWith('VIS-002') || (rule.category === 'Visual Identity' && rule.title.toLowerCase().includes('prohibited'))) {
      return (
        <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <Ban className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('VIS') || rule.category === 'Visual Identity') {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('MSG') || rule.category === 'Pricing & Facts' || rule.category === 'Messaging & Claims') {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('TER') || rule.category === 'Terminology') {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Type className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('PRH') || rule.category === 'Prohibited Claim' || rule.category === 'Prohibited Content') {
      return (
        <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('TON') || rule.category === 'Tone & Style') {
      return (
        <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4" />
        </div>
      );
    }
    if (idUpper.startsWith('PRF') || rule.category === 'Performance & Claims') {
      return (
        <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4" />
        </div>
      );
    }
    if (rule.category === 'Accessibility') {
      return (
        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Eye className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
        <Scale className="w-4 h-4" />
      </div>
    );
  };

  // Category Badge Styling (Matches Reference Image)
  const getCategoryBadgeClass = (displayCat: string) => {
    switch (displayCat) {
      case 'Visual Identity':
        return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      case 'Messaging & Claims':
      case 'Pricing & Facts':
        return 'bg-blue-50 text-blue-700 border border-blue-200/60';
      case 'Terminology':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'Prohibited Claim':
      case 'Prohibited Content':
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      case 'Tone & Style':
        return 'bg-teal-50 text-teal-700 border border-teal-200/60';
      case 'Legal & Compliance':
      case 'Performance & Claims':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'Accessibility':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Status Badge Styling (Matches Reference Image)
  const getStatusBadgeClass = (status: RuleApprovalStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'Draft':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'Unverified':
        return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!rulePendingDelete) return;
    setIsDeletingSingleRule(true);
    try {
      await onDeleteRule(rulePendingDelete.id);
      setRulePendingDelete(null);
    } finally {
      setIsDeletingSingleRule(false);
    }
  };

  const activeFilterCount =
    (categoryFilter !== 'All Categories' ? 1 : 0) +
    (statusFilter !== 'All Statuses' ? 1 : 0) +
    (severityFilter !== 'All Severities' ? 1 : 0) +
    (sourceFilter !== 'All Sources' ? 1 : 0) +
    (ruleSearchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setCategoryFilter('All Categories');
    setStatusFilter('All Statuses');
    setSeverityFilter('All Severities');
    setSourceFilter('All Sources');
    setRuleSearchQuery('');
  };

  // =========================================================================
  // PRODUCTS CATALOG HELPERS & HANDLERS
  // =========================================================================
  const allProducts = activeBrand?.products || [];

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (productCategoryFilter !== 'All Categories' && p.category !== productCategoryFilter) {
        return false;
      }
      if (productStatusFilter !== 'All Statuses' && p.status !== productStatusFilter) {
        return false;
      }
      if (productVerifiedPriceOnly && !p.priceVerified) {
        return false;
      }
      const q = productSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    });
  }, [allProducts, productCategoryFilter, productStatusFilter, productVerifiedPriceOnly, productSearchQuery]);

  const getProductCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Merchandise':
        return 'bg-blue-50 text-blue-600 border border-blue-200/60';
      case 'Apparel':
        return 'bg-purple-50 text-purple-600 border border-purple-200/60';
      case 'Stationery':
        return 'bg-rose-50 text-rose-600 border border-rose-200/60';
      case 'Hardware & Terminals':
        return 'bg-teal-50 text-teal-700 border border-teal-200/60';
      case 'Digital & SaaS':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getProductStatusBadgeClass = (status: BrandProductStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
      case 'Draft':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      case 'Unverified':
        return 'bg-purple-50 text-purple-600 border border-purple-200/60';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const populateProductForm = (prod: Partial<BrandProduct>, idToEdit: string | null = null) => {
    setEditingProductId(idToEdit);
    setProdFormName(prod.name || '');
    setProdFormBrandName(prod.brandName || activeBrand?.name || 'NovaPay');
    setProdFormSubtitle(prod.subtitle || '');
    setProdFormCategory(prod.category || 'Merchandise');
    setProdFormSku(prod.sku || '');
    setProdFormStatus(prod.status || 'Draft');
    setProdFormImageUrl(prod.imageUrl || '');
    setProdFormDescription(prod.description || '');
    setProdFormSpecifications(prod.specifications || '');
    setProdFormPrice(prod.price || '');
    setProdFormPriceVerified(Boolean(prod.priceVerified));
    setProdFormPackaging(prod.packagingDetails || '');
    setProdFormColors(
      Array.isArray(prod.colors) && prod.colors.length > 0
        ? prod.colors.join(', ')
        : `${activeBrand?.primaryColor || '#2563EB'}, #0F172A`
    );
    setProdFormLogoPlacement(prod.logoPlacement || 'Official horizontal brand wordmark lockup');
    setProdFormVisualNotes(prod.visualIdentityNotes || '');
    setProdFormApprovedClaims(Array.isArray(prod.approvedClaims) ? prod.approvedClaims.join('\n') : '');
    setProdFormProhibitedClaims(Array.isArray(prod.prohibitedClaims) ? prod.prohibitedClaims.join('\n') : '');
    setProdFormSourceRef(prod.sourceRef || `${activeBrand?.name || 'Brand'} Product Catalog`);
    setProdFormSourceType(prod.sourceType || 'manual');
    setProdFormUncertainFields(Array.isArray(prod.uncertainFields) ? prod.uncertainFields : []);
  };

  const handleOpenAddProductPanel = (method: 'upload_image' | 'product_label' | 'manual_entry' = 'upload_image') => {
    setEditingProductId(null);
    setExtractedOcrPreview('');
    setProductInputMethod(method);
    setIsProductPanelOpen(true);
    if (method === 'manual_entry') {
      populateProductForm(
        {
          name: '',
          brandName: activeBrand?.name || 'NovaPay',
          subtitle: '',
          category: 'Merchandise',
          sku: `NP-PRD-00${allProducts.length + 1}`,
          status: 'Draft',
          priceVerified: false,
          colors: [activeBrand?.primaryColor || '#2563EB', '#0F172A'],
          logoPlacement: 'Centered horizontal lockup with minimum 16px clear space',
          sourceRef: `${activeBrand?.name || 'NovaPay'} Product Catalog 2026`,
          sourceType: 'manual',
          uncertainFields: []
        },
        null
      );
      setShowProductFormInPanel(true);
    } else {
      setShowProductFormInPanel(false);
    }
  };

  const handleOpenEditProduct = (product: BrandProduct) => {
    populateProductForm(product, product.id);
    setProductInputMethod('manual_entry');
    setShowProductFormInPanel(true);
    setIsProductPanelOpen(true);
  };

  const handleProductImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      triggerToast('Image exceeds 10MB limit. Please choose a smaller PNG, JPG, or WEBP file.', 'error');
      return;
    }

    setIsExtractingProductImage(true);
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`/api/brands/${activeBrand.id}/products/extract-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image,
          filename: file.name,
          mimeType: file.type || 'image/png'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image extraction failed');

      populateProductForm(data.extractedProduct, null);
      setExtractedOcrPreview(data.ocrText || '');
      setShowProductFormInPanel(true);
      triggerToast(
        `Extracted product details from "${file.name}" (${
          (data.extractedProduct?.uncertainFields || []).length
        } field(s) marked for human verification).`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Could not extract product from image: ${err?.message}`, 'error');
    } finally {
      setIsExtractingProductImage(false);
      if (productImageInputRef.current) productImageInputRef.current.value = '';
    }
  };

  const handleLookupProductByIdentifier = async (customQuery?: string) => {
    const queryToUse = (customQuery ?? productIdentifierQuery).trim();
    if (!queryToUse) {
      triggerToast('Enter a product name, SKU, barcode, model number, or URL first.', 'error');
      return;
    }
    setIsLookingUpProduct(true);
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/products/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: queryToUse })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');

      populateProductForm(data.product, null);
      setShowProductFormInPanel(true);
      triggerToast(`Fetched product details from ${data.lookupSource || 'catalog lookup'}.`, 'success');
    } catch (err: any) {
      triggerToast(`Product lookup failed: ${err?.message}`, 'error');
    } finally {
      setIsLookingUpProduct(false);
    }
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) {
      triggerToast('Product name is required.', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        name: prodFormName.trim(),
        brandName: prodFormBrandName.trim() || activeBrand.name,
        subtitle: prodFormSubtitle.trim() || `${prodFormCategory} item`,
        category: prodFormCategory,
        sku: prodFormSku.trim() || `NP-PRD-00${allProducts.length + 1}`,
        status: prodFormStatus,
        imageUrl: prodFormImageUrl.trim() || undefined,
        description: prodFormDescription.trim(),
        specifications: prodFormSpecifications.trim(),
        price: prodFormPrice.trim(),
        priceVerified: prodFormPriceVerified,
        packagingDetails: prodFormPackaging.trim(),
        colors: prodFormColors
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        logoPlacement: prodFormLogoPlacement.trim(),
        visualIdentityNotes: prodFormVisualNotes.trim(),
        approvedClaims: prodFormApprovedClaims
          .split(/\r?\n|,/)
          .map(s => s.trim())
          .filter(Boolean),
        prohibitedClaims: prodFormProhibitedClaims
          .split(/\r?\n|,/)
          .map(s => s.trim())
          .filter(Boolean),
        sourceRef: prodFormSourceRef.trim() || `${activeBrand.name} Product Catalog`,
        sourceType: prodFormSourceType,
        uncertainFields: prodFormUncertainFields
      };

      const url = editingProductId
        ? `/api/brands/${activeBrand.id}/products/${editingProductId}`
        : `/api/brands/${activeBrand.id}/products`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      if (onBrandUpdated && data.brand) {
        onBrandUpdated(data.brand);
      }

      triggerToast(
        editingProductId
          ? `Updated "${data.product.name}" (${data.product.sku}) in ${activeBrand.name} catalog.`
          : `Added "${data.product.name}" (${data.product.sku}) to ${activeBrand.name} catalog.`,
        'success'
      );
      setEditingProductId(null);
      setShowProductFormInPanel(false);
      setProductInputMethod('upload_image');
    } catch (err: any) {
      triggerToast(`Save product failed: ${err?.message}`, 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleUpdateProductStatusQuick = async (product: BrandProduct, newStatus: BrandProductStatus) => {
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          uncertainFields: newStatus === 'Active' ? [] : product.uncertainFields
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      if (onBrandUpdated && data.brand) onBrandUpdated(data.brand);
      triggerToast(`Marked "${product.name}" as ${newStatus}.`, 'success');
    } catch (err: any) {
      triggerToast(`Status update failed: ${err?.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (product: BrandProduct) => {
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/products/${product.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      if (onBrandUpdated && data.brand) onBrandUpdated(data.brand);
      if (editingProductId === product.id) {
        setEditingProductId(null);
        setShowProductFormInPanel(false);
      }
      triggerToast(`Deleted "${product.name}" (${product.sku}) from catalog.`, 'info');
    } catch (err: any) {
      triggerToast(`Failed to delete product: ${err?.message}`, 'error');
    }
  };

  const handleSyncProductToBrandRule = async (product: BrandProduct) => {
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/products/${product.id}/sync-rule`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync product rule');
      if (onBrandUpdated && data.brand) onBrandUpdated(data.brand);
      triggerToast(
        `Synced "${product.name}" to Brand Rules (${data.rule?.id}) for automated content review!`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Could not sync product rule: ${err?.message}`, 'error');
    }
  };

  const toggleSelectProductCheckbox = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllProducts = () => {
    if (selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-5 pb-8">
      {/* ========================================================= */}
      {/* 1. BRAND KNOWLEDGE HEADER                                 */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">
            Enterprise Brand Governance Workspace
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Brand Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage approved brand rules, guidelines, and reference information used for content review.
          </p>
        </div>

        {/* Right Header Controls: Add New Rule + Import PDF + 3-Dot Overflow */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Primary Button: + Add New Rule */}
          <button
            type="button"
            onClick={() => onOpenCreateRule('manual')}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Rule</span>
          </button>

          {/* Secondary Button: Import Rules from PDF */}
          <button
            type="button"
            onClick={() => onOpenCreateRule('pdf')}
            className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200/90 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import Rules from PDF</span>
          </button>

          {/* Three-dot Overflow Menu for Secondary & Administrative Actions */}
          <div className="relative" ref={overflowMenuRef}>
            <button
              type="button"
              onClick={() => setIsOverflowMenuOpen(prev => !prev)}
              className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 rounded-xl shadow-2xs flex items-center justify-center cursor-pointer transition-colors relative"
              title="More rule management actions"
            >
              <MoreVertical className="w-4 h-4" />
              {undoStackEntries.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2" />
              )}
            </button>

            {isOverflowMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Rule Management Actions
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOverflowMenuOpen(false);
                    onOpenCreateRule('ai_text');
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">AI Rule Assist</div>
                    <div className="text-[10px] text-slate-500">Describe rule in plain language</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isUndoingRules || undoStackEntries.length === 0}
                  onClick={() => {
                    setIsOverflowMenuOpen(false);
                    onUndoRuleAction();
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 font-medium ${
                    undoStackEntries.length > 0
                      ? 'text-amber-900 hover:bg-amber-50/70 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Undo Last Deletion</span>
                  </div>
                  {undoStackEntries.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {undoStackEntries.length}
                    </span>
                  )}
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  disabled={totalRulesCount === 0}
                  onClick={() => {
                    setIsOverflowMenuOpen(false);
                    onOpenDeleteAllModal();
                  }}
                  className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 font-medium ${
                    totalRulesCount > 0
                      ? 'text-rose-600 hover:bg-rose-50/70 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-semibold">Delete All Rules...</div>
                    <div className="text-[10px] opacity-80">Requires security captcha</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR SUMMARY CARDS (Matching Reference Image Layout)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rules */}
        <div
          onClick={() => {
            setStatusFilter('All Statuses');
            setActiveMainTab('rules');
          }}
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all hover:border-blue-300 ${
            statusFilter === 'All Statuses' && activeMainTab === 'rules'
              ? 'border-slate-200/90'
              : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Total Rules</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {totalRulesCount}
              </div>
              <div className="text-[11px] text-slate-500 truncate">Across all categories</div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-blue-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: totalRulesCount > 0 ? '55%' : '0%' }}
            />
          </div>
        </div>

        {/* Card 2: Approved */}
        <div
          onClick={() => {
            setStatusFilter(statusFilter === 'Approved' ? 'All Statuses' : 'Approved');
            setActiveMainTab('rules');
          }}
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all hover:border-emerald-300 ${
            statusFilter === 'Approved' ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Approved</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {approvedCount}
              </div>
              <div className="text-[11px] text-slate-500 truncate">Active in review engine</div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-emerald-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: totalRulesCount > 0 ? `${Math.round((approvedCount / totalRulesCount) * 100)}%` : '0%'
              }}
            />
          </div>
        </div>

        {/* Card 3: Draft */}
        <div
          onClick={() => {
            setStatusFilter(statusFilter === 'Draft' ? 'All Statuses' : 'Draft');
            setActiveMainTab('rules');
          }}
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all hover:border-amber-300 ${
            statusFilter === 'Draft' ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Draft</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {draftCount}
              </div>
              <div className="text-[11px] text-slate-500 truncate">Not yet active</div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-amber-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{
                width: totalRulesCount > 0 ? `${Math.max(draftCount > 0 ? 18 : 0, Math.round((draftCount / totalRulesCount) * 100))}%` : '0%'
              }}
            />
          </div>
        </div>

        {/* Card 4: Unverified */}
        <div
          onClick={() => {
            setStatusFilter(statusFilter === 'Unverified' ? 'All Statuses' : 'Unverified');
            setActiveMainTab('rules');
          }}
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all hover:border-purple-300 ${
            statusFilter === 'Unverified' ? 'border-purple-400 ring-1 ring-purple-400/30' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Unverified</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {unverifiedCount}
              </div>
              <div className="text-[11px] text-slate-500 truncate">Needs verification</div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-purple-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{
                width: totalRulesCount > 0 ? `${Math.max(unverifiedCount > 0 ? 18 : 0, Math.round((unverifiedCount / totalRulesCount) * 100))}%` : '0%'
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ATTENTION CALLOUT BANNER & UNDO BANNER                 */}
      {/* ========================================================= */}
      {undoStackEntries.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Recent deletion:{' '}
              <strong>{undoStackEntries[undoStackEntries.length - 1].label}</strong> at{' '}
              {undoStackEntries[undoStackEntries.length - 1].timestamp}.
            </span>
          </div>
          <button
            type="button"
            onClick={onUndoRuleAction}
            disabled={isUndoingRules}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isUndoingRules ? 'Restoring...' : 'Undo Last Deletion'}</span>
          </button>
        </div>
      )}

      {!isAttentionBannerDismissed && needsAttentionCount > 0 && activeMainTab === 'rules' && (
        <div className="bg-[#FFFBEB] border border-amber-200/90 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 fill-amber-500 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {needsAttentionCount} {needsAttentionCount === 1 ? 'rule needs' : 'rules need'} attention
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {draftCount} Draft and {unverifiedCount} Unverified {unverifiedCount === 1 ? 'rule are' : 'rules are'} not used by the review engine.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('rules');
                setStatusFilter(statusFilter === 'Needs Attention' ? 'All Statuses' : 'Needs Attention');
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{statusFilter === 'Needs Attention' ? 'Show All Rules' : 'View Details'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              type="button"
              onClick={() => setIsAttentionBannerDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-amber-100/50 cursor-pointer transition-colors"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FOUR MAIN NAVIGATION TABS                              */}
      {/*    1. Rules | 2. Brand Assets | 3. Sources & Guidelines | 4. Products */}
      {/* ========================================================= */}
      <div className="border-b border-slate-200 flex items-center gap-8 overflow-x-auto scrollbar-none pt-1">
        <button
          type="button"
          onClick={() => setActiveMainTab('rules')}
          className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeMainTab === 'rules'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeMainTab === 'rules' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('assets')}
          className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeMainTab === 'assets'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <ImageIcon className={`w-4 h-4 ${activeMainTab === 'assets' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Brand Assets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('sources')}
          className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeMainTab === 'sources'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeMainTab === 'sources' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Sources & Guidelines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('products')}
          className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeMainTab === 'products'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${activeMainTab === 'products' ? 'text-blue-600' : 'text-slate-400 font-bold'}`} />
          <span>Products</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: RULES TABLE & FILTERS                              */}
      {/* ========================================================= */}
      {activeMainTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-visible">
          {/* Search & Filters Header Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={ruleSearchQuery}
                onChange={e => setRuleSearchQuery(e.target.value)}
                placeholder="Search rules by title, keywords, or source..."
                className="w-full h-9 pl-9 pr-8 text-xs border border-slate-200/90 rounded-xl bg-[#F8FAFC] focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {ruleSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRuleSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category, Status & Advanced Filters Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Category</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="h-9 border border-slate-200/90 rounded-xl px-3 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Visual Identity">Visual Identity</option>
                  <option value="Messaging & Claims">Messaging & Claims</option>
                  <option value="Terminology">Terminology</option>
                  <option value="Prohibited Claim">Prohibited Claim</option>
                  <option value="Tone & Style">Tone & Style</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                  <option value="Accessibility">Accessibility</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Status</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 border border-slate-200/90 rounded-xl px-3 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Draft">Draft</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Needs Attention">Needs Attention (Draft & Unverified)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isAdvancedFiltersOpen || severityFilter !== 'All Severities' || sourceFilter !== 'All Sources'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters Drawer */}
          {isAdvancedFiltersOpen && (
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">Severity:</span>
                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                    className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs bg-white text-slate-800 font-medium"
                  >
                    <option value="All Severities">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">Source Document:</span>
                  <select
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs bg-white text-slate-800 font-medium max-w-xs"
                  >
                    <option value="All Sources">All Sources</option>
                    {distinctSources.map(src => (
                      <option key={src.sourceName} value={src.sourceName}>
                        {src.sourceName} ({src.rules.length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Rules Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4 font-semibold w-36">Rule ID</th>
                  <th className="py-3 px-4 font-semibold">Rule Name & Description</th>
                  <th className="py-3 px-4 font-semibold w-44">Category</th>
                  <th className="py-3 px-4 font-semibold w-32">Status</th>
                  <th className="py-3 px-4 font-semibold w-56">Source</th>
                  <th className="py-3 px-4 font-semibold text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <div className="font-semibold text-slate-700">
                          {totalRulesCount === 0
                            ? `No rules configured for ${activeBrand?.name || 'this brand'}`
                            : 'No rules match your current search and filter criteria'}
                        </div>
                        <p className="text-xs text-slate-400 max-w-md">
                          {totalRulesCount === 0
                            ? 'Click "+ Add New Rule" or "Import Rules from PDF" to populate your brand knowledge base.'
                            : 'Try clearing your search query or switching category and status filters.'}
                        </p>
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={resetAllFilters}
                            className="mt-1 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRules.map(rule => {
                    const displayCategory = getDisplayCategory(rule);
                    return (
                      <tr
                        key={rule.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Column 1: Icon + Rule ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {renderRuleRowIcon(rule)}
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              {rule.id}
                            </span>
                          </div>
                        </td>

                        {/* Column 2: Rule Name & Description */}
                        <td className="py-3.5 px-4 max-w-md">
                          <button
                            type="button"
                            onClick={() => onOpenEditRule(rule)}
                            className="text-left group-hover:text-blue-600 transition-colors cursor-pointer block w-full"
                          >
                            <div className="font-bold text-slate-900 text-[13px] leading-snug">
                              {rule.title}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-1">
                              {rule.ruleStatement}
                            </p>
                          </button>
                        </td>

                        {/* Column 3: Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getCategoryBadgeClass(
                              displayCategory
                            )}`}
                          >
                            {displayCategory}
                          </span>
                        </td>

                        {/* Column 4: Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getStatusBadgeClass(
                              rule.status
                            )}`}
                          >
                            {rule.status}
                          </span>
                        </td>

                        {/* Column 5: Source */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {rule.sourceRef}
                        </td>

                        {/* Column 6: Three-dot Actions Menu */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                          <button
                            type="button"
                            onClick={() => setOpenRowMenuId(openRowMenuId === rule.id ? null : rule.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Rule actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openRowMenuId === rule.id && (
                            <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuId(null);
                                  onOpenEditRule(rule);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Rule</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuId(null);
                                  onOpenTestRule(rule);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Play className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Test Rule</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuId(null);
                                  onDuplicateRule(rule);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duplicate Rule</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              {rule.status !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenRowMenuId(null);
                                    onToggleRuleApproval(rule, 'Approved');
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark as Approved</span>
                                </button>
                              )}

                              {rule.status !== 'Draft' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenRowMenuId(null);
                                    onToggleRuleApproval(rule, 'Draft');
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Move to Draft</span>
                                </button>
                              )}

                              {rule.status !== 'Unverified' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenRowMenuId(null);
                                    onToggleRuleApproval(rule, 'Unverified');
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Mark Unverified</span>
                                </button>
                              )}

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuId(null);
                                  setRulePendingDelete(rule);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50/70 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete Rule</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & Results Footer */}
          <div className="px-4 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              {filteredRules.length === 0 ? (
                <span>Showing 0 rules</span>
              ) : (
                <span>
                  Showing <strong className="font-semibold text-slate-700">{startIdx + 1}–{Math.min(startIdx + RULES_PER_PAGE, filteredRules.length)}</strong> of{' '}
                  <strong className="font-semibold text-slate-700">{filteredRules.length}</strong> rules
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                    safeCurrentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BRAND ASSETS (Logo Specs & Brand Color Palette)    */}
      {/* ========================================================= */}
      {activeMainTab === 'assets' && (
        <div className="space-y-5">
          {/* Top Asset Summary Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Visual Identity Assets & Specifications — {activeBrand.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official logo lockups, prohibited visual variants, and approved hex color tolerances enforced during image and multimodal content audits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onNavigateToDna}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Dna className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Brand DNA Analyzer</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreateRule('manual')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Visual Rule</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Logo Lockup Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Logo Lockup Specifications
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {activeBrand.approvedLogoRef?.sourceRef || 'Visual Guidelines §1.2'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Approved Logo Lockup</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-1.5">
                    {activeBrand.approvedLogoRef?.name || `${activeBrand.name} Official Horizontal Wordmark`}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeBrand.approvedLogoRef?.description ||
                      'Use the official horizontal wordmark with blue accent icon and maintain minimum 16px clear space on all sides.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-rose-950">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px] uppercase tracking-wider">
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>Prohibited Logo Variants</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {((activeBrand.approvedLogoRef as any)?.prohibitedVariants?.length ? ((activeBrand.approvedLogoRef as any).prohibitedVariants as string[]) : ["Circular red coin icon", "Standalone unapproved badge", "Altered serif typography", "Stretched or unproportionate aspect ratio"]).map((variant: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-[11px] font-medium"
                      >
                        ✕ {variant}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked Visual Identity Rules */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Linked Visual Identity Rules
                  </div>
                  <div className="space-y-2">
                    {allRules
                      .filter(r => r.category === 'Visual Identity')
                      .map(r => (
                        <div
                          key={r.id}
                          onClick={() => onOpenEditRule(r)}
                          className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[11px] font-bold text-slate-700">{r.id}</span>
                            <span className="font-semibold text-slate-900 truncate">{r.title}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Brand Color Palette */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Approved Brand Color Palette
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  {(activeBrand.approvedColors || []).length} Verified Swatches
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(activeBrand.approvedColors || []).map(color => (
                  <div
                    key={color.name}
                    onClick={() => {
                      navigator.clipboard?.writeText(color.hex);
                      triggerToast(`Copied ${color.name} (${color.hex}) to clipboard`, 'info');
                    }}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/40 hover:bg-white flex items-center gap-3 cursor-pointer transition-all group"
                    title="Click to copy HEX code"
                  >
                    <div
                      className="w-11 h-11 rounded-xl border border-slate-300/80 shadow-2xs shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{color.name}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{color.hex}</span>
                        {(color as any).usage && (<><span>·</span><span className="capitalize text-slate-600 font-sans truncate">{(color as any).usage}</span></>)}
                      </div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Visual Composition & Layout Guidelines */}
              {activeBrand.visualGuidelines && activeBrand.visualGuidelines.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Visual Composition & Typography Guidelines
                  </div>
                  <div className="space-y-2">
                    {activeBrand.visualGuidelines.map(vg => (
                      <div key={vg.id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">{vg.title}</span>
                          <span className="font-mono text-[10px] text-slate-500">{vg.sourceRef}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{(vg as any).rule || (vg as any).description || (vg as any).approvedStandard || (vg as any).ruleStatement || ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SOURCES & GUIDELINES                               */}
      {/* ========================================================= */}
      {activeMainTab === 'sources' && (
        <div className="space-y-5">
          {/* Top PDF & AI Extraction Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Authoritative Brand Guideline Sources & Citations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every approved rule in {activeBrand.name} is linked to a verifiable source document, page number, and policy section.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenCreateRule('ai_text')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Rule Assist</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreateRule('pdf')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Rules from PDF</span>
              </button>
            </div>
          </div>

          {/* Reference Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {distinctSources.map(src => (
              <div
                key={src.sourceName}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between gap-4 hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate" title={src.sourceName}>
                          {src.sourceName}
                        </h3>
                        <div className="text-[11px] text-slate-500">
                          {src.rules.length} linked {src.rules.length === 1 ? 'rule' : 'rules'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Linked Rule IDs */}
                  <div className="flex flex-wrap gap-1.5">
                    {src.rules.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onOpenEditRule(r)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-mono text-[10px] font-semibold cursor-pointer transition-colors"
                        title={`${r.id}: ${r.title}`}
                      >
                        {r.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-emerald-700 font-semibold">{src.approvedCount} Approved</span>
                    {src.draftCount > 0 && <span>· {src.draftCount} Draft</span>}
                    {src.unverifiedCount > 0 && <span>· {src.unverifiedCount} Unverified</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceFilter(src.sourceName);
                      setIsAdvancedFiltersOpen(true);
                      setActiveMainTab('rules');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Filter Rules</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PRODUCTS CATALOG & ADD / EDIT PRODUCT PANEL        */}
      {/* ========================================================= */}
      {activeMainTab === 'products' && (
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* LEFT COLUMN: PRODUCTS CATALOG TABLE CARD */}
          <div
            className={`w-full ${
              isProductPanelOpen ? 'lg:w-[64%] xl:w-[65%]' : 'lg:w-full'
            } bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-visible transition-all`}
          >
            {/* Card Header */}
            <div className="p-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Products</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your brand's product catalog. Add products manually or let AI fetch details from images or labels.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddProductPanel('upload_image')}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shrink-0 transition-colors self-start sm:self-center"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Search & Filters Bar */}
            <div className="px-5 pb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  placeholder="Search products by name, SKU, or category..."
                  className="w-full h-9 pl-9 pr-8 text-xs border border-slate-200/90 rounded-xl bg-[#F8FAFC] focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {productSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category, Status & Filters */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={productCategoryFilter}
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  className="h-9 border border-slate-200/90 rounded-xl px-3 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={e => setProductStatusFilter(e.target.value)}
                  className="h-9 border border-slate-200/90 rounded-xl px-3 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Unverified">Unverified</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsProductFiltersOpen(prev => !prev)}
                  className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isProductFiltersOpen || productVerifiedPriceOnly
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Expandable Product Filter Bar */}
            {isProductFiltersOpen && (
              <div className="px-5 py-2.5 bg-slate-50/80 border-t border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productVerifiedPriceOnly}
                    onChange={e => setProductVerifiedPriceOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show only products with verified pricing</span>
                </label>

                {(productCategoryFilter !== 'All Categories' ||
                  productStatusFilter !== 'All Statuses' ||
                  productVerifiedPriceOnly ||
                  productSearchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductCategoryFilter('All Categories');
                      setProductStatusFilter('All Statuses');
                      setProductVerifiedPriceOnly(false);
                      setProductSearchQuery('');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Reset Product Filters
                  </button>
                )}
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200/70 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 pl-5 pr-2 w-9">
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length > 0 &&
                          selectedProductIds.size === filteredProducts.length
                        }
                        onChange={toggleSelectAllProducts}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all products"
                      />
                    </th>
                    <th className="py-3 px-3 font-semibold">Product</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold">SKU / Model</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Last Updated</th>
                    <th className="py-3 pl-3 pr-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                          <div className="font-semibold text-slate-700">
                            No products match your current filter
                          </div>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Click "+ Add Product" to add a product via image OCR, product label/SKU lookup, or manual entry.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const isEditingThis = editingProductId === product.id && showProductFormInPanel;
                      return (
                        <tr
                          key={product.id}
                          onClick={() => handleOpenEditProduct(product)}
                          className={`transition-colors cursor-pointer group ${
                            isEditingThis ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-3.5 pl-5 pr-2 whitespace-nowrap"
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedProductIds.has(product.id)}
                              onChange={() => toggleSelectProductCheckbox(product.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label={`Select ${product.name}`}
                            />
                          </td>

                          {/* Product Thumbnail + Name + Subtitle */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-xl bg-slate-100/80 border border-slate-200/70 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-[13px] leading-snug group-hover:text-blue-600 transition-colors truncate">
                                  {product.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  {product.subtitle}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Pill */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getProductCategoryBadgeClass(
                                product.category
                              )}`}
                            >
                              {product.category}
                            </span>
                          </td>

                          {/* SKU / Model */}
                          <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">
                            {product.sku}
                          </td>

                          {/* Status Pill */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getProductStatusBadgeClass(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                            {product.updatedAt}
                          </td>

                          {/* Actions 3-dot Menu */}
                          <td
                            className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap relative"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenProductMenuId(
                                  openProductMenuId === product.id ? null : product.id
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                              title="Product actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openProductMenuId === product.id && (
                              <div className="absolute right-5 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenProductMenuId(null);
                                    handleOpenEditProduct(product);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View / Edit Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenProductMenuId(null);
                                    handleSyncProductToBrandRule(product);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Sync to Brand Rules</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                {product.status !== 'Active' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenProductMenuId(null);
                                      handleUpdateProductStatusQuick(product, 'Active');
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Mark as Active</span>
                                  </button>
                                )}

                                {product.status !== 'Draft' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenProductMenuId(null);
                                      handleUpdateProductStatusQuick(product, 'Draft');
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Move to Draft</span>
                                  </button>
                                )}

                                {product.status !== 'Unverified' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenProductMenuId(null);
                                      handleUpdateProductStatusQuick(product, 'Unverified');
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-50/60 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Mark Unverified</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenProductMenuId(null);
                                    handleDeleteProduct(product);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50/70 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Product</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Table Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="font-semibold text-slate-700">{filteredProducts.length}</strong> of{' '}
                <strong className="font-semibold text-slate-700">{allProducts.length}</strong> products
              </span>
              <span className="text-[11px] text-slate-400">
                Active products are enforced in Review Content compliance audits
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: ADD / EDIT PRODUCT PANEL (Matches Reference Image) */}
          {isProductPanelOpen && (
            <div className="w-full lg:w-[36%] xl:w-[35%] bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              {/* Panel Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {editingProductId ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingProductId
                      ? 'Update verified specifications, visual rules, and product claims.'
                      : 'Choose how you want to add a product.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductPanelOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Three Input Method Cards: Upload Image | Product Label | Manual Entry */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setProductInputMethod('upload_image');
                    if (!editingProductId) setShowProductFormInPanel(false);
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                    productInputMethod === 'upload_image'
                      ? 'bg-blue-50/50 border-blue-500 text-blue-600 ring-1 ring-blue-500/15'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                  }`}
                >
                  <ImagePlus
                    className={`w-5 h-5 ${
                      productInputMethod === 'upload_image' ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductInputMethod('product_label');
                    if (!editingProductId) setShowProductFormInPanel(false);
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                    productInputMethod === 'product_label'
                      ? 'bg-blue-50/50 border-blue-500 text-blue-600 ring-1 ring-blue-500/15'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                  }`}
                >
                  <Scan
                    className={`w-5 h-5 ${
                      productInputMethod === 'product_label' ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">Product Label</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductInputMethod('manual_entry');
                    if (!showProductFormInPanel) {
                      populateProductForm(
                        {
                          name: '',
                          brandName: activeBrand?.name || 'NovaPay',
                          subtitle: '',
                          category: 'Merchandise',
                          sku: `NP-PRD-00${allProducts.length + 1}`,
                          status: 'Draft',
                          priceVerified: false,
                          colors: [activeBrand?.primaryColor || '#2563EB', '#0F172A'],
                          logoPlacement: 'Official horizontal wordmark lockup',
                          sourceRef: `${activeBrand?.name || 'NovaPay'} Product Catalog 2026`,
                          sourceType: 'manual',
                          uncertainFields: []
                        },
                        null
                      );
                      setShowProductFormInPanel(true);
                    }
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                    productInputMethod === 'manual_entry'
                      ? 'bg-blue-50/50 border-blue-500 text-blue-600 ring-1 ring-blue-500/15'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                  }`}
                >
                  <Edit3
                    className={`w-5 h-5 ${
                      productInputMethod === 'manual_entry' ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">Manual Entry</span>
                </button>
              </div>

              {/* Hidden File Input for Product Image Upload */}
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleProductImageUpload(file);
                }}
              />

              {/* MODE 1: UPLOAD IMAGE VIEW (Matches Reference Screenshot) */}
              {productInputMethod === 'upload_image' && !showProductFormInPanel && (
                <div className="space-y-4">
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleProductImageUpload(file);
                    }}
                    className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 text-center space-y-3"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      {isExtractingProductImage ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <ImagePlus className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900">Upload product image</div>
                      <p className="text-xs text-slate-500">
                        Product photo, packaging, label or screenshot
                      </p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, WEBP (Max 10MB)</p>
                    </div>

                    <button
                      type="button"
                      disabled={isExtractingProductImage}
                      onClick={() => productImageInputRef.current?.click()}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {isExtractingProductImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Extracting with AI Vision & OCR...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Extraction Info Box (Matches Reference Screenshot) */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>AI will automatically extract:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 pl-5 list-disc marker:text-blue-500">
                      <li>Product name, brand and category</li>
                      <li>Text from label/packaging (OCR)</li>
                      <li>Visual identity (logo, colors, design)</li>
                      <li>Specifications and key details</li>
                      <li>Match with official sources when available</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* MODE 2: PRODUCT LABEL / IDENTIFIER LOOKUP */}
              {productInputMethod === 'product_label' && !showProductFormInPanel && (
                <div className="space-y-4">
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Product Label, SKU, Barcode, Model or URL
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        Enter a SKU, EAN/UPC barcode, model number, or official product page URL to fetch structured details.
                      </p>
                      <input
                        type="text"
                        value={productIdentifierQuery}
                        onChange={e => setProductIdentifierQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleLookupProductByIdentifier();
                          }
                        }}
                        placeholder="e.g., NP-WB-001, 3017620422003, or https://..."
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Quick Test Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">Try:</span>
                      {[
                        { label: 'NP-WB-001 (Bottle)', value: 'NP-WB-001' },
                        { label: 'NP-POS-2026 (Smart Terminal)', value: 'NovaPay Smart POS Terminal NP-POS-2026' },
                        { label: 'GTIN Barcode', value: '3017620422003' }
                      ].map(sample => (
                        <button
                          key={sample.value}
                          type="button"
                          onClick={() => {
                            setProductIdentifierQuery(sample.value);
                            handleLookupProductByIdentifier(sample.value);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200 text-[10px] font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isLookingUpProduct}
                      onClick={() => handleLookupProductByIdentifier()}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {isLookingUpProduct ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Fetching Product Specifications...</span>
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4" />
                          <span>Fetch Product Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-1.5 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Source-Verified Product Governance</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Fetched product records retain their source citation and automatically flag any unverified pricing or specifications for human review before activation.
                    </p>
                  </div>
                </div>
              )}

              {/* EDITABLE PRODUCT DETAILS FORM (Shown after extraction, lookup, or in Manual/Edit mode) */}
              {showProductFormInPanel && (
                <form onSubmit={handleSaveProductForm} className="space-y-3.5 text-xs border-t border-slate-100 pt-3.5">
                  {/* Uncertainty & Source Reference Banner */}
                  {prodFormUncertainFields.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Verification Required ({prodFormUncertainFields.length} uncertain fields)</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Please review and verify:{' '}
                        <strong className="font-semibold">{prodFormUncertainFields.join(', ')}</strong>. Do not mark status as Active until verified against official product documentation.
                      </p>
                    </div>
                  )}

                  {extractedOcrPreview && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700">Detected Label OCR: </span>
                      <span className="font-mono">{extractedOcrPreview.slice(0, 140)}</span>
                    </div>
                  )}

                  {/* Image Preview + Product Name & Brand */}
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => productImageInputRef.current?.click()}
                      className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-blue-400 transition-colors"
                      title="Click to upload or replace product image"
                    >
                      {prodFormImageUrl ? (
                        <img src={prodFormImageUrl} alt={prodFormName} className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={prodFormName}
                          onChange={e => setProdFormName(e.target.value)}
                          placeholder="e.g., NovaPay Water Bottle"
                          className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Short Subtitle
                        </label>
                        <input
                          type="text"
                          value={prodFormSubtitle}
                          onChange={e => setProdFormSubtitle(e.target.value)}
                          placeholder="e.g., Insulated stainless steel bottle"
                          className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category, SKU & Status */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Category
                      </label>
                      <select
                        value={prodFormCategory}
                        onChange={e => setProdFormCategory(e.target.value)}
                        className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium"
                      >
                        {PRODUCT_CATEGORIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        SKU / Model
                      </label>
                      <input
                        type="text"
                        value={prodFormSku}
                        onChange={e => setProdFormSku(e.target.value)}
                        placeholder="NP-WB-001"
                        className="w-full h-8 px-2.5 text-xs font-mono border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Status
                      </label>
                      <select
                        value={prodFormStatus}
                        onChange={e => setProdFormStatus(e.target.value as BrandProductStatus)}
                        className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-semibold"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Unverified">Unverified</option>
                      </select>
                    </div>
                  </div>

                  {/* Price & Verification Status */}
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Official Price {prodFormUncertainFields.includes('price') && <span className="text-amber-600">(Verify)</span>}
                      </label>
                      <input
                        type="text"
                        value={prodFormPrice}
                        onChange={e => setProdFormPrice(e.target.value)}
                        placeholder="e.g., ₹1,299"
                        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                    <label className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodFormPriceVerified}
                        onChange={e => {
                          setProdFormPriceVerified(e.target.checked);
                          if (e.target.checked) {
                            setProdFormUncertainFields(prev => prev.filter(f => f !== 'price'));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Price Verified</span>
                    </label>
                  </div>

                  {/* Description & Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Product Description
                      </label>
                      <textarea
                        rows={2}
                        value={prodFormDescription}
                        onChange={e => setProdFormDescription(e.target.value)}
                        placeholder="Overview of product and brand usage..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Specifications {prodFormUncertainFields.includes('specifications') && <span className="text-amber-600">(Verify)</span>}
                      </label>
                      <textarea
                        rows={2}
                        value={prodFormSpecifications}
                        onChange={e => setProdFormSpecifications(e.target.value)}
                        placeholder="Material, dimensions, capacity, model specs..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Packaging, Colors, Logo Placement & Visual Identity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Brand Colors (HEX)
                      </label>
                      <input
                        type="text"
                        value={prodFormColors}
                        onChange={e => setProdFormColors(e.target.value)}
                        placeholder="#2563EB, #0F172A"
                        className="w-full h-8 px-2.5 text-xs font-mono border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Logo Placement
                      </label>
                      <input
                        type="text"
                        value={prodFormLogoPlacement}
                        onChange={e => setProdFormLogoPlacement(e.target.value)}
                        placeholder="Centered horizontal wordmark"
                        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Packaging Details
                      </label>
                      <input
                        type="text"
                        value={prodFormPackaging}
                        onChange={e => setProdFormPackaging(e.target.value)}
                        placeholder="Matte cylinder tube / kraft hangtag"
                        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Visual Identity Notes
                      </label>
                      <input
                        type="text"
                        value={prodFormVisualNotes}
                        onChange={e => setProdFormVisualNotes(e.target.value)}
                        placeholder="Lockup clear space & finish notes"
                        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Approved & Prohibited Product-Specific Claims */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-700 mb-0.5">
                        Approved Product Claims
                      </label>
                      <textarea
                        rows={2}
                        value={prodFormApprovedClaims}
                        onChange={e => setProdFormApprovedClaims(e.target.value)}
                        placeholder="One approved claim per line"
                        className="w-full p-2 text-xs border border-emerald-200 rounded-lg bg-emerald-50/30 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rose-700 mb-0.5">
                        Prohibited Claims
                      </label>
                      <textarea
                        rows={2}
                        value={prodFormProhibitedClaims}
                        onChange={e => setProdFormProhibitedClaims(e.target.value)}
                        placeholder="One prohibited claim per line"
                        className="w-full p-2 text-xs border border-rose-200 rounded-lg bg-rose-50/30 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Source Reference */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Source Reference
                    </label>
                    <input
                      type="text"
                      value={prodFormSourceRef}
                      onChange={e => setProdFormSourceRef(e.target.value)}
                      placeholder="e.g., NovaPay Merchandise Catalog 2026 · §2.1"
                      className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
                    />
                  </div>

                  {/* Form Footer Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setShowProductFormInPanel(false);
                        setProductInputMethod('upload_image');
                      }}
                      className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isSavingProduct ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{editingProductId ? 'Update Product' : 'Save Product'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SINGLE RULE DELETE CONFIRMATION MODAL                     */}
      {/* ========================================================= */}
      {rulePendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Rule {rulePendingDelete.id}?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong>"{rulePendingDelete.title}"</strong> from{' '}
                  <strong>{activeBrand.name}</strong>? You can restore it afterward using Undo.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 text-xs">
              <button
                type="button"
                disabled={isDeletingSingleRule}
                onClick={() => setRulePendingDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingSingleRule}
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                {isDeletingSingleRule ? 'Deleting...' : 'Delete Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
