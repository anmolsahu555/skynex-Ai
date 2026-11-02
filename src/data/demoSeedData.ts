import {
  BrandDnaProfile,
  ExtractedBrandIntelligenceItem,
  DiscoveredWebPage,
  ContentVerificationReport,
  AuditReport,
  BrandConsistencyCheckResult,
  BrandProfile
} from '../types.ts';
import { BRANDS } from './mockBrands.ts';

export const DEMO_DISCOVERED_PAGES: DiscoveredWebPage[] = [
  {
    url: 'https://novapay.io/',
    path: '/',
    title: 'NovaPay — Enterprise Payment Gateway & Smart POS Infrastructure',
    pageType: 'homepage',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 840,
    extractedItemsCount: 4,
    crawledAt: '2026-10-30T10:15:00.000Z'
  },
  {
    url: 'https://novapay.io/about',
    path: '/about',
    title: 'About NovaPay — Regulated FinTech & PCI-DSS Level 1 Infrastructure',
    pageType: 'about',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 620,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:02.000Z'
  },
  {
    url: 'https://novapay.io/terms',
    path: '/terms',
    title: 'Terms & Conditions — Merchant Master Service Agreement',
    pageType: 'terms',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 1450,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:04.000Z'
  },
  {
    url: 'https://novapay.io/privacy',
    path: '/privacy',
    title: 'Privacy Policy & Data Localization Compliance (RBI & DPDP Act)',
    pageType: 'privacy',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 1120,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:06.000Z'
  },
  {
    url: 'https://novapay.io/refund-policy',
    path: '/refund-policy',
    title: 'Refund, Return & Subscription Cancellation Policy',
    pageType: 'refund',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 780,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:08.000Z'
  },
  {
    url: 'https://novapay.io/shipping',
    path: '/shipping',
    title: 'POS Hardware Shipping & Express Courier Delivery SLA',
    pageType: 'shipping',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 510,
    extractedItemsCount: 1,
    crawledAt: '2026-10-30T10:15:10.000Z'
  },
  {
    url: 'https://novapay.io/pricing',
    path: '/pricing',
    title: 'Pricing & Enterprise Subscription Plans — ₹999/month',
    pageType: 'pricing',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 690,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:12.000Z'
  },
  {
    url: 'https://novapay.io/products',
    path: '/products',
    title: 'Products & Official Merchandise Catalog (Smart POS, Cap, Bottle, Tee)',
    pageType: 'products',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 930,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:14.000Z'
  },
  {
    url: 'https://novapay.io/guidelines',
    path: '/guidelines',
    title: 'Brand Identity, Logo Lockup & Marketing Communication Guidelines',
    pageType: 'guidelines',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 880,
    extractedItemsCount: 2,
    crawledAt: '2026-10-30T10:15:16.000Z'
  },
  {
    url: 'https://novapay.io/disclaimer',
    path: '/disclaimer',
    title: 'Statutory Financial Risk & Regulatory Disclaimers',
    pageType: 'disclaimer',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 640,
    extractedItemsCount: 1,
    crawledAt: '2026-10-30T10:15:18.000Z'
  },
  {
    url: 'https://novapay.io/faq',
    path: '/faq',
    title: 'Frequently Asked Questions — Settlement Timelines & Support',
    pageType: 'faq',
    status: 'crawled',
    httpStatus: 200,
    wordCount: 590,
    extractedItemsCount: 1,
    crawledAt: '2026-10-30T10:15:20.000Z'
  },
  {
    url: 'https://novapay.io/partner-portal',
    path: '/partner-portal',
    title: 'Restricted Partner Portal (SSO Authentication Required)',
    pageType: 'other',
    status: 'inaccessible',
    httpStatus: 403,
    errorMessage: 'HTTP 403 Forbidden — Partner SSO authentication required; skipped per public crawler compliance policy.',
    wordCount: 0,
    extractedItemsCount: 0,
    crawledAt: '2026-10-30T10:15:22.000Z'
  }
];

export const DEMO_EXTRACTED_WEBSITE_RULES: ExtractedBrandIntelligenceItem[] = [
  {
    id: 'RULE-DEMO-PRC-01',
    category: 'product_intelligence',
    ruleCategory: 'Pricing & Payment',
    subCategory: 'Pricing & Subscription Plans',
    title: 'Standard Enterprise Subscription Rate (₹999/month)',
    originalExtractedText:
      'The NovaPay Standard Enterprise Subscription is billed at ₹999/month (inclusive of 10,000 monthly API transactions, real-time settlement dashboard, and 99.98% uptime SLA). Legacy promotional rates of ₹499/month are retired and must not be advertised.',
    originalWebsiteText:
      'The NovaPay Standard Enterprise Subscription is billed at ₹999/month (inclusive of 10,000 monthly API transactions, real-time settlement dashboard, and 99.98% uptime SLA). Legacy promotional rates of ₹499/month are retired and must not be advertised.',
    aiExplanation:
      'All marketing creatives and sales collateral must state the verified ₹999/month subscription price. Advertising ₹499/month is strictly prohibited.',
    simplifiedExplanation:
      'All marketing creatives and sales collateral must state the verified ₹999/month subscription price. Advertising ₹499/month is strictly prohibited.',
    structuredRule: {
      ruleStatement:
        'Promotional communications and advertising must display verified ₹999/month subscription pricing, never unapproved ₹499/month rates.',
      targetPatterns: ['₹499/month', 'Rs 499', 'Rs. 499/month', '499 per month'],
      approvedValue: '₹999/month (Standard Enterprise Plan)',
      severity: 'critical',
      ruleCategory: 'Pricing & Facts'
    },
    productDetails: {
      productName: 'Standard Enterprise Subscription',
      sku: 'NP-SUB-STD',
      price: '₹999/month',
      specifications: 'Includes 10,000 transactions/mo, 1.8% gateway fee, T+1 settlement',
      approvedClaims: ['₹999/month transparent pricing', 'Zero setup fees'],
      prohibitedClaims: ['₹499/month', '499 per month'],
      subscriptionInterval: 'monthly'
    },
    sourcePageTitle: 'Pricing & Enterprise Subscription Plans — ₹999/month',
    originalWebsiteUrl: 'https://novapay.io/pricing',
    sourceUrl: 'https://novapay.io/pricing',
    extractedAt: '2026-10-30T10:15:12.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-MKT-01',
    category: 'brand_communication',
    ruleCategory: 'Marketing & Communication',
    subCategory: 'Prohibited Financial Claims',
    title: 'Ban on Guaranteed Investment Returns & Risk-Free Profit Claims',
    originalExtractedText:
      'NovaPay is a payment processing infrastructure provider, not an investment fund. Marketing materials must never claim "guaranteed investment returns", "risk-free profits", or "100% guaranteed returns" on merchant settlement balances.',
    originalWebsiteText:
      'NovaPay is a payment processing infrastructure provider, not an investment fund. Marketing materials must never claim "guaranteed investment returns", "risk-free profits", or "100% guaranteed returns" on merchant settlement balances.',
    aiExplanation:
      'Never promise risk-free profits or guaranteed investment returns in advertisements, social posts, or banners.',
    simplifiedExplanation:
      'Never promise risk-free profits or guaranteed investment returns in advertisements, social posts, or banners.',
    structuredRule: {
      ruleStatement:
        'Prohibits any marketing statement claiming or implying guaranteed investment returns or risk-free profits.',
      targetPatterns: [
        'guarantees risk-free profits',
        '100% guaranteed investment returns',
        'risk-free profit',
        'guaranteed returns'
      ],
      approvedValue: 'delivers secure, transparent payment processing',
      severity: 'critical',
      ruleCategory: 'Prohibited Claim'
    },
    sourcePageTitle: 'Brand Identity, Logo Lockup & Marketing Communication Guidelines',
    originalWebsiteUrl: 'https://novapay.io/guidelines',
    sourceUrl: 'https://novapay.io/guidelines',
    extractedAt: '2026-10-30T10:15:16.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-BRN-01',
    category: 'visual_identity',
    ruleCategory: 'Brand Guidelines',
    subCategory: 'Brand Nomenclature & Wordmark',
    title: 'Compound CamelCase Brand Name ("NovaPay" vs "Nova Pay")',
    originalExtractedText:
      'Always write the brand name as a single compound word in CamelCase: "NovaPay". Never insert a space ("Nova Pay"), hyphenate ("Nova-Pay"), or use all-lowercase in body copy.',
    originalWebsiteText:
      'Always write the brand name as a single compound word in CamelCase: "NovaPay". Never insert a space ("Nova Pay"), hyphenate ("Nova-Pay"), or use all-lowercase in body copy.',
    aiExplanation:
      'The official brand name is "NovaPay" (one word, capital N and capital P). Do not write "Nova Pay" with a space.',
    simplifiedExplanation:
      'The official brand name is "NovaPay" (one word, capital N and capital P). Do not write "Nova Pay" with a space.',
    structuredRule: {
      ruleStatement:
        'Enforce single-word CamelCase spelling "NovaPay" across all headlines, captions, and legal copy.',
      targetPatterns: ['Nova Pay', 'Nova-Pay', 'NOVAPAY'],
      approvedValue: 'NovaPay',
      severity: 'warning',
      ruleCategory: 'Terminology'
    },
    sourcePageTitle: 'Brand Identity, Logo Lockup & Marketing Communication Guidelines',
    originalWebsiteUrl: 'https://novapay.io/guidelines',
    sourceUrl: 'https://novapay.io/guidelines',
    extractedAt: '2026-10-30T10:15:16.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-REF-01',
    category: 'website_policies',
    ruleCategory: 'Refund & Cancellation',
    subCategory: 'Hardware Return Policy',
    title: '14-Day POS Hardware Return & Replacement Guarantee',
    originalExtractedText:
      'Merchants may return undamaged NovaPay Smart POS terminals within 14 calendar days of confirmed delivery for a full refund or replacement. Promotional copy must not state "no returns permitted" or "all sales final".',
    originalWebsiteText:
      'Merchants may return undamaged NovaPay Smart POS terminals within 14 calendar days of confirmed delivery for a full refund or replacement. Promotional copy must not state "no returns permitted" or "all sales final".',
    aiExplanation:
      'Customers have a 14-day return and replacement window for POS hardware. Ads cannot claim "no returns permitted".',
    simplifiedExplanation:
      'Customers have a 14-day return and replacement window for POS hardware. Ads cannot claim "no returns permitted".',
    structuredRule: {
      ruleStatement:
        'Hardware promotions must honor the 14-day return and replacement window and never claim "no returns permitted" or "all sales final".',
      targetPatterns: ['no returns permitted', 'no returns or refunds permitted', 'all sales final'],
      approvedValue: '14-day replacement warranty and return window',
      severity: 'critical',
      ruleCategory: 'Legal & Compliance'
    },
    sourcePageTitle: 'Refund, Return & Subscription Cancellation Policy',
    originalWebsiteUrl: 'https://novapay.io/refund-policy',
    sourceUrl: 'https://novapay.io/refund-policy',
    extractedAt: '2026-10-30T10:15:08.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-TRM-01',
    category: 'website_policies',
    ruleCategory: 'Terms & Conditions',
    subCategory: 'Merchant Settlement SLA',
    title: 'Standard T+1 Business Day Settlement Cycle',
    originalExtractedText:
      'Domestic UPI, RuPay, and card transactions settle on a T+1 business day schedule to verified merchant bank accounts. Instant T+0 settlement requires explicit enterprise underwriting approval.',
    originalWebsiteText:
      'Domestic UPI, RuPay, and card transactions settle on a T+1 business day schedule to verified merchant bank accounts. Instant T+0 settlement requires explicit enterprise underwriting approval.',
    aiExplanation:
      'Standard settlement is T+1 business day. Do not advertise unconditional instant settlement for all merchants without mentioning eligibility.',
    simplifiedExplanation:
      'Standard settlement is T+1 business day. Do not advertise unconditional instant settlement for all merchants without mentioning eligibility.',
    structuredRule: {
      ruleStatement:
        'State T+1 business day settlement as standard, or specify underwriting eligibility when referencing instant settlement.',
      targetPatterns: ['unconditional instant settlement for everyone', 'zero-second bank payout'],
      approvedValue: 'T+1 business day settlement (T+0 subject to eligibility)',
      severity: 'warning',
      ruleCategory: 'Messaging & Claims'
    },
    sourcePageTitle: 'Terms & Conditions — Merchant Master Service Agreement',
    originalWebsiteUrl: 'https://novapay.io/terms',
    sourceUrl: 'https://novapay.io/terms',
    extractedAt: '2026-10-30T10:15:04.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-PRV-01',
    category: 'website_policies',
    ruleCategory: 'Privacy Policy',
    subCategory: 'Data Localization & Encryption',
    title: 'PCI-DSS Level 1 & Domestic Sovereign Cloud Storage',
    originalExtractedText:
      'All cardholder token vaults and transaction logs are encrypted using AES-256 at rest and stored exclusively within ISO 27001 certified data centers in Mumbai and Hyderabad in compliance with RBI data localization mandates.',
    originalWebsiteText:
      'All cardholder token vaults and transaction logs are encrypted using AES-256 at rest and stored exclusively within ISO 27001 certified data centers in Mumbai and Hyderabad in compliance with RBI data localization mandates.',
    aiExplanation:
      'Payment data is stored exclusively in Indian sovereign cloud regions (Mumbai & Hyderabad) with PCI-DSS Level 1 and AES-256 encryption.',
    simplifiedExplanation:
      'Payment data is stored exclusively in Indian sovereign cloud regions (Mumbai & Hyderabad) with PCI-DSS Level 1 and AES-256 encryption.',
    structuredRule: {
      ruleStatement:
        'Security and privacy claims must accurately cite PCI-DSS Level 1 certification and domestic Indian data residency.',
      targetPatterns: ['offshore card storage', 'unencrypted card logs'],
      approvedValue: 'PCI-DSS Level 1 certified with 100% domestic data residency',
      severity: 'info',
      ruleCategory: 'Legal & Compliance'
    },
    sourcePageTitle: 'Privacy Policy & Data Localization Compliance (RBI & DPDP Act)',
    originalWebsiteUrl: 'https://novapay.io/privacy',
    sourceUrl: 'https://novapay.io/privacy',
    extractedAt: '2026-10-30T10:15:06.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-PRD-01',
    category: 'product_intelligence',
    ruleCategory: 'Product & Service Rules',
    subCategory: 'Hardware Catalog & Courier SLA',
    title: 'NovaPay Smart POS Terminal (NP-POS-001) Pricing & 2–4 Day Dispatch',
    originalExtractedText:
      'The NovaPay Smart POS Terminal (SKU: NP-POS-001) is priced at ₹4,999 and dispatches within 2–4 business days via insured express courier. Hardware is never offered as a "free giveaway with zero conditions".',
    originalWebsiteText:
      'The NovaPay Smart POS Terminal (SKU: NP-POS-001) is priced at ₹4,999 and dispatches within 2–4 business days via insured express courier. Hardware is never offered as a "free giveaway with zero conditions".',
    aiExplanation:
      'The Smart POS Terminal costs ₹4,999 and ships within 2–4 business days. Ads must not claim "FREE POS Terminal with NO hardware cost" or "1-hour courier delivery".',
    simplifiedExplanation:
      'The Smart POS Terminal costs ₹4,999 and ships within 2–4 business days. Ads must not claim "FREE POS Terminal with NO hardware cost" or "1-hour courier delivery".',
    structuredRule: {
      ruleStatement:
        'POS Terminal promotions must state the verified ₹4,999 hardware price and 2–4 business days courier dispatch timeline.',
      targetPatterns: [
        'FREE with NO hardware cost',
        'free POS terminal for everyone',
        'Instant courier delivery anywhere within 1 hour'
      ],
      approvedValue: 'NovaPay Smart POS Terminal (₹4,999) · Dispatches in 2–4 business days',
      severity: 'critical',
      ruleCategory: 'Pricing & Facts'
    },
    productDetails: {
      productName: 'NovaPay Smart POS Terminal',
      sku: 'NP-POS-001',
      price: '₹4,999',
      specifications: 'EMV Chip & PIN, NFC Contactless, 4G LTE + Wi-Fi, 5.5" HD Touchscreen',
      approvedClaims: ['₹4,999 official price', '2–4 business days express courier dispatch'],
      prohibitedClaims: ['FREE with NO hardware cost', 'Instant courier delivery anywhere within 1 hour']
    },
    sourcePageTitle: 'Products & Official Merchandise Catalog (Smart POS, Cap, Bottle, Tee)',
    originalWebsiteUrl: 'https://novapay.io/products',
    sourceUrl: 'https://novapay.io/products',
    extractedAt: '2026-10-30T10:15:14.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-DSC-01',
    category: 'website_policies',
    ruleCategory: 'Disclaimers',
    subCategory: 'Statutory Financial Disclaimer',
    title: 'Mandatory Regulatory & Transaction Fee Disclosure',
    originalExtractedText:
      'All promotional banners quoting subscription pricing or transaction rates must include the disclosure: "Subject to merchant KYC verification and standard 1.8% gateway processing fee. Terms apply."',
    originalWebsiteText:
      'All promotional banners quoting subscription pricing or transaction rates must include the disclosure: "Subject to merchant KYC verification and standard 1.8% gateway processing fee. Terms apply."',
    aiExplanation:
      'Any ad quoting pricing must include a clear disclosure that merchant KYC verification and standard gateway terms apply.',
    simplifiedExplanation:
      'Any ad quoting pricing must include a clear disclosure that merchant KYC verification and standard gateway terms apply.',
    structuredRule: {
      ruleStatement:
        'Include standard merchant KYC and gateway fee disclosure on promotional pricing creatives.',
      targetPatterns: ['no KYC required ever', '0% lifetime fee on all credit cards'],
      approvedValue: 'Subject to merchant KYC verification and standard gateway terms.',
      severity: 'warning',
      ruleCategory: 'Legal & Compliance'
    },
    sourcePageTitle: 'Statutory Financial Risk & Regulatory Disclaimers',
    originalWebsiteUrl: 'https://novapay.io/disclaimer',
    sourceUrl: 'https://novapay.io/disclaimer',
    extractedAt: '2026-10-30T10:15:18.000Z',
    verificationStatus: 'approved'
  },
  {
    id: 'RULE-DEMO-OTH-01',
    category: 'approved_facts',
    ruleCategory: 'Other Rules',
    subCategory: 'Customer Support & SLA Facts',
    title: '99.98% Gateway Uptime SLA & 24/7 Merchant Helpdesk',
    originalExtractedText:
      'NovaPay maintains a verified 99.98% historical platform uptime across 4 redundant availability zones and provides 24/7 merchant technical support via phone and ticket desk.',
    originalWebsiteText:
      'NovaPay maintains a verified 99.98% historical platform uptime across 4 redundant availability zones and provides 24/7 merchant technical support via phone and ticket desk.',
    aiExplanation:
      'Verified platform uptime is 99.98% (do not claim "100% zero-downtime guarantee"). Support is available 24/7.',
    simplifiedExplanation:
      'Verified platform uptime is 99.98% (do not claim "100% zero-downtime guarantee"). Support is available 24/7.',
    structuredRule: {
      ruleStatement:
        'Quote the verified 99.98% platform uptime SLA rather than unapproved 100% uptime guarantees.',
      targetPatterns: ['100% zero-downtime guarantee', 'never goes down 100% SLA'],
      approvedValue: '99.98% Enterprise Uptime SLA',
      severity: 'info',
      ruleCategory: 'Pricing & Facts'
    },
    sourcePageTitle: 'Frequently Asked Questions — Settlement Timelines & Support',
    originalWebsiteUrl: 'https://novapay.io/faq',
    sourceUrl: 'https://novapay.io/faq',
    extractedAt: '2026-10-30T10:15:20.000Z',
    verificationStatus: 'approved'
  }
];

export const DEMO_VERIFICATION_REPORT: ContentVerificationReport = {
  id: 'VERIFY-DEMO-2026-001',
  verifiedAt: '2026-10-30T10:20:00.000Z',
  contentTitle: 'Promo Launch Flyer: NovaPay POS Flash Sale (Demo Evaluation)',
  contentFileName: 'NovaPay_Flash_Sale_Ad.txt',
  contentType: 'text',
  overallStatus: 'Potential Violation',
  totalRulesChecked: DEMO_EXTRACTED_WEBSITE_RULES.length,
  rulesMatched: 4,
  potentialViolationsCount: 3,
  missingInformationCount: 1,
  requiresVerificationCount: 0,
  extractedTextSnippet:
    'FLASH SALE TODAY ONLY! Get the revolutionary Nova Pay Smart POS Terminal for FREE with NO hardware cost! Enjoy our unlimited subscription starting at just ₹499/month! 100% Guaranteed Investment Returns on all retail checkout balances! No returns or refunds permitted once ordered.',
  aiUsed: true,
  legalDisclaimer:
    'Website-policy compliance does not constitute legal certification or statutory immunity. Results reflect consistency with extracted public website statements.',
  findings: [
    {
      id: 'fnd-demo-v-1',
      status: 'Potential Violation',
      detectedContent: '₹499/month',
      relevantRuleTitle: 'Standard Enterprise Subscription Rate (₹999/month)',
      relevantRuleCategory: 'Pricing & Payment',
      originalWebsiteText:
        'The NovaPay Standard Enterprise Subscription is billed at ₹999/month (inclusive of 10,000 monthly API transactions, real-time settlement dashboard, and 99.98% uptime SLA). Legacy promotional rates of ₹499/month are retired and must not be advertised.',
      sourceUrl: 'https://novapay.io/pricing',
      sourcePageTitle: 'Pricing & Enterprise Subscription Plans — ₹999/month',
      explanation:
        'The promotional copy advertises "₹499/month", which directly conflicts with the published Standard Enterprise Subscription rate of ₹999/month on the pricing page.',
      suggestedCorrection:
        'Replace "₹499/month" with the verified rate: "Standard Enterprise Subscription starting at ₹999/month".',
      severity: 'critical'
    },
    {
      id: 'fnd-demo-v-2',
      status: 'Potential Violation',
      detectedContent: '100% Guaranteed Investment Returns',
      relevantRuleTitle: 'Ban on Guaranteed Investment Returns & Risk-Free Profit Claims',
      relevantRuleCategory: 'Marketing & Communication',
      originalWebsiteText:
        'NovaPay is a payment processing infrastructure provider, not an investment fund. Marketing materials must never claim "guaranteed investment returns", "risk-free profits", or "100% guaranteed returns" on merchant settlement balances.',
      sourceUrl: 'https://novapay.io/guidelines',
      sourcePageTitle: 'Brand Identity, Logo Lockup & Marketing Communication Guidelines',
      explanation:
        'The creative claims "100% Guaranteed Investment Returns on all retail checkout balances", violating the brand communication ban on speculative or guaranteed financial return claims.',
      suggestedCorrection:
        'Remove the investment return guarantee and state: "NovaPay delivers secure, PCI-DSS Level 1 compliant payment processing with T+1 settlement."',
      severity: 'critical'
    },
    {
      id: 'fnd-demo-v-3',
      status: 'Potential Violation',
      detectedContent: 'No returns or refunds permitted once ordered',
      relevantRuleTitle: '14-Day POS Hardware Return & Replacement Guarantee',
      relevantRuleCategory: 'Refund & Cancellation',
      originalWebsiteText:
        'Merchants may return undamaged NovaPay Smart POS terminals within 14 calendar days of confirmed delivery for a full refund or replacement. Promotional copy must not state "no returns permitted" or "all sales final".',
      sourceUrl: 'https://novapay.io/refund-policy',
      sourcePageTitle: 'Refund, Return & Subscription Cancellation Policy',
      explanation:
        'Stating "No returns or refunds permitted" contradicts the published 14-day hardware return and replacement policy.',
      suggestedCorrection:
        'Update policy line to: "Includes a 14-day return and replacement warranty on undamaged POS hardware."',
      severity: 'critical'
    },
    {
      id: 'fnd-demo-v-4',
      status: 'Missing Information',
      detectedContent: 'Missing KYC & Gateway Fee Disclosure',
      relevantRuleTitle: 'Mandatory Regulatory & Transaction Fee Disclosure',
      relevantRuleCategory: 'Disclaimers',
      originalWebsiteText:
        'All promotional banners quoting subscription pricing or transaction rates must include the disclosure: "Subject to merchant KYC verification and standard 1.8% gateway processing fee. Terms apply."',
      sourceUrl: 'https://novapay.io/disclaimer',
      sourcePageTitle: 'Statutory Financial Risk & Regulatory Disclaimers',
      explanation:
        'The flyer quotes monthly subscription pricing without including the required merchant KYC and standard gateway fee disclosure.',
      suggestedCorrection:
        'Add footer disclaimer: "Subject to merchant KYC verification and standard 1.8% gateway processing fee. Terms apply."',
      severity: 'warning'
    }
  ]
};

export const DEMO_CONSISTENCY_CHECK_RESULT: BrandConsistencyCheckResult = {
  id: 'CHK-DEMO-2026-01',
  brandId: 'novapay',
  dnaProfileId: 'DNA-DEMO-NOVAPAY-2026',
  creativeTitle: 'Q4 Merchant Launch Social Banner (Evaluated Sample)',
  filename: 'novapay-ad-prohibited-claim.png',
  originalImageUrl: '/assets/sample-ads/novapay-ad-prohibited-claim.png',
  correctedImageUrl: '/assets/sample-ads/novapay-ad-compliant.png',
  correctionAppliedSummary: [
    'Replaced prohibited claim "guarantees risk-free profits" with approved "Enterprise-grade payment processing"',
    'Corrected subscription pricing from ₹499/month to verified ₹999/month',
    'Standardized primary brand background to Cobalt Blue (#2563EB) and Deep Navy (#0F172A)'
  ],
  overallScore: 68,
  scoringMethodology:
    'Weighted evaluation across Color Palette (25%), Typography (20%), Logo Usage (20%), Layout & Spacing (15%), and Brand Voice & Messaging (20%).',
  categoryScores: [
    {
      category: 'Color Palette',
      score: 82,
      weight: 25,
      summary: 'Primary Cobalt Blue (#2563EB) and Deep Navy (#0F172A) swatches align with Brand DNA.'
    },
    {
      category: 'Typography',
      score: 88,
      weight: 20,
      summary: 'Inter geometric sans-serif hierarchy matches approved web typography.'
    },
    {
      category: 'Logo Usage',
      score: 70,
      weight: 20,
      summary: 'Horizontal wordmark present; perimeter clear space slightly below 16px minimum.'
    },
    {
      category: 'Layout & Spacing',
      score: 75,
      weight: 15,
      summary: 'High-contrast enterprise card layout with clear CTA prominence.'
    },
    {
      category: 'Brand Voice & Messaging',
      score: 25,
      weight: 20,
      summary: 'Contains prohibited financial guarantee claim and retired ₹499/month price.'
    }
  ],
  issues: [
    {
      id: 'chk-iss-1',
      category: 'Brand Voice & Messaging',
      issueType: 'objective_violation',
      severity: 'high',
      title: 'Prohibited Profit Guarantee Claim in Headline',
      detectedValue: 'Nova Pay guarantees risk-free profits',
      approvedBrandRule: 'Never claim guaranteed investment returns or risk-free profits (PRH-005)',
      evidence: 'OCR detected "Nova Pay guarantees risk-free profits" in primary hero headline.',
      recommendedCorrection: 'Replace headline with "NovaPay — Fast, Secure Enterprise Payment Processing".',
      selectedForFix: true
    },
    {
      id: 'chk-iss-2',
      category: 'Brand Voice & Messaging',
      issueType: 'objective_violation',
      severity: 'high',
      title: 'Outdated Subscription Price (₹499/month)',
      detectedValue: '₹499/month',
      approvedBrandRule: 'Standard Enterprise Subscription starts at ₹999/month (MSG-003)',
      evidence: 'CTA badge displays ₹499/month instead of verified ₹999/month.',
      recommendedCorrection: 'Update CTA price badge to "Starts at ₹999/month".',
      selectedForFix: true
    }
  ],
  extractedText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
  detectedDominantColors: ['#0F172A', '#2563EB', '#EF4444', '#FFFFFF'],
  imageDimensions: { width: 1200, height: 630 },
  aiUsed: true,
  analyzedAt: '2026-10-30T10:25:00.000Z',
  approvalStatus: 'approved'
};

export const DEMO_NOVAPAY_DNA_PROFILE: BrandDnaProfile = {
  id: 'DNA-DEMO-NOVAPAY-2026',
  brandId: 'novapay',
  brandName: 'NovaPay',
  sourceType: 'website',
  sourceUrl: 'https://novapay.io',
  analyzedAt: '2026-10-30T10:15:00.000Z',
  updatedAt: '2026-10-30T10:20:00.000Z',
  overallConfidence: 0.96,
  extractionMethod: 'live_html_css_plus_gemini',
  aiUsed: true,
  colors: [
    {
      hex: '#2563EB',
      name: 'NovaPay Cobalt Blue',
      role: 'primary',
      usageNotes: 'Primary brand CTA buttons, active navigation indicators, and key highlights',
      confidence: 0.98
    },
    {
      hex: '#0F172A',
      name: 'Enterprise Deep Slate',
      role: 'secondary',
      usageNotes: 'Primary dark sidebar, hero headers, and high-contrast institutional surfaces',
      confidence: 0.97
    },
    {
      hex: '#06B6D4',
      name: 'Signal Cyan Accent',
      role: 'accent',
      usageNotes: 'Telemetry badges, AI verification highlights, and interactive focus rings',
      confidence: 0.94
    },
    {
      hex: '#F8FAFC',
      name: 'Cloud Alabaster Surface',
      role: 'background',
      usageNotes: 'Main workspace canvas background for high legibility',
      confidence: 0.96
    },
    {
      hex: '#10B981',
      name: 'Verification Emerald',
      role: 'neutral',
      usageNotes: 'Compliant status badges and verified price indicators',
      confidence: 0.95
    }
  ],
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    hierarchyNotes:
      'Clean geometric sans-serif hierarchy with tight tracking (-0.02em) on headings and tabular monospace numerals for financial figures.',
    weightScale: '400 Regular · 600 SemiBold · 700 Bold · 800 ExtraBold',
    confidence: 0.96,
    sourceEvidence: 'Extracted from https://novapay.io/guidelines stylesheet declarations'
  },
  logoUsage: {
    logoDescription:
      'Horizontal geometric wordmark "NovaPay" in pure white (#FFFFFF) or Deep Slate (#0F172A) paired with the Cobalt Blue emblem.',
    clearSpaceRule: 'Maintain minimum 16px clear space around the entire wordmark lockup.',
    placementPattern: 'Top-left header navigation or bottom-right corner on promotional banners.',
    prohibitedUsages: [
      'Do not insert a space ("Nova Pay")',
      'Do not use unapproved red circular coin badges',
      'Do not stretch or skew wordmark aspect ratio'
    ],
    confidence: 0.95,
    sourceEvidence: 'Extracted from https://novapay.io/guidelines §1.2'
  },
  visualIdentity: {
    layoutPattern: '12-column bento grid with 24px structural gaps and high-contrast data cards',
    spacingSystem: 'Balanced enterprise density with 16px–24px internal card padding',
    buttonAndComponentStyle: 'Rounded-xl buttons (#2563EB) with crisp 1px borders and subtle elevation',
    imageAndIllustrationStyle: 'Clean product UI mockups, verified POS hardware renders, and structured financial badges',
    designPatterns: ['Institutional', 'Regulated FinTech', 'High-Trust', 'Precision'],
    confidence: 0.95
  },
  brandVoice: {
    toneAttributes: ['Authoritative', 'Transparent', 'Compliance-First', 'Clarity-Driven'],
    writingStyle:
      'Clear, factual enterprise communication quoting verified INR (₹) pricing, uptime SLAs, and regulatory disclosures.',
    preferredMessaging: [
      'NovaPay delivers high-speed payment processing with enterprise security',
      'Standard Enterprise Subscription starts at ₹999/month',
      'PCI-DSS Level 1 certified infrastructure'
    ],
    prohibitedPhrases: [
      'Nova Pay (spaced)',
      'guarantees risk-free profits',
      '100% guaranteed investment returns',
      '₹499/month'
    ],
    sampleHeadlines: [
      'Enterprise Payment Infrastructure Built for High-Velocity Commerce',
      'Transparent ₹999/Month Subscription with 99.98% Uptime SLA'
    ],
    confidence: 0.97
  },
  referenceContent: [
    {
      id: 'ref-demo-1',
      type: 'website_page',
      title: 'NovaPay Official Website & Policy Pages',
      urlOrFilename: 'https://novapay.io',
      extractedSnippet:
        'NovaPay Enterprise Payment Gateway — Standard subscription ₹999/month, 99.98% uptime SLA, 14-day POS hardware return guarantee.',
      analyzedAt: '2026-10-30T10:15:00.000Z'
    }
  ],
  crawledPages: DEMO_DISCOVERED_PAGES,
  extractedItems: DEMO_EXTRACTED_WEBSITE_RULES,
  lastScanSummary: {
    totalPagesFound: 12,
    pagesCrawled: 11,
    pagesInaccessible: 1,
    totalItemsExtracted: DEMO_EXTRACTED_WEBSITE_RULES.length,
    approvedCount: DEMO_EXTRACTED_WEBSITE_RULES.length,
    pendingCount: 0,
    rejectedCount: 0
  },
  savedToKnowledgeAt: '2026-10-30T10:18:00.000Z',
  syncedKnowledgeCounts: {
    rules: 9,
    assets: 5,
    sourceDocs: 8,
    products: 5,
    rulesAdded: 9,
    assetsUpdated: 5,
    sourcesAdded: 8,
    productsAdded: 5
  },
  isSaved: true,
  latestVerificationReport: DEMO_VERIFICATION_REPORT,
  verificationHistory: [DEMO_VERIFICATION_REPORT]
};

export const DEMO_AUDIT_HISTORY: AuditReport[] = [
  {
    id: 'REP-DEMO-2026-101',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Q4 Enterprise Merchant Acquisition',
    title: 'NovaPay Q4 Promotional Ad (Canonical Evaluation)',
    contentType: 'Advertisement',
    submittedBy: 'Evaluator Demo Account',
    submittedByRole: 'Evaluator Demo Account',
    submittedByRoleKey: 'brand_manager',
    createdAt: '2026-10-30T10:30:00.000Z',
    originalText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
    currentText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
    overallStatus: 'issues_found',
    contentApprovalStatus: 'changes_requested',
    toneSummary:
      '3 brand compliance issues detected across Terminology, Prohibited Financial Claims, and Commercial Pricing.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 8,
      geminiContextual: true,
      geminiSuccess: true
    },
    findings: [
      {
        id: 'FND-DEMO-101-1',
        ruleId: 'TER-004',
        ruleVersion: 2,
        ruleTitle: 'Brand Name Compound CamelCase Spelling',
        category: 'Terminology',
        severity: 'warning',
        classification: 'confirmed_rule_conflict',
        engine: 'deterministic',
        originalSpan: 'Nova Pay',
        startIndex: 0,
        endIndex: 8,
        conflictText: 'Spaced spelling "Nova Pay" violates compound wordmark rule TER-004.',
        explanation:
          'Consistent CamelCase spelling ("NovaPay") protects trademark distinctiveness across all channels.',
        suggestedReplacement: 'NovaPay',
        approvedRuleCitation: 'NovaPay Brand Guidelines v4.2 · Section 1.1 (Nomenclature)',
        sourceReference: 'NovaPay Brand Guidelines v4.2.pdf (p.4)',
        sourceLocation: '§1.1 Official Brand Name',
        requiresHumanReview: false,
        decision: 'pending',
        timestamp: '2026-10-30T10:30:00.000Z'
      },
      {
        id: 'FND-DEMO-101-2',
        ruleId: 'PRH-005',
        ruleVersion: 3,
        ruleTitle: 'Prohibition on Guaranteed Profit & Risk-Free Claims',
        category: 'Prohibited Claim',
        severity: 'critical',
        classification: 'prohibited_claim',
        engine: 'deterministic',
        originalSpan: 'guarantees risk-free profits',
        startIndex: 9,
        endIndex: 37,
        conflictText:
          'Promising "guarantees risk-free profits" violates regulatory financial advertising rules and PRH-005.',
        explanation:
          'Financial regulators (ASCI / CCPA / RBI) strictly prohibit unsubstantiated risk-free profit guarantees.',
        suggestedReplacement: 'delivers secure, transparent payment processing',
        approvedRuleCitation: 'NovaPay Legal & Compliance Manual 2026 · Section 4.3 (Prohibited Claims)',
        sourceReference: 'NovaPay Legal & Compliance Manual 2026.pdf (p.18)',
        sourceLocation: '§4.3 Financial Guarantees',
        requiresHumanReview: false,
        decision: 'pending',
        timestamp: '2026-10-30T10:30:00.000Z'
      },
      {
        id: 'FND-DEMO-101-3',
        ruleId: 'MSG-003',
        ruleVersion: 2,
        ruleTitle: 'Standard Enterprise Subscription Pricing Accuracy',
        category: 'Pricing & Facts',
        severity: 'critical',
        classification: 'approved_fact_conflict',
        engine: 'deterministic',
        originalSpan: '₹499/month',
        startIndex: 64,
        endIndex: 74,
        conflictText:
          'Displayed price "₹499/month" conflicts with verified Standard Enterprise Subscription rate of ₹999/month.',
        explanation:
          'Quoting retired or inaccurate subscription pricing creates deceptive price advertising exposure.',
        suggestedReplacement: '₹999/month',
        approvedRuleCitation: 'NovaPay Commercial Pricing Schedule Q4 2026 · Table 2.1',
        sourceReference: 'NovaPay Commercial Pricing Schedule Q4 2026.pdf (p.2)',
        sourceLocation: 'Table 2.1 Subscription Tiers',
        requiresHumanReview: false,
        decision: 'pending',
        timestamp: '2026-10-30T10:30:00.000Z'
      }
    ],
    versions: [
      {
        versionNumber: 1,
        contentText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
        changeSummary: 'Submitted draft for automated brand governance review.',
        createdBy: 'Evaluator Demo Account',
        createdByRole: 'Evaluator Demo Account',
        createdAt: '2026-10-30T10:30:00.000Z'
      }
    ]
  },
  {
    id: 'REP-DEMO-2026-102',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Q4 Paid Social Poster Audit',
    title: 'Advertisement Image Audit — NovaPay Prohibited Claim Poster',
    contentType: 'Advertisement',
    mediaType: 'image',
    imageUrl: '/assets/sample-ads/novapay-ad-prohibited-claim.png',
    imageMetadata: {
      filename: 'novapay-ad-prohibited-claim.png',
      mimeType: 'image/png',
      width: 1200,
      height: 630,
      sizeBytes: 184320
    },
    submittedBy: 'Evaluator Demo Account',
    submittedByRole: 'Evaluator Demo Account',
    submittedByRoleKey: 'brand_manager',
    createdAt: '2026-10-29T16:15:00.000Z',
    originalText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
    currentText: 'NovaPay delivers secure, transparent payment processing. Subscribe today for just ₹999/month!',
    overallStatus: 'changes_applied',
    contentApprovalStatus: 'changes_requested',
    toneSummary: 'Visual OCR & layout inspection detected 2 text policy conflicts in the promotional creative.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 8,
      geminiContextual: true,
      geminiSuccess: true,
      ocrExecuted: true,
      ocrSuccess: true,
      visionExecuted: true,
      visionSuccess: true
    },
    findings: [
      {
        id: 'FND-DEMO-102-1',
        ruleId: 'PRH-005',
        ruleTitle: 'Prohibition on Guaranteed Profit & Risk-Free Claims',
        category: 'Prohibited Claim',
        severity: 'critical',
        classification: 'prohibited_claim',
        engine: 'deterministic',
        originalSpan: 'guarantees risk-free profits',
        startIndex: 9,
        endIndex: 37,
        conflictText: 'Hero headline in uploaded poster contains prohibited claim "guarantees risk-free profits".',
        explanation: 'Violates statutory advertising disclosure rules and NovaPay compliance policy.',
        suggestedReplacement: 'delivers secure, transparent payment processing',
        approvedRuleCitation: 'NovaPay Legal & Compliance Manual 2026 · §4.3',
        requiresHumanReview: false,
        decision: 'accepted',
        decidedBy: 'Evaluator Demo Account',
        decidedAt: '2026-10-29T16:18:00.000Z',
        timestamp: '2026-10-29T16:15:00.000Z',
        targetType: 'text',
        visualElementLabel: 'Prohibited Headline Claim',
        boundingBox: {
          x: 8,
          y: 28,
          width: 84,
          height: 22,
          unit: 'percent'
        }
      },
      {
        id: 'FND-DEMO-102-2',
        ruleId: 'MSG-003',
        ruleTitle: 'Standard Enterprise Subscription Pricing Accuracy',
        category: 'Pricing & Facts',
        severity: 'critical',
        classification: 'approved_fact_conflict',
        engine: 'deterministic',
        originalSpan: '₹499/month',
        startIndex: 64,
        endIndex: 74,
        conflictText: 'Poster price badge shows ₹499/month instead of verified ₹999/month.',
        explanation: 'Must match official published catalog price.',
        suggestedReplacement: '₹999/month',
        approvedRuleCitation: 'NovaPay Commercial Pricing Schedule Q4 2026',
        requiresHumanReview: false,
        decision: 'accepted',
        decidedBy: 'Evaluator Demo Account',
        decidedAt: '2026-10-29T16:19:00.000Z',
        timestamp: '2026-10-29T16:15:00.000Z',
        targetType: 'text',
        visualElementLabel: 'Incorrect Price Badge (₹499/mo)',
        boundingBox: {
          x: 12,
          y: 68,
          width: 45,
          height: 16,
          unit: 'percent'
        }
      }
    ],
    versions: [
      {
        versionNumber: 1,
        contentText: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
        changeSummary: 'Extracted via OCR & Gemini Vision.',
        createdBy: 'Evaluator Demo Account',
        createdByRole: 'Evaluator Demo Account',
        createdAt: '2026-10-29T16:15:00.000Z'
      }
    ]
  },
  {
    id: 'REP-DEMO-2026-103',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Q4 Compliant Product Launch',
    title: 'NovaPay Compliant Merchant Launch Social Post',
    contentType: 'Social Post',
    submittedBy: 'Ananya Sharma',
    submittedByRole: 'Brand Compliance Manager',
    submittedByRoleKey: 'brand_manager',
    createdAt: '2026-10-28T14:10:00.000Z',
    completedAt: '2026-10-28T14:15:00.000Z',
    originalText:
      'NovaPay delivers high-speed payment processing with enterprise security and 99.98% uptime SLA. Standard Enterprise Subscription starts at ₹999/month.',
    currentText:
      'NovaPay delivers high-speed payment processing with enterprise security and 99.98% uptime SLA. Standard Enterprise Subscription starts at ₹999/month.',
    overallStatus: 'no_issues_detected',
    contentApprovalStatus: 'approved_for_publication',
    contentApprovedBy: 'Ananya Sharma (Brand Compliance Manager)',
    contentApprovedAt: '2026-10-28T14:15:00.000Z',
    toneSummary: '0 conflicts found. All terminology, uptime facts, and subscription pricing match approved Brand Knowledge.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 8,
      geminiContextual: true,
      geminiSuccess: true
    },
    findings: [],
    versions: [
      {
        versionNumber: 1,
        contentText:
          'NovaPay delivers high-speed payment processing with enterprise security and 99.98% uptime SLA. Standard Enterprise Subscription starts at ₹999/month.',
        changeSummary: 'Passed all deterministic and Gemini AI contextual checks.',
        createdBy: 'Ananya Sharma',
        createdByRole: 'Brand Compliance Manager',
        createdAt: '2026-10-28T14:10:00.000Z'
      }
    ]
  }
];

export function buildDemoBrandsMap(baseBrands: Record<string, BrandProfile> = BRANDS): Record<string, BrandProfile> {
  const cloned: Record<string, BrandProfile> = JSON.parse(JSON.stringify(baseBrands));
  if (cloned.novapay) {
    cloned.novapay.brandDnaProfile = JSON.parse(JSON.stringify(DEMO_NOVAPAY_DNA_PROFILE));
    cloned.novapay.brandDnaHistory = [JSON.parse(JSON.stringify(DEMO_NOVAPAY_DNA_PROFILE))];
    cloned.novapay.consistencyChecks = [JSON.parse(JSON.stringify(DEMO_CONSISTENCY_CHECK_RESULT))];
  }
  return cloned;
}
