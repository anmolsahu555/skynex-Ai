import {
  BrandProfile,
  AuditReport
} from '../types.ts';

// ISOLATED SYNTHETIC TEST FIXTURES
// Note: Per Section 3, these synthetic test fixtures are used strictly for unit/automated testing
// and NEVER populate the live application state.
export const SYNTHETIC_TEST_BRAND: BrandProfile = {
  id: 'test-novapay',
  name: 'NovaPay',
  fictionalLabel: 'Synthetic Automated Test Brand',
  tagline: 'Payment Processing Test Suite',
  industry: 'Fintech',
  primaryColor: '#0F172A',
  rules: [
    {
      id: 'NP-RULE-01',
      brandId: 'test-novapay',
      category: 'Terminology',
      title: 'Official Product Name (NovaPay)',
      ruleStatement: 'The product name must be written as "NovaPay" (never "Nova Pay").',
      targetPatterns: ['Nova Pay', 'nova pay', 'Nova-Pay'],
      approvedValue: 'NovaPay',
      sourceRef: 'Test Nomenclature Guide §1.1',
      status: 'Approved',
      classification: 'confirmed_rule_conflict',
      severity: 'critical',
      explanation: 'Terminology conflict: "Nova Pay" differs from the approved name "NovaPay".',
      updatedAt: '2026-10-15'
    },
    {
      id: 'NP-RULE-02',
      brandId: 'test-novapay',
      category: 'Pricing & Facts',
      title: 'Approved Subscription Price (₹999 per month)',
      ruleStatement: 'The approved standard subscription price is ₹999 per month.',
      targetPatterns: ['₹499/month', '₹499 per month', '₹499/mo', 'INR 499/month', '₹499'],
      approvedValue: '₹999/month',
      sourceRef: 'Test Rate Schedule §2.1',
      status: 'Approved',
      classification: 'approved_fact_conflict',
      severity: 'critical',
      explanation: 'Price conflict: Stated subscription price conflicts with approved ₹999/month.',
      updatedAt: '2026-10-18'
    },
    {
      id: 'NP-RULE-03',
      brandId: 'test-novapay',
      category: 'Prohibited Claim',
      title: 'Prohibited Claim: Risk-Free Profits',
      ruleStatement: 'Promotional claims stating "guarantees risk-free profits" are prohibited.',
      targetPatterns: ['guarantees risk-free profits', 'risk-free profits', 'guaranteed profits'],
      approvedValue: 'Regulated transaction infrastructure',
      sourceRef: 'Test Regulatory Policy §3.2',
      status: 'Approved',
      classification: 'prohibited_claim',
      severity: 'critical',
      explanation: 'Prohibited claim: Guarantees of risk-free financial profits violate policy.',
      updatedAt: '2026-10-20'
    },
    {
      id: 'NP-RULE-04',
      brandId: 'test-novapay',
      category: 'Performance & Claims',
      title: 'Uptime Claim Citation Requirement',
      ruleStatement: 'Claims of 99.999% uptime must cite the 2026 Infrastructure SLA report.',
      targetPatterns: ['99.999% uptime', 'five-nines uptime'],
      approvedValue: '99.999% uptime (cite 2026 Infrastructure SLA)',
      sourceRef: 'Test Engineering SLA §4.1',
      status: 'Approved',
      classification: 'unsupported_claim',
      severity: 'warning',
      explanation: 'High-availability claims require verification against published SLA benchmarks.',
      updatedAt: '2026-10-21'
    }
  ],
  approvedColors: [
    { name: 'Navy Slate', hex: '#0F172A', usage: 'primary' },
    { name: 'Cyan Sky', hex: '#0284C7', usage: 'accent' }
  ],
  approvedLogoRef: {
    name: 'Official NovaPay Horizontal Lockup',
    description: 'Horizontal wordmark with blue icon',
    approvedVariants: ['Official horizontal wordmark with blue icon'],
    unapprovedVariants: ['Circular red coin', 'Altered serif font'],
    sourceRef: 'Test Visual Guide §1.2'
  },
  visualGuidelines: [
    {
      id: 'VIS-01',
      category: 'Logo & Lockup',
      title: 'Official Horizontal Lockup',
      requirement: 'Always use approved horizontal lockup.',
      sourceRef: 'Test Visual Guide §1.2'
    }
  ],
  sampleScenarios: []
};
