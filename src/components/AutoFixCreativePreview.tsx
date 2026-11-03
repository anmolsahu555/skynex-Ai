import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Columns,
  Check,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import type { AutoFixCreativeResult, UserProfile } from '../types.ts';

interface AutoFixCreativePreviewProps {
  autoFixResult: AutoFixCreativeResult;
  currentUser?: UserProfile;
  isApproving: boolean;
  isRegenerating: boolean;
  regenerationError?: string | null;
  onRegenerate: () => void;
  onApprove: () => void;
  onSubmitForManagerApproval?: () => void;
  onRequestChanges?: () => void;
  onDownload: () => void;
  onClose?: () => void;
}

export default function AutoFixCreativePreview({
  autoFixResult,
  currentUser,
  isApproving,
  isRegenerating,
  regenerationError,
  onRegenerate,
  onApprove,
  onSubmitForManagerApproval,
  onRequestChanges,
  onDownload,
  onClose
}: AutoFixCreativePreviewProps) {
  const [viewMode, setViewMode] = useState<'split' | 'fixed_only' | 'orig_only'>('split');
  const [showAppliedDetails, setShowAppliedDetails] = useState<boolean>(true);
  const [showSecondAuditDetails, setShowSecondAuditDetails] = useState<boolean>(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [currentSecondAudit, setCurrentSecondAudit] = useState(autoFixResult.secondAudit);
  const [isReauditing, setIsReauditing] = useState<boolean>(false);
  const [reauditError, setReauditError] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  React.useEffect(() => {
    setCurrentSecondAudit(autoFixResult.secondAudit);
    setImgLoadError(false);
    setReauditError(null);
  }, [autoFixResult]);

  const { appliedCorrections, status } = autoFixResult;
  const secondAudit = currentSecondAudit || autoFixResult.secondAudit;
  const isApproved = status === 'approved';

  const fixedImgSrc = autoFixResult.generatedImageBase64 || autoFixResult.generatedImageUrl || '';
  const origImgSrc = autoFixResult.originalImageUrl || '';

  // Strict check: generated image must exist, must not be the original image URL, and must not have failed loading
  const hasValidGeneratedImage = Boolean(
    fixedImgSrc &&
      fixedImgSrc !== origImgSrc &&
      !imgLoadError
  );

  const handleRunSecondAudit = async () => {
    if (!hasValidGeneratedImage) return;
    try {
      setIsReauditing(true);
      setReauditError(null);
      const res = await fetch('/api/auto-fix-creative/second-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: autoFixResult.brandId,
          reportId: autoFixResult.reportId,
          imageUrl: autoFixResult.generatedImageUrl,
          base64Image: autoFixResult.generatedImageBase64,
          acceptedFindings: autoFixResult.appliedCorrections
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI Re-Audit failed');
      }
      if (data.secondAudit) {
        setCurrentSecondAudit(data.secondAudit);
      }
    } catch (err: any) {
      setReauditError(err?.message || 'AI Re-Audit failed');
    } finally {
      setIsReauditing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header with Title, Status & Before/After View Mode Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Auto-Fixed Creative</h2>
            {isRegenerating ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Regenerating your creative...
              </span>
            ) : regenerationError || !hasValidGeneratedImage ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Generation Error
              </span>
            ) : isApproved ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Creative Approved
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI Re-Audit Complete · Ready for Approval
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare Before and After creatives, inspect AI Re-Audit compliance verification, and approve or download the newly generated creative.
          </p>
        </div>

        {/* Before / After Comparison Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Before / After</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fixed_only')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'fixed_only'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>After (Generated)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('orig_only')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'orig_only'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Before (Original)</span>
          </button>
        </div>
      </div>

      {/* Regeneration Loading Animation Overlay Card */}
      {isRegenerating && (
        <div className="p-8 rounded-2xl bg-blue-50/70 border border-blue-200/90 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <div className="text-sm font-bold text-slate-900">Regenerating your creative...</div>
          <p className="text-xs text-slate-600 max-w-lg">
            Generating a new creative with your accepted audit corrections, Brand DNA palette & typography, and regulatory compliance rules.
          </p>
        </div>
      )}

      {/* Regeneration Error Banner + Retry Button */}
      {(regenerationError || !hasValidGeneratedImage) && !isRegenerating && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">AI Image Regeneration Failed</div>
              <p className="text-[11px] text-rose-800 mt-0.5 break-words">
                {regenerationError ||
                  'The generated creative image could not be loaded or no new image was produced.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Visual Before / After Creative Comparison Area */}
      {!isRegenerating && (
        <div className="space-y-4">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Before (Original Uploaded Creative) */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-bold text-slate-900">
                      Before: Original Creative (Uncorrected)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                    {appliedCorrections.length} Issues Flagged
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200/80 aspect-[4/3] flex items-center justify-center group">
                  {origImgSrc ? (
                    <img
                      src={origImgSrc}
                      alt="Original Uploaded Creative"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Original image unavailable</div>
                  )}
                  <div className="absolute top-2 left-2 bg-rose-900/80 text-rose-100 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-semibold">
                    Before (Original)
                  </div>
                </div>

                {/* List of issues present in original */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Flagged Compliance Errors in Original:
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {appliedCorrections.map((item, idx) => (
                      <div key={idx} className="text-xs text-rose-800 flex items-start gap-1.5">
                        <span className="text-rose-500 shrink-0 font-bold">•</span>
                        <span className="line-through">{item.originalSpan}</span>
                        <span className="text-[10px] text-slate-500">
                          ({item.category || 'Rule Conflict'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: After (Newly Generated AI Creative — NEVER falls back to Original) */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/20 p-4 flex flex-col shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        hasValidGeneratedImage ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    ></span>
                    <span className="text-xs font-bold text-slate-900">
                      After: AI-Regenerated Creative
                    </span>
                  </div>
                  {hasValidGeneratedImage ? (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {appliedCorrections.length} Corrections Applied
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                      Generation Failed
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900/5 border border-emerald-200 aspect-[4/3] flex items-center justify-center group shadow-2xs">
                  {hasValidGeneratedImage ? (
                    <>
                      <img
                        src={fixedImgSrc}
                        alt="AI-Regenerated Corrected Creative"
                        className="w-full h-full object-contain"
                        onError={() => {
                          // Never fall back to the original image! Mark as failed load instead.
                          setImgLoadError(true);
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-emerald-800/90 text-white backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        After (AI Generated)
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <ShieldAlert className="w-7 h-7 text-rose-500 mx-auto" />
                      <div className="text-xs font-bold text-slate-800">
                        Generated Image Unavailable
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        No corrected image is displayed because generation failed. Click Retry to regenerate.
                      </p>
                      <button
                        type="button"
                        onClick={onRegenerate}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* List of applied fixes */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                    Authoritative Corrections Applied:
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {appliedCorrections.map((item, idx) => (
                      <div key={idx} className="text-xs text-emerald-900 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold">{item.suggestedFix}</span>
                        <span className="text-[10px] text-slate-500">
                          (replaced {item.originalSpan.slice(0, 24)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'fixed_only' && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    After: AI-Regenerated Creative
                  </span>
                </div>
                {hasValidGeneratedImage && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Newly Generated Creative
                  </span>
                )}
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[280px] max-h-[520px]">
                {hasValidGeneratedImage ? (
                  <img
                    src={fixedImgSrc}
                    alt="AI-Regenerated Creative Full View"
                    className="w-full h-auto max-h-[520px] object-contain"
                    onError={() => {
                      setImgLoadError(true);
                    }}
                  />
                ) : (
                  <div className="p-8 text-center text-white space-y-2">
                    <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
                    <div className="text-xs font-bold">Generated Creative Unavailable</div>
                    <button
                      type="button"
                      onClick={onRegenerate}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'orig_only' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900">
                  Before: Original Uploaded Creative
                </span>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  Original Unedited Creative
                </span>
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[280px] max-h-[520px]">
                {origImgSrc ? (
                  <img
                    src={origImgSrc}
                    alt="Original Creative Full View"
                    className="w-full h-auto max-h-[520px] object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-400 p-8">Original image unavailable</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applied Corrections & Brand DNA / Regulatory Context Summary */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
        <div
          onClick={() => setShowAppliedDetails(prev => !prev)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs text-slate-900">
              Applied Audit Corrections ({appliedCorrections.length})
            </span>
            <span className="text-[11px] text-slate-500">
              · {autoFixResult.rejectedFindingsCount} rejected excluded
              {autoFixResult.brandDnaRulesAppliedCount
                ? ` · ${autoFixResult.brandDnaRulesAppliedCount} Brand DNA specs`
                : ''}
              {autoFixResult.regulatoryRulesAppliedCount
                ? ` · ${autoFixResult.regulatoryRulesAppliedCount} compliance rules`
                : ''}
            </span>
          </div>
          <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
            {showAppliedDetails ? 'Hide Details' : 'Show Details'}
          </span>
        </div>

        {showAppliedDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {appliedCorrections.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">
                    {item.ruleId || 'BRAND-CORRECTION'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Applied
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                    {item.originalSpan}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                    {item.suggestedFix}
                  </span>
                </div>
                {item.ruleTitle && (
                  <div className="text-[10px] text-slate-500 pt-0.5 truncate">
                    Rule: {item.ruleTitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automatic AI Re-Audit Results Section */}
      {hasValidGeneratedImage && (
        <div className="rounded-2xl border border-blue-200/90 bg-blue-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between cursor-pointer select-none">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>AI Re-Audit Verification Results</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Post-Generation Audit
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {secondAudit.auditNotes ||
                    'Evaluated through multimodal AI vision, OCR, and deterministic brand/regulatory rules immediately after generation.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleRunSecondAudit();
                }}
                disabled={isReauditing}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100/70 hover:bg-blue-100 text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="Re-run AI Re-Audit on the generated creative"
              >
                <RefreshCw className={`w-3 h-3 ${isReauditing ? 'animate-spin' : ''}`} />
                <span>{isReauditing ? 'Re-Auditing...' : 'AI Re-Audit'}</span>
              </button>
              <span
                onClick={() => setShowSecondAuditDetails(prev => !prev)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showSecondAuditDetails ? 'Collapse Audit' : 'Expand Audit'}
              </span>
            </div>
          </div>

          {reauditError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
              <span>{reauditError}</span>
              <button
                type="button"
                onClick={handleRunSecondAudit}
                className="font-bold text-rose-700 hover:underline cursor-pointer"
              >
                Retry Re-Audit
              </button>
            </div>
          )}

          {/* 4 Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Resolved Issues
              </span>
              <div className="text-lg font-black text-emerald-800 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{secondAudit.totalResolved}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Verified compliant</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Remaining Issues
              </span>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {secondAudit.totalRemaining}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {secondAudit.totalRemaining > 0 ? 'Needs attention / excluded' : 'None remaining'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                New Issues
              </span>
              <div
                className={`text-lg font-black mt-0.5 ${
                  secondAudit.totalNew > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {secondAudit.totalNew}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {secondAudit.totalNew === 0 ? '0 side-effects detected' : 'Requires attention'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Compliance Score
              </span>
              <div className="text-lg font-black text-blue-700 mt-0.5">
                {secondAudit.complianceScore}%
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Post-generation score</span>
            </div>
          </div>

          {/* Detailed Second Audit Findings Breakdown */}
          {showSecondAuditDetails && (
            <div className="space-y-3 pt-1">
              {secondAudit.resolvedIssues.length > 0 && (
                <div className="p-3.5 bg-white rounded-xl border border-emerald-100 space-y-2">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Resolved in Generated Creative:</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {secondAudit.resolvedIssues.map(r => (
                      <div
                        key={r.id}
                        className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg"
                      >
                        <span className="text-emerald-600 font-bold">✓</span>
                        <div>
                          <span className="font-semibold text-slate-900">
                            {r.ruleTitle || r.category}:
                          </span>{' '}
                          <span>{r.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {secondAudit.remainingIssues.length > 0 && (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Remaining Items:</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {secondAudit.remainingIssues.map(rem => (
                      <div key={rem.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 font-bold">•</span>
                        <div>
                          <span className="font-semibold text-slate-800">{rem.originalSpan}:</span>{' '}
                          <span>{rem.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {secondAudit.newIssues.length > 0 && (
                <div className="p-3.5 bg-white rounded-xl border border-rose-200 space-y-2">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Newly Detected in Generated Creative:</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-rose-800">
                    {secondAudit.newIssues.map(ni => (
                      <div key={ni.id} className="flex items-start gap-2 bg-rose-50 p-2 rounded-lg">
                        <span className="text-rose-600 font-bold">!</span>
                        <div>
                          <span className="font-semibold">{ni.originalSpan}:</span> {ni.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-500 italic bg-white/70 p-2.5 rounded-lg border border-slate-200/70">
                <strong>Human-in-the-Loop Governance:</strong> SkyNex AI requires explicit human authorization before publishing. Verify the Before/After comparison above and click <strong>Approve Creative</strong> to finalize.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Bar: Preview, Regenerate, Download Image, Approve Creative */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Generated via{' '}
          <span className="font-semibold text-slate-700">{autoFixResult.generationEngine}</span> ·{' '}
          {new Date(autoFixResult.generatedAt).toLocaleTimeString()}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Preview Modal Trigger */}
          {hasValidGeneratedImage && (
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Open full-screen preview modal"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Full Preview</span>
            </button>
          )}

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating || isApproving}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            title="Regenerate creative with AI image-generation model"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : 'text-slate-600'}`}
            />
            <span>{isRegenerating ? 'Regenerating your creative...' : 'Regenerate'}</span>
          </button>

          {/* Download Image Button */}
          <button
            type="button"
            onClick={onDownload}
            disabled={!hasValidGeneratedImage || isRegenerating}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            title="Download newly generated creative image"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Image</span>
          </button>

          {/* RBAC-Aware Creative Approval / Submission Actions */}
          {currentUser && !currentUser.permissions.canApproveCreatives ? (
            <button
              type="button"
              onClick={onSubmitForManagerApproval || onApprove}
              disabled={isApproved || isApproving || isRegenerating || !hasValidGeneratedImage}
              className="px-5 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              title="Content Creators cannot self-approve final creatives. Submit to Reviewer & Manager (Rohan Verma) for approval."
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>
                {isApproved
                  ? 'Approved by Manager'
                  : 'Submit Creative for Manager Approval'}
              </span>
            </button>
          ) : (
            <>
              {onRequestChanges && !isApproved && (
                <button
                  type="button"
                  onClick={onRequestChanges}
                  disabled={isApproving || isRegenerating}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Request Changes</span>
                </button>
              )}
              <button
                type="button"
                onClick={onApprove}
                disabled={isApproved || isApproving || isRegenerating || !hasValidGeneratedImage}
                className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isApproved
                    ? 'bg-emerald-600 text-white cursor-default opacity-90'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                }`}
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : isApproved ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-white" />
                )}
                <span>
                  {isApproving
                    ? 'Approving...'
                    : isApproved
                    ? 'Creative Approved'
                    : 'Approve Creative'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Fullscreen / Modal */}
      {isPreviewModalOpen && hasValidGeneratedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Full Preview: AI-Regenerated Creative
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-slate-950 flex items-center justify-center">
              <img
                src={fixedImgSrc}
                alt="AI-Regenerated Creative High Resolution"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
                onError={() => {
                  setImgLoadError(true);
                  setIsPreviewModalOpen(false);
                }}
              />
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>{appliedCorrections.length} brand & compliance corrections applied</span>
              <span>
                AI Re-Audit Score:{' '}
                <strong className="text-emerald-700">{secondAudit.complianceScore}%</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
