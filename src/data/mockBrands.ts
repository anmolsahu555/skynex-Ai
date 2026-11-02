import {
  BrandProfile,
  AuditReport,
  RecurrenceThresholdConfig
} from '../types.ts';

// Configurable recurrence threshold (3+ occurrences across 2+ drafts in 7-day window)
export const DEFAULT_RECURRENCE_CONFIG: RecurrenceThresholdConfig = {
  minOccurrences: 3,
  minDistinctDrafts: 2,
  windowDays: 7
};

export const NOVAPAY_BRAND: BrandProfile = {
  id: 'novapay',
  name: 'NovaPay',
  fictionalLabel: 'Fictional Demo',
  tagline: 'Modern Enterprise Payment Infrastructure',
  industry: 'Fintech & Payment Processing',
  description: 'NovaPay provides unified global payment orchestration, instant settlement, and enterprise treasury infrastructure.',
  preferredLanguage: 'English (US / Global)',
  website: 'https://novapay.example.com',
  primaryColor: '#2563EB',
  approvedColors: [
    { name: 'Navy Slate', hex: '#0F172A', usage: 'primary', description: 'Primary brand text, deep contrast surfaces' },
    { name: 'Cobalt Blue', hex: '#2563EB', usage: 'secondary', description: 'Primary CTA and verified badge accents' },
    { name: 'Cyan Sky', hex: '#06B6D4', usage: 'accent', description: 'Subtle brand highlights and interactive points' },
    { name: 'Soft Canvas', hex: '#F8FAFC', usage: 'background', description: 'Clean workspace and container background' }
  ],
  approvedLogoRef: {
    name: 'Official NovaPay Horizontal Lockup',
    description: 'Use the official horizontal wordmark with blue accent icon.',
    approvedVariants: [
      'Official horizontal wordmark with blue accent icon',
      'Dark background inverse white horizontal mark'
    ],
    unapprovedVariants: [
      'Circular red coin badge',
      'Standalone badge without wordmark',
      'Altered serif font typography',
      'Distorted or stretched lockup'
    ],
    sourceRef: 'Visual Guidelines §1.2'
  },
  visualGuidelines: [
    {
      id: 'VIS-001',
      category: 'Logo & Lockup',
      title: 'Official Logo Usage',
      requirement: 'Use the official horizontal wordmark with blue accent icon.',
      sourceRef: 'Visual Guidelines §1.2'
    },
    {
      id: 'VIS-002',
      category: 'Logo & Lockup',
      title: 'Prohibited Logo Variants',
      requirement: 'Do not use circular or standalone badge without approval.',
      sourceRef: 'Brand Assets Guide'
    },
    {
      id: 'VIS-003',
      category: 'Color & Contrast',
      title: 'Brand Palette Adherence',
      requirement: 'Foreground text on white backgrounds must meet WCAG AA (Navy Slate #0F172A).',
      sourceRef: 'Visual Guidelines §2.4'
    },
    {
      id: 'VIS-004',
      category: 'Layout & Typography',
      title: 'Legal Pricing Clear Space',
      requirement: 'Promotional pricing disclosures must have at least 16px padding from perimeter boundaries.',
      sourceRef: 'Ad Compliance Manual §4.1'
    }
  ],
  rules: [
    {
      id: 'VIS-001',
      brandId: 'novapay',
      category: 'Visual Identity',
      title: 'Official Logo Usage',
      ruleStatement: 'Use the official horizontal wordmark with blue accent icon.',
      targetPatterns: ['circular red coin', 'standalone badge', 'altered serif font'],
      approvedValue: 'Official horizontal wordmark with blue accent icon',
      sourceRef: 'Visual Guidelines §1.2',
      status: 'Approved',
      classification: 'confirmed_rule_conflict',
      severity: 'critical',
      explanation: 'All customer-facing materials must feature the approved horizontal logo lockup with official blue accent.',
      updatedAt: '2026-10-15'
    },
    {
      id: 'VIS-002',
      brandId: 'novapay',
      category: 'Visual Identity',
      title: 'Prohibited Logo Variants',
      ruleStatement: 'Do not use circular or standalone badge without approval.',
      targetPatterns: ['unauthorized badge', 'circular badge', 'distorted logo'],
      approvedValue: 'Approved NovaPay horizontal lockup',
      sourceRef: 'Brand Assets Guide',
      status: 'Approved',
      classification: 'confirmed_rule_conflict',
      severity: 'critical',
      explanation: 'Circular badge and standalone coin marks are unapproved and create brand dilution.',
      updatedAt: '2026-10-18'
    },
    {
      id: 'MSG-003',
      brandId: 'novapay',
      category: 'Pricing & Facts',
      title: 'Pricing Claims',
      ruleStatement: 'Only use approved pricing and verified plan details.',
      targetPatterns: ['₹499/month', '₹499 per month', '₹499/mo', 'INR 499/month', '₹499', '$49/month'],
      approvedValue: '₹999/month',
      sourceRef: 'Pricing & Plans Doc',
      status: 'Approved',
      classification: 'approved_fact_conflict',
      severity: 'critical',
      explanation: 'Standard subscription rate is ₹999/month. Publishing ₹499/month misquotes commercial pricing.',
      updatedAt: '2026-10-20'
    },
    {
      id: 'TER-004',
      brandId: 'novapay',
      category: 'Terminology',
      title: 'Official Brand Name (NovaPay)',
      ruleStatement: 'The product name must be written as "NovaPay" (never "Nova Pay" or "Nova-Pay").',
      targetPatterns: ['Nova Pay', 'nova pay', 'Nova-Pay', 'nova-pay'],
      approvedValue: 'NovaPay',
      sourceRef: 'Brand Nomenclature §1.1',
      status: 'Approved',
      classification: 'confirmed_rule_conflict',
      severity: 'critical',
      explanation: 'Brand identity requires the unified compound spelling "NovaPay" without spaces or hyphens.',
      updatedAt: '2026-10-22'
    },
    {
      id: 'PRH-005',
      brandId: 'novapay',
      category: 'Prohibited Claim',
      title: 'Prohibited Risk-Free Profit Claim',
      ruleStatement: 'Promotional claims stating "guarantees risk-free profits" or guaranteed returns are strictly prohibited.',
      targetPatterns: ['guarantees risk-free profits', 'risk-free profits', 'guaranteed profits', 'zero risk returns'],
      approvedValue: 'Regulated transaction infrastructure',
      sourceRef: 'Regulatory Compliance §3.2',
      status: 'Approved',
      classification: 'prohibited_claim',
      severity: 'critical',
      explanation: 'Financial advertising rules strictly prohibit any claims promising or guaranteeing risk-free profit.',
      updatedAt: '2026-10-23'
    },
    {
      id: 'TON-006',
      brandId: 'novapay',
      category: 'Tone & Style',
      title: 'Professional Financial Tone',
      ruleStatement: 'Copy must maintain a direct, credible, and empowering tone without aggressive hype.',
      targetPatterns: ['insane returns', 'get rich quick', 'mindblowing profits'],
      approvedValue: 'Transparent, reliable financial technology',
      sourceRef: 'Tone & Voice Playbook §2.1',
      status: 'Approved',
      classification: 'style_tone_suggestion',
      severity: 'warning',
      explanation: 'Maintain professional, substantiable communication suitable for enterprise payments.',
      updatedAt: '2026-10-24'
    },
    {
      id: 'LEG-007',
      brandId: 'novapay',
      category: 'Legal & Compliance',
      title: 'EU Digital Services Act Disclosure',
      ruleStatement: 'Draft disclosure clause for European digital transaction processing.',
      targetPatterns: ['EU cross-border settlement'],
      approvedValue: 'Licensed payment institution subject to EU regulatory compliance',
      sourceRef: 'Legal Review Draft 2026',
      status: 'Draft',
      classification: 'needs_human_verification',
      severity: 'warning',
      explanation: 'Pending final review by European regulatory compliance counsel.',
      updatedAt: '2026-10-25'
    },
    {
      id: 'PRF-008',
      brandId: 'novapay',
      category: 'Legal & Compliance',
      title: 'Industry Speed Comparison Claim',
      ruleStatement: 'Claims of "3x faster settlement than legacy providers" requires audited transaction benchmark.',
      targetPatterns: ['3x faster settlement', 'fastest in the industry'],
      approvedValue: 'Audited sub-second settlement benchmark (Q4 2025 audit)',
      sourceRef: 'Q1 Growth Brief',
      status: 'Unverified',
      classification: 'unsupported_claim',
      severity: 'warning',
      explanation: 'Awaiting published independent audit report to substantiate speed comparison.',
      updatedAt: '2026-10-25'
    }
  ],
  products: [
    {
      id: 'prod-np-wb-001',
      brandId: 'novapay',
      name: 'NovaPay Water Bottle',
      brandName: 'NovaPay',
      subtitle: 'Insulated stainless steel bottle',
      category: 'Merchandise',
      sku: 'NP-WB-001',
      status: 'Active',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F8FAFC"/>
              <stop offset="100%" stop-color="#EEF2F6"/>
            </linearGradient>
            <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#CBD5E1"/>
              <stop offset="35%" stop-color="#F8FAFC"/>
              <stop offset="70%" stop-color="#94A3B8"/>
              <stop offset="100%" stop-color="#CBD5E1"/>
            </linearGradient>
          </defs>
          <rect width="80" height="80" rx="14" fill="url(#bg)"/>
          <ellipse cx="40" cy="70" rx="13" ry="2.5" fill="#CBD5E1" opacity="0.6"/>
          <rect x="35" y="10" width="10" height="6" rx="2" fill="#1E3A8A"/>
          <rect x="33" y="15" width="14" height="4" rx="1.5" fill="#2563EB"/>
          <path d="M34 19 L46 19 L49 27 L49 65 C49 67.5 47 69 44.5 69 L35.5 69 C33 69 31 67.5 31 65 L31 27 Z" fill="url(#steel)" stroke="#94A3B8" stroke-width="0.8"/>
          <rect x="31.4" y="36" width="17.2" height="14" fill="#2563EB" opacity="0.14"/>
          <circle cx="40" cy="41" r="3" fill="#2563EB"/>
          <text x="40" y="48" text-anchor="middle" font-family="sans-serif" font-size="4.2" font-weight="800" fill="#1E3A8A">NovaPay</text>
        </svg>`
      )}`,
      description: 'Double-wall vacuum insulated 500ml 18/8 food-grade stainless steel bottle with leak-proof cobalt blue cap and laser-etched NovaPay horizontal lockup.',
      specifications: 'Capacity: 500ml (17 oz) · Material: 18/8 BPA-free Stainless Steel · Thermal rating: 24h cold / 12h hot · Dimensions: 225mm × 70mm',
      price: '₹1,299',
      priceVerified: true,
      packagingDetails: 'Recyclable matte white cylinder tube with Cobalt Blue (#2563EB) seal label and SKU barcode.',
      colors: ['#CBD5E1', '#2563EB', '#0F172A'],
      logoPlacement: 'Centered vertical laser-etching with official blue icon badge on front body (min 12mm margin).',
      visualIdentityNotes: 'Must use official compound wordmark "NovaPay" in Plus Jakarta Sans Bold; no circular red badges.',
      approvedClaims: [
        'BPA-free 18/8 food-grade stainless steel',
        'Keeps beverages cold for up to 24 hours',
        'Official NovaPay enterprise merchandise'
      ],
      prohibitedClaims: [
        'Keeps drinks ice-cold for 72 hours',
        'Lifetime unbreakable guarantee',
        'Self-cleaning UV sterilization'
      ],
      sourceRef: 'NovaPay Brand Merchandise Catalog 2026 · §2.1 (SKU NP-WB-001)',
      sourceType: 'official_catalog',
      uncertainFields: [],
      updatedAt: '12 Oct 2026'
    },
    {
      id: 'prod-np-cap-002',
      brandId: 'novapay',
      name: 'NovaPay Cap',
      brandName: 'NovaPay',
      subtitle: 'Branded cap with embroidered logo',
      category: 'Merchandise',
      sku: 'NP-CAP-002',
      status: 'Active',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
          <rect width="80" height="80" rx="14" fill="#F4F6F9"/>
          <ellipse cx="40" cy="61" rx="24" ry="4" fill="#CBD5E1" opacity="0.55"/>
          <path d="M18 46 C18 27 30 20 43 20 C55 20 63 28 63 44 L18 46 Z" fill="#0F172A"/>
          <path d="M38 20 C44 20 49 28 49 45" stroke="#1E293B" stroke-width="1.2" fill="none"/>
          <circle cx="41" cy="19.5" r="2" fill="#1E293B"/>
          <path d="M14 46 C22 43 44 43 56 46 C64 48 68 52 62 55 C50 58 26 56 14 50 Z" fill="#1E293B"/>
          <rect x="29" y="31" width="18" height="7" rx="2" fill="#0F172A"/>
          <text x="38" y="36.2" text-anchor="middle" font-family="sans-serif" font-size="5" font-weight="800" fill="#FFFFFF">NovaPay</text>
        </svg>`
      )}`,
      description: 'Structured 6-panel brushed organic cotton twill cap in Navy Slate (#0F172A) featuring 3D white & cobalt blue embroidered NovaPay horizontal wordmark.',
      specifications: 'Material: 100% Organic Cotton Twill · Closure: Matte gunmetal tri-glide buckle · Crown: Mid-profile structured 6-panel · One size fits most (56–60cm)',
      price: '₹799',
      priceVerified: true,
      packagingDetails: 'Biodegradable frosted polybag with recycled kraft hangtag displaying SKU NP-CAP-002.',
      colors: ['#0F172A', '#FFFFFF', '#2563EB'],
      logoPlacement: 'Front center crown embroidery (55mm × 14mm) in crisp white thread with Cobalt Blue icon accent.',
      visualIdentityNotes: 'Embroidery must strictly follow horizontal lockup proportions; curved or stacked wordmark prohibited.',
      approvedClaims: [
        '100% brushed organic cotton twill',
        'High-density 3D embroidered NovaPay lockup',
        'Adjustable gunmetal buckle closure'
      ],
      prohibitedClaims: [
        'Waterproof gore-tex membrane',
        'UV-100 medical grade sun block'
      ],
      sourceRef: 'NovaPay Brand Merchandise Catalog 2026 · §2.4 (SKU NP-CAP-002)',
      sourceType: 'official_catalog',
      uncertainFields: [],
      updatedAt: '10 Oct 2026'
    },
    {
      id: 'prod-np-ts-003',
      brandId: 'novapay',
      name: 'NovaPay T-Shirt',
      brandName: 'NovaPay',
      subtitle: 'Cotton t-shirt with logo',
      category: 'Apparel',
      sku: 'NP-TS-003',
      status: 'Draft',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
          <rect width="80" height="80" rx="14" fill="#F4F6F9"/>
          <path d="M26 18 L33 16 C35 19.5 45 19.5 47 16 L54 18 L64 29 L57 36 L52 31 L52 63 L28 63 L28 31 L23 36 L16 29 Z" fill="#111827" stroke="#1E293B" stroke-width="0.8"/>
          <rect x="32" y="29" width="16" height="6" rx="1" fill="#1E293B" opacity="0.5"/>
          <circle cx="35" cy="32" r="1.6" fill="#2563EB"/>
          <text x="41.5" y="33.5" text-anchor="middle" font-family="sans-serif" font-size="3.8" font-weight="800" fill="#FFFFFF">NovaPay</text>
        </svg>`
      )}`,
      description: 'Heavyweight 220 GSM combed ringspun cotton crew-neck t-shirt in Deep Slate with matte screen-printed NovaPay chest lockup.',
      specifications: 'Fabric: 100% Combed Ringspun Cotton (220 GSM) · Fit: Modern Unisex Regular · Sizes: XS–XXL · Pre-shrunk enzyme washed',
      price: '₹1,199',
      priceVerified: false,
      packagingDetails: 'Folded with custom Navy Slate belly band and size sticker.',
      colors: ['#0F172A', '#2563EB', '#FFFFFF'],
      logoPlacement: 'Center chest horizontal lockup (180mm width) or left-chest pocket print (75mm width).',
      visualIdentityNotes: 'Draft apparel item awaiting Q4 print colorfastness verification before external campaign use.',
      approvedClaims: [
        '220 GSM heavyweight combed ringspun cotton',
        'Soft-hand eco-friendly water-based screen print'
      ],
      prohibitedClaims: [
        'Moisture-wicking athletic compression fabric',
        'Fire-retardant industrial garment'
      ],
      sourceRef: 'Apparel & Event Kit Spec Sheet Draft v1.4 (SKU NP-TS-003)',
      sourceType: 'manual',
      uncertainFields: ['price'],
      updatedAt: '08 Oct 2026'
    },
    {
      id: 'prod-np-mug-004',
      brandId: 'novapay',
      name: 'NovaPay Coffee Mug',
      brandName: 'NovaPay',
      subtitle: 'Ceramic mug with logo',
      category: 'Merchandise',
      sku: 'NP-MUG-004',
      status: 'Active',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
          <rect width="80" height="80" rx="14" fill="#F4F6F9"/>
          <ellipse cx="38" cy="64" rx="18" ry="3.5" fill="#CBD5E1" opacity="0.6"/>
          <path d="M51 31 C59 31 61 36 61 42 C61 48 59 53 51 53" fill="none" stroke="#1D4ED8" stroke-width="4.5" stroke-linecap="round"/>
          <rect x="22" y="24" width="31" height="37" rx="5" fill="#2563EB"/>
          <ellipse cx="37.5" cy="24" rx="15.5" ry="3.2" fill="#DBEAFE" stroke="#2563EB" stroke-width="1.2"/>
          <text x="37.5" y="44" text-anchor="middle" font-family="sans-serif" font-size="5.5" font-weight="800" fill="#FFFFFF">NovaPay</text>
        </svg>`
      )}`,
      description: '350ml matte Cobalt Blue stoneware ceramic coffee mug with gloss white interior and kiln-fired NovaPay wordmark.',
      specifications: 'Capacity: 350ml (12 oz) · Material: High-fired Stoneware Ceramic · Care: Dishwasher & microwave safe · Height: 96mm',
      price: '₹599',
      priceVerified: true,
      packagingDetails: 'Protective corrugated gift box with custom die-cut window and Brand Assets Guide care card.',
      colors: ['#2563EB', '#FFFFFF', '#0F172A'],
      logoPlacement: 'Outward-facing side wrap in pure white (#FFFFFF) with 16px equivalent perimeter clear space.',
      visualIdentityNotes: 'Exterior glaze must match Pantone-equivalent Cobalt Blue (#2563EB).',
      approvedClaims: [
        '350ml high-fired stoneware ceramic',
        'Dishwasher and microwave safe glaze',
        'Official Cobalt Blue (#2563EB) exterior finish'
      ],
      prohibitedClaims: [
        'Self-heating battery mug',
        'Unbreakableborosilicate titanium core'
      ],
      sourceRef: 'NovaPay Brand Merchandise Catalog 2026 · §3.2 (SKU NP-MUG-004)',
      sourceType: 'official_catalog',
      uncertainFields: [],
      updatedAt: '05 Oct 2026'
    },
    {
      id: 'prod-np-nb-005',
      brandId: 'novapay',
      name: 'NovaPay Notebook',
      brandName: 'NovaPay',
      subtitle: 'A5 spiral notebook',
      category: 'Stationery',
      sku: 'NP-NB-005',
      status: 'Unverified',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
          <rect width="80" height="80" rx="14" fill="#F4F6F9"/>
          <rect x="24" y="15" width="34" height="50" rx="3" fill="#0F172A" stroke="#334155" stroke-width="0.8"/>
          <g stroke="#94A3B8" stroke-width="1.6" stroke-linecap="round">
            <line x1="21" y1="20" x2="26" y2="20"/>
            <line x1="21" y1="26" x2="26" y2="26"/>
            <line x1="21" y1="32" x2="26" y2="32"/>
            <line x1="21" y1="38" x2="26" y2="38"/>
            <line x1="21" y1="44" x2="26" y2="44"/>
            <line x1="21" y1="50" x2="26" y2="50"/>
            <line x1="21" y1="56" x2="26" y2="56"/>
            <line x1="21" y1="60" x2="26" y2="60"/>
          </g>
          <rect x="30" y="34" width="22" height="10" rx="1.5" fill="#1E293B"/>
          <text x="41" y="40.5" text-anchor="middle" font-family="sans-serif" font-size="4.6" font-weight="800" fill="#FFFFFF">NovaPay</text>
        </svg>`
      )}`,
      description: 'A5 twin-wire spiral executive notebook with soft-touch Navy Slate hard cover, 160 dotted FSC-certified 100 GSM pages, and silver foil NovaPay wordmark.',
      specifications: 'Format: A5 (148mm × 210mm) · Pages: 160 pages (80 sheets) 100 GSM ivory dot-grid paper · Binding: Matte black twin-wire spiral',
      price: '₹449',
      priceVerified: false,
      packagingDetails: 'Shrink-wrapped with removable SKU barcode label on back cover.',
      colors: ['#0F172A', '#94A3B8', '#FFFFFF'],
      logoPlacement: 'debossed silver foil stamp centered on front cover.',
      visualIdentityNotes: 'Extracted from vendor packaging sample; foil contrast and paper GSM certificate require brand team verification.',
      approvedClaims: [
        'A5 twin-wire spiral executive notebook',
        '160 dot-grid pages on 100 GSM acid-free paper'
      ],
      prohibitedClaims: [
        'Waterproof stone paper pages',
        'Includes smart digital stylus'
      ],
      sourceRef: 'Vendor Sample Label OCR Extraction (SKU NP-NB-005)',
      sourceType: 'image_ocr',
      uncertainFields: ['price', 'specifications'],
      updatedAt: '01 Oct 2026'
    }
  ],
  sampleScenarios: [
    {
      id: 'scenario-canonical-01',
      brandId: 'novapay',
      title: 'NovaPay Promotional Ad (Canonical)',
      badge: 'Canonical Demo',
      contentType: 'Advertisement',
      text: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
      description: 'Canonical test advertisement containing brand name typo ("Nova Pay"), prohibited profit claim, and invalid price.'
    },
    {
      id: 'scenario-compliant-02',
      brandId: 'novapay',
      title: 'NovaPay Compliant Merchant Launch',
      badge: 'Compliant',
      contentType: 'Social Post',
      text: 'NovaPay delivers high-speed payment processing with enterprise security. Standard subscription starts at ₹999/month.',
      description: 'Fully compliant marketing draft verifying approved terminology, facts, and tone.'
    }
  ],
  sampleAdImages: [
    {
      id: 'sample-ad-canonical',
      title: 'NovaPay Ad — Prohibited Claim Conflict',
      filename: 'novapay-ad-prohibited-claim.png',
      assetPath: '/assets/sample-ads/novapay-ad-prohibited-claim.png',
      badge: 'Prohibited Claim',
      description: 'Contains prohibited "guarantees risk-free profits" claim with improper clear space.',
      expectedIssues: ['Prohibited financial claim', 'Clear space violation']
    },
    {
      id: 'sample-ad-compliant',
      title: 'NovaPay Ad — Approved Compliant Layout',
      filename: 'novapay-ad-compliant.png',
      assetPath: '/assets/sample-ads/novapay-ad-compliant.png',
      badge: 'Compliant',
      description: 'Full compliance with approved horizontal logo, ₹999/month price, and approved color palette.',
      expectedIssues: []
    },
    {
      id: 'sample-ad-wrong-price',
      title: 'NovaPay Ad — Wrong Price (₹499/mo)',
      filename: 'novapay-ad-wrong-price.png',
      assetPath: '/assets/sample-ads/novapay-ad-wrong-price.png',
      badge: 'Price Conflict',
      description: 'Lists obsolete ₹499/month price instead of approved ₹999/month standard subscription.',
      expectedIssues: ['Commercial price conflict']
    },
    {
      id: 'sample-ad-wrong-logo',
      title: 'NovaPay Ad — Prohibited Circular Badge',
      filename: 'novapay-ad-wrong-logo.png',
      assetPath: '/assets/sample-ads/novapay-ad-wrong-logo.png',
      badge: 'Wrong Logo',
      description: 'Uses unapproved circular red coin logo variant instead of official horizontal lockup.',
      expectedIssues: ['Unapproved logo variant']
    },
    {
      id: 'sample-ad-wrong-product-name',
      title: 'NovaPay Ad — Brand Name Typo (Nova Pay)',
      filename: 'novapay-ad-wrong-product-name.png',
      assetPath: '/assets/sample-ads/novapay-ad-wrong-product-name.png',
      badge: 'Nomenclature',
      description: 'Features spaced "Nova Pay" product name instead of approved compound "NovaPay".',
      expectedIssues: ['Terminology / Naming conflict']
    },
    {
      id: 'sample-ad-unsupported-claim',
      title: 'NovaPay Ad — Unsupported Speed Claim',
      filename: 'novapay-ad-unsupported-claim.png',
      assetPath: '/assets/sample-ads/novapay-ad-unsupported-claim.png',
      badge: 'Unsupported Claim',
      description: 'Claims 3x faster processing without citing published benchmark audit.',
      expectedIssues: ['Unsupported verification needed']
    }
  ]
};

export const INITIAL_BRANDS: Record<string, BrandProfile> = {
  novapay: NOVAPAY_BRAND
};

export const BRANDS: Record<string, BrandProfile> = INITIAL_BRANDS;

export const INITIAL_AUDIT_HISTORY: AuditReport[] = [];
