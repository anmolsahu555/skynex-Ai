import {
  BrandProduct,
  PriceAuditDetails,
  ClassifiedPosterEntities,
  ClassifiedPercentage
} from '../types.ts';

export type { PriceAuditDetails, ClassifiedPosterEntities, ClassifiedPercentage };

export interface AdvertisedDiscount {
  raw: string;
  type: 'percentage' | 'flat';
  value: number; // e.g. 10 for 10%, 100 for ₹100
  startIndex: number;
  endIndex: number;
}

export interface ExtractedPriceSpan {
  raw: string;
  amount: number;
  currencySymbol: string;
  hasRecurringPeriod: boolean;
  isExplicitMrp: boolean;
  isExplicitSellingPrice: boolean;
  startIndex: number;
  endIndex: number;
}

export interface DiscountValidationOptions {
  roundingTolerance?: number; // Default: 0.05
  allowIntegerRounding?: boolean; // Default: true (e.g. ₹719 vs ₹719.10)
}

export interface DiscountValidationResult {
  status: 'pass' | 'fail' | 'ambiguous' | 'unverified_product' | 'missing_product';
  statusLabel: string;
  priceAuditDetails: PriceAuditDetails;
  flaggedSpan?: string;
  startIndex?: number;
  endIndex?: number;
  suggestedCorrection?: string;
  conflictText?: string;
  explanation: string;
  requiresHumanReview: boolean;
}

/**
 * Format currency amount cleanly:
 * - If integer (e.g. 799), format as "₹799"
 * - If non-zero decimals (e.g. 719.1), format as "₹719.10"
 * - Supports custom currency symbol (default: '₹')
 */
export function formatCurrency(
  amount: number,
  currencySymbol = '₹',
  forceDecimals = false
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'N/A';
  }

  const isWhole = Math.abs(amount - Math.round(amount)) < 0.001;
  const numStr = isWhole && !forceDecimals ? amount.toFixed(0) : amount.toFixed(2);
  return `${currencySymbol}${numStr}`;
}

/**
 * Contextual Entity Classifier:
 * Classifies every extracted percentage using its surrounding text and context before assigning meaning.
 * Recognizes:
 * - Discount-related phrases: "10% OFF", "20% discount", "Save 15%", "Flat 30% OFF", "90% OFF TODAY ONLY"
 * - Non-discount claims:
 *   - "100% guaranteed investment returns" -> investment_or_financial_claims
 *   - "100% natural" -> promotional_claims
 *   - "99% accuracy" -> promotional_claims
 *   - "24K gold" -> promotional_claims (never a price)
 *   - "100% satisfaction guaranteed" -> promotional_claims
 * Extracts separate structured fields:
 *   - original_price
 *   - discounted_price
 *   - discount_percentage
 *   - flat_discount_amount
 *   - promotional_claims
 *   - investment_or_financial_claims
 */
export function classifyPosterEntities(text: string): ClassifiedPosterEntities {
  if (!text || !text.trim()) {
    return {
      original_price: null,
      discounted_price: null,
      discount_percentage: null,
      flat_discount_amount: null,
      promotional_claims: [],
      investment_or_financial_claims: [],
      rawPercentages: []
    };
  }

  const rawPercentages: ClassifiedPercentage[] = [];
  const promotional_claims: string[] = [];
  const investment_or_financial_claims: string[] = [];
  let discount_percentage: number | null = null;
  let flat_discount_amount: number | null = null;

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Contextual Percentage Classification
  const pctRegex = /\b(\d{1,3}(?:\.\d+)?)\s*%/g;
  let pctMatch: RegExpExecArray | null;

  while ((pctMatch = pctRegex.exec(text)) !== null) {
    const raw = pctMatch[0];
    const value = parseFloat(pctMatch[1]);
    const startIndex = pctMatch.index;
    const endIndex = startIndex + raw.length;

    // Confine surrounding context to the current line/clause to prevent cross-line bleeding
    const lineContaining =
      lines.find(l => l.includes(raw)) ||
      text.slice(Math.max(0, startIndex - 40), Math.min(text.length, endIndex + 50)).trim();

    const rawPosInLine = lineContaining.indexOf(raw);
    const prefixContext = (rawPosInLine >= 0 ? lineContaining.slice(0, rawPosInLine) : '').toLowerCase();
    const suffixContext = (rawPosInLine >= 0 ? lineContaining.slice(rawPosInLine + raw.length) : '').toLowerCase();

    // Check A: Financial & Investment Claims
    // e.g. "100% guaranteed investment returns", "100% guaranteed returns", "risk-free profits"
    const isFinancialOrInvestment =
      /\b(?:investment\s+returns?|guaranteed\s+(?:investment\s+)?returns?|risk[- ]free\s+profits?|returns?\b|roi\b|profits?\b|dividends?\b|yield\b|portfolio\b|capital\s+returns?|apy\b|apr\b)/i.test(
        suffixContext
      ) ||
      /\b(?:investment|returns?|profit|roi|yield|capital)\b/i.test(prefixContext);

    if (isFinancialOrInvestment) {
      const claimPhrase = lineContaining.trim();
      if (!investment_or_financial_claims.includes(claimPhrase)) {
        investment_or_financial_claims.push(claimPhrase);
      }
      rawPercentages.push({
        raw,
        value,
        category: 'financial_investment_claim',
        phrase: claimPhrase,
        startIndex,
        endIndex
      });
      continue;
    }

    // Check B: Product Quality, Natural Composition, Accuracy, Satisfaction Warranty
    // e.g. "100% natural", "99% accuracy", "100% satisfaction guaranteed", "100% cotton", "100% organic"
    const isProductQualityOrWarranty =
      /\b(?:natural\b|organic\b|cotton\b|pure\b|accuracy\b|satisfaction\s+guaranteed\b|money\s+back(?:\s+guarantee)?\b|uptime\b|vegan\b|handcrafted\b|recycled\b|wool\b|silk\b|leather\b|safe\s+for\s+everyone\b|waterproof\b)/i.test(
        suffixContext
      ) ||
      /\b(?:accuracy\s+of|purity\s+of|composed\s+of|made\s+from|guarantee\s+of)\b/i.test(prefixContext);

    if (isProductQualityOrWarranty) {
      const claimPhrase = lineContaining.trim();
      if (!promotional_claims.includes(claimPhrase)) {
        promotional_claims.push(claimPhrase);
      }
      rawPercentages.push({
        raw,
        value,
        category: 'product_quality_claim',
        phrase: claimPhrase,
        startIndex,
        endIndex
      });
      continue;
    }

    // Check C: Genuine Discount Phrases
    // Recognized discount phrases:
    // - "10% OFF"
    // - "90% OFF TODAY ONLY"
    // - "20% discount"
    // - "Save 15%"
    // - "Flat 30% OFF"
    const isDiscount =
      /\b(?:off(?:\s+(?:today(?:\s+only)?|now|storewide|site-wide|sitewide|limited|online|instore))?|discount|cashback|savings?|less)\b/i.test(
        suffixContext
      ) ||
      /\b(?:save|discount\s+of|flat|get|extra|upto|up\s+to)\s*$/i.test(prefixContext);

    if (isDiscount && value > 0 && value < 100) {
      rawPercentages.push({
        raw,
        value,
        category: 'discount',
        phrase: lineContaining.trim(),
        startIndex,
        endIndex
      });
      if (discount_percentage === null) {
        discount_percentage = value;
      }
      continue;
    }

    // Check D: Other Claims - Never treat an arbitrary percentage as a discount merely because of '%'
    const otherClaimPhrase = lineContaining.trim();
    if (!promotional_claims.includes(otherClaimPhrase)) {
      promotional_claims.push(otherClaimPhrase);
    }
    rawPercentages.push({
      raw,
      value,
      category: 'other_claim',
      phrase: otherClaimPhrase,
      startIndex,
      endIndex
    });
  }

  // 2. Extract Advertised Flat Discount Amounts (e.g. "Flat ₹100 OFF", "Save $50")
  const flatRegex =
    /(?:(?:flat|save|get|extra)[^\S\r\n]+)?(?:₹|\u20B9|INR[^\S\r\n]*|Rs\.?[^\S\r\n]*|\$)[^\S\r\n]*(\d[\d,]*(?:\.\d{1,2})?)[^\S\r\n]*(?:off|discount|cashback|savings?|less)\b|\b(?:save|discount[^\S\r\n]+of|get[^\S\r\n]+flat)[^\S\r\n]+(?:₹|\u20B9|INR[^\S\r\n]*|Rs\.?[^\S\r\n]*|\$)[^\S\r\n]*(\d[\d,]*(?:\.\d{1,2})?)\b/gi;
  let flatMatch: RegExpExecArray | null;
  while ((flatMatch = flatRegex.exec(text)) !== null) {
    const valStr = (flatMatch[1] || flatMatch[2] || '').replace(/,/g, '');
    const val = parseFloat(valStr);
    if (!Number.isNaN(val) && val > 0 && flat_discount_amount === null) {
      flat_discount_amount = val;
    }
  }

  // 3. Extract Non-Percentage Promotional / Product Claims
  // e.g. "Certified 24K gold for every customer", "24K gold", "Limited offer. Safe for everyone. No risk."
  for (const line of lines) {
    const isGoldOrJewellerySpec =
      /\b\d{1,2}\s*[kK]\s*(?:gold|silver|diamond|jewellery|jewelry)?\b/i.test(line) ||
      /\b(?:certified\s+)?\d{1,2}\s*karat\b/i.test(line);

    const isPromotionalStatement =
      /\b(?:certified|handcrafted|satisfaction|limited\s+offer|safe\s+for\s+everyone|no\s+risk|mega\s+gold\s+sale|exclusive\s+deal)\b/i.test(
        line
      );

    const isAlreadyFinancial = investment_or_financial_claims.includes(line);
    const isPureDiscountHeadline = /^\s*(?:flat\s+)?\d{1,2}%\s*off(?:\s+today(?:\s+only)?)?$/i.test(line);

    if ((isGoldOrJewellerySpec || isPromotionalStatement) && !isAlreadyFinancial && !isPureDiscountHeadline) {
      if (!promotional_claims.includes(line)) {
        promotional_claims.push(line);
      }
    }
  }

  // 4. Extract Explicit Original & Discounted Selling Prices
  // Protect against extracting gold carats (24K), percentages (100%), or flat discount numbers
  const posterPrices = extractPosterPrices(text).filter(p => {
    // Cannot be followed by %
    if (text.slice(p.endIndex, p.endIndex + 3).includes('%')) return false;
    // Cannot be inside flat discount (e.g. ₹100 inside Flat ₹100 OFF or Save ₹100)
    if (flat_discount_amount !== null && p.amount === flat_discount_amount) {
      const surrounding = text.slice(Math.max(0, p.startIndex - 25), Math.min(text.length, p.endIndex + 25));
      const nearDiscountKeyword = /\b(?:off|discount|save|less|flat|cashback)\b/i.test(surrounding);
      if (nearDiscountKeyword) return false;
    }
    return true;
  });

  let original_price: string | null = null;
  let discounted_price: string | null = null;

  const explicitMrp = posterPrices.find(p => p.isExplicitMrp);
  const explicitSelling = posterPrices.find(p => p.isExplicitSellingPrice);

  if (explicitMrp) {
    original_price = explicitMrp.raw;
  }
  if (explicitSelling) {
    discounted_price = explicitSelling.raw;
  } else if (posterPrices.length === 1 && !explicitMrp) {
    discounted_price = posterPrices[0].raw;
  } else if (posterPrices.length >= 2 && !explicitMrp) {
    const sorted = [...posterPrices].sort((a, b) => b.amount - a.amount);
    original_price = sorted[0].raw;
    discounted_price = sorted[1].raw;
  }

  return {
    original_price,
    discounted_price,
    discount_percentage,
    flat_discount_amount,
    promotional_claims,
    investment_or_financial_claims,
    rawPercentages
  };
}

/**
 * Extracts all advertised discounts (percentage and flat) from poster/draft text.
 * Strictly uses contextual classification so non-discount percentages
 * (like "100% guaranteed investment returns", "100% natural", "99% accuracy")
 * are NEVER treated as discounts.
 */
export function extractAdvertisedDiscounts(text: string): AdvertisedDiscount[] {
  if (!text || !text.trim()) return [];

  const entities = classifyPosterEntities(text);
  const discounts: AdvertisedDiscount[] = [];

  // 1. Percentage Discounts - ONLY include verified discount category
  if (entities.rawPercentages) {
    for (const p of entities.rawPercentages) {
      if (p.category === 'discount') {
        discounts.push({
          raw: p.raw,
          type: 'percentage',
          value: p.value,
          startIndex: p.startIndex,
          endIndex: p.endIndex
        });
      }
    }
  }

  // 2. Flat Currency Discounts
  const flatRegex =
    /(?:(?:flat|save|get|extra)[^\S\r\n]+)?(?:₹|\u20B9|INR[^\S\r\n]*|Rs\.?[^\S\r\n]*|\$)[^\S\r\n]*(\d[\d,]*(?:\.\d{1,2})?)[^\S\r\n]*(?:off|discount|cashback|savings?|less)\b|\b(?:save|discount[^\S\r\n]+of|get[^\S\r\n]+flat)[^\S\r\n]+(?:₹|\u20B9|INR[^\S\r\n]*|Rs\.?[^\S\r\n]*|\$)[^\S\r\n]*(\d[\d,]*(?:\.\d{1,2})?)\b/gi;

  let flatMatch: RegExpExecArray | null;
  while ((flatMatch = flatRegex.exec(text)) !== null) {
    const raw = flatMatch[0].trim();
    const valStr = (flatMatch[1] || flatMatch[2] || '').replace(/,/g, '');
    const value = parseFloat(valStr);

    if (!Number.isNaN(value) && value > 0) {
      const startIndex = flatMatch.index;
      const endIndex = startIndex + raw.length;
      const already = discounts.some(
        d => !(endIndex <= d.startIndex || startIndex >= d.endIndex)
      );
      if (!already) {
        discounts.push({
          raw,
          type: 'flat',
          value,
          startIndex,
          endIndex
        });
      }
    }
  }

  return discounts;
}

/**
 * Extracts price mentions from the text and categorizes whether they are
 * explicit MRP/Original prices or Displayed Selling Prices.
 * Strictly prevents non-currency numbers (such as 24K gold, 100% return) from being parsed as prices.
 */
export function extractPosterPrices(text: string): ExtractedPriceSpan[] {
  if (!text || !text.trim()) return [];

  const prices: ExtractedPriceSpan[] = [];
  const priceRegex =
    /(?:₹|\u20B9|INR\s*|Rs\.?\s*|\$)\s*(\d[\d,]*(?:\.\d{1,2})?)(?:\s*(?:\/\s*(?:month|mo|yr|year)|per\s+(?:month|mo|year)))?/gi;

  let match: RegExpExecArray | null;
  while ((match = priceRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    const numStr = match[1].replace(/,/g, '');
    const amount = parseFloat(numStr);
    if (Number.isNaN(amount)) continue;

    const startIndex = match.index;
    const endIndex = startIndex + raw.length;
    const isUsd = /^\s*\$/.test(raw);
    const currencySymbol = isUsd ? '$' : '₹';
    const hasRecurringPeriod = /(?:\/\s*(?:month|mo|yr|year)|per\s+(?:month|mo|year))/i.test(raw);

    // Look at immediate surrounding context (40 chars before & after)
    const prefixContext = text.slice(Math.max(0, startIndex - 40), startIndex).toLowerCase();
    const suffixContext = text.slice(endIndex, Math.min(text.length, endIndex + 25)).toLowerCase();

    // Guard against non-price numbers like % or karat/gold
    if (/^\s*(?:%|[kK]\b|karat|ct\b|carat|gold)/i.test(suffixContext)) {
      continue;
    }

    const isExplicitMrp =
      /(?:mrp|m\.r\.p\.|original\s+price|original|was|regular\s+price|list\s+price|strike(?:through|\s+through))(?:\s*\([^)]*\))?\s*:?\s*$/i.test(
        prefixContext
      ) ||
      /\b(?:mrp|m\.r\.p\.|original|strike(?:through|\s+through))\b/i.test(suffixContext) ||
      /\((?:strikethrough|strike-through|mrp|original)\)/i.test(prefixContext);

    // Strict explicit selling price context (avoid loose "today only")
    const isExplicitSellingPrice =
      /(?:now\s+(?:at\s+)?(?:for\s+)?|for\s+only\s+|for\s+just\s+|special\s+offer\s*:?\s*|offer\s+price\s*:?\s*|sale\s+price\s*:?\s*|deal\s+price\s*:?\s*|current\s+price\s*:?\s*|selling\s+price\s*:?\s*|final\s+price\s*:?\s*|buy\s+(?:now\s+)?(?:at|for)\s+|price\s*:?\s*|at\s+just\s+)$/i.test(
        prefixContext
      );

    prices.push({
      raw,
      amount,
      currencySymbol,
      hasRecurringPeriod,
      isExplicitMrp,
      isExplicitSellingPrice,
      startIndex,
      endIndex
    });
  }

  return prices;
}

/**
 * Calculates expected selling price from original price and discount.
 */
export function calculateExpectedPrice(
  originalPrice: number,
  discount?: { type: 'percentage' | 'flat'; value: number }
): {
  expectedPrice: number;
  formula: string;
} {
  if (!discount || discount.value <= 0) {
    return {
      expectedPrice: originalPrice,
      formula: `Original Verified Price = ${originalPrice}`
    };
  }

  if (discount.type === 'percentage') {
    const calculated = originalPrice * (1 - discount.value / 100);
    const rounded = Math.round(calculated * 100) / 100;
    return {
      expectedPrice: rounded,
      formula: `${originalPrice} * (1 - ${discount.value} / 100) = ${rounded.toFixed(2)}`
    };
  }

  // Flat discount
  const calculated = Math.max(0, originalPrice - discount.value);
  const rounded = Math.round(calculated * 100) / 100;
  return {
    expectedPrice: rounded,
    formula: `${originalPrice} - ${discount.value} = ${rounded.toFixed(2)}`
  };
}

/**
 * Core validation engine: Validates displayed poster selling price against
 * the calculated expected selling price from the verified product database.
 */
export function validatePosterDiscountAndPricing(params: {
  product?: BrandProduct | null;
  productNotFound?: boolean;
  draftText: string;
  options?: DiscountValidationOptions;
}): DiscountValidationResult {
  const { product, productNotFound, draftText, options } = params;
  const tolerance = options?.roundingTolerance ?? 0.05;
  const allowIntegerRounding = options?.allowIntegerRounding ?? true;

  // Case A: Missing product record in saved catalog
  if (productNotFound || !product) {
    return {
      status: 'missing_product',
      statusLabel: 'FAIL — Missing Product Record',
      priceAuditDetails: {
        verifiedOriginalPrice: 'Missing from Catalog',
        originalPriceAmount: null,
        detectedDiscount: 'Unknown',
        discountType: 'none',
        discountValue: null,
        expectedSellingPrice: 'Cannot calculate without verified product record',
        expectedPriceAmount: null,
        actualPosterPrice: 'Unknown',
        actualPriceAmount: null,
        validationStatus: 'missing_product',
        validationStatusLabel: 'FAIL — Missing Product Record',
        suggestedCorrection: undefined,
        explanation:
          'No matching product record was found in the authoritative product catalog. Cannot validate pricing or discounts without a verified catalog item.'
      },
      explanation:
        'Product record is missing from Brand Knowledge → Products. Add and verify the product before running commercial audit.',
      requiresHumanReview: true
    };
  }

  // Case B: Product exists, but price is unverified or product is Draft/Unverified
  const rawCatalogPrice = (product.price || '').trim();
  const numCatalogPriceMatch = rawCatalogPrice.match(/(\d[\d,]*(?:\.\d{1,2})?)/);
  const catalogPriceAmount = numCatalogPriceMatch
    ? parseFloat(numCatalogPriceMatch[1].replace(/,/g, ''))
    : null;

  const isVerified =
    product.status === 'Active' &&
    Boolean(product.priceVerified) &&
    catalogPriceAmount !== null &&
    catalogPriceAmount > 0;

  if (!isVerified) {
    return {
      status: 'unverified_product',
      statusLabel: 'FAIL — Unverified Catalog Price',
      priceAuditDetails: {
        verifiedOriginalPrice: rawCatalogPrice ? `${rawCatalogPrice} (Unverified)` : 'Unverified',
        originalPriceAmount: catalogPriceAmount,
        detectedDiscount: 'Pending verification',
        discountType: 'none',
        discountValue: null,
        expectedSellingPrice: 'Requires verified original price in catalog',
        expectedPriceAmount: null,
        actualPosterPrice: 'Unverified',
        actualPriceAmount: null,
        validationStatus: 'unverified_product',
        validationStatusLabel: 'FAIL — Unverified Catalog Price',
        suggestedCorrection: undefined,
        productSku: product.sku,
        productName: product.name,
        explanation: `Product "${product.name}" (${product.sku}) exists in the catalog but its price is unverified (status: ${product.status}, priceVerified: ${product.priceVerified}). The audit cannot authenticate discounts against unverified ground truth.`
      },
      explanation: `Product "${product.name}" (${product.sku}) does not have a verified official price in Brand Knowledge → Products. Please verify the official price before publishing discounts.`,
      requiresHumanReview: true
    };
  }

  const currencySymbol = /^\s*\$/.test(rawCatalogPrice) ? '$' : '₹';
  const verifiedOriginalPriceFormatted = formatCurrency(catalogPriceAmount!, currencySymbol);

  // Extract discounts and prices from poster
  const detectedDiscounts = extractAdvertisedDiscounts(draftText);
  const rawExtractedPrices = extractPosterPrices(draftText);

  // CRITICAL: Any price tag that falls within an advertised flat discount callout
  // (e.g. "Flat ₹100 OFF", "Save ₹50") is the discount amount, NOT the selling price or MRP!
  const extractedPrices = rawExtractedPrices.filter(p => {
    return !detectedDiscounts.some(
      d => d.type === 'flat' && !(p.endIndex <= d.startIndex || p.startIndex >= d.endIndex)
    );
  });

  // Case C: Check for ambiguous / conflicting discounts
  const distinctPctValues = new Set(
    detectedDiscounts.filter(d => d.type === 'percentage').map(d => d.value)
  );
  const distinctFlatValues = new Set(
    detectedDiscounts.filter(d => d.type === 'flat').map(d => d.value)
  );

  const hasMultipleConflictingDiscounts =
    distinctPctValues.size > 1 ||
    distinctFlatValues.size > 1 ||
    (distinctPctValues.size >= 1 && distinctFlatValues.size >= 1);

  if (hasMultipleConflictingDiscounts) {
    const discountDescriptions = detectedDiscounts.map(d => d.raw).join(', ');
    return {
      status: 'ambiguous',
      statusLabel: 'AMBIGUOUS — Conflicting Discounts Detected',
      priceAuditDetails: {
        verifiedOriginalPrice: verifiedOriginalPriceFormatted,
        originalPriceAmount: catalogPriceAmount,
        detectedDiscount: `Ambiguous (${discountDescriptions})`,
        discountType: 'ambiguous',
        discountValue: null,
        expectedSellingPrice: 'Ambiguous — multiple conflicting discounts found',
        expectedPriceAmount: null,
        actualPosterPrice: extractedPrices[0]?.raw || 'Uncertain',
        actualPriceAmount: extractedPrices[0]?.amount || null,
        validationStatus: 'ambiguous',
        validationStatusLabel: 'AMBIGUOUS — Conflicting Discounts',
        suggestedCorrection: undefined,
        productSku: product.sku,
        productName: product.name,
        isAmbiguous: true,
        ambiguityReason: `Poster specifies multiple conflicting discount claims: ${discountDescriptions}.`,
        explanation: `Poster specifies conflicting discount terms (${discountDescriptions}). Cannot determine which discount applies to "${product.name}". Human clarification is required.`
      },
      flaggedSpan: detectedDiscounts[0]?.raw,
      startIndex: detectedDiscounts[0]?.startIndex,
      endIndex: detectedDiscounts[0]?.endIndex,
      conflictText: `Ambiguous discount claims: Poster displays multiple conflicting discounts (${discountDescriptions}).`,
      explanation: `Ambiguous discount terms (${discountDescriptions}) detected on "${product.name}". Resolve discount conflict rather than guessing selling price.`,
      requiresHumanReview: true
    };
  }

  // Single discount (or none)
  const activeDiscount = detectedDiscounts[0];
  const detectedDiscountLabel = activeDiscount
    ? activeDiscount.type === 'percentage'
      ? `${activeDiscount.value}% OFF`
      : `${formatCurrency(activeDiscount.value, currencySymbol)} OFF`
    : 'None';

  // Identify whether poster explicitly displays a strikethrough / original price
  const entities = classifyPosterEntities(draftText);
  const explicitMrp = extractedPrices.find(p => p.isExplicitMrp);
  let posterOriginalPriceSpan: ExtractedPriceSpan | undefined = explicitMrp;

  if (!posterOriginalPriceSpan && entities.original_price && extractedPrices.length >= 2) {
    posterOriginalPriceSpan = extractedPrices.find(p => p.raw === entities.original_price);
  }

  // If there are multiple prices and an active discount, the higher price is candidate original price
  if (!posterOriginalPriceSpan && extractedPrices.length >= 2 && activeDiscount) {
    const sorted = [...extractedPrices].sort((a, b) => b.amount - a.amount);
    if (sorted[0].amount > sorted[1].amount) {
      posterOriginalPriceSpan = sorted[0];
    }
  }

  const hasPosterOriginalPrice = Boolean(posterOriginalPriceSpan);
  const posterOriginalPriceAmount = posterOriginalPriceSpan ? posterOriginalPriceSpan.amount : null;
  const posterOriginalPriceFormatted = posterOriginalPriceSpan ? posterOriginalPriceSpan.raw : null;

  // Base price for discount calculation:
  // If the poster explicitly specifies an original price (e.g. strikethrough ₹449), calculate the discount against that price!
  // If no poster original price is present, calculate against the authoritative catalog price.
  const basePriceAmount = posterOriginalPriceAmount !== null ? posterOriginalPriceAmount : catalogPriceAmount!;
  const originalPriceFormatted = posterOriginalPriceFormatted || verifiedOriginalPriceFormatted;

  let mrpMismatch: { posterMrp: string; verifiedMrp: string } | undefined;
  if (
    posterOriginalPriceAmount !== null &&
    Math.abs(posterOriginalPriceAmount - catalogPriceAmount!) > 0.01
  ) {
    mrpMismatch = {
      posterMrp: originalPriceFormatted,
      verifiedMrp: verifiedOriginalPriceFormatted
    };
  }

  // Calculate Expected Selling Price
  const { expectedPrice, formula } = calculateExpectedPrice(
    basePriceAmount,
    activeDiscount ? { type: activeDiscount.type, value: activeDiscount.value } : undefined
  );
  const expectedSellingPriceFormatted = formatCurrency(expectedPrice, currencySymbol);

  // Identify Displayed Final Selling Price
  let sellingPriceCandidate: ExtractedPriceSpan | undefined;

  const explicitSellingPrices = extractedPrices.filter(p => p.isExplicitSellingPrice);
  if (explicitSellingPrices.length === 1) {
    sellingPriceCandidate = explicitSellingPrices[0];
  } else if (hasPosterOriginalPrice) {
    // If we have an identified original price (e.g. ₹449), any OTHER price is the selling price
    const nonOrigPrices = extractedPrices.filter(
      p => p !== posterOriginalPriceSpan && Math.abs(p.amount - basePriceAmount) > 0.01
    );
    if (nonOrigPrices.length === 1) {
      sellingPriceCandidate = nonOrigPrices[0];
    } else if (nonOrigPrices.length > 1) {
      sellingPriceCandidate =
        nonOrigPrices.find(p => p.isExplicitSellingPrice) || nonOrigPrices[nonOrigPrices.length - 1];
    }
  } else if (extractedPrices.length > 0) {
    // If one price is exactly the catalog MRP, choose the other price as selling price
    const nonMrpPrices = extractedPrices.filter(
      p => !p.isExplicitMrp && Math.abs(p.amount - catalogPriceAmount!) > 0.01
    );
    if (nonMrpPrices.length === 1) {
      sellingPriceCandidate = nonMrpPrices[0];
    } else if (nonMrpPrices.length > 1) {
      // Multiple selling prices without distinction -> Ambiguity!
      const priceList = nonMrpPrices.map(p => p.raw).join(', ');
      return {
        status: 'ambiguous',
        statusLabel: 'AMBIGUOUS — Multiple Selling Prices',
        priceAuditDetails: {
          verifiedOriginalPrice: originalPriceFormatted,
          originalPriceAmount: basePriceAmount,
          detectedDiscount: detectedDiscountLabel,
          discountType: activeDiscount?.type || 'none',
          discountValue: activeDiscount?.value || null,
          expectedSellingPrice: expectedSellingPriceFormatted,
          expectedPriceAmount: expectedPrice,
          actualPosterPrice: `Ambiguous (${priceList})`,
          actualPriceAmount: null,
          validationStatus: 'ambiguous',
          validationStatusLabel: 'AMBIGUOUS — Multiple Selling Prices',
          suggestedCorrection: expectedSellingPriceFormatted,
          productSku: product.sku,
          productName: product.name,
          calculationFormula: formula,
          isAmbiguous: true,
          ambiguityReason: `Poster contains multiple conflicting selling prices: ${priceList}.`,
          explanation: `Multiple conflicting selling prices (${priceList}) appear in the draft for "${product.name}". Confirm the intended final selling price.`
        },
        flaggedSpan: nonMrpPrices[0].raw,
        startIndex: nonMrpPrices[0].startIndex,
        endIndex: nonMrpPrices[0].endIndex,
        conflictText: `Ambiguous selling prices: Multiple price tags (${priceList}) appear in poster copy.`,
        explanation: `Multiple prices (${priceList}) conflict in the poster copy for "${product.name}".`,
        requiresHumanReview: true
      };
    } else {
      // All prices equal the catalog MRP, or only 1 price was present
      sellingPriceCandidate = extractedPrices[0];
    }
  }

  // If no price tag was found in the poster at all
  if (!sellingPriceCandidate) {
    return {
      status: 'fail',
      statusLabel: 'FAIL — Missing Selling Price',
      priceAuditDetails: {
        verifiedOriginalPrice: originalPriceFormatted,
        originalPriceAmount: basePriceAmount,
        detectedDiscount: detectedDiscountLabel,
        discountType: activeDiscount?.type || 'none',
        discountValue: activeDiscount?.value || null,
        expectedSellingPrice: expectedSellingPriceFormatted,
        expectedPriceAmount: expectedPrice,
        actualPosterPrice: 'Missing',
        actualPriceAmount: null,
        validationStatus: 'fail',
        validationStatusLabel: 'FAIL — Missing Price',
        suggestedCorrection: expectedSellingPriceFormatted,
        productSku: product.sku,
        productName: product.name,
        calculationFormula: formula,
        mrpMismatch,
        explanation: `The poster advertises "${product.name}" with discount "${detectedDiscountLabel}", but does not display the final selling price (${expectedSellingPriceFormatted}).`
      },
      suggestedCorrection: expectedSellingPriceFormatted,
      explanation: `No visible selling price was detected in the advertisement for "${product.name}". Expected selling price is ${expectedSellingPriceFormatted}.`,
      requiresHumanReview: false
    };
  }

  const actualPosterPrice = sellingPriceCandidate.raw;
  const actualPriceAmount = sellingPriceCandidate.amount;

  // Check tolerance comparison
  // 1. Exact or decimal tolerance: |actual - expected| <= tolerance
  // 2. Integer rounding tolerance (e.g. expected 719.10 vs actual 719): |actual - Math.round(expected)| <= 1.0 if allowIntegerRounding
  const diff = Math.abs(actualPriceAmount - expectedPrice);
  const intDiff = Math.abs(actualPriceAmount - Math.round(expectedPrice));

  const isMatch =
    diff <= tolerance ||
    (allowIntegerRounding && intDiff < 0.99 && Math.abs(expectedPrice - Math.round(expectedPrice)) <= 0.5);

  if (isMatch) {
    return {
      status: 'pass',
      statusLabel: 'PASS — Verified Price Match',
      priceAuditDetails: {
        verifiedOriginalPrice: originalPriceFormatted,
        originalPriceAmount: basePriceAmount,
        detectedDiscount: detectedDiscountLabel,
        discountType: activeDiscount?.type || 'none',
        discountValue: activeDiscount?.value || null,
        expectedSellingPrice: expectedSellingPriceFormatted,
        expectedPriceAmount: expectedPrice,
        actualPosterPrice,
        actualPriceAmount,
        validationStatus: 'pass',
        validationStatusLabel: 'PASS — Verified Discount Match',
        suggestedCorrection: expectedSellingPriceFormatted,
        productSku: product.sku,
        productName: product.name,
        calculationFormula: formula,
        mrpMismatch,
        explanation: `Actual selling price (${actualPosterPrice}) accurately matches the calculated discount (${detectedDiscountLabel}) on original price (${originalPriceFormatted}).`
      },
      explanation: `Price validation passed: ${actualPosterPrice} matches verified ${detectedDiscountLabel} price ${expectedSellingPriceFormatted}.`,
      requiresHumanReview: false
    };
  }

  // Price Mismatch FAIL
  const statusLabel = activeDiscount
    ? 'FAIL — Discount price mismatch'
    : 'FAIL — Product price conflict';

  const conflictLabel = activeDiscount
    ? `Discount price mismatch for ${product.name} (${product.sku}): Poster displays ${actualPosterPrice} with ${detectedDiscountLabel}, but calculated expected price on ${hasPosterOriginalPrice ? `original price (${originalPriceFormatted})` : `verified catalog price (${verifiedOriginalPriceFormatted})`} is ${expectedSellingPriceFormatted}.`
    : `Product price conflict for ${product.name} (${product.sku}): "${actualPosterPrice}" conflicts with the verified official catalog price of ${verifiedOriginalPriceFormatted}.`;

  const explanation = activeDiscount
    ? mrpMismatch
      ? `Poster displays strikethrough original price of ${originalPriceFormatted} with advertised ${detectedDiscountLabel}. Expected selling price is ${expectedSellingPriceFormatted} (${formula}). Displayed selling price ${actualPosterPrice} does not match. Additionally, poster original price (${originalPriceFormatted}) conflicts with official catalog price of ${verifiedOriginalPriceFormatted}.`
      : `Authoritative product catalog record for "${product.name}" (SKU: ${product.sku}) specifies a verified original price of ${verifiedOriginalPriceFormatted}. With ${detectedDiscountLabel} applied, the expected price is ${expectedSellingPriceFormatted} (${formula}). The poster displays ${actualPosterPrice}, which fails discount validation.`
    : `Authoritative product catalog record for "${product.name}" (SKU: ${product.sku}) specifies a verified official price of ${verifiedOriginalPriceFormatted}. No discount was advertised, so the price must match ${verifiedOriginalPriceFormatted}.`;

  return {
    status: 'fail',
    statusLabel,
    priceAuditDetails: {
      verifiedOriginalPrice: originalPriceFormatted,
      originalPriceAmount: basePriceAmount,
      detectedDiscount: detectedDiscountLabel,
      discountType: activeDiscount?.type || 'none',
      discountValue: activeDiscount?.value || null,
      expectedSellingPrice: expectedSellingPriceFormatted,
      expectedPriceAmount: expectedPrice,
      actualPosterPrice,
      actualPriceAmount,
      validationStatus: 'fail',
      validationStatusLabel: 'Discount Price Mismatch',
      suggestedCorrection: expectedSellingPriceFormatted,
      productSku: product.sku,
      productName: product.name,
      calculationFormula: formula,
      mrpMismatch,
      explanation
    },
    flaggedSpan: actualPosterPrice,
    startIndex: sellingPriceCandidate.startIndex,
    endIndex: sellingPriceCandidate.endIndex,
    suggestedCorrection: expectedSellingPriceFormatted,
    conflictText: conflictLabel,
    explanation,
    requiresHumanReview: false
  };
}
