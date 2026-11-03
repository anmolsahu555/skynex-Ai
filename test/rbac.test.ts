import assert from 'node:assert/strict';
import {
  USER_PROFILES,
  DEFAULT_USER_PROFILE,
  getUserProfileByEmailOrRole,
  INITIAL_WORKSPACE_MEMBERS,
  INITIAL_WORKSPACE_SETTINGS,
  INITIAL_WORKSPACE_ACTIVITIES
} from '../src/data/userProfiles.ts';

console.log('Running SkyNex AI 3-Role RBAC Verification Suite...');

// 1. Verify strictly THREE ROLES exist
assert.equal(
  USER_PROFILES.length,
  3,
  `Expected strictly 3 roles in USER_PROFILES, found ${USER_PROFILES.length}`
);

const [admin, reviewer, creator] = USER_PROFILES;

// 2. Verify Role A: Workspace Admin (Aditi Sharma)
assert.equal(admin.name, 'Aditi Sharma');
assert.equal(admin.email, 'admin@skynex.ai');
assert.equal(admin.role, 'workspace_admin');
assert.equal(admin.roleLabel, 'Workspace Admin');
assert.equal(admin.department, 'Governance & Standards');
assert.equal(admin.location, 'Bengaluru HQ');
assert.equal(admin.permissions.canManageBrandDna, true);
assert.equal(admin.permissions.canManageProductCatalog, true);
assert.equal(admin.permissions.canManageRegulatoryRules, true);
assert.equal(admin.permissions.canInviteRemoveUsers, true);
assert.equal(admin.permissions.canAssignUserRoles, true);
assert.equal(admin.permissions.canManageWorkspaceSettings, true);
assert.equal(admin.permissions.canApproveCreatives, true);
assert.equal(admin.permissions.canAcceptRejectFindings, true);

// 3. Verify Role B: Reviewer & Manager (Rohan Verma)
assert.equal(reviewer.name, 'Rohan Verma');
assert.equal(reviewer.email, 'reviewer@skynex.ai');
assert.equal(reviewer.role, 'reviewer_manager');
assert.equal(reviewer.roleLabel, 'Reviewer & Manager');
assert.equal(reviewer.department, 'Risk & Editorial Review');
assert.equal(reviewer.location, 'Mumbai Hub');
assert.equal(reviewer.permissions.canAcceptRejectFindings, true);
assert.equal(reviewer.permissions.canApproveCreatives, true);
assert.equal(reviewer.permissions.canRequestChangesFromCreator, true);
assert.equal(reviewer.permissions.canViewAllAuditHistory, true);
// Restrictions for Reviewer & Manager
assert.equal(reviewer.permissions.canInviteRemoveUsers, false);
assert.equal(reviewer.permissions.canAssignUserRoles, false);
assert.equal(reviewer.permissions.canManageWorkspaceSettings, false);
assert.equal(reviewer.permissions.canManageBrandDna, false);
assert.equal(reviewer.permissions.canManageProductCatalog, false);
assert.equal(reviewer.permissions.canManageRegulatoryRules, false);

// 4. Verify Role C: Content Creator (Ananya Iyer)
assert.equal(creator.name, 'Ananya Iyer');
assert.equal(creator.email, 'creator@skynex.ai');
assert.equal(creator.role, 'content_creator');
assert.equal(creator.roleLabel, 'Content Creator');
assert.equal(creator.department, 'Creative Studio & Growth');
assert.equal(creator.location, 'Delhi NCR');
assert.equal(creator.permissions.canUploadContent, true);
assert.equal(creator.permissions.canSubmitContent, true);
assert.equal(creator.permissions.canRunAiAudits, true);
assert.equal(creator.permissions.canGenerateCreatives, true);
assert.equal(creator.permissions.canSubmitForManagerApproval, true);
// Restrictions for Content Creator
assert.equal(creator.permissions.canApproveCreatives, false);
assert.equal(creator.permissions.canAcceptRejectFindings, false);
assert.equal(creator.permissions.canInviteRemoveUsers, false);
assert.equal(creator.permissions.canAssignUserRoles, false);
assert.equal(creator.permissions.canManageBrandDna, false);
assert.equal(creator.permissions.canManageProductCatalog, false);
assert.equal(creator.permissions.canManageRegulatoryRules, false);
assert.equal(creator.permissions.canManageWorkspaceSettings, false);

// 5. Verify helper resolution by email, role key, and role label
assert.equal(getUserProfileByEmailOrRole('admin@skynex.ai').name, 'Aditi Sharma');
assert.equal(getUserProfileByEmailOrRole('reviewer@skynex.ai').name, 'Rohan Verma');
assert.equal(getUserProfileByEmailOrRole('creator@skynex.ai').name, 'Ananya Iyer');
assert.equal(getUserProfileByEmailOrRole('Reviewer & Manager').email, 'reviewer@skynex.ai');
assert.equal(getUserProfileByEmailOrRole('content_creator').email, 'creator@skynex.ai');
assert.equal(DEFAULT_USER_PROFILE.email, 'admin@skynex.ai');

// 6. Verify workspace members only use the 3 canonical roles
const validRoles = new Set(['workspace_admin', 'reviewer_manager', 'content_creator']);
for (const member of INITIAL_WORKSPACE_MEMBERS) {
  assert.equal(
    validRoles.has(member.role),
    true,
    `Member ${member.name} has invalid role ${member.role}`
  );
}
assert.ok(INITIAL_WORKSPACE_SETTINGS.workspaceName.includes('SkyNex AI'));
assert.ok(INITIAL_WORKSPACE_ACTIVITIES.length >= 3);

console.log('✅ All 3-Role RBAC assertions passed (Aditi Sharma, Rohan Verma, Ananya Iyer)!');
