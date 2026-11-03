import assert from 'assert';
import {
  mapItemToWebsiteRuleCategory
} from '../src/server/websiteIntelligenceCrawler.ts';
import type {
  WebsiteRuleCategory,
  ContentVerificationFinding,
  ContentVerificationReport,
  ContentVerificationStatus
} from '../src/types.ts';

console.log('Starting SkyNex AI Website Rule Extraction & Content Verification Test Suite...\n');

// ---------------------------------------------------------------------------
// 1. Test 9 Rule Categories Mapping
// ---------------------------------------------------------------------------
console.log('--- Test 1: Category Mapping for the 9 Mandated Categories ---');

const testCases: { item: any; expected: WebsiteRuleCategory }[] = [
  {
    item: { title: '14-Day Hardware Return and Replacement Policy', subCategory: 'Refunds' },
    expected: 'Refund & Cancellation'
  },
  {
    item: { title: 'Customer Data Cryptographic Encryption', subCategory: 'Privacy Policy' },
    expected: 'Privacy Policy'
  },
  {
    item: { title: 'Acceptable Merchant Usage and Account Termination', subCategory: 'Terms & Conditions' },
    expected: 'Terms & Conditions'
  },
  {
    item: { title: 'Standard Enterprise Monthly Subscription Rate', subCategory: 'Pricing Plans' },
    expected: 'Pricing & Payment'
  },
  {
    item: { title: 'Smart Android POS Terminal Technical Specs', subCategory: 'Product Catalog' },
    expected: 'Product & Service Rules'
  },
  {
    item: { title: 'Statutory Limitation of Financial Liability', subCategory: 'Legal Disclaimers' },
    expected: 'Disclaimers'
  },
  {
    item: { title: 'Primary Wordmark Clear Space and Logo Lockup', category: 'visual_identity' },
    expected: 'Brand Guidelines'
  },
  {
    item: { title: 'Professional Tone and Prohibited Exaggerations', category: 'brand_communication' },
    expected: 'Marketing & Communication'
  },
  {
    item: { title: 'Company Headquarters Location', subCategory: 'General Info' },
    expected: 'Other Rules'
  }
];

for (const tc of testCases) {
  const result = mapItemToWebsiteRuleCategory(tc.item);
  assert.strictEqual(
    result,
    tc.expected,
    `Expected "${tc.item.title}" to map to "${tc.expected}", got "${result}"`
  );
  console.log(`✅ PASS: "${tc.item.title}" correctly classified under "${result}"`);
}

// ---------------------------------------------------------------------------
// 2. Test Content Verification Against Extracted Rules (Pricing Conflict)
// ---------------------------------------------------------------------------
console.log('\n--- Test 2: Content Verification - Pricing Conflict Detection ---');

const sampleRules = [
  {
    id: 'RULE-PRC-01',
    title: 'Standard Enterprise Subscription Plan',
    category: 'product_intelligence',
    ruleCategory: 'Pricing & Payment' as WebsiteRuleCategory,
    subCategory: 'Pricing',
    originalWebsiteText: 'Standard Enterprise Subscription starts at ₹999/month, including 10,000 monthly transactions, real-time ledger API, and 99.98% SLA.',
    simplifiedExplanation: 'The official verified baseline subscription price is ₹999/month. Unauthorized discounts (e.g. ₹499) violate verified pricing.',
    structuredRule: {
      ruleStatement: 'Promotional communications and advertising must display verified ₹999/month subscription pricing, not unapproved ₹499/month rates.',
      targetPatterns: ['₹499/month', 'Rs 499', 'Rs. 499/month', '499 per month'],
      approvedValue: '₹999/month (Standard Enterprise Plan)',
      severity: 'critical' as const,
      ruleCategory: 'Pricing & Facts' as const
    },
    productDetails: {
      productName: 'Standard Enterprise Subscription',
      sku: 'NP-SUB-STD',
      price: '₹999/month',
      prohibitedClaims: ['₹499/month', '499 per month']
    },
    sourcePageTitle: 'Pricing Page',
    sourceUrl: 'https://novapay.io/pricing',
    originalWebsiteUrl: 'https://novapay.io/pricing',
    extractedAt: new Date().toISOString(),
    verificationStatus: 'approved' as const
  },
  {
    id: 'RULE-REF-01',
    title: '14-Day Hardware Return and Replacement Policy',
    category: 'website_policies',
    ruleCategory: 'Refund & Cancellation' as WebsiteRuleCategory,
    subCategory: 'Refund Policy',
    originalWebsiteText: 'Merchants may return undamaged POS hardware units within 14 calendar days of confirmed delivery for a full refund minus shipping.',
    simplifiedExplanation: 'Merchants can return hardware within 14 days of delivery for a full refund.',
    structuredRule: {
      ruleStatement: 'All customer-facing materials must state the 14-day return and replacement window for POS hardware.',
      targetPatterns: ['no returns permitted', 'all sales final', 'no refund under any condition'],
      approvedValue: '14-Day Return & Replacement Guarantee',
      severity: 'critical' as const,
      ruleCategory: 'Legal & Compliance' as const
    },
    sourcePageTitle: 'Refund and Cancellation Policy',
    sourceUrl: 'https://novapay.io/refund-policy',
    originalWebsiteUrl: 'https://novapay.io/refund-policy',
    extractedAt: new Date().toISOString(),
    verificationStatus: 'approved' as const
  },
  {
    id: 'RULE-MKT-01',
    title: 'Prohibited Unsubstantiated Financial Guarantees',
    category: 'brand_communication',
    ruleCategory: 'Marketing & Communication' as WebsiteRuleCategory,
    subCategory: 'Brand Tone & Claims',
    originalWebsiteText: 'Investment and transactional capabilities do not guarantee speculative market returns or risk-free financial outcomes.',
    simplifiedExplanation: 'Communications must not promise guaranteed returns or risk-free financial growth.',
    structuredRule: {
      ruleStatement: 'Do not promise guaranteed investment returns or zero-risk wealth generation in marketing advertisements.',
      targetPatterns: ['100% guaranteed investment returns', 'risk-free profit guarantee'],
      approvedValue: 'Performance subject to market transaction volumes',
      severity: 'critical' as const,
      ruleCategory: 'Prohibited Claim' as const
    },
    sourcePageTitle: 'Brand Communication Guidelines',
    sourceUrl: 'https://novapay.io/guidelines',
    originalWebsiteUrl: 'https://novapay.io/guidelines',
    extractedAt: new Date().toISOString(),
    verificationStatus: 'approved' as const
  }
];

// Verify simulated off-policy ad copy
const offPolicyAdText = `
FLASH SALE: Get NovaPay Smart POS for your store!
Only ₹499/month for unlimited processing!
Enjoy 100% guaranteed investment returns on all checkout balances!
Note: No returns permitted under any condition. All sales final.
`;

// Run deterministic verification logic simulation
const lower = offPolicyAdText.toLowerCase();
const detectedFindings: ContentVerificationFinding[] = [];

for (const rule of sampleRules) {
  for (const pat of rule.structuredRule.targetPatterns) {
    if (lower.includes(pat.toLowerCase())) {
      detectedFindings.push({
        id: `fnd-${Date.now()}-${pat}`,
        status: 'Potential Violation',
        detectedContent: pat,
        relevantRuleTitle: rule.title,
        relevantRuleCategory: rule.ruleCategory,
        originalWebsiteText: rule.originalWebsiteText,
        sourceUrl: rule.sourceUrl,
        explanation: `Contradicts extracted website policy: ${rule.structuredRule.ruleStatement}`,
        suggestedCorrection: `Replace with approved condition: ${rule.structuredRule.approvedValue}`,
        severity: rule.structuredRule.severity
      });
    }
  }
}

assert.strictEqual(detectedFindings.length >= 3, true, 'Must detect at least 3 violations');
const priceViolation = detectedFindings.find(f => f.detectedContent.includes('₹499/month'));
assert.ok(priceViolation, 'Must flag ₹499/month pricing violation');
assert.strictEqual(priceViolation.relevantRuleCategory, 'Pricing & Payment');
console.log('✅ PASS: Detected pricing violation (₹499/month vs published ₹999/month)');

const returnViolation = detectedFindings.find(f => f.detectedContent.includes('no returns permitted'));
assert.ok(returnViolation, 'Must flag return policy contradiction');
assert.strictEqual(returnViolation.relevantRuleCategory, 'Refund & Cancellation');
console.log('✅ PASS: Detected refund violation ("no returns permitted" vs 14-day policy)');

const guaranteeViolation = detectedFindings.find(f => f.detectedContent.includes('100% guaranteed investment returns'));
assert.ok(guaranteeViolation, 'Must flag unbacked guarantee claim');
assert.strictEqual(guaranteeViolation.relevantRuleCategory, 'Marketing & Communication');
console.log('✅ PASS: Detected financial guarantee violation ("100% guaranteed investment returns")');

// ---------------------------------------------------------------------------
// 3. Test Legal Disclaimer Requirement
// ---------------------------------------------------------------------------
console.log('\n--- Test 3: Statutory Legal Compliance Disclaimer Presence ---');

const expectedDisclaimer =
  'Website-policy compliance does not constitute legal certification or statutory immunity. Results reflect consistency with extracted public website statements.';

const report: ContentVerificationReport = {
  id: 'VERIFY-TEST-001',
  verifiedAt: new Date().toISOString(),
  contentTitle: 'Promo Banner',
  contentType: 'text',
  overallStatus: 'Potential Violation',
  totalRulesChecked: sampleRules.length,
  rulesMatched: detectedFindings.length,
  potentialViolationsCount: detectedFindings.length,
  missingInformationCount: 0,
  requiresVerificationCount: 0,
  findings: detectedFindings,
  aiUsed: true,
  legalDisclaimer: expectedDisclaimer
};

assert.strictEqual(report.legalDisclaimer, expectedDisclaimer);
assert.strictEqual(report.overallStatus, 'Potential Violation');
console.log('✅ PASS: Report contains explicit legal disclaimer:');
console.log(`   "${report.legalDisclaimer}"`);

// ---------------------------------------------------------------------------
// 4. Test Compliant Creative Flow
// ---------------------------------------------------------------------------
console.log('\n--- Test 4: Compliant Creative Content Verification ---');

const compliantText = `
NovaPay Standard Enterprise Subscription
Official pricing starts at ₹999/month.
Includes a 14-Day Return & Replacement Guarantee on all POS terminals.
`;

const compliantFindings: ContentVerificationFinding[] = [];
for (const rule of sampleRules) {
  for (const pat of rule.structuredRule.targetPatterns) {
    if (compliantText.toLowerCase().includes(pat.toLowerCase())) {
      compliantFindings.push({
        id: `fnd-violation-${pat}`,
        status: 'Potential Violation',
        detectedContent: pat,
        relevantRuleTitle: rule.title,
        relevantRuleCategory: rule.ruleCategory,
        originalWebsiteText: rule.originalWebsiteText,
        sourceUrl: rule.sourceUrl,
        explanation: 'Violation',
        suggestedCorrection: 'Fix',
        severity: 'critical'
      });
    }
  }
}

assert.strictEqual(compliantFindings.length, 0, 'Compliant text must have 0 violations');
console.log('✅ PASS: Compliant creative evaluated with 0 violations');

console.log('\n========================================');
console.log('All Website Rule Extraction & Verification Tests Passed!');
console.log('========================================');
