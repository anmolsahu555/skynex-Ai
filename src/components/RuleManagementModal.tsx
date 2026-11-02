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
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  AlertOctagon,
  Info,
  RotateCcw,
  BookOpen,
  Clock,
  Save,
  Eye,
  Trash2,
  Play,
  Scale,
  Ban,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
  FileUp,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import {
  BrandProfile,
  BrandRule,
  RuleCategory,
  RuleApprovalStatus,
  RuleSeverityLevel,
  ExtractedPdfRule,
  PdfRuleExtractionSummary,
  UserProfile,
  RuleTestResult,
  RuleVersionEntry
} from '../types.ts';

export interface RuleFormState {
  title: string;
  category: RuleCategory;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  sourceDocumentName: string;
  sourcePage: string;
  sourceSection: string;
  sourceRef: string;
  status: RuleApprovalStatus;
  severityLevel: RuleSeverityLevel;
  explanation: string;
}

interface CategoryGuidance {
  helper: string;
  exampleTitle: string;
  exampleStatement: string;
  exampleApprovedValue: string;
  examplePatterns: string[];
  exampleDoc: string;
  examplePage: string;
  exampleSection: string;
  exampleSeverity: RuleSeverityLevel;
  exampleSampleViolation: string;
}

export const CATEGORY_GUIDANCE: Record<string, CategoryGuidance> = {
  'Visual Identity': {
    helper: 'Covers logo, colors, typography, and layout.',
    exampleTitle: 'Official Horizontal Logo Lockup Usage',
    exampleStatement: 'All customer-facing advertisements and web headers must use the official horizontal wordmark with the cobalt blue icon and maintain 16px clear space.',
    exampleApprovedValue: 'Official horizontal wordmark with blue accent icon (#2563EB)',
    examplePatterns: ['circular red coin', 'standalone badge', 'altered serif font', 'stretched logo'],
    exampleDoc: 'Visual Identity Guidelines 2026',
    examplePage: 'Page 4',
    exampleSection: '§1.2',
    exampleSeverity: 'Critical',
    exampleSampleViolation: 'Featuring our new circular red coin badge with stretched logo in the hero banner.'
  },
  'Messaging & Claims': {
    helper: 'Covers approved product names, commercial subscription pricing, SLA facts, and substantiated performance claims.',
    exampleTitle: 'Standard Enterprise Subscription Pricing',
    exampleStatement: 'Marketing materials must state the verified standard subscription rate of ₹999/month and never quote deprecated promotional rates.',
    exampleApprovedValue: '₹999/month (Standard Enterprise Plan)',
    examplePatterns: ['₹499/month', '₹499/mo', 'INR 499/month', '$49/month', 'free forever'],
    exampleDoc: 'Commercial Pricing & Plans Schedule 2026',
    examplePage: 'Page 2',
    exampleSection: '§2.1',
    exampleSeverity: 'Critical',
    exampleSampleViolation: 'Subscribe to NovaPay today for just ₹499/month with our free forever tier!'
  },
  'Prohibited Content': {
    helper: 'Covers strictly forbidden claims, guaranteed financial returns, competitor disparagement, and high-risk phrases.',
    exampleTitle: 'Prohibition of Risk-Free Profit Guarantees',
    exampleStatement: 'Promotional copy must never promise or imply guaranteed profits, zero-risk returns, or instant wealth generation.',
    exampleApprovedValue: 'Regulated transaction infrastructure with transparent settlement',
    examplePatterns: ['guarantees risk-free profits', 'risk-free profits', 'guaranteed returns', 'zero risk profit'],
    exampleDoc: 'Regulatory Advertising Compliance Manual',
    examplePage: 'Page 7',
    exampleSection: '§3.2',
    exampleSeverity: 'Critical',
    exampleSampleViolation: 'Our platform guarantees risk-free profits and zero risk profit for every merchant.'
  },
  'Tone & Style': {
    helper: 'Covers brand voice, professional phrasing, reading clarity, and avoidance of hyperbole or slang.',
    exampleTitle: 'Credible Enterprise Financial Tone',
    exampleStatement: 'Copy must maintain a direct, transparent, and empowering tone suitable for CFOs and finance teams without sensationalist hype.',
    exampleApprovedValue: 'Transparent, reliable financial technology built for enterprise scale',
    examplePatterns: ['insane returns', 'get rich quick', 'mindblowing profits', 'crush the competition'],
    exampleDoc: 'Brand Voice & Editorial Playbook',
    examplePage: 'Page 5',
    exampleSection: '§2.1',
    exampleSeverity: 'Medium',
    exampleSampleViolation: 'Get insane returns and mindblowing profits overnight when you switch!'
  },
  'Legal & Compliance': {
    helper: 'Covers mandatory regulatory disclosures, licensing statements, terms & conditions footnotes, and regional compliance.',
    exampleTitle: 'Mandatory Cross-Border Settlement Disclosure',
    exampleStatement: 'Any campaign referencing international or EU cross-border settlement must include the licensed payment institution regulatory disclosure.',
    exampleApprovedValue: 'Licensed payment institution subject to EU regulatory compliance and settlement oversight',
    examplePatterns: ['EU cross-border settlement', 'instant global wire without oversight', 'unregulated transfer'],
    exampleDoc: 'Legal & Regulatory Review Charter 2026',
    examplePage: 'Page 11',
    exampleSection: '§4.3',
    exampleSeverity: 'High',
    exampleSampleViolation: 'Now offering EU cross-border settlement and unregulated transfer in 40 currencies.'
  },
  Accessibility: {
    helper: 'Covers WCAG AA/AAA color contrast ratios, minimum readable font sizes, descriptive alt text, and inclusive language.',
    exampleTitle: 'WCAG AA Text Contrast & Legibility Standard',
    exampleStatement: 'All body copy and pricing disclosures on light backgrounds must use Navy Slate (#0F172A) at minimum 12px size to maintain at least 4.5:1 WCAG AA contrast.',
    exampleApprovedValue: 'Navy Slate (#0F172A) text on White (#FFFFFF) or Light Slate (#F8FAFC) with ≥ 4.5:1 contrast',
    examplePatterns: ['low-contrast light grey text', '8px micro-print', 'missing alt text', 'yellow text on white'],
    exampleDoc: 'Digital Accessibility & Inclusive Design Standard',
    examplePage: 'Page 9',
    exampleSection: '§5.1',
    exampleSeverity: 'High',
    exampleSampleViolation: 'Terms and conditions printed in 8px micro-print with low-contrast light grey text.'
  }
};

const PLAIN_LANGUAGE_SAMPLE_PROMPTS = [
  {
    label: 'Pricing & Nomenclature Policy (Verified Source)',
    text: 'Always write our product name as "NovaPay" as one compound word (never "Nova Pay" or "Nova-Pay"), and only quote our approved ₹999/month subscription price instead of ₹499/month. Source: NovaPay Brand Standards 2026, Page 3, Section 1.4.'
  },
  {
    label: 'Accessibility Contrast Requirement (Verified Source)',
    text: 'All promotional banners and social graphics must meet WCAG AA 4.5:1 contrast ratio using Navy Slate #0F172A text on light backgrounds, and never use light grey text on white or font sizes below 12px. Source: Digital Accessibility Playbook 2026, Page 6, Section 2.3.'
  },
  {
    label: 'Unverified Verbal Claim Guideline (No Source Cited)',
    text: 'Do not allow marketing campaigns to claim "instant zero-fee global wires" or "100% guaranteed instant approval". Instead say "Fast T+1 settlement subject to standard merchant underwriting".'
  }
];

function parseSourceRefParts(rule?: BrandRule | null, defaultBrandName = 'Brand'): {
  docName: string;
  page: string;
  section: string;
} {
  if (!rule) {
    return {
      docName: `${defaultBrandName} Brand Standards 2026`,
      page: 'Page 1',
      section: '§1.1'
    };
  }
  if (rule.sourceDocumentName || rule.sourcePage || rule.sourceSection) {
    return {
      docName: rule.sourceDocumentName || rule.sourceRef || `${defaultBrandName} Brand Standards 2026`,
      page: rule.sourcePage || '',
      section: rule.sourceSection || ''
    };
  }
  const raw = rule.sourceRef || '';
  const pageMatch = raw.match(/\b(?:Page|p\.)\s*(\d+)/i);
  const secMatch = raw.match(/(?:§|Section\s*)([0-9.]+)/i);
  let docClean = raw
    .replace(/\((?:Page|p\.)\s*\d+\)/gi, '')
    .replace(/·\s*(?:Page|p\.)\s*\d+/gi, '')
    .replace(/·\s*§[0-9.]+/gi, '')
    .replace(/§[0-9.]+/gi, '')
    .trim();
  if (!docClean) docClean = raw || `${defaultBrandName} Brand Standards 2026`;
  return {
    docName: docClean,
    page: pageMatch ? `Page ${pageMatch[1]}` : '',
    section: secMatch ? `§${secMatch[1]}` : ''
  };
}

function mapLegacySeverityToLevel(rule?: BrandRule | null): RuleSeverityLevel {
  if (!rule) return 'Critical';
  if (rule.severityLevel) return rule.severityLevel;
  if (rule.severity === 'critical') return 'Critical';
  if (rule.severity === 'warning') return 'High';
  return 'Low';
}

function composeCitationPreview(docName: string, page: string, section: string, fallback: string): string {
  const d = docName.trim();
  const p = page.trim();
  const s = section.trim();
  if (d) {
    const parts = [d];
    if (p) parts.push(/^page|p\./i.test(p) ? p : `Page ${p}`);
    if (s) parts.push(/^§|sec/i.test(s) ? s : `§${s}`);
    return parts.join(' · ');
  }
  return fallback.trim();
}

interface RuleManagementModalProps {
  isOpen: boolean;
  initialMode: 'manual' | 'ai_text' | 'pdf' | 'test';
  editingRule: BrandRule | null;
  activeBrand: BrandProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onBrandUpdated: (updatedBrand: BrandProfile) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export default function RuleManagementModal({
  isOpen,
  initialMode,
  editingRule,
  activeBrand,
  currentUser,
  onClose,
  onBrandUpdated,
  triggerToast
}: RuleManagementModalProps) {
  // Primary Top Mode: 'manual' (Guided Form / Edit) | 'ai_text' (Plain Language AI) | 'pdf' (Import PDF) | 'test' (Rule Tester) | 'history' (Version History)
  const [activeTab, setActiveTab] = useState<'manual' | 'ai_text' | 'pdf' | 'test' | 'history'>('manual');

  // Guided Form State
  const [formState, setFormState] = useState<RuleFormState>({
    title: '',
    category: 'Visual Identity',
    ruleStatement: '',
    targetPatterns: [],
    approvedValue: '',
    sourceDocumentName: `${activeBrand.name} Brand Standards 2026`,
    sourcePage: 'Page 1',
    sourceSection: '§1.1',
    sourceRef: `${activeBrand.name} Brand Standards 2026 · Page 1 · §1.1`,
    status: 'Draft',
    severityLevel: 'Critical',
    explanation: ''
  });

  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [patternInput, setPatternInput] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSavingRule, setIsSavingRule] = useState<boolean>(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState<boolean>(false);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [isPatternsAccordionOpen, setIsPatternsAccordionOpen] = useState<boolean>(false);
  const [isSourceAccordionOpen, setIsSourceAccordionOpen] = useState<boolean>(false);

  // Plain-Language AI Rule Creation State
  const [plainLanguagePrompt, setPlainLanguagePrompt] = useState<string>('');
  const [isGeneratingFromText, setIsGeneratingFromText] = useState<boolean>(false);
  const [aiTextError, setAiTextError] = useState<string | null>(null);

  // Shared Extracted / Suggested Rules Queue (Used by both Plain-Language AI and PDF Import)
  const [extractionOrigin, setExtractionOrigin] = useState<'pdf' | 'ai_text'>('pdf');
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
  const [extractedNewPatternInput, setExtractedNewPatternInput] = useState<Record<string, string>>({});
  const [extractedRulesFilter, setExtractedRulesFilter] = useState<'all' | 'needs_review' | 'duplicates'>('all');
  const [extractedRulesSearch, setExtractedRulesSearch] = useState<string>('');
  const [isSavingBatchRules, setIsSavingBatchRules] = useState<boolean>(false);
  const [isDragOverPdf, setIsDragOverPdf] = useState<boolean>(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Rule Tester Sandbox State
  const [testInputMode, setTestInputMode] = useState<'text' | 'image'>('text');
  const [testSampleText, setTestSampleText] = useState<string>('');
  const [testImageBase64, setTestImageBase64] = useState<string>('');
  const [testImagePreview, setTestImagePreview] = useState<string>('');
  const [testImageName, setTestImageName] = useState<string>('');
  const [isRunningRuleTest, setIsRunningRuleTest] = useState<boolean>(false);
  const [ruleTestError, setRuleTestError] = useState<string | null>(null);
  const [ruleTestResult, setRuleTestResult] = useState<RuleTestResult | null>(null);
  const testImageInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when modal opens or editingRule changes
  useEffect(() => {
    if (!isOpen) return;

    setFieldErrors({});
    setShowUnsavedPrompt(false);
    setPatternInput('');
    setRuleTestResult(null);
    setRuleTestError(null);

    if (editingRule) {
      const parsedSource = parseSourceRefParts(editingRule, activeBrand.name);
      const loadedState: RuleFormState = {
        title: editingRule.title || '',
        category: editingRule.category || 'Visual Identity',
        ruleStatement: editingRule.ruleStatement || '',
        targetPatterns: Array.isArray(editingRule.targetPatterns) ? [...editingRule.targetPatterns] : [],
        approvedValue: editingRule.approvedValue || '',
        sourceDocumentName: parsedSource.docName,
        sourcePage: parsedSource.page,
        sourceSection: parsedSource.section,
        sourceRef: editingRule.sourceRef || composeCitationPreview(parsedSource.docName, parsedSource.page, parsedSource.section, ''),
        status: editingRule.status || 'Draft',
        severityLevel: mapLegacySeverityToLevel(editingRule),
        explanation: editingRule.explanation || ''
      };
      setFormState(loadedState);
      setInitialSnapshot(JSON.stringify(loadedState));
      setIsPatternsAccordionOpen(false);
      setIsSourceAccordionOpen(false);
      setActiveTab(initialMode === 'test' ? 'test' : 'manual');

      // Seed realistic test sample text for this rule
      const firstPattern = editingRule.targetPatterns?.[0];
      if (firstPattern) {
        setTestSampleText(
          `Special campaign announcement for ${activeBrand.name}: Experience ${firstPattern} today! Compare that with our standard ${editingRule.approvedValue}.`
        );
      } else {
        setTestSampleText(
          `Sample marketing draft for ${activeBrand.name}: Check whether this copy follows "${editingRule.title}".`
        );
      }
    } else {
      const defaultDoc = `${activeBrand.name} Brand Standards 2026`;
      const freshState: RuleFormState = {
        title: 'Official Horizontal Logo Lockup Usage',
        category: 'Visual Identity',
        ruleStatement:
          'All customer-facing advertisements and web headers must use the official horizontal wordmark with the cobalt blue icon and maintain 16px clear space.',
        targetPatterns: [],
        approvedValue: 'Official horizontal wordmark with blue accent icon (#2563EB)',
        sourceDocumentName: defaultDoc,
        sourcePage: 'Page 1',
        sourceSection: '§1.1',
        sourceRef: `${defaultDoc} · Page 1 · §1.1`,
        status: 'Draft',
        severityLevel: 'Critical',
        explanation: ''
      };
      setFormState(freshState);
      setInitialSnapshot(JSON.stringify(freshState));
      setIsPatternsAccordionOpen(false);
      setIsSourceAccordionOpen(false);
      setActiveTab(initialMode === 'test' ? 'test' : initialMode);
      setTestSampleText(CATEGORY_GUIDANCE['Visual Identity'].exampleSampleViolation);
    }
  }, [isOpen, editingRule, initialMode, activeBrand.name]);

  // Check if form has unsaved edits
  const isFormDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(formState) !== initialSnapshot;
  }, [formState, initialSnapshot]);

  // Check if an existing Approved rule's core compliance logic is being modified
  const isApprovedRuleLogicModified = useMemo(() => {
    if (!editingRule || editingRule.status !== 'Approved') return false;
    return (
      formState.ruleStatement.trim() !== editingRule.ruleStatement.trim() ||
      formState.approvedValue.trim() !== editingRule.approvedValue.trim() ||
      formState.category !== editingRule.category ||
      JSON.stringify(formState.targetPatterns) !== JSON.stringify(editingRule.targetPatterns)
    );
  }, [editingRule, formState]);

  const currentGuidance = useMemo(() => {
    return CATEGORY_GUIDANCE[formState.category] || CATEGORY_GUIDANCE['Visual Identity'];
  }, [formState.category]);

  // Update structured source fields and sync sourceRef
  const handleSourceFieldChange = (field: 'sourceDocumentName' | 'sourcePage' | 'sourceSection', value: string) => {
    setFormState(prev => {
      const next = { ...prev, [field]: value };
      next.sourceRef = composeCitationPreview(
        next.sourceDocumentName,
        next.sourcePage,
        next.sourceSection,
        prev.sourceRef
      );
      return next;
    });
    if (fieldErrors.sourceRef) {
      setFieldErrors(prev => ({ ...prev, sourceRef: '' }));
    }
  };

  // Add Prohibited Pattern Chip
  const handleAddPatternChip = (rawValue?: string) => {
    const valToUse = rawValue !== undefined ? rawValue : patternInput;
    const parts = valToUse
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setFormState(prev => {
      const existingLower = new Set(prev.targetPatterns.map(p => p.toLowerCase()));
      const merged = [...prev.targetPatterns];
      for (const part of parts) {
        if (!existingLower.has(part.toLowerCase())) {
          merged.push(part);
          existingLower.add(part.toLowerCase());
        }
      }
      return { ...prev, targetPatterns: merged };
    });
    setPatternInput('');
    if (fieldErrors.targetPatterns) {
      setFieldErrors(prev => ({ ...prev, targetPatterns: '' }));
    }
  };

  const handleRemovePatternChip = (indexToRemove: number) => {
    setFormState(prev => ({
      ...prev,
      targetPatterns: prev.targetPatterns.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Fill Realistic Example for Selected Category
  const handleFillCategoryExample = () => {
    const g = currentGuidance;
    const composedSource = composeCitationPreview(g.exampleDoc, g.examplePage, g.exampleSection, '');
    setFormState(prev => ({
      ...prev,
      title: g.exampleTitle,
      ruleStatement: g.exampleStatement,
      approvedValue: g.exampleApprovedValue,
      targetPatterns: [...g.examplePatterns],
      sourceDocumentName: g.exampleDoc,
      sourcePage: g.examplePage,
      sourceSection: g.exampleSection,
      sourceRef: composedSource,
      severityLevel: g.exampleSeverity,
      explanation: `Enforces ${g.exampleTitle} per ${composedSource}.`
    }));
    setTestSampleText(g.exampleSampleViolation);
    setFieldErrors({});
    triggerToast(`Loaded realistic example for ${formState.category}. You can customize any field before saving.`, 'info');
  };

  // Validate Guided Form
  const validateRuleForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formState.title.trim() || formState.title.trim().length < 3) {
      errors.title = 'Please enter a descriptive Rule Title (at least 3 characters).';
    }
    if (!formState.ruleStatement.trim() || formState.ruleStatement.trim().length < 10) {
      errors.ruleStatement = 'Please enter a clear Rule Statement describing what must be followed (at least 10 characters).';
    }
    if (!formState.approvedValue.trim()) {
      errors.approvedValue = 'Please enter the Approved Value or Standard that content must follow.';
    }
    if (formState.status === 'Approved' && !formState.sourceDocumentName.trim() && !formState.sourceRef.trim()) {
      errors.sourceRef = 'A verifiable Source Reference (Document Name) is required to mark a rule as Approved. Use Draft or Unverified if the source is pending.';
      setIsSourceAccordionOpen(true);
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Rule (Create or Edit)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    // Commit any pending text inside the pattern chip input box first
    let finalPatterns = [...formState.targetPatterns];
    if (patternInput.trim()) {
      const extra = patternInput
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);
      for (const item of extra) {
        if (!finalPatterns.some(p => p.toLowerCase() === item.toLowerCase())) {
          finalPatterns.push(item);
        }
      }
      setPatternInput('');
    }

    if (!validateRuleForm()) {
      triggerToast('Please fix the highlighted validation errors before saving.', 'error');
      return;
    }

    setIsSavingRule(true);
    try {
      const composedCitation = composeCitationPreview(
        formState.sourceDocumentName,
        formState.sourcePage,
        formState.sourceSection,
        formState.sourceRef
      );

      const payload = {
        title: formState.title.trim(),
        category: formState.category,
        ruleStatement: formState.ruleStatement.trim(),
        targetPatterns: finalPatterns,
        approvedValue: formState.approvedValue.trim(),
        sourceDocumentName: formState.sourceDocumentName.trim(),
        sourcePage: formState.sourcePage.trim(),
        sourceSection: formState.sourceSection.trim(),
        sourceRef: composedCitation,
        status: formState.status,
        severityLevel: formState.severityLevel,
        severity:
          formState.severityLevel === 'Critical'
            ? 'critical'
            : formState.severityLevel === 'Low'
            ? 'info'
            : 'warning',
        explanation:
          formState.explanation.trim() ||
          `Enforces "${formState.title.trim()}" (${composedCitation}). Approved value: "${formState.approvedValue.trim()}".`,
        updatedBy: currentUser.name,
        updatedByRole: currentUser.roleLabel
      };

      const url = editingRule
        ? `/api/brands/${activeBrand.id}/rules/${editingRule.id}`
        : `/api/brands/${activeBrand.id}/rules`;
      const method = editingRule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save brand rule');
      }

      onBrandUpdated(data.brand);
      setInitialSnapshot(JSON.stringify({ ...formState, targetPatterns: finalPatterns }));

      if (editingRule) {
        const revalMsg = data.revalidated
          ? ` Previous version preserved (now v${data.rule?.version || 2}) and revalidated across ${data.affectedReportCount || 0} review report(s).`
          : '';
        triggerToast(`Updated rule ${editingRule.id} ("${formState.title}").${revalMsg}`, 'success');
      } else {
        triggerToast(
          `Created rule ${data.rule?.id || ''} ("${formState.title}") with status "${formState.status}".`,
          'success'
        );
      }
      onClose();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to save rule', 'error');
    } finally {
      setIsSavingRule(false);
    }
  };

  // Attempt to close modal with unsaved changes check
  const handleRequestClose = () => {
    if (isFormDirty && activeTab === 'manual') {
      setShowUnsavedPrompt(true);
      return;
    }
    handleClearExtractedQueue();
    onClose();
  };

  // Plain-Language AI Rule Assist Handler
  const handleGenerateRulesFromPlainText = async () => {
    if (!plainLanguagePrompt.trim() || plainLanguagePrompt.trim().length < 10) {
      setAiTextError('Please enter at least a sentence describing the rule you want to create.');
      return;
    }
    setIsGeneratingFromText(true);
    setAiTextError(null);

    try {
      const res = await fetch(`/api/brands/${activeBrand.id}/rules/ai-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: plainLanguagePrompt.trim(),
          brandId: activeBrand.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI rule extraction failed');
      }

      const list: ExtractedPdfRule[] = data.suggestions || [];
      if (list.length === 0) {
        throw new Error('Could not identify structured rules from the description. Try adding more detail.');
      }

      setExtractionOrigin('ai_text');
      setExtractedRules(list);
      setSelectedExtractedRuleIds(new Set(list.map(r => r.id)));
      setExtractionSummary({
        filename: 'Plain-Language AI Prompt',
        totalExtracted: list.length,
        highConfidenceCount: list.filter(r => !r.needsManualReview).length,
        needsReviewCount: list.filter(r => r.needsManualReview).length,
        duplicateCount: list.filter(r => r.isDuplicate).length,
        aiUsed: data.aiUsed
      });
      triggerToast(
        `AI generated ${list.length} structured rule suggestion(s). Review and edit before saving (never auto-approved).`,
        'success'
      );
    } catch (err: any) {
      setAiTextError(err?.message || 'Failed to generate rule suggestions');
    } finally {
      setIsGeneratingFromText(false);
    }
  };

  // Load an AI-extracted rule directly into the Guided Form for detailed editing/testing
  const handleLoadSuggestionIntoGuidedForm = (rule: ExtractedPdfRule) => {
    const docName = rule.sourceDocumentName || (rule.sourceVerified ? rule.sourceRef : '');
    const pageStr = rule.sourcePage ? `Page ${rule.sourcePage}` : String(rule.pageNumber || '');
    const secStr = rule.sourceSection || '';
    const nextStatus: RuleApprovalStatus = rule.sourceVerified === false ? 'Unverified' : (rule.status === 'Approved' ? 'Draft' : rule.status || 'Draft');

    setFormState({
      title: rule.title || '',
      category: rule.category || 'Messaging & Claims',
      ruleStatement: rule.ruleStatement || '',
      targetPatterns: Array.isArray(rule.targetPatterns) ? [...rule.targetPatterns] : [],
      approvedValue: rule.approvedValue || '',
      sourceDocumentName: docName,
      sourcePage: pageStr,
      sourceSection: secStr,
      sourceRef: rule.sourceRef || composeCitationPreview(docName, pageStr, secStr, 'Unverified Source'),
      status: nextStatus,
      severityLevel: rule.severityLevel || (rule.severity === 'critical' ? 'Critical' : rule.severity === 'warning' ? 'High' : 'Low'),
      explanation: rule.explanation || ''
    });
    setActiveTab('manual');
    triggerToast(`Loaded "${rule.title}" into the Guided Rule Form for review and testing.`, 'info');
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
    }
  };

  const handleClearExtractedQueue = () => {
    setPdfFileName('');
    setPdfFileSize(0);
    setPdfBase64('');
    setExtractedRules([]);
    setSelectedExtractedRuleIds(new Set());
    setExtractionSummary(null);
    setPdfExtractError(null);
    setAiTextError(null);
    setEditingExtractedRuleId(null);
    setExtractedRulesSearch('');
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
  };

  const handleExtractRulesFromPdf = async () => {
    if (!pdfBase64) {
      setPdfExtractError('Please select or drop a PDF file first.');
      return;
    }

    setIsExtractingPdf(true);
    setPdfExtractError(null);
    setPdfExtractionProgress('Reading PDF pages and extracting document text...');

    const step1 = setTimeout(() => {
      setPdfExtractionProgress('Identifying brand rules, prohibitions, and compliance requirements...');
    }, 450);
    const step2 = setTimeout(() => {
      setPdfExtractionProgress('Verifying source citations and checking for duplicates...');
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

      const rulesList: ExtractedPdfRule[] = (data.extractedRules || data.rules || []).map((r: ExtractedPdfRule, idx: number) => ({
        ...r,
        id: r.id || r.tempId || `EXT-${Date.now()}-${idx + 1}`,
        // Enforce: Never automatically approve extracted rules; mark as Unverified if source/confidence is uncertain
        status: (r.confidenceScore ?? 1) < 0.75 || r.sourceVerified === false ? 'Unverified' : 'Draft'
      }));

      if (rulesList.length === 0) {
        throw new Error('No brand rules could be identified in the uploaded PDF.');
      }

      setExtractionOrigin('pdf');
      setExtractedRules(rulesList);
      setSelectedExtractedRuleIds(new Set(rulesList.map(r => r.id)));
      setExtractionSummary(data.summary || null);
      triggerToast(
        `Extracted ${rulesList.length} candidate rules from "${pdfFileName}". Review and verify before saving.`,
        'success'
      );
    } catch (err: any) {
      setPdfExtractError(err.message || 'Error processing PDF document');
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
  };

  const handleBatchSaveExtractedRules = async (forcedStatus?: RuleApprovalStatus) => {
    const rulesToSave = extractedRules.filter(r => selectedExtractedRuleIds.has(r.id));
    if (rulesToSave.length === 0) {
      triggerToast('Please select at least one extracted rule to save.', 'error');
      return;
    }

    setIsSavingBatchRules(true);
    try {
      const payloadRules = rulesToSave.map(r => {
        // Never auto-approve unverified rules unless the user explicitly verified the source
        const isUnverified = (r.confidenceScore ?? 1) < 0.75 || r.sourceVerified === false;
        const statusToAssign: RuleApprovalStatus = forcedStatus
          ? forcedStatus === 'Approved' && isUnverified
            ? 'Unverified'
            : forcedStatus
          : r.status === 'Approved'
          ? 'Draft'
          : r.status || (isUnverified ? 'Unverified' : 'Draft');

        return {
          title: r.title.trim(),
          category: r.category,
          ruleStatement: r.ruleStatement.trim(),
          targetPatterns: r.targetPatterns,
          approvedValue: r.approvedValue.trim(),
          sourceDocumentName: r.sourceDocumentName || (extractionOrigin === 'pdf' ? pdfFileName : undefined),
          sourcePage: r.sourcePage,
          sourceSection: r.sourceSection,
          sourceRef:
            r.sourceRef ||
            (r.sourcePage ? `${pdfFileName || 'Document'} (Page ${r.sourcePage})` : pdfFileName || 'Unverified Source'),
          status: statusToAssign,
          severityLevel: r.severityLevel || (r.severity === 'critical' ? 'Critical' : r.severity === 'warning' ? 'High' : 'Low'),
          severity: r.severity || 'critical',
          explanation: r.explanation || r.ruleStatement
        };
      });

      const res = await fetch(`/api/brands/${activeBrand.id}/rules/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules: payloadRules,
          sourceFilename: extractionOrigin === 'pdf' ? pdfFileName : undefined,
          updatedBy: currentUser.name,
          updatedByRole: currentUser.roleLabel
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save batch rules.');

      onBrandUpdated(data.brand);
      handleClearExtractedQueue();
      const dupMsg = data.skippedDuplicates > 0 ? ` (${data.skippedDuplicates} duplicate(s) skipped)` : '';
      triggerToast(
        `Saved ${data.addedCount ?? data.count} rule(s) to ${activeBrand.name} Brand Knowledge${dupMsg}.`,
        'success'
      );
      onClose();
    } catch (err: any) {
      triggerToast(`Batch save failed: ${err.message}`, 'error');
    } finally {
      setIsSavingBatchRules(false);
    }
  };

  // Rule Tester Handlers
  const handleRunRuleTest = async () => {
    if (!formState.title.trim() || !formState.ruleStatement.trim()) {
      setRuleTestError('Please fill in at least the Rule Title and Rule Statement before testing the rule.');
      return;
    }
    if (testInputMode === 'text' && !testSampleText.trim()) {
      setRuleTestError('Please enter sample text to test against this rule.');
      return;
    }
    if (testInputMode === 'image' && !testImageBase64) {
      setRuleTestError('Please upload or select a sample image to test.');
      return;
    }

    setIsRunningRuleTest(true);
    setRuleTestError(null);

    try {
      const composedCitation = composeCitationPreview(
        formState.sourceDocumentName,
        formState.sourcePage,
        formState.sourceSection,
        formState.sourceRef
      );

      const rulePayload = {
        id: editingRule?.id || 'PREVIEW-RULE',
        title: formState.title.trim(),
        category: formState.category,
        ruleStatement: formState.ruleStatement.trim(),
        targetPatterns: formState.targetPatterns,
        approvedValue: formState.approvedValue.trim(),
        sourceDocumentName: formState.sourceDocumentName.trim(),
        sourcePage: formState.sourcePage.trim(),
        sourceSection: formState.sourceSection.trim(),
        sourceRef: composedCitation,
        status: formState.status,
        severityLevel: formState.severityLevel,
        severity:
          formState.severityLevel === 'Critical'
            ? 'critical'
            : formState.severityLevel === 'Low'
            ? 'info'
            : 'warning'
      };

      const res = await fetch(`/api/brands/${activeBrand.id}/rules/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: rulePayload,
          sampleText: testInputMode === 'text' ? testSampleText : '',
          base64Image: testInputMode === 'image' ? testImageBase64 : undefined,
          filename: testImageName || 'sample-test.png'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rule test failed');

      setRuleTestResult(data.result);
    } catch (err: any) {
      setRuleTestError(err?.message || 'Error executing rule test');
    } finally {
      setIsRunningRuleTest(false);
    }
  };

  const handleTestImageUpload = (file: File) => {
    if (!file) return;
    setTestImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTestImagePreview(dataUrl);
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setTestImageBase64(base64);
      setRuleTestError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleAdForTest = async (assetPath: string, title: string) => {
    try {
      setRuleTestError(null);
      const res = await fetch(assetPath);
      if (!res.ok) throw new Error('Could not load sample image');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setTestImagePreview(dataUrl);
        setTestImageBase64(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
        setTestImageName(title);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setRuleTestError('Failed to load sample image: ' + err?.message);
    }
  };

  // Restore a previous version into the form
  const handleRestoreVersionToForm = (entry: RuleVersionEntry) => {
    setFormState(prev => ({
      ...prev,
      title: entry.title || prev.title,
      category: entry.category || prev.category,
      ruleStatement: entry.ruleStatement || prev.ruleStatement,
      approvedValue: entry.approvedValue || prev.approvedValue,
      targetPatterns: Array.isArray(entry.targetPatterns) ? [...entry.targetPatterns] : prev.targetPatterns,
      sourceDocumentName: entry.sourceDocumentName || prev.sourceDocumentName,
      sourcePage: entry.sourcePage || prev.sourcePage,
      sourceSection: entry.sourceSection || prev.sourceSection,
      sourceRef: entry.sourceRef || prev.sourceRef,
      severityLevel: entry.severityLevel || prev.severityLevel,
      status: entry.status || prev.status,
      explanation: entry.explanation || prev.explanation
    }));
    setActiveTab('manual');
    triggerToast(`Restored Version v${entry.version} fields into the editor. Click Save Rule to commit.`, 'info');
  };

  // Filtered Extracted Rules
  const filteredExtractedRules = useMemo(() => {
    return extractedRules.filter(rule => {
      if (extractedRulesFilter === 'needs_review') {
        const isLowConf = (rule.confidenceScore ?? 1) < 0.75 || rule.sourceVerified === false;
        if (!isLowConf && !rule.isDuplicate) return false;
      }
      if (extractedRulesFilter === 'duplicates' && !rule.isDuplicate) {
        return false;
      }
      if (extractedRulesSearch.trim()) {
        const q = extractedRulesSearch.toLowerCase();
        return (
          rule.title.toLowerCase().includes(q) ||
          rule.ruleStatement.toLowerCase().includes(q) ||
          rule.category.toLowerCase().includes(q) ||
          rule.approvedValue.toLowerCase().includes(q) ||
          rule.targetPatterns.some(p => p.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [extractedRules, extractedRulesFilter, extractedRulesSearch]);

  const extractedNeedsReviewCount = useMemo(
    () => extractedRules.filter(r => (r.confidenceScore ?? 1) < 0.75 || r.sourceVerified === false || r.isDuplicate).length,
    [extractedRules]
  );

  const extractedDuplicatesCount = useMemo(
    () => extractedRules.filter(r => r.isDuplicate).length,
    [extractedRules]
  );

  if (!isOpen) return null;

  const composedCitationPreview = composeCitationPreview(
    formState.sourceDocumentName,
    formState.sourcePage,
    formState.sourceSection,
    formState.sourceRef
  );

  const versionHistoryList: RuleVersionEntry[] = editingRule?.versionHistory || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-[1120px] max-h-[92vh] flex flex-col transition-all duration-200 my-auto overflow-hidden">
        {/* ========================================================= */}
        {/* 1. MODAL HEADER                                           */}
        {/* ========================================================= */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50/70 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0">
              {activeTab === 'pdf' || activeTab === 'ai_text' ? (
                <Sparkles className="w-4 h-4" />
              ) : activeTab === 'test' ? (
                <Play className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  {editingRule ? `Edit Brand Rule: ${editingRule.id}` : 'Add New Brand Rule'}
                </h3>
                {editingRule && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                    v{editingRule.version || 1}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Target Brand: <strong className="font-semibold text-slate-800">{activeBrand.name}</strong> · Active Editor:{' '}
                <strong className="font-semibold text-slate-800">{currentUser.name}</strong> ({currentUser.roleLabel})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* UNSAVED CHANGES WARNING BANNER                            */}
        {/* ========================================================= */}
        {showUnsavedPrompt && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>You have unsaved changes</strong> to this brand rule. Would you like to keep editing or discard your changes?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowUnsavedPrompt(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-amber-300 rounded-lg font-semibold cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedPrompt(false);
                  handleClearExtractedQueue();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. WORKFLOW NAVIGATION STEPPER                            */}
        {/* ========================================================= */}
        <div className="px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-3">
            {/* Step 1: Rule Details */}
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`py-3 px-1 flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'manual'
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  activeTab === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                1
              </span>
              <div className="text-left">
                <div
                  className={`text-xs font-bold leading-tight ${
                    activeTab === 'manual' ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  Rule Details
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Define the rule
                </div>
              </div>
            </button>

            {!editingRule && (
              <>
                <div className="w-8 h-px bg-slate-200 shrink-0 hidden md:block" />

                {/* Step 2: Plain Language (AI Assist) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ai_text');
                    if (extractionOrigin !== 'ai_text') handleClearExtractedQueue();
                  }}
                  className={`py-3 px-1 flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'ai_text'
                      ? 'border-blue-600'
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      activeTab === 'ai_text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    2
                  </span>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold leading-tight ${
                          activeTab === 'ai_text' ? 'text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        Plain Language
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        AI Assist
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Explain in simple terms
                    </div>
                  </div>
                </button>

                <div className="w-8 h-px bg-slate-200 shrink-0 hidden md:block" />

                {/* Step 3: Import from PDF */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pdf');
                    if (extractionOrigin !== 'pdf') handleClearExtractedQueue();
                  }}
                  className={`py-3 px-1 flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'pdf'
                      ? 'border-blue-600'
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      activeTab === 'pdf'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    3
                  </span>
                  <div className="text-left">
                    <div
                      className={`text-xs font-bold leading-tight ${
                        activeTab === 'pdf' ? 'text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      Import from PDF
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Upload and extract
                    </div>
                  </div>
                </button>
              </>
            )}

            <div className="w-8 h-px bg-slate-200 shrink-0 hidden md:block" />

            {/* Step 4: Test in Sandbox */}
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className={`py-3 px-1 flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'test'
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  activeTab === 'test'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {editingRule ? '2' : '4'}
              </span>
              <div className="text-left">
                <div
                  className={`text-xs font-bold leading-tight ${
                    activeTab === 'test' ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  Test in Sandbox
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Validate before publishing
                </div>
              </div>
            </button>

            {editingRule && (
              <>
                <div className="w-8 h-px bg-slate-200 shrink-0 hidden md:block" />
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`py-3 px-1 flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-blue-600'
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      activeTab === 'history'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    3
                  </span>
                  <div className="text-left">
                    <div
                      className={`text-xs font-bold leading-tight ${
                        activeTab === 'history' ? 'text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      Version History ({versionHistoryList.length || 1})
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Audit trail & restore
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>

          {activeTab === 'manual' && (
            <div className="flex items-center gap-2 shrink-0 py-2">
              <button
                type="button"
                onClick={handleFillCategoryExample}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50/50 text-blue-600 border border-slate-200 hover:border-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Populate form with realistic sample data for the selected category"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Example</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. TAB 1: TWO-COLUMN LAYOUT (RULE INFORMATION + PREVIEW)  */}
        {/* ========================================================= */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSaveRule} className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F8FAFC]">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* Revalidation Notice when modifying an existing Approved rule */}
              {isApprovedRuleLogicModified && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-900">
                      Approved Rule Modification & Automatic Revalidation
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You are modifying the compliance logic of an active <strong>Approved</strong> rule (
                      <span className="font-mono font-semibold">{editingRule?.id}</span>). Saving will preserve{' '}
                      <strong>Version v{editingRule?.version || 1}</strong> in the audit log, record your editor profile (
                      <strong>{currentUser.name}</strong>), and revalidate existing review reports.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT COLUMN (~60% Width): RULE INFORMATION + COLLAPSIBLE ADVANCED SECTIONS */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Rule Information</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Define the core details for this brand rule.
                    </p>
                  </div>

                  {/* Row 1: Category & Severity side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formState.category}
                        onChange={e =>
                          setFormState(prev => ({ ...prev, category: e.target.value as RuleCategory }))
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Visual Identity">Visual Identity</option>
                        <option value="Messaging & Claims">Messaging & Claims</option>
                        <option value="Prohibited Content">Prohibited Content</option>
                        <option value="Tone & Style">Tone & Style</option>
                        <option value="Legal & Compliance">Legal & Compliance</option>
                        <option value="Accessibility">Accessibility</option>
                        {(formState.category === 'Pricing & Facts' ||
                          formState.category === 'Terminology' ||
                          formState.category === 'Prohibited Claim' ||
                          formState.category === 'Performance & Claims') && (
                          <option value={formState.category}>{formState.category} (Legacy)</option>
                        )}
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{currentGuidance.helper}</p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">
                        Severity <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formState.severityLevel}
                        onChange={e =>
                          setFormState(prev => ({
                            ...prev,
                            severityLevel: e.target.value as RuleSeverityLevel
                          }))
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Critical">Critical — Blocks Publication</option>
                        <option value="High">High — Requires Correction or Escalation</option>
                        <option value="Medium">Medium — Brand Alignment Warning</option>
                        <option value="Low">Low — Advisory Style Suggestion</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Determines how strictly violations impact content.
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Rule Title */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Rule Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={formState.title}
                      onChange={e => {
                        setFormState(prev => ({ ...prev, title: e.target.value }));
                        if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                      }}
                      placeholder={`e.g. ${currentGuidance.exampleTitle}`}
                      className={`w-full border rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        fieldErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1 gap-2">
                      {fieldErrors.title ? (
                        <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.title}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Short, recognizable name for this rule.
                        </p>
                      )}
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formState.title.length}/120
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Rule Statement (What Must Be Followed) */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Rule Statement (What Must Be Followed) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={formState.ruleStatement}
                      onChange={e => {
                        setFormState(prev => ({ ...prev, ruleStatement: e.target.value }));
                        if (fieldErrors.ruleStatement) setFieldErrors(prev => ({ ...prev, ruleStatement: '' }));
                      }}
                      placeholder={`e.g. ${currentGuidance.exampleStatement}`}
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans leading-relaxed ${
                        fieldErrors.ruleStatement ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1 gap-2">
                      {fieldErrors.ruleStatement ? (
                        <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.ruleStatement}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Clearly describe what is allowed or required.
                        </p>
                      )}
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formState.ruleStatement.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Approved Value or Standard */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      Approved Value or Standard <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={formState.approvedValue}
                      onChange={e => {
                        setFormState(prev => ({ ...prev, approvedValue: e.target.value }));
                        if (fieldErrors.approvedValue) setFieldErrors(prev => ({ ...prev, approvedValue: '' }));
                      }}
                      placeholder={`e.g. ${currentGuidance.exampleApprovedValue}`}
                      className={`w-full border rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        fieldErrors.approvedValue ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1 gap-2">
                      {fieldErrors.approvedValue ? (
                        <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.approvedValue}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Use as the recommended replacement fix.
                        </p>
                      )}
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formState.approvedValue.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Row 5: Collapsible Advanced Sections */}
                  <div className="space-y-2.5 pt-1">
                    {/* Accordion 1: Prohibited Patterns & Trigger Keywords */}
                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsPatternsAccordionOpen(prev => !prev)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertOctagon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Prohibited Patterns & Trigger Keywords ({formState.targetPatterns.length})
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-150 ${
                            isPatternsAccordionOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isPatternsAccordionOpen && (
                        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/80 bg-white space-y-2.5">
                          {/* Active Pattern Chips */}
                          <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-lg bg-slate-50/70 border border-slate-200">
                            {formState.targetPatterns.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic py-0.5">
                                No prohibited patterns added yet. Add keywords or phrases below (e.g.,{' '}
                                {currentGuidance.examplePatterns.slice(0, 2).join(', ')}).
                              </span>
                            ) : (
                              formState.targetPatterns.map((pat, idx) => (
                                <span
                                  key={`${pat}-${idx}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[11px] font-medium"
                                >
                                  <span>{pat}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePatternChip(idx)}
                                    className="text-rose-400 hover:text-rose-700 cursor-pointer"
                                    title={`Remove "${pat}"`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Add Pattern Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={patternInput}
                              onChange={e => setPatternInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  handleAddPatternChip();
                                }
                              }}
                              placeholder={`Type forbidden phrase (e.g. ${currentGuidance.examplePatterns[0]}) and press Enter...`}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPatternChip()}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Pattern</span>
                            </button>
                          </div>

                          {/* Quick Suggested Example Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-500 font-medium">Quick-add examples:</span>
                            {currentGuidance.examplePatterns.map(exPat => {
                              const alreadyIn = formState.targetPatterns.some(
                                p => p.toLowerCase() === exPat.toLowerCase()
                              );
                              return (
                                <button
                                  key={exPat}
                                  type="button"
                                  disabled={alreadyIn}
                                  onClick={() => handleAddPatternChip(exPat)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                                    alreadyIn
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                      : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 cursor-pointer'
                                  }`}
                                >
                                  + {exPat}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion 2: Source Reference (Document, Page & Section) */}
                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsSourceAccordionOpen(prev => !prev)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Source Reference (Document, Page & Section)</span>
                          {formState.status === 'Approved' && <span className="text-rose-500">*</span>}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-150 ${
                            isSourceAccordionOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isSourceAccordionOpen && (
                        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/80 bg-white space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                Document Name
                              </label>
                              <input
                                type="text"
                                value={formState.sourceDocumentName}
                                onChange={e => handleSourceFieldChange('sourceDocumentName', e.target.value)}
                                placeholder={`e.g. ${currentGuidance.exampleDoc}`}
                                className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  fieldErrors.sourceRef ? 'border-rose-400' : 'border-slate-200'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                Page Number
                              </label>
                              <input
                                type="text"
                                value={formState.sourcePage}
                                onChange={e => handleSourceFieldChange('sourcePage', e.target.value)}
                                placeholder={`e.g. ${currentGuidance.examplePage}`}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                Section / Clause
                              </label>
                              <input
                                type="text"
                                value={formState.sourceSection}
                                onChange={e => handleSourceFieldChange('sourceSection', e.target.value)}
                                placeholder={`e.g. ${currentGuidance.exampleSection}`}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {fieldErrors.sourceRef ? (
                            <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.sourceRef}</p>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Citation: <strong className="font-mono text-slate-700">{composedCitationPreview || 'Pending'}</strong>
                            </p>
                          )}

                          {/* Approval Status Selector */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700 block">
                              Approval Status
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {(
                                [
                                  {
                                    status: 'Draft' as RuleApprovalStatus,
                                    label: 'Draft',
                                    desc: 'Not enforced in review',
                                    activeRing: 'border-amber-500 bg-amber-50/70 text-amber-950'
                                  },
                                  {
                                    status: 'Unverified' as RuleApprovalStatus,
                                    label: 'Unverified',
                                    desc: 'Pending source check',
                                    activeRing: 'border-purple-500 bg-purple-50/70 text-purple-950'
                                  },
                                  {
                                    status: 'Approved' as RuleApprovalStatus,
                                    label: 'Approved',
                                    desc: 'Enforced in review',
                                    activeRing: 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                                  }
                                ]
                              ).map(opt => {
                                const isSelected = formState.status === opt.status;
                                return (
                                  <button
                                    key={opt.status}
                                    type="button"
                                    onClick={() => setFormState(prev => ({ ...prev, status: opt.status }))}
                                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                      isSelected
                                        ? `${opt.activeRing} ring-1 ring-current`
                                        : 'border-slate-200 bg-slate-50/40 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="font-bold text-xs flex items-center justify-between">
                                      <span>{opt.label}</span>
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                    </div>
                                    <p className="text-[10px] opacity-80 mt-0.5 leading-snug">{opt.desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (~40% Width): LIVE RULE PREVIEW */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  {/* Live Rule Preview Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Live Rule Preview</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                      {editingRule ? editingRule.id : `${activeBrand.id.slice(0, 2).toUpperCase()}-RULE-NEW`}
                    </span>
                  </div>

                  {/* Preview Card */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3.5 text-xs">
                    {/* Category, Severity & Status Pills */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50/80 text-blue-600 border border-blue-200/70">
                        {formState.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                            formState.severityLevel === 'Critical'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : formState.severityLevel === 'High'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : formState.severityLevel === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {formState.severityLevel}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            formState.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : formState.status === 'Draft'
                              ? 'bg-amber-50/80 text-amber-700 border border-amber-200/70'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {formState.status}
                        </span>
                      </div>
                    </div>

                    {/* Rule Title & Statement */}
                    <div>
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {formState.title.trim() || 'Untitled Brand Rule'}
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {formState.ruleStatement.trim() || 'Rule statement will appear here as you type...'}
                      </p>
                    </div>

                    {/* Approved Value / Standard Section */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>APPROVED VALUE / STANDARD</span>
                      </div>
                      <div className="text-xs font-medium text-emerald-950 mt-1 break-words">
                        {formState.approvedValue.trim() || 'Not specified yet'}
                      </div>
                    </div>

                    {/* Prohibited Patterns & Triggers Section */}
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>PROHIBITED PATTERNS & TRIGGERS ({formState.targetPatterns.length})</span>
                      </div>
                      {formState.targetPatterns.length === 0 ? (
                        <div className="text-xs text-slate-400 italic mt-1">
                          No patterns added yet.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {formState.targetPatterns.map((p, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white border border-rose-200 font-mono text-[10px] text-rose-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Source Reference Footer */}
                    <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 truncate">
                      <strong className="text-slate-800">Source:</strong> {composedCitationPreview || 'Unverified'}
                    </div>
                  </div>

                  {/* Governance Enforcement Notice */}
                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {formState.status === 'Approved' ? (
                        <span>
                          <strong className="text-slate-800">Active in Production (Approved):</strong> Only approved rules are enforced during content review. This rule will be active immediately upon saving.
                        </span>
                      ) : (
                        <span>
                          <strong className="text-slate-800">Inactive in Production ({formState.status}):</strong> Only approved rules are enforced during content review. You can safely test this rule in the sandbox first.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 7. STICKY MODAL FOOTER                                    */}
            {/* ========================================================= */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                {editingRule ? (
                  <span>
                    Preserving Rule ID <strong className="font-mono text-slate-700">{editingRule.id}</strong> and existing audit history.
                  </span>
                ) : (
                  <span>All changes are saved automatically to the brand knowledge store.</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRule}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSavingRule ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingRule ? 'Save Updated Rule' : 'Save Brand Rule'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AI-ASSISTED PLAIN LANGUAGE RULE BUILDER            */}
        {/* ========================================================= */}
        {activeTab === 'ai_text' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {extractedRules.length === 0 ? (
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-blue-950">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-blue-900">
                      Describe Your Brand Rule in Everyday Language
                    </h4>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Write what your team should or shouldn&apos;t do in plain English. Gemini AI will structure the title, category, approved value, prohibited trigger chips, and source reference for your review.{' '}
                      <strong>Extracted rules are never automatically approved</strong>, and any rule without a verifiable source citation is automatically marked as <strong>Unverified</strong>.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">
                    Plain-Language Rule Description
                  </label>
                  <textarea
                    rows={4}
                    value={plainLanguagePrompt}
                    onChange={e => {
                      setPlainLanguagePrompt(e.target.value);
                      if (aiTextError) setAiTextError(null);
                    }}
                    placeholder="e.g. Never allow marketing copy to promise 'guaranteed risk-free returns' or 'instant wealth'. Writers must state 'Regulated transaction infrastructure' per Regulatory Manual 2026, Page 7, Section 3.2."
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                {/* Clickable Sample Prompts */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Try a realistic plain-language example:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {PLAIN_LANGUAGE_SAMPLE_PROMPTS.map(sample => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => {
                          setPlainLanguagePrompt(sample.text);
                          setAiTextError(null);
                        }}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 text-left transition-all cursor-pointer space-y-1"
                      >
                        <div className="font-bold text-[11px] text-blue-700 flex items-center justify-between">
                          <span>{sample.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">
                          &ldquo;{sample.text}&rdquo;
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {aiTextError && (
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Could Not Generate Rule</div>
                      <p className="text-[11px] mt-0.5">{aiTextError}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRequestClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateRulesFromPlainText}
                    disabled={isGeneratingFromText || !plainLanguagePrompt.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingFromText ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Structuring Rule Fields with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Structured Rule Suggestions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Reuses the Editable Review Screen below */
              <div className="flex-1 flex flex-col min-h-0">
                {renderExtractedRulesReviewStage()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: IMPORT RULES FROM PDF (AI EXTRACTION WORKFLOW)     */}
        {/* ========================================================= */}
        {activeTab === 'pdf' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {extractedRules.length === 0 ? (
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Drag & Drop Dropzone */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragOverPdf(true);
                  }}
                  onDragLeave={() => setIsDragOverPdf(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragOverPdf(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePdfFileSelected(file);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragOverPdf
                      ? 'border-blue-500 bg-blue-50/60'
                      : pdfBase64
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-blue-400 bg-slate-50/40'
                  }`}
                >
                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfFileSelected(file);
                    }}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {pdfFileName ? 'PDF Document Ready for AI Rule Extraction' : 'Upload Approved Brand Guidelines PDF'}
                  </h4>

                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Drag and drop your brand guidelines PDF here, or browse your files (up to 15 MB).
                    Extracted rules are placed in an editable review screen as <strong>Draft</strong> or <strong>Unverified</strong> and are never auto-approved.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => pdfFileInputRef.current?.click()}
                      disabled={isExtractingPdf}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{pdfFileName ? 'Change PDF File' : 'Browse PDF File'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSamplePdf}
                      disabled={isExtractingPdf}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Load NovaPay Standards PDF (Demo Preset)</span>
                    </button>
                  </div>
                </div>

                {pdfFileName && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs border border-rose-200">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{pdfFileName}</div>
                        <div className="text-[11px] text-slate-500">
                          {(pdfFileSize / 1024).toFixed(1)} KB · Ready for AI extraction
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearExtractedQueue}
                      className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {isExtractingPdf && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center gap-3.5 text-xs text-blue-950">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                    <div>
                      <div className="font-bold text-blue-900">{pdfExtractionProgress || 'Processing document...'}</div>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Segmenting distinct rules, mapping to categories, and verifying source citations.
                      </p>
                    </div>
                  </div>
                )}

                {pdfExtractError && (
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Extraction Error</div>
                      <p className="text-[11px] mt-0.5">{pdfExtractError}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRequestClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleExtractRulesFromPdf}
                    disabled={!pdfBase64 || isExtractingPdf}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isExtractingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting Rules...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Brand Rules with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {renderExtractedRulesReviewStage()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TEST RULE SANDBOX (SAMPLE TEXT OR SAMPLE IMAGE)    */}
        {/* ========================================================= */}
        {activeTab === 'test' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Rule Summary Bar under test */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold">
                      {editingRule?.id || 'UNSAVED-RULE'}
                    </span>
                    <span className="font-bold text-sm truncate">
                      {formState.title.trim() || 'Untitled Rule'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {formState.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        formState.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      Status: {formState.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    <strong>Policy:</strong> {formState.ruleStatement || 'No statement entered yet'} ·{' '}
                    <strong>Approved Standard:</strong> &ldquo;{formState.approvedValue || 'None'}&rdquo; ·{' '}
                    <strong>Source:</strong> {composedCitationPreview}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Edit Rule Fields
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Sample Content Input (Text or Image) */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTestInputMode('text')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testInputMode === 'text'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Sample Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestInputMode('image')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testInputMode === 'image'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Sample Image</span>
                      </button>
                    </div>
                  </div>

                  {testInputMode === 'text' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Enter Sample Copy to Test</label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const pat =
                                formState.targetPatterns[0] || currentGuidance.examplePatterns[0] || 'unapproved claim';
                              setTestSampleText(
                                `Promotional draft for ${activeBrand.name}: Take advantage of ${pat} right now!`
                              );
                            }}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-semibold cursor-pointer"
                          >
                            Load Failing Sample
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTestSampleText(
                                `${activeBrand.name} announcement: ${
                                  formState.approvedValue || currentGuidance.exampleApprovedValue
                                }.`
                              );
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-semibold cursor-pointer"
                          >
                            Load Compliant Sample
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={5}
                        value={testSampleText}
                        onChange={e => setTestSampleText(e.target.value)}
                        placeholder="Paste or type sample marketing text to see if this rule detects violations..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        ref={testImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleTestImageUpload(file);
                        }}
                        className="hidden"
                      />

                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50 space-y-2">
                        {testImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={testImagePreview}
                              alt="Sample under test"
                              className="max-h-40 mx-auto rounded-lg border border-slate-200 object-contain"
                            />
                            <div className="text-[11px] font-semibold text-slate-700 truncate">
                              {testImageName}
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 space-y-1">
                            <UploadCloud className="w-6 h-6 text-blue-600 mx-auto" />
                            <div className="font-semibold text-slate-800">Upload Sample Image</div>
                            <p className="text-[11px] text-slate-500">
                              Extracts image text via OCR and runs both deterministic & visual AI rule checks.
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => testImageInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {testImagePreview ? 'Change Image' : 'Select Image File'}
                        </button>
                      </div>

                      {/* Quick Sample Ad Presets */}
                      {(activeBrand.sampleAdImages || []).length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Or test against a preset brand ad:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(activeBrand.sampleAdImages || []).slice(0, 4).map(ad => (
                              <button
                                key={ad.id}
                                type="button"
                                onClick={() => handleLoadSampleAdForTest(ad.assetPath, ad.title)}
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/50 text-left text-[11px] font-medium text-slate-700 truncate cursor-pointer"
                              >
                                {ad.badge}: {ad.filename}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {ruleTestError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium">
                      {ruleTestError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRunRuleTest}
                    disabled={isRunningRuleTest}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isRunningRuleTest ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Running Deterministic + AI Rule Test...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Rule Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Rule Test Results (Separating Deterministic vs AI Assessments) */}
                <div className="lg:col-span-7">
                  {!ruleTestResult ? (
                    <div className="h-full min-h-[260px] rounded-xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center space-y-2">
                      <Play className="w-7 h-7 text-slate-400" />
                      <div className="font-bold text-slate-800">Ready to Test Rule</div>
                      <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                        Click <strong>Run Rule Test</strong> to see matched patterns, the reason for each finding, the rule source citation, and severity — clearly separated into <strong>Deterministic Matches</strong> and <strong>AI-Generated Assessments</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Outcome Banner */}
                      <div
                        className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                          ruleTestResult.passed
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-rose-50/80 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {ruleTestResult.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold text-xs">
                              {ruleTestResult.passed
                                ? 'Sample Passed — No Rule Violations Triggered'
                                : `Rule Triggered — ${
                                    ruleTestResult.deterministicMatches.length + ruleTestResult.aiAssessments.length
                                  } Finding(s) Detected`}
                            </div>
                            <p className="text-[11px] opacity-90 mt-0.5">{ruleTestResult.enforcementNotice}</p>
                          </div>
                        </div>
                      </div>

                      {/* 1. DETERMINISTIC MATCHES SECTION */}
                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span className="font-bold text-xs text-slate-900">
                              1. Deterministic Pattern & Fact Matches ({ruleTestResult.deterministicMatches.length})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            Exact Keyword / Regex Engine
                          </span>
                        </div>

                        <div className="p-3.5 space-y-2.5">
                          {ruleTestResult.deterministicMatches.length === 0 ? (
                            <p className="text-[11px] text-slate-500">
                              No exact prohibited pattern or numeric fact mismatches detected.
                            </p>
                          ) : (
                            ruleTestResult.deterministicMatches.map(m => (
                              <div
                                key={m.id}
                                className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                                      Matched: &ldquo;{m.matchedSpan}&rdquo;
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      Trigger Pattern: &ldquo;{m.matchedPattern}&rdquo;
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase">
                                    Severity: {m.severity}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-800">{m.reason}</p>
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-200/60 text-[11px]">
                                  <span className="text-emerald-800 font-semibold">
                                    ✓ Suggested Fix: &ldquo;{m.suggestedFix}&rdquo;
                                  </span>
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    Source: {m.ruleSource}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 2. AI-GENERATED ASSESSMENTS SECTION */}
                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-4 py-2.5 bg-purple-50/60 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-bold text-xs text-slate-900">
                              2. AI-Generated Contextual & Visual Assessments ({ruleTestResult.aiAssessments.length})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                            Gemini AI Evaluation
                          </span>
                        </div>

                        <div className="p-3.5 space-y-2.5">
                          {ruleTestResult.aiNote && (
                            <p className="text-[11px] text-slate-600 italic">{ruleTestResult.aiNote}</p>
                          )}
                          {ruleTestResult.aiAssessments.length === 0 ? (
                            <p className="text-[11px] text-slate-500">
                              No additional contextual or visual issues flagged by AI beyond deterministic checks.
                            </p>
                          ) : (
                            ruleTestResult.aiAssessments.map(a => (
                              <div
                                key={a.id}
                                className="p-3 rounded-lg border border-purple-200 bg-purple-50/30 space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-[10px] font-bold">
                                    Flagged Span: &ldquo;{a.matchedSpan}&rdquo;
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {a.confidence && (
                                      <span className="text-[10px] text-purple-700 font-medium">
                                        {Math.round(a.confidence * 100)}% AI Confidence
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                                      Severity: {a.severity}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-800">{a.reason}</p>
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-200/60 text-[11px]">
                                  <span className="text-emerald-800 font-semibold">
                                    ✓ Recommended Adjustment: &ldquo;{a.suggestedFix}&rdquo;
                                  </span>
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    Source: {a.ruleSource}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                ← Back to Rule Editor
              </button>
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Tester
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: RULE AUDIT & VERSION HISTORY                       */}
        {/* ========================================================= */}
        {activeTab === 'history' && editingRule && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Version & Audit Trail for {editingRule.id} ({editingRule.title})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Every edit preserves the previous version, recording the editor, role, timestamp, and changed fields.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                  Current: v{editingRule.version || 1}
                </span>
              </div>

              {versionHistoryList.length === 0 ? (
                <div className="p-6 rounded-xl border border-slate-200 bg-white text-center text-slate-500">
                  Baseline rule version (v1) — last updated {editingRule.updatedAt} by{' '}
                  <strong>{editingRule.updatedBy || 'System Seed'}</strong>. Subsequent edits will be logged here.
                </div>
              ) : (
                <div className="space-y-3">
                  {versionHistoryList.map((ver, idx) => (
                    <div
                      key={`${ver.version}-${idx}`}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                            Version v{ver.version}
                          </span>
                          <span className="font-bold text-slate-900">{ver.title}</span>
                          {ver.status && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {ver.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>
                            Edited by <strong className="text-slate-800">{ver.updatedBy}</strong>
                            {ver.updatedByRole ? ` (${ver.updatedByRole})` : ''}
                          </span>
                          <span>·</span>
                          <span className="font-mono">{String(ver.updatedAt).slice(0, 16).replace('T', ' ')}</span>
                        </div>
                      </div>

                      {ver.changedFields && ver.changedFields.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Changed Fields:</span>
                          {ver.changedFields.map((cf, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold"
                            >
                              {cf}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-600">Statement:</span>{' '}
                          <span className="text-slate-800">{ver.ruleStatement}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Approved Value:</span>{' '}
                          <span className="text-emerald-800 font-medium">{ver.approvedValue}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRestoreVersionToForm(ver)}
                          className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Load v{ver.version} into Editor</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                ← Back to Rule Editor
              </button>
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Shared Editable Review Screen for AI-Extracted Rules (Plain Language & PDF)
  function renderExtractedRulesReviewStage() {
    return (
      <>
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>
                    AI-Suggested Rules Review ({extractedRules.length} extracted from{' '}
                    {extractionOrigin === 'pdf' ? `"${pdfFileName}"` : 'Plain-Language Description'})
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Review and edit every field before saving.{' '}
                  <strong className="text-amber-800">
                    Extracted rules are never automatically approved; unverified sources are marked Unverified.
                  </strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearExtractedQueue}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>{extractionOrigin === 'pdf' ? 'Upload Different PDF' : 'Edit Prompt'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExtractedRulesFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  extractedRulesFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                All Suggestions ({extractedRules.length})
              </button>
              <button
                type="button"
                onClick={() => setExtractedRulesFilter('needs_review')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  extractedRulesFilter === 'needs_review'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Unverified / Needs Review ({extractedNeedsReviewCount})
              </button>
              {extractedDuplicatesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExtractedRulesFilter('duplicates')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    extractedRulesFilter === 'duplicates'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Potential Duplicates ({extractedDuplicatesCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={extractedRulesSearch}
                  onChange={e => setExtractedRulesSearch(e.target.value)}
                  placeholder="Filter extracted rules..."
                  className="pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 w-44"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedExtractedRuleIds.size === extractedRules.length) {
                    setSelectedExtractedRuleIds(new Set());
                  } else {
                    setSelectedExtractedRuleIds(new Set(extractedRules.map(r => r.id)));
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {selectedExtractedRuleIds.size === extractedRules.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/40">
          {filteredExtractedRules.map(rule => {
            const isSelected = selectedExtractedRuleIds.has(rule.id);
            const isEditing = editingExtractedRuleId === rule.id;
            const isUnverifiedSource = rule.sourceVerified === false || (rule.confidenceScore ?? 1) < 0.75;

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
                  isSelected ? 'border-blue-400 ring-1 ring-blue-400/30' : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectExtractedRule(rule.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    />
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {rule.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                      Severity: {rule.severityLevel || rule.severity}
                    </span>

                    {/* Status Badge (Draft vs Unverified) */}
                    {isUnverifiedSource || rule.status === 'Unverified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-purple-600" />
                        <span>Marked Unverified (Source / Rule Needs Verification)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Draft (Source Cited · Pending Approval)
                      </span>
                    )}

                    {rule.isDuplicate && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Duplicate of {rule.duplicateOfRuleId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoadSuggestionIntoGuidedForm(rule)}
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer"
                    >
                      Open in Guided Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExtractedRuleId(isEditing ? null : rule.id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                    >
                      {isEditing ? 'Done' : 'Edit Inline'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExtractedRule(rule.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Rule Title</label>
                        <input
                          type="text"
                          value={rule.title}
                          onChange={e => handleUpdateExtractedRule(rule.id, { title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Category</label>
                        <select
                          value={rule.category}
                          onChange={e =>
                            handleUpdateExtractedRule(rule.id, { category: e.target.value as RuleCategory })
                          }
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                        >
                          <option value="Visual Identity">Visual Identity</option>
                          <option value="Messaging & Claims">Messaging & Claims</option>
                          <option value="Prohibited Content">Prohibited Content</option>
                          <option value="Tone & Style">Tone & Style</option>
                          <option value="Legal & Compliance">Legal & Compliance</option>
                          <option value="Accessibility">Accessibility</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Severity</label>
                        <select
                          value={rule.severityLevel || 'Critical'}
                          onChange={e =>
                            handleUpdateExtractedRule(rule.id, {
                              severityLevel: e.target.value as RuleSeverityLevel
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Rule Statement</label>
                      <textarea
                        rows={2}
                        value={rule.ruleStatement}
                        onChange={e => handleUpdateExtractedRule(rule.id, { ruleStatement: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Approved Value / Standard</label>
                        <input
                          type="text"
                          value={rule.approvedValue}
                          onChange={e => handleUpdateExtractedRule(rule.id, { approvedValue: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Source Reference Citation</label>
                        <input
                          type="text"
                          value={rule.sourceRef}
                          onChange={e =>
                            handleUpdateExtractedRule(rule.id, {
                              sourceRef: e.target.value,
                              sourceVerified: Boolean(e.target.value.trim()),
                              status: e.target.value.trim() ? 'Draft' : 'Unverified'
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Prohibited Patterns (Chips)</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {rule.targetPatterns.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px]"
                          >
                            <span>{p}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateExtractedRule(rule.id, {
                                  targetPatterns: rule.targetPatterns.filter((_, i) => i !== pIdx)
                                })
                              }
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={extractedNewPatternInput[rule.id] || ''}
                          onChange={e =>
                            setExtractedNewPatternInput(prev => ({ ...prev, [rule.id]: e.target.value }))
                          }
                          placeholder="Add prohibited pattern..."
                          className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (extractedNewPatternInput[rule.id] || '').trim();
                            if (!val) return;
                            handleUpdateExtractedRule(rule.id, {
                              targetPatterns: [...rule.targetPatterns, val]
                            });
                            setExtractedNewPatternInput(prev => ({ ...prev, [rule.id]: '' }));
                          }}
                          className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{rule.title}</h4>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{rule.ruleStatement}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                          Approved Value / Standard:
                        </span>
                        <span className="font-medium">{rule.approvedValue}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Prohibited Patterns:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.targetPatterns.map((pat, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-rose-700"
                            >
                              {pat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>
                        <strong>Source Reference:</strong> {rule.sourceRef}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — Never auto-approves extracted rules */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            <strong>{selectedExtractedRuleIds.size}</strong> of {extractedRules.length} rules selected. Unverified rules are saved as <strong>Unverified</strong> until source-checked.
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSavingBatchRules}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleBatchSaveExtractedRules('Unverified')}
              disabled={isSavingBatchRules || selectedExtractedRuleIds.size === 0}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs rounded-lg font-semibold cursor-pointer disabled:opacity-50"
            >
              Save Selected as Unverified
            </button>

            <button
              type="button"
              onClick={() => handleBatchSaveExtractedRules()}
              disabled={isSavingBatchRules || selectedExtractedRuleIds.size === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingBatchRules ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Rules...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Reviewed Rules to Brand Knowledge ({selectedExtractedRuleIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }
}
