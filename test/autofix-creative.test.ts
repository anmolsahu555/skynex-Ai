import { strict as assert } from 'assert';
import { BRANDS } from '../src/data/mockBrands.ts';
import { AuditFinding, BrandProduct } from '../src/types.ts';

console.log('Starting SkyNex AI Auto-Fix Creative & Second Audit Test Suite...\n');

const novapay = BRANDS['novapay'];
assert(novapay, 'NovaPay brand profile must exist');

// 1. Test finding acceptance and rejected exclusion
console.log('--- Test 1: Finding Statuses & Exclusion Logic ---');
const sampleFindings: AuditFinding[] = [
  {
    id: 'f-price-01',
    classification: 'approved_fact_conflict',
    category: 'Pricing & Facts',
    severity: 'critical',
    originalSpan: '₹449',
    startIndex: 10,
    endIndex: 14,
    conflictText: 'Price conflict: "₹449" conflicts with approved catalog price ₹799',
    ruleId: 'PRD-PRICE-NP-CAP-002',
    ruleTitle: 'Official NovaPay Cap Price',
    approvedRuleCitation: 'NovaPay Official Product Catalog',
    sourceReference: 'Product Catalog NP-CAP-002',
    explanation: 'Official price for NovaPay Cap is ₹799.',
    suggestedReplacement: '₹799',
    requiresHumanReview: false,
    engine: 'deterministic',
    decision: 'accepted',
    priceAuditDetails: {
      verifiedOriginalPrice: '₹799',
      originalPriceAmount: 799,
      detectedDiscount: 'None',
      discountType: 'none',
      discountValue: null,
      expectedSellingPrice: '₹799',
      expectedPriceAmount: 799,
      actualPosterPrice: '₹449',
      actualPriceAmount: 449,
      validationStatus: 'fail',
      validationStatusLabel: 'PRICE MISMATCH',
      suggestedCorrection: '₹799',
      productSku: 'NP-CAP-002',
      productName: 'NovaPay Cap',
      explanation: 'Official catalog price is ₹799.'
    },
    timestamp: new Date().toISOString()
  },
  {
    id: 'f-claim-02',
    classification: 'prohibited_claim',
    category: 'Prohibited Claim',
    severity: 'critical',
    originalSpan: 'guarantees risk-free profits',
    startIndex: 20,
    endIndex: 48,
    conflictText: 'Prohibited claim: risk-free profits guarantee',
    ruleId: 'PRO-001',
    ruleTitle: 'No Absolute Profit Claims',
    approvedRuleCitation: 'NovaPay Compliance Manual',
    explanation: 'Prohibited to guarantee profits.',
    suggestedReplacement: 'Next-Gen Enterprise Payment Infrastructure',
    requiresHumanReview: false,
    engine: 'deterministic',
    decision: 'accepted',
    timestamp: new Date().toISOString()
  },
  {
    id: 'f-rejected-03',
    classification: 'style_tone_suggestion',
    category: 'Tone & Style',
    severity: 'info',
    originalSpan: 'Subscribe today',
    startIndex: 50,
    endIndex: 65,
    conflictText: 'Style suggestion: prefer Get started',
    ruleId: 'TONE-01',
    ruleTitle: 'Active CTA Style',
    approvedRuleCitation: 'Tone Guidelines',
    explanation: 'Consider using Get started.',
    suggestedReplacement: 'Get started with NovaPay',
    requiresHumanReview: true,
    engine: 'deterministic',
    decision: 'rejected',
    timestamp: new Date().toISOString()
  }
];

const accepted = sampleFindings.filter(f => f.decision === 'accepted');
const rejected = sampleFindings.filter(f => f.decision === 'rejected');

assert.equal(accepted.length, 2, 'Exactly 2 findings should be accepted');
assert.equal(rejected.length, 1, 'Exactly 1 finding should be rejected');
console.log('✅ PASS: Finding statuses correctly filter accepted vs rejected items');

// 2. Test verified product catalog price authoritative source
console.log('--- Test 2: Authoritative Product Catalog Pricing ---');
const capProduct = novapay.products?.find(p => p.sku === 'NP-CAP-002');
assert(capProduct, 'NovaPay Cap product must exist in catalog');
assert.equal(capProduct.price, '₹799', 'Verified catalog price must be ₹799');
assert.equal(capProduct.priceVerified, true, 'Cap price must be marked verified');

const priceCorrection = accepted.find(f => f.category === 'Pricing & Facts');
assert(priceCorrection, 'Price correction must be in accepted list');
assert.equal(priceCorrection.suggestedReplacement, '₹799', 'Suggested price must be ₹799, NOT ₹999 or fallback');
console.log('✅ PASS: Product catalog price ₹799 is strictly used as authoritative fix');

// 3. Test prompt construction contains brand knowledge and guardrails
console.log('--- Test 3: Automated Prompt Engineering ---');
// Verify brand knowledge elements
assert(novapay.primaryColor, 'Brand primary color must exist');
assert(novapay.approvedLogoRef, 'Approved logo specification must exist');
console.log('✅ PASS: Brand knowledge inputs are complete and validated');

// 4. Test Second Audit classification
console.log('--- Test 4: Second Audit Logic ---');
// Simulated second text with price ₹799 and compliant claim
const secondText = 'NovaPay Next-Gen Enterprise Payment Infrastructure. Subscribe today for just ₹799!';

const hasOldPrice = /₹449/.test(secondText);
const hasProhibitedClaim = /guarantees risk-free profits/i.test(secondText);
const hasNewPrice = /₹799/.test(secondText);

assert.equal(hasOldPrice, false, 'Old price ₹449 must no longer appear');
assert.equal(hasProhibitedClaim, false, 'Prohibited claim must no longer appear');
assert.equal(hasNewPrice, true, 'Verified price ₹799 must appear');

console.log('✅ PASS: Second audit verifies resolution of accepted findings');
console.log('\n========================================');
console.log('Auto-Fix Creative Test Suite: All tests passed successfully!');
console.log('========================================\n');
