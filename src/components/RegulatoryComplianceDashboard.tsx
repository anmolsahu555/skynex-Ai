import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  X,
  FileText,
  AlertTriangle,
  Scale,
  Building2,
  Sparkles,
  Download,
  Plus,
  Eye,
  Radio,
  Share2,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  GovernmentDepartment,
  GovernmentDepartmentId,
  RegulatoryUpdate,
  BrandRule,
  BrandProfile,
  RegulatoryComplianceOverview
} from '../types.ts';

interface RegulatoryComplianceDashboardProps {
  departments: GovernmentDepartment[];
  activeBrand: BrandProfile;
  overview: RegulatoryComplianceOverview;
  onRefreshData?: () => void;
  onSyncDepartment?: (deptId: GovernmentDepartmentId) => Promise<void>;
  onToggleDepartmentStatus?: (deptId: GovernmentDepartmentId) => Promise<void>;
  onImportRuleToBrand?: (ruleId: string, deptId: GovernmentDepartmentId) => Promise<void>;
  onMarkUpdateRead?: (updateId: string) => Promise<void>;
  onNavigateToGovernmentRules?: () => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

const OFFICIAL_DEPARTMENT_LOGOS: Record<
  GovernmentDepartmentId,
  { primarySrc: string; fallbackSrc: string; alt: string }
> = {
  ccpa: {
    primarySrc: '/assets/regulatory-logos/ccpa.webp',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Central_Consumer_Protection_Authority_%28CCPA%29.webp',
    alt: 'Central Consumer Protection Authority (CCPA) official logo'
  },
  fssai: {
    primarySrc: '/assets/regulatory-logos/fssai.png',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/en/e/e2/FSSAI_logo.png',
    alt: 'Food Safety and Standards Authority of India (FSSAI) official logo'
  },
  dca: {
    primarySrc: '/assets/regulatory-logos/dca.svg',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Emblem_of_India_%28with_motto%29.svg',
    alt: 'Department of Consumer Affairs official government emblem'
  },
  meity: {
    primarySrc: '/assets/regulatory-logos/meity.svg',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ministry_of_Electronics_and_Information_Technology.svg',
    alt: 'Ministry of Electronics and Information Technology (MeitY) official logo'
  },
  cdsco: {
    primarySrc: '/assets/regulatory-logos/cdsco.jpg',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Central_Drugs_Standard_Control_Organization.jpg',
    alt: 'Central Drugs Standard Control Organisation (CDSCO) official logo'
  },
  sebi: {
    primarySrc: '/assets/regulatory-logos/sebi_square.jpg',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Securities_Exchange_Board_of_India.jpg',
    alt: 'Securities and Exchange Board of India (SEBI) official logo'
  },
  asci: {
    primarySrc: '/assets/regulatory-logos/asci.png',
    fallbackSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Advertising_Standards_Council_of_India_logo.png',
    alt: 'Advertising Standards Council of India (ASCI) official logo'
  }
};

function DepartmentLogoAvatar({
  dept,
  bgClass,
  borderClass
}: {
  dept: GovernmentDepartment;
  bgClass: string;
  borderClass: string;
}) {
  const logoConfig = OFFICIAL_DEPARTMENT_LOGOS[dept.id];
  const [currentSrc, setCurrentSrc] = useState<string | null>(logoConfig?.primarySrc || null);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);

  const handleImageError = () => {
    if (!triedFallback && logoConfig?.fallbackSrc && currentSrc !== logoConfig.fallbackSrc) {
      setTriedFallback(true);
      setCurrentSrc(logoConfig.fallbackSrc);
    } else {
      setCurrentSrc(null);
    }
  };

  return (
    <div
      className={`w-12 h-12 rounded-xl ${bgClass} border ${borderClass} p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden`}
    >
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={logoConfig?.alt || `${dept.fullName} official logo`}
          onError={handleImageError}
          className="w-full h-full object-contain rounded-lg select-none"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full rounded-lg bg-slate-100/80 border border-slate-200/80"
          aria-label={`${dept.fullName} logo placeholder`}
        />
      )}
    </div>
  );
}

export default function RegulatoryComplianceDashboard({
  departments,
  activeBrand,
  overview,
  onRefreshData,
  onSyncDepartment,
  onToggleDepartmentStatus,
  onImportRuleToBrand,
  onMarkUpdateRead,
  onNavigateToGovernmentRules,
  triggerToast
}: RegulatoryComplianceDashboardProps) {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'has_pending' | 'has_updates'>('all');
  
  // Modal / Detail View State
  const [selectedDept, setSelectedDept] = useState<GovernmentDepartment | null>(null);
  const [deptModalTab, setDeptModalTab] = useState<'rules' | 'updates' | 'statutory'>('rules');
  const [isSyncingDept, setIsSyncingDept] = useState<string | null>(null);
  const [isGlobalSyncing, setIsGlobalSyncing] = useState<boolean>(false);
  const [importedRuleIds, setImportedRuleIds] = useState<Set<string>>(() => {
    const existing = new Set<string>();
    (activeBrand.rules || []).forEach(r => {
      if (r.id) existing.add(r.id);
    });
    return existing;
  });

  // Filter departments based on search query and status filter
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dept.name.toLowerCase().includes(q) ||
        dept.fullName.toLowerCase().includes(q) ||
        dept.shortDescription.toLowerCase().includes(q) ||
        dept.focusAreas.some(fa => fa.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === 'active') {
        return dept.monitoringStatus === 'active';
      }
      if (statusFilter === 'has_pending') {
        const pendingCount = (dept.rules || []).filter(r => r.status === 'Draft' || r.status === 'Unverified').length;
        return pendingCount > 0;
      }
      if (statusFilter === 'has_updates') {
        const unreadCount = (dept.updates || []).filter(u => !u.isRead).length;
        return unreadCount > 0;
      }
      return true;
    });
  }, [departments, searchQuery, statusFilter]);

  // Compute live summary card statistics directly from real state
  const connectedSourcesCount = overview.connectedSourcesCount;
  const totalSourcesCount = overview.totalSourcesCount;
  const activeComplianceRulesCount = overview.activeComplianceRulesCount;
  const pendingApprovalsCount = overview.pendingApprovalsCount;
  const newRegulatoryUpdatesCount = overview.newRegulatoryUpdatesCount;

  const handleGlobalSync = async () => {
    setIsGlobalSyncing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      triggerToast('Synchronized compliance feeds from all 7 government portals.', 'success');
    } catch (err: any) {
      triggerToast(`Sync failed: ${err?.message || 'Network error'}`, 'error');
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  const handleSyncSingleDept = async (dept: GovernmentDepartment) => {
    setIsSyncingDept(dept.id);
    try {
      if (onSyncDepartment) {
        await onSyncDepartment(dept.id);
      } else {
        const res = await fetch(`/api/regulatory/departments/${dept.id}/sync`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to sync');
      }
      triggerToast(`Refreshed live feed for ${dept.name} (${dept.fullName}).`, 'success');
    } catch (err: any) {
      triggerToast(`Sync error: ${err?.message || 'Server error'}`, 'error');
    } finally {
      setIsSyncingDept(null);
    }
  };

  const handleToggleMonitoring = async (dept: GovernmentDepartment) => {
    try {
      if (onToggleDepartmentStatus) {
        await onToggleDepartmentStatus(dept.id);
      } else {
        const res = await fetch(`/api/regulatory/departments/${dept.id}/toggle-status`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Status toggle failed');
      }
      const nextStatus = dept.monitoringStatus === 'active' ? 'Paused' : 'Active';
      triggerToast(`${dept.name} monitoring status updated to: ${nextStatus}.`, 'info');
    } catch (err: any) {
      triggerToast(`Failed to toggle status: ${err?.message}`, 'error');
    }
  };

  const handleImportRule = async (rule: BrandRule, deptId: GovernmentDepartmentId) => {
    try {
      if (onImportRuleToBrand) {
        await onImportRuleToBrand(rule.id, deptId);
      } else {
        const res = await fetch('/api/regulatory/rules/import-to-brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ruleId: rule.id,
            departmentId: deptId,
            brandId: activeBrand.id
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');
      }

      setImportedRuleIds(prev => new Set(prev).add(rule.id));
      triggerToast(`Imported "${rule.title}" into ${activeBrand.name} active governance rules!`, 'success');
    } catch (err: any) {
      triggerToast(`Import error: ${err?.message || 'Could not import rule'}`, 'error');
    }
  };

  const handleMarkAsRead = async (update: RegulatoryUpdate) => {
    try {
      if (onMarkUpdateRead) {
        await onMarkUpdateRead(update.id);
      } else {
        await fetch(`/api/regulatory/updates/${update.id}/read`, { method: 'PUT' });
      }
      update.isRead = true;
      triggerToast(`Marked circular "${update.circularNumber}" as reviewed.`, 'info');
    } catch (err: any) {
      console.warn('Mark read failed:', err);
    }
  };

  // Helper for Department badge color accent
  const getDeptColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          badge: 'bg-indigo-100 text-indigo-800'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          badge: 'bg-rose-100 text-rose-800'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-50',
          text: 'text-cyan-800',
          border: 'border-cyan-200',
          badge: 'bg-cyan-100 text-cyan-800'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          badge: 'bg-slate-100 text-slate-800'
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER                                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regulatory Compliance</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              7 Portals Monitored
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Monitor government regulations, manage compliance rules and protect your brand from regulatory violations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onNavigateToGovernmentRules && (
            <button
              type="button"
              onClick={onNavigateToGovernmentRules}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-blue-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Government Rules tab inside Brand Knowledge"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Government Rules in Brand Knowledge</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={handleGlobalSync}
            disabled={isGlobalSyncing}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Fetch latest circulars and verify active rule statuses across all 7 departments"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isGlobalSyncing ? 'animate-spin' : ''}`} />
            <span>{isGlobalSyncing ? 'Synchronizing Feeds...' : 'Sync All Feeds'}</span>
          </button>

          <div className="px-3 py-1.5 bg-slate-100/90 rounded-xl text-xs text-slate-600 border border-slate-200/80 font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Active Brand: <strong className="text-slate-900">{activeBrand?.name || 'NovaPay'}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR SUMMARY CARDS (Real Database Statistics)           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connected Government Sources */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all hover:border-blue-300 ${
            statusFilter === 'active' ? 'border-blue-400 ring-1 ring-blue-400/30' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Connected Government Sources</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {connectedSourcesCount} <span className="text-sm font-normal text-slate-400">/ {totalSourcesCount}</span>
              </div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" />
                <span>100% Statutory Authority Monitored</span>
              </div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-blue-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((connectedSourcesCount / Math.max(1, totalSourcesCount)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Active Compliance Rules */}
        <div
          onClick={() => setStatusFilter('all')}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs cursor-pointer transition-all hover:border-emerald-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Active Compliance Rules</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {activeComplianceRulesCount}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Enforced in Review Engine
              </div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-emerald-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (activeComplianceRulesCount /
                      Math.max(1, activeComplianceRulesCount + pendingApprovalsCount)) *
                      100
                  )
                )}%`
              }}
            />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'has_pending' ? 'all' : 'has_pending')}
          className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all hover:border-amber-300 ${
            statusFilter === 'has_pending' ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">Pending Approvals</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {pendingApprovalsCount}
              </div>
              <div className="text-[11px] text-amber-700 font-medium truncate">
                {pendingApprovalsCount > 0 ? 'Requires legal counsel review' : 'All rules verified'}
              </div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-amber-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (pendingApprovalsCount /
                      Math.max(1, activeComplianceRulesCount + pendingApprovalsCount)) *
                      100
                  )
                )}%`
              }}
            />
          </div>
        </div>

        {/* Card 4: New Regulatory Updates */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'has_updates' ? 'all' : 'has_updates')}
          className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all hover:border-purple-300 ${
            statusFilter === 'has_updates' ? 'border-purple-400 ring-1 ring-purple-400/30' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500">New Regulatory Updates</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular leading-tight my-0.5">
                {newRegulatoryUpdatesCount}
              </div>
              <div className="text-[11px] text-purple-700 font-medium truncate">
                {newRegulatoryUpdatesCount > 0 ? 'Recent circulars & advisories' : 'Up to date with gazette'}
              </div>
            </div>
          </div>
          <div className="mt-3.5 h-1.5 w-full bg-purple-100/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: newRegulatoryUpdatesCount > 0 ? '75%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GOVERNMENT DEPARTMENTS SECTION                         */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {/* Section Header with Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Government Departments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official statutory authorities governing marketing, consumer disclosures, and advertising legal compliance in India.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search departments or acts..."
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Filter Pill Options */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (7)
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('has_updates')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'has_updates' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Updates
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SEVEN GOVERNMENT DEPARTMENT CARDS                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map(dept => {
            const colors = getDeptColorClasses(dept.badgeColor);
            const activeRulesCount = (dept.rules || []).filter(r => r.status === 'Approved').length;
            const pendingApprovalsCount = (dept.rules || []).filter(r => r.status === 'Draft' || r.status === 'Unverified').length;
            const unreadUpdatesCount = (dept.updates || []).filter(u => !u.isRead).length;
            const isMonitoringActive = dept.monitoringStatus === 'active';

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all hover:border-slate-300 flex flex-col p-5 space-y-4 relative group"
              >
                {/* Top Row: Official Department Logo, Name, and Monitoring Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Official Department Logo Avatar */}
                    <DepartmentLogoAvatar
                      dept={dept}
                      bgClass={colors.bg}
                      borderClass={colors.border}
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 line-clamp-1" title={dept.fullName}>
                        {dept.fullName}
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${
                      isMonitoringActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isMonitoringActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span>{isMonitoringActive ? 'Active Monitoring' : 'Paused'}</span>
                  </span>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 leading-relaxed min-h-[38px] line-clamp-2">
                  {dept.shortDescription}
                </p>

                {/* Focus Areas Pill Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {dept.focusAreas.slice(0, 3).map((focus, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 border border-slate-200/80 text-slate-700"
                    >
                      {focus}
                    </span>
                  ))}
                  {dept.focusAreas.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100">
                      +{dept.focusAreas.length - 3} more
                    </span>
                  )}
                </div>

                {/* Metrics Row: Active Rules & Pending Approvals */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                      Active Rules
                    </span>
                    <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeRulesCount}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                      Pending Approvals
                    </span>
                    <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className={pendingApprovalsCount > 0 ? 'text-amber-700' : 'text-slate-800'}>
                        {pendingApprovalsCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circulars Alert Notice if any unread circulars exist */}
                {unreadUpdatesCount > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-[11px] text-purple-800 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
                      {unreadUpdatesCount} new regulatory advisory
                    </span>
                    <span className="text-[10px] underline cursor-pointer" onClick={() => {
                      setSelectedDept(dept);
                      setDeptModalTab('updates');
                    }}>
                      View Circular
                    </span>
                  </div>
                )}

                {/* Card Actions: View Department Button & Official Link */}
                <div className="pt-2 mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept);
                      setDeptModalTab('rules');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>View Department</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={dept.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                    title={`Visit official government website: ${dept.officialWebsite}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No Government Departments Matched</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or filter selections.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. DEPARTMENT DETAIL VIEW / MODAL                         */}
      {/* ========================================================= */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <DepartmentLogoAvatar
                  dept={selectedDept}
                  bgClass={getDeptColorClasses(selectedDept.badgeColor).bg}
                  borderClass={getDeptColorClasses(selectedDept.badgeColor).border}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{selectedDept.fullName}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedDept.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedDept.nodalMinistry}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSyncSingleDept(selectedDept)}
                  disabled={isSyncingDept === selectedDept.id}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDept === selectedDept.id ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  <span>{isSyncingDept === selectedDept.id ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${selectedDept.monitoringStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  Status: <strong className="text-slate-800">{selectedDept.monitoringStatus === 'active' ? 'Active Monitoring' : 'Paused'}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>Last Synced: <strong className="text-slate-800">{new Date(selectedDept.lastSyncedAt).toLocaleDateString()} {new Date(selectedDept.lastSyncedAt).toLocaleTimeString()}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleMonitoring(selectedDept)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                >
                  {selectedDept.monitoringStatus === 'active' ? 'Pause Monitoring' : 'Resume Monitoring'}
                </button>
                <a
                  href={selectedDept.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Tab Navigation in Modal */}
            <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDeptModalTab('rules')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  deptModalTab === 'rules'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Compliance Rules ({(selectedDept.rules || []).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDeptModalTab('updates')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  deptModalTab === 'updates'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Circulars & Updates ({(selectedDept.updates || []).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDeptModalTab('statutory')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  deptModalTab === 'statutory'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Statutory Authority & Law</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Tab 1: Compliance Rules */}
              {deptModalTab === 'rules' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Authoritative compliance rules enforced by {selectedDept.code}. Import these rules to audit drafts against government standards.
                    </p>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {(selectedDept.rules || []).filter(r => r.status === 'Approved').length} Approved
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(selectedDept.rules || []).map(rule => {
                      const isImported = importedRuleIds.has(rule.id);
                      return (
                        <div
                          key={rule.id}
                          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5 hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {rule.id}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {rule.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                {rule.ruleStatement}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rule.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {rule.status}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  rule.severity === 'critical'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {rule.severity}
                              </span>
                            </div>
                          </div>

                          {/* Rule Details: Patterns & Approved Value */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-0.5">
                                Prohibited Target Triggers:
                              </span>
                              <div className="text-rose-900 flex flex-wrap gap-1">
                                {rule.targetPatterns.map((p, i) => (
                                  <span key={i} className="bg-rose-100/70 px-1.5 py-0.2 rounded text-[11px] font-mono">
                                    "{p}"
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                                Approved Standard:
                              </span>
                              <span className="text-emerald-900 font-semibold">
                                {rule.approvedValue}
                              </span>
                            </div>
                          </div>

                          {/* Source Reference & Action Button */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="text-[11px] text-slate-500">
                              Source: <strong className="text-slate-700">{rule.sourceRef}</strong>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleImportRule(rule, selectedDept.id)}
                              disabled={isImported}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isImported
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                              }`}
                            >
                              {isImported ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Active in {activeBrand.name}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Import to Brand Rules</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Circulars & Updates */}
              {deptModalTab === 'updates' && (
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-500">
                    Official regulatory notifications, circulars, and advisories issued by {selectedDept.fullName}.
                  </p>

                  <div className="space-y-3">
                    {(selectedDept.updates || []).map(update => (
                      <div
                        key={update.id}
                        className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                          update.isRead
                            ? 'bg-white border-slate-200'
                            : 'bg-purple-50/30 border-purple-200/90 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                                {update.circularNumber}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Issued: {update.issuedDate} · Effective: {update.effectiveDate}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mt-1">
                              {update.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                update.impactLevel === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {update.impactLevel} Impact
                            </span>

                            {!update.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(update)}
                                className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                          {update.summary}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <div className="text-[11px] text-slate-600">
                            <strong>Recommended Action:</strong> {update.recommendedAction}
                          </div>

                          <a
                            href={update.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold shrink-0"
                          >
                            <span>Read Gazette PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Statutory Authority */}
              {deptModalTab === 'statutory' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Governing Statutory Act:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono">
                      {selectedDept.actName}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Enforcement Powers & Penal Jurisdiction:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedDept.statutoryRole}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                    <span className="text-xs font-bold text-blue-900 block flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      SkyNex AI Continuous Monitoring Protocol
                    </span>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      SkyNex AI maintains live synchronization with {selectedDept.name} gazette feeds. Whenever new advisories or labelling directives are released, SkyNex AI classifies the text and suggests rule additions for your brand workspace.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>{selectedDept.focusAreas.join(' · ')}</span>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
