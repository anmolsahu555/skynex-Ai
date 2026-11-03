export type BrandId = 'novapay' | 'aerosip' | 'skynex' | string;

export type UserRole =
  | 'workspace_admin'
  | 'reviewer_manager'
  | 'content_creator'
  | 'creator'
  | 'brand_manager'
  | 'legal_counsel'
  | 'executive';

export interface RolePermissions {
  // Core 3-Role RBAC Capabilities
  canAccessAllModules: boolean;
  canUploadContent: boolean;
  canSubmitContent: boolean;
  canRunAiAudits: boolean;
  canViewAuditFindings: boolean;
  canAcceptRejectFindings: boolean;
  canGenerateCreatives: boolean;
  canApproveCreatives: boolean;
  canRequestChangesFromCreator: boolean;
  canSubmitForManagerApproval: boolean;
  canManageBrandDna: boolean;
  canManageProductCatalog: boolean;
  canManageRegulatoryRules: boolean;
  canViewAllAuditHistory: boolean;
  canInviteRemoveUsers: boolean;
  canAssignUserRoles: boolean;
  canManageWorkspaceSettings: boolean;
  canViewAllUserActivities: boolean;
  // Backward-compatible permission flags
  canApplyFixes: boolean;
  canEditDraft: boolean;
  canApproveWaiver: boolean;
  canManageRules: boolean;
  canDeprecateRules: boolean;
  canExecuteMemo: boolean;
  canExportAuditLog: boolean;
  canClearLegalFlags: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'workspace_admin' | 'reviewer_manager' | 'content_creator';
  roleLabel: 'Workspace Admin' | 'Reviewer & Manager' | 'Content Creator';
  title: string;
  department: string;
  location: string;
  email: string;
  initials: string;
  avatarColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  permissions: RolePermissions;
  description: string;
  responsibilities: string[];
  restrictions: string[];
}

export type RuleCategory =
  | 'Terminology'
  | 'Pricing & Facts'
  | 'Prohibited Claim'
  | 'Performance & Claims'
  | 'Tone & Style'
  | 'Visual Identity'
  | 'Messaging & Claims'
  | 'Prohibited Content'
  | 'Legal & Compliance'
  | 'Accessibility';

export type RuleSeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ImportedKnowledgeCategory =
  | 'Brand Identity'
  | 'Brand Voice & Writing Style'
  | 'Product Knowledge'
  | 'Pricing & Commercial Information'
  | 'Claims & Supporting Evidence'
  | 'Channel-Specific Guidelines'
  | 'Accessibility & Other Brand Requirements';

export type RuleApprovalStatus = 'Approved' | 'Draft' | 'Unverified';

export type CandidateReviewStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Verification'
  | 'Conflicting Information';

export type FindingClassification =
  | 'confirmed_rule_conflict'
  | 'approved_fact_conflict'
  | 'prohibited_claim'
  | 'unsupported_claim'
  | 'style_tone_suggestion'
  | 'needs_human_verification';

export type ReviewStatusOutcome =
  | 'issues_found'
  | 'no_issues_detected'
  | 'needs_human_verification'
  | 'partial_review_ai_unavailable'
  | 'extraction_incomplete'
  | 'changes_applied';

export type ContentApprovalStatus =
  | 'pending_review'
  | 'submitted_for_approval'
  | 'approved_for_publication'
  | 'changes_requested'
  | 'rejected'
  | 'escalated_for_verification';

export type DecisionStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'verification_requested';

export interface RuleVersionEntry {
  version: number;
  title: string;
  category?: RuleCategory;
  ruleStatement: string;
  approvedValue: string;
  targetPatterns: string[];
  sourceRef?: string;
  sourceDocumentName?: string;
  sourcePage?: string;
  sourceSection?: string;
  severity?: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  status?: RuleApprovalStatus;
  explanation?: string;
  updatedAt: string;
  updatedBy: string;
  updatedByRole?: string;
  changedFields?: string[];
  changeSummary?: string;
}

export interface MergedSourceRef {
  documentId?: string;
  filename: string;
  location: string;
  excerpt: string;
}

export interface BrandRule {
  id: string;
  brandId: BrandId;
  category: RuleCategory;
  importedCategory?: ImportedKnowledgeCategory;
  title: string;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  sourceRef: string;
  sourceDocumentName?: string;
  sourcePage?: string;
  sourceSection?: string;
  status: RuleApprovalStatus;
  classification: FindingClassification;
  severity: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  explanation: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByRole?: string;
  // Extended traceability & versioning fields (Sections 9 & 11)
  version?: number;
  versionHistory?: RuleVersionEntry[];
  sourceDocumentId?: string;
  sourceFilename?: string;
  sourceLocation?: string;
  evidenceExcerpt?: string;
  fullSourceContext?: string;
  mergedSources?: MergedSourceRef[];
  approvedBy?: string;
  approvedAt?: string;
  revalidationRequired?: boolean;
  revalidatedAt?: string;
  affectedReportCountOnLastEdit?: number;
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    conditions?: string;
  };
  regulatoryDepartment?: GovernmentDepartmentId | string;
  isGovernmentMandated?: boolean;
  departmentName?: string;
  nodalMinistry?: string;
  complianceCategory?: string;
  sourceUrl?: string;
  sourcePageTitle?: string;
  extractedAt?: string;
}

export type CompanyTypeOption =
  | 'SaaS'
  | 'E-commerce'
  | 'Retail'
  | 'Fintech'
  | 'Healthcare'
  | 'Education'
  | 'Agency'
  | 'Other';

export interface BrandOnboardingProfile {
  companyName: string;
  companyType: CompanyTypeOption;
  description?: string;
  mainChannels: string[];
  preferredLanguage?: string;
  preferredTone?: string;
  suggestedCategories: ImportedKnowledgeCategory[];
  updatedAt: string;
}

export interface StructuredColumnMapping {
  productNameCol: string;
  skuCol: string;
  descriptionCol: string;
  priceCol: string;
  currencyCol: string;
  billingPeriodCol: string;
  approvedClaimsCol: string;
  sourceRefCol: string;
}

export interface StructuredRowValidationError {
  rowIndex: number; // 1-indexed data row
  rawRow: Record<string, string>;
  issues: string[];
  isValid: boolean;
}

export interface StructuredCataloguePreview {
  documentId: string;
  filename: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  columnMapping: StructuredColumnMapping;
  validationResults: StructuredRowValidationError[];
  validRowCount: number;
  invalidRowCount: number;
}

export interface Organization {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  createdAt: string;
}

export interface SourceDocument {
  id: string;
  orgId?: string;
  brandId: BrandId;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'md' | 'image' | 'unsupported';
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy?: string;
  processingStatus: 'queued' | 'processed' | 'partial' | 'needs_attention' | 'failed';
  extractionStatus: 'complete' | 'partial_extraction' | 'structured_catalogue' | 'failed';
  pageOrSectionCount: number;
  chunksProcessed: number;
  unprocessedSections: string[];
  errorMessage?: string;
  isApprovedExample?: boolean;
  extractedCharCount?: number;
  extractedText?: string;
  extractedSections?: { title?: string; page?: number; content: string }[];
  structuredTables?: { sheetName?: string; headers: string[]; rows: any[] }[];
  candidateRuleIds?: string[];
  storagePath?: string;
  structuredCatalogue?: StructuredCataloguePreview;
}

export interface CompetingConflictOption {
  candidateId: string;
  value: string;
  ruleText: string;
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  effectiveDate?: string;
  evidenceExcerpt: string;
}

export interface KnowledgeCandidate {
  id: string;
  brandId: BrandId;
  category: ImportedKnowledgeCategory;
  engineCategory: RuleCategory;
  title: string;
  extractedRule: string;
  relevantValue: string;
  targetPatterns: string[];
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    conditions?: string;
  };
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  evidenceExcerpt: string;
  fullSourceContext: string;
  status: CandidateReviewStatus;
  confidence?: 'high' | 'medium' | 'low';
  severity?: 'critical' | 'warning' | 'info';
  ruleStatement?: string;
  approvedValue?: string;
  // Duplicate & Conflict Tracking
  isDuplicate?: boolean;
  duplicateOfRuleId?: string;
  mergedSources?: MergedSourceRef[];
  conflictKey?: string;
  conflictTopic?: string;
  competingOptions?: CompetingConflictOption[];
  resolvedValue?: string;
  // Style / Example Tracking
  isFromApprovedExample?: boolean;
  contradictsExplicitRuleId?: string;
  contradictionNote?: string;
  // Audit trail
  reviewedBy?: string;
  reviewedAt?: string;
  promotedRuleId?: string;
  createdAt: string;
}

export interface ExtractedPdfRule {
  id: string;
  tempId?: string;
  title: string;
  category: RuleCategory;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  severity: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  pageNumber?: string | number;
  sourcePage?: number;
  sourceDocumentName?: string;
  sourceSection?: string;
  sourceVerified?: boolean;
  evidenceExcerpt?: string;
  sourceExcerpt?: string;
  sourceRef: string;
  confidenceScore: number;
  needsManualReview?: boolean;
  status?: RuleApprovalStatus;
  isDuplicate?: boolean;
  duplicateOfRuleId?: string;
  isSelected?: boolean;
  explanation?: string;
}

export interface PdfRuleExtractionSummary {
  filename?: string;
  fileSizeBytes?: number;
  pageCount?: number;
  totalExtracted: number;
  highConfidenceCount: number;
  needsReviewCount: number;
  duplicateCount: number;
  aiUsed?: boolean;
  categoryBreakdown?: Record<string, number>;
  charCount?: number;
}

export interface ImportProcessingSummary {
  sessionId: string;
  timestamp: string;
  filesProcessedSuccessfully: number;
  filesNeedingAttention: number;
  candidateRulesExtracted: number;
  potentialDuplicatesCount: number;
  conflictingRulesCount: number;
  unprocessedSections: { filename: string; section: string; reason: string }[];
  categoriesCoverage: Record<ImportedKnowledgeCategory, 'found' | 'not_found'>;
  aiUsed: boolean;
  aiWarning?: string;
}

export interface SampleScenario {
  id: string;
  brandId: BrandId;
  title: string;
  badge: string;
  contentType: string;
  text: string;
  description: string;
}

export interface ApprovedBrandColor {
  name: string;
  hex: string;
  usage: 'primary' | 'secondary' | 'accent' | 'background';
  description?: string;
}

export interface ApprovedLogoRef {
  name: string;
  description: string;
  approvedVariants: string[];
  unapprovedVariants: string[];
  sourceRef: string;
}

export interface VisualGuideline {
  id: string;
  category: 'Logo & Lockup' | 'Color & Contrast' | 'Layout & Typography' | 'Accessibility';
  title: string;
  requirement: string;
  sourceRef: string;
}

export interface SampleAdImage {
  id: string;
  title: string;
  filename: string;
  assetPath: string;
  badge: string;
  description: string;
  expectedIssues: string[];
}

export type BrandProductStatus = 'Active' | 'Draft' | 'Unverified';

export interface BrandProduct {
  id: string;
  brandId: BrandId;
  name: string;
  brandName: string;
  subtitle: string;
  category: string;
  sku: string;
  status: BrandProductStatus;
  imageUrl?: string;
  description: string;
  specifications: string;
  price?: string;
  priceVerified: boolean;
  packagingDetails: string;
  colors: string[];
  logoPlacement: string;
  visualIdentityNotes: string;
  approvedClaims: string[];
  prohibitedClaims: string[];
  sourceRef: string;
  sourceType: 'manual' | 'image_ocr' | 'product_lookup' | 'official_catalog';
  uncertainFields?: string[];
  updatedAt: string;
}

export interface BrandProfile {
  id: BrandId;
  orgId?: string;
  name: string;
  fictionalLabel?: string;
  tagline?: string;
  industry?: string;
  description?: string;
  preferredLanguage?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  moreColors?: string[];
  logoUrl?: string;
  brandAssets?: { id: string; name: string; size: number; type: string; uploadedAt: string }[];
  approvedColors?: ApprovedBrandColor[];
  approvedLogoRef?: ApprovedLogoRef;
  visualGuidelines?: VisualGuideline[];
  onboarding?: BrandOnboardingProfile;
  rules: BrandRule[];
  products?: BrandProduct[];
  sourceDocuments?: SourceDocument[];
  knowledgeCandidates?: KnowledgeCandidate[];
  lastImportSummary?: ImportProcessingSummary;
  sampleScenarios?: SampleScenario[];
  sampleAdImages?: SampleAdImage[];
  brandDnaProfile?: BrandDnaProfile;
  brandDnaHistory?: BrandDnaProfile[];
  consistencyChecks?: BrandConsistencyCheckResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BoundingBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
  unit: 'percent' | 'pixels';
}

export interface ClassifiedPercentage {
  raw: string;
  value: number;
  category: 'discount' | 'financial_investment_claim' | 'product_quality_claim' | 'other_claim';
  phrase: string;
  startIndex: number;
  endIndex: number;
}

export interface ClassifiedPosterEntities {
  original_price: string | null;
  discounted_price: string | null;
  discount_percentage: number | null;
  flat_discount_amount: number | null;
  promotional_claims: string[];
  investment_or_financial_claims: string[];
  rawPercentages?: ClassifiedPercentage[];
}

export interface PriceAuditDetails {
  verifiedOriginalPrice: string;
  originalPriceAmount: number | null;
  detectedDiscount: string;
  discountType: 'percentage' | 'flat' | 'none' | 'ambiguous';
  discountValue: number | null;
  expectedSellingPrice: string;
  expectedPriceAmount: number | null;
  actualPosterPrice: string;
  actualPriceAmount: number | null;
  validationStatus: 'pass' | 'fail' | 'ambiguous' | 'unverified_product' | 'missing_product';
  validationStatusLabel: string;
  suggestedCorrection?: string;
  productSku?: string;
  productName?: string;
  calculationFormula?: string;
  explanation: string;
  isAmbiguous?: boolean;
  ambiguityReason?: string;
  mrpMismatch?: {
    posterMrp: string;
    verifiedMrp: string;
  };
  classifiedEntities?: ClassifiedPosterEntities;
}

export interface AuditFinding {
  id: string;
  classification: FindingClassification;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  originalSpan: string;
  startIndex: number;
  endIndex: number;
  conflictText: string;
  ruleId?: string;
  ruleVersion?: number;
  ruleTitle?: string;
  approvedRuleCitation: string;
  sourceReference?: string;
  sourceLocation?: string;
  explanation: string;
  suggestedReplacement?: string;
  requiresHumanReview: boolean;
  engine: 'deterministic' | 'gemini' | 'vision_ocr';
  decision: DecisionStatus;
  editedReplacement?: string;
  rejectionReason?: string;
  reviewerComment?: string;
  decidedBy?: string;
  decidedAt?: string;
  timestamp: string;
  // Image Review Extensions
  targetType?: 'text' | 'visual_element';
  visualElementLabel?: string;
  boundingBox?: BoundingBox;
  certainty?: 'confirmed' | 'needs_verification' | 'suggestion';
  designerRecommendation?: string;
  // Price & Discount Audit Details (Requirement 7)
  priceAuditDetails?: PriceAuditDetails;
}

export interface DraftVersion {
  versionNumber: number;
  contentText: string;
  changeSummary: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export interface VisualCheckSummary {
  detectedColors?: string[];
  detectedLogoVariant?: string;
  logoMatchesApproved?: boolean;
  layoutNotes?: string;
  accessibilityNotes?: string;
  colorPaletteCompliant?: boolean;
}

export interface AuditReport {
  id: string;
  brandId: BrandId;
  brandName: string;
  campaign: string;
  contentType: string;
  title: string;
  sourceFilename?: string;
  originalText: string;
  currentText: string;
  versions: DraftVersion[];
  findings: AuditFinding[];
  toneSummary?: string;
  checksExecuted: {
    deterministic: boolean;
    deterministicRulesChecked: number;
    geminiContextual: boolean;
    geminiSuccess: boolean;
    geminiError?: string;
    ocrExecuted?: boolean;
    ocrSuccess?: boolean;
    visionExecuted?: boolean;
    visionSuccess?: boolean;
    visionError?: string;
  };
  // Image Review Attributes
  mediaType?: 'text' | 'document' | 'image';
  imageUrl?: string;
  imageMetadata?: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    format?: string;
  };
  extractedImageText?: string;
  extractionConfidence?: 'complete' | 'partial' | 'uncertain' | 'failed';
  visualAnalysisStatus?: 'complete' | 'incomplete' | 'failed' | 'not_applicable';
  visualSummary?: VisualCheckSummary;
  overallStatus: ReviewStatusOutcome;
  contentApprovalStatus: ContentApprovalStatus;
  contentApprovedBy?: string;
  contentApprovedAt?: string;
  contentApprovalNotes?: string;
  submittedBy: string;
  submittedByRole: string;
  submittedByRoleKey: UserRole;
  createdAt: string;
  completedAt?: string;
}

export interface AffectedDraftRef {
  reportId: string;
  title: string;
  contentType: string;
  submittedAt: string;
  matchedSpan: string;
}

export interface RecurringPattern {
  id: string;
  brandId: BrandId;
  brandName: string;
  category: string;
  ruleId: string;
  ruleTitle: string;
  ruleCitation: string;
  conflictSummary: string;
  occurrenceCount: number;
  distinctDraftCount: number;
  affectedDrafts: AffectedDraftRef[];
  affectedChannels: string[];
  firstSeen: string;
  lastSeen: string;
  thresholdTriggered: boolean;
  status: 'monitoring' | 'alert_active' | 'investigating' | 'resolved';
  rootCause?: 'unclear_guidelines' | 'outdated_approved_info' | 'training_need';
  rootCauseNotes?: string;
  correctiveActionTaken?: string;
  investigatedBy?: string;
  actionDate?: string;
}

export interface RecurrenceThresholdConfig {
  minOccurrences: number;
  minDistinctDrafts: number;
  windowDays: number;
}

// ============================================================================
// BRAND DNA ANALYZER & CONSISTENCY CHECKER TYPES
// ============================================================================

export interface BrandDnaColor {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'neutral';
  usageNotes: string;
  confidence: number; // 0.0 - 1.0
  sourceEvidence?: string;
}

export interface BrandDnaTypography {
  headingFont: string;
  bodyFont: string;
  monoFont?: string;
  hierarchyNotes: string;
  weightScale: string;
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaLogoUsage {
  detectedLogoUrl?: string;
  logoDescription: string;
  placementPattern: string;
  clearSpaceRule: string;
  prohibitedUsages: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaVisualIdentity {
  layoutPattern: string;
  spacingSystem: string;
  buttonAndComponentStyle: string;
  imageAndIllustrationStyle: string;
  designPatterns: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaVoice {
  toneAttributes: string[];
  writingStyle: string;
  preferredMessaging: string[];
  prohibitedPhrases: string[];
  sampleHeadlines: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaReferenceItem {
  id: string;
  type: 'website_page' | 'uploaded_image' | 'social_url';
  title: string;
  urlOrFilename: string;
  thumbnailUrl?: string;
  extractedSnippet?: string;
  analyzedAt: string;
}

// ============================================================================
// WEBSITE INTELLIGENCE & BRAND DNA EXTRACTION TYPES
// ============================================================================

export type BrandDnaIntelligenceCategory =
  | 'visual_identity'
  | 'website_policies'
  | 'product_intelligence'
  | 'brand_communication'
  | 'approved_facts';

export type WebsiteRuleCategory =
  | 'Brand Guidelines'
  | 'Content Policies'
  | 'Advertising Guidelines'
  | 'Logo & Visual Identity Rules'
  | 'Product Representation Guidelines'
  | 'Pricing & Promotional Restrictions'
  | 'Copyright & Trademark Policies'
  | 'Claims & Endorsement Restrictions'
  | 'Regulatory & Compliance Requirements'
  | 'Platform Publishing Rules'
  | 'Terms & Conditions'
  | 'Privacy Policy'
  | 'Refund & Cancellation'
  | 'Product & Service Rules'
  | 'Pricing & Payment'
  | 'Marketing & Communication'
  | 'Disclaimers'
  | 'Other Rules';

export type ContentVerificationStatus =
  | 'Compliant'
  | 'Potential Violation'
  | 'Missing Information'
  | 'Requires Verification'
  | 'COMPLIANT'
  | 'NON-COMPLIANT'
  | 'NEEDS REVIEW';

export type ComplianceVerdictStatus = 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS REVIEW';

export interface ContentVerificationFinding {
  id: string;
  status: ContentVerificationStatus;
  detectedContent: string;
  detectedElement?: string;
  relevantRuleTitle: string;
  exactExtractedRule?: string;
  relevantRuleCategory: WebsiteRuleCategory | string;
  originalWebsiteText: string;
  sourceUrl: string;
  sourcePageTitle?: string;
  sourceWebsite?: string;
  sectionHeading?: string;
  explanation: string;
  imageEvidence?: string;
  visualRelationshipAnalysis?: string;
  semanticIntentAnalysis?: string;
  contextualVerificationNote?: string;
  suggestedCorrection: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';
}

export interface ContentVerificationReport {
  id: string;
  verifiedAt: string;
  contentTitle: string;
  contentFileName?: string;
  contentType: 'image' | 'text' | 'document';
  overallStatus: ContentVerificationStatus;
  complianceStatus?: ComplianceVerdictStatus;
  totalRulesChecked: number;
  rulesMatched: number;
  potentialViolationsCount: number;
  missingInformationCount: number;
  requiresVerificationCount: number;
  findings: ContentVerificationFinding[];
  extractedTextSnippet?: string;
  visualAnalysisSummary?: string;
  semanticAnalysisSummary?: string;
  contextualVerificationSummary?: string;
  aiUsed: boolean;
  legalDisclaimer: string;
}

export type BrandDnaVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface DiscoveredWebPage {
  url: string;
  path: string;
  title: string;
  pageType:
    | 'homepage'
    | 'about'
    | 'terms'
    | 'privacy'
    | 'refund'
    | 'shipping'
    | 'faq'
    | 'products'
    | 'pricing'
    | 'disclaimer'
    | 'guidelines'
    | 'other';
  status: 'crawled' | 'inaccessible' | 'skipped';
  httpStatus?: number;
  errorMessage?: string;
  wordCount?: number;
  extractedItemsCount: number;
  crawledAt: string;
  sourceKind?: 'Official Website Page' | 'Official Policy / Documentation' | 'Restricted / Unreachable Page';
}

export interface ExtractedBrandIntelligenceItem {
  id: string;
  category: BrandDnaIntelligenceCategory | WebsiteRuleCategory | string;
  ruleCategory?: WebsiteRuleCategory | string;
  subCategory: string; // e.g. "Terms & Conditions", "Refund Policy", "Pricing Plan", "Brand Tone", "Verified Credentials"
  title: string; // Rule title
  ruleDescription?: string; // Rule description
  originalExtractedText: string; // EXACT verbatim excerpt from crawled website
  originalWebsiteText?: string; // Exact verbatim excerpt alias
  aiExplanation: string; // AI simplified explanation
  simplifiedExplanation?: string; // AI simplified explanation alias
  structuredRule: {
    ruleStatement: string;
    targetPatterns: string[];
    approvedValue: string;
    severity: 'critical' | 'warning' | 'info';
    ruleCategory: RuleCategory; // For Brand Knowledge rules
  };
  productDetails?: {
    productName: string;
    sku: string;
    price?: string;
    specifications?: string;
    approvedClaims?: string[];
    prohibitedClaims?: string[];
    subscriptionInterval?: string;
  };
  sourceDocDetails?: {
    docType: 'Terms & Conditions' | 'Privacy Policy' | 'Refund Policy' | 'Shipping Policy' | 'Disclaimer' | 'Brand Guidelines' | 'Other' | string;
    sectionTitle?: string;
  };
  sourceWebsite?: string; // Detected source website / organization name
  sourceDomain?: string; // Website domain (e.g. youtube.com, nike.com)
  sectionHeading?: string; // Relevant section or heading on the source page
  sourcePageTitle: string; // Original source page title
  originalWebsiteUrl: string; // Exact source URL
  sourceUrl?: string; // Exact source URL alias
  isOfficialSource?: boolean;
  extractedAt: string; // Extraction date and time (ISO timestamp)
  verificationStatus: BrandDnaVerificationStatus;
  userEdited?: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface BrandDnaRescanDiffItem {
  id: string;
  changeType: 'new_page' | 'modified_policy' | 'unchanged' | 'removed_page';
  pageTitle: string;
  url: string;
  summary: string;
  previousSnippet?: string;
  currentSnippet?: string;
  highlightedDiff?: {
    type: 'added' | 'removed' | 'modified';
    statement: string;
  }[];
  proposedUpdates: ExtractedBrandIntelligenceItem[];
  appliedStatus: 'pending_review' | 'approved' | 'dismissed';
}

export interface BrandDnaProfile {
  id: string;
  brandId: BrandId;
  brandName: string;
  detectedWebsiteName?: string;
  websiteDomain?: string;
  organizationName?: string;
  websiteCategory?: string;
  extractionStatus?: string;
  sourcesAccessedCount?: number;
  sourceType: 'website' | 'social';
  sourceUrl?: string;
  analyzedAt: string;
  updatedAt: string;
  overallConfidence: number;
  extractionMethod:
    | 'live_html_css_plus_gemini'
    | 'live_html_css_deterministic'
    | 'vision_reference_plus_gemini'
    | 'vision_reference_deterministic';
  aiUsed: boolean;
  limitationNotice?: string;
  colors: BrandDnaColor[];
  typography: BrandDnaTypography;
  logoUsage: BrandDnaLogoUsage;
  visualIdentity: BrandDnaVisualIdentity;
  brandVoice: BrandDnaVoice;
  referenceContent: BrandDnaReferenceItem[];
  // Extended Website Intelligence Fields
  crawledPages?: DiscoveredWebPage[];
  extractedItems?: ExtractedBrandIntelligenceItem[];
  rescanDiffs?: BrandDnaRescanDiffItem[];
  lastScanSummary?: {
    totalPagesFound: number;
    pagesCrawled: number;
    pagesInaccessible: number;
    totalItemsExtracted: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
  savedToKnowledgeAt?: string;
  syncedKnowledgeCounts?: {
    rules: number;
    assets: number;
    sourceDocs: number;
    products: number;
    rulesAdded?: number;
    assetsUpdated?: number;
    sourcesAdded?: number;
    productsAdded?: number;
  };
  isSaved: boolean;
  latestVerificationReport?: ContentVerificationReport;
  verificationHistory?: ContentVerificationReport[];
}

export type BrandConsistencyCategoryName =
  | 'Color Palette'
  | 'Typography'
  | 'Logo Usage'
  | 'Layout & Spacing'
  | 'Imagery & Style'
  | 'Brand Voice & Messaging';

export interface BrandConsistencyCategoryScore {
  category: BrandConsistencyCategoryName;
  score: number; // 0 - 100
  weight: number; // percentage weight summing to 100
  summary: string;
}

export interface BrandConsistencyIssue {
  id: string;
  category: BrandConsistencyCategoryName;
  issueType: 'objective_violation' | 'design_recommendation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  detectedValue: string;
  approvedBrandRule: string;
  evidence: string;
  recommendedCorrection: string;
  selectedForFix?: boolean;
}

export interface BrandConsistencyCheckResult {
  id: string;
  brandId: BrandId;
  dnaProfileId: string;
  creativeTitle: string;
  filename: string;
  originalImageUrl: string;
  correctedImageUrl?: string;
  correctionAppliedSummary?: string[];
  overallScore: number; // 0 - 100
  scoringMethodology: string;
  categoryScores: BrandConsistencyCategoryScore[];
  issues: BrandConsistencyIssue[];
  extractedText: string;
  detectedDominantColors: string[];
  imageDimensions: { width: number; height: number };
  aiUsed: boolean;
  analyzedAt: string;
  approvalStatus?: 'pending' | 'approved' | 'revision_requested';
}

// ============================================================================
// BRAND RULE TESTER & AI-ASSISTED RULE AUTHORING TYPES
// ============================================================================

export interface RuleTestFinding {
  id: string;
  engine: 'deterministic' | 'ai_assessment';
  matchedPattern: string;
  matchedSpan: string;
  startIndex?: number;
  endIndex?: number;
  reason: string;
  suggestedFix: string;
  ruleSource: string;
  severity: RuleSeverityLevel;
  confidence?: number;
}

export interface RuleTestResult {
  passed: boolean;
  testedAt: string;
  ruleId: string;
  ruleTitle: string;
  ruleStatus: RuleApprovalStatus;
  enforcementNotice: string;
  inputType: 'text' | 'image';
  sampleTextEvaluated: string;
  deterministicMatches: RuleTestFinding[];
  aiAssessments: RuleTestFinding[];
  aiUsed: boolean;
  aiNote?: string;
}

// ============================================================================
// AI AUTO-FIX CREATIVE & SECOND AUDIT TYPES
// ============================================================================

export interface AppliedCorrectionItem {
  findingId: string;
  ruleId?: string;
  ruleTitle?: string;
  category?: string;
  originalSpan: string;
  suggestedFix: string;
  isApplied: boolean;
  visualImpact?: string;
}

export interface ResolvedAuditIssue {
  id: string;
  ruleId?: string;
  ruleTitle?: string;
  category?: string;
  originalSpan: string;
  resolvedText: string;
  status: 'resolved';
  explanation: string;
}

export interface RemainingAuditIssue {
  id: string;
  ruleId?: string;
  ruleTitle?: string;
  category?: string;
  originalSpan: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'remaining';
  explanation: string;
  suggestedReplacement?: string;
}

export interface NewAuditIssue {
  id: string;
  ruleId?: string;
  ruleTitle?: string;
  category?: string;
  originalSpan: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'newly_detected';
  explanation: string;
  suggestedReplacement?: string;
}

export interface SecondAuditComparison {
  auditCompleted: boolean;
  resolvedIssues: ResolvedAuditIssue[];
  remainingIssues: RemainingAuditIssue[];
  newIssues: NewAuditIssue[];
  totalPreviousIssues: number;
  totalResolved: number;
  totalRemaining: number;
  totalNew: number;
  complianceScore: number; // e.g. 100% or percentage of passed rules
  secondAuditReportId?: string;
  analyzedAt: string;
  auditNotes: string;
}

export interface AutoFixCreativeResult {
  id: string;
  reportId: string;
  brandId: BrandId;
  brandName: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  generatedImageBase64?: string;
  promptUsed: string;
  appliedCorrections: AppliedCorrectionItem[];
  rejectedFindingsCount: number;
  pendingFindingsCount: number;
  secondAudit: SecondAuditComparison;
  generationEngine: 'gemini-3.1-flash-lite-image' | 'gemini-nano-banana-2.1' | string;
  status: 'generated' | 'approved' | 'changes_requested';
  generatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  brandDnaRulesAppliedCount?: number;
  regulatoryRulesAppliedCount?: number;
}

export type GovernmentDepartmentId =
  | 'ccpa'
  | 'fssai'
  | 'dca'
  | 'meity'
  | 'cdsco'
  | 'sebi'
  | 'asci';

export type DepartmentMonitoringStatus = 'active' | 'syncing' | 'paused';

export interface RegulatoryUpdate {
  id: string;
  departmentId: GovernmentDepartmentId;
  departmentName: string;
  circularNumber: string;
  title: string;
  summary: string;
  issuedDate: string;
  effectiveDate: string;
  impactLevel: 'Critical' | 'High' | 'Medium';
  relevantIndustries: string[];
  recommendedAction: string;
  officialWebsite: string;
  isRead: boolean;
  associatedRuleId?: string;
}

export interface GovernmentDepartment {
  id: GovernmentDepartmentId;
  code: string;
  name: string;
  fullName: string;
  nodalMinistry: string;
  shortDescription: string;
  focusAreas: string[];
  officialWebsite: string;
  actName: string;
  statutoryRole: string;
  monitoringStatus: DepartmentMonitoringStatus;
  lastSyncedAt: string;
  badgeColor: string;
  iconName: string;
  rules: BrandRule[];
  updates: RegulatoryUpdate[];
}

export interface RegulatoryComplianceOverview {
  connectedSourcesCount: number;
  totalSourcesCount: number;
  activeComplianceRulesCount: number;
  pendingApprovalsCount: number;
  newRegulatoryUpdatesCount: number;
  lastGlobalSyncAt: string;
  departments?: GovernmentDepartment[];
}

// ============================================================================
// WORKSPACE RBAC, TEAM MANAGEMENT & ACTIVITY LOG TYPES
// ============================================================================

export type CanonicalRoleKey = 'workspace_admin' | 'reviewer_manager' | 'content_creator';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: CanonicalRoleKey;
  roleLabel: 'Workspace Admin' | 'Reviewer & Manager' | 'Content Creator';
  department: string;
  location: string;
  initials: string;
  avatarColor: string;
  status: 'Active' | 'Invited';
  joinedAt: string;
  lastActiveAt: string;
  isDemoAccount?: boolean;
}

export interface WorkspaceGovernanceSettings {
  workspaceName: string;
  organizationDomain: string;
  requireManagerApprovalForCreatives: boolean;
  autoRunSecondAuditOnRegeneration: boolean;
  enforceStatutoryGovernmentRules: boolean;
  restrictRuleEditingToWorkspaceAdmin: boolean;
  restrictCatalogToWorkspaceAdmin: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkspaceActivityEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'Workspace Admin' | 'Reviewer & Manager' | 'Content Creator' | string;
  actionType:
    | 'role_switched'
    | 'content_uploaded'
    | 'audit_executed'
    | 'finding_decision'
    | 'creative_generated'
    | 'creative_approved'
    | 'changes_requested'
    | 'submitted_for_approval'
    | 'rule_updated'
    | 'brand_dna_updated'
    | 'user_invited'
    | 'user_role_changed'
    | 'user_removed'
    | 'settings_updated';
  summary: string;
  targetBrand?: string;
  reportId?: string;
}

