import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
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
  ChevronRight,
  Info,
  ExternalLink,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Sliders,
  Download,
  BookOpen,
  Clock,
  User,
  Save,
  Eye,
  Trash2,
  ArrowUpRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';

// ==========================================
// MOCK DATA & KNOWLEDGE BASE
// ==========================================

const INITIAL_BRAND_RULES = [
  {
    id: 'RULE-PRD-102',
    category: 'Terminology',
    title: 'Product Naming Convention',
    targetPattern: 'SkyNex Pro',
    approvedValue: 'SkyNex Enterprise',
    sourceRef: 'Brand Identity Manual 2026 §3.1 (Nomenclature)',
    status: 'Approved',
    severity: 'conflict',
    explanation: "The legacy product moniker 'SkyNex Pro' was deprecated in Q3 2025. All tier offerings above Starter must be designated 'SkyNex Enterprise' to prevent contract ambiguity.",
    updatedAt: '2026-02-14'
  },
  {
    id: 'RULE-FIN-204',
    category: 'Pricing',
    title: 'Current Base Seat Licensing',
    targetPattern: '$49/mo',
    approvedValue: '$79/mo',
    sourceRef: 'Q1 Master Commercial Schedule §1.4',
    status: 'Approved',
    severity: 'conflict',
    explanation: "Effective January 1, 2026, the approved standard enterprise seat price is $79/mo. Publishing $49/mo breaches authorized discounting policies and creates pricing liability.",
    updatedAt: '2026-01-05'
  },
  {
    id: 'RULE-MKT-408',
    category: 'Claims',
    title: 'Competitor Disparagement Prohibition',
    targetPattern: "Unlike Acme Cloud's clunky and sluggish interface,",
    approvedValue: "Engineered for high-velocity enterprise teams,",
    sourceRef: 'Global Competitive Positioning Guidelines §7.2',
    status: 'Approved',
    severity: 'conflict',
    explanation: "Direct naming and derogatory characterization of competitors is strictly prohibited under our fair advertising policy. Frame advantages in terms of our native capabilities.",
    updatedAt: '2025-11-20'
  },
  {
    id: 'RULE-LGL-310',
    category: 'Claims',
    title: 'Service Level Agreement Threshold',
    targetPattern: 'guaranteed 100% uptime SLA with zero seconds of annual downtime',
    approvedValue: 'enterprise 99.99% uptime commitment',
    sourceRef: 'Infrastructure SLA Disclosure Policy §2.1',
    status: 'Approved',
    severity: 'verification',
    explanation: "Legal counsel prohibits absolute '100% uptime' or 'zero downtime' claims without written VP Infrastructure sign-off. Standard SLA commitment is 99.99%.",
    updatedAt: '2026-03-01'
  },
  {
    id: 'RULE-TON-055',
    category: 'Tone',
    title: 'Executive Assurance Tone',
    targetPattern: 'undisputed market leaders',
    approvedValue: 'recognized industry innovators',
    sourceRef: 'Voice & Tone Playbook §2.4 (Substantiation)',
    status: 'Approved',
    severity: 'suggestion',
    explanation: "Unsubstantiated market leadership claims trigger advertising compliance scrutiny. Prefer defensible, qualitative positioning unless citing analyst reports.",
    updatedAt: '2026-02-28'
  }
];

const INITIAL_HISTORY = [
  {
    id: 'REV-8941',
    title: 'Q1 Enterprise Launch Email Campaign',
    channel: 'Email',
    submittedAt: 'Today, 10:15 AM',
    author: 'Sarah Jenkins (Growth Team)',
    status: 'Needs Review',
    conflictsCount: 2,
    verificationCount: 1,
    contentPreview: 'Subject: Unlock next-gen productivity with SkyNex Pro tier upgrade...',
    resolved: false
  },
  {
    id: 'REV-8938',
    title: 'Customer Onboarding Help Center Update',
    channel: 'Website Copy',
    submittedAt: 'Yesterday, 4:20 PM',
    author: 'David Chen (Doc Team)',
    status: 'Compliant',
    conflictsCount: 0,
    verificationCount: 0,
    contentPreview: 'Step 1: Configure your SSO settings inside SkyNex Enterprise tenant admin...',
    resolved: true
  },
  {
    id: 'REV-8924',
    title: 'LinkedIn Product Announcement Brief',
    channel: 'Social Post',
    submittedAt: '2 days ago',
    author: 'Agency: Apex Digital',
    status: 'Compliant',
    conflictsCount: 0,
    verificationCount: 0,
    contentPreview: 'Excited to showcase our newest workflow automation milestones with 99.99% reliability...',
    resolved: true
  }
];

const INITIAL_RECURRING_ISSUES = [
  {
    id: 'REC-01',
    ruleId: 'RULE-FIN-204',
    title: 'Outdated $49/mo Pricing in Active Marketing Copy',
    occurrences: 8,
    affectedChannels: ['Email (4)', 'Social (3)', 'Website (1)'],
    rootCause: 'Outdated legacy sales deck templates in Notion and Canva are still circulating among external marketing contractors.',
    severity: 'High Impact',
    recommendedAction: 'Issue an automated Slack guideline alert to Content Marketing & re-index Notion workspace assets.',
    status: 'Investigation Open'
  },
  {
    id: 'REC-02',
    ruleId: 'RULE-PRD-102',
    title: "Deprecated 'SkyNex Pro' Product Naming",
    occurrences: 14,
    affectedChannels: ['Social Post (9)', 'Email (5)'],
    rootCause: 'Agency partners using 2024 pitch deck swipe files without reviewing the 2026 rebranding brief.',
    severity: 'Moderate',
    recommendedAction: 'Trigger mandatory Brand Knowledge re-certification for external agency workspace users.',
    status: 'Action Scheduled'
  },
  {
    id: 'REC-03',
    ruleId: 'RULE-LGL-310',
    title: "Unverified '100% Uptime' SLA Claims",
    occurrences: 5,
    affectedChannels: ['Ad Copy (3)', 'Landing Pages (2)'],
    rootCause: 'Performance marketing team testing aggressive conversion copy without submitting to legal review queues.',
    severity: 'Critical Legal',
    recommendedAction: 'Enforce pre-publication sign-off workflow for paid advertising spend above $5k.',
    status: 'Under Review'
  }
];

const SAMPLE_DRAFT_TEXT = `Introducing SkyNex Pro: The Next Generation Cloud Platform

We are thrilled to announce that SkyNex Pro is now available for all enterprise clients starting at just $49/mo per seat. Unlike Acme Cloud's clunky and sluggish interface, our unified infrastructure delivers guaranteed 100% uptime SLA with zero seconds of annual downtime.

Sign up before October 31 to lock in our legacy tier pricing and experience why we are undisputed market leaders in cloud delivery.`;

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function App() {
  // Navigation & Workspace State
  const [currentView, setCurrentView] = useState('review'); // 'review' | 'knowledge' | 'history' | 'recurring'
  const [activeBrandProfile, setActiveBrandProfile] = useState('Global Enterprise Core v2.4');
  const [toastMessage, setToastMessage] = useState(null);

  // Review Page State
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [contentType, setContentType] = useState('Website Copy');
  const [contentTitle, setContentTitle] = useState('Q4 Enterprise Value Proposition');
  const [draftText, setDraftText] = useState(SAMPLE_DRAFT_TEXT);
  const [originalDraft, setOriginalDraft] = useState(SAMPLE_DRAFT_TEXT);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  
  // Review Execution State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0 to 4
  const [reviewCompleted, setReviewCompleted] = useState(true);
  const [selectedFindingId, setSelectedFindingId] = useState('find-1');

  // Interactive Findings State
  const [findings, setFindings] = useState([
    {
      id: 'find-1',
      ruleId: 'RULE-PRD-102',
      type: 'conflict',
      category: 'Terminology Conflict',
      affectedText: 'SkyNex Pro',
      explanation: "The product name 'SkyNex Pro' was retired in Q3 2025. Current standard enterprise branding is 'SkyNex Enterprise'.",
      ruleSource: 'Brand Identity Manual 2026 §3.1',
      suggestedFix: 'SkyNex Enterprise',
      decisionState: 'pending', // 'pending' | 'accepted' | 'edited' | 'rejected'
      customFixText: 'SkyNex Enterprise'
    },
    {
      id: 'find-2',
      ruleId: 'RULE-FIN-204',
      type: 'conflict',
      category: 'Price Conflict',
      affectedText: '$49/mo',
      explanation: "Approved standard tier pricing is $79/mo. Publishing $49/mo triggers commercial liability under Q1 guidelines.",
      ruleSource: 'Q1 Master Commercial Schedule §1.4',
      suggestedFix: '$79/mo',
      decisionState: 'pending',
      customFixText: '$79/mo'
    },
    {
      id: 'find-3',
      ruleId: 'RULE-MKT-408',
      type: 'conflict',
      category: 'Prohibited Claim',
      affectedText: "Unlike Acme Cloud's clunky and sluggish interface,",
      explanation: "Direct derogatory competitor claims violate brand ethics standard §7.2. Highlight native architectural advantages instead.",
      ruleSource: 'Global Competitive Positioning Guidelines §7.2',
      suggestedFix: 'Engineered for high-velocity enterprise teams,',
      decisionState: 'pending',
      customFixText: 'Engineered for high-velocity enterprise teams,'
    },
    {
      id: 'find-4',
      ruleId: 'RULE-LGL-310',
      type: 'verification',
      category: 'Needs Verification',
      affectedText: 'guaranteed 100% uptime SLA with zero seconds of annual downtime',
      explanation: "Contractual guarantees cannot exceed 99.99% without an active CTO infrastructure waiver.",
      ruleSource: 'Infrastructure SLA Disclosure Policy §2.1',
      suggestedFix: 'enterprise 99.99% uptime commitment',
      decisionState: 'pending',
      customFixText: 'enterprise 99.99% uptime commitment'
    },
    {
      id: 'find-5',
      ruleId: 'RULE-TON-055',
      type: 'suggestion',
      category: 'Tone Suggestion',
      affectedText: 'undisputed market leaders',
      explanation: "Tone guideline recommends defensible value terminology over unsubstantiated superlatives.",
      ruleSource: 'Voice & Tone Playbook §2.4',
      suggestedFix: 'recognized industry innovators',
      decisionState: 'pending',
      customFixText: 'recognized industry innovators'
    }
  ]);

  // Brand Rules & History State
  const [brandRules, setBrandRules] = useState(INITIAL_BRAND_RULES);
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);
  const [recurringIssues, setRecurringIssues] = useState(INITIAL_RECURRING_ISSUES);

  // New Rule Modal
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRuleData, setNewRuleData] = useState({
    title: '',
    category: 'Terminology',
    targetPattern: '',
    approvedValue: '',
    sourceRef: '',
    severity: 'conflict',
    explanation: ''
  });

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // Automated Review Simulation with Authentic Stages
  const runReviewCheck = () => {
    if (!draftText.trim()) {
      triggerToast('Please provide draft text before running a review.');
      return;
    }

    setIsAnalyzing(true);
    setReviewCompleted(false);
    setAnalysisStep(1);

    const steps = [
      { step: 1, delay: 500 },
      { step: 2, delay: 1100 },
      { step: 3, delay: 1700 },
      { step: 4, delay: 2300 }
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setAnalysisStep(step);
      }, delay);
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setReviewCompleted(true);
      // Reset decision state for new review
      setFindings((prev) =>
        prev.map((f) => ({
          ...f,
          decisionState: 'pending',
          customFixText: f.suggestedFix
        }))
      );
      triggerToast('Review finished: 5 brand criteria evaluated against rules.');
    }, 2800);
  };

  // Decision Actions: Accept, Edit, Reject
  const handleAcceptSuggestion = (findingId) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    const replacement = finding.customFixText || finding.suggestedFix;
    if (draftText.includes(finding.affectedText)) {
      const updated = draftText.replace(finding.affectedText, replacement);
      setDraftText(updated);
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'accepted' } : f))
    );
    triggerToast(`Applied correction: "${finding.affectedText}" → "${replacement}"`);
  };

  const handleCustomFixChange = (findingId, newText) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, customFixText: newText } : f))
    );
  };

  const handleApplyCustomEdit = (findingId) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    const replacement = finding.customFixText;
    if (draftText.includes(finding.affectedText)) {
      const updated = draftText.replace(finding.affectedText, replacement);
      setDraftText(updated);
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'edited' } : f))
    );
    triggerToast(`Custom edit applied: "${replacement}"`);
  };

  const handleRejectSuggestion = (findingId) => {
    const finding = findings.find((f) => f.id === findingId);
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'rejected' } : f))
    );
    triggerToast(`Maintained original text for: "${finding?.affectedText}"`);
  };

  const handleSaveToHistory = () => {
    const conflictsRemaining = findings.filter(
      (f) => f.type === 'conflict' && f.decisionState !== 'accepted' && f.decisionState !== 'edited'
    ).length;

    const newRecord = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      title: contentTitle || 'Untitled Draft Check',
      channel: contentType,
      submittedAt: 'Just now',
      author: 'You (Review Lead)',
      status: conflictsRemaining === 0 ? 'Compliant' : 'Needs Review',
      conflictsCount: conflictsRemaining,
      verificationCount: findings.filter((f) => f.type === 'verification' && f.decisionState === 'pending').length,
      contentPreview: draftText.slice(0, 75) + '...',
      resolved: conflictsRemaining === 0
    };

    setHistoryList([newRecord, ...historyList]);
    triggerToast(`Saved review snapshot ${newRecord.id} to Review History.`);
  };

  const handleLoadSample = () => {
    setDraftText(SAMPLE_DRAFT_TEXT);
    setOriginalDraft(SAMPLE_DRAFT_TEXT);
    setContentTitle('Q4 Enterprise Value Proposition');
    setContentType('Website Copy');
    triggerToast('Sample enterprise copy loaded with intentional rule conflicts.');
  };

  const handleCopyCleanDraft = () => {
    navigator.clipboard?.writeText(draftText);
    triggerToast('Compliant draft text copied to clipboard.');
  };

  // Add Rule Form Submit
  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!newRuleData.title || !newRuleData.targetPattern || !newRuleData.approvedValue) {
      triggerToast('Please complete all required fields.');
      return;
    }

    const created = {
      id: `RULE-USR-${Math.floor(100 + Math.random() * 900)}`,
      ...newRuleData,
      status: 'Approved',
      updatedAt: '2026-03-29'
    };

    setBrandRules([created, ...brandRules]);
    setIsAddRuleOpen(false);
    setNewRuleData({
      title: '',
      category: 'Terminology',
      targetPattern: '',
      approvedValue: '',
      sourceRef: '',
      severity: 'conflict',
      explanation: ''
    });
    triggerToast(`Rule ${created.id} added to ${activeBrandProfile}.`);
  };

  // Summary Metrics Derived from actual data
  const summaryMetrics = useMemo(() => {
    const total = findings.length;
    const conflicts = findings.filter((f) => f.type === 'conflict' && f.decisionState === 'pending').length;
    const verifications = findings.filter((f) => f.type === 'verification' && f.decisionState === 'pending').length;
    const resolved = findings.filter((f) => f.decisionState === 'accepted' || f.decisionState === 'edited').length;
    return { total, conflicts, verifications, resolved };
  }, [findings]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#10243A] font-sans antialiased overflow-hidden select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#10243A] text-white shadow-xl text-sm border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (240px) */}
      {/* ========================================================= */}
      <aside className="w-[248px] bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Brand Header & Geometric Mark */}
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10243A] flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H14M4 12H20M4 18H16" stroke="#3B82F6" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="18" cy="6" r="2.5" fill="#0F9D8A" />
                <circle cx="10" cy="18" r="2.5" fill="#F05252" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-[#10243A]">SkyNex AI</span>
                <span className="text-[10px] font-medium bg-[#E8F1FF] text-[#3B82F6] px-1.5 py-0.5 rounded">v2.4</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-none mt-0.5 font-medium">Brand Governance Engine</p>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                Workspace
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentView('review')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'review'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 ${currentView === 'review' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Review Content</span>
                    </div>
                    {summaryMetrics.conflicts > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#FFF1EF] text-[#F05252] border border-[#FECACA] rounded text-[11px] font-bold">
                        {summaryMetrics.conflicts}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('knowledge')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'knowledge'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 ${currentView === 'knowledge' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Brand Knowledge</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-mono">{brandRules.length}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('history')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'history'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <History className={`w-4 h-4 ${currentView === 'history' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Review History</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-mono">{historyList.length}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                Governance
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentView('recurring')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === 'recurring'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className={`w-4 h-4 ${currentView === 'recurring' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Recurring Issues</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Workspace Active Profile Badge */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70">
          <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#64748B] font-medium">Active Handbook</span>
              <span className="flex items-center gap-1 text-[10px] text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-1.5 py-0.5 rounded">
                <Check className="w-2.5 h-2.5" /> Enforced
              </span>
            </div>
            <p className="text-xs font-semibold text-[#10243A] truncate">{activeBrandProfile}</p>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>5 rules active</span>
              <span className="text-blue-600 font-medium hover:underline cursor-pointer" onClick={() => setCurrentView('knowledge')}>
                Manage
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <span>SkyNex</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#10243A] font-semibold capitalize">
                {currentView === 'review'
                  ? 'Review Content'
                  : currentView === 'knowledge'
                  ? 'Brand Knowledge'
                  : currentView === 'history'
                  ? 'Review History'
                  : 'Recurring Issues'}
              </span>
            </div>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-xs text-[#64748B] flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
              Enterprise Governance Profile: <strong className="text-[#10243A] font-medium">{activeBrandProfile}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentView === 'review' && (
              <>
                <button
                  onClick={handleLoadSample}
                  className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:border-slate-300 rounded-md transition-colors flex items-center gap-1.5"
                  title="Loads a realistic marketing draft containing intentional brand naming, pricing, and claims conflicts"
                >
                  <RefreshCw className="w-3 h-3 text-[#3B82F6]" />
                  Load Sample Draft
                </button>

                <button
                  onClick={handleCopyCleanDraft}
                  className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  Copy Draft
                </button>

                <button
                  onClick={handleSaveToHistory}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#10243A] hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3 h-3" />
                  Save Audit Snapshot
                </button>
              </>
            )}

            {currentView === 'knowledge' && (
              <button
                onClick={() => setIsAddRuleOpen(true)}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Brand Rule
              </button>
            )}
          </div>
        </header>

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ========================================================= */}
          {/* VIEW A: REVIEW CONTENT (PRIMARY SCREEN) */}
          {/* ========================================================= */}
          {currentView === 'review' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Screen Title & Guidance */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Review Content</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Check drafts against approved brand rules, terminology, pricing, and claims before publication.
                  </p>
                </div>

                {/* Privacy & Engine Notice */}
                <div className="flex items-center gap-2 text-xs text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                  <span>Hybrid deterministic rule matcher & isolated model verification</span>
                </div>
              </div>

              {/* Submission Controls Card */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  {/* Mode Tabs: Paste vs Upload */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-medium">
                    <button
                      onClick={() => setInputMode('paste')}
                      className={`px-3 py-1 rounded transition-all ${
                        inputMode === 'paste' ? 'bg-white text-[#10243A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => setInputMode('upload')}
                      className={`px-3 py-1 rounded transition-all ${
                        inputMode === 'upload' ? 'bg-white text-[#10243A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Upload Document
                    </button>
                  </div>

                  {/* Channel & Metadata Selectors */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>Channel:</span>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-xs text-[#10243A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Website Copy">Website Copy</option>
                        <option value="Social Post">Social Post</option>
                        <option value="Email">Email Marketing</option>
                        <option value="Ad Copy">Ad Copy</option>
                        <option value="Press Release">Press Release</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>Title:</span>
                      <input
                        type="text"
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#10243A] w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        placeholder="Draft title..."
                      />
                    </div>
                  </div>
                </div>

                {/* Content Input Section */}
                {inputMode === 'paste' ? (
                  <div className="relative">
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      placeholder="Paste the draft copy you wish to audit against approved guidelines..."
                      rows={5}
                      className="w-full text-sm font-sans text-[#10243A] p-3.5 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y leading-relaxed bg-slate-50/30"
                    />
                    <div className="flex items-center justify-between text-xs text-[#64748B] mt-2 px-1">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>{draftText.trim().split(/\s+/).filter(Boolean).length}</strong> words
                        </span>
                        <span>
                          <strong>{draftText.length}</strong> characters
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Edits in draft update checks in real-time</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#E2E8F0] hover:border-blue-400 rounded-md p-6 text-center bg-slate-50/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-[#3B82F6] mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#10243A]">Drag & drop content file, or browse</p>
                    <p className="text-xs text-[#64748B] mt-1">Accepts genuine parsed .txt, .docx, and plain text formats (Max 5MB)</p>
                    {uploadedFileName ? (
                      <div className="mt-3 inline-flex items-center gap-2 bg-[#E8F1FF] text-[#3B82F6] px-3 py-1 rounded text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{uploadedFileName}</span>
                        <X
                          className="w-3.5 h-3.5 cursor-pointer hover:text-red-600"
                          onClick={() => setUploadedFileName(null)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setUploadedFileName('Q4_Product_Launch_Brief_v1.txt');
                          setDraftText(SAMPLE_DRAFT_TEXT);
                          triggerToast('Extracted text from Q4_Product_Launch_Brief_v1.txt');
                        }}
                        className="mt-3 text-xs bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#10243A] px-3 py-1.5 rounded font-medium shadow-2xs"
                      >
                        Simulate File Selection
                      </button>
                    )}
                  </div>
                )}

                {/* Primary Action Button & Engine Execution Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#64748B] flex items-center gap-2">
                    <span className="text-slate-400">Rules evaluated:</span>
                    <span className="font-semibold text-[#10243A]">5 verified guidelines</span>
                  </div>

                  <button
                    onClick={runReviewCheck}
                    disabled={isAnalyzing}
                    className={`px-5 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all flex items-center gap-2 ${
                      isAnalyzing
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99]'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditing Draft...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Check Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Stepper (Only active during scanning) */}
              {isAnalyzing && (
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-medium">
                    <span>Audit Pipeline Execution</span>
                    <span>Step {analysisStep} of 4</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#3B82F6] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${(analysisStep / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className={`p-2 rounded ${analysisStep >= 1 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      1. Parsing syntax & tokens
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 2 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      2. Deterministic rule match
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 3 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      3. Contextual claim check
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 4 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      4. Synthesizing citations
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* FINDINGS WORKSPACE: SUMMARY & DUAL-PANE COMPARISON */}
              {/* ========================================================= */}
              {reviewCompleted && !isAnalyzing && (
                <div className="space-y-4">
                  {/* Metric Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Confirmed Conflicts</span>
                        <span className="w-2 h-2 rounded-full bg-[#F05252]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#F05252] mt-1 font-mono">
                        {summaryMetrics.conflicts}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Authoritative rule violations</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Needs Verification</span>
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#F59E0B] mt-1 font-mono">
                        {summaryMetrics.verifications}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Requires source exception sign-off</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Applied Fixes</span>
                        <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#0F9D8A] mt-1 font-mono">
                        {summaryMetrics.resolved}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Resolved in active working copy</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Brand Health Score</span>
                        <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                      </div>
                      <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">
                        {Math.max(0, 100 - summaryMetrics.conflicts * 25 - summaryMetrics.verifications * 10)}%
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Ready for publication at 100%</p>
                    </div>
                  </div>

                  {/* Dual-Pane Review Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANE: Live Interactive Draft with Inline Highlighting */}
                    <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#3B82F6]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                            Working Draft (Active)
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#64748B] bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Live Inspection
                        </span>
                      </div>

                      {/* Highlighted text preview */}
                      <div className="p-3.5 bg-slate-50/70 rounded border border-[#E2E8F0] min-h-[380px] text-sm text-[#10243A] leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-100">
                        {/* We render interactive visual cues */}
                        <div className="space-y-3">
                          <p>
                            Introducing{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-1')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[0].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                              title="Click to view rule citation"
                            >
                              {findings[0].decisionState === 'accepted'
                                ? findings[0].customFixText
                                : 'SkyNex Pro'}
                            </span>
                            : The Next Generation Cloud Platform
                          </p>

                          <p>
                            We are thrilled to announce that{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-1')}
                              className="font-medium cursor-pointer"
                            >
                              {findings[0].decisionState === 'accepted'
                                ? findings[0].customFixText
                                : 'SkyNex Pro'}
                            </span>{' '}
                            is now available for all enterprise clients starting at just{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-2')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[1].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                            >
                              {findings[1].decisionState === 'accepted'
                                ? findings[1].customFixText
                                : '$49/mo'}
                            </span>{' '}
                            per seat.{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-3')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[2].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                            >
                              {findings[2].decisionState === 'accepted'
                                ? findings[2].customFixText
                                : "Unlike Acme Cloud's clunky and sluggish interface,"}
                            </span>{' '}
                            our unified infrastructure delivers{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-4')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[3].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF3D6] text-[#D97706] border-b-2 border-[#F59E0B]'
                              }`}
                            >
                              {findings[3].decisionState === 'accepted'
                                ? findings[3].customFixText
                                : 'guaranteed 100% uptime SLA with zero seconds of annual downtime'}
                            </span>
                            .
                          </p>

                          <p>
                            Sign up before October 31 to lock in our legacy tier pricing and experience why we are{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-5')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[4].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#E8F1FF] text-[#3B82F6] border-b-2 border-[#3B82F6]'
                              }`}
                            >
                              {findings[4].decisionState === 'accepted'
                                ? findings[4].customFixText
                                : 'undisputed market leaders'}
                            </span>{' '}
                            in cloud delivery.
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                          Green denotes approved replacement
                        </span>
                        <button
                          onClick={() => {
                            setDraftText(originalDraft);
                            setFindings((prev) =>
                              prev.map((f) => ({ ...f, decisionState: 'pending' }))
                            );
                            triggerToast('Restored draft to original submission text.');
                          }}
                          className="text-[#64748B] hover:text-[#10243A] hover:underline"
                        >
                          Revert All Changes
                        </button>
                      </div>
                    </div>

                    {/* RIGHT PANE: Explainable Finding Cards & Decision Controls */}
                    <div className="lg:col-span-7 space-y-3.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#3B82F6]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                            Detailed Findings & Governance Decisions ({findings.length})
                          </h3>
                        </div>
                        <span className="text-xs text-[#64748B]">
                          Select card to review evidence & take action
                        </span>
                      </div>

                      {/* Finding Card List */}
                      {findings.map((f) => {
                        const isSelected = selectedFindingId === f.id;
                        const isConflict = f.type === 'conflict';
                        const isVerification = f.type === 'verification';
                        const isSuggestion = f.type === 'suggestion';

                        return (
                          <div
                            key={f.id}
                            onClick={() => setSelectedFindingId(f.id)}
                            className={`rounded-lg border transition-all p-4 ${
                              isSelected
                                ? 'ring-2 ring-blue-500/30 border-blue-400 bg-white shadow-md'
                                : 'bg-white border-[#E2E8F0] hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            {/* Card Top: Category Badge, Rule ID, Decision State */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                    isConflict
                                      ? 'bg-[#FFF1EF] text-[#F05252] border border-[#FECACA]'
                                      : isVerification
                                      ? 'bg-[#FFF3D6] text-[#D97706] border border-[#FDE68A]'
                                      : 'bg-[#E8F1FF] text-[#3B82F6] border border-blue-200'
                                  }`}
                                >
                                  {isConflict && <AlertCircle className="w-3 h-3" />}
                                  {isVerification && <AlertTriangle className="w-3 h-3" />}
                                  {isSuggestion && <Sparkles className="w-3 h-3" />}
                                  {f.category}
                                </span>

                                <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {f.ruleId}
                                </span>
                              </div>

                              <div>
                                {f.decisionState === 'accepted' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> Accepted
                                  </span>
                                )}
                                {f.decisionState === 'edited' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-[#E8F1FF] border border-blue-200 px-2 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> Custom Applied
                                  </span>
                                )}
                                {f.decisionState === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    <X className="w-3 h-3" /> Maintained Draft
                                  </span>
                                )}
                                {f.decisionState === 'pending' && (
                                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Detected Excerpt Box */}
                            <div className="mb-2.5 p-2 rounded bg-slate-50 border border-slate-200/80 text-xs">
                              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                                Flagged Excerpt in Draft:
                              </span>
                              <span className="font-mono text-[#10243A] font-medium bg-red-50 text-red-700 px-1 rounded">
                                "{f.affectedText}"
                              </span>
                            </div>

                            {/* Why Flagged Explanation */}
                            <p className="text-xs text-[#10243A] mb-2 leading-relaxed">
                              <strong className="text-[#10243A]">Why flagged: </strong>
                              {f.explanation}
                            </p>

                            {/* Authoritative Citation / Handbook Reference */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mb-3 bg-blue-50/50 p-1.5 rounded border border-blue-100">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                              <span>Approved Reference: </span>
                              <strong className="text-[#10243A]">{f.ruleSource}</strong>
                            </div>

                            {/* Proposed Correction / Diff Display */}
                            <div className="p-2.5 bg-slate-50 rounded border border-[#E2E8F0] text-xs mb-3">
                              <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                                Proposed Compliant Replacement:
                              </div>
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="line-through text-red-500 bg-red-50 px-1 rounded">
                                  {f.affectedText}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                                  {f.suggestedFix}
                                </span>
                              </div>
                            </div>

                            {/* Inline Custom Edit Box (Visible when selected) */}
                            {isSelected && (
                              <div className="mb-3 p-2.5 bg-white border border-blue-200 rounded-md">
                                <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                                  Modify or fine-tune replacement wording:
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={f.customFixText}
                                    onChange={(e) => handleCustomFixChange(f.id, e.target.value)}
                                    className="flex-1 text-xs border border-[#E2E8F0] rounded px-2.5 py-1.5 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                  />
                                  <button
                                    onClick={() => handleApplyCustomEdit(f.id)}
                                    className="px-2.5 py-1.5 bg-[#3B82F6] text-white text-xs font-medium rounded hover:bg-blue-600 shrink-0"
                                  >
                                    Apply Custom
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Human Decision Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptSuggestion(f.id)}
                                  className="px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white text-xs font-medium rounded shadow-2xs flex items-center gap-1.5 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Suggestion</span>
                                </button>

                                <button
                                  onClick={() => handleRejectSuggestion(f.id)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#10243A] border border-[#E2E8F0] text-xs font-medium rounded transition-colors flex items-center gap-1.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Keep Original</span>
                                </button>
                              </div>

                              {isVerification && (
                                <button
                                  onClick={() =>
                                    triggerToast(`Attached Legal Exception Request for finding ${f.id}`)
                                  }
                                  className="text-xs text-[#D97706] hover:text-amber-800 font-medium flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Request Legal Waiver</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW B: BRAND KNOWLEDGE PAGE */}
          {/* ========================================================= */}
          {currentView === 'knowledge' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Brand Knowledge</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Authoritative rules, approved terminology, facts, pricing, and guidelines used by the review engine.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Profile Version:</span>
                  <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-1 rounded text-[#10243A]">
                    {activeBrandProfile}
                  </span>
                </div>
              </div>

              {/* Rules List / Table Card */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2 w-full md:w-80 bg-white border border-[#E2E8F0] rounded px-3 py-1.5 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search rules, forbidden patterns, or IDs..."
                      className="w-full bg-transparent focus:outline-none text-[#10243A]"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <span>Category:</span>
                    <select className="bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-xs text-[#10243A]">
                      <option>All Guidelines</option>
                      <option>Terminology</option>
                      <option>Pricing</option>
                      <option>Claims</option>
                      <option>Tone</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Rule Identifier</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Forbidden Pattern / Trigger</th>
                        <th className="py-3 px-4">Approved Standard / Value</th>
                        <th className="py-3 px-4">Authoritative Source</th>
                        <th className="py-3 px-4">Enforcement</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {brandRules.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#10243A] whitespace-nowrap">
                            {r.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-[#10243A] border border-slate-200">
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-red-600 bg-red-50/30">
                            "{r.targetPattern}"
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#0F9D8A] bg-emerald-50/30">
                            "{r.approvedValue}"
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate" title={r.sourceRef}>
                            {r.sourceRef}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" /> {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => triggerToast(`Rule ${r.id} details opened for edit.`)}
                              className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setBrandRules(brandRules.filter((item) => item.id !== r.id));
                                triggerToast(`Removed ${r.id}`);
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-[#E2E8F0] bg-slate-50 text-xs text-[#64748B] flex items-center justify-between">
                  <span>Showing {brandRules.length} authoritative brand rules</span>
                  <span>Changes persist directly into the real-time compliance evaluation engine</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW C: REVIEW HISTORY PAGE */}
          {/* ========================================================= */}
          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Review History</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Immutable audit log of all checked copy drafts, detected findings, and recorded human decisions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerToast('Exported audit trail to CSV format.')}
                    className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded shadow-2xs flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    Export Audit Log
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Review ID</th>
                        <th className="py-3 px-4">Content Title</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Submission Time</th>
                        <th className="py-3 px-4">Submitted By</th>
                        <th className="py-3 px-4">Findings</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {historyList.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#10243A]">{h.id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#10243A] block">{h.title}</span>
                            <span className="text-[11px] text-[#64748B] truncate max-w-sm block">
                              {h.contentPreview}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-[#10243A]">
                              {h.channel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">{h.submittedAt}</td>
                          <td className="py-3.5 px-4 text-[#10243A] font-medium whitespace-nowrap">{h.author}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {h.conflictsCount > 0 ? (
                              <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                {h.conflictsCount} conflicts
                              </span>
                            ) : (
                              <span className="text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-2 py-0.5 rounded border border-[#A7F3D0]">
                                0 issues
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                h.status === 'Compliant'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border border-[#A7F3D0]'
                                  : 'bg-[#FFF3D6] text-[#D97706] border border-[#FDE68A]'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setCurrentView('review');
                                triggerToast(`Reloaded draft for ${h.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW D: RECURRING ISSUES (GOVERNANCE INSIGHTS) */}
          {/* ========================================================= */}
          {currentView === 'recurring' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Recurring Issues & Insights</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Root-cause pattern detection across drafts to prevent systemic brand degradation and guide governance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Scan Range:</span>
                  <span className="text-xs font-semibold bg-white border border-[#E2E8F0] px-2.5 py-1 rounded">
                    Last 30 Days (24 Total Audits)
                  </span>
                </div>
              </div>

              {/* Insights Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Prevented Contract Violations</span>
                    <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">27</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Intercepted before external distribution</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Most Violated Guideline</span>
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="text-sm font-bold text-[#10243A] mt-1 truncate">
                    RULE-PRD-102 (Naming)
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">14 occurrences across 4 agencies</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Average Resolution Velocity</span>
                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">1.8 min</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">From detection to accepted fix</p>
                </div>
              </div>

              {/* Recurring Clusters List */}
              <div className="space-y-4">
                {recurringIssues.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-2xs hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F05252]"></span>
                        <h3 className="text-sm font-bold text-[#10243A]">{item.title}</h3>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-[#64748B]">
                          {item.ruleId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {item.occurrences} Draft Detections
                        </span>
                        <span className="text-xs font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                          {item.severity}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                          Detected Root Cause
                        </span>
                        <p className="text-[#10243A] bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                          {item.rootCause}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                          Recommended Governance Intervention
                        </span>
                        <p className="text-[#10243A] bg-blue-50/50 p-2.5 rounded border border-blue-100 leading-relaxed">
                          {item.recommendedAction}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <span>Spread across:</span>
                        {item.affectedChannels.map((ch, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[#10243A] font-medium">
                            {ch}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerToast(`Triggered Governance Workflow for ${item.id}`)}
                          className="px-3 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors"
                        >
                          Execute Guideline Memo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. ADD BRAND RULE MODAL (FUNCTIONAL) */}
      {/* ========================================================= */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-sm font-bold text-[#10243A]">Add New Brand Governance Rule</h3>
              </div>
              <X
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => setIsAddRuleOpen(false)}
              />
            </div>

            <form onSubmit={handleCreateRule} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#10243A] mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved Q3 Discounting Threshold"
                  value={newRuleData.title}
                  onChange={(e) => setNewRuleData({ ...newRuleData, title: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#10243A] mb-1">Category</label>
                  <select
                    value={newRuleData.category}
                    onChange={(e) => setNewRuleData({ ...newRuleData, category: e.target.value })}
                    className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Terminology">Terminology</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Claims">Claims</option>
                    <option value="Tone">Tone & Voice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#10243A] mb-1">Severity Type</label>
                  <select
                    value={newRuleData.severity}
                    onChange={(e) => setNewRuleData({ ...newRuleData, severity: e.target.value })}
                    className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="conflict">Confirmed Conflict (Coral)</option>
                    <option value="verification">Needs Verification (Amber)</option>
                    <option value="suggestion">Style Suggestion (Blue)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Forbidden Pattern / Trigger Phrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% partner discount"
                  value={newRuleData.targetPattern}
                  onChange={(e) => setNewRuleData({ ...newRuleData, targetPattern: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Approved Standard / Replacement Value
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. maximum authorized 10% partner tier"
                  value={newRuleData.approvedValue}
                  onChange={(e) => setNewRuleData({ ...newRuleData, approvedValue: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Authoritative Source / Handbook Section
                </label>
                <input
                  type="text"
                  placeholder="e.g. Global Partner Commercial Policy 2026 §4.1"
                  value={newRuleData.sourceRef}
                  onChange={(e) => setNewRuleData({ ...newRuleData, sourceRef: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded font-medium shadow-2xs"
                >
                  Save & Enforce Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}