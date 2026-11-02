import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Scan
} from 'lucide-react';
import { BrandProfile } from '../types.ts';

interface ImageUploadWorkspaceProps {
  brand: BrandProfile;
  uploadedImagePreview: string | null;
  uploadedImageName: string | null;
  uploadedImageSize: number | null;
  uploadedImageDims: { width: number; height: number } | null;
  imageReviewError: string | null;
  isAnalyzing: boolean;
  enableGemini: boolean;
  simulateAiFailure: boolean;
  onFileSelect: (file: File) => void;
  onClearImage: () => void;
  onSubmitReview: () => void;
  onToggleSimulateOutage: (enabled: boolean) => void;
}

export default function ImageUploadWorkspace({
  brand,
  uploadedImagePreview,
  uploadedImageName,
  uploadedImageSize,
  uploadedImageDims,
  imageReviewError,
  isAnalyzing,
  simulateAiFailure,
  onFileSelect,
  onClearImage,
  onSubmitReview,
  onToggleSimulateOutage
}: ImageUploadWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!brand) {
    return (
      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-500 font-semibold">Please select or create a brand workspace to review advertisement images.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone OR Active Image Preview */}
      {!uploadedImagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10'
              : 'border-[#CBD5E1] hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-[#10243A]">
            Upload Advertisement Graphic or Creative
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            Drag and drop your marketing creative here, or click to browse. SkyNex AI extracts visible copy and inspects logos, colors, and layout against <strong>{brand.name}</strong> approved rules.
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">PNG</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">JPG/JPEG</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">WebP</span>
            <span className="text-slate-400">· Max 10 MB</span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <FileImage className="w-3.5 h-3.5 text-blue-400" />
              <span>Browse Image Files</span>
            </button>
          </div>
        </div>
      ) : (
        /* Image Loaded Preview Card */
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={uploadedImagePreview}
                  alt="Advertisement Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#10243A]">
                    {uploadedImageName || 'advertisement.png'}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Image Decoded
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                  {uploadedImageDims ? `${uploadedImageDims.width} × ${uploadedImageDims.height} px` : 'Auto-detected'} · {formatFileSize(uploadedImageSize)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Replace Image
              </button>
              <button
                type="button"
                onClick={onClearImage}
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Large Image Preview with Aspect Fit */}
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-[340px]">
            <img
              src={uploadedImagePreview}
              alt="Advertisement Preview Full"
              className="max-h-[340px] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Honest Error Message Display */}
      {imageReviewError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Image Validation or Processing Error:</span>
            <p className="text-red-800 leading-relaxed">{imageReviewError}</p>
            <p className="text-[11px] text-slate-600">
              Only standard PNG, JPG, or WebP images up to 10MB are supported. Corrupt files or unsupported formats are rejected.
            </p>
          </div>
        </div>
      )}

      {/* 3. Review Engine Options & Execute Bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569]">
          <span className="font-semibold text-slate-700">Audit Pipeline:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[10px]">
            <Scan className="w-3 h-3 text-blue-600" />
            Tesseract Local OCR + Multimodal Vision
          </span>

          <label
            className="flex items-center gap-1.5 cursor-pointer text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
            title="Quality Test 10: When enabled, simulates an external AI service outage. Deterministic rule checks continue running against OCR extracted text, and visual review is marked incomplete."
          >
            <input
              type="checkbox"
              checked={simulateAiFailure}
              onChange={e => onToggleSimulateOutage(e.target.checked)}
              className="rounded border-amber-400 text-amber-700"
            />
            <span className="text-[11px] font-semibold">Simulate AI Outage (Test Fallback)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {uploadedImagePreview && (
            <button
              type="button"
              onClick={onClearImage}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onSubmitReview}
            disabled={isAnalyzing || !uploadedImagePreview}
            className="px-5 py-2 text-xs font-bold text-white bg-[#10243A] hover:bg-slate-800 disabled:bg-slate-400 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Auditing Advertisement Graphic...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Review Advertisement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
