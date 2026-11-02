import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Lock,
  Mail,
  ArrowRight,
  ChevronRight,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  LogIn,
  Layers,
  Clock,
  Scale,
  Zap
} from 'lucide-react';
import {
  DEMO_CREDENTIALS,
  SkyNexAuthSession,
  loginWithDemoAccount,
  loginWithEmailCredentials,
  loginWithGoogleAccount
} from '../firebase.ts';

interface LoginPageProps {
  onLoginSuccess: (session: SkyNexAuthSession) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isLoggingInDemo, setIsLoggingInDemo] = useState<boolean>(false);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState<boolean>(false);
  const [copiedCredentials, setCopiedCredentials] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy full demo credentials & auto-fill the form
  const handleCopyCredentials = async () => {
    const textToCopy = `Email: ${DEMO_CREDENTIALS.email}\nPassword: ${DEMO_CREDENTIALS.password}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setAuthMode('signin');
    setErrorMsg(null);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  // Copy individual email or password field & auto-fill corresponding input
  const handleCopySingleField = async (field: 'email' | 'password', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // One-Click "Login as Demo" button
  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsLoggingInDemo(true);
    try {
      const session = await loginWithDemoAccount();
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo login encountered an issue. Please try again.');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  // Standard Email/Password Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmittingForm(true);
    try {
      const session = await loginWithEmailCredentials(
        cleanEmail,
        cleanPass,
        authMode === 'signup',
        displayName.trim() || undefined
      );
      onLoginSuccess(session);
    } catch (err: any) {
      const rawMsg = err?.message || 'Authentication failed';
      if (rawMsg.includes('auth/invalid-credential') || rawMsg.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password. To evaluate SkyNex AI, click "Login as Demo" or copy the demo credentials.');
      } else if (rawMsg.includes('auth/email-already-in-use')) {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else if (rawMsg.includes('auth/weak-password')) {
        setErrorMsg('Password should be at least 6 characters long.');
      } else {
        setErrorMsg(rawMsg);
      }
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingInGoogle(true);
    try {
      const session = await loginWithGoogleAccount();
      onLoginSuccess(session);
    } catch (err: any) {
      if (!String(err?.message || '').includes('popup-closed-by-user')) {
        setErrorMsg('Google popup sign-in was blocked or cancelled. You can use "Login as Demo" for immediate access.');
      }
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1F5FB] text-[#0B1528] font-sans antialiased flex flex-col justify-between relative overflow-y-auto">
      {/* Subtle Light-Blue Ambient Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-36 -left-36 w-[540px] h-[540px] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/4 -right-36 w-[500px] h-[500px] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[620px] h-[340px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      {/* Main Content Split Container */}
      <main className="relative z-10 flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* ================================================================= */}
          {/* LEFT COLUMN (8 COLS): REDESIGNED EVALUATOR DEMO ACCESS PANEL      */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-[28px] bg-white border border-[#DCE6F5] shadow-[0_18px_50px_rgba(15,23,42,0.06)] p-6 sm:p-8 lg:p-9 relative overflow-hidden">
            {/* Soft Top-Right Hero Radial Accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 w-[420px] h-[270px] bg-gradient-to-bl from-[#E3EFFF]/90 via-[#EDF5FF]/50 to-transparent rounded-bl-full"
            />

            <div className="relative z-10 space-y-6">
              {/* A. BRAND HEADER */}
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-3">
                  {/* SkyNex AI Blue Equalizer Logo Icon */}
                  <div className="w-11 h-11 rounded-[13px] bg-[#1868FF] flex items-center justify-center shadow-sm shadow-blue-600/25 shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                      <rect x="4.5" y="12" width="2.6" height="7" rx="1.3" fill="currentColor" />
                      <circle cx="5.8" cy="8.5" r="1.4" fill="currentColor" />
                      <rect x="9.2" y="8.5" width="2.6" height="10.5" rx="1.3" fill="currentColor" />
                      <circle cx="10.5" cy="5.2" r="1.4" fill="currentColor" />
                      <rect x="13.9" y="11" width="2.6" height="8" rx="1.3" fill="currentColor" />
                      <circle cx="15.2" cy="7.5" r="1.4" fill="currentColor" />
                      <rect x="18.5" y="6.5" width="2.6" height="12.5" rx="1.3" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[23px] font-extrabold tracking-tight text-[#0B1528]">
                    SkyNex AI
                  </span>
                </div>

                <div className="h-6 w-[1.5px] bg-slate-200 hidden sm:block mx-0.5" />

                <span className="px-3.5 py-1.5 rounded-lg bg-[#EBF3FF] border border-[#CFE2FF] text-[#0055FF] text-[11px] font-extrabold uppercase tracking-wider">
                  ENTERPRISE GOVERNANCE
                </span>
              </div>

              {/* B. HERO SECTION WITH AI DASHBOARD / LAPTOP ILLUSTRATION */}
              <div className="relative pb-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl space-y-2.5">
                  <h1 className="text-3xl sm:text-[38px] font-extrabold text-[#0B1528] tracking-tight leading-[1.12]">
                    Evaluator Demo Access
                  </h1>
                  <p className="text-[15px] text-[#3B4A64] leading-relaxed font-medium">
                    Explore SkyNex AI with prepopulated enterprise data and experience all features instantly — no registration required.
                  </p>
                </div>

                {/* Modern AI Dashboard / Laptop Illustration */}
                <div className="relative w-full md:w-[270px] h-[155px] shrink-0 flex items-center justify-center select-none">
                  <svg
                    viewBox="0 0 310 185"
                    className="w-full h-full max-w-[290px] overflow-visible"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="heroGlow" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="#DCEBFF" stopOpacity="0.95" />
                        <stop offset="70%" stopColor="#EBF3FF" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="screenBezel" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1E3A6D" />
                        <stop offset="100%" stopColor="#0F1E3D" />
                      </linearGradient>
                      <linearGradient id="laptopBase" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#CBD8EE" />
                        <stop offset="50%" stopColor="#E5EEFA" />
                        <stop offset="100%" stopColor="#B8C9E6" />
                      </linearGradient>
                      <linearGradient id="imgCardGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#CFE4FF" />
                        <stop offset="100%" stopColor="#9BC5FF" />
                      </linearGradient>
                    </defs>

                    {/* Soft Backdrop Cloud / Glow */}
                    <ellipse cx="170" cy="96" rx="128" ry="76" fill="url(#heroGlow)" />
                    <path
                      d="M42 152C38 124 62 104 92 106C106 72 152 60 184 78C214 58 266 74 274 114C292 124 294 146 276 156H42Z"
                      fill="#E3EEFF"
                      fillOpacity="0.65"
                    />

                    {/* Floating Sparkle Lines (Top-Left of Laptop) */}
                    <line
                      x1="54"
                      y1="38"
                      x2="40"
                      y2="24"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="69"
                      y1="28"
                      x2="64"
                      y2="11"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="44"
                      y1="52"
                      x2="26"
                      y2="48"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Angled Laptop Group */}
                    <g transform="skewX(-7) translate(18, 0)">
                      {/* Outer Laptop Screen Bezel */}
                      <rect
                        x="68"
                        y="26"
                        width="174"
                        height="118"
                        rx="12"
                        fill="url(#screenBezel)"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      {/* Inner Laptop Screen */}
                      <rect
                        x="74"
                        y="32"
                        width="162"
                        height="106"
                        rx="8"
                        fill="#F4F8FF"
                      />
                      {/* Top Browser Header Bar */}
                      <rect
                        x="74"
                        y="32"
                        width="162"
                        height="16"
                        rx="6"
                        fill="#E3EEFF"
                      />
                      <circle cx="84" cy="40" r="2.2" fill="#93B4E8" />
                      <circle cx="91" cy="40" r="2.2" fill="#93B4E8" />
                      <rect x="98" y="38" width="24" height="4" rx="2" fill="#B5CEF2" />

                      {/* Left Image Preview Card inside Screen */}
                      <rect
                        x="83"
                        y="56"
                        width="58"
                        height="68"
                        rx="7"
                        fill="#FFFFFF"
                        stroke="#DCE8FA"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="88"
                        y="61"
                        width="48"
                        height="48"
                        rx="5"
                        fill="url(#imgCardGrad)"
                      />
                      {/* Sun & Mountain Silhouette inside Image Card */}
                      <circle cx="101" cy="73" r="4.5" fill="#3B82F6" />
                      <path
                        d="M88 103L102 86L113 97L122 83L136 103V109H88V103Z"
                        fill="#2563EB"
                      />
                      <path
                        d="M106 103L119 85L136 103V109H106V103Z"
                        fill="#1D4ED8"
                      />

                      {/* Right Checkmark Row 1 */}
                      <rect
                        x="148"
                        y="56"
                        width="79"
                        height="30"
                        rx="7"
                        fill="#FFFFFF"
                        stroke="#E2ECF9"
                        strokeWidth="1.2"
                      />
                      <circle cx="161" cy="71" r="7.5" fill="#16A34A" />
                      <path
                        d="M157.5 71L160 73.5L164.8 68.5"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect x="174" y="65" width="44" height="5" rx="2.5" fill="#CEDDF2" />
                      <rect x="174" y="73" width="32" height="4.5" rx="2.2" fill="#E3ECF8" />

                      {/* Right Checkmark Row 2 */}
                      <rect
                        x="148"
                        y="94"
                        width="79"
                        height="30"
                        rx="7"
                        fill="#FFFFFF"
                        stroke="#E2ECF9"
                        strokeWidth="1.2"
                      />
                      <circle cx="161" cy="109" r="7.5" fill="#16A34A" />
                      <path
                        d="M157.5 109L160 111.5L164.8 106.5"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect x="174" y="103" width="44" height="5" rx="2.5" fill="#CEDDF2" />
                      <rect x="174" y="111" width="32" height="4.5" rx="2.2" fill="#E3ECF8" />
                    </g>

                    {/* Laptop Keyboard Base */}
                    <ellipse cx="155" cy="154" rx="118" ry="5" fill="#CBD9F0" fillOpacity="0.65" />
                    <path
                      d="M36 144H256C260 144 263 148 259 151H33C29 148 32 144 36 144Z"
                      fill="url(#laptopBase)"
                    />
                    <rect x="124" y="144" width="42" height="2.8" rx="1.4" fill="#94A8C9" />

                    {/* Overlapping Bottom-Right Circular Verified Badge */}
                    <g transform="translate(216, 114)">
                      <circle cx="26" cy="26" r="24" fill="#FFFFFF" />
                      <circle cx="26" cy="26" r="19.5" fill="#3B82F6" />
                      <path
                        d="M18.5 26.2L23.5 31.2L34 20.5"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </div>
              </div>

              {/* C. DEDICATED DEMO ACCOUNT SECTION */}
              <div className="rounded-2xl bg-[#F3F8FF] border border-[#DCE9FF] p-5 sm:p-6 space-y-4">
                {/* Header & Green "Ready to Use" Status Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5 text-[#0055FF]" strokeWidth={2.4} />
                    <h2 className="text-[18px] font-extrabold text-[#0B1528] tracking-tight">
                      Dedicated Demo Account
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F9E9] border border-[#AEE8BE] text-[#117A37] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] fill-[#16A34A] stroke-white" />
                    <span>Ready to Use</span>
                  </span>
                </div>

                {/* Email & Password Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Demo Email Box */}
                  <div className="bg-white rounded-xl border border-[#DCE6F5] px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="w-5 h-5 text-[#5A6B87] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#5A6B87]">
                          Demo Email
                        </div>
                        <div className="text-[16px] font-extrabold text-[#0B1528] tracking-tight truncate select-all">
                          {DEMO_CREDENTIALS.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySingleField('email', DEMO_CREDENTIALS.email)}
                      title="Copy demo email"
                      className="p-2 rounded-lg text-[#5A6B87] hover:text-[#0055FF] hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Demo Password Box */}
                  <div className="bg-white rounded-xl border border-[#DCE6F5] px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <Lock className="w-5 h-5 text-[#5A6B87] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#5A6B87]">
                          Demo Password
                        </div>
                        <div className="text-[16px] font-extrabold text-[#0B1528] tracking-tight truncate select-all">
                          {DEMO_CREDENTIALS.password}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySingleField('password', DEMO_CREDENTIALS.password)}
                      title="Copy demo password"
                      className="p-2 rounded-lg text-[#5A6B87] hover:text-[#0055FF] hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'password' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isLoggingInDemo || isSubmittingForm}
                    data-testid="login-as-demo-btn"
                    className="sm:col-span-7 h-12 px-6 rounded-xl bg-[#0055FF] hover:bg-[#0046D5] active:bg-[#003BB5] text-white font-bold text-[16px] shadow-md shadow-blue-600/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {isLoggingInDemo ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Authenticating Demo Account...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Login as Demo</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    data-testid="copy-credentials-btn"
                    className={`sm:col-span-5 h-12 px-5 rounded-xl border font-bold text-[15px] flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                      copiedCredentials
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white hover:bg-slate-50 border-[#8FA0BA] text-[#0B1528]'
                    }`}
                  >
                    {copiedCredentials ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Copied Credentials!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#3B4A64]" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* D. FEATURES OF SKYNEX AI */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1.5px] flex-1 bg-[#D8E2F0]" />
                  <h2 className="text-[20px] font-extrabold text-[#0B1528] tracking-tight shrink-0">
                    Features of SkyNex AI
                  </h2>
                  <div className="h-[1.5px] flex-1 bg-[#D8E2F0]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {/* Feature 1 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-blue-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#EBF4FF] text-[#0066FF] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        Brand DNA &amp; Website Rules
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        Extract brand guidelines and rules from any website URL.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-purple-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#F3EEFF] text-[#6E3AFF] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        Audit Findings &amp; Suggestions
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        Detect content issues with clear, actionable suggestions.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-violet-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#F3EFFE] text-[#6938EF] flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        Sample Marketing Creatives
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        Explore ready ad/ poster creatives with audit and re-generation.
                      </p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-amber-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#FFF4E5] text-[#EA7600] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        Content Audit History
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        View past audits, findings, and improvement tracking.
                      </p>
                    </div>
                  </div>

                  {/* Feature 5 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-emerald-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#E6F9EE] text-[#129A48] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        Enterprise Brand Profiles
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        Manage multiple brands with rules, assets, and catalogs.
                      </p>
                    </div>
                  </div>

                  {/* Feature 6 */}
                  <div className="rounded-2xl bg-white border border-[#E2EAF4] p-4 flex items-start gap-3.5 shadow-2xs hover:border-rose-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-[#FFEBEF] text-[#E11D48] flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-extrabold text-[#0B1528] leading-snug">
                        7-Dept Regulatory Compliance
                      </h3>
                      <p className="text-xs text-[#4A5A75] mt-1 leading-relaxed">
                        Auto-extract regulations, map rules, and flag violations across departments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* E. BOTTOM CALLOUT BANNER */}
            <div className="relative z-10 mt-6 rounded-xl bg-[#EBF3FF] border border-[#D4E4FF] py-3.5 px-4 flex items-center justify-center gap-2.5 text-center">
              <Zap className="w-5 h-5 text-[#0055FF] shrink-0" />
              <span className="text-[14px] sm:text-[15px] font-extrabold text-[#0050E6]">
                Instantly explore the complete SkyNex AI experience with real demo data.
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN (4 COLS): STANDARD FIREBASE LOGIN / SIGN UP FORM     */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-[28px] bg-white text-[#0B1528] border border-[#DCE6F5] shadow-[0_18px_50px_rgba(15,23,42,0.06)] p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0055FF]">
                    Workspace Login
                  </span>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        authMode === 'signin'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        authMode === 'signup'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-[#0B1528] mt-3 tracking-tight">
                  {authMode === 'signin' ? 'Sign in to SkyNex AI' : 'Create Workspace Account'}
                </h2>
                <p className="text-xs text-[#5A6B87] mt-1 leading-relaxed">
                  {authMode === 'signin'
                    ? 'Sign in with your account credentials or use the Evaluator Demo Access panel.'
                    : 'Register a dedicated account with isolated production workspace storage.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#0B1528] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g., Priya Sharma"
                      className="w-full h-11 px-3.5 text-sm bg-[#F8FAFC] focus:bg-white border border-[#DCE6F5] rounded-xl text-[#0B1528] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#0B1528] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5A6B87] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="demo@skynex.ai"
                      className="w-full h-11 pl-10 pr-3.5 text-sm bg-[#F8FAFC] focus:bg-white border border-[#DCE6F5] rounded-xl text-[#0B1528] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#0B1528]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="text-[11px] font-bold text-[#0055FF] hover:text-[#0046D5] cursor-pointer"
                    >
                      Auto-fill demo credentials
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5A6B87] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full h-11 pl-10 pr-10 text-sm bg-[#F8FAFC] focus:bg-white border border-[#DCE6F5] rounded-xl text-[#0B1528] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingForm || isLoggingInDemo}
                  className="w-full h-11 rounded-xl bg-[#0B1528] hover:bg-[#162442] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Create Account & Continue' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">
                  Or continue with
                </span>
                <div className="grow border-t border-slate-200" />
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingInGoogle || isLoggingInDemo}
                  className="w-full h-11 rounded-xl bg-white hover:bg-slate-50 border border-[#DCE6F5] text-[#0B1528] font-bold text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                >
                  {isLoggingInGoogle ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Quick 1-Click Demo Button inside Right Form too */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoggingInDemo || isSubmittingForm}
                  className="w-full h-11 rounded-xl bg-[#EBF3FF] hover:bg-[#DCE9FF] border border-[#CFE2FF] text-[#0055FF] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#0055FF]" />
                  <span>Instant 1-Click Demo Login</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-[#5A6B87] flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Firebase Auth &amp; Isolated Demo Sandbox</span>
              </span>
              <span className="font-semibold text-[#0055FF]">Zero Admin Keys</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
