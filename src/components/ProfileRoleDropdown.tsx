import React, { useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  ShieldCheck,
  Lock,
  LogOut,
  MapPin,
  Building2,
  Mail,
  Users,
  Sliders,
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { UserProfile } from '../types.ts';
import type { SkyNexAuthSession } from '../firebase.ts';

interface ProfileRoleDropdownProps {
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  authSession: SkyNexAuthSession | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onSelectRole: (profile: UserProfile) => void;
  onOpenWorkspaceAdmin: () => void;
  onSignOut: () => void;
}

export default function ProfileRoleDropdown({
  currentUser,
  userProfiles,
  authSession,
  isOpen,
  onToggleOpen,
  onClose,
  onSelectRole,
  onOpenWorkspaceAdmin,
  onSignOut
}: ProfileRoleDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const roleAccentStyles: Record<
    UserProfile['role'],
    {
      pillBg: string;
      pillText: string;
      pillBorder: string;
      dotColor: string;
      activeCardBorder: string;
      activeCardBg: string;
    }
  > = {
    workspace_admin: {
      pillBg: 'bg-indigo-50',
      pillText: 'text-indigo-700',
      pillBorder: 'border-indigo-200',
      dotColor: 'bg-indigo-600',
      activeCardBorder: 'border-indigo-500 ring-2 ring-indigo-500/15',
      activeCardBg: 'bg-indigo-50/50'
    },
    reviewer_manager: {
      pillBg: 'bg-emerald-50',
      pillText: 'text-emerald-700',
      pillBorder: 'border-emerald-200',
      dotColor: 'bg-emerald-600',
      activeCardBorder: 'border-emerald-500 ring-2 ring-emerald-500/15',
      activeCardBg: 'bg-emerald-50/50'
    },
    content_creator: {
      pillBg: 'bg-blue-50',
      pillText: 'text-blue-700',
      pillBorder: 'border-blue-200',
      dotColor: 'bg-blue-600',
      activeCardBorder: 'border-blue-500 ring-2 ring-blue-500/15',
      activeCardBg: 'bg-blue-50/50'
    }
  };

  const activeStyle = roleAccentStyles[currentUser.role] || roleAccentStyles.workspace_admin;

  const permissionSummaryItems = [
    {
      label: 'Upload Content & Run AI Audits',
      allowed: currentUser.permissions.canUploadContent && currentUser.permissions.canRunAiAudits
    },
    {
      label: 'Accept / Reject Audit Findings',
      allowed: currentUser.permissions.canAcceptRejectFindings
    },
    {
      label: 'Approve / Reject Final Creatives',
      allowed: currentUser.permissions.canApproveCreatives
    },
    {
      label: 'Manage Brand DNA, Catalog & Gov Rules',
      allowed:
        currentUser.permissions.canManageBrandDna &&
        currentUser.permissions.canManageProductCatalog &&
        currentUser.permissions.canManageRegulatoryRules
    },
    {
      label: 'Manage Users, Roles & Workspace Settings',
      allowed:
        currentUser.permissions.canInviteRemoveUsers &&
        currentUser.permissions.canAssignUserRoles &&
        currentUser.permissions.canManageWorkspaceSettings
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top-Right Profile Trigger Button */}
      <button
        type="button"
        data-testid="profile-role-dropdown-trigger"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:border-blue-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all cursor-pointer"
        title={`Active Prototype Account: ${currentUser.name} (${currentUser.roleLabel}) — Click to switch RBAC role`}
      >
        <div
          className={`w-8 h-8 rounded-lg ${currentUser.avatarColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
        >
          {currentUser.initials}
        </div>
        <div className="text-left hidden sm:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 leading-tight truncate">
              {currentUser.name}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${activeStyle.pillBg} ${activeStyle.pillText} ${activeStyle.pillBorder}`}
            >
              {currentUser.roleLabel}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
            {currentUser.department} · {currentUser.location}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          data-testid="profile-role-dropdown-menu"
          className="absolute right-0 mt-2 w-[380px] sm:w-[410px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* 1. ACTIVE PROTOTYPE ACCOUNT HEADER */}
          <div className="p-4 bg-gradient-to-br from-slate-900 via-[#0F1E36] to-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                  ACTIVE PROTOTYPE ACCOUNT
                </span>
              </div>
              {authSession?.isDemo && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  RBAC Live Sandbox
                </span>
              )}
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl ${currentUser.avatarColor} border border-white/20 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md`}
              >
                {currentUser.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{currentUser.name}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/15 text-white border border-white/20 shrink-0">
                    {currentUser.roleLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{currentUser.department}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{currentUser.location}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ACTIVE ROLE CAPABILITIES MATRIX SUMMARY */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Active Role Permissions ({currentUser.roleLabel})
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {permissionSummaryItems.filter(i => i.allowed).length}/{permissionSummaryItems.length} Enabled
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {permissionSummaryItems.map(item => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-[11px] py-0.5"
                >
                  <span className={item.allowed ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {item.label}
                  </span>
                  {item.allowed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Allowed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      Restricted
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. SWITCH DEMO ROLE (STRICTLY 3 ROLES) */}
          <div className="p-3 space-y-2">
            <div className="px-1 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Switch Prototype Role (3 Official Roles)
              </span>
              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Instant RBAC Switch
              </span>
            </div>

            <div className="space-y-1.5">
              {userProfiles.map(profile => {
                const isSelected = currentUser.id === profile.id;
                const pStyle = roleAccentStyles[profile.role] || roleAccentStyles.workspace_admin;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    data-testid={`switch-role-${profile.role}`}
                    onClick={() => {
                      onSelectRole(profile);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? `${pStyle.activeCardBorder} ${pStyle.activeCardBg}`
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${profile.avatarColor} flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 shadow-2xs`}
                    >
                      {profile.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {profile.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${pStyle.pillBg} ${pStyle.pillText} ${pStyle.pillBorder}`}
                        >
                          {profile.roleLabel}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        {profile.email}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span className="truncate font-medium text-slate-600">
                          {profile.department}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{profile.location}</span>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. FOOTER ACTIONS: WORKSPACE ADMIN & SIGN OUT */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/90 space-y-1">
            <button
              type="button"
              data-testid="open-workspace-admin-btn"
              onClick={() => {
                onClose();
                onOpenWorkspaceAdmin();
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-white hover:shadow-2xs border border-transparent hover:border-slate-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Workspace Users, Roles & Activity Log</span>
              </div>
              {currentUser.permissions.canManageWorkspaceSettings ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Admin Full Access
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-600 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  View Only
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Switch Account on Login Screen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
