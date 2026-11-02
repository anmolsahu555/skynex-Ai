import { UserProfile } from '../types.ts';

// Real organization-specific roles per Section 4:
// - Administrator: manages the workspace, brand knowledge, members and permissions
// - Reviewer/Manager: reviews findings, approves rules, comments and makes authorised decisions
// - Creator: submits content, views findings and edits drafts
export const USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Workspace Admin',
    role: 'brand_manager',
    roleLabel: 'Workspace Administrator',
    title: 'Brand Governance Administrator',
    department: 'Brand Standards & Strategy',
    email: 'admin@workspace.local',
    initials: 'WA',
    avatarColor: 'bg-[#10243A] text-white',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: true,
      canDeprecateRules: true,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description: 'Full workspace authority to create brands, upload and process guidelines, approve candidate rules, and configure governance policies.',
    responsibilities: [
      'Creates and configures brands in the workspace',
      'Uploads guideline documents and triggers AI rule extraction',
      'Reviews and approves candidate rules into authoritative rules',
      'Manages brand governance policies and recurring alerts'
    ]
  },
  {
    id: 'usr-reviewer-02',
    name: 'Brand Reviewer',
    role: 'legal_counsel',
    roleLabel: 'Reviewer & Manager',
    title: 'Brand Compliance Reviewer',
    department: 'Marketing & Legal Oversight',
    email: 'reviewer@workspace.local',
    initials: 'BR',
    avatarColor: 'bg-[#0F9D8A] text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: true,
      canDeprecateRules: false,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description: 'Authorized reviewer who evaluates findings, makes individual acceptance decisions, and signs off on publication approvals.',
    responsibilities: [
      'Reviews content audit findings against approved rules',
      'Accepts, custom-edits, or rejects suggested corrections',
      'Performs formal content sign-off for publication',
      'Investigates recurring issues flagged by the clarity engine'
    ]
  },
  {
    id: 'usr-creator-03',
    name: 'Content Creator',
    role: 'creator',
    roleLabel: 'Content Creator',
    title: 'Copywriter & Campaign Specialist',
    department: 'Creative & Content Production',
    email: 'creator@workspace.local',
    initials: 'CC',
    avatarColor: 'bg-[#3B82F6] text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: false,
      canManageRules: false,
      canDeprecateRules: false,
      canExecuteMemo: false,
      canExportAuditLog: true,
      canClearLegalFlags: false
    },
    description: 'Submits drafts, advertisement copy, and creative assets for automated governance review and edits working revisions.',
    responsibilities: [
      'Submits marketing copy, emails, PDFs, and advertisement images',
      'Inspects explained findings and citations',
      'Edits and customizes working draft revisions',
      'Applies approved corrections to ensure compliance'
    ]
  }
];

export const DEFAULT_USER_PROFILE = USER_PROFILES[0];
