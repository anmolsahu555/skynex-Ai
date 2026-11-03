import type { UserProfile, WorkspaceMember, WorkspaceGovernanceSettings, WorkspaceActivityEntry } from '../types.ts';

/**
 * SkyNex AI — Strictly Three Official RBAC User Roles:
 * A. Workspace Admin — Aditi Sharma (admin@skynex.ai)
 * B. Reviewer & Manager — Rohan Verma (reviewer@skynex.ai)
 * C. Content Creator — Ananya Iyer (creator@skynex.ai)
 */
export const USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Aditi Sharma',
    role: 'workspace_admin',
    roleLabel: 'Workspace Admin',
    title: 'Head of Brand Governance & Compliance',
    department: 'Governance & Standards',
    location: 'Bengaluru HQ',
    email: 'admin@skynex.ai',
    initials: 'AS',
    avatarColor: 'bg-[#10243A] text-white',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    permissions: {
      canAccessAllModules: true,
      canUploadContent: true,
      canSubmitContent: true,
      canRunAiAudits: true,
      canViewAuditFindings: true,
      canAcceptRejectFindings: true,
      canGenerateCreatives: true,
      canApproveCreatives: true,
      canRequestChangesFromCreator: true,
      canSubmitForManagerApproval: true,
      canManageBrandDna: true,
      canManageProductCatalog: true,
      canManageRegulatoryRules: true,
      canViewAllAuditHistory: true,
      canInviteRemoveUsers: true,
      canAssignUserRoles: true,
      canManageWorkspaceSettings: true,
      canViewAllUserActivities: true,
      // Backward-compatible flags
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: true,
      canDeprecateRules: true,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description:
      'Full access to the entire SkyNex AI application, including Brand DNA, Product Catalog, Regulatory Compliance rules, AI Audits, Creative Approval, and Workspace User & Role Administration.',
    responsibilities: [
      'Full access to all dashboards and modules',
      'Upload and review content & run AI audits',
      'Accept and reject audit findings & approve creatives',
      'Manage Brand DNA, Product Catalog & Regulatory rules',
      'Invite/remove users, assign roles & manage workspace settings',
      'View all audit history, user activities & approval logs'
    ],
    restrictions: []
  },
  {
    id: 'usr-reviewer-02',
    name: 'Rohan Verma',
    role: 'reviewer_manager',
    roleLabel: 'Reviewer & Manager',
    title: 'Senior Editorial & Compliance Reviewer',
    department: 'Risk & Editorial Review',
    location: 'Mumbai Hub',
    email: 'reviewer@skynex.ai',
    initials: 'RV',
    avatarColor: 'bg-[#0F9D8A] text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    permissions: {
      canAccessAllModules: true,
      canUploadContent: true,
      canSubmitContent: true,
      canRunAiAudits: true,
      canViewAuditFindings: true,
      canAcceptRejectFindings: true,
      canGenerateCreatives: true,
      canApproveCreatives: true,
      canRequestChangesFromCreator: true,
      canSubmitForManagerApproval: false,
      canManageBrandDna: false,
      canManageProductCatalog: false,
      canManageRegulatoryRules: false,
      canViewAllAuditHistory: true,
      canInviteRemoveUsers: false,
      canAssignUserRoles: false,
      canManageWorkspaceSettings: false,
      canViewAllUserActivities: true,
      // Backward-compatible flags
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: false,
      canDeprecateRules: false,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description:
      'Reviews submitted content from all creators, evaluates audit findings, accepts or rejects individual corrections, and approves or requests changes on final creatives. Read-only access to Brand DNA, Product Catalog, and Regulatory Rules.',
    responsibilities: [
      'Access submitted content from all creators',
      'View audit findings, compliance violations & AI suggestions',
      'Accept or reject individual audit corrections',
      'Approve or reject final creatives & request changes from creators',
      'View Brand DNA, Product Catalog & Regulatory rules (Read-Only)',
      'View complete audit and approval history'
    ],
    restrictions: [
      'Cannot invite or remove users or assign roles',
      'Cannot modify workspace settings',
      'Cannot modify core Brand DNA, Product Catalog, or Regulatory rules'
    ]
  },
  {
    id: 'usr-creator-03',
    name: 'Ananya Iyer',
    role: 'content_creator',
    roleLabel: 'Content Creator',
    title: 'Creative Specialist & Growth Designer',
    department: 'Creative Studio & Growth',
    location: 'Delhi NCR',
    email: 'creator@skynex.ai',
    initials: 'AI',
    avatarColor: 'bg-[#2563EB] text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    permissions: {
      canAccessAllModules: false,
      canUploadContent: true,
      canSubmitContent: true,
      canRunAiAudits: true,
      canViewAuditFindings: true,
      canAcceptRejectFindings: false,
      canGenerateCreatives: true,
      canApproveCreatives: false,
      canRequestChangesFromCreator: false,
      canSubmitForManagerApproval: true,
      canManageBrandDna: false,
      canManageProductCatalog: false,
      canManageRegulatoryRules: false,
      canViewAllAuditHistory: false,
      canInviteRemoveUsers: false,
      canAssignUserRoles: false,
      canManageWorkspaceSettings: false,
      canViewAllUserActivities: false,
      // Backward-compatible flags
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: false,
      canManageRules: false,
      canDeprecateRules: false,
      canExecuteMemo: false,
      canExportAuditLog: false,
      canClearLegalFlags: false
    },
    description:
      'Uploads text, documents, and images, runs AI content audits, inspects suggested corrections, generates and regenerates AI creatives, edits own drafts, and submits corrected creatives for Reviewer & Manager approval.',
    responsibilities: [
      'Upload text, documents, and advertisement images',
      'Submit content for brand review & run AI content audits',
      'View audit findings and suggested corrections',
      'Generate and regenerate AI creatives & edit own submitted content',
      'Submit corrected creatives for manager approval',
      'View own submission history, approval status & reviewer feedback'
    ],
    restrictions: [
      'Cannot approve own final creatives',
      'Cannot make final compliance sign-off decisions',
      'Cannot manage users, roles, or workspace administration',
      'Cannot modify Brand DNA, Product Catalog, or Regulatory rules'
    ]
  }
];

export const DEFAULT_USER_PROFILE = USER_PROFILES[0];

export function getUserProfileByEmailOrRole(emailOrRole?: string | null): UserProfile {
  if (!emailOrRole) return DEFAULT_USER_PROFILE;
  const clean = emailOrRole.trim().toLowerCase();
  const byEmail = USER_PROFILES.find(u => u.email.toLowerCase() === clean);
  if (byEmail) return byEmail;
  const byRole = USER_PROFILES.find(
    u => u.role.toLowerCase() === clean || u.roleLabel.toLowerCase() === clean
  );
  return byRole || DEFAULT_USER_PROFILE;
}

export const INITIAL_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    id: 'usr-admin-01',
    name: 'Aditi Sharma',
    email: 'admin@skynex.ai',
    role: 'workspace_admin',
    roleLabel: 'Workspace Admin',
    department: 'Governance & Standards',
    location: 'Bengaluru HQ',
    initials: 'AS',
    avatarColor: 'bg-[#10243A] text-white',
    status: 'Active',
    joinedAt: '2026-01-10',
    lastActiveAt: new Date().toISOString(),
    isDemoAccount: true
  },
  {
    id: 'usr-reviewer-02',
    name: 'Rohan Verma',
    email: 'reviewer@skynex.ai',
    role: 'reviewer_manager',
    roleLabel: 'Reviewer & Manager',
    department: 'Risk & Editorial Review',
    location: 'Mumbai Hub',
    initials: 'RV',
    avatarColor: 'bg-[#0F9D8A] text-white',
    status: 'Active',
    joinedAt: '2026-01-14',
    lastActiveAt: new Date().toISOString(),
    isDemoAccount: true
  },
  {
    id: 'usr-creator-03',
    name: 'Ananya Iyer',
    email: 'creator@skynex.ai',
    role: 'content_creator',
    roleLabel: 'Content Creator',
    department: 'Creative Studio & Growth',
    location: 'Delhi NCR',
    initials: 'AI',
    avatarColor: 'bg-[#2563EB] text-white',
    status: 'Active',
    joinedAt: '2026-02-01',
    lastActiveAt: new Date().toISOString(),
    isDemoAccount: true
  },
  {
    id: 'usr-member-04',
    name: 'Vikram Nair',
    email: 'vikram.nair@skynex.ai',
    role: 'reviewer_manager',
    roleLabel: 'Reviewer & Manager',
    department: 'Legal & Statutory Oversight',
    location: 'Bengaluru HQ',
    initials: 'VN',
    avatarColor: 'bg-teal-700 text-white',
    status: 'Active',
    joinedAt: '2026-03-12',
    lastActiveAt: '2026-10-30T11:20:00Z',
    isDemoAccount: false
  },
  {
    id: 'usr-member-05',
    name: 'Meera Krishnan',
    email: 'meera.k@skynex.ai',
    role: 'content_creator',
    roleLabel: 'Content Creator',
    department: 'Performance Marketing',
    location: 'Hyderabad Studio',
    initials: 'MK',
    avatarColor: 'bg-blue-700 text-white',
    status: 'Active',
    joinedAt: '2026-04-05',
    lastActiveAt: '2026-10-29T16:45:00Z',
    isDemoAccount: false
  }
];

export const INITIAL_WORKSPACE_SETTINGS: WorkspaceGovernanceSettings = {
  workspaceName: 'SkyNex AI Enterprise Governance',
  organizationDomain: 'skynex.ai',
  requireManagerApprovalForCreatives: true,
  autoRunSecondAuditOnRegeneration: true,
  enforceStatutoryGovernmentRules: true,
  restrictRuleEditingToWorkspaceAdmin: true,
  restrictCatalogToWorkspaceAdmin: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Aditi Sharma (Workspace Admin)'
};

export const INITIAL_WORKSPACE_ACTIVITIES: WorkspaceActivityEntry[] = [
  {
    id: 'act-seed-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    actorName: 'Aditi Sharma',
    actorEmail: 'admin@skynex.ai',
    actorRole: 'Workspace Admin',
    actionType: 'brand_dna_updated',
    summary: 'Synchronized 7 Indian regulatory departments (CCPA, FSSAI, DCA, MeitY, CDSCO, SEBI, ASCI) with NovaPay Brand Knowledge.',
    targetBrand: 'NovaPay'
  },
  {
    id: 'act-seed-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    actorName: 'Ananya Iyer',
    actorEmail: 'creator@skynex.ai',
    actorRole: 'Content Creator',
    actionType: 'submitted_for_approval',
    summary: 'Submitted "NovaPay Promotional Ad (Canonical)" after running AI compliance audit for Reviewer & Manager sign-off.',
    targetBrand: 'NovaPay',
    reportId: 'REV-2026-891'
  },
  {
    id: 'act-seed-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    actorName: 'Rohan Verma',
    actorEmail: 'reviewer@skynex.ai',
    actorRole: 'Reviewer & Manager',
    actionType: 'finding_decision',
    summary: 'Reviewed pricing & prohibited profit claims on NovaPay campaign and accepted AI-verified replacements.',
    targetBrand: 'NovaPay',
    reportId: 'REV-2026-891'
  }
];
