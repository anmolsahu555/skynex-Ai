import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
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
  ExternalLink,
  ShieldCheck,
  Edit3,
  Sliders,
  CheckSquare,
  Square,
  ChevronDown,
  Layers,
  FileCheck,
  ShoppingBag,
  Search,
  Info,
  Scale,
  Award,
  Database,
  Lock
} from 'lucide-react';
import {
  BrandProfile,
  BrandDnaProfile,
  BrandDnaColor,
  ExtractedBrandIntelligenceItem,
  DiscoveredWebPage,
  BrandDnaRescanDiffItem
} from '../types.ts';

export interface WebsiteIntelligenceSectionProps {
  activeBrand: BrandProfile;
  workingDna: BrandDnaProfile;
  setWorkingDna: React.Dispatch<React.SetStateAction<BrandDnaProfile | null>>;
  extractedItems: ExtractedBrandIntelligenceItem[];
  setExtractedItems: React.Dispatch<React.SetStateAction<ExtractedBrandIntelligenceItem[]>>;
  crawledPages: DiscoveredWebPage[];
  rescanDiffs: BrandDnaRescanDiffItem[] | null;
  setRescanDiffs: React.Dispatch<React.SetStateAction<BrandDnaRescanDiffItem[] | null>>;
  showRescanModal: boolean;
  setShowRescanModal: (show: boolean) => void;
  selectedItemIds: Set<string>;
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedTextItemIds: Set<string>;
  handleToggleExpandText: (id: string) => void;
  editingItemId: string | null;
  editingItemDraft: ExtractedBrandIntelligenceItem | null;
  setEditingItemDraft: React.Dispatch<React.SetStateAction<ExtractedBrandIntelligenceItem | null>>;
  handleStartEditItem: (item: ExtractedBrandIntelligenceItem) => void;
  handleSaveItemEdit: () => void;
  handleApproveItem: (id: string) => void;
  handleRejectItem: (id: string) => void;
  handleBatchApprove: () => void;
  handleBatchReject: () => void;
  handleApproveAllCurrent: (items: ExtractedBrandIntelligenceItem[]) => void;
  handleRescanWebsite: () => Promise<void>;
  isRescanningWebsite: boolean;
  handleSyncKnowledge: () => Promise<void>;
  isSyncingKnowledge: boolean;
  syncSummary: {
    rules?: number;
    assets?: number;
    sourceDocs?: number;
    products?: number;
    rulesAdded?: number;
    assetsUpdated?: number;
    sourcesAdded?: number;
    productsAdded?: number;
  } | null;
  websiteUrl: string;
  isEditingDna: boolean;
  setIsEditingDna: (editing: boolean) => void;
  handleUpdateColor: (idx: number, updates: Partial<BrandDnaColor>) => void;
  handleAddColorSwatch: () => void;
  handleRemoveColorSwatch: (idx: number) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export default function WebsiteIntelligenceSection({
  activeBrand,
  workingDna,
  setWorkingDna,
  extractedItems,
  setExtractedItems,
  crawledPages,
  rescanDiffs,
  setRescanDiffs,
  showRescanModal,
  setShowRescanModal,
  selectedItemIds,
  setSelectedItemIds,
  expandedTextItemIds,
  handleToggleExpandText,
  editingItemId,
  editingItemDraft,
  setEditingItemDraft,
  handleStartEditItem,
  handleSaveItemEdit,
  handleApproveItem,
  handleRejectItem,
  handleBatchApprove,
  handleBatchReject,
  handleApproveAllCurrent,
  handleRescanWebsite,
  isRescanningWebsite,
  handleSyncKnowledge,
  isSyncingKnowledge,
  syncSummary,
  websiteUrl,
  isEditingDna,
  setIsEditingDna,
  handleUpdateColor,
  handleAddColorSwatch,
  handleRemoveColorSwatch,
  triggerToast
}: WebsiteIntelligenceSectionProps) {
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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredItems = extractedItems.filter(item => {
    const matchCategory = activeDnaTab === 'all' || item.category === activeDnaTab;
    const matchStatus = statusFilter === 'all' || item.verificationStatus === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.originalExtractedText.toLowerCase().includes(q) ||
      item.aiExplanation.toLowerCase().includes(q) ||
      item.structuredRule.ruleStatement.toLowerCase().includes(q);
    return matchCategory && matchStatus && matchQuery;
  });

  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id));

  const handleToggleSelect = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
      {/* 1. Header Bar with Governance Counters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Website Intelligence & Brand DNA Profile — {activeBrand.name}</span>
              </h2>
              <span className="text-xs text-slate-500">
                · Confidence: <strong>{Math.round((workingDna.overallConfidence || 0.88) * 100)}%</strong>
                {' · '}
                {workingDna.aiUsed ? 'Multi-Page Crawl + Gemini AI' : 'Deterministic HTML/CSS Extraction'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Source: <span className="font-mono text-slate-700">{workingDna.sourceUrl || websiteUrl}</span>
              {' · '}
              Crawled {crawledPages.filter(p => p.status === 'crawled').length} accessible pages, reported{' '}
              <strong className="text-rose-600">
                {crawledPages.filter(p => p.status === 'inaccessible').length} restricted/inaccessible
              </strong>
            </p>
          </div>

          {/* Top Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleRescanWebsite}
              disabled={isRescanningWebsite}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Detect newly published pages or modified policy terms"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRescanningWebsite ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span>Rescan Website</span>
            </button>

            {rescanDiffs && rescanDiffs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRescanModal(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>View Rescan Diffs ({rescanDiffs.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncKnowledge}
              disabled={isSyncingKnowledge}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              title="Sync all approved rules, brand assets, source documents, and catalog products to Brand Knowledge"
            >
              {isSyncingKnowledge ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Knowledge...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Sync to Brand Knowledge</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Governance Counters & Sync Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="font-semibold text-slate-700">Governance Status:</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
              Total Extracted: {extractedItems.length}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Pending Review: {extractedItems.filter(i => i.verificationStatus === 'pending').length}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 inline-block" />
              Approved: {extractedItems.filter(i => i.verificationStatus === 'approved').length}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px] flex items-center gap-1">
              <X className="w-3 h-3 text-rose-600 inline-block" />
              Rejected: {extractedItems.filter(i => i.verificationStatus === 'rejected').length}
            </span>
          </div>

          {syncSummary && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Synced to Brand Knowledge: {syncSummary.rulesAdded ?? syncSummary.rules ?? 0} Rules,{' '}
                {syncSummary.assetsUpdated ?? syncSummary.assets ?? 0} Assets,{' '}
                {syncSummary.sourcesAdded ?? syncSummary.sourceDocs ?? 0} Sources,{' '}
                {syncSummary.productsAdded ?? syncSummary.products ?? 0} Products
              </span>
            </div>
          )}
        </div>

        {/* Mandatory Human Review Callout */}
        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Human Review Required:</span>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Extracted website policies and rules are not automatically approved. Review each finding below, expand the original text to audit verbatim statements, edit AI interpretations if required, and approve or reject items before syncing. Only <strong>Approved</strong> items are activated in the review engine and stored in the 4 existing Brand Knowledge tabs.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 5 Category Tabs + Discovered Pages + Visual Tokens */}
      <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 overflow-x-auto scrollbar-none bg-white">
        {[
          { id: 'all', label: `All Findings (${extractedItems.length})`, icon: Layers },
          {
            id: 'visual_identity',
            label: `A. Visual Identity (${extractedItems.filter(i => i.category === 'visual_identity').length})`,
            icon: Palette
          },
          {
            id: 'website_policies',
            label: `B. Policies & Rules (${extractedItems.filter(i => i.category === 'website_policies').length})`,
            icon: Scale
          },
          {
            id: 'product_intelligence',
            label: `C. Product Intelligence (${extractedItems.filter(i => i.category === 'product_intelligence').length})`,
            icon: ShoppingBag
          },
          {
            id: 'brand_communication',
            label: `D. Brand Communication (${extractedItems.filter(i => i.category === 'brand_communication').length})`,
            icon: MessageSquare
          },
          {
            id: 'approved_facts',
            label: `E. Approved Facts (${extractedItems.filter(i => i.category === 'approved_facts').length})`,
            icon: Award
          },
          {
            id: 'discovered_pages',
            label: `Discovered Pages (${crawledPages.length})`,
            icon: Globe
          },
          {
            id: 'visual_tokens',
            label: `Visual Tokens (${workingDna.colors.length} Swatches)`,
            icon: Sliders
          }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeDnaTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDnaTab(tab.id as any)}
              className={`pb-3 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Findings List & Actions */}
      {activeDnaTab !== 'discovered_pages' && activeDnaTab !== 'visual_tokens' && (
        <div className="p-6 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search rules, terms, or claims..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (allVisibleSelected) {
                    setSelectedItemIds(new Set());
                  } else {
                    setSelectedItemIds(new Set(filteredItems.map(i => i.id)));
                  }
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {allVisibleSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                <span>{allVisibleSelected ? 'Deselect All' : `Select All (${filteredItems.length})`}</span>
              </button>

              {selectedItemIds.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleBatchApprove}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Selected ({selectedItemIds.size})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBatchReject}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Selected ({selectedItemIds.size})</span>
                  </button>
                </>
              )}

              {filteredItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleApproveAllCurrent(filteredItems)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Approve All Visible ({filteredItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Intelligence Items Found</div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                No items match your active tab or filter. Try clearing filters or run "Crawl & Extract Website DNA" above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => {
                const isExpanded = expandedTextItemIds.has(item.id);
                const isSelected = selectedItemIds.has(item.id);
                const isEditing = editingItemId === item.id;

                const categoryBadgeColor =
                  item.category === 'visual_identity'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : item.category === 'website_policies'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : item.category === 'product_intelligence'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : item.category === 'brand_communication'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/20 shadow-2xs'
                        : item.verificationStatus === 'approved'
                        ? 'border-emerald-200/80 bg-white hover:border-emerald-300'
                        : item.verificationStatus === 'rejected'
                        ? 'border-rose-200/80 bg-rose-50/10 opacity-75'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    } p-5 space-y-3.5`}
                  >
                    {/* Header: Select Checkbox, Category Badge, Title & Decision Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(item.id)}
                          className="mt-1 text-slate-400 hover:text-blue-600 cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${categoryBadgeColor}`}
                            >
                              {item.category.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {item.subCategory}
                            </span>
                          </div>

                          {isEditing && editingItemDraft ? (
                            <input
                              type="text"
                              value={editingItemDraft.title}
                              onChange={e =>
                                setEditingItemDraft({ ...editingItemDraft, title: e.target.value })
                              }
                              className="w-full text-sm font-bold text-slate-900 border border-slate-300 rounded px-2 py-1"
                            />
                          ) : (
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h3>
                          )}
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize flex items-center gap-1 ${
                            item.verificationStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.verificationStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.verificationStatus === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {item.verificationStatus === 'rejected' && <X className="w-3 h-3" />}
                          {item.verificationStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                          <span>{item.verificationStatus === 'pending' ? 'Pending Review' : item.verificationStatus}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleApproveItem(item.id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            item.verificationStatus === 'approved'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border-slate-200'
                          }`}
                          title="Approve item"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectItem(item.id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            item.verificationStatus === 'rejected'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white hover:bg-rose-50 text-rose-700 border-slate-200'
                          }`}
                          title="Reject item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => (isEditing ? handleSaveItemEdit() : handleStartEditItem(item))}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs cursor-pointer"
                          title={isEditing ? 'Save edits' : 'Edit item'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* AI Simplified Explanation */}
                    <div className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-900 block mb-0.5">AI Explanation:</span>
                      {isEditing && editingItemDraft ? (
                        <textarea
                          rows={2}
                          value={editingItemDraft.aiExplanation}
                          onChange={e =>
                            setEditingItemDraft({ ...editingItemDraft, aiExplanation: e.target.value })
                          }
                          className="w-full text-xs text-slate-700 border border-slate-300 rounded p-1.5"
                        />
                      ) : (
                        <p className="leading-relaxed text-slate-700">{item.aiExplanation}</p>
                      )}
                    </div>

                    {/* Actionable Structured Rule */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Actionable Rule for Content Audit Engine</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.structuredRule.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : item.structuredRule.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.structuredRule.severity} SEVERITY
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block">Rule Statement:</span>
                          {isEditing && editingItemDraft ? (
                            <input
                              type="text"
                              value={editingItemDraft.structuredRule.ruleStatement}
                              onChange={e =>
                                setEditingItemDraft({
                                  ...editingItemDraft,
                                  structuredRule: { ...editingItemDraft.structuredRule, ruleStatement: e.target.value }
                                })
                              }
                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                            />
                          ) : (
                            <div className="font-medium text-slate-800">{item.structuredRule.ruleStatement}</div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Target Violating Patterns:</span>
                            <div className="flex flex-wrap gap-1">
                              {(item.structuredRule.targetPatterns || []).map((pat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-semibold"
                                >
                                  "{pat}"
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Approved Value / Standard:</span>
                            <div className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                              {item.structuredRule.approvedValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Details (if product intelligence) */}
                    {item.productDetails && (
                      <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/30 text-xs space-y-1.5">
                        <div className="font-bold text-blue-950 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                          <span>Product Intelligence Details</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Product / Offering:</span>
                            <span className="font-semibold text-slate-800">{item.productDetails.productName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">SKU / Model:</span>
                            <span className="font-mono font-semibold text-slate-800">{item.productDetails.sku || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Verified Price:</span>
                            <span className="font-bold text-emerald-700">{item.productDetails.price || 'N/A'}</span>
                          </div>
                        </div>
                        {item.productDetails.specifications && (
                          <div className="text-[11px] text-slate-600">
                            <span className="text-slate-500">Specs: </span>
                            {item.productDetails.specifications}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expandable Exact Original Website Text */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleToggleExpandText(item.id)}
                        className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Exact Original Website Text</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({item.originalExtractedText.length} characters)
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 bg-slate-900 text-slate-100 text-xs font-mono rounded-b-lg border-t border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                            <span>VERBATIM EXTRACTED CONTENT</span>
                            <span>Source: {item.sourcePageTitle}</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                            {item.originalExtractedText}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Source Attribution & Timestamp Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>Source: <strong>{item.sourcePageTitle}</strong></span>
                        <span className="text-slate-300">·</span>
                        <a
                          href={item.originalWebsiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>{item.originalWebsiteUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div>
                        Extracted: {item.extractedAt.slice(0, 16).replace('T', ' ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Tab Content: Discovered Pages Audit Table */}
      {activeDnaTab === 'discovered_pages' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Discovered Public & Internal Pages ({crawledPages.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Internal links crawled, page word counts, extraction results, and reported restricted access pages.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {crawledPages.filter(p => p.status === 'crawled').length} Crawled
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                {crawledPages.filter(p => p.status === 'inaccessible').length} Inaccessible / Restricted
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Page Title & Path</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">HTTP Status</th>
                  <th className="py-2.5 px-3">Word Count</th>
                  <th className="py-2.5 px-3">Items Extracted</th>
                  <th className="py-2.5 px-4">Status & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crawledPages.map((page, idx) => (
                  <tr
                    key={idx}
                    className={page.status === 'inaccessible' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{page.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate max-w-xs">{page.url}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        {page.pageType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      <span
                        className={
                          page.httpStatus === 200
                            ? 'text-emerald-700'
                            : 'text-rose-700 font-bold'
                        }
                      >
                        HTTP {page.httpStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {page.wordCount ? `${page.wordCount.toLocaleString()} words` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-blue-600">
                        {page.extractedItemsCount} rules/policies
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {page.status === 'crawled' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Publicly Crawled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          <span>{page.errorMessage || 'Access Restricted / HTTP 403'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Visual Tokens & Swatches */}
      {activeDnaTab === 'visual_tokens' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Extracted Visual Tokens & Swatches</h3>
              <p className="text-[11px] text-slate-500">
                Color palette, typography scale, logo lockup rules, and visual guidelines extracted from website CSS.
              </p>
            </div>
            {isEditingDna && (
              <button
                type="button"
                onClick={handleAddColorSwatch}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color Swatch</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingDna.colors.map((swatch, idx) => (
              <div key={`${swatch.hex}-${idx}`} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={swatch.name}
                        onChange={e => handleUpdateColor(idx, { name: e.target.value })}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900 mb-1"
                      />
                    ) : (
                      <div className="font-bold text-xs text-slate-900 truncate">{swatch.name}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      {isEditingDna && (
                        <input
                          type="color"
                          value={swatch.hex}
                          onChange={e => handleUpdateColor(idx, { hex: e.target.value.toUpperCase() })}
                          className="w-6 h-6 cursor-pointer"
                        />
                      )}
                      <span className="font-mono font-bold text-slate-700">{swatch.hex}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 capitalize">{swatch.role}</span>
                    </div>
                  </div>
                  {isEditingDna && workingDna.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColorSwatch(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove swatch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{swatch.usageNotes}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <TypeIcon className="w-4 h-4 text-blue-600" />
                <span>Typography Hierarchy</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div><strong>Headings:</strong> {workingDna.typography.headingFont}</div>
                <div><strong>Body Copy:</strong> {workingDna.typography.bodyFont}</div>
                <div><strong>Scale:</strong> {workingDna.typography.weightScale}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-blue-600" />
                <span>Logo Placement & Lockup</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div><strong>Lockup:</strong> {workingDna.logoUsage.logoDescription}</div>
                <div><strong>Placement:</strong> {workingDna.logoUsage.placementPattern}</div>
                <div><strong>Clear Space:</strong> {workingDna.logoUsage.clearSpaceRule}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Rescan Comparison Modal */}
      {showRescanModal && rescanDiffs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Website Rescan & Policy Change Detection</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing live website against previously saved Brand DNA snapshot for {activeBrand.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRescanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {rescanDiffs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="font-bold text-slate-800">No Content Changes Detected</div>
                  <p className="text-[11px]">All website pages and policies match your saved Brand DNA rules.</p>
                </div>
              ) : (
                rescanDiffs.map(diff => (
                  <div key={diff.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          diff.changeType === 'new_page'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {diff.changeType.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{diff.pageTitle}</span>
                    </div>

                    <div className="font-bold text-slate-900">{diff.summary}</div>

                    {diff.highlightedDiff && diff.highlightedDiff.length > 0 ? (
                      <div className="space-y-1 font-mono text-[11px] p-2.5 rounded bg-slate-900 text-slate-100">
                        {diff.highlightedDiff.map((d, i) => (
                          <div
                            key={i}
                            className={d.type === 'removed' ? 'text-rose-400' : 'text-emerald-400'}
                          >
                            {d.type === 'removed' ? '- REMOVED: ' : '+ ADDED: '}
                            {d.statement}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px]">
                        {diff.currentSnippet}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          diff.proposedUpdates.forEach(u => handleApproveItem(u.id));
                          diff.appliedStatus = 'approved';
                          setRescanDiffs([...rescanDiffs]);
                          triggerToast('Approved proposed rescan update.', 'success');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          diff.appliedStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {diff.appliedStatus === 'approved' ? '✓ Update Applied' : 'Approve Proposed Update'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {rescanDiffs.filter(d => d.appliedStatus === 'approved').length} of {rescanDiffs.length} updates applied
              </span>
              <button
                type="button"
                onClick={() => setShowRescanModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Done Reviewing Diffs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
