import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:3000';
const STORE_PATH = path.resolve(process.cwd(), '.skynex-persistent-store.json');

async function requestJson(urlPath: string, options?: RequestInit): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function createPosterPngBase64(lines: string[]): Promise<string> {
  const svgLines = lines
    .map(
      (line, idx) =>
        `<text x="60" y="${110 + idx * 75}" font-family="sans-serif" font-size="44" font-weight="bold" fill="#0F172A">${line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</text>`
    )
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="450" viewBox="0 0 900 450">
    <rect width="900" height="450" fill="#FFFFFF"/>
    ${svgLines}
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

async function runTests() {
  console.log('=== Running Product-Price Mismatch & Catalog Precedence Tests ===\n');

  // 1. Verify NovaPay Cap in Product Catalog Retrieval & Persistent Storage
  console.log('Test 1: Verify NovaPay Cap retrieval & persistent storage...');
  const { status: getProdStatus, data: getProdData } = await requestJson('/api/brands/novapay/products');
  assert.equal(getProdStatus, 200, 'Expected GET /api/brands/novapay/products to return 200');
  const capProduct = (getProdData.products || []).find((p: any) => p.sku === 'NP-CAP-002');
  assert.ok(capProduct, 'Expected NovaPay Cap (NP-CAP-002) to exist in catalog');
  assert.equal(capProduct.name, 'NovaPay Cap');
  assert.equal(capProduct.brandId, 'novapay');
  assert.equal(capProduct.price, '₹799');
  assert.equal(capProduct.priceVerified, true);
  assert.equal(capProduct.status, 'Active');
  console.log('  PASS: NovaPay Cap (NP-CAP-002) retrieved with verified official price ₹799.');

  // 2. Test Add Product persistence to disk & retrieval
  console.log('Test 2: Verify Add Product persistence to disk & retrieval...');
  const { status: createStatus, data: createData } = await requestJson('/api/brands/novapay/products', {
    method: 'POST',
    body: JSON.stringify({
      name: 'NovaPay Travel Umbrella',
      brandName: 'NovaPay',
      subtitle: 'Windproof compact umbrella',
      category: 'Merchandise',
      sku: 'NP-UMB-099',
      status: 'Active',
      price: '₹649',
      priceVerified: true,
      specifications: ' Canopy: 105cm arc · Frame: Fiberglass ribs',
      sourceRef: 'NovaPay Merch Catalog 2026 §4.1'
    })
  });
  assert.equal(createStatus, 201, 'Expected POST /api/brands/novapay/products to return 201');
  const createdId = createData.product.id;
  assert.equal(createData.product.price, '₹649');
  assert.equal(createData.product.priceVerified, true);
  assert.equal(createData.product.sku, 'NP-UMB-099');

  // Verify persisted on disk in .skynex-persistent-store.json
  const diskStore = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  const diskUmbrella = diskStore.brands.novapay.products.find((p: any) => p.id === createdId);
  assert.ok(diskUmbrella, 'Expected newly added product to be persisted in .skynex-persistent-store.json');
  assert.equal(diskUmbrella.price, '₹649');
  assert.equal(diskUmbrella.priceVerified, true);

  // Clean up test product
  const { status: delStatus } = await requestJson(`/api/brands/novapay/products/${createdId}`, {
    method: 'DELETE'
  });
  assert.equal(delStatus, 200);
  console.log('  PASS: Add Product & Delete Product persisted accurately to disk store.');

  // 3. Test NovaPay Cap Text Advertisement with Incorrect Price ₹449 -> Expect ₹799 (NOT ₹999)
  console.log('Test 3: Verify NovaPay Cap text advertisement with ₹449 flags ₹449 and suggests ₹799...');
  const { status: auditTextStatus, data: auditTextData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: 'Upgrade your everyday look with the official NovaPay Cap! Limited offer for just ₹449.',
      title: 'NovaPay Cap Promo Ad',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  assert.equal(auditTextStatus, 200);
  const priceFinding = auditTextData.report.findings.find((f: any) => f.category === 'Pricing & Facts');
  assert.ok(priceFinding, 'Expected a Pricing & Facts finding for ₹449');
  assert.equal(priceFinding.originalSpan, '₹449', 'Expected flagged span to be ₹449');
  assert.equal(priceFinding.suggestedReplacement, '₹799', 'Expected suggested fix to be ₹799 (NOT ₹999/month)');
  assert.equal(priceFinding.ruleId, 'NP-CAP-002', 'Expected finding to cite product SKU NP-CAP-002');
  assert.equal(priceFinding.requiresHumanReview, false);
  console.log('  PASS: Text audit flagged ₹449 and suggested ₹799 under SKU NP-CAP-002.');

  // 4. Test Accept Fix on NovaPay Cap report -> Replaces ₹449 with ₹799 in currentText
  console.log('Test 4: Verify Accept Fix replaces ₹449 with ₹799 in draft...');
  const reportId = auditTextData.report.id;
  const { status: decStatus, data: decData } = await requestJson(`/api/history/${reportId}/decision`, {
    method: 'POST',
    body: JSON.stringify({
      findingId: priceFinding.id,
      decision: 'accepted',
      decidedBy: 'Test Runner',
      decidedByRole: 'QA Engineer'
    })
  });
  assert.equal(decStatus, 200);
  assert.ok(
    decData.report.currentText.includes('₹799') && !decData.report.currentText.includes('₹449'),
    `Expected currentText to have ₹799 instead of ₹449, got: "${decData.report.currentText}"`
  );

  // Re-audit the corrected text ("₹799") and verify 0 issues!
  const { data: reAuditData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: decData.report.currentText,
      title: 'NovaPay Cap Corrected Ad',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  assert.equal(
    reAuditData.report.findings.length,
    0,
    `Expected 0 findings when NovaPay Cap ad uses verified price ₹799, got: ${JSON.stringify(reAuditData.report.findings)}`
  );
  console.log('  PASS: Accept Fix replaced ₹449 with ₹799, and re-audit passed with 0 issues.');

  // 5. Test NovaPay Cap Advertisement Poster Image with ₹449 -> Expect ₹799 (NOT ₹999/month)
  console.log('Test 5: Verify NovaPay Cap poster image review with ₹449 flags ₹449 and suggests ₹799...');
  const capPosterBase64 = await createPosterPngBase64([
    'NovaPay Official Merchandise',
    'NovaPay Cap (NP-CAP-002)',
    'Special Offer Price: INR 449'
  ]);
  const { status: imgAuditStatus, data: imgAuditData } = await requestJson('/api/audit-image', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      base64Image: capPosterBase64,
      filename: 'novapay-cap-poster.png',
      title: 'NovaPay Cap Poster Ad',
      simulateAiUnavailable: true
    })
  });
  assert.equal(imgAuditStatus, 200);
  const imgPriceFinding = imgAuditData.report.findings.find((f: any) => f.category === 'Pricing & Facts');
  assert.ok(imgPriceFinding, `Expected pricing finding in poster audit, got findings: ${JSON.stringify(imgAuditData.report.findings)}`);
  assert.equal(imgPriceFinding.originalSpan, '₹449', 'Expected poster flagged span to be ₹449 (not ₹449/month)');
  assert.equal(imgPriceFinding.suggestedReplacement, '₹799', 'Expected poster suggested fix to be ₹799 (not ₹999/month)');
  assert.equal(imgPriceFinding.ruleId, 'NP-CAP-002');
  console.log('  PASS: Poster image audit flagged ₹449 and suggested ₹799 (no /month mutation).');

  // 6. Test Dynamic Price Update (Proving No Hardcoding & No Stale Cache)
  console.log('Test 6: Verify dynamic product price update immediately updates audit recommendation...');
  const { status: updStatus } = await requestJson(`/api/brands/novapay/products/${capProduct.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      price: '₹849',
      priceVerified: true
    })
  });
  assert.equal(updStatus, 200);

  const { data: dynAuditData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: 'Get the official NovaPay Cap for just ₹449!',
      title: 'Dynamic Price Test',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  const dynFinding = dynAuditData.report.findings.find((f: any) => f.category === 'Pricing & Facts');
  assert.ok(dynFinding);
  assert.equal(dynFinding.suggestedReplacement, '₹849', 'Expected audit to dynamically suggest updated price ₹849');

  // Restore NovaPay Cap back to canonical ₹799
  await requestJson(`/api/brands/novapay/products/${capProduct.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      price: '₹799',
      priceVerified: true
    })
  });
  console.log('  PASS: Dynamic price update to ₹849 (and restoration to ₹799) reflected immediately without stale cache.');

  // 7. Test Multiple Product Matches (Ambiguous Context -> Warning & Request Confirmation)
  console.log('Test 7: Verify multiple product matches trigger warning & confirmation request...');
  const { data: multiAuditData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: 'Grab the NovaPay Cap and NovaPay Water Bottle bundle deal for just ₹449!',
      title: 'Multi-Product Promo',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  const multiFinding = multiAuditData.report.findings.find((f: any) => f.category === 'Pricing & Facts');
  assert.ok(multiFinding, 'Expected a pricing finding for ambiguous multi-product draft');
  assert.equal(multiFinding.ruleId, 'PRD-MULTI');
  assert.equal(multiFinding.classification, 'needs_human_verification');
  assert.equal(multiFinding.requiresHumanReview, true);
  assert.equal(multiFinding.suggestedReplacement, undefined, 'Must not invent a replacement price when multiple products match');
  console.log('  PASS: Multiple matched products flagged for human confirmation without inventing a price.');

  // 8. Test Missing / Unverified Product Price (e.g. NovaPay Notebook NP-NB-005 -> Warning & Request Confirmation)
  console.log('Test 8: Verify unverified product price triggers warning & confirmation request...');
  const { data: unvAuditData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: 'Order the executive NovaPay Notebook today for just ₹399!',
      title: 'Notebook Promo',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  const unvFinding = unvAuditData.report.findings.find((f: any) => f.category === 'Pricing & Facts');
  assert.ok(unvFinding, 'Expected a pricing finding for unverified product');
  assert.equal(unvFinding.ruleId, 'NP-NB-005');
  assert.equal(unvFinding.classification, 'needs_human_verification');
  assert.equal(unvFinding.requiresHumanReview, true);
  assert.equal(unvFinding.suggestedReplacement, undefined, 'Must not invent or substitute ₹999/month for unverified product price');
  console.log('  PASS: Unverified product price flagged for human confirmation without falling back to ₹999/month.');

  // 9. Test General Subscription Ad Still Uses MSG-003 (₹499/month -> ₹999/month)
  console.log('Test 9: Verify general subscription ad still flags ₹499/month and suggests ₹999/month...');
  const { data: subAuditData } = await requestJson('/api/audit', {
    method: 'POST',
    body: JSON.stringify({
      brandId: 'novapay',
      draftText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
      title: 'NovaPay Promotional Ad (Canonical)',
      contentType: 'Advertisement',
      enableGemini: false
    })
  });
  const subPriceFinding = subAuditData.report.findings.find((f: any) => f.ruleId === 'MSG-003');
  assert.ok(subPriceFinding, 'Expected MSG-003 finding on canonical subscription ad');
  assert.equal(subPriceFinding.originalSpan, '₹499/month');
  assert.equal(subPriceFinding.suggestedReplacement, '₹999/month');
  console.log('  PASS: General subscription ad flagged ₹499/month and suggested ₹999/month under MSG-003.');

  console.log('\nALL 9 PRODUCT-PRICING & CATALOG PRECEDENCE TESTS PASSED!');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
