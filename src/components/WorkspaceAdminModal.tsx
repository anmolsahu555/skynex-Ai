import React, { useState } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  Sliders,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  UserCheck,
  Check
} from 'lucide-react';
import type {
  UserProfile,
  WorkspaceMember,
  WorkspaceGovernanceSettings,
  WorkspaceActivityEntry,
  CanonicalRoleKey
} from '../types.ts';

interface WorkspaceAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  onSwitchRole: (profile: UserProfile) => void;
  members: WorkspaceMember[];
  settings: WorkspaceGovernanceSettings;
  activities: WorkspaceActivityEntry[];
  onInviteMember: (payload: {
    name: string;
    email: string;
    role: CanonicalRoleKey;
    department: string;
    location: string;
  }) => Promise<void>;
  onChangeMemberRole: (memberId: string, newRole: CanonicalRoleKey) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onUpdateSettings: (nextSettings: Partial<WorkspaceGovernanceSettings>) => Promise<void>;
}

const ROLE_OPTIONS: { key: CanonicalRoleKey; label: 'Workspace Admin' | 'Reviewer & Manager' | 'Content Creator' }[] = [
  { key: 'workspace_admin', label: 'Workspace Admin' },
  { key: 'reviewer_manager', label: 'Reviewer & Manager' },
  { key: 'content_creator', label: 'Content Creator' }
];

export default function WorkspaceAdminModal({
  isOpen,
  onClose,
  currentUser,
  userProfiles,
  onSwitchRole,
  members,
  settings,
  activities,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onUpdateSettings
}: WorkspaceAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'matrix' | 'settings' | 'activity'>('members');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CanonicalRoleKey>('content_creator');
  const [inviteDepartment, setInviteDepartment] = useState('Creative Studio & Growth');
  const [inviteLocation, setInviteLocation] = useState('Bengaluru HQ');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'workspace_admin' && currentUser.permissions.canManageWorkspaceSettings;
  const adminProfile = userProfiles.find(p => p.role === 'workspace_admin') || userProfiles[0];

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setFormError(null);
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setFormError('Please provide both full name and email address.');
      return;
    }
    setIsSubmittingInvite(true);
    try {
      await onInviteMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        department: inviteDepartment.trim() || 'Brand Operations',
        location: inviteLocation.trim() || 'Bengaluru HQ'
      });
      setInviteName('');
      setInviteEmail('');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to invite user');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const matrixRows = [
    { capability: 'Full access to all dashboards & modules', admin: true, reviewer: true, creator: false },
    { capability: 'Upload text, documents, and advertisement images', admin: true, reviewer: true, creator: true },
    { capability: 'Submit content for brand review & run AI audits', admin: true, reviewer: true, creator: true },
    { capability: 'View audit findings & AI-generated suggestions', admin: true, reviewer: true, creator: true },
    { capability: 'Accept or reject individual audit corrections', admin: true, reviewer: true, creator: false },
    { capability: 'Generate and regenerate AI creatives', admin: true, reviewer: true, creator: true },
    { capability: 'Approve or reject final creatives for publication', admin: true, reviewer: true, creator: false },
    { capability: 'Request changes from Content Creators', admin: true, reviewer: true, creator: false },
    { capability: 'Submit corrected creatives for Manager approval', admin: true, reviewer: false, creator: true },
    { capability: 'Manage Brand DNA & Website Rule Extraction (Write)', admin: true, reviewer: false, creator: false },
    { capability: 'Manage Product Catalog & Pricing (Write)', admin: true, reviewer: false, creator: false },
    { capability: 'Manage Regulatory Compliance Rules (Write)', admin: true, reviewer: false, creator: false },
    { capability: 'View Brand DNA, Product Catalog & Gov Rules (Read-Only)', admin: true, reviewer: true, creator: true },
    { capability: 'View complete workspace audit & approval history', admin: true, reviewer: true, creator: false },
    { capability: 'Invite/remove users, assign roles & workspace settings', admin: true, reviewer: false, creator: false }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0C1527] text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  SkyNex AI — Role-Based Access Control (RBAC) & Workspace Governance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  3 Official Roles
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Active User: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}) · Role:{' '}
                <strong className="text-cyan-300">{currentUser.roleLabel}</strong> · {currentUser.department} ({currentUser.location})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Admin Read-Only Banner */}
        {!isAdmin && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shrink-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You are currently viewing as <strong>{currentUser.name} ({currentUser.roleLabel})</strong>. User management, role assignment, and workspace settings are restricted to <strong>Workspace Admin (Aditi Sharma)</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSwitchRole(adminProfile)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors"
            >
              Switch to Aditi Sharma (Workspace Admin)
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members & Roles ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3-Role Permission Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Workspace Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>User Activity & Approval Log ({activities.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          {/* TAB 1: TEAM MEMBERS & ROLES */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Invite User Card (Enabled for Workspace Admin) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>Invite User to SkyNex AI Workspace</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assign new team members to one of the three official SkyNex AI RBAC roles.
                    </p>
                  </div>
                  {!isAdmin && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Admin Only
                    </span>
                  )}
                </div>

                {formError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!isAdmin || isSubmittingInvite}
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                      placeholder="e.g. Siddharth Rao"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Work Email</label>
                    <input
                      type="email"
                      disabled={!isAdmin || isSubmittingInvite}
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="siddharth@skynex.ai"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assigned Role (3 Roles)</label>
                    <select
                      disabled={!isAdmin || isSubmittingInvite}
                      value={inviteRole}
                      onChange={e => {
                        const r = e.target.value as CanonicalRoleKey;
                        setInviteRole(r);
                        if (r === 'workspace_admin') setInviteDepartment('Governance & Standards');
                        if (r === 'reviewer_manager') setInviteDepartment('Risk & Editorial Review');
                        if (r === 'content_creator') setInviteDepartment('Creative Studio & Growth');
                      }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold disabled:bg-slate-100"
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department & Hub</label>
                    <input
                      type="text"
                      disabled={!isAdmin || isSubmittingInvite}
                      value={inviteDepartment}
                      onChange={e => setInviteDepartment(e.target.value)}
                      placeholder="Department"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 disabled:bg-slate-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!isAdmin || isSubmittingInvite}
                      className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isSubmittingInvite ? 'Inviting...' : 'Invite User'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Workspace Members ({members.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click any Demo Account to switch active prototype session
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Department & Location</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map(member => {
                        const matchingDemoProfile = userProfiles.find(
                          p => p.email.toLowerCase() === member.email.toLowerCase()
                        );
                        const isCurrentActive =
                          currentUser.email.toLowerCase() === member.email.toLowerCase();

                        return (
                          <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-lg ${member.avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
                                >
                                  {member.initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{member.name}</span>
                                    {member.isDemoAccount && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        Official Prototype Account
                                      </span>
                                    )}
                                    {isCurrentActive && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Active Now
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500">{member.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">{member.department}</div>
                              <div className="text-[11px] text-slate-500">{member.location}</div>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                disabled={!isAdmin || member.isDemoAccount}
                                value={member.role}
                                onChange={e =>
                                  onChangeMemberRole(member.id, e.target.value as CanonicalRoleKey)
                                }
                                title={
                                  member.isDemoAccount
                                    ? 'Canonical Demo Account role is fixed for consistent RBAC testing'
                                    : 'Change user role'
                                }
                                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-600"
                              >
                                {ROLE_OPTIONS.map(opt => (
                                  <option key={opt.key} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {member.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {matchingDemoProfile && !isCurrentActive && (
                                  <button
                                    type="button"
                                    onClick={() => onSwitchRole(matchingDemoProfile)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 cursor-pointer transition-colors"
                                  >
                                    Switch to Role
                                  </button>
                                )}
                                {!member.isDemoAccount && (
                                  <button
                                    type="button"
                                    disabled={!isAdmin}
                                    onClick={() => onRemoveMember(member.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 cursor-pointer"
                                    title="Remove user from workspace"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-ROLE PERMISSION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Authoritative Three-Role Access Control Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SkyNex AI enforces strictly three roles across all modules and backend APIs.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-3.5 px-4">Platform Capability / Permission</th>
                      <th className="py-3.5 px-4 text-center bg-indigo-50/50 text-indigo-900">
                        Workspace Admin
                        <div className="text-[10px] font-normal text-indigo-700 normal-case">
                          Aditi Sharma (admin@skynex.ai)
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-center bg-emerald-50/50 text-emerald-900">
                        Reviewer & Manager
                        <div className="text-[10px] font-normal text-emerald-700 normal-case">
                          Rohan Verma (reviewer@skynex.ai)
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-center bg-blue-50/50 text-blue-900">
                        Content Creator
                        <div className="text-[10px] font-normal text-blue-700 normal-case">
                          Ananya Iyer (creator@skynex.ai)
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matrixRows.map(row => (
                      <tr key={row.capability} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-medium text-slate-800">{row.capability}</td>
                        <td className="py-2.5 px-4 text-center bg-indigo-50/15">
                          {row.admin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Full Access
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center bg-emerald-50/15">
                          {row.reviewer ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                              <Lock className="w-2.5 h-2.5" /> Restricted
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center bg-blue-50/15">
                          {row.creator ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                              <Lock className="w-2.5 h-2.5" /> Restricted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE GOVERNANCE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Workspace Governance Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure enterprise enforcement rules for content approvals, Brand DNA, and statutory compliance.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  Last updated by {settings.updatedBy}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">
                      Require Reviewer & Manager Approval for Content Creators
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Content Creators (Ananya Iyer) must submit audited drafts and regenerated creatives to a Reviewer & Manager (Rohan Verma) or Workspace Admin (Aditi Sharma) for final publication sign-off.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.requireManagerApprovalForCreatives}
                    onChange={e =>
                      onUpdateSettings({ requireManagerApprovalForCreatives: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">
                      Restrict Brand DNA & Regulatory Rule Mutations to Workspace Admin
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reviewer & Manager and Content Creator roles have read-only visibility into Brand DNA, Product Catalog, and Government Rules.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.restrictRuleEditingToWorkspaceAdmin}
                    onChange={e =>
                      onUpdateSettings({ restrictRuleEditingToWorkspaceAdmin: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-slate-900">
                      Automatically Run Second AI Audit on Regenerated Creatives
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Every AI-regenerated advertisement image is automatically re-audited against Brand DNA and statutory rules before approval.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={settings.autoRunSecondAuditOnRegeneration}
                    onChange={e =>
                      onUpdateSettings({ autoRunSecondAuditOnRegeneration: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: USER ACTIVITY & APPROVAL LOG */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Workspace User Activity & Approval Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological log of role switches, content submissions, finding decisions, creative approvals, and admin actions.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                {activities.map(act => (
                  <div key={act.id} className="p-3.5 hover:bg-slate-50/70 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {act.actorName
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{act.actorName}</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {act.actorRole}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{act.actorEmail}</span>
                        </div>
                        <p className="text-slate-700 mt-1 leading-relaxed">{act.summary}</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 shrink-0">
                      {act.timestamp.slice(0, 19).replace('T', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            SkyNex AI RBAC Engine · Strictly 3 Roles: <strong>Workspace Admin</strong>, <strong>Reviewer & Manager</strong>, <strong>Content Creator</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
