import {
  extractAdvertisedDiscounts,
  extractPosterPrices,
  calculateExpectedPrice,
  formatCurrency,
  validatePosterDiscountAndPricing,
  classifyPosterEntities
} from '../src/utils/discountValidation.ts';
import type { BrandProduct } from '../src/types.ts';
import { NOVAPAY_BRAND } from '../src/data/mockBrands.ts';
import { runDeterministicAudit } from '../server.ts';

// Test Runner Helper
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failedCount++;
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedCount++;
    console.log(`✅ PASS: ${message}`);
  }
}

function runTest(name: string, fn: () => void) {
  console.log(`\n--- Test: ${name} ---`);
  try {
    fn();
  } catch (err: any) {
    console.error(`Error in "${name}":`, err.message);
  }
}

// Mock Active & Verified Product (NovaPay Cap)
const mockNovaPayCap: BrandProduct = {
  id: 'prod-np-cap-002',
  brandId: 'brand-novapay',
  brandName: 'NovaPay',
  name: 'NovaPay Cap',
  subtitle: 'Official Merchandise',
  sku: 'NP-CAP-002',
  category: 'Merchandise',
  status: 'Active',
  price: '₹799',
  priceVerified: true,
  description: 'Branded cap with embroidered logo',
  specifications: 'Cotton twill, brass buckle',
  packagingDetails: 'Polybag packaging',
  colors: ['#0F172A', '#2563EB'],
  logoPlacement: 'Center front embroidery',
  visualIdentityNotes: 'Official horizontal logo',
  approvedClaims: ['100% Cotton', 'Embroidered logo'],
  prohibitedClaims: ['Indestructible'],
  sourceRef: 'NovaPay Product Catalog §2.1',
  sourceType: 'official_catalog',
  updatedAt: '2026-10-10'
};

// Mock Unverified Product
const mockUnverifiedProduct: BrandProduct = {
  id: 'prod-np-notebook-005',
  brandId: 'brand-novapay',
  brandName: 'NovaPay',
  name: 'NovaPay Notebook',
  subtitle: 'A5 Spiral',
  sku: 'NP-NB-005',
  category: 'Stationery',
  status: 'Unverified',
  price: '₹349',
  priceVerified: false,
  description: 'A5 spiral notebook',
  specifications: '160 pages, ruled',
  packagingDetails: 'Shrink wrap',
  colors: ['#0F172A'],
  logoPlacement: 'Cover center',
  visualIdentityNotes: 'Front debossed',
  approvedClaims: ['Recycled paper'],
  prohibitedClaims: [],
  sourceRef: 'Draft Catalog',
  sourceType: 'official_catalog',
  updatedAt: '2026-10-01'
};

console.log('Starting SkyNex AI Brand Audit Discount Validation Test Suite...\n');

// 1. Percentage Discount Tests
runTest('Percentage Discount - Canonical Mismatch (₹799 with 10% OFF, poster ₹399)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap now at ₹399 with 10% OFF! Limited time festival deal.'
  });

  assert(result.status === 'fail', 'Status must be fail');
  assert(result.statusLabel === 'FAIL — Discount price mismatch', 'Status label indicates discount mismatch');
  assert(result.priceAuditDetails.verifiedOriginalPrice === '₹799', 'Verified original price is ₹799');
  assert(result.priceAuditDetails.detectedDiscount === '10% OFF', 'Detected discount is 10% OFF');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹719.10', 'Expected price is ₹719.10');
  assert(result.priceAuditDetails.actualPosterPrice === '₹399', 'Actual poster price is ₹399');
  assert(result.suggestedCorrection === '₹719.10', 'Suggested correction is ₹719.10');
  assert(!result.requiresHumanReview, 'Deterministic failure does not require human review');
});

runTest('Percentage Discount - Valid Match (₹799 with 10% OFF, poster ₹719.10)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap now at ₹719.10 with 10% OFF!'
  });

  assert(result.status === 'pass', 'Status must be pass');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹719.10', 'Expected selling price matches');
  assert(result.priceAuditDetails.actualPosterPrice === '₹719.10', 'Actual poster price matches');
  assert(result.priceAuditDetails.validationStatus === 'pass', 'Validation status is pass');
});

runTest('Percentage Discount - Calculation Formula', () => {
  const calc = calculateExpectedPrice(799, { type: 'percentage', value: 10 });
  assert(calc.expectedPrice === 719.1, 'Calculated expected price is 719.10');
  assert(calc.formula.includes('799 * (1 - 10 / 100)'), 'Formula contains percentage equation');
});

// 2. Flat Discount Tests
runTest('Flat Discount - Valid Match (₹799 with ₹100 OFF, poster ₹699)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'Grab your NovaPay Cap for ₹699! Flat ₹100 OFF today.'
  });

  assert(result.status === 'pass', 'Status must be pass');
  assert(result.priceAuditDetails.detectedDiscount === '₹100 OFF', 'Detected flat discount is ₹100 OFF');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹699', 'Expected price is ₹699');
  assert(result.priceAuditDetails.actualPosterPrice === '₹699', 'Actual price is ₹699');
});

runTest('Flat Discount - Mismatch (₹799 with ₹100 OFF, poster ₹599)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'Grab your NovaPay Cap for ₹599! Save ₹100 today.'
  });

  assert(result.status === 'fail', 'Status must be fail');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹699', 'Expected selling price is ₹699');
  assert(result.suggestedCorrection === '₹699', 'Suggested correction is ₹699');
  assert(result.priceAuditDetails.actualPosterPrice === '₹599', 'Actual price is ₹599');
});

// 3. Decimal Rounding & Tolerance Tests
runTest('Rounding Tolerance - 15% discount on ₹799 (₹679.15)', () => {
  const calc = calculateExpectedPrice(799, { type: 'percentage', value: 15 });
  assert(calc.expectedPrice === 679.15, '15% off 799 is 679.15');

  // Strict tolerance match
  const matchResult = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap for ₹679.15 with 15% OFF',
    options: { roundingTolerance: 0.05 }
  });
  assert(matchResult.status === 'pass', 'Exact decimal matches with 0.05 tolerance');

  // Decimal tolerance boundary test
  const outOfTolerance = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap for ₹675 with 15% OFF',
    options: { roundingTolerance: 0.05 }
  });
  assert(outOfTolerance.status === 'fail', 'Outside rounding tolerance fails');
});

// 4. Missing Discounts (No Discount Advertised)
runTest('Missing Discount - Poster price ₹449 without discount (bug reproduction)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap available now for ₹449!'
  });

  assert(result.status === 'fail', 'Status must be fail');
  assert(result.priceAuditDetails.detectedDiscount === 'None', 'Does not invent a discount');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹799', 'Expected price is verified catalog price ₹799');
  assert(result.suggestedCorrection === '₹799', 'Suggested correction is ₹799');
  assert(result.priceAuditDetails.actualPosterPrice === '₹449', 'Actual poster price is ₹449');
});

runTest('Missing Discount - Exact Verified Price matches (₹799)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap available for ₹799 with free delivery.'
  });

  assert(result.status === 'pass', 'Official price passes when no discount is advertised');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹799', 'Expected is official price ₹799');
});

// 5. Missing & Unverified Product Record Tests
runTest('Missing Product Record - Product not found in catalog', () => {
  const result = validatePosterDiscountAndPricing({
    productNotFound: true,
    draftText: 'Buy the new Apex Watch for ₹1999 with 20% OFF!'
  });

  assert(result.status === 'missing_product', 'Status must be missing_product');
  assert(result.statusLabel === 'FAIL — Missing Product Record', 'Status label indicates missing product');
  assert(result.priceAuditDetails.verifiedOriginalPrice === 'Missing from Catalog', 'Original price shows missing');
  assert(result.requiresHumanReview === true, 'Requires human review when product is missing');
});

runTest('Unverified Product Record - Product in Draft or Unverified status', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockUnverifiedProduct,
    draftText: 'NovaPay Notebook now for ₹199 with 10% OFF!'
  });

  assert(result.status === 'unverified_product', 'Status must be unverified_product');
  assert(result.statusLabel === 'FAIL — Unverified Catalog Price', 'Status label indicates unverified price');
  assert(result.requiresHumanReview === true, 'Requires human review when price is unverified');
});

// 6. Ambiguous / Conflicting Discounts & Prices Tests
runTest('Ambiguous Discounts - Multiple conflicting percentages (10% and 25% OFF)', () => {
  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: 'NovaPay Cap deal: 10% OFF today! Wait, get 25% OFF with coupon for ₹599.'
  });

  assert(result.status === 'ambiguous', 'Status must be ambiguous');
  assert(result.priceAuditDetails.isAmbiguous === true, 'isAmbiguous flag is true');
  assert(result.requiresHumanReview === true, 'Requires human review for ambiguity');
  assert(result.statusLabel.includes('AMBIGUOUS'), 'Status label indicates ambiguous');
});

// 7. False-Positive Immunity Tests
runTest('False-Positive Immunity - Fabric percentage (100% Cotton Twill)', () => {
  const discounts = extractAdvertisedDiscounts('NovaPay Cap made from 100% Organic Cotton Twill now for ₹799.');
  assert(discounts.length === 0, 'Does not treat fabric composition "100% Organic Cotton" as a discount');
});

// 8. Contextual Entity Classification & Non-Discount Claims Tests
runTest('Entity Classification - Discount phrases recognition', () => {
  const t1 = classifyPosterEntities('Special offer: 10% OFF on all items!');
  assert(t1.discount_percentage === 10, '10% OFF is recognized as discount');

  const t2 = classifyPosterEntities('Celebrate our anniversary with 20% discount across store.');
  assert(t2.discount_percentage === 20, '20% discount is recognized as discount');

  const t3 = classifyPosterEntities('Save 15% when you order online today.');
  assert(t3.discount_percentage === 15, 'Save 15% is recognized as discount');

  const t4 = classifyPosterEntities('Mega sale: Flat 30% OFF on premium collection!');
  assert(t4.discount_percentage === 30, 'Flat 30% OFF is recognized as discount');
});

runTest('Entity Classification - Non-discount claims recognition', () => {
  // 100% guaranteed investment returns
  const t1 = classifyPosterEntities('Invest now for 100% guaranteed investment returns!');
  assert(t1.discount_percentage === null, '100% guaranteed investment returns is NOT a discount');
  assert(t1.investment_or_financial_claims.some(c => c.includes('100% guaranteed investment returns')), 'Added to investment_or_financial_claims');

  // 100% natural
  const t2 = classifyPosterEntities('Formulated with 100% natural ingredients.');
  assert(t2.discount_percentage === null, '100% natural is NOT a discount');
  assert(t2.promotional_claims.some(c => c.includes('100% natural')), '100% natural added to promotional_claims');

  // 99% accuracy
  const t3 = classifyPosterEntities('Engineered for 99% accuracy in high-frequency trading.');
  assert(t3.discount_percentage === null, '99% accuracy is NOT a discount');
  assert(t3.promotional_claims.some(c => c.includes('99% accuracy')), '99% accuracy added to promotional_claims');

  // 100% satisfaction guaranteed
  const t4 = classifyPosterEntities('Try with confidence: 100% satisfaction guaranteed!');
  assert(t4.discount_percentage === null, '100% satisfaction guaranteed is NOT a discount');
  assert(t4.promotional_claims.some(c => c.includes('100% satisfaction guaranteed')), '100% satisfaction guaranteed added to promotional_claims');

  // Arbitrary percentage without discount keyword
  const t5 = classifyPosterEntities('Contains 15% zinc oxide and minerals.');
  assert(t5.discount_percentage === null, 'Arbitrary percentage without discount keyword is never a discount');
});

// 9. Lustrelane Jewellery Poster Regression Test (Requirement 7)
runTest('Lustrelane Jewellery Poster - Full Structured Entity Extraction', () => {
  const lustrelanePosterText = `
LUSTRELANE JEWELLERY
MEGA GOLD SALE
90% OFF TODAY ONLY
100% guaranteed investment returns
Certified 24K gold for every customer
BUY NOW
Limited offer. Safe for everyone. No risk.
`.trim();

  const entities = classifyPosterEntities(lustrelanePosterText);

  // Requirement 7 checks:
  // "90% OFF TODAY ONLY" → discount_percentage = 90
  assert(entities.discount_percentage === 90, 'discount_percentage = 90');

  // "100% guaranteed investment returns" → investment_or_financial_claim, NOT price or discount
  assert(
    entities.investment_or_financial_claims.some(c => c.includes('100% guaranteed investment returns')),
    '"100% guaranteed investment returns" classified as investment_or_financial_claim'
  );
  assert(entities.discount_percentage !== 100, 'discount_percentage is NOT 100');

  // "Certified 24K gold for every customer" → promotional/product claim, NOT price
  assert(
    entities.promotional_claims.some(c => c.includes('Certified 24K gold')),
    '"Certified 24K gold for every customer" classified as promotional_claims'
  );

  // No original price or final selling price is visibly specified
  assert(entities.original_price === null, 'original_price is null (no price visibly specified)');
  assert(entities.discounted_price === null, 'discounted_price is null (no price visibly specified)');
  assert(entities.flat_discount_amount === null, 'flat_discount_amount is null');

  // Ensure 24K and 100% are never parsed as prices by price extractor
  const prices = extractPosterPrices(lustrelanePosterText);
  assert(prices.length === 0, 'No false currency prices extracted from 24K or 100%');

  // Ensure extractAdvertisedDiscounts only extracts 90% OFF and ignores 100% guaranteed returns
  const discounts = extractAdvertisedDiscounts(lustrelanePosterText);
  assert(discounts.length === 1, 'Exactly 1 discount extracted');
  assert(discounts[0].value === 90, 'Extracted discount value is 90%');
});

// 10. Financial Claim Verification Finding in Audit Engine (Requirement 8)
runTest('Financial Claim Audit - Unverified financial returns marked for verification', () => {
  const lustrelanePosterText = `
LUSTRELANE JEWELLERY
MEGA GOLD SALE
90% OFF TODAY ONLY
100% guaranteed investment returns
Certified 24K gold for every customer
BUY NOW
`.trim();

  const { findings } = runDeterministicAudit(NOVAPAY_BRAND, lustrelanePosterText);

  // Must flag the financial return claim separately from price validation
  const finFinding = findings.find(f => f.ruleId === 'FIN-CLAIM-VERIFY');
  assert(Boolean(finFinding), 'FIN-CLAIM-VERIFY finding is generated for guaranteed investment returns');
  assert(finFinding?.classification === 'needs_human_verification', 'Classification is needs_human_verification');
  assert(finFinding?.severity === 'warning', 'Severity is warning');
  assert(finFinding?.requiresHumanReview === true, 'requiresHumanReview is true');
  assert(finFinding?.suggestedReplacement === undefined, 'Does not replace with dummy text');
  assert(
    Boolean(finFinding?.conflictText?.includes('100% guaranteed investment returns')),
    'Conflict text cites the 100% guaranteed investment returns claim'
  );

  // Must NOT generate false product price mismatch
  const priceMismatchFinding = findings.find(
    f => Boolean(f.ruleTitle?.includes('Price')) && f.classification === 'approved_fact_conflict'
  );
  assert(!priceMismatchFinding, 'No false price mismatch finding generated for Lustrelane poster');
});

// 11. NovaPay Cap Strikethrough Poster Test (Issue 3 Fix)
runTest('NovaPay Cap Poster - Strikethrough ₹449 with 10% OFF vs Displayed ₹399', () => {
  const capPosterText = `
NOVA PAY CAP
Everyday Style, Everyday Comfort.
Original Price (Strikethrough): ₹449
Discount Badge: 10% OFF
Current Price: ₹399
Product SKU: NP-CAP-002
`.trim();

  const result = validatePosterDiscountAndPricing({
    product: mockNovaPayCap,
    draftText: capPosterText
  });

  // Expected Selling Price = 449 * (1 - 0.10) = 404.10
  assert(result.status === 'fail', 'Status is fail');
  assert(result.priceAuditDetails.validationStatusLabel === 'Discount Price Mismatch', 'Validation status label is Discount Price Mismatch');
  assert(result.priceAuditDetails.verifiedOriginalPrice === '₹449', 'Original price is ₹449');
  assert(result.priceAuditDetails.detectedDiscount === '10% OFF', 'Detected discount is 10% OFF');
  assert(result.priceAuditDetails.expectedSellingPrice === '₹404.10', 'Expected price is ₹404.10');
  assert(result.priceAuditDetails.actualPosterPrice === '₹399', 'Actual poster price is ₹399');
  assert(result.suggestedCorrection === '₹404.10', 'Suggested fix is ₹404.10');
  assert(result.priceAuditDetails.calculationFormula?.includes('404.10') ?? false, 'Formula calculates 404.10');
  assert(Boolean(result.priceAuditDetails.mrpMismatch), 'mrpMismatch is recorded');
  assert(result.priceAuditDetails.mrpMismatch?.posterMrp === '₹449', 'Poster MRP is ₹449');
  assert(result.priceAuditDetails.mrpMismatch?.verifiedMrp === '₹799', 'Verified MRP is ₹799');
});

// Summary
console.log(`\n========================================`);
console.log(`Test Results: ${passedCount} passed, ${failedCount} failed`);
console.log(`========================================\n`);

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
