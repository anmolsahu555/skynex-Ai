import React, { useState, useRef } from 'react';
import {
  Building2,
  X,
  UploadCloud,
  Link as LinkIcon,
  Plus,
  FileText,
  Loader2,
  Trash2,
  Check,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { BrandProfile } from '../types.ts';

interface AddNewBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandCreated: (newBrand: BrandProfile, allBrands: Record<string, BrandProfile>) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

const INDUSTRY_OPTIONS = [
  'Fintech & Payment Processing',
  'SaaS & Cloud Infrastructure',
  'Healthcare & Life Sciences',
  'E-Commerce & Retail',
  'Consumer Electronics & Hardware',
  'Media & Entertainment',
  'Education & EdTech',
  'Cybersecurity & IT',
  'CleanTech & Energy',
  'General Enterprise'
];

interface UploadedAssetItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function AddNewBrandModal({
  isOpen,
  onClose,
  onBrandCreated,
  triggerToast
}: AddNewBrandModalProps) {
  // Form State
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('Fintech & Payment Processing');
  const [tagline, setTagline] = useState('');

  // Logo State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const [logoFileSize, setLogoFileSize] = useState<number | null>(null);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isLogoDragOver, setIsLogoDragOver] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Palette State
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#06B6D4');
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [moreColors, setMoreColors] = useState<string[]>(['#10B981', '#F59E0B', '#EF4444']);

  // Assets State
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAssetItem[]>([]);
  const [isAssetDragOver, setIsAssetDragOver] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // Initial Rules State
  const [seedRules, setSeedRules] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validation helper
  const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());

  // Handle Logo Upload
  const handleProcessLogoFile = (file: File) => {
    setLogoError(null);
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const isSvgExt = file.name.toLowerCase().endsWith('.svg');
    if (!validExtensions.includes(file.type) && !isSvgExt) {
      setLogoError('Unsupported format. Please upload PNG, JPG, or SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('Logo file size exceeds 5 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setLogoFilename(file.name);
      setLogoFileSize(file.size);
      setIsUrlInputOpen(false);
    };
    reader.onerror = () => {
      setLogoError('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    const trimmed = logoUrlInput.trim();
    if (!trimmed) {
      setLogoError('Enter a valid image URL first.');
      return;
    }
    setLogoError(null);
    setLogoPreview(trimmed);
    setLogoFilename(trimmed.split('/').pop() || 'Remote Logo');
    setLogoFileSize(null);
    setIsUrlInputOpen(false);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFilename(null);
    setLogoFileSize(null);
    setLogoUrlInput('');
    setLogoError(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  // Handle Brand Assets Upload
  const handleProcessAssetFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadedAssetItem[] = [];

    Array.from(files).forEach((file, idx) => {
      if (file.size > 10 * 1024 * 1024) {
        triggerToast(`"${file.name}" exceeds 10 MB limit and was skipped.`, 'error');
        return;
      }
      newItems.push({
        id: `ast-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file'
      });
    });

    if (newItems.length > 0) {
      setUploadedAssets(prev => [...prev, ...newItems]);
      triggerToast(`Added ${newItems.length} brand asset(s).`, 'info');
    }
    if (assetFileInputRef.current) assetFileInputRef.current.value = '';
  };

  const handleRemoveAsset = (id: string) => {
    setUploadedAssets(prev => prev.filter(a => a.id !== id));
  };

  // Color Management Helpers
  const handleAddMoreColor = () => {
    const paletteCandidates = ['#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#14B8A6'];
    const nextColor = paletteCandidates.find(c => !moreColors.includes(c) && c !== primaryColor) || '#3B82F6';
    setMoreColors(prev => [...prev, nextColor]);
  };

  const handleUpdateMoreColor = (index: number, value: string) => {
    setMoreColors(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveMoreColor = (index: number) => {
    setMoreColors(prev => prev.filter((_, i) => i !== index));
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setErrorMessage('Brand name is required.');
      return;
    }
    if (!isValidHex(primaryColor)) {
      setErrorMessage('Please provide a valid HEX code for the primary color (e.g. #2563EB).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: brandName.trim(),
        industry,
        tagline: tagline.trim() || undefined,
        description: `${brandName.trim()} brand governance workspace.`,
        primaryColor: primaryColor.trim().toUpperCase(),
        secondaryColor: secondaryColor && isValidHex(secondaryColor) ? secondaryColor.trim().toUpperCase() : undefined,
        accentColor: accentColor && isValidHex(accentColor) ? accentColor.trim().toUpperCase() : undefined,
        moreColors: moreColors.filter(isValidHex).map(c => c.trim().toUpperCase()),
        logoUrl: logoPreview || undefined,
        logoName: logoFilename || undefined,
        assets: uploadedAssets.map(a => ({
          id: a.id,
          name: a.name,
          size: a.size,
          type: a.type,
          uploadedAt: new Date().toISOString()
        })),
        seedDefaultRules: seedRules
      };

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create brand profile.');
      }

      triggerToast(`Created brand "${data.brand.name}" and activated workspace!`, 'success');
      onBrandCreated(data.brand, data.brands);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create brand profile.');
      triggerToast(`Error: ${err?.message || 'Server error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = brandName.trim().length > 0 && isValidHex(primaryColor);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* 1. MODAL HEADER                                           */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-snug">
                Add New Brand Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a dedicated brand governance workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. MODAL FORM BODY (Scrollable)                          */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-800">
          
          {/* STEP 1: Brand Details */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Brand Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Basic information about your brand.</p>
              </div>
            </div>

            <div className="space-y-3 pl-8.5">
              {/* Brand Name */}
              <div>
                <label htmlFor="brand-name-input" className="block text-xs font-semibold text-slate-800 mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="brand-name-input"
                  type="text"
                  required
                  autoFocus
                  value={brandName}
                  onChange={e => {
                    setBrandName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. ApexPay, CloudSphere, BioHealth"
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Industry & Tagline Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="brand-industry-select" className="block text-xs font-semibold text-slate-800 mb-1">
                    Industry / Domain <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="brand-industry-select"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    {INDUSTRY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="brand-tagline-input" className="block text-xs font-semibold text-slate-800 mb-1">
                    Tagline or Purpose
                  </label>
                  <input
                    id="brand-tagline-input"
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="e.g. Next-Gen Enterprise Data Platform"
                    className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* STEP 2: Brand Logo */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Brand Logo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your brand logo to help AI understand your visual identity.
                </p>
              </div>
            </div>

            <div className="pl-8.5">
              {!logoPreview ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Drag-and-drop Upload Area */}
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsLogoDragOver(true);
                    }}
                    onDragLeave={e => {
                      e.preventDefault();
                      setIsLogoDragOver(false);
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      setIsLogoDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleProcessLogoFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => logoFileInputRef.current?.click()}
                    className={`flex-1 border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isLogoDragOver
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleProcessLogoFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-slate-800">Upload Logo</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or SVG (Max 5MB)</p>
                  </div>

                  <div className="text-center text-xs font-medium text-slate-400 self-center px-1">or</div>

                  {/* Use from URL Option */}
                  <div className="sm:w-52 flex flex-col justify-center">
                    {!isUrlInputOpen ? (
                      <button
                        type="button"
                        onClick={() => setIsUrlInputOpen(true)}
                        className="h-14 sm:h-20 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-slate-500" />
                        <span>Use from URL</span>
                      </button>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <input
                          type="url"
                          value={logoUrlInput}
                          onChange={e => setLogoUrlInput(e.target.value)}
                          placeholder="https://.../logo.png"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsUrlInputOpen(false)}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyLogoUrl}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Uploaded Logo Preview Card */
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={logoPreview}
                        alt="Brand Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate">
                        {logoFilename || 'Brand Logo'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {logoFileSize ? formatBytes(logoFileSize) : 'Remote Vector / URL'} · Ready
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Replace
                    </button>
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleProcessLogoFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {logoError && (
                <div className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{logoError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* STEP 3: Brand Color Palette */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Brand Color Palette</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define your brand colors to ensure visual consistency across all content.
                </p>
              </div>
            </div>

            <div className="space-y-3 pl-8.5">
              {/* Primary, Secondary, Accent Triad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Primary Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Primary Color <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <label className="w-7 h-7 rounded-lg cursor-pointer shrink-0 border border-slate-200 shadow-2xs overflow-hidden relative" style={{ backgroundColor: primaryColor }}>
                      <input
                        type="color"
                        value={isValidHex(primaryColor) ? primaryColor : '#2563EB'}
                        onChange={e => setPrimaryColor(e.target.value.toUpperCase())}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value.toUpperCase())}
                      placeholder="#2563EB"
                      className="w-full font-mono text-xs uppercase text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <label className="w-7 h-7 rounded-lg cursor-pointer shrink-0 border border-slate-200 shadow-2xs overflow-hidden relative" style={{ backgroundColor: secondaryColor || '#06B6D4' }}>
                      <input
                        type="color"
                        value={isValidHex(secondaryColor) ? secondaryColor : '#06B6D4'}
                        onChange={e => setSecondaryColor(e.target.value.toUpperCase())}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value.toUpperCase())}
                      placeholder="#06B6D4"
                      className="w-full font-mono text-xs uppercase text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <label className="w-7 h-7 rounded-lg cursor-pointer shrink-0 border border-slate-200 shadow-2xs overflow-hidden relative" style={{ backgroundColor: accentColor || '#8B5CF6' }}>
                      <input
                        type="color"
                        value={isValidHex(accentColor) ? accentColor : '#8B5CF6'}
                        onChange={e => setAccentColor(e.target.value.toUpperCase())}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value.toUpperCase())}
                      placeholder="#8B5CF6"
                      className="w-full font-mono text-xs uppercase text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* More Colors (Optional) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    More Colors <span className="text-slate-400 font-normal">(Optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMoreColor}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color</span>
                  </button>
                </div>

                {moreColors.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {moreColors.map((hex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl focus-within:ring-1 focus-within:ring-blue-500 transition-all"
                      >
                        <label
                          className="w-6 h-6 rounded-md cursor-pointer shrink-0 border border-slate-200 shadow-2xs relative"
                          style={{ backgroundColor: isValidHex(hex) ? hex : '#94A3B8' }}
                        >
                          <input
                            type="color"
                            value={isValidHex(hex) ? hex : '#10B981'}
                            onChange={e => handleUpdateMoreColor(idx, e.target.value.toUpperCase())}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <input
                          type="text"
                          maxLength={7}
                          value={hex}
                          onChange={e => handleUpdateMoreColor(idx, e.target.value.toUpperCase())}
                          placeholder="#10B981"
                          className="w-full font-mono text-[11px] uppercase text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMoreColor(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Remove color"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* STEP 4: Brand Assets (Optional) */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Brand Assets <span className="text-slate-400 font-normal">(Optional)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload brand guidelines, fonts or product images for better analysis.
                </p>
              </div>
            </div>

            <div className="space-y-3 pl-8.5">
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsAssetDragOver(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  setIsAssetDragOver(false);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setIsAssetDragOver(false);
                  handleProcessAssetFiles(e.dataTransfer.files);
                }}
                className={`border border-dashed rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isAssetDragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">Drag & drop files here</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload brand guidelines (PDF), fonts, product images, etc.
                    </p>
                    <p className="text-[10px] text-slate-400">Max 10MB per file</p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <input
                    ref={assetFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.svg,.woff,.woff2,.ttf"
                    onChange={e => handleProcessAssetFiles(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => assetFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>

              {/* Uploaded Assets List */}
              {uploadedAssets.length > 0 && (
                <div className="space-y-1.5">
                  {uploadedAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{asset.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          ({formatBytes(asset.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remove asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* STEP 5: Initial Brand Rules */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                5
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Initial Brand Rules</h3>
              </div>
            </div>

            <div className="pl-8.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={seedRules}
                  onChange={e => setSeedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900">
                    Seed with standard brand rules
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Automatically generates initial rules for official name usage, brand color standard, typography, tone of voice, and prohibited content.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>

        {/* ========================================================= */}
        {/* 3. MODAL FOOTER                                           */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Brand...</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Create & Activate Brand</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
