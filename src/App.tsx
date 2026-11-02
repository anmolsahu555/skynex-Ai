import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  History,
  Sparkles,
  UploadCloud,
  Check,
  X,
  Edit3,
  Copy,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeftRight,
  ChevronRight,
  ChevronDown,
  Info,
  TrendingUp,
  RotateCcw,
  Sliders,
  Download,
  BookOpen,
  Clock,
  UserCheck,
  Lock,
  Save,
  Eye,
  Trash2,
  HelpCircle,
  FileCheck,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  Scan,
  Building2,
  Play,
  MoreVertical,
  Scale,
  Ban,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
  FileUp,
  Dna,
  Menu,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Landmark,
  LogOut
} from 'lucide-react';
import { USER_PROFILES, DEFAULT_USER_PROFILE } from './data/userProfiles.ts';
import LoginPage from './components/LoginPage.tsx';
import {
  SkyNexAuthSession,
  getSavedAuthSession,
  signOutSkyNex,
  DEMO_CREDENTIALS
} from './firebase.ts';
import {
  BrandId,
  BrandProfile,
  BrandRule,
  RuleCategory,
  RuleApprovalStatus,
  AuditReport,
  AuditFinding,
  DecisionStatus,
  ContentApprovalStatus,
  RecurringPattern,
  RecurrenceThresholdConfig,
  UserProfile,
  SampleScenario,
  SampleAdImage,
  ApprovedBrandColor,
  ApprovedLogoRef,
  VisualGuideline,
  BoundingBox,
  VisualCheckSummary,
  ExtractedPdfRule,
  PdfRuleExtractionSummary,
  AutoFixCreativeResult,
  SecondAuditComparison,
  AppliedCorrectionItem,
  GovernmentDepartment,
  GovernmentDepartmentId,
  RegulatoryComplianceOverview
} from './types.ts';
import ImageReviewCanvas from './components/ImageReviewCanvas.tsx';
import ImageUploadWorkspace from './components/ImageUploadWorkspace.tsx';
import BrandDnaWorkspace from './components/BrandDnaWorkspace.tsx';
import RuleManagementModal from './components/RuleManagementModal.tsx';
import BrandKnowledgeWorkspace from './components/BrandKnowledgeWorkspace.tsx';
import AddNewBrandModal from './components/AddNewBrandModal.tsx';
import AutoFixCreativePreview from './components/AutoFixCreativePreview.tsx';
import AutoFixCreativePanel from './components/AutoFixCreativePanel.tsx';
import RegulatoryComplianceDashboard from './components/RegulatoryComplianceDashboard.tsx';
import {
  INITIAL_REGULATORY_DEPARTMENTS,
  computeRegulatoryOverview
} from './data/regulatoryDepartments.ts';

const ACTIVE_REPORT_STORAGE_KEY = 'skynex_active_report_id_v1';
const ACTIVE_BRAND_STORAGE_KEY = 'skynex_active_brand_id_v1';
const SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY = 'skynex_sidebar_expanded_width_v1';
const SIDEBAR_MIN_WIDTH = 72;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_EXPANDED_WIDTH = 288;
const SIDEBAR_ICON_ONLY_THRESHOLD = 150;
const SIDEBAR_FULL_CONTENT_THRESHOLD = 180;

export default function App() {
  // Firebase Auth & Evaluator Demo Account Session State
  const [authSession, setAuthSession] = useState<SkyNexAuthSession | null>(() => getSavedAuthSession());

  // User Persona State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Collapsible & Mouse-Resizable Sidebar State (Default Collapsed = 72px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_MIN_WIDTH);
  const [lastExpandedWidth, setLastExpandedWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY));
    return saved >= SIDEBAR_FULL_CONTENT_THRESHOLD && saved <= SIDEBAR_MAX_WIDTH
      ? saved
      : SIDEBAR_DEFAULT_EXPANDED_WIDTH;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);

  // Determine whether the desktop sidebar should render in icon-only mode
  // Below ~150px is icon-only; above ~180px shows full labels and sidebar content
  const isSidebarCollapsed = !isMobileSidebarOpen && sidebarWidth < SIDEBAR_FULL_CONTENT_THRESHOLD;

  const handleToggleSidebar = () => {
    if (sidebarWidth < SIDEBAR_FULL_CONTENT_THRESHOLD) {
      const targetWidth =
        lastExpandedWidth >= SIDEBAR_FULL_CONTENT_THRESHOLD && lastExpandedWidth <= SIDEBAR_MAX_WIDTH
          ? lastExpandedWidth
          : SIDEBAR_DEFAULT_EXPANDED_WIDTH;
      setSidebarWidth(targetWidth);
    } else {
      setIsBrandDropdownOpen(false);
      setSidebarWidth(SIDEBAR_MIN_WIDTH);
    }
  };

  const handleStartResizeSidebar = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  useEffect(() => {
    if (!isResizingSidebar) return;

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      const rawWidth = e.clientX;
      const clamped = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, rawWidth));
      setSidebarWidth(clamped);
      if (clamped >= SIDEBAR_FULL_CONTENT_THRESHOLD) {
        setLastExpandedWidth(clamped);
        localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY, String(clamped));
      } else {
        setIsBrandDropdownOpen(false);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const finalRaw = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, e.clientX));
      if (finalRaw < SIDEBAR_ICON_ONLY_THRESHOLD) {
        setSidebarWidth(SIDEBAR_MIN_WIDTH);
      } else if (finalRaw < SIDEBAR_FULL_CONTENT_THRESHOLD) {
        // Smoothly snap out of the 150-180px transition zone so labels never clip
        const snapWidth = finalRaw < 165 ? SIDEBAR_MIN_WIDTH : SIDEBAR_FULL_CONTENT_THRESHOLD;
        setSidebarWidth(snapWidth);
        if (snapWidth >= SIDEBAR_FULL_CONTENT_THRESHOLD) {
          setLastExpandedWidth(snapWidth);
          localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY, String(snapWidth));
        }
      }
      setIsResizingSidebar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar]);

  // Navigation: 'review' | 'knowledge' | 'regulatory' | 'dna' | 'history' | 'recurring'
  const [currentView, setCurrentView] = useState<'review' | 'knowledge' | 'regulatory' | 'dna' | 'history' | 'recurring'>('review');
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'error' | 'success' } | null>(null);

  // Persistent Server State
  const [brands, setBrands] = useState<Record<string, BrandProfile>>({});
  const [activeBrandId, setActiveBrandId] = useState<BrandId>(() => {
    const saved = localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);
    return saved || 'novapay';
  });
  const [regulatoryDepartments, setRegulatoryDepartments] = useState<GovernmentDepartment[]>(INITIAL_REGULATORY_DEPARTMENTS);
  const [regulatoryOverview, setRegulatoryOverview] = useState<RegulatoryComplianceOverview>(() =>
    computeRegulatoryOverview(INITIAL_REGULATORY_DEPARTMENTS, [])
  );
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isHeaderBrandMenuOpen, setIsHeaderBrandMenuOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditReport[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceThresholdConfig>({
    minOccurrences: 3,
    minDistinctDrafts: 2,
    windowDays: 7
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Review Workspace State (Matching Reference Image 1)
  const [inputMode, setInputMode] = useState<'paste' | 'upload' | 'image'>('paste');
  const [contentType, setContentType] = useState<string>('Advertisement');
  const [contentTitle, setContentTitle] = useState<string>('NovaPay Promotional Ad (Canonical)');
  const [draftText, setDraftText] = useState<string>(
    'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedPreviewText, setExtractedPreviewText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isReviewBrandMenuOpen, setIsReviewBrandMenuOpen] = useState(false);

  const getFindingDisplayTitle = (finding: AuditFinding): string => {
    if (finding.ruleId === 'TER-004') return 'Brand name inconsistency';
    if (finding.ruleId === 'PRH-005') return 'Prohibited profit claim';
    if (finding.ruleId === 'MSG-003') return 'Incorrect pricing';
    return finding.ruleTitle || finding.category;
  };

  const handleSelectFindingCard = (finding: AuditFinding) => {
    setSelectedFindingId(finding.id);
    if (inputMode === 'paste' && draftTextareaRef.current) {
      const targetPhrase =
        finding.decision === 'accepted' && finding.suggestedReplacement
          ? finding.suggestedReplacement
          : finding.decision === 'edited' && finding.editedReplacement
          ? finding.editedReplacement
          : finding.originalSpan;
      if (targetPhrase) {
        const idx = draftText.indexOf(targetPhrase);
        if (idx !== -1) {
          draftTextareaRef.current.focus();
          draftTextareaRef.current.setSelectionRange(idx, idx + targetPhrase.length);
        }
      }
    }
  };

  // Advertisement Image Review State
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [uploadedImageSize, setUploadedImageSize] = useState<number | null>(null);
  const [uploadedImageDims, setUploadedImageDims] = useState<{ width: number; height: number } | null>(null);
  const [selectedSampleAdId, setSelectedSampleAdId] = useState<string | null>(null);
  const [imageReviewError, setImageReviewError] = useState<string | null>(null);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);
  const [isExtractedTextOpen, setIsExtractedTextOpen] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Engine Configuration & Execution State
  const [enableGemini, setEnableGemini] = useState<boolean>(true);
  const [simulateAiFailure, setSimulateAiFailure] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [hasAuditedCurrentDraft, setHasAuditedCurrentDraft] = useState<boolean>(false);
  const [isContentOutdated, setIsContentOutdated] = useState<boolean>(false);
  const [showOutdatedFindingsOverride, setShowOutdatedFindingsOverride] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [draftPaneTab, setDraftPaneTab] = useState<'interactive' | 'diff' | 'versions'>('interactive');

  // Dynamic visibility of the right Audit Findings panel
  const showAuditPanel =
    isAnalyzing ||
    (Boolean(activeReport) && (!isContentOutdated || showOutdatedFindingsOverride));

  // AI Auto-Fix Creative State
  const [isGeneratingAutoFix, setIsGeneratingAutoFix] = useState<boolean>(false);
  const [autoFixResult, setAutoFixResult] = useState<AutoFixCreativeResult | null>(null);
  const [autoFixError, setAutoFixError] = useState<string | null>(null);
  const [isApprovingAutoFix, setIsApprovingAutoFix] = useState<boolean>(false);
  const creativePreviewRef = useRef<HTMLDivElement>(null);

  // Inline Suggestion Edit / Reject State
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customEditValues, setCustomEditValues] = useState<Record<string, string>>({});
  const [rejectingFindingId, setRejectingFindingId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [approvalNotesInput, setApprovalNotesInput] = useState<string>('');

  // Brand Knowledge State (Matching Reference Image 2)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All Rules');
  const [ruleSearchQuery, setRuleSearchQuery] = useState<string>('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('All Rule Types');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<string>('All Statuses');
  const [activeRuleMenuId, setActiveRuleMenuId] = useState<string | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<BrandRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    title: string;
    category: RuleCategory;
    ruleStatement: string;
    targetPatterns: string;
    approvedValue: string;
    sourceRef: string;
    status: RuleApprovalStatus;
    severity: 'critical' | 'warning' | 'info';
    explanation: string;
  }>({
    title: '',
    category: 'Visual Identity',
    ruleStatement: '',
    targetPatterns: '',
    approvedValue: '',
    sourceRef: '',
    status: 'Approved',
    severity: 'critical',
    explanation: ''
  });

  // Rule Modal Mode: 'manual' | 'pdf'
  const [ruleModalMode, setRuleModalMode] = useState<'manual' | 'ai_text' | 'pdf' | 'test'>('manual');

  // PDF Rule Extraction State
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<number>(0);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [pdfExtractionProgress, setPdfExtractionProgress] = useState<string>('');
  const [pdfExtractError, setPdfExtractError] = useState<string | null>(null);
  const [extractedRules, setExtractedRules] = useState<ExtractedPdfRule[]>([]);
  const [selectedExtractedRuleIds, setSelectedExtractedRuleIds] = useState<Set<string>>(new Set());
  const [extractionSummary, setExtractionSummary] = useState<PdfRuleExtractionSummary | null>(null);
  const [editingExtractedRuleId, setEditingExtractedRuleId] = useState<string | null>(null);
  const [extractedRulesFilter, setExtractedRulesFilter] = useState<'all' | 'needs_review' | 'duplicates'>('all');
  const [extractedRulesSearch, setExtractedRulesSearch] = useState<string>('');
  const [isSavingBatchRules, setIsSavingBatchRules] = useState<boolean>(false);
  const [isDragOverPdf, setIsDragOverPdf] = useState<boolean>(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Delete All Rules Captcha & Undo Stack State
  const [rulesUndoStack, setRulesUndoStack] = useState<
    Record<string, { rules: BrandRule[]; label: string; timestamp: string }[]>
  >({});
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState<boolean>(false);
  const [captchaChallenge, setCaptchaChallenge] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isDeletingAllRules, setIsDeletingAllRules] = useState<boolean>(false);
  const [isUndoingRules, setIsUndoingRules] = useState<boolean>(false);

  // Brand Management State (Add & Remove Brand)
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState<boolean>(false);
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    industry: 'Fintech & Payment Processing',
    tagline: '',
    description: '',
    primaryColor: '#2563EB',
    seedDefaultRules: true
  });
  const [isCreatingBrand, setIsCreatingBrand] = useState<boolean>(false);
  const [addBrandError, setAddBrandError] = useState<string | null>(null);
  const [brandToRemove, setBrandToRemove] = useState<BrandProfile | null>(null);
  const [isRemovingBrand, setIsRemovingBrand] = useState<boolean>(false);
  const [removeBrandError, setRemoveBrandError] = useState<string | null>(null);

  // Review History Filter & Detail Modal
  const [historyBrandFilter, setHistoryBrandFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [inspectingHistoryReport, setInspectingHistoryReport] = useState<AuditReport | null>(null);

  // Recurring Issues Investigation Modal & Config Modal
  const [investigatingPattern, setInvestigatingPattern] = useState<RecurringPattern | null>(null);
  const [invRootCause, setInvRootCause] = useState<'unclear_guidelines' | 'outdated_approved_info' | 'training_need'>('unclear_guidelines');
  const [invNotes, setInvNotes] = useState<string>('');
  const [invAction, setInvAction] = useState<string>('');
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [thresholdForm, setThresholdForm] = useState<RecurrenceThresholdConfig>({
    minOccurrences: 3,
    minDistinctDrafts: 2,
    windowDays: 7
  });

  const triggerToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4200);
  };

  const activeBrand: BrandProfile | undefined = brands[activeBrandId] || Object.values(brands)[0];

  // Fetch initial state from backend (supports Demo Mode sandbox isolation)
  const fetchAppState = async (isDemoSession?: boolean) => {
    const useDemo = isDemoSession ?? Boolean(authSession?.isDemo);
    try {
      const res = await fetch(useDemo ? '/api/state?demo=true' : '/api/state', {
        headers: useDemo ? { 'x-demo-mode': 'true' } : undefined
      });
      if (!res.ok) throw new Error('Failed to load application state');
      const data = await res.json();

      setBrands(data.brands || {});
      const historyList: AuditReport[] = data.auditHistory || [];
      setAuditHistory(historyList);
      setRecurringPatterns(data.recurringPatterns || []);
      if (data.regulatoryDepartments) {
        setRegulatoryDepartments(data.regulatoryDepartments);
      }
      if (data.regulatoryOverview) {
        setRegulatoryOverview(data.regulatoryOverview);
      }
      if (data.recurrenceConfig) {
        setRecurrenceConfig(data.recurrenceConfig);
        setThresholdForm(data.recurrenceConfig);
      }

      if (useDemo && historyList.length > 0) {
        // In Demo Mode, prepopulate the active audit report so evaluators immediately see findings & suggestions
        const demoInitialReport = historyList[0];
        setDraftText(demoInitialReport.currentText || demoInitialReport.originalText);
        setContentTitle(demoInitialReport.title);
        setContentType(demoInitialReport.contentType || 'Advertisement');
        setActiveReport(demoInitialReport);
        setHasAuditedCurrentDraft(true);
        setIsContentOutdated(false);
        setShowOutdatedFindingsOverride(false);
        if (demoInitialReport.findings.length > 0) {
          setSelectedFindingId(demoInitialReport.findings[0].id);
          const editMap: Record<string, string> = {};
          demoInitialReport.findings.forEach(f => {
            editMap[f.id] = f.editedReplacement || f.suggestedReplacement || f.originalSpan;
          });
          setCustomEditValues(editMap);
        }
      } else {
        setDraftText('Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!');
        setContentTitle('NovaPay Promotional Ad (Canonical)');
        setContentType('Advertisement');
        setActiveReport(null);
        setHasAuditedCurrentDraft(false);
        setIsContentOutdated(false);
        setShowOutdatedFindingsOverride(false);
      }
    } catch (err) {
      console.error('Initial state fetch error:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAppState(authSession?.isDemo);
  }, [authSession?.uid, authSession?.isDemo]);

  const handleLoginSuccess = async (session: SkyNexAuthSession) => {
    setAuthSession(session);
    await fetchAppState(session.isDemo);
    if (session.isDemo) {
      triggerToast(
        `Logged in as Evaluator Demo (${DEMO_CREDENTIALS.email}). Prepopulated Brand DNA, Website Rules, Audit History & Findings loaded.`,
        'success'
      );
    } else {
      triggerToast(`Signed in as ${session.displayName} (${session.email}).`, 'success');
    }
  };

  const handleSignOut = async () => {
    await signOutSkyNex();
    setAuthSession(null);
    setIsRoleDropdownOpen(false);
    triggerToast('Signed out of SkyNex AI.', 'info');
  };

  // Sync activeBrandId if available
  useEffect(() => {
    if (brands && Object.keys(brands).length > 0 && !brands[activeBrandId]) {
      const firstId = Object.keys(brands)[0];
      setActiveBrandId(firstId);
      localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, firstId);
    }
  }, [brands, activeBrandId]);

  // Recalculate regulatory overview when departments or active brand rules change
  useEffect(() => {
    setRegulatoryOverview(computeRegulatoryOverview(regulatoryDepartments, activeBrand?.rules || []));
  }, [regulatoryDepartments, activeBrand]);

  // Execute Review Engine (Deterministic + Gemini AI)
  const executeReviewEngine = async (
    brandIdToUse: BrandId,
    textToCheck: string,
    titleToUse?: string,
    channelToUse?: string,
    filename?: string,
    silentToast = false
  ) => {
    if (!textToCheck || !textToCheck.trim()) {
      triggerToast('Draft content cannot be empty. Please enter text to check.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    const t1 = setTimeout(() => setAnalysisStep(2), 350);
    const t2 = setTimeout(() => setAnalysisStep(3), 750);
    const t3 = setTimeout(() => setAnalysisStep(4), 1100);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandIdToUse,
          draftText: textToCheck,
          contentType: channelToUse || contentType,
          title: titleToUse || contentTitle || 'Untitled Draft',
          sourceFilename: filename || uploadedFileName || undefined,
          enableGemini,
          simulateAiFailure,
          submittedBy: currentUser.name,
          submittedByRole: currentUser.roleLabel,
          submittedByRoleKey: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Content check failed');
      }

      const newReport: AuditReport = data.report;
      setActiveReport(newReport);
      setHasAuditedCurrentDraft(true);
      setIsContentOutdated(false);
      setShowOutdatedFindingsOverride(false);
      localStorage.setItem(ACTIVE_REPORT_STORAGE_KEY, newReport.id);

      setAuditHistory(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
      if (data.recurringPatterns) {
        setRecurringPatterns(data.recurringPatterns);
      }

      if (newReport.findings.length > 0) {
        setSelectedFindingId(newReport.findings[0].id);
      } else {
        setSelectedFindingId(null);
      }

      const editMap: Record<string, string> = {};
      newReport.findings.forEach(f => {
        editMap[f.id] = f.editedReplacement || f.suggestedReplacement || f.originalSpan;
      });
      setCustomEditValues(editMap);
      setEditingFindingId(null);
      setRejectingFindingId(null);

      if (!silentToast) {
        if (newReport.overallStatus === 'partial_review_ai_unavailable') {
          triggerToast('Deterministic checks passed; contextual review incomplete (simulated AI outage).', 'info');
        } else {
          triggerToast(`Check completed against ${newReport.checksExecuted.deterministicRulesChecked} approved rules: ${newReport.findings.length} finding(s) identified.`, 'success');
        }
      }
    } catch (err: any) {
      triggerToast(`Review check failed: ${err?.message || 'Server error'}`, 'error');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
    }
  };

  // Execute Advertisement Image Review Pipeline
  const executeImageReviewEngine = async (
    brandIdToUse: BrandId,
    base64Data: string,
    filenameToUse: string,
    titleToUse?: string
  ) => {
    setIsAnalyzing(true);
    setImageReviewError(null);
    setAnalysisStep(1);

    const t1 = setTimeout(() => setAnalysisStep(2), 400);
    const t2 = setTimeout(() => setAnalysisStep(3), 1000);

    try {
      const res = await fetch('/api/audit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandIdToUse,
          base64Image: base64Data,
          filename: filenameToUse,
          title: titleToUse || `Advertisement Review (${filenameToUse})`,
          contentType,
          channel: 'Paid Search & Social',
          simulateAiUnavailable: simulateAiFailure,
          submittedBy: currentUser.name,
          submittedByRole: currentUser.roleLabel,
          submittedByRoleKey: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Advertisement image review failed.');
      }

      const newReport: AuditReport = data.report;
      setActiveReport(newReport);
      setHasAuditedCurrentDraft(true);
      setIsContentOutdated(false);
      setShowOutdatedFindingsOverride(false);
      localStorage.setItem(ACTIVE_REPORT_STORAGE_KEY, newReport.id);

      setAuditHistory(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
      if (data.recurringPatterns) {
        setRecurringPatterns(data.recurringPatterns);
      }

      if (newReport.findings.length > 0) {
        setSelectedFindingId(newReport.findings[0].id);
      } else {
        setSelectedFindingId(null);
      }

      const editMap: Record<string, string> = {};
      newReport.findings.forEach(f => {
        editMap[f.id] = f.editedReplacement || f.suggestedReplacement || f.originalSpan;
      });
      setCustomEditValues(editMap);
      setEditingFindingId(null);
      setRejectingFindingId(null);

      triggerToast(`Advertisement reviewed against approved brand rules: ${newReport.findings.length} finding(s) explained.`, 'success');
    } catch (err: any) {
      setImageReviewError(err?.message || 'Failed to review advertisement image.');
      triggerToast(`Advertisement image review error: ${err?.message || 'Server error'}`, 'error');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAnalyzing(false);
    }
  };

  // One-click Canonical NovaPay Sample Ad action in Top Header
  const handleRunCanonicalSampleAd = async () => {
    setCurrentView('review');
    setInputMode('paste');
    const np = brands['novapay'] || activeBrand;
    if (activeBrandId !== 'novapay' && brands['novapay']) {
      setActiveBrandId('novapay');
      localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, 'novapay');
    }
    const sampleText = 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!';
    const sampleTitle = 'NovaPay Promotional Ad (Canonical)';
    const sampleType = 'Advertisement';
    setDraftText(sampleText);
    setContentTitle(sampleTitle);
    setContentType(sampleType);
    setUploadedFileName(null);
    setExtractedPreviewText(null);
    setUploadError(null);
    await executeReviewEngine('novapay', sampleText, sampleTitle, sampleType);
  };

  // Image File Upload
  const processImageFile = (file: File) => {
    setImageReviewError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageReviewError(`Unsupported image format "${file.type}". Please upload a PNG, JPG, or WebP creative.`);
      triggerToast('Unsupported image format. Please use PNG, JPG, or WebP.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageReviewError(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds 10 MB limit.`);
      triggerToast('Image file exceeds 10 MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setUploadedImageBase64(result);
      setUploadedImagePreview(result);
      setUploadedImageName(file.name);
      setUploadedImageSize(file.size);
      setSelectedSampleAdId(null);
      setContentTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '));
      setActiveReport(null);
      setHasAuditedCurrentDraft(false);
      setIsContentOutdated(false);
      setShowOutdatedFindingsOverride(false);

      const img = new Image();
      img.onload = () => {
        setUploadedImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;
      triggerToast(`Loaded "${file.name}". Ready for review.`, 'info');
    };
    reader.onerror = () => {
      setImageReviewError('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleAd = async (sample: SampleAdImage) => {
    setSelectedSampleAdId(sample.id);
    setImageReviewError(null);
    setUploadedImageName(sample.filename);
    setContentTitle(sample.title);

    try {
      const res = await fetch(sample.assetPath);
      if (!res.ok) throw new Error('Could not load sample advertisement asset.');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async e => {
        const dataUrl = e.target?.result as string;
        setUploadedImageBase64(dataUrl);
        setUploadedImagePreview(dataUrl);
        setUploadedImageSize(blob.size);

        const img = new Image();
        img.onload = async () => {
          setUploadedImageDims({ width: img.naturalWidth, height: img.naturalHeight });
          await executeImageReviewEngine(activeBrandId, dataUrl, sample.filename, sample.title);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      triggerToast(`Could not load sample image: ${err?.message}`, 'error');
    }
  };

  const handleClearImage = () => {
    setUploadedImageBase64(null);
    setUploadedImagePreview(null);
    setUploadedImageName(null);
    setUploadedImageSize(null);
    setUploadedImageDims(null);
    setSelectedSampleAdId(null);
    setImageReviewError(null);
    setActiveReport(null);
    setSelectedFindingId(null);
    setHasAuditedCurrentDraft(false);
    setIsContentOutdated(false);
    setShowOutdatedFindingsOverride(false);
    localStorage.removeItem(ACTIVE_REPORT_STORAGE_KEY);
    if (imageInputRef.current) imageInputRef.current.value = '';
    triggerToast('Image cleared and audit findings reset.', 'info');
  };

  const handleClearEditor = () => {
    setDraftText('');
    setContentTitle('');
    setActiveReport(null);
    setSelectedFindingId(null);
    setHasAuditedCurrentDraft(false);
    setIsContentOutdated(false);
    setShowOutdatedFindingsOverride(false);
    localStorage.removeItem(ACTIVE_REPORT_STORAGE_KEY);
    triggerToast('Editor cleared and audit findings reset.', 'info');
  };

  const handleClearDocument = () => {
    setUploadedFileName(null);
    setExtractedPreviewText(null);
    setUploadError(null);
    setActiveReport(null);
    setSelectedFindingId(null);
    setHasAuditedCurrentDraft(false);
    setIsContentOutdated(false);
    setShowOutdatedFindingsOverride(false);
    localStorage.removeItem(ACTIVE_REPORT_STORAGE_KEY);
    if (fileInputRef.current) fileInputRef.current.value = '';
    triggerToast('Document cleared and audit findings reset.', 'info');
  };

  // Switch Brand Profile
  const handleSelectBrand = async (brandKey: BrandId) => {
    setActiveBrandId(brandKey);
    localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandKey);
    setIsBrandDropdownOpen(false);
    setUploadError(null);
    setUploadedFileName(null);
    setExtractedPreviewText(null);
    const targetBrand = brands[brandKey];
    if (targetBrand) {
      triggerToast(`Switched active brand to "${targetBrand.name}" (${targetBrand.rules?.length || 0} rules).`, 'info');
    }
  };

  const handleOpenAddBrandModal = () => {
    setNewBrandForm({
      name: '',
      industry: 'Fintech & Payment Processing',
      tagline: '',
      description: '',
      primaryColor: '#2563EB',
      seedDefaultRules: true
    });
    setAddBrandError(null);
    setIsAddBrandModalOpen(true);
    setIsBrandDropdownOpen(false);
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandForm.name.trim()) {
      setAddBrandError('Brand name is required.');
      return;
    }

    setIsCreatingBrand(true);
    setAddBrandError(null);

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrandForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create brand');

      setBrands(data.brands);
      setActiveBrandId(data.brand.id);
      localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, data.brand.id);
      setIsAddBrandModalOpen(false);
      triggerToast(
        `Created brand "${data.brand.name}" with ${data.brand.rules.length} initial rules and set as active!`,
        'success'
      );
    } catch (err: any) {
      setAddBrandError(err?.message || 'Error creating brand profile');
      triggerToast(`Failed to create brand: ${err?.message}`, 'error');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleOpenRemoveBrand = (brand: BrandProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBrandToRemove(brand);
    setRemoveBrandError(null);
    setIsBrandDropdownOpen(false);
  };

  const handleConfirmRemoveBrand = async () => {
    if (!brandToRemove) return;
    if (Object.keys(brands).length <= 1) {
      setRemoveBrandError('Cannot remove the only brand profile in the workspace. Please add another brand before deleting this one.');
      return;
    }

    setIsRemovingBrand(true);
    setRemoveBrandError(null);

    try {
      const res = await fetch(`/api/brands/${brandToRemove.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove brand');

      const remainingBrands = data.brands || {};
      setBrands(remainingBrands);

      if (activeBrandId === brandToRemove.id) {
        const nextBrandId = data.remainingBrandIds?.[0] || Object.keys(remainingBrands)[0];
        if (nextBrandId) {
          setActiveBrandId(nextBrandId);
          localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, nextBrandId);
        }
      }

      setBrandToRemove(null);
      triggerToast(`Removed brand "${brandToRemove.name}" from workspace.`, 'info');
    } catch (err: any) {
      setRemoveBrandError(err?.message || 'Error removing brand');
      triggerToast(`Failed to remove brand: ${err?.message}`, 'error');
    } finally {
      setIsRemovingBrand(false);
    }
  };

  // Document File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadedFileName(file.name);
    setExtractedPreviewText(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : '';
        try {
          const res = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              base64Content: base64Data
            })
          });
          const data = await res.json();
          if (!res.ok || !data.extractedText) {
            setUploadError(data.error || `Could not extract text from "${file.name}". Please paste text directly.`);
            triggerToast(data.error || 'Document extraction failed', 'error');
          } else {
            setExtractedPreviewText(data.extractedText);
            setDraftText(data.extractedText);
            setContentTitle(file.name.replace(/\.[^/.]+$/, ''));
            setActiveReport(null);
            setHasAuditedCurrentDraft(false);
            setIsContentOutdated(false);
            setShowOutdatedFindingsOverride(false);
            triggerToast(`Extracted ${data.wordCount} words from "${file.name}". Ready for review.`, 'success');
          }
        } catch (err: any) {
          setUploadError(`Extraction request failed. Please paste your text directly.`);
          triggerToast('Document extraction failed. Use text-paste fallback.', 'error');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(`Could not read file: ${err?.message || 'Unknown error'}`);
    }
  };

  // Record Human Decision on Finding
  const handleFindingDecision = async (
    finding: AuditFinding,
    decision: DecisionStatus,
    customReplacementText?: string,
    rejectionReasonText?: string
  ) => {
    if (!activeReport) return;

    try {
      const res = await fetch(`/api/history/${activeReport.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findingId: finding.id,
          decision,
          editedReplacement: customReplacementText,
          rejectionReason: rejectionReasonText,
          decidedBy: currentUser.name,
          decidedByRole: currentUser.roleLabel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to save decision to server.', 'error');
        return;
      }

      const updatedReport: AuditReport = data.report;
      setActiveReport(updatedReport);
      if (updatedReport.currentText) {
        setDraftText(updatedReport.currentText);
        if (extractedPreviewText !== null) {
          setExtractedPreviewText(updatedReport.currentText);
        }
      }
      setAuditHistory(prev => prev.map(r => (r.id === updatedReport.id ? updatedReport : r)));
      setEditingFindingId(null);
      setRejectingFindingId(null);

      if (decision === 'accepted') {
        triggerToast(`Accepted correction: "${finding.originalSpan}" → "${finding.suggestedReplacement}"`, 'success');
      } else if (decision === 'edited') {
        triggerToast(`Saved edited replacement: "${customReplacementText}"`, 'success');
      } else if (decision === 'rejected') {
        triggerToast(`Rejected suggestion: preserved "${finding.originalSpan}"`, 'info');
      } else {
        triggerToast(`Flagged "${finding.originalSpan}" for human verification.`, 'info');
      }
    } catch (err: any) {
      triggerToast(`Saving decision failed: ${err?.message || 'Network error'}`, 'error');
    }
  };

  // AI Auto-Fix Creative Handlers
  const handleGenerateAutoFix = async () => {
    if (!activeReport) {
      triggerToast('No active audit report available to auto-fix.', 'error');
      return;
    }

    const accepted = activeReport.findings.filter(f => f.decision === 'accepted');
    if (accepted.length === 0) {
      triggerToast('Accept at least one correction above to generate an auto-fixed creative.', 'error');
      return;
    }

    setIsGeneratingAutoFix(true);
    setAutoFixError(null);

    try {
      const res = await fetch('/api/auto-fix-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrandId,
          reportId: activeReport.id,
          imageUrl: activeReport.imageUrl,
          base64Image: uploadedImageBase64 || undefined,
          acceptedFindings: accepted,
          draftTitle: activeReport.title,
          filename: activeReport.sourceFilename || uploadedFileName || 'advertisement.png'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate auto-fixed creative.');

      setAutoFixResult(data.result);
      triggerToast(
        `✨ AI Auto-Fix Creative generated! ${data.result.secondAudit?.totalResolved ?? accepted.length} corrections verified by second audit.`,
        'success'
      );

      setTimeout(() => {
        creativePreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setAutoFixError(err.message || 'Error generating creative');
      triggerToast(`Auto-fix creative error: ${err.message || 'Server error'}`, 'error');
    } finally {
      setIsGeneratingAutoFix(false);
    }
  };

  const handleApproveAutoFixCreative = async () => {
    if (!autoFixResult || !activeReport) return;
    setIsApprovingAutoFix(true);
    try {
      const res = await fetch('/api/auto-fix-creative/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: activeReport.id,
          resultId: autoFixResult.id,
          approvedBy: currentUser.name,
          approvedByRole: currentUser.roleLabel
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve creative.');

      setAutoFixResult(prev => (prev ? { ...prev, status: 'approved' } : null));
      setActiveReport(data.report);
      setAuditHistory(prev => prev.map(r => (r.id === data.report.id ? data.report : r)));
      triggerToast('✓ Creative approved for publication! Compliance record updated.', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to approve creative', 'error');
    } finally {
      setIsApprovingAutoFix(false);
    }
  };

  const handleDownloadAutoFixCreative = () => {
    if (!autoFixResult?.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = autoFixResult.generatedImageUrl;
    link.download = `${activeBrand?.name || 'brand'}-autofixed-creative.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Downloading corrected creative image...', 'info');
  };

  // Final Content Publication Approval
  const handleContentApprovalDecision = async (status: ContentApprovalStatus) => {
    if (!activeReport) return;
    try {
      const res = await fetch(`/api/history/${activeReport.id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentApprovalStatus: status,
          contentApprovedBy: `${currentUser.name} (${currentUser.roleLabel})`,
          contentApprovalNotes: approvalNotesInput.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to save content approval status.', 'error');
        return;
      }
      const updatedReport: AuditReport = data.report;
      setActiveReport(updatedReport);
      setAuditHistory(prev => prev.map(r => (r.id === updatedReport.id ? updatedReport : r)));
      triggerToast(`Updated content publication status: ${status.replace(/_/g, ' ')}`, 'success');
      setApprovalNotesInput('');
    } catch (err: any) {
      triggerToast(`Failed to update publication status: ${err?.message}`, 'error');
    }
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      setBrands(data.brands || {});
      setAuditHistory(data.auditHistory || []);
      setRecurringPatterns(data.recurringPatterns || []);
      setRulesUndoStack({});
      setActiveReport(null);
      localStorage.removeItem(ACTIVE_REPORT_STORAGE_KEY);
      setActiveBrandId('novapay');
      localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, 'novapay');
      setDraftText('Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!');
      setContentTitle('NovaPay Promotional Ad (Canonical)');
      setContentType('Advertisement');
      executeReviewEngine(
        'novapay',
        'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
        'NovaPay Promotional Ad (Canonical)',
        'Advertisement',
        undefined,
        true
      );
      triggerToast('Reset all data to canonical NovaPay demo state.', 'success');
    } catch (err: any) {
      triggerToast(`Reset failed: ${err?.message}`, 'error');
    }
  };

  // Rule Management: Add / Edit / Toggle Approval / Delete
  const handleOpenCreateRule = (mode: 'manual' | 'ai_text' | 'pdf' | 'test' = 'manual') => {
    setEditingRule(null);
    setRuleModalMode(mode);
    setRuleForm({
      title: '',
      category: 'Visual Identity',
      ruleStatement: '',
      targetPatterns: '',
      approvedValue: '',
      sourceRef: `${activeBrand?.name || 'Brand'} Standards 2026`,
      status: 'Approved',
      severity: 'critical',
      explanation: ''
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: BrandRule) => {
    setEditingRule(rule);
    setRuleModalMode('manual');
    setRuleForm({
      title: rule.title,
      category: rule.category,
      ruleStatement: rule.ruleStatement,
      targetPatterns: rule.targetPatterns.join(', '),
      approvedValue: rule.approvedValue,
      sourceRef: rule.sourceRef,
      status: rule.status,
      severity: rule.severity,
      explanation: rule.explanation
    });
    setIsRuleModalOpen(true);
    setActiveRuleMenuId(null);
  };

  const handleOpenTestRule = (rule: BrandRule) => {
    setEditingRule(rule);
    setRuleModalMode('test');
    setIsRuleModalOpen(true);
    setActiveRuleMenuId(null);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand) return;

    if (!ruleForm.title.trim() || !ruleForm.approvedValue.trim()) {
      triggerToast('Title and approved value are required.', 'error');
      return;
    }

    try {
      const payload = {
        title: ruleForm.title.trim(),
        category: ruleForm.category,
        ruleStatement: ruleForm.ruleStatement.trim(),
        targetPatterns: ruleForm.targetPatterns
          .split(',')
          .map(p => p.trim())
          .filter(Boolean),
        approvedValue: ruleForm.approvedValue.trim(),
        sourceRef: ruleForm.sourceRef.trim(),
        status: ruleForm.status,
        severity: ruleForm.severity,
        explanation: ruleForm.explanation.trim()
      };

      let res: globalThis.Response;
      if (editingRule) {
        res = await fetch(`/api/brands/${activeBrand.id}/rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/brands/${activeBrand.id}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save rule');

      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      setIsRuleModalOpen(false);
      triggerToast(`Rule "${ruleForm.title}" saved successfully.`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to save rule: ${err?.message}`, 'error');
    }
  };

  const handleToggleRuleApproval = async (rule: BrandRule, targetStatus: RuleApprovalStatus) => {
    if (!activeBrand) return;
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      setActiveRuleMenuId(null);
      triggerToast(`Rule ${rule.id} updated to ${targetStatus}.`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to update rule: ${err?.message}`, 'error');
    }
  };

  const pushClientRuleUndoSnapshot = (brandId: string, rulesSnapshot: BrandRule[], label: string) => {
    const cloned = JSON.parse(JSON.stringify(rulesSnapshot)) as BrandRule[];
    setRulesUndoStack(prev => {
      const existing = prev[brandId] || [];
      return {
        ...prev,
        [brandId]: [
          ...existing.slice(-19),
          {
            rules: cloned,
            label,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
    });
  };

  const generateCaptchaCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleOpenDeleteAllModal = () => {
    if (!activeBrand || activeBrand.rules.length === 0) {
      triggerToast('There are no rules to delete for this brand.', 'info');
      return;
    }
    setCaptchaChallenge(generateCaptchaCode());
    setCaptchaInput('');
    setCaptchaError(null);
    setIsDeleteAllModalOpen(true);
  };

  const handleRefreshCaptcha = () => {
    setCaptchaChallenge(generateCaptchaCode());
    setCaptchaInput('');
    setCaptchaError(null);
  };

  const handleConfirmDeleteAllRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand) return;

    const normalizedInput = captchaInput.trim().toUpperCase();
    const normalizedChallenge = captchaChallenge.trim().toUpperCase();

    if (!normalizedInput) {
      setCaptchaError('Please enter the captcha verification code shown above.');
      return;
    }

    if (normalizedInput !== normalizedChallenge) {
      setCaptchaError('Captcha code does not match. Please check the characters and try again.');
      return;
    }

    const previousRules = activeBrand.rules || [];
    const countToDelete = previousRules.length;
    setIsDeletingAllRules(true);
    setCaptchaError(null);

    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/rules`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete all rules');

      pushClientRuleUndoSnapshot(
        activeBrand.id,
        previousRules,
        `Deleted all ${countToDelete} rules`
      );
      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      setIsDeleteAllModalOpen(false);
      setCaptchaInput('');
      triggerToast(
        `Deleted all ${countToDelete} rules from ${activeBrand.name}. Click "Undo" in Brand Knowledge to restore.`,
        'info'
      );
    } catch (err: any) {
      setCaptchaError(err?.message || 'Failed to delete rules.');
      triggerToast(`Failed to delete all rules: ${err?.message}`, 'error');
    } finally {
      setIsDeletingAllRules(false);
    }
  };

  const handleUndoRuleAction = async () => {
    if (!activeBrand) return;
    const brandStack = rulesUndoStack[activeBrand.id] || [];
    if (brandStack.length === 0) {
      triggerToast('No rule changes available to undo.', 'info');
      return;
    }

    const lastSnapshot = brandStack[brandStack.length - 1];
    setIsUndoingRules(true);

    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/rules/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fallbackRules: lastSnapshot.rules })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to undo rule deletion');

      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      setRulesUndoStack(prev => {
        const current = prev[activeBrand.id] || [];
        return {
          ...prev,
          [activeBrand.id]: current.slice(0, -1)
        };
      });
      triggerToast(
        `Undid "${lastSnapshot.label}" — restored ${data.brand?.rules?.length ?? lastSnapshot.rules.length} rules to ${activeBrand.name}.`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Undo failed: ${err?.message}`, 'error');
    } finally {
      setIsUndoingRules(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!activeBrand) return;
    const targetRule = activeBrand.rules.find(r => r.id === ruleId);
    const previousRules = activeBrand.rules || [];
    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/rules/${ruleId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      pushClientRuleUndoSnapshot(
        activeBrand.id,
        previousRules,
        `Deleted rule ${ruleId}${targetRule ? ` (${targetRule.title})` : ''}`
      );
      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      setActiveRuleMenuId(null);
      triggerToast(`Deleted rule ${ruleId}. Click "Undo" to restore.`, 'info');
    } catch (err: any) {
      triggerToast(`Failed to delete rule: ${err?.message}`, 'error');
    }
  };

  const handleDuplicateRule = async (rule: BrandRule) => {
    if (!activeBrand) return;
    try {
      const payload = {
        title: `${rule.title} (Copy)`,
        category: rule.category,
        ruleStatement: rule.ruleStatement,
        targetPatterns: rule.targetPatterns,
        approvedValue: rule.approvedValue,
        sourceDocumentName: rule.sourceDocumentName,
        sourcePage: rule.sourcePage,
        sourceSection: rule.sourceSection,
        sourceRef: rule.sourceRef,
        status: 'Draft',
        severityLevel:
          rule.severityLevel ||
          (rule.severity === 'critical' ? 'Critical' : rule.severity === 'warning' ? 'High' : 'Low'),
        severity: rule.severity,
        explanation: rule.explanation,
        updatedBy: currentUser.name,
        updatedByRole: currentUser.roleLabel
      };
      const res = await fetch(`/api/brands/${activeBrand.id}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate rule');
      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      triggerToast(`Duplicated "${rule.title}" as Draft rule ${data.rule?.id || ''}.`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to duplicate rule: ${err?.message}`, 'error');
    }
  };

  // PDF Rule Extraction Handlers
  const handlePdfFileSelected = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfExtractError('Invalid file format: Please select a valid PDF document (.pdf).');
      return;
    }
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPdfExtractError(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the 15 MB limit.`);
      return;
    }
    setPdfExtractError(null);
    setPdfFileName(file.name);
    setPdfFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
      setPdfBase64(base64Data);
    };
    reader.onerror = () => {
      setPdfExtractError('Failed to read the selected PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSamplePdf = async () => {
    try {
      setPdfExtractError(null);
      setIsExtractingPdf(true);
      setPdfExtractionProgress('Loading NovaPay Brand Standards 2026 PDF preset...');
      const res = await fetch('/assets/sample-docs/novapay-brand-standards-2026.pdf');
      if (!res.ok) throw new Error('Preset sample PDF file not found');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
        setPdfFileName('novapay-brand-standards-2026.pdf');
        setPdfFileSize(blob.size);
        setPdfBase64(base64Data);
        setIsExtractingPdf(false);
        triggerToast('Loaded NovaPay Brand Standards 2026 PDF preset. Ready to extract rules!', 'info');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setIsExtractingPdf(false);
      setPdfExtractError('Could not load preset sample PDF: ' + err.message);
      triggerToast('Could not load sample PDF', 'error');
    }
  };

  const handleClearPdf = () => {
    setPdfFileName('');
    setPdfFileSize(0);
    setPdfBase64('');
    setExtractedRules([]);
    setSelectedExtractedRuleIds(new Set());
    setExtractionSummary(null);
    setPdfExtractError(null);
    setEditingExtractedRuleId(null);
    setExtractedRulesSearch('');
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
  };

  const handleExtractRulesFromPdf = async () => {
    if (!pdfBase64) {
      setPdfExtractError('Please select or drop a PDF file first.');
      return;
    }
    if (!activeBrand) return;

    setIsExtractingPdf(true);
    setPdfExtractError(null);
    setPdfExtractionProgress('Reading PDF pages and extracting document text...');

    const step1 = setTimeout(() => {
      setPdfExtractionProgress('Identifying brand rules, prohibitions, and compliance requirements...');
    }, 450);
    const step2 = setTimeout(() => {
      setPdfExtractionProgress('Classifying categories and cross-referencing existing brand rules...');
    }, 1100);

    try {
      const res = await fetch('/api/extract-rules-from-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: pdfFileName,
          base64Pdf: pdfBase64,
          brandId: activeBrand.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract brand rules from PDF.');
      }

      const rulesList = data.extractedRules || data.rules || [];
      if (rulesList.length === 0) {
        throw new Error('No brand rules could be identified in the uploaded PDF. Please verify the document contains guideline statements.');
      }

      setExtractedRules(rulesList);
      setSelectedExtractedRuleIds(new Set(rulesList.map((r: ExtractedPdfRule) => r.id)));
      setExtractionSummary(data.summary || null);
      triggerToast(`Successfully extracted ${rulesList.length} brand rules from "${pdfFileName}"!`, 'success');
    } catch (err: any) {
      setPdfExtractError(err.message || 'Error processing PDF document');
      triggerToast(`Extraction failed: ${err.message}`, 'error');
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setIsExtractingPdf(false);
    }
  };

  const handleToggleSelectExtractedRule = (id: string) => {
    setSelectedExtractedRuleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllExtractedRules = (select: boolean) => {
    if (select) {
      setSelectedExtractedRuleIds(new Set(extractedRules.map(r => r.id)));
    } else {
      setSelectedExtractedRuleIds(new Set());
    }
  };

  const handleUpdateExtractedRule = (id: string, updates: Partial<ExtractedPdfRule>) => {
    setExtractedRules(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleDeleteExtractedRule = (id: string) => {
    setExtractedRules(prev => prev.filter(r => r.id !== id));
    setSelectedExtractedRuleIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    triggerToast('Removed rule from extracted queue.', 'info');
  };

  const handleBatchSaveExtractedRules = async (targetStatus: RuleApprovalStatus, onlySelected: boolean = true) => {
    if (!activeBrand) return;

    const rulesToSave = extractedRules.filter(r => (onlySelected ? selectedExtractedRuleIds.has(r.id) : true));
    if (rulesToSave.length === 0) {
      triggerToast('Please select at least one extracted rule to save.', 'error');
      return;
    }

    setIsSavingBatchRules(true);
    try {
      const payloadRules = rulesToSave.map(r => ({
        title: r.title.trim(),
        category: r.category,
        ruleStatement: r.ruleStatement.trim(),
        targetPatterns: r.targetPatterns,
        approvedValue: r.approvedValue.trim(),
        sourceRef: r.sourcePage ? `${pdfFileName || 'PDF'} (p.${r.sourcePage})` : (pdfFileName || 'PDF Document'),
        status: targetStatus,
        severity: r.severity || 'critical',
        explanation: r.explanation || r.ruleStatement
      }));

      const res = await fetch(`/api/brands/${activeBrand.id}/rules/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: payloadRules })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save batch rules.');

      setBrands(prev => ({ ...prev, [activeBrand.id]: data.brand }));
      handleClearPdf();
      setIsRuleModalOpen(false);
      setSelectedCategoryTab('All Rules');
      setRuleStatusFilter('All Statuses');
      triggerToast(
        `Saved ${data.addedCount} rules from PDF to ${activeBrand.name} Brand Knowledge as "${targetStatus}"!`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Batch save failed: ${err.message}`, 'error');
    } finally {
      setIsSavingBatchRules(false);
    }
  };

  // Recurring Issues Actions
  const handleInvestigatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigatingPattern) return;
    try {
      const res = await fetch('/api/clarity-loop/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: investigatingPattern.id,
          rootCause: invRootCause,
          rootCauseNotes: invNotes.trim(),
          correctiveAction: invAction.trim(),
          newStatus: 'investigating',
          investigatedBy: currentUser.name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Investigation update failed');
      setRecurringPatterns(data.recurringPatterns);
      setInvestigatingPattern(null);
      setInvNotes('');
      setInvAction('');
      triggerToast('Investigation findings saved successfully.', 'success');
    } catch (err: any) {
      triggerToast(`Failed to save investigation: ${err?.message}`, 'error');
    }
  };

  const handleSaveThresholdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clarity-loop/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholdForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update threshold config');
      setRecurrenceConfig(data.recurrenceConfig);
      setRecurringPatterns(data.recurringPatterns);
      setIsThresholdModalOpen(false);
      triggerToast('Alert recurrence thresholds updated.', 'success');
    } catch (err: any) {
      triggerToast(`Failed to update config: ${err?.message}`, 'error');
    }
  };

  // Rule counts calculation for active brand
  const activeBrandRules = activeBrand?.rules || [];
  const totalRulesCount = activeBrandRules.length;
  const approvedCount = activeBrandRules.filter(r => r.status === 'Approved').length;
  const draftCount = activeBrandRules.filter(r => r.status === 'Draft').length;
  const unverifiedCount = activeBrandRules.filter(r => r.status === 'Unverified').length;

  // Filtered Rules for Brand Knowledge Table (Matching Reference Image 2)
  const filteredRules = useMemo(() => {
    return activeBrandRules.filter(r => {
      // 1. Horizontal Category Nav Filter
      let matchesNavCategory = true;
      if (selectedCategoryTab === 'Visual Identity') {
        matchesNavCategory = r.category === 'Visual Identity';
      } else if (selectedCategoryTab === 'Messaging & Claims') {
        matchesNavCategory = r.category === 'Pricing & Facts' || r.category === 'Terminology' || r.category === 'Performance & Claims' || r.category === 'Messaging & Claims';
      } else if (selectedCategoryTab === 'Prohibited Content') {
        matchesNavCategory = r.category === 'Prohibited Claim' || r.category === 'Prohibited Content';
      } else if (selectedCategoryTab === 'Tone & Style') {
        matchesNavCategory = r.category === 'Tone & Style';
      } else if (selectedCategoryTab === 'Legal & Compliance') {
        matchesNavCategory = r.category === 'Legal & Compliance';
      } else if (selectedCategoryTab === 'Accessibility') {
        matchesNavCategory = r.category === 'Accessibility';
      }

      // 2. Dropdown Category Filter
      let matchesDropdownCategory = true;
      if (ruleCategoryFilter !== 'All Rule Types') {
        if (ruleCategoryFilter === 'Messaging & Claims') {
          matchesDropdownCategory = r.category === 'Messaging & Claims' || r.category === 'Pricing & Facts' || r.category === 'Terminology' || r.category === 'Performance & Claims';
        } else if (ruleCategoryFilter === 'Prohibited Content') {
          matchesDropdownCategory = r.category === 'Prohibited Content' || r.category === 'Prohibited Claim';
        } else {
          matchesDropdownCategory = r.category === ruleCategoryFilter;
        }
      }

      // 3. Dropdown Approval Status Filter
      let matchesStatus = true;
      if (ruleStatusFilter === 'Approved') {
        matchesStatus = r.status === 'Approved';
      } else if (ruleStatusFilter === 'Draft') {
        matchesStatus = r.status === 'Draft';
      } else if (ruleStatusFilter === 'Unverified') {
        matchesStatus = r.status === 'Unverified';
      }

      // 4. Search Filter
      const q = ruleSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.ruleStatement.toLowerCase().includes(q) ||
        r.approvedValue.toLowerCase().includes(q) ||
        r.sourceRef.toLowerCase().includes(q) ||
        r.targetPatterns.some(p => p.toLowerCase().includes(q));

      return matchesNavCategory && matchesDropdownCategory && matchesStatus && matchesSearch;
    });
  }, [activeBrandRules, selectedCategoryTab, ruleCategoryFilter, ruleStatusFilter, ruleSearchQuery]);

  // Filtered Extracted PDF Rules for Modal Review Stage
  const filteredExtractedRules = useMemo(() => {
    return extractedRules.filter(rule => {
      if (extractedRulesFilter === 'needs_review') {
        const isLowConf = (rule.confidenceScore ?? 1) < 0.75;
        if (!isLowConf && !rule.isDuplicate) return false;
      }
      if (extractedRulesFilter === 'duplicates' && !rule.isDuplicate) {
        return false;
      }
      if (extractedRulesSearch.trim()) {
        const q = extractedRulesSearch.toLowerCase();
        const matchesTitle = rule.title.toLowerCase().includes(q);
        const matchesStmt = rule.ruleStatement.toLowerCase().includes(q);
        const matchesCat = rule.category.toLowerCase().includes(q);
        const matchesVal = rule.approvedValue.toLowerCase().includes(q);
        const matchesPat = rule.targetPatterns.some(p => p.toLowerCase().includes(q));
        const matchesSource = (rule.sourceExcerpt || '').toLowerCase().includes(q);
        return matchesTitle || matchesStmt || matchesCat || matchesVal || matchesPat || matchesSource;
      }
      return true;
    });
  }, [extractedRules, extractedRulesFilter, extractedRulesSearch]);

  const extractedNeedsReviewCount = useMemo(
    () => extractedRules.filter(r => (r.confidenceScore ?? 1) < 0.75 || r.isDuplicate).length,
    [extractedRules]
  );

  const extractedDuplicatesCount = useMemo(
    () => extractedRules.filter(r => r.isDuplicate).length,
    [extractedRules]
  );

  // Active Alert count for sidebar badge
  const activeAlertsCount = useMemo(
    () => recurringPatterns.filter(p => p.thresholdTriggered && p.status !== 'resolved').length,
    [recurringPatterns]
  );

  // Render Interactive Highlighted Draft
  const renderInteractiveDraftText = () => {
    if (!activeReport) return null;
    const baseText = activeReport.originalText;
    const sorted = [...activeReport.findings]
      .filter(f => f.startIndex >= 0 && f.endIndex <= baseText.length)
      .sort((a, b) => a.startIndex - b.startIndex);

    if (sorted.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed text-xs text-slate-800">{baseText}</div>;
    }

    const elements: React.ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((f, idx) => {
      const start = Math.max(cursor, f.startIndex);
      const end = f.endIndex;
      if (start < cursor) return;

      if (start > cursor) {
        elements.push(<span key={`txt-${cursor}`}>{baseText.slice(cursor, start)}</span>);
      }

      const isSelected = selectedFindingId === f.id;
      const isAcceptedOrEdited = f.decision === 'accepted' || f.decision === 'edited';
      const isRejected = f.decision === 'rejected';
      const isUnsupported = f.classification === 'unsupported_claim' || f.classification === 'needs_human_verification';
      const isStyle = f.classification === 'style_tone_suggestion';

      const displayValue =
        f.decision === 'edited' && f.editedReplacement
          ? f.editedReplacement
          : f.decision === 'accepted' && f.suggestedReplacement
          ? f.suggestedReplacement
          : baseText.slice(start, end);

      let badgeStyle = 'bg-rose-50 text-rose-700 border-b-2 border-rose-500 font-medium';
      if (isAcceptedOrEdited) {
        badgeStyle = 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-500 font-semibold';
      } else if (isRejected) {
        badgeStyle = 'bg-slate-200/80 text-slate-700 border-b-2 border-slate-400';
      } else if (isUnsupported) {
        badgeStyle = 'bg-amber-50 text-amber-800 border-b-2 border-amber-500 font-medium';
      } else if (isStyle) {
        badgeStyle = 'bg-blue-50 text-blue-800 border-b-2 border-blue-500 font-medium';
      }

      elements.push(
        <span
          key={`find-${f.id}-${idx}`}
          onClick={() => setSelectedFindingId(f.id)}
          title={`${f.ruleId || 'Rule'}: ${f.conflictText}`}
          className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${badgeStyle} ${
            isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
          }`}
        >
          {displayValue}
        </span>
      );

      cursor = end;
    });

    if (cursor < baseText.length) {
      elements.push(<span key="txt-end">{baseText.slice(cursor)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed text-xs">{elements}</div>;
  };

  if (!authSession) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium border animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-md ${
            toastMessage.type === 'error'
              ? 'bg-red-950 text-white border-red-800'
              : toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-600'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="leading-snug">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DARK NAVY-BLUE SIDEBAR (Collapsible & Mouse-Resizable) */}
      {/* ========================================================= */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}
      <aside
        style={{
          width: isMobileSidebarOpen ? `${SIDEBAR_DEFAULT_EXPANDED_WIDTH}px` : `${sidebarWidth}px`
        }}
        aria-label="Primary Sidebar Navigation"
        className={`h-screen bg-[#0C1527] border-r border-[#17253D] flex-col justify-between shrink-0 z-40 text-slate-300 relative select-none ${
          isResizingSidebar
            ? 'transition-none'
            : 'transition-[width,transform] duration-200 ease-in-out'
        } ${
          isMobileSidebarOpen
            ? 'fixed inset-y-0 left-0 flex'
            : 'hidden lg:flex'
        }`}
      >
        <div className={`flex flex-col h-full ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto scrollbar-none'}`}>
          {/* Logo, Brand Identity & Collapse/Expand Toggle */}
          {isSidebarCollapsed ? (
            <div className="py-3 px-2 border-b border-[#17253D] flex flex-col items-center gap-2 shrink-0">
              {/* SkyNex AI Logo Icon */}
              <div
                onClick={handleToggleSidebar}
                title="SkyNex AI — Click to expand sidebar"
                className="w-10 h-10 rounded-lg bg-[#14223E] border border-blue-500/30 hover:border-cyan-400/60 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer transition-colors"
              >
                <Sliders className="w-5 h-5 text-cyan-400" />
              </div>

              {/* Dedicated Expand Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSidebar}
                aria-label="Expand sidebar"
                aria-expanded={false}
                title="Expand sidebar"
                className="w-9 h-7 rounded-md bg-[#131F37] hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-cyan-300 flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-16 px-4 border-b border-[#17253D] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#14223E] border border-blue-500/30 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-white truncate">SkyNex AI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-medium mt-0.5">
                    Review · Verify · Track Issues
                  </p>
                </div>
              </div>

              {/* Collapse Toggle Button (Desktop) & Close Drawer Button (Mobile) */}
              {isMobileSidebarOpen ? (
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close navigation drawer"
                  title="Close navigation drawer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleSidebar}
                  aria-label="Collapse sidebar"
                  aria-expanded={true}
                  title="Collapse sidebar"
                  className="p-1.5 rounded-lg bg-[#131F37] hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className={`${isSidebarCollapsed ? 'p-2 mt-1' : 'p-3 space-y-6'}`}>
            <ul className={`${isSidebarCollapsed ? 'space-y-2 flex flex-col items-center' : 'space-y-1'}`}>
              {/* 1. Review Content */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('review');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Review Content"
                  title={isSidebarCollapsed ? "Review Content" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'review'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className={`w-4 h-4 shrink-0 ${currentView === 'review' ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Review Content</span>}
                  </div>
                  {!isSidebarCollapsed && activeReport && activeReport.findings.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        currentView === 'review'
                          ? 'bg-blue-700 text-white'
                          : 'bg-red-950/80 text-red-300 border border-red-700/50'
                      }`}
                    >
                      {activeReport.findings.length}
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Review Content
                  </div>
                )}
              </li>

              {/* 2. Brand Knowledge */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('knowledge');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Brand Knowledge"
                  title={isSidebarCollapsed ? "Brand Knowledge" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'knowledge'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className={`w-4 h-4 shrink-0 ${currentView === 'knowledge' ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Brand Knowledge</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        currentView === 'knowledge'
                          ? 'bg-blue-700 text-white'
                          : 'bg-[#152037] text-slate-300'
                      }`}
                    >
                      {approvedCount} active
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Brand Knowledge
                  </div>
                )}
              </li>

              {/* 2.2 Regulatory Compliance */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('regulatory');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Regulatory Compliance"
                  title={isSidebarCollapsed ? "Regulatory Compliance" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'regulatory'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Landmark className={`w-4 h-4 shrink-0 ${currentView === 'regulatory' ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Regulatory Compliance</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        currentView === 'regulatory'
                          ? 'bg-blue-700 text-white'
                          : 'bg-[#152037] text-slate-300'
                      }`}
                    >
                      {regulatoryDepartments.length} depts
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Regulatory Compliance
                  </div>
                )}
              </li>

              {/* 2.5 Brand DNA Analyzer */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('dna');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Brand DNA Analyzer"
                  title={isSidebarCollapsed ? "Brand DNA Analyzer" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'dna'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Dna className={`w-4 h-4 shrink-0 ${currentView === 'dna' ? 'text-white' : 'text-cyan-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Brand DNA Analyzer</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        currentView === 'dna'
                          ? 'bg-blue-700 text-white'
                          : activeBrand?.brandDnaProfile
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                          : 'bg-[#152037] text-cyan-300'
                      }`}
                    >
                      {activeBrand?.brandDnaProfile ? 'Saved' : 'New'}
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Brand DNA Analyzer
                  </div>
                )}
              </li>

              {/* 3. Review History */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('history');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Review History"
                  title={isSidebarCollapsed ? "Review History" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'history'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock className={`w-4 h-4 shrink-0 ${currentView === 'history' ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Review History</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        currentView === 'history' ? 'bg-blue-700 text-white' : 'bg-[#152037] text-slate-300'
                      }`}
                    >
                      {auditHistory.length}
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Review History
                  </div>
                )}
              </li>

              {/* 4. Recurring Issues */}
              <li className="w-full relative group">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('recurring');
                    setIsMobileSidebarOpen(false);
                  }}
                  aria-label="Recurring Issues"
                  title={isSidebarCollapsed ? "Recurring Issues" : undefined}
                  className={`${
                    isSidebarCollapsed
                      ? 'w-11 h-11 mx-auto justify-center'
                      : 'w-full justify-between px-3 py-2.5'
                  } flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    currentView === 'recurring'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TrendingUp className={`w-4 h-4 shrink-0 ${currentView === 'recurring' ? 'text-white' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">Recurring Issues</span>}
                  </div>
                  {!isSidebarCollapsed && activeAlertsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
                {isSidebarCollapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                  >
                    Recurring Issues
                  </div>
                )}
              </li>
              {/* 5. Switch Brand (Shown in icon-only collapsed sidebar) */}
              {isSidebarCollapsed && (
                <li className="w-full pt-2 mt-1 border-t border-[#17253D] relative group">
                  <button
                    type="button"
                    onClick={() => setIsBrandDropdownOpen(prev => !prev)}
                    aria-label="Switch & Manage Active Brand"
                    title={`Switch Brand (${activeBrand?.name || 'NovaPay'})`}
                    className={`w-11 h-11 mx-auto justify-center flex items-center rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 relative ${
                      isBrandDropdownOpen
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 bg-[#131F37]/80 border border-slate-700/60'
                    }`}
                  >
                    <ArrowLeftRight className={`w-4 h-4 shrink-0 ${isBrandDropdownOpen ? 'text-white' : 'text-cyan-400'}`} />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-[#0C1527] absolute top-1.5 right-1.5"
                      style={{ backgroundColor: activeBrand?.primaryColor || '#2563EB' }}
                    />
                  </button>

                  {!isBrandDropdownOpen && (
                    <div
                      role="tooltip"
                      className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
                    >
                      Switch Brand ({activeBrand?.name || 'NovaPay'})
                    </div>
                  )}

                  {/* Collapsed Sidebar Brand Switcher Popover */}
                  {isBrandDropdownOpen && (
                    <div className="  absolute left-full top-0 ml-2.5 w-72 bg-[#16233B] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 pb-2 border-b border-slate-700/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Switch Brand ({Object.keys(brands).length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBrandDropdownOpen(false)}
                          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                          title="Close switcher"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2 border-b border-slate-700/50 bg-[#121D32]">
                        <button
                          type="button"
                          onClick={handleOpenAddBrandModal}
                          className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Brand</span>
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                        {Object.values(brands).map(b => {
                          const isSelected = activeBrandId === b.id;
                          const ruleCount = b.rules?.length || 0;
                          return (
                            <div
                              key={b.id}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                                isSelected
                                  ? 'bg-blue-900/40 border border-blue-500/50 text-white'
                                  : 'hover:bg-slate-700/40 text-slate-200'
                              }`}
                            >
                              <div
                                onClick={() => handleSelectBrand(b.id)}
                                className="min-w-0 flex-1 cursor-pointer"
                                title={`Switch to ${b.name}`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: b.primaryColor || '#2563EB' }}
                                  />
                                  <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                    {b.name}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 pl-4 truncate">
                                  {b.industry || 'Enterprise'} · {ruleCount} rules
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isSelected ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                                    Active
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectBrand(b.id)}
                                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white cursor-pointer transition-colors"
                                    title={`Switch to ${b.name}`}
                                  >
                                    Switch
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={e => handleOpenRemoveBrand(b, e)}
                                  disabled={Object.keys(brands).length <= 1}
                                  title={
                                    Object.keys(brands).length <= 1
                                      ? 'Cannot remove the only brand profile'
                                      : `Remove brand "${b.name}"`
                                  }
                                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 disabled:opacity-20 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="px-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{approvedCount} active rules</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView('knowledge');
                            setIsBrandDropdownOpen(false);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                        >
                          Manage Rules →
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )}
            </ul>

            {/* Governance Pipeline & Selected Brand Sections (Shown only when expanded) */}
            {!isSidebarCollapsed && (
              <>
                {/* Governance Pipeline Section */}
                <div>
                  <div className="px-3 mb-2.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
                    Governance Pipeline
                  </div>
                  <div className="space-y-2 px-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="truncate">Approved Rules Only</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                      <span className="truncate">Deterministic + Gemini AI</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                      <span className="truncate">Evidence-Linked Findings</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                      <span className="truncate">Human Decisions & History</span>
                    </div>
                  </div>
                </div>

                {/* Selected Brand Section */}
                <div>
                  <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    <span className="truncate">Selected Brand</span>
                    <button
                      type="button"
                      onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold lowercase flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      title="Open Switch Brand menu"
                    >
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      <span>switch</span>
                    </button>
                  </div>

                  <div className="mx-1 p-3 rounded-lg bg-[#131F37] border border-slate-700/60 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs truncate">{activeBrand?.name || 'NovaPay'}</span>
                          <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 rounded px-1.5 py-0.2 text-[10px] font-medium">
                            {activeBrand?.fictionalLabel || 'Active'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {activeBrand?.industry || 'Enterprise'}
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Buttons in Card: Switch Brand & Add Brand */}
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                        className="flex-1 py-1.5 px-2 rounded-md bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs truncate"
                        title="Switch active brand"
                      >
                        <ArrowLeftRight className="w-3 h-3 text-cyan-300 shrink-0" />
                        <span className="truncate">Switch Brand</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddBrandModal}
                        className="py-1.5 px-2.5 rounded-md bg-[#1B2B4C] hover:bg-[#22365F] border border-blue-500/30 text-cyan-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
                        title="Add new brand to workspace"
                      >
                        <Plus className="w-3 h-3 shrink-0" />
                        <span>Add Brand</span>
                      </button>
                    </div>

                    {/* Brand Switcher Popover */}
                    {isBrandDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-72 bg-[#16233B] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                        {/* Header with Title & Close */}
                        <div className="px-3 pb-2 border-b border-slate-700/70 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Switch Brand ({Object.keys(brands).length})</span>
                          </div>
                          <button
                            onClick={() => setIsBrandDropdownOpen(false)}
                            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                            title="Close switcher"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Add Brand Button Inside Switch Section */}
                        <div className="p-2 border-b border-slate-700/50 bg-[#121D32]">
                          <button
                            type="button"
                            onClick={handleOpenAddBrandModal}
                            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Brand</span>
                          </button>
                        </div>

                        {/* Brand Items List */}
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                          {Object.values(brands).map(b => {
                            const isSelected = activeBrandId === b.id;
                            const ruleCount = b.rules?.length || 0;
                            return (
                              <div
                                key={b.id}
                                className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                                  isSelected
                                    ? 'bg-blue-900/40 border border-blue-500/50 text-white'
                                    : 'hover:bg-slate-700/40 text-slate-200'
                                }`}
                              >
                                <div
                                  onClick={() => handleSelectBrand(b.id)}
                                  className="min-w-0 flex-1 cursor-pointer"
                                  title={`Switch to ${b.name}`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: b.primaryColor || '#2563EB' }}
                                    />
                                    <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                      {b.name}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 pl-4 truncate">
                                    {b.industry || 'Enterprise'} · {ruleCount} rules
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {isSelected ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                                      Active
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectBrand(b.id)}
                                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white cursor-pointer transition-colors"
                                      title={`Switch to ${b.name}`}
                                    >
                                      Switch
                                    </button>
                                  )}

                                  {/* Remove Brand Button */}
                                  <button
                                    type="button"
                                    onClick={e => handleOpenRemoveBrand(b, e)}
                                    disabled={Object.keys(brands).length <= 1}
                                    title={
                                      Object.keys(brands).length <= 1
                                        ? 'Cannot remove the only brand profile'
                                        : `Remove brand "${b.name}"`
                                    }
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 disabled:opacity-20 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="px-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{approvedCount} active rules</span>
                          <button
                            onClick={() => {
                              setCurrentView('knowledge');
                              setIsBrandDropdownOpen(false);
                            }}
                            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                          >
                            Manage Rules →
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{approvedCount} approved rules</span>
                      <button
                        onClick={() => setCurrentView('knowledge')}
                        className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer shrink-0"
                      >
                        Manage Rules →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Bottom Actions: Reset Demo Data & Sign Out */}
        <div className="p-2.5 border-t border-[#17253D] bg-[#0A1221] space-y-1 shrink-0">
          <div className="relative group">
            <button
              type="button"
              onClick={handleResetDemoData}
              aria-label="Reset Demo Data"
              title="Reset rules and review history to initial canonical NovaPay demo state"
              className={`${
                isSidebarCollapsed
                  ? 'w-11 h-9 mx-auto justify-center'
                  : 'w-full py-1.5 px-2 justify-center gap-1.5'
              } rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Reset Demo Data</span>}
            </button>
            {isSidebarCollapsed && (
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
              >
                Reset Demo Data
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign Out"
              title="Sign out and return to Evaluator Demo Login page"
              className={`${
                isSidebarCollapsed
                  ? 'w-11 h-9 mx-auto justify-center'
                  : 'w-full py-1.5 px-2 justify-center gap-1.5'
              } rounded-lg text-xs font-medium text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/30 flex items-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Sign Out</span>}
            </button>
            {isSidebarCollapsed && (
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 z-50"
              >
                Sign Out
              </div>
            )}
          </div>
        </div>

        {/* Draggable Right-Edge Resize Handle (Desktop Only) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
          onMouseDown={handleStartResizeSidebar}
          onDoubleClick={handleToggleSidebar}
          onKeyDown={e => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setSidebarWidth(w => {
                const next = Math.min(SIDEBAR_MAX_WIDTH, w < SIDEBAR_FULL_CONTENT_THRESHOLD ? SIDEBAR_FULL_CONTENT_THRESHOLD : w + 16);
                setLastExpandedWidth(next);
                localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY, String(next));
                return next;
              });
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setSidebarWidth(w => {
                const next = w - 16;
                return next < SIDEBAR_FULL_CONTENT_THRESHOLD ? SIDEBAR_MIN_WIDTH : Math.max(SIDEBAR_MIN_WIDTH, next);
              });
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleSidebar();
            }
          }}
          title="Drag horizontally to resize sidebar (72px–320px), or double-click to toggle"
          className={`hidden lg:flex absolute top-0 -right-1 bottom-0 w-2 cursor-col-resize z-50 items-center justify-center group/resizer focus-visible:outline-none ${
            isResizingSidebar ? 'bg-cyan-400/40' : 'hover:bg-cyan-400/25'
          } transition-colors`}
        >
          <div
            className={`w-[2px] h-10 rounded-full transition-colors ${
              isResizingSidebar
                ? 'bg-cyan-400'
                : 'bg-transparent group-hover/resizer:bg-cyan-400/80 group-focus-visible/resizer:bg-cyan-400'
            }`}
          />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE CANVAS                                  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/90 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Mobile Drawer Toggle & Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer shrink-0"
              title="Toggle navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={ruleSearchQuery}
                onChange={e => {
                  setRuleSearchQuery(e.target.value);
                  if (currentView !== 'knowledge' && e.target.value.trim().length > 0) {
                    setCurrentView('knowledge');
                  }
                }}
                placeholder="Search across rules, assets, guidelines..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-[#F8FAFC] focus:bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          </div>

          {/* Right: DEMO MODE Badge + Switch & Manage Active Brand + Run Sample Ad + Notifications + Workspace Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Visible DEMO MODE Indicator in Dashboard */}
            {authSession?.isDemo && (
              <div
                data-testid="demo-mode-indicator"
                title="Evaluator Demo Sandbox Active — Production data is isolated and protected"
                className="h-9 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs font-extrabold tracking-wide shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>DEMO MODE</span>
                <span className="hidden xl:inline text-[10px] font-semibold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200">
                  Sandbox Isolated
                </span>
              </div>
            )}

            {/* Switch & Manage Active Brand Box */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHeaderBrandMenuOpen(prev => !prev)}
                className="h-9 px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 rounded-xl shadow-2xs flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer transition-all"
                title="Switch or manage active brand"
              >
                <span
                  className="w-5 h-5 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: activeBrand?.primaryColor || '#2563EB' }}
                >
                  {(activeBrand?.name || 'N').charAt(0).toUpperCase()}
                </span>
                <span className="font-bold text-slate-900 max-w-[120px] truncate">
                  {activeBrand?.name || 'NovaPay'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isHeaderBrandMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Switch & Manage Brand ({Object.keys(brands).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHeaderBrandMenuOpen(false);
                        handleOpenAddBrandModal();
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Brand</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {Object.values(brands).map(b => {
                      const isSelected = b.id === activeBrandId;
                      return (
                        <div
                          key={b.id}
                          className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${
                            isSelected ? 'bg-blue-50/80 text-blue-950' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectBrand(b.id);
                              setIsHeaderBrandMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span
                              className="w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                              style={{ backgroundColor: b.primaryColor || '#2563EB' }}
                            >
                              {b.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{b.name}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {b.rules?.length || 0} rules · {b.industry || 'Enterprise'}
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            {isSelected ? (
                              <Check className="w-4 h-4 text-blue-600" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectBrand(b.id);
                                  setIsHeaderBrandMenuOpen(false);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white cursor-pointer transition-colors"
                              >
                                Switch
                              </button>
                            )}
                            {Object.keys(brands).length > 1 && (
                              <button
                                type="button"
                                onClick={e => {
                                  setIsHeaderBrandMenuOpen(false);
                                  handleOpenRemoveBrand(b, e);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title={`Remove ${b.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{approvedCount} active rules</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('knowledge');
                        setIsHeaderBrandMenuOpen(false);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Manage Rules →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Run Sample Ad Button */}
            <button
              onClick={handleRunCanonicalSampleAd}
              className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title='Load and run canonical NovaPay advertisement: "Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!"'
            >
              <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span className="hidden sm:inline">Run Sample Ad</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center relative cursor-pointer transition-colors"
                title="Governance notifications"
              >
                <Bell className="w-4 h-4" />
                {(activeAlertsCount + draftCount + unverifiedCount) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Governance Notifications</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {activeAlertsCount + draftCount + unverifiedCount} active
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {(draftCount + unverifiedCount) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('knowledge');
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full p-3 text-left hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {draftCount + unverifiedCount} rules need attention
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {draftCount} Draft and {unverifiedCount} Unverified rules in {activeBrand?.name || 'NovaPay'}.
                          </div>
                        </div>
                      </button>
                    )}
                    {activeAlertsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('recurring');
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full p-3 text-left hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {activeAlertsCount} recurring compliance alert{activeAlertsCount === 1 ? '' : 's'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Repeated brand violations exceeded threshold.
                          </div>
                        </div>
                      </button>
                    )}
                    {(activeAlertsCount + draftCount + unverifiedCount) === 0 && (
                      <div className="p-4 text-center text-slate-500">
                        All rules and compliance checks are up to date.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {authSession?.isDemo ? 'DE' : currentUser.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {authSession?.isDemo ? 'Demo Evaluator' : currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {authSession?.isDemo ? DEMO_CREDENTIALS.email : currentUser.roleLabel}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                  {authSession && (
                    <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Authenticated Account
                        </span>
                        {authSession.isDemo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            DEMO MODE
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate mt-1">{authSession.displayName}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">{authSession.email}</div>
                    </div>
                  )}
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Active Governance Persona
                  </div>
                  <div className="p-1.5 space-y-1">
                    {USER_PROFILES.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setCurrentUser(profile);
                          setIsRoleDropdownOpen(false);
                          triggerToast(`Switched active persona to ${profile.name} (${profile.roleLabel})`, 'info');
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer ${
                          currentUser.id === profile.id ? 'bg-blue-50/80 border border-blue-200' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {profile.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{profile.name}</div>
                          <div className="text-[11px] text-slate-500">{profile.roleLabel}</div>
                        </div>
                        {currentUser.id === profile.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 ml-auto shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="px-2 pt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full p-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Return to Login Page</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {/* ========================================================= */}
          {/* PAGE ONE: REVIEW CONTENT (Responsive Workspace)           */}
          {/* ========================================================= */}
          {currentView === 'review' && (
            <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 transition-all duration-300">
              {/* Upper Section: Content Editor & Audit Findings Grid */}
              <div
                className={`grid grid-cols-1 ${
                  showAuditPanel ? 'lg:grid-cols-12 gap-6 items-start' : 'max-w-4xl mx-auto'
                }`}
              >
                {/* LEFT COLUMN: Content Editor & Interactive Draft & Visual Image Review */}
                <div
                  className={`w-full space-y-6 ${
                    showAuditPanel ? 'lg:col-span-7 xl:col-span-7' : 'w-full'
                  }`}
                >
                {/* Page Introduction */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Content</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Check your content against approved brand guidelines.
                  </p>

                  {/* Compact Brand Information Row */}
                  <div className="mt-3.5 flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-bold text-slate-900">{activeBrand?.name || 'NovaPay'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{approvedCount} approved rules</span>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                      {activeBrand?.fictionalLabel || 'Fictional Demo'}
                    </span>

                    {/* Switch Brand Button + Inline Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsReviewBrandMenuOpen(prev => !prev)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-lg px-3 py-1 cursor-pointer transition-colors"
                        title="Switch active brand"
                      >
                        <span>Switch Brand</span>
                      </button>

                      {isReviewBrandMenuOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
                          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Select Brand
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsReviewBrandMenuOpen(false)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                            {Object.values(brands).map(b => {
                              const isCurrent = b.id === activeBrandId;
                              const bApproved = b.rules.filter(r => r.status === 'Approved').length;
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    handleSelectBrand(b.id);
                                    setIsReviewBrandMenuOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                                    isCurrent ? 'bg-blue-50/50' : ''
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">{b.name}</div>
                                    <div className="text-[10px] text-slate-500">{bApproved} approved rules</div>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddBrandModal}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 cursor-pointer transition-colors"
                      title="Add new brand"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                      <span>Add Brand</span>
                    </button>
                  </div>
                </div>

                {/* Add Your Content Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Add Your Content</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose how you want to submit content for brand review.
                    </p>
                  </div>

                  {/* 3-Card Segmented Content Input Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Card 1: Paste Text */}
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        inputMode === 'paste'
                          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/15'
                          : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/90'
                      }`}
                    >
                      <div className="shrink-0">
                        <FileText
                          className={`w-5 h-5 ${
                            inputMode === 'paste' ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            inputMode === 'paste' ? 'text-blue-600' : 'text-slate-800'
                          }`}
                        >
                          Paste Text
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Type or paste your content
                        </div>
                      </div>
                    </button>

                    {/* Card 2: Upload Document */}
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        inputMode === 'upload'
                          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/15'
                          : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/90'
                      }`}
                    >
                      <div className="shrink-0">
                        <FileUp
                          className={`w-5 h-5 ${
                            inputMode === 'upload' ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            inputMode === 'upload' ? 'text-blue-600' : 'text-slate-800'
                          }`}
                        >
                          Upload Document
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          .txt, .md, .docx, .pdf
                        </div>
                      </div>
                    </button>

                    {/* Card 3: Upload Image */}
                    <button
                      type="button"
                      onClick={() => setInputMode('image')}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        inputMode === 'image'
                          ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/15'
                          : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/90'
                      }`}
                    >
                      <div className="shrink-0">
                        <ImageIcon
                          className={`w-5 h-5 ${
                            inputMode === 'image' ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            inputMode === 'image' ? 'text-blue-600' : 'text-slate-800'
                          }`}
                        >
                          Upload Image
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Upload advertisement image
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Mode 1: Paste Text */}
                  {inputMode === 'paste' && (
                    <div className="space-y-4">
                      {/* Outdated Content Alert Banner */}
                      {isContentOutdated && (
                        <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <span className="font-bold">Content modified since last review.</span>{' '}
                              <span className="text-amber-800">
                                Previous audit findings are outdated. Click <strong>Check Content</strong> to run a fresh audit.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {activeReport && !showOutdatedFindingsOverride && (
                              <button
                                type="button"
                                onClick={() => setShowOutdatedFindingsOverride(true)}
                                className="text-amber-800 hover:text-amber-950 font-semibold underline text-[11px] cursor-pointer"
                              >
                                View Outdated Findings
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => executeReviewEngine(activeBrandId, draftText, contentTitle, contentType)}
                              disabled={isAnalyzing}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{isAnalyzing ? 'Checking...' : 'Check Content Now'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Type & Draft Title Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1.5">
                            Content Type
                          </label>
                          <select
                            value={contentType}
                            onChange={e => {
                              setContentType(e.target.value);
                              if (activeReport || hasAuditedCurrentDraft) {
                                setIsContentOutdated(true);
                                setShowOutdatedFindingsOverride(false);
                              }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="Advertisement">Advertisement</option>
                            <option value="Social Media Post">Social Media Post</option>
                            <option value="Landing Page Copy">Landing Page Copy</option>
                            <option value="Email Newsletter">Email Newsletter</option>
                            <option value="Blog Post">Blog Post</option>
                            <option value="Press Release">Press Release</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1.5">
                            Draft Title
                          </label>
                          <input
                            type="text"
                            value={contentTitle}
                            onChange={e => {
                              setContentTitle(e.target.value);
                              if (activeReport || hasAuditedCurrentDraft) {
                                setIsContentOutdated(true);
                                setShowOutdatedFindingsOverride(false);
                              }
                            }}
                            placeholder="NovaPay Promotional Ad (Canonical)"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Large Text Editor */}
                      <div>
                        <textarea
                          ref={draftTextareaRef}
                          value={draftText}
                          onChange={e => {
                            setDraftText(e.target.value);
                            if (activeReport || hasAuditedCurrentDraft) {
                              setIsContentOutdated(true);
                              setShowOutdatedFindingsOverride(false);
                            }
                          }}
                          rows={!showAuditPanel ? 7 : 5}
                          placeholder="Paste or type content draft to review..."
                          className="w-full border border-slate-200 rounded-xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y leading-relaxed font-sans"
                        />
                      </div>

                      {/* Options Row: Checkbox 1 & 2 */}
                      <div className="flex flex-wrap items-center gap-4 pt-0.5">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableGemini}
                            onChange={e => setEnableGemini(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                          />
                          <span>AI-Assisted Contextual Review (Gemini)</span>
                        </label>

                        {enableGemini && (
                          <label className="flex items-center gap-2 bg-amber-50/90 text-amber-800 border border-amber-200/80 rounded-full px-3.5 py-1 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={simulateAiFailure}
                              onChange={e => setSimulateAiFailure(e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                            />
                            <span>Simulate AI Unavailable (Test Fallback)</span>
                          </label>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleClearEditor}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Clear Editor
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!draftText.trim()) {
                              triggerToast('Draft content cannot be empty. Please enter text to check.', 'error');
                              return;
                            }
                            executeReviewEngine(activeBrandId, draftText, contentTitle, contentType);
                          }}
                          disabled={isAnalyzing}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-white" />
                          )}
                          <span>{isAnalyzing ? 'Checking Content...' : 'Check Content'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Upload Document */}
                  {inputMode === 'upload' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1.5">
                            Content Type
                          </label>
                          <select
                            value={contentType}
                            onChange={e => setContentType(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="Advertisement">Advertisement</option>
                            <option value="Social Media Post">Social Media Post</option>
                            <option value="Landing Page Copy">Landing Page Copy</option>
                            <option value="Email Newsletter">Email Newsletter</option>
                            <option value="Blog Post">Blog Post</option>
                            <option value="Press Release">Press Release</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1.5">
                            Draft Title
                          </label>
                          <input
                            type="text"
                            value={contentTitle}
                            onChange={e => setContentTitle(e.target.value)}
                            placeholder="Document Review Title"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.md,.docx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-900">
                          Upload a document for server-side text extraction
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Supported formats: <span className="font-mono">.txt, .md, .docx, .pdf</span> (Max 10 MB).
                        </p>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                          >
                            {isUploading ? 'Extracting Text...' : 'Select Document File'}
                          </button>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
                          <span>{uploadError}</span>
                          <button
                            type="button"
                            onClick={() => setInputMode('paste')}
                            className="font-semibold text-red-700 hover:underline cursor-pointer"
                          >
                            Switch to Paste Text →
                          </button>
                        </div>
                      )}

                      {extractedPreviewText && (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Extracted Text from "{uploadedFileName}":
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {extractedPreviewText.length} characters
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto font-sans leading-relaxed">
                            {extractedPreviewText}
                          </div>
                          <div className="pt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={handleClearDocument}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Clear Document
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!extractedPreviewText || !extractedPreviewText.trim()) {
                                  triggerToast('Extracted document text is empty. Please select a valid document.', 'error');
                                  return;
                                }
                                executeReviewEngine(
                                  activeBrandId,
                                  extractedPreviewText,
                                  contentTitle,
                                  contentType,
                                  uploadedFileName || undefined
                                );
                              }}
                              disabled={isAnalyzing}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isAnalyzing ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-white" />
                              )}
                              <span>{isAnalyzing ? 'Checking Document...' : 'Check Content'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Upload Image */}
                  {inputMode === 'image' && (
                    <ImageUploadWorkspace
                      brand={activeBrand}
                      uploadedImagePreview={uploadedImagePreview}
                      uploadedImageName={uploadedImageName}
                      uploadedImageSize={uploadedImageSize}
                      uploadedImageDims={uploadedImageDims}
                      imageReviewError={imageReviewError}
                      isAnalyzing={isAnalyzing}
                      enableGemini={enableGemini}
                      simulateAiFailure={simulateAiFailure}
                      onFileSelect={processImageFile}
                      onClearImage={handleClearImage}
                      onSubmitReview={() => {
                        if (!uploadedImageBase64) {
                          triggerToast('Please select or upload an advertisement image first.', 'error');
                          return;
                        }
                        executeImageReviewEngine(
                          activeBrandId,
                          uploadedImageBase64,
                          uploadedImageName || 'advertisement.png',
                          contentTitle
                        );
                      }}
                      onToggleSimulateOutage={setSimulateAiFailure}
                    />
                  )}
                </div>

                {/* Multimodal Image Review Canvas (When Image Review is Active) */}
                {showAuditPanel && activeReport && activeReport.mediaType === 'image' && activeReport.imageUrl && (
                  <ImageReviewCanvas
                    report={activeReport}
                    selectedFindingId={selectedFindingId}
                    hoveredFindingId={hoveredFindingId}
                    onSelectFinding={setSelectedFindingId}
                    onHoverFinding={setHoveredFindingId}
                  />
                )}



                {/* Interactive Highlighted Draft, Diff View & Publication Approval Card */}
                {showAuditPanel && activeReport && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Interactive Draft & Version Inspector
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {activeReport.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Click any finding in the Audit Findings panel to highlight it in the draft below.
                        </p>
                      </div>

                      <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-semibold shrink-0">
                        <button
                          type="button"
                          onClick={() => setDraftPaneTab('interactive')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            draftPaneTab === 'interactive'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          Interactive Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftPaneTab('diff')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            draftPaneTab === 'diff'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          Diff View
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftPaneTab('versions')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            draftPaneTab === 'versions'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          Versions ({activeReport.versions.length})
                        </button>
                      </div>
                    </div>

                    <div>
                      {draftPaneTab === 'interactive' && (
                        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 leading-relaxed text-xs">
                          {renderInteractiveDraftText()}
                        </div>
                      )}

                      {draftPaneTab === 'diff' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-200/80">
                            <span className="text-[10px] font-bold uppercase text-rose-700 block mb-1">
                              Original Submitted Draft:
                            </span>
                            <div className="text-slate-800 whitespace-pre-wrap">{activeReport.originalText}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80">
                            <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                              Working Draft (With Applied Fixes):
                            </span>
                            <div className="text-slate-800 whitespace-pre-wrap">{activeReport.currentText}</div>
                          </div>
                        </div>
                      )}

                      {draftPaneTab === 'versions' && (
                        <div className="space-y-2">
                          {activeReport.versions.map(v => (
                            <div
                              key={v.versionNumber}
                              className="p-3 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900">
                                  v{v.versionNumber}: {v.changeSummary}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Saved by {v.createdBy} ({v.createdByRole}) · {v.createdAt.slice(0, 19).replace('T', ' ')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Final Content Publication Approval Bar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Final Content Publication Approval
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Status:{' '}
                          <strong className="uppercase text-slate-700">
                            {activeReport.contentApprovalStatus.replace(/_/g, ' ')}
                          </strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleContentApprovalDecision('approved_for_publication')}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          Approve for Publication
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContentApprovalDecision('changes_requested')}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Audit Findings Panel */}
              {showAuditPanel && (
                <div className="lg:col-span-5 xl:col-span-5 space-y-4 transition-all duration-300">
                  {/* Panel Header Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Audit Findings</h2>
                        {isContentOutdated && showOutdatedFindingsOverride && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Outdated
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {isAnalyzing
                          ? 'Auditing...'
                          : activeReport
                          ? `${activeReport.findings.length} ${
                              activeReport.findings.length === 1 ? 'issue' : 'issues'
                            }`
                          : '0 issues'}
                      </span>
                    </div>

                    {/* Outdated Notice Banner inside panel if user opted to view previous results */}
                    {isContentOutdated && showOutdatedFindingsOverride && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-[11px] leading-tight">
                            Content was modified. Click <strong>Check Content</strong> to update.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowOutdatedFindingsOverride(false)}
                          className="text-amber-800 hover:text-amber-950 font-bold text-[11px] cursor-pointer shrink-0"
                        >
                          Hide
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Findings Cards List */}
                  <div className="space-y-3.5">
                    {isAnalyzing ? (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-2xs my-auto">
                        <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-3" />
                        <div className="text-xs font-bold text-slate-900">Analyzing content against brand rules...</div>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                          Checking terminology, prohibited claims, pricing facts, and tone guidelines.
                        </p>
                      </div>
                    ) : !activeReport ? null : activeReport.findings.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-2xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <h3 className="text-xs font-bold text-slate-900">Zero Rule Conflicts Identified</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          This draft aligns with all {approvedCount} approved brand rules.
                        </p>
                      </div>
                    ) : (
                      activeReport.findings.map(finding => {
                        const isSelected = selectedFindingId === finding.id;

                        return (
                          <div
                            key={finding.id}
                            onClick={() => handleSelectFindingCard(finding)}
                            className={`bg-white rounded-2xl border p-4 shadow-2xs transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-500/15'
                                : 'border-slate-200/90 hover:border-slate-300'
                            }`}
                          >
                            {/* Card Header: Rule ID + Issue Title on Left, Status Pill on Right */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-medium text-slate-500">
                                  {finding.ruleId || 'RULE-CTX'}
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                                  {getFindingDisplayTitle(finding)}
                                </h3>
                              </div>

                              {finding.decision === 'accepted' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  Accepted
                                </span>
                              ) : finding.decision === 'edited' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                  Edited
                                </span>
                              ) : finding.decision === 'rejected' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  Rejected
                                </span>
                              ) : isContentOutdated ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  Outdated
                                </span>
                              ) : finding.decision === 'verification_requested' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  Confirmation Requested
                                </span>
                              ) : finding.requiresHumanReview && !finding.suggestedReplacement ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  Needs Confirmation
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                  Issue
                                </span>
                              )}
                            </div>

                            {/* 6 Authoritative Price & Discount Audit Fields */}
                            {finding.priceAuditDetails && (
                              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
                                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Price & Discount Verification
                                  </span>
                                  {/* 5. Price validation status */}
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      finding.priceAuditDetails.validationStatus === 'pass'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : finding.priceAuditDetails.validationStatus === 'ambiguous'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}
                                  >
                                    {finding.priceAuditDetails.validationStatusLabel || finding.priceAuditDetails.validationStatus.toUpperCase()}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                                  {/* 1. Verified original price */}
                                  <div>
                                    <span className="text-slate-500 block">Verified Original Price</span>
                                    <span className="font-semibold text-slate-800">
                                      {finding.priceAuditDetails.verifiedOriginalPrice}
                                    </span>
                                  </div>
                                  {/* 2. Detected discount */}
                                  <div>
                                    <span className="text-slate-500 block">Detected Discount</span>
                                    <span className="font-semibold text-slate-800">
                                      {finding.priceAuditDetails.detectedDiscount}
                                    </span>
                                  </div>
                                  {/* 3. Expected selling price */}
                                  <div>
                                    <span className="text-slate-500 block">Expected Selling Price</span>
                                    <span className="font-semibold text-blue-700">
                                      {finding.priceAuditDetails.expectedSellingPrice}
                                    </span>
                                  </div>
                                  {/* 4. Actual poster price */}
                                  <div>
                                    <span className="text-slate-500 block">Actual Poster Price</span>
                                    <span className="font-semibold text-rose-700">
                                      {finding.priceAuditDetails.actualPosterPrice}
                                    </span>
                                  </div>
                                  {/* 6. Suggested correction */}
                                  <div className="col-span-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Suggested Correction:</span>
                                    <span className="font-bold text-emerald-700">
                                      {finding.priceAuditDetails.suggestedCorrection || finding.suggestedReplacement || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {finding.priceAuditDetails.calculationFormula && (
                                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                                    <span className="font-medium text-slate-600">Formula:</span> {finding.priceAuditDetails.calculationFormula}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Side-by-Side Comparison Boxes: Flagged vs Suggested Fix */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100/80">
                                <span className="text-[11px] font-medium text-rose-500 block">
                                  Flagged
                                </span>
                                <span className="text-xs font-semibold text-rose-900 mt-0.5 block break-words">
                                  {finding.originalSpan}
                                </span>
                              </div>

                              <div
                                className={`p-3 rounded-xl border ${
                                  finding.requiresHumanReview && !finding.suggestedReplacement && !finding.editedReplacement
                                    ? 'bg-amber-50/70 border-amber-200/80'
                                    : 'bg-emerald-50/70 border-emerald-100/80'
                                }`}
                              >
                                <span
                                  className={`text-[11px] font-medium block ${
                                    finding.requiresHumanReview && !finding.suggestedReplacement && !finding.editedReplacement
                                      ? 'text-amber-700'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  {finding.requiresHumanReview && !finding.suggestedReplacement && !finding.editedReplacement
                                    ? 'Verification required'
                                    : 'Suggested fix'}
                                </span>
                                <span
                                  className={`text-xs font-semibold mt-0.5 block break-words ${
                                    finding.requiresHumanReview && !finding.suggestedReplacement && !finding.editedReplacement
                                      ? 'text-amber-900'
                                      : 'text-emerald-900'
                                  }`}
                                >
                                  {finding.editedReplacement ||
                                    finding.suggestedReplacement ||
                                    (finding.requiresHumanReview
                                      ? 'Confirm official product price'
                                      : 'Review & revise manually')}
                                </span>
                              </div>
                            </div>

                            {/* Warning / Source Citation context when confirmation is needed or product pricing is matched */}
                            {(finding.requiresHumanReview || finding.category === 'Pricing & Facts') && (
                              <div className="mt-2.5 text-[11px] text-slate-600 leading-relaxed bg-slate-50/80 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                <span className="font-semibold text-slate-700">Source:</span>{' '}
                                {finding.approvedRuleCitation || finding.sourceReference}
                                {finding.requiresHumanReview && !finding.suggestedReplacement && (
                                  <span className="block text-amber-800 mt-0.5">{finding.conflictText}</span>
                                )}
                              </div>
                            )}

                            {/* Action Buttons Aligned to Bottom-Right */}
                            <div className="mt-3 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleFindingDecision(
                                    finding,
                                    finding.decision === 'rejected' ? 'pending' : 'rejected'
                                  );
                                }}
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                  finding.decision === 'rejected'
                                    ? 'bg-slate-200 border-slate-400 text-slate-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                                title={
                                  finding.decision === 'rejected'
                                    ? 'Excluded from Auto-Fix (Click to reset)'
                                    : 'Reject this correction and exclude from Auto-Fix'
                                }
                              >
                                {finding.decision === 'rejected' ? '✗ Rejected' : 'Reject'}
                              </button>

                              {finding.requiresHumanReview && !finding.suggestedReplacement && !finding.editedReplacement ? (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleFindingDecision(finding, 'verification_requested');
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                    finding.decision === 'verification_requested'
                                      ? 'bg-amber-600 border-amber-600 text-white'
                                      : 'bg-white hover:bg-amber-50 border-amber-500 text-amber-700'
                                  }`}
                                >
                                  Request Confirmation
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleFindingDecision(
                                      finding,
                                      finding.decision === 'accepted' ? 'pending' : 'accepted'
                                    );
                                  }}
                                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                                    finding.decision === 'accepted'
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                      : 'bg-white hover:bg-emerald-50 border-emerald-500 text-emerald-700'
                                  }`}
                                  title={
                                    finding.decision === 'accepted'
                                      ? 'Fix Accepted (Click to toggle)'
                                      : 'Accept this correction for Auto-Fix'
                                  }
                                >
                                  {finding.decision === 'accepted' ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Accepted</span>
                                    </>
                                  ) : (
                                    <span>Accept Fix</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* VERY BOTTOM SECTION: AI Auto-Fix Creative Panel and Generated Creative Preview */}
            {showAuditPanel && activeReport && activeReport.findings.length > 0 && (
              <div ref={creativePreviewRef} className="space-y-6 pt-6 border-t border-slate-200/80">
                {/* AI Auto-Fix Creative Configuration / Trigger Panel */}
                <AutoFixCreativePanel
                  findings={activeReport.findings}
                  isGenerating={isGeneratingAutoFix}
                  onGenerate={handleGenerateAutoFix}
                  hasGeneratedResult={Boolean(autoFixResult)}
                  onScrollToResult={() => {
                    creativePreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />

                {/* AI Auto-Fix Generated Creative Preview (Side-by-Side, 2nd Audit & Approvals) */}
                {autoFixResult && (
                  <AutoFixCreativePreview
                    autoFixResult={autoFixResult}
                    isApproving={isApprovingAutoFix}
                    isRegenerating={isGeneratingAutoFix}
                    onRegenerate={handleGenerateAutoFix}
                    onApprove={handleApproveAutoFixCreative}
                    onDownload={handleDownloadAutoFixCreative}
                    onClose={() => setAutoFixResult(null)}
                  />
                )}
              </div>
            )}
          </div>
        )}

          {/* ========================================================= */}
          {/* PAGE TWO: BRAND KNOWLEDGE WORKSPACE                       */}
          {/* ========================================================= */}
          {currentView === 'knowledge' && activeBrand && (
            <BrandKnowledgeWorkspace
              activeBrand={activeBrand}
              brands={brands}
              activeBrandId={activeBrandId}
              onSelectBrand={handleSelectBrand}
              onOpenAddBrandModal={handleOpenAddBrandModal}
              onOpenRemoveBrandModal={handleOpenRemoveBrand}
              onOpenCreateRule={handleOpenCreateRule}
              onOpenEditRule={handleOpenEditRule}
              onOpenTestRule={handleOpenTestRule}
              onToggleRuleApproval={handleToggleRuleApproval}
              onDeleteRule={handleDeleteRule}
              onDuplicateRule={handleDuplicateRule}
              onOpenDeleteAllModal={handleOpenDeleteAllModal}
              onUndoRuleAction={handleUndoRuleAction}
              isUndoingRules={isUndoingRules}
              undoStackEntries={rulesUndoStack[activeBrandId] || []}
              ruleSearchQuery={ruleSearchQuery}
              setRuleSearchQuery={setRuleSearchQuery}
              onNavigateToDna={() => setCurrentView('dna')}
              onBrandUpdated={(updatedBrand: BrandProfile) => {
                setBrands(prev => ({
                  ...prev,
                  [updatedBrand.id]: updatedBrand
                }));
              }}
              triggerToast={triggerToast}
            />
          )}

          {/* ========================================================= */}
          {/* PAGE: REGULATORY COMPLIANCE DASHBOARD                     */}
          {/* ========================================================= */}
          {currentView === 'regulatory' && activeBrand && (
            <RegulatoryComplianceDashboard
              departments={regulatoryDepartments}
              activeBrand={activeBrand}
              overview={regulatoryOverview}
              onRefreshData={async () => {
                try {
                  const res = await fetch(`/api/regulatory/overview?brandId=${activeBrandId}`);
                  if (res.ok) {
                    const data = await res.json();
                    if (data.departments) setRegulatoryDepartments(data.departments);
                    if (data.overview) setRegulatoryOverview(data.overview);
                  }
                } catch (err) {
                  console.error('Error refreshing regulatory data:', err);
                }
              }}
              onSyncDepartment={async (deptId) => {
                try {
                  const res = await fetch(`/api/regulatory/departments/${deptId}/sync`, { method: 'POST' });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.department) {
                      setRegulatoryDepartments(prev => prev.map(d => (d.id === deptId ? data.department : d)));
                    }
                    if (data.overview) setRegulatoryOverview(data.overview);
                    triggerToast(`Synced circulars & rules for ${deptId.toUpperCase()}`, 'success');
                  }
                } catch (err) {
                  triggerToast('Failed to sync department', 'error');
                }
              }}
              onToggleDepartmentStatus={async (deptId) => {
                try {
                  const res = await fetch(`/api/regulatory/departments/${deptId}/toggle-status`, { method: 'POST' });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.department) {
                      setRegulatoryDepartments(prev => prev.map(d => (d.id === deptId ? data.department : d)));
                    }
                    if (data.overview) setRegulatoryOverview(data.overview);
                    triggerToast(`Updated monitoring status for ${deptId.toUpperCase()}`, 'info');
                  }
                } catch (err) {
                  triggerToast('Failed to toggle status', 'error');
                }
              }}
              onImportRuleToBrand={async (ruleId, deptId) => {
                try {
                  const res = await fetch('/api/regulatory/rules/import-to-brand', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ruleId, departmentId: deptId, brandId: activeBrandId })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.brand) {
                      setBrands(prev => ({ ...prev, [activeBrandId]: data.brand }));
                    }
                    triggerToast(`Imported statutory rule ${ruleId} to ${activeBrand.name}`, 'success');
                  }
                } catch (err) {
                  triggerToast('Failed to import rule', 'error');
                }
              }}
              onMarkUpdateRead={async (updateId) => {
                try {
                  const res = await fetch(`/api/regulatory/updates/${updateId}/read`, { method: 'PUT' });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.departments) setRegulatoryDepartments(data.departments);
                    if (data.overview) setRegulatoryOverview(data.overview);
                  }
                } catch (err) {
                  console.error('Error marking update as read:', err);
                }
              }}
              triggerToast={triggerToast}
            />
          )}

          {/* ========================================================= */}
          {/* PAGE TWO-B: BRAND DNA ANALYZER                            */}
          {/* ========================================================= */}
          {currentView === 'dna' && activeBrand && (
            <BrandDnaWorkspace
              activeBrand={activeBrand}
              onBrandUpdated={(updatedBrand: BrandProfile) => {
                setBrands(prev => ({
                  ...prev,
                  [updatedBrand.id]: updatedBrand
                }));
              }}
              triggerToast={triggerToast}
            />
          )}

          {/* ========================================================= */}
          {/* PAGE THREE: REVIEW HISTORY                               */}
          {/* ========================================================= */}
          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review History</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Traceable audit log of every content review, finding resolution, and publication decision.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Review ID</th>
                        <th className="py-3 px-4">Title & Draft Preview</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Issues Found</th>
                        <th className="py-3 px-4">Publication Status</th>
                        <th className="py-3 px-4">Submitted By</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditHistory.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                            No review history yet. Submit content in Review Content to generate your first audit record.
                          </td>
                        </tr>
                      ) : (
                        auditHistory.map(report => (
                          <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                              {report.id}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-bold text-slate-900">{report.title}</div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{report.originalText}</p>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                              {report.brandName}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  report.findings.length === 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {report.findings.length} findings
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 uppercase">
                                {report.contentApprovalStatus.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              {report.submittedBy}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {report.createdAt.slice(0, 10)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setActiveReport(report);
                                  setCurrentView('review');
                                  triggerToast(`Loaded review ${report.id} into Review Content.`, 'info');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                              >
                                View Report →
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE FOUR: RECURRING ISSUES (Brand Clarity Loop)         */}
          {/* ========================================================= */}
          {currentView === 'recurring' && (
            <div className="max-w-6xl mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recurring Issues</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Track repeated brand violations across drafts to identify unclear guidelines or training needs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Configure Alert Thresholds</span>
                </button>
              </div>

              {/* Recurring Alert Patterns List */}
              <div className="space-y-4">
                {recurringPatterns.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="text-xs font-bold text-slate-900">Zero Recurrence Alerts Active</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No brand rules currently exceed the recurrence threshold ({recurrenceConfig.minOccurrences}+ occurrences across {recurrenceConfig.minDistinctDrafts}+ drafts in {recurrenceConfig.windowDays} days).
                    </p>
                  </div>
                ) : (
                  recurringPatterns.map(pattern => (
                    <div
                      key={pattern.id}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {pattern.ruleId}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-xs text-slate-900">{pattern.ruleTitle}</span>
                          {pattern.thresholdTriggered && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Alert Active ({pattern.occurrenceCount} occurrences across {pattern.distinctDraftCount} drafts)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500">
                          First seen: {pattern.firstSeen.slice(0, 10)} · Last seen: {pattern.lastSeen.slice(0, 10)}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pattern.conflictSummary}
                      </p>

                      {/* Corrective Action Status */}
                      {pattern.rootCause && (
                        <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
                          <div className="font-bold">Investigation Logged by {pattern.investigatedBy}:</div>
                          <div className="text-slate-700">Root Cause: <strong>{pattern.rootCause.replace(/_/g, ' ')}</strong></div>
                          {pattern.correctiveActionTaken && (
                            <div className="text-slate-700">Corrective Action: {pattern.correctiveActionTaken}</div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setInvestigatingPattern(pattern);
                            setInvRootCause(pattern.rootCause || 'unclear_guidelines');
                            setInvNotes(pattern.rootCauseNotes || '');
                            setInvAction(pattern.correctiveActionTaken || '');
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer"
                        >
                          {pattern.rootCause ? 'Update Investigation' : 'Log Root Cause & Corrective Action'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: GUIDED RULE CREATION, AI ASSIST, PDF IMPORT & RULE TESTER */}
      {/* ========================================================= */}
      {isRuleModalOpen && activeBrand && (
        <RuleManagementModal
          isOpen={isRuleModalOpen}
          initialMode={ruleModalMode}
          editingRule={editingRule}
          activeBrand={activeBrand}
          currentUser={currentUser}
          onClose={() => {
            setIsRuleModalOpen(false);
            setEditingRule(null);
          }}
          onBrandUpdated={updatedBrand => {
            setBrands(prev => ({ ...prev, [updatedBrand.id]: updatedBrand }));
          }}
          triggerToast={triggerToast}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RECURRING ISSUE INVESTIGATION                    */}
      {/* ========================================================= */}
      {investigatingPattern && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Investigate Recurrence: {investigatingPattern.ruleTitle}
              </h3>
              <button
                onClick={() => setInvestigatingPattern(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvestigatePattern} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Identified Root Cause</label>
                <select
                  value={invRootCause}
                  onChange={e => setInvRootCause(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unclear_guidelines">Unclear or Ambiguous Brand Guidelines</option>
                  <option value="outdated_approved_info">Outdated Approved Information in Knowledge Base</option>
                  <option value="training_need">Team / Agency Training Need</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Root Cause Explanation & Context</label>
                <textarea
                  rows={2}
                  required
                  value={invNotes}
                  onChange={e => setInvNotes(e.target.value)}
                  placeholder="Explain why this brand conflict is repeatedly appearing across drafts..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corrective Action Taken</label>
                <input
                  type="text"
                  required
                  value={invAction}
                  onChange={e => setInvAction(e.target.value)}
                  placeholder="e.g. Updated Nomenclature §1.1 and briefed design team."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInvestigatingPattern(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: RECURRENCE THRESHOLD CONFIG                      */}
      {/* ========================================================= */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Configure Alert Thresholds</h3>
              <button
                onClick={() => setIsThresholdModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThresholdConfig} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Minimum Occurrences</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={thresholdForm.minOccurrences}
                  onChange={e => setThresholdForm({ ...thresholdForm, minOccurrences: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Minimum Distinct Drafts</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={thresholdForm.minDistinctDrafts}
                  onChange={e => setThresholdForm({ ...thresholdForm, minDistinctDrafts: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Window Period (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={thresholdForm.windowDays}
                  onChange={e => setThresholdForm({ ...thresholdForm, windowDays: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DELETE ALL RULES WITH INPUT CAPTCHA CONFIRMATION  */}
      {/* ========================================================= */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Delete All Brand Rules</h3>
                  <p className="text-[11px] text-slate-500">
                    Target Brand: <strong>{activeBrand?.name || 'NovaPay'}</strong> ({totalRulesCount} rules)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeleteAllRules} className="p-5 space-y-4 text-xs">
              {/* Warning Callout */}
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Security Verification Required</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  You are about to delete all <strong>{totalRulesCount}</strong> rules ({approvedCount} Approved,{' '}
                  {draftCount} Draft, {unverifiedCount} Unverified) from{' '}
                  <strong>{activeBrand?.name || 'NovaPay'}</strong> in a single click. You can restore them afterward using the{' '}
                  <strong>Undo</strong> button in Brand Knowledge.
                </p>
              </div>

              {/* Visual Captcha Challenge Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Security Captcha Challenge</label>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    title="Generate a new captcha code"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh Code</span>
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-slate-300 bg-slate-900 px-4 py-3.5 flex items-center justify-center select-none shadow-inner">
                  {/* Decorative Captcha Noise Lines */}
                  <div className="pointer-events-none absolute inset-0 opacity-25 flex flex-col justify-evenly">
                    <div className="w-full border-t border-dashed border-cyan-400 -rotate-2" />
                    <div className="w-full border-t border-slate-400 rotate-3" />
                    <div className="w-full border-t border-dotted border-rose-400 -rotate-1" />
                  </div>

                  <div className="relative z-10 flex items-center gap-2.5">
                    {captchaChallenge.split('').map((char, index) => (
                      <span
                        key={`${char}-${index}`}
                        className={`inline-flex items-center justify-center w-8 h-9 rounded bg-slate-800/90 border border-slate-700 font-mono text-base font-extrabold tracking-wider text-cyan-300 shadow-xs ${
                          index % 2 === 0 ? '-rotate-6 text-white' : 'rotate-6 text-cyan-300'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Captcha User Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="delete-all-captcha-input" className="font-semibold text-slate-700">
                    Type the 6-character captcha code above
                  </label>
                  {captchaInput.trim().length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        captchaInput.trim().toUpperCase() === captchaChallenge.toUpperCase()
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {captchaInput.trim().toUpperCase() === captchaChallenge.toUpperCase()
                        ? '✓ Captcha Matched'
                        : 'Code does not match yet'}
                    </span>
                  )}
                </div>

                <input
                  id="delete-all-captcha-input"
                  type="text"
                  autoFocus
                  maxLength={10}
                  value={captchaInput}
                  onChange={e => {
                    setCaptchaInput(e.target.value);
                    if (captchaError) setCaptchaError(null);
                  }}
                  placeholder={`Enter "${captchaChallenge}" to unlock delete...`}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold tracking-widest uppercase text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />

                {captchaError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{captchaError}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  disabled={isDeletingAllRules}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isDeletingAllRules ||
                    captchaInput.trim().toUpperCase() !== captchaChallenge.trim().toUpperCase()
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {isDeletingAllRules ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting All Rules...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All {totalRulesCount} Rules</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD NEW BRAND PROFILE                            */}
      {/* ========================================================= */}
      {isAddBrandModalOpen && (
        <AddNewBrandModal
          isOpen={isAddBrandModalOpen}
          onClose={() => setIsAddBrandModalOpen(false)}
          onBrandCreated={(newBrand, allBrands) => {
            setBrands(allBrands);
            setActiveBrandId(newBrand.id);
            localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, newBrand.id);
          }}
          triggerToast={triggerToast}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 6: REMOVE BRAND PROFILE CONFIRMATION                */}
      {/* ========================================================= */}
      {brandToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Remove Brand Profile</h3>
                  <p className="text-[11px] text-slate-500">
                    Confirm deletion of {brandToRemove.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBrandToRemove(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Permanent Action Warning</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Are you sure you want to remove the brand profile for <strong>{brandToRemove.name}</strong>?
                  This will permanently delete all associated brand guidelines, visual identity specs, and{' '}
                  <strong>{brandToRemove.rules?.length || 0}</strong> configured brand rules.
                </p>
              </div>

              {Object.keys(brands).length <= 1 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cannot remove the only brand profile in the workspace. Please create another brand before deleting this one.</span>
                </div>
              )}

              {removeBrandError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{removeBrandError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBrandToRemove(null)}
                  disabled={isRemovingBrand}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveBrand}
                  disabled={isRemovingBrand || Object.keys(brands).length <= 1}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {isRemovingBrand ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Removing Brand...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Brand</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
