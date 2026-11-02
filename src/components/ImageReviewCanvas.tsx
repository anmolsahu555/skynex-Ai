import React, { useState } from 'react';
import {
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Copy,
  ChevronDown,
  ChevronUp,
  Palette,
  Eye,
  Maximize2,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { AuditReport, AuditFinding, BoundingBox } from '../types.ts';

interface ImageReviewCanvasProps {
  report: AuditReport;
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string) => void;
  hoveredFindingId: string | null;
  onHoverFinding: (findingId: string | null) => void;
}

export default function ImageReviewCanvas({
  report,
  selectedFindingId,
  onSelectFinding,
  hoveredFindingId,
  onHoverFinding
}: ImageReviewCanvasProps) {
  const [isExtractedTextExpanded, setIsExtractedTextExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleCopyExtractedText = () => {
    if (!report.extractedImageText) return;
    navigator.clipboard?.writeText(report.extractedImageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const findingsWithBoxes = report.findings.filter(f => f.boundingBox);
  const visualSummary = report.visualSummary;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#10243A]">
                Advertisement Image Preview
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold uppercase">
                {report.imageMetadata?.format || 'PNG'}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Interactive visual overlay · Click any bounding box to inspect finding
            </p>
          </div>
        </div>

        {report.imageMetadata && (
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
            {report.imageMetadata.width && report.imageMetadata.height && (
              <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 font-medium">
                {report.imageMetadata.width} × {report.imageMetadata.height} px
              </span>
            )}
            <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 font-medium">
              {(report.imageMetadata.sizeBytes / 1024).toFixed(1)} KB
            </span>
          </div>
        )}
      </div>

      {/* Interactive Image Container with Bounding Boxes */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center group select-none">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-auto max-h-[460px] object-contain block mx-auto"
          />
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span>Image asset not available</span>
          </div>
        )}

        {/* Dynamic Bounding Box Overlays */}
        {findingsWithBoxes.map((finding, idx) => {
          const box = finding.boundingBox as BoundingBox;
          const isSelected = selectedFindingId === finding.id;
          const isHovered = hoveredFindingId === finding.id;
          const isConflict =
            finding.classification === 'confirmed_rule_conflict' ||
            finding.classification === 'approved_fact_conflict' ||
            finding.classification === 'prohibited_claim';
          const isVerification =
            finding.classification === 'unsupported_claim' ||
            finding.classification === 'needs_human_verification';

          let borderStyle = 'border-blue-400 bg-blue-500/15 text-blue-100';
          let badgeBg = 'bg-blue-600 text-white';
          if (isConflict) {
            borderStyle = 'border-red-500 bg-red-500/20 text-red-100';
            badgeBg = 'bg-red-600 text-white';
          } else if (isVerification) {
            borderStyle = 'border-amber-400 bg-amber-500/20 text-amber-100';
            badgeBg = 'bg-amber-600 text-white';
          }

          return (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding.id)}
              onMouseEnter={() => onHoverFinding(finding.id)}
              onMouseLeave={() => onHoverFinding(null)}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`
              }}
              title={`${finding.ruleId || 'Issue'}: ${finding.conflictText}`}
              className={`absolute cursor-pointer border-2 rounded transition-all duration-150 z-20 ${borderStyle} ${
                isSelected
                  ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 border-white shadow-2xl scale-[1.02]'
                  : isHovered
                  ? 'ring-2 ring-white border-white scale-[1.01]'
                  : 'hover:border-white'
              }`}
            >
              {/* Box Tag Label */}
              <div
                className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md flex items-center gap-1 ${badgeBg}`}
              >
                <span>{finding.ruleId || `ISSUE-${idx + 1}`}</span>
                {finding.targetType === 'visual_element' && (
                  <Palette className="w-2.5 h-2.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Brand Consistency Summary Card */}
      <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            Visual Brand Inspection Summary
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              report.visualAnalysisStatus === 'complete'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : report.visualAnalysisStatus === 'incomplete'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {report.visualAnalysisStatus === 'complete'
              ? 'Visual Inspection: Complete'
              : report.visualAnalysisStatus === 'incomplete'
              ? 'Visual Inspection: Incomplete (Outage Test)'
              : 'Visual Inspection: OCR Only'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Logo Status */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Logo & Lockup
            </div>
            <div className="font-semibold text-[#10243A] flex items-center gap-1.5 text-xs">
              {visualSummary?.logoMatchesApproved !== false ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Approved Lockup</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate text-amber-900 font-bold">Unapproved Variant</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {visualSummary?.detectedLogoVariant || 'Standard horizontal logo'}
            </div>
          </div>

          {/* Color Palette Status */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Brand Palette
            </div>
            <div className="font-semibold text-[#10243A] flex items-center gap-1.5 text-xs">
              {visualSummary?.colorPaletteCompliant !== false ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Approved Colors</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-900 font-bold">Palette Departure</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {(visualSummary?.detectedColors || ['#0F172A', '#0284C7']).slice(0, 4).map((hex, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: hex }}
                  title={hex}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                />
              ))}
            </div>
          </div>

          {/* Legibility & Contrast */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Legibility & Contrast
            </div>
            <div className="font-semibold text-[#10243A] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Legible Disclaimers</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {visualSummary?.accessibilityNotes || 'Meets WCAG readability standards'}
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Text Drawer / Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setIsExtractedTextExpanded(!isExtractedTextExpanded)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-[#10243A] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Extracted Advertisement Text (OCR & Multimodal AI)</span>
            <span className="text-[10px] font-mono font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {report.extractedImageText?.length || 0} chars
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blue-600 font-medium">
              {isExtractedTextExpanded ? 'Collapse' : 'Expand Text'}
            </span>
            {isExtractedTextExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {isExtractedTextExpanded && (
          <div className="p-3 bg-slate-50/70 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Text identified from visual advertisement copy:</span>
              <button
                type="button"
                onClick={handleCopyExtractedText}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-[#10243A] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {report.extractedImageText || 'No readable text identified.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
