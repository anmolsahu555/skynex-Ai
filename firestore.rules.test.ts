/**
 * SkyNex AI — Firestore Security Rules Verification Suite (Dirty Dozen Payloads)
 */
export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  authUid: string | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write to User Profile',
    operation: 'create',
    path: '/users/user_1',
    authUid: null,
    payload: {
      uid: 'user_1',
      displayName: 'Anon Hacker',
      roleLabel: 'Content Reviewer',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Identity Spoofing on Profile Create',
    operation: 'create',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_2',
      displayName: 'Spoofed UID',
      roleLabel: 'Content Reviewer',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Create',
    operation: 'create',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      displayName: 'Shadow Tester',
      roleLabel: 'Content Reviewer',
      isDemo: false,
      isAdmin: true
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Invalid Enum Role Escalation',
    operation: 'create',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      displayName: 'Escalator',
      roleLabel: 'Root SuperUser',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'ID Poisoning Attack on Path Variable',
    operation: 'create',
    path: '/users/invalid$id!@#',
    authUid: 'invalid$id!@#',
    payload: {
      uid: 'invalid$id!@#',
      displayName: 'Poison ID',
      roleLabel: 'Content Reviewer',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Denial of Wallet Oversized displayName',
    operation: 'create',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      displayName: 'A'.repeat(500),
      roleLabel: 'Content Reviewer',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Timestamp Forgery on Create',
    operation: 'create',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      displayName: 'Time Traveler',
      roleLabel: 'Content Reviewer',
      isDemo: false,
      createdAt: '1999-01-01T00:00:00Z',
      updatedAt: '1999-01-01T00:00:00Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Immutable Field Mutation on Update',
    operation: 'update',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_999',
      displayName: 'Changed Owner',
      roleLabel: 'Content Reviewer',
      isDemo: false
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Shadow Field Injection on Update',
    operation: 'update',
    path: '/users/user_1',
    authUid: 'user_1',
    payload: {
      uid: 'user_1',
      displayName: 'Valid Name',
      roleLabel: 'Brand Compliance Manager',
      isDemo: false,
      shadowPrivilege: 'granted'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Cross-User PII Read Attempt',
    operation: 'get',
    path: '/users/user_1/private/info',
    authUid: 'user_2',
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Demo User Deleting Production User Profile',
    operation: 'delete',
    path: '/users/user_1',
    authUid: 'user_1',
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Orphaned Subcollection Write Without Parent',
    operation: 'create',
    path: '/users/non_existent_user/private/info',
    authUid: 'non_existent_user',
    payload: {
      uid: 'non_existent_user',
      email: 'orphan@example.com'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  }
];
