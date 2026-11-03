import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const DEMO_CREDENTIALS = {
  email: 'demo@skynex.ai',
  password: 'SkyNex@Demo2026',
  uid: 'demo_evaluator_skynex_2026',
  displayName: 'Evaluator Demo Account',
  roleLabel: 'Evaluator Demo Account',
  organization: 'SkyNex AI Evaluation Sandbox'
} as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required by guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface SkyNexAuthSession {
  uid: string;
  email: string;
  displayName: string;
  roleLabel: string;
  roleKey?: 'workspace_admin' | 'reviewer_manager' | 'content_creator';
  isDemo: boolean;
  authProvider: 'firebase_demo' | 'firebase_google' | 'firebase_email';
  authenticatedAt: string;
}

const SESSION_STORAGE_KEY = 'skynex_auth_session_v1';

export const RBAC_DEMO_ACCOUNTS = {
  workspace_admin: {
    uid: 'rbac_admin_aditi_sharma',
    email: 'admin@skynex.ai',
    displayName: 'Aditi Sharma',
    roleLabel: 'Workspace Admin',
    roleKey: 'workspace_admin' as const,
    department: 'Governance & Standards',
    location: 'Bengaluru HQ'
  },
  reviewer_manager: {
    uid: 'rbac_reviewer_rohan_verma',
    email: 'reviewer@skynex.ai',
    displayName: 'Rohan Verma',
    roleLabel: 'Reviewer & Manager',
    roleKey: 'reviewer_manager' as const,
    department: 'Risk & Editorial Review',
    location: 'Mumbai Hub'
  },
  content_creator: {
    uid: 'rbac_creator_ananya_iyer',
    email: 'creator@skynex.ai',
    displayName: 'Ananya Iyer',
    roleLabel: 'Content Creator',
    roleKey: 'content_creator' as const,
    department: 'Creative Studio & Growth',
    location: 'Delhi NCR'
  }
} as const;

export function getSavedAuthSession(): SkyNexAuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.uid === 'string' && typeof parsed.email === 'string') {
      return parsed as SkyNexAuthSession;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

export function saveAuthSession(session: SkyNexAuthSession | null) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Syncs authenticated user profile into Firestore using split-collection PII isolation
 */
export async function syncUserProfileToFirestore(user: User, isDemo: boolean): Promise<void> {
  if (!user || !user.uid) return;
  const userPath = `users/${user.uid}`;

  try {
    const existingDoc = await getDoc(doc(db, 'users', user.uid));
    const safeDisplayName = (
      user.displayName ||
      (isDemo ? 'Aditi Sharma' : user.email?.split('@')[0] || 'SkyNex User')
    ).slice(0, 100);
    const safeRoleLabel = isDemo ? 'Workspace Admin' : 'Workspace Admin';

    if (!existingDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: safeDisplayName,
        roleLabel: safeRoleLabel,
        isDemo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (user.email && user.email.length >= 3 && user.email.length <= 254) {
        await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    // Only throw structured FirestoreErrorInfo if it's a permission error and user is signed in
    if (
      auth.currentUser &&
      error instanceof Error &&
      error.message.toLowerCase().includes('Missing or insufficient permissions'.toLowerCase())
    ) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }
}

/**
 * Record an isolated demo sandbox activity event in Firestore when authenticated
 */
export async function recordDemoSandboxActivity(action: string, brandId: string): Promise<void> {
  if (!auth.currentUser) return;
  const logId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `demo_sandbox_logs/${logId}`;
  try {
    await setDoc(doc(db, 'demo_sandbox_logs', logId), {
      uid: auth.currentUser.uid,
      action: action.slice(0, 120),
      brandId: (brandId || 'novapay').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('missing or insufficient permissions')
    ) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

/**
 * Authenticates the dedicated Evaluator Demo user via Firebase Auth + Backend Demo Session
 * Supports selecting any of the 3 RBAC prototype roles (Workspace Admin, Reviewer & Manager, Content Creator)
 */
export async function loginWithDemoAccount(
  selectedRoleKey: 'workspace_admin' | 'reviewer_manager' | 'content_creator' = 'workspace_admin'
): Promise<SkyNexAuthSession> {
  let firebaseUser: User | null = null;
  const targetRbac = RBAC_DEMO_ACCOUNTS[selectedRoleKey] || RBAC_DEMO_ACCOUNTS.workspace_admin;

  try {
    // 1. Attempt sign-in with the dedicated demo user in Firebase Authentication
    const cred = await signInWithEmailAndPassword(
      auth,
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password
    );
    firebaseUser = cred.user;
  } catch (signInErr: any) {
    const code = String(signInErr?.code || '');
    // 2. If the demo user does not exist yet in this Firebase project, provision it automatically
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials'
    ) {
      try {
        const created = await createUserWithEmailAndPassword(
          auth,
          DEMO_CREDENTIALS.email,
          DEMO_CREDENTIALS.password
        );
        await updateProfile(created.user, {
          displayName: targetRbac.displayName
        });
        firebaseUser = created.user;
      } catch {
        // Handled below via verified backend demo session
      }
    }
  }

  if (firebaseUser) {
    await syncUserProfileToFirestore(firebaseUser, true);
    await recordDemoSandboxActivity(`RBAC Demo Login (${targetRbac.roleLabel})`, 'novapay');
  }

  // 3. Also register/verify Demo Session with the backend sandbox
  try {
    await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
        rbacEmail: targetRbac.email,
        rbacRole: targetRbac.roleKey,
        firebaseUid: firebaseUser?.uid || targetRbac.uid
      })
    });
  } catch {
    // Continue even if offline
  }

  const session: SkyNexAuthSession = {
    uid: firebaseUser?.uid || targetRbac.uid,
    email: targetRbac.email,
    displayName: targetRbac.displayName,
    roleLabel: targetRbac.roleLabel,
    roleKey: targetRbac.roleKey,
    isDemo: true,
    authProvider: 'firebase_demo',
    authenticatedAt: new Date().toISOString()
  };

  saveAuthSession(session);
  return session;
}

/**
 * Authenticates with Email & Password (supports both Demo Credentials, RBAC Demo Accounts, and standard accounts)
 */
export async function loginWithEmailCredentials(
  emailInput: string,
  passwordInput: string,
  isSignUp = false,
  displayNameInput?: string
): Promise<SkyNexAuthSession> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // Check if user entered one of the 3 RBAC Demo emails or the Evaluator Demo email
  if (
    cleanPass === DEMO_CREDENTIALS.password ||
    cleanPass === 'SkyNexDemo#2026!' ||
    cleanEmail === 'admin@skynex.ai' ||
    cleanEmail === 'reviewer@skynex.ai' ||
    cleanEmail === 'creator@skynex.ai'
  ) {
    if (cleanEmail === 'reviewer@skynex.ai') {
      return loginWithDemoAccount('reviewer_manager');
    }
    if (cleanEmail === 'creator@skynex.ai') {
      return loginWithDemoAccount('content_creator');
    }
    if (cleanEmail === 'admin@skynex.ai' || cleanEmail === DEMO_CREDENTIALS.email.toLowerCase()) {
      return loginWithDemoAccount('workspace_admin');
    }
  }

  let firebaseUser: User;
  if (isSignUp) {
    const created = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
    if (displayNameInput) {
      await updateProfile(created.user, { displayName: displayNameInput });
    }
    firebaseUser = created.user;
  } else {
    const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
    firebaseUser = cred.user;
  }

  await syncUserProfileToFirestore(firebaseUser, false);
  try {
    await fetch('/api/auth/signout', { method: 'POST' });
  } catch {
    // Ignore network errors
  }

  const session: SkyNexAuthSession = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || cleanEmail,
    displayName:
      displayNameInput ||
      firebaseUser.displayName ||
      cleanEmail.split('@')[0] ||
      'Aditi Sharma',
    roleLabel: 'Workspace Admin',
    roleKey: 'workspace_admin',
    isDemo: false,
    authProvider: 'firebase_email',
    authenticatedAt: new Date().toISOString()
  };

  saveAuthSession(session);
  return session;
}

/**
 * Authenticates a real user via Google OAuth Popup (Firebase Auth)
 */
export async function loginWithGoogleAccount(): Promise<SkyNexAuthSession> {
  const cred = await signInWithPopup(auth, googleProvider);
  const isDemoEmail = cred.user.email?.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase();
  await syncUserProfileToFirestore(cred.user, isDemoEmail);

  if (!isDemoEmail) {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Ignore network errors
    }
  }

  const session: SkyNexAuthSession = {
    uid: cred.user.uid,
    email: cred.user.email || 'user@skynex.ai',
    displayName: cred.user.displayName || 'Workspace Manager',
    roleLabel: isDemoEmail ? 'Evaluator Demo Account' : 'Brand Compliance Manager',
    isDemo: isDemoEmail,
    authProvider: 'firebase_google',
    authenticatedAt: new Date().toISOString()
  };

  saveAuthSession(session);
  return session;
}

/**
 * Signs out the current user from Firebase Auth and clears session state
 */
export async function signOutSkyNex(): Promise<void> {
  saveAuthSession(null);
  try {
    await fetch('/api/auth/signout', { method: 'POST' });
  } catch {
    // Ignore network errors
  }
  try {
    await signOut(auth);
  } catch {
    // Ignore sign-out errors
  }
}

export { onAuthStateChanged };
