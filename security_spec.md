# SkyNex AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Isolation Boundaries
1. **Default Deny**: All unmatched paths in Firestore are unconditionally denied (`allow read, write: if false;`).
2. **PII Split-Collection Isolation**: User email addresses are strictly isolated inside `/users/{userId}/private/{docId}` (`docId == 'info'`) and can only be read or created by the verified owner (`request.auth.uid == userId`).
3. **Demo User Restriction**: The dedicated Evaluator Demo account (`demo@skynex.ai` or `isDemo == true`) is isolated from production user collections and cannot modify or delete other users' production records.
4. **Strict Key & Size Enforcement**: Every string field enforces strict `minLength`, `maxLength`, and regex patterns (`^[a-zA-Z0-9_\-]+$` for IDs) matching `firebase-blueprint.json`.
5. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must match server `request.time`.
6. **Immutable Ownership**: `uid`, `isDemo`, and `createdAt` fields cannot be altered after creation.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Creating `/users/user_1` with `request.auth == null`.
2. **Identity Spoofing on Create**: User `user_1` creating `/users/user_1` with `uid: "user_2"`.
3. **Shadow Field Injection on Create**: Creating `/users/user_1` with an undeclared field `isAdmin: true`.
4. **Role Escalation on Create**: Non-demo user setting an arbitrary role outside `['Brand Compliance Manager', 'Evaluator Demo Account', 'Content Reviewer']`.
5. **ID Poisoning Attack**: Targeting `/users/bad$id!@#` with invalid characters.
6. **Denial-of-Wallet Oversized String**: Setting `displayName` to a 5,000-character string (`> 100`).
7. **Timestamp Forgery on Create**: Providing a past/future timestamp (`createdAt != request.time`).
8. **Immutable Field Mutation on Update**: Updating `/users/user_1` to change `uid` or `createdAt` or `isDemo`.
9. **Shadow Field Injection on Update**: Updating `/users/user_1` with an extra key `role: 'superadmin'` outside `affectedKeys().hasOnly(['displayName', 'updatedAt'])`.
10. **Cross-User PII Read**: User `user_2` attempting `get` on `/users/user_1/private/info`.
11. **Demo User Modifying Production Profile**: Demo account attempting `delete` on `/users/user_1`.
12. **Orphaned Subcollection Write**: Creating `/users/user_1/private/info` when parent `/users/user_1` does not exist.
