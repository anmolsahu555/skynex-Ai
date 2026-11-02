import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AuditFinding } from '../types.ts';

interface AutoFixCreativePanelProps {
  findings: AuditFinding[];
  isGenerating: boolean;
  onGenerate: () => void;
  hasGeneratedResult: boolean;
  onScrollToResult?: () => void;
}

export default function AutoFixCreativePanel({
  findings,
  isGenerating,
  onGenerate,
  hasGeneratedResult,
  onScrollToResult
}: AutoFixCreativePanelProps) {
  const acceptedCount = findings.filter(f => f.decision === 'accepted').length;
  const rejectedCount = findings.filter(f => f.decision === 'rejected').length;
  const pendingCount = findings.filter(f => f.decision === 'pending' || !f.decision).length;

  const canGenerate = acceptedCount > 0 && !isGenerating;

  return (
    <div className="w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Auto-Fix Creative</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Regenerate & Approve
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Automatically apply accepted corrections to regenerate a compliant creative while preserving original layout, composition, and visual style.
            </p>
          </div>
        </div>
      </div>

      {/* Correction Summary Counters (Accepted, Rejected, Pending) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Accepted Badge */}
        <div className={`p-3 rounded-xl border text-center transition-all ${
          acceptedCount > 0
            ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
            : 'bg-slate-50 border-slate-200/80 text-slate-600'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Accepted</span>
          </div>
          <div className="text-base font-extrabold text-emerald-800 mt-0.5">
            {acceptedCount}
          </div>
        </div>

        {/* Rejected Badge */}
        <div className={`p-2 rounded-xl border text-center transition-all ${
          rejectedCount > 0
            ? 'bg-slate-100 border-slate-300 text-slate-700'
            : 'bg-slate-50 border-slate-200/80 text-slate-500'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-center gap-1">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Rejected</span>
          </div>
          <div className="text-base font-extrabold text-slate-700 mt-0.5">
            {rejectedCount}
          </div>
        </div>

        {/* Pending Badge */}
        <div className={`p-2 rounded-xl border text-center transition-all ${
          pendingCount > 0
            ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
            : 'bg-slate-50 border-slate-200/80 text-slate-500'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="text-base font-extrabold text-amber-800 mt-0.5">
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Helper message when 0 accepted */}
      {acceptedCount === 0 && (
        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Accept at least one correction above to generate an auto-fixed creative.
          </span>
        </div>
      )}

      {/* Prominent Action Button: Generate Corrected Image */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
          canGenerate
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
        }`}
        title={
          canGenerate
            ? `Generate auto-fixed creative applying ${acceptedCount} accepted correction${acceptedCount === 1 ? '' : 's'}`
            : 'Accept at least one correction above to generate'
        }
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Applying corrections & generating creative...</span>
          </>
        ) : (
          <>
            <Sparkles className={`w-4 h-4 ${canGenerate ? 'text-cyan-300' : 'text-slate-400'}`} />
            <span>✨ Generate Corrected Image ({acceptedCount})</span>
          </>
        )}
      </button>

      {/* Link to view generated creative if already generated */}
      {hasGeneratedResult && onScrollToResult && (
        <button
          type="button"
          onClick={onScrollToResult}
          className="w-full text-center text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1 pt-1 cursor-pointer"
        >
          <span>View Generated Creative & Second Audit</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
