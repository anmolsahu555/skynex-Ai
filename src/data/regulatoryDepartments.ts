import type {
  GovernmentDepartment,
  GovernmentDepartmentId,
  RegulatoryUpdate,
  BrandRule
} from '../types.ts';

export const INITIAL_REGULATORY_DEPARTMENTS: GovernmentDepartment[] = [
  {
    id: 'ccpa',
    code: 'CCPA',
    name: 'CCPA',
    fullName: 'Central Consumer Protection Authority',
    nodalMinistry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    shortDescription: 'Regulates consumer rights, false endorsements, and deceptive advertising across commercial marketing.',
    focusAreas: [
      'Consumer protection',
      'Misleading advertisements',
      'False claims & endorsements',
      'Dark patterns prevention',
      'Substantiation mandates'
    ],
    officialWebsite: 'https://consumeraffairs.nic.in/',
    actName: 'Consumer Protection Act, 2019 & Guidelines for Prevention of Misleading Advertisements, 2022',
    statutoryRole: 'Empowered to issue discontinuance orders, impose penalties up to ₹50 Lakhs on advertisers/endorsers, and mandate public corrective notices.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'blue',
    iconName: 'ShieldAlert',
    rules: [
      {
        id: 'CCPA-RULE-01',
        brandId: 'novapay',
        category: 'Prohibited Claim',
        regulatoryDepartment: 'ccpa',
        isGovernmentMandated: true,
        title: 'Prohibition of Misleading Advertisements & False Performance Claims',
        ruleStatement: 'Advertisements must not contain misleading representations regarding the nature, substance, quantity, or quality of products or services.',
        targetPatterns: [
          'guaranteed risk-free',
          '100% risk free',
          'guaranteed returns',
          'unconditional promise',
          'zero risk profits',
          'false performance claim'
        ],
        approvedValue: 'Regulated, transparent service claims substantiated by verifiable performance data',
        sourceRef: 'CCPA Guidelines for Prevention of Misleading Advertisements (2022) §4',
        sourceDocumentName: 'CCPA Guidelines for Prevention of Misleading Advertisements 2022',
        sourceSection: 'Section 4(1)',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Mandatory standard under Section 4 of CCPA 2022 Guidelines: Exaggerated or unverified guarantees trigger statutory violations.',
        updatedAt: '2026-10-20'
      },
      {
        id: 'CCPA-RULE-02',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'ccpa',
        isGovernmentMandated: true,
        title: 'Mandatory Endorser Due Diligence & Material Connection Disclosure',
        ruleStatement: 'Any testimonial, celebrity, or influencer endorsement must reflect genuine opinion with explicit disclosure of material commercial connections.',
        targetPatterns: [
          'paid endorsement without tag',
          'undisclosed sponsor',
          'unverified celebrity claim',
          'hidden commercial partnership'
        ],
        approvedValue: 'Prominent disclosure of endorsement relationship (e.g., #Ad, #Sponsored) with documented due diligence',
        sourceRef: 'CCPA Endorsement Guidelines 2022 §7',
        sourceDocumentName: 'CCPA Guidelines for Prevention of Misleading Advertisements 2022',
        sourceSection: 'Section 7(3)',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Mandated by CCPA: Endorsers and brands must execute due diligence to verify product claims prior to publishing.',
        updatedAt: '2026-10-22'
      },
      {
        id: 'CCPA-RULE-03',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'ccpa',
        isGovernmentMandated: true,
        title: 'Strict Prohibition of Dark Patterns in Digital Advertising',
        ruleStatement: 'Digital interfaces must not employ false urgency, basket sneaking, confirm shaming, or disguised advertisements.',
        targetPatterns: [
          'only 2 items left at this price',
          'your cart will be deleted in 60s',
          'no thanks, I hate saving money',
          'automatic subscription addition'
        ],
        approvedValue: 'Transparent checkout workflows with voluntary opt-in and authentic inventory counters',
        sourceRef: 'CCPA Guidelines for Prevention and Regulation of Dark Patterns (2023) §3',
        sourceDocumentName: 'CCPA Dark Patterns Prevention Guidelines 2023',
        sourceSection: 'Annexure 1',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces the CCPA Dark Patterns Prevention Framework 2023 against manipulative digital creative techniques.',
        updatedAt: '2026-10-24'
      }
    ],
    updates: [
      {
        id: 'CCPA-UPD-2024-02',
        departmentId: 'ccpa',
        departmentName: 'CCPA',
        circularNumber: 'CCPA/ADV/2024/02',
        title: 'Advisory on Greenwashing and Deceptive Environmental Claims in Commercial Advertising',
        summary: 'Mandates that all environmental and sustainability claims (e.g. "Eco-friendly", "Carbon-neutral", "Green") must be backed by accredited third-party lifecycle assessments.',
        issuedDate: '2026-09-18',
        effectiveDate: '2026-10-01',
        impactLevel: 'High',
        relevantIndustries: ['Fintech & Payment Processing', 'Consumer Goods', 'E-Commerce', 'Manufacturing'],
        recommendedAction: 'Audit existing marketing collateral for uncertified carbon or environmental assertions.',
        officialWebsite: 'https://consumeraffairs.nic.in/',
        isRead: false
      },
      {
        id: 'CCPA-UPD-2024-01',
        departmentId: 'ccpa',
        departmentName: 'CCPA',
        circularNumber: 'CCPA/NOTIF/2024/08',
        title: 'Enforcement Order: Comprehensive Ban on Dark Patterns in Ad Funnels',
        summary: 'Directs all online platforms to eliminate coerced countdown timers and false scarcity badges from digital banners.',
        issuedDate: '2026-08-12',
        effectiveDate: '2026-08-20',
        impactLevel: 'Critical',
        relevantIndustries: ['Digital Media', 'E-Commerce', 'Fintech & Payment Processing'],
        recommendedAction: 'Review creative assets for timer graphics and forced urgency triggers.',
        officialWebsite: 'https://consumeraffairs.nic.in/',
        isRead: true
      }
    ]
  },
  {
    id: 'fssai',
    code: 'FSSAI',
    name: 'FSSAI',
    fullName: 'Food Safety and Standards Authority of India',
    nodalMinistry: 'Ministry of Health and Family Welfare',
    shortDescription: 'Regulates food advertising, nutrition declarations, health claims, and statutory packaging labelling.',
    focusAreas: [
      'Food advertising',
      'Nutrition claims',
      'Health claims & disease treatment claims',
      'Food labelling & FSSAI logo',
      'Organic & natural food claims'
    ],
    officialWebsite: 'https://www.fssai.gov.in/',
    actName: 'Food Safety and Standards Act, 2006 & Advertising and Claims Regulations, 2018',
    statutoryRole: 'Regulates food business operators (FBOs) with powers to cancel product approvals and impose fines up to ₹10 Lakhs for deceptive nutritional claims.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'emerald',
    iconName: 'Apple',
    rules: [
      {
        id: 'FSSAI-RULE-01',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'fssai',
        isGovernmentMandated: true,
        title: 'Verifiable Substantiation for Nutritional and Organic Claims',
        ruleStatement: 'Claims like "100% Organic", "Natural", or "Zero Sugar" require valid FSSAI certification and Jaivik Bharat verification.',
        targetPatterns: [
          '100% natural without certificate',
          'miracle organic nourishment',
          'unsubstantiated protein booster'
        ],
        approvedValue: 'FSSAI accredited lab analysis with Jaivik Bharat accreditation number',
        sourceRef: 'FSSAI (Advertising and Claims) Regulations 2018 §4',
        sourceDocumentName: 'FSSAI Advertising and Claims Regulations 2018',
        sourceSection: 'Regulation 4(2)',
        status: 'Approved',
        classification: 'approved_fact_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces statutory claim verification criteria under FSSAI Advertising Regulations.',
        updatedAt: '2026-10-18'
      },
      {
        id: 'FSSAI-RULE-02',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'fssai',
        isGovernmentMandated: true,
        title: 'Prohibition of Medical Healing and Disease Prevention Claims',
        ruleStatement: 'Food and beverage advertisements must not claim to cure, prevent, or treat any medical disease or physiological condition.',
        targetPatterns: [
          'cures diabetes',
          'guaranteed immunity boost against viruses',
          'prevents heart attack',
          'clinically reverses ageing'
        ],
        approvedValue: 'General health and wellness claims strictly compliant with Schedule II nutrient function statements',
        sourceRef: 'FSSAI (Advertising and Claims) Regulations 2018 §7',
        sourceDocumentName: 'FSSAI Advertising and Claims Regulations 2018',
        sourceSection: 'Regulation 7(1)',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Statutory prohibition under FSSAI Section 7: Food products cannot be represented as medicines or therapeutic treatments.',
        updatedAt: '2026-10-21'
      },
      {
        id: 'FSSAI-RULE-03',
        brandId: 'novapay',
        category: 'Visual Identity',
        regulatoryDepartment: 'fssai',
        isGovernmentMandated: true,
        title: 'Mandatory FSSAI License Number and Logo Placement on Promotional Creative',
        ruleStatement: 'All retail packaged goods promotional assets must feature the 14-digit FSSAI license number in legible font.',
        targetPatterns: [
          'missing FSSAI license number',
          'distorted FSSAI logo',
          'unlicensed food promotional banner'
        ],
        approvedValue: 'Official FSSAI logo lockup with legible 14-digit FSSAI License No. displayed',
        sourceRef: 'FSSAI (Labelling and Display) Regulations 2020 §5',
        sourceDocumentName: 'FSSAI Labelling and Display Regulations 2020',
        sourceSection: 'Regulation 5(3)',
        status: 'Draft',
        classification: 'unsupported_claim',
        severity: 'warning',
        severityLevel: 'High',
        explanation: 'Draft compliance check verifying that packaged promotional creative displays licensed authorization.',
        updatedAt: '2026-10-26'
      }
    ],
    updates: [
      {
        id: 'FSSAI-UPD-2024-04',
        departmentId: 'fssai',
        departmentName: 'FSSAI',
        circularNumber: 'FSSAI/ENF/2024/04',
        title: 'Directive on Misleading Use of "Health Drink" and "Energy Drink" Nomenclature',
        summary: 'Directs e-commerce and retail brands to de-link malt-based, cereal-based, or dairy beverages from "Health Drink" category descriptions as the term is not defined under FSS Act.',
        issuedDate: '2026-09-14',
        effectiveDate: '2026-10-01',
        impactLevel: 'High',
        relevantIndustries: ['Food & Beverages', 'Retail Merchandise', 'E-Commerce'],
        recommendedAction: 'Rename any marketing banners describing malt products as "Energy/Health Drinks".',
        officialWebsite: 'https://www.fssai.gov.in/',
        isRead: false
      }
    ]
  },
  {
    id: 'dca',
    code: 'DCA',
    name: 'Department of Consumer Affairs',
    fullName: 'Department of Consumer Affairs (Legal Metrology Division)',
    nodalMinistry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    shortDescription: 'Enforces Legal Metrology regulations, product packaging declarations, MRP accuracy, and net quantity compliance.',
    focusAreas: [
      'Legal Metrology compliance',
      'Maximum Retail Price (MRP) declaration',
      'Net quantity and unit sale price',
      'Mandatory manufacturer declarations',
      'Dual MRP prohibition'
    ],
    officialWebsite: 'https://consumeraffairs.nic.in/',
    actName: 'Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011',
    statutoryRole: 'Jurisdiction over all pre-packaged commodities and e-commerce disclosures with statutory seizure powers and mandatory penal compounding.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'amber',
    iconName: 'Scale',
    rules: [
      {
        id: 'DCA-RULE-01',
        brandId: 'novapay',
        category: 'Pricing & Facts',
        regulatoryDepartment: 'dca',
        isGovernmentMandated: true,
        title: 'Mandatory Declaration of Maximum Retail Price (MRP) All-Inclusive of Taxes',
        ruleStatement: 'All retail advertisement posters, e-commerce listings, and brochures must state the official verified MRP inclusive of all taxes.',
        targetPatterns: [
          'mrp exclusive of taxes',
          'plus extra taxes on mrp',
          'unsubstantiated strikethrough mrp',
          'mrp higher than catalog price'
        ],
        approvedValue: 'Official verified Maximum Retail Price (MRP) with "Inclusive of all taxes" disclaimer',
        sourceRef: 'Legal Metrology (Packaged Commodities) Rules 2011 Rule 6(1)(e)',
        sourceDocumentName: 'Legal Metrology (Packaged Commodities) Rules 2011',
        sourceSection: 'Rule 6(1)(e)',
        status: 'Approved',
        classification: 'approved_fact_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces Rule 6 of Legal Metrology Packaged Commodities Rules: MRP must be all-inclusive and match official catalog registration.',
        updatedAt: '2026-10-15'
      },
      {
        id: 'DCA-RULE-02',
        brandId: 'novapay',
        category: 'Pricing & Facts',
        regulatoryDepartment: 'dca',
        isGovernmentMandated: true,
        title: 'Strict Prohibition of Dual Pricing and Arbitrary MRP Inflation',
        ruleStatement: 'No seller or manufacturer shall declare different Maximum Retail Prices for identical pre-packaged goods across different channels.',
        targetPatterns: [
          'dual mrp',
          'different mrp for airport or premium channel',
          'artificially inflated strikethrough price'
        ],
        approvedValue: 'Single standardized corporate catalog MRP across all retail and digital channels',
        sourceRef: 'Legal Metrology (Packaged Commodities) Amendment Rules 2017 Rule 18(2)',
        sourceDocumentName: 'Legal Metrology Amendment Rules 2017',
        sourceSection: 'Rule 18(2)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Statutory bar under Rule 18(2): Charging higher than verified MRP or inflating strikethroughs constitutes punishable offence.',
        updatedAt: '2026-10-17'
      },
      {
        id: 'DCA-RULE-03',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'dca',
        isGovernmentMandated: true,
        title: 'Mandatory Unit Sale Price (USP) Declaration for Packaged Products',
        ruleStatement: 'Promotional posters and digital listings for packaged goods containing more than 1 unit/kg/litre must clearly declare Unit Sale Price (per g/ml/unit).',
        targetPatterns: [
          'missing unit sale price',
          'pack of 3 without per unit cost'
        ],
        approvedValue: 'Explicit Unit Sale Price (e.g. ₹X per gram / per unit) clearly displayed alongside total price',
        sourceRef: 'Legal Metrology (Packaged Commodities) Rules 2011 Rule 6(11)',
        sourceDocumentName: 'Legal Metrology Rules 2011',
        sourceSection: 'Rule 6(11)',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'warning',
        severityLevel: 'High',
        explanation: 'Enforces mandatory Unit Sale Price disclosure across all commercial promotional graphics.',
        updatedAt: '2026-10-23'
      }
    ],
    updates: [
      {
        id: 'DCA-UPD-2024-03',
        departmentId: 'dca',
        departmentName: 'Department of Consumer Affairs',
        circularNumber: 'DCA/LM/2024/03',
        title: 'Enforcement Circular: Strict Action on Dual MRP and Fake Discount Baselines',
        summary: 'Notifies state metrology controllers to scrutinize e-commerce discounts where the original MRP was temporarily inflated prior to sale campaigns.',
        issuedDate: '2026-09-22',
        effectiveDate: '2026-10-05',
        impactLevel: 'Critical',
        relevantIndustries: ['Retail', 'Consumer Electronics', 'E-Commerce', 'Fintech & Payment Processing'],
        recommendedAction: 'Verify that all strikethrough promotional prices match the official verified MRP in the catalog database.',
        officialWebsite: 'https://consumeraffairs.nic.in/',
        isRead: false
      }
    ]
  },
  {
    id: 'meity',
    code: 'MeitY',
    name: 'MeitY',
    fullName: 'Ministry of Electronics and Information Technology',
    nodalMinistry: 'Ministry of Electronics and Information Technology, Government of India',
    shortDescription: 'Regulates digital services, cybersecurity, data protection, AI synthetic media disclosures, and intermediary guidelines.',
    focusAreas: [
      'Digital services governance',
      'Data protection & privacy requirements',
      'DPDP Act 2023 compliance',
      'AI & synthetic media disclosures',
      'Grievance redressal mechanisms'
    ],
    officialWebsite: 'https://www.meity.gov.in/',
    actName: 'Information Technology Act, 2000 & Digital Personal Data Protection (DPDP) Act, 2023',
    statutoryRole: 'Apex digital technology regulatory body with authority over cross-border data transfers, electronic advertising standards, and digital intermediary rules.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'indigo',
    iconName: 'Cpu',
    rules: [
      {
        id: 'MEITY-RULE-01',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'meity',
        isGovernmentMandated: true,
        title: 'Explicit Consent and Purpose Limitation for Digital Lead Capture',
        ruleStatement: 'Promotional landing pages and digital ads capturing personal data must present explicit, freely given, specific consent notices.',
        targetPatterns: [
          'pre-checked marketing opt-in',
          'bundled unconditioned data sharing',
          'hidden third-party broker transfer'
        ],
        approvedValue: 'Itemized consent notice stating purpose, data principal rights, and grievance officer details',
        sourceRef: 'Digital Personal Data Protection Act (DPDP) 2023 Section 6',
        sourceDocumentName: 'Digital Personal Data Protection Act 2023',
        sourceSection: 'Section 6(1)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Statutory compliance under DPDP Act 2023: Pre-ticked checkboxes or forced consent invalidates promotional campaigns.',
        updatedAt: '2026-10-14'
      },
      {
        id: 'MEITY-RULE-02',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'meity',
        isGovernmentMandated: true,
        title: 'Mandatory Labelling of AI-Generated and Synthetically Altered Media',
        ruleStatement: 'Any promotional image, video, audio, or copy generated or substantially altered via generative AI must include clear synthetic media labelling.',
        targetPatterns: [
          'deepfake endorsement without label',
          'synthetic customer photo without AI badge',
          'undisclosed synthetic model'
        ],
        approvedValue: 'Prominent, permanent watermark or caption: "Generated with AI / Synthetically Created Creative"',
        sourceRef: 'MeitY IT Intermediary Advisory on Generative AI & Deepfakes (March 2024)',
        sourceDocumentName: 'MeitY Generative AI Advisory 2024',
        sourceSection: 'Clause 3(a)',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces the MeitY 2024 Generative AI Directive requiring prominent labelling for synthetic promotional assets.',
        updatedAt: '2026-10-19'
      },
      {
        id: 'MEITY-RULE-03',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'meity',
        isGovernmentMandated: true,
        title: 'Grievance Redressal Officer Disclosure on Commercial Digital Properties',
        ruleStatement: 'Commercial web applications and digital service portals must publish the name and contact details of the designated Resident Grievance Officer.',
        targetPatterns: [
          'missing grievance officer details',
          'no registered compliance contact'
        ],
        approvedValue: 'Published Grievance Officer contact details with 24-hour acknowledgement and 15-day resolution commitment',
        sourceRef: 'Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 Rule 3(2)',
        sourceDocumentName: 'IT Rules 2021',
        sourceSection: 'Rule 3(2)',
        status: 'Draft',
        classification: 'unsupported_claim',
        severity: 'warning',
        severityLevel: 'Medium',
        explanation: 'Draft rule verifying mandatory IT Rules 2021 Grievance Officer disclosures on digital marketing websites.',
        updatedAt: '2026-10-25'
      }
    ],
    updates: [
      {
        id: 'MEITY-UPD-2024-05',
        departmentId: 'meity',
        departmentName: 'MeitY',
        circularNumber: 'MEITY/DPDP/2024/05',
        title: 'Draft Rules Release under Digital Personal Data Protection Act 2023',
        summary: 'Releases public consultation draft on verifiable parental consent mechanisms and mandatory data breach notification thresholds.',
        issuedDate: '2026-09-10',
        effectiveDate: '2026-10-15',
        impactLevel: 'Critical',
        relevantIndustries: ['Fintech & Payment Processing', 'Digital Media', 'SaaS', 'E-Commerce'],
        recommendedAction: 'Audit consent banners across marketing touchpoints to align with Draft Rule 4 requirements.',
        officialWebsite: 'https://www.meity.gov.in/',
        isRead: false
      }
    ]
  },
  {
    id: 'cdsco',
    code: 'CDSCO',
    name: 'CDSCO',
    fullName: 'Central Drugs Standard Control Organisation',
    nodalMinistry: 'Directorate General of Health Services, Ministry of Health and Family Welfare',
    shortDescription: 'Regulates pharmaceutical marketing, drug claims, medical devices, and cosmetic formulation disclosures.',
    focusAreas: [
      'Pharmaceutical advertising',
      'Drug claims and medical treatments',
      'Cosmetics safety regulations',
      'Prescription-only advertising prohibition',
      'Magic remedies ban'
    ],
    officialWebsite: 'https://cdsco.gov.in/',
    actName: 'Drugs and Cosmetics Act, 1940 & Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954',
    statutoryRole: 'Statutory oversight over medical and therapeutic communications with authority to invoke criminal prosecution and product recall for unlawful claims.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'rose',
    iconName: 'Activity',
    rules: [
      {
        id: 'CDSCO-RULE-01',
        brandId: 'novapay',
        category: 'Prohibited Claim',
        regulatoryDepartment: 'cdsco',
        isGovernmentMandated: true,
        title: 'Strict Prohibition of Direct-to-Consumer Advertisements for Schedule H/X Drugs',
        ruleStatement: 'Direct-to-consumer advertising of prescription-only pharmaceutical drugs (Schedule H, H1, and X) is strictly prohibited across all media.',
        targetPatterns: [
          'prescription drug promotional ad',
          'schedule h medicine offer',
          'buy antibiotics without prescription'
        ],
        approvedValue: 'Informational scientific literature restricted strictly to registered medical practitioners',
        sourceRef: 'Drugs and Cosmetics Rules 1945 Rule 65 & DMR Act 1954',
        sourceDocumentName: 'Drugs and Cosmetics Rules 1945',
        sourceSection: 'Rule 65',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Statutory criminal prohibition: Commercial marketing of scheduled pharmaceuticals to the general public is illegal under Indian law.',
        updatedAt: '2026-10-16'
      },
      {
        id: 'CDSCO-RULE-02',
        brandId: 'novapay',
        category: 'Prohibited Claim',
        regulatoryDepartment: 'cdsco',
        isGovernmentMandated: true,
        title: 'Ban on Magic Remedies, Miracle Cures, and False Treatment Guarantees',
        ruleStatement: 'Advertisements must not claim treatment or cure for specified chronic conditions (Schedule to the DMR Act, including cancer, diabetes, paralysis).',
        targetPatterns: [
          'miracle cure',
          '100% natural diabetes cure',
          'guaranteed treatment for cancer',
          'herbal magic remedy'
        ],
        approvedValue: 'Substantiated supportive wellness claims certified by licensed pharmaceutical or AYUSH authorities',
        sourceRef: 'Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 Section 3',
        sourceDocumentName: 'Drugs and Magic Remedies Act 1954',
        sourceSection: 'Section 3',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Strict statutory liability under Section 3 of DMR Act: Violators face criminal prosecution and immediate advertisement cancellation.',
        updatedAt: '2026-10-18'
      },
      {
        id: 'CDSCO-RULE-03',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'cdsco',
        isGovernmentMandated: true,
        title: 'Cosmetic Claims Substantiation and Allergen Warning Disclosures',
        ruleStatement: 'Cosmetics advertisements claiming clinical efficacy (e.g. "wrinkle reduction", "skin lightening") must cite clinical trial evidence and state allergen warnings.',
        targetPatterns: [
          'permanent fairness guarantee',
          'reverses 20 years of aging instantly',
          'untested clinical miracle cosmetic'
        ],
        approvedValue: 'Dermatologist-tested claims with verifiable trial methodology and ingredient allergy warning',
        sourceRef: 'Cosmetics Rules 2020 Rule 34',
        sourceDocumentName: 'Cosmetics Rules 2020',
        sourceSection: 'Rule 34',
        status: 'Unverified',
        classification: 'unsupported_claim',
        severity: 'warning',
        severityLevel: 'High',
        explanation: 'Awaiting submission of dermatologist study results before marking cosmetic claim approved.',
        updatedAt: '2026-10-26'
      }
    ],
    updates: [
      {
        id: 'CDSCO-UPD-2024-06',
        departmentId: 'cdsco',
        departmentName: 'CDSCO',
        circularNumber: 'CDSCO/NOTIF/2024/14',
        title: 'Supreme Court Directive Compliance: Self-Declaration Mandate for Healthcare Advertisers',
        summary: 'Requires all advertisers and advertising agencies in medical, AYUSH, and healthcare domains to submit an annual self-declaration certificate before releasing creative.',
        issuedDate: '2026-08-28',
        effectiveDate: '2026-09-01',
        impactLevel: 'Critical',
        relevantIndustries: ['Healthcare', 'Cosmetics', 'Wellness', 'Pharmaceuticals'],
        recommendedAction: 'Obtain upload acknowledgment receipt from the official portal before releasing healthcare advertising.',
        officialWebsite: 'https://cdsco.gov.in/',
        isRead: true
      }
    ]
  },
  {
    id: 'sebi',
    code: 'SEBI',
    name: 'SEBI',
    fullName: 'Securities and Exchange Board of India',
    nodalMinistry: 'Ministry of Finance, Government of India',
    shortDescription: 'Regulates securities markets, financial services marketing, risk disclosures, and unregistered financial influencer partnerships.',
    focusAreas: [
      'Investment claims and return guarantees',
      'Financial services advertising code',
      'Mandatory standard risk disclosures',
      'Finfluencer regulatory framework',
      'Performance benchmark disclosures'
    ],
    officialWebsite: 'https://www.sebi.gov.in/',
    actName: 'Securities and Exchange Board of India Act, 1992 & SEBI (PFUTP) Regulations, 2003',
    statutoryRole: 'Statutory capital markets regulator with authority to issue impounding orders, trading bans, and monetary penalties up to ₹25 Crores.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'cyan',
    iconName: 'TrendingUp',
    rules: [
      {
        id: 'SEBI-RULE-01',
        brandId: 'novapay',
        category: 'Prohibited Claim',
        regulatoryDepartment: 'sebi',
        isGovernmentMandated: true,
        title: 'Strict Prohibition on Guaranteed Return and Risk-Free Profit Claims',
        ruleStatement: 'Promotional communications regarding investment, capital markets, or yield products must never state or imply guaranteed returns or risk-free profits.',
        targetPatterns: [
          'guaranteed returns',
          'risk-free profit',
          'guaranteed profit',
          'zero risk investment',
          'guaranteed 20% return',
          'assured income from trading'
        ],
        approvedValue: 'Transparent yield disclosures accompanied by historical performance disclaimers and risk notices',
        sourceRef: 'SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations 2003 Reg 4(2)(k)',
        sourceDocumentName: 'SEBI PFUTP Regulations 2003',
        sourceSection: 'Regulation 4(2)(k)',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Direct statutory violation under SEBI PFUTP Regulations: Promising guaranteed capital market returns is treated as fraudulent misrepresentation.',
        updatedAt: '2026-10-12'
      },
      {
        id: 'SEBI-RULE-02',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'sebi',
        isGovernmentMandated: true,
        title: 'Mandatory Standard Risk Disclosure in Visual and Audio Financial Creatives',
        ruleStatement: 'Every promotional communication for financial products must feature the mandatory standard disclaimer: "Investments in securities market are subject to market risks. Read all related documents carefully before investing."',
        targetPatterns: [
          'missing market risk disclaimer',
          'inaudible speed disclaimer',
          'disclaimer smaller than 10px font'
        ],
        approvedValue: 'Legible standard risk disclosure displayed for minimum 5 seconds with synchronized audio narration',
        sourceRef: 'SEBI Advertisement Code for Intermediaries (April 2023) Clause 4',
        sourceDocumentName: 'SEBI Advertisement Code 2023',
        sourceSection: 'Clause 4(a)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces SEBI Advertisement Code 2023: Disclaimers must be legible, unhurried, and prominently displayed.',
        updatedAt: '2026-10-19'
      },
      {
        id: 'SEBI-RULE-03',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'sebi',
        isGovernmentMandated: true,
        title: 'Ban on Associations with Unregistered Financial Influencers and Tipsters',
        ruleStatement: 'Regulated entities and fintech platforms must not engage or pay unregistered persons offering financial advice, stock recommendations, or performance promises.',
        targetPatterns: [
          'finfluencer stock tip partnership',
          'unregistered trader affiliate',
          'commission for trading signals'
        ],
        approvedValue: 'Partnerships restricted solely to SEBI-registered Investment Advisers (RIA) or Research Analysts (RA)',
        sourceRef: 'SEBI Board Decision on Regulating Financial Influencers (June 2024)',
        sourceDocumentName: 'SEBI Finfluencer Regulatory Circular 2024',
        sourceSection: 'Circular Ref SEBI/HO/MIRSD/2024/09',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'SEBI June 2024 Mandate: Strictly bars regulated entities from associating with unregistered financial social media creators.',
        updatedAt: '2026-10-24'
      }
    ],
    updates: [
      {
        id: 'SEBI-UPD-2024-07',
        departmentId: 'sebi',
        departmentName: 'SEBI',
        circularNumber: 'SEBI/HO/MIRSD/2024/09',
        title: 'Circular on Disassociation of Regulated Entities with Unregistered Finfluencers',
        summary: 'Directs all intermediaries to terminate promotional arrangements with financial influencers who dispense advice without valid SEBI registration within 90 days.',
        issuedDate: '2026-09-02',
        effectiveDate: '2026-09-30',
        impactLevel: 'Critical',
        relevantIndustries: ['Fintech & Payment Processing', 'Investment Tech', 'Banking & Finance'],
        recommendedAction: 'Audit affiliate marketing rosters and influencer contracts to confirm SEBI registration certificates.',
        officialWebsite: 'https://www.sebi.gov.in/',
        isRead: false
      }
    ]
  },
  {
    id: 'asci',
    code: 'ASCI',
    name: 'ASCI',
    fullName: 'Advertising Standards Council of India',
    nodalMinistry: 'Self-Regulatory Body Recognized under Consumer Protection Framework & Cable TV Rules',
    shortDescription: 'Monitors the national advertising code, honest marketing, comparative supremacy claims, and social media influencer standards.',
    focusAreas: [
      'Code for self-regulation in advertising',
      'Truthful and honest representations',
      'Non-offensive and safe depictions',
      'Influencer disclosure guidelines (#Ad)',
      'Substantiation for comparative supremacy ("No. 1")'
    ],
    officialWebsite: 'https://www.ascionline.in/',
    actName: 'ASCI Code for Self-Regulation in Advertising & Consumer Protection Recognition',
    statutoryRole: 'Recognized by the Supreme Court of India, CCPA, and Ministry of I&B under Rule 7(9) of the Cable Television Networks Rules as the benchmark advertising standard.',
    monitoringStatus: 'active',
    lastSyncedAt: new Date().toISOString(),
    badgeColor: 'purple',
    iconName: 'Award',
    rules: [
      {
        id: 'ASCI-RULE-01',
        brandId: 'novapay',
        category: 'Legal & Compliance',
        regulatoryDepartment: 'asci',
        isGovernmentMandated: true,
        title: 'Mandatory Prominent Influencer Material Connection Label (#Ad / #Sponsored)',
        ruleStatement: 'Social media promotional content posted by creators must prominently display a disclosure label within the first 3 lines of copy or on video frames.',
        targetPatterns: [
          'hidden hashtag in comment',
          'ambiguous collaboration tag',
          'missing #Ad label',
          'tiny unreadable disclosure'
        ],
        approvedValue: 'Prominent, unambiguous disclosure badge (e.g. #Ad, #Sponsored, #Collaboration) placed upfront',
        sourceRef: 'ASCI Guidelines for Influencer Advertising in Digital Media (2021) Clause 2',
        sourceDocumentName: 'ASCI Influencer Guidelines 2021',
        sourceSection: 'Clause 2(b)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        severityLevel: 'Critical',
        explanation: 'Enforces ASCI Digital Influencer Guidelines: Commercial collaborations must be self-evident to viewers without expanding captions.',
        updatedAt: '2026-10-15'
      },
      {
        id: 'ASCI-RULE-02',
        brandId: 'novapay',
        category: 'Performance & Claims',
        regulatoryDepartment: 'asci',
        isGovernmentMandated: true,
        title: 'Verifiable Substantiation for Comparative Supremacy Claims ("No. 1", "Fastest", "Best")',
        ruleStatement: 'Superlative claims such as "India\'s No. 1", "Best in Class", or "Fastest Growing" must cite recent independent accredited market research.',
        targetPatterns: [
          'india\'s no 1 without citation',
          'fastest payment app without audit',
          'best rated in the country',
          'undocumented market leader'
        ],
        approvedValue: 'Published independent source citation with audit year (e.g., "Source: CRISIL Report Q4 2025")',
        sourceRef: 'ASCI Code Chapter I: Truthful and Honest Representation §1.4',
        sourceDocumentName: 'ASCI Code for Self-Regulation in Advertising',
        sourceSection: 'Chapter 1.4',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'warning',
        severityLevel: 'High',
        explanation: 'Statutory ASCI Code standard: Unsubstantiated superlative claims mislead consumers and trigger expedited Consumer Complaints Council summons.',
        updatedAt: '2026-10-21'
      },
      {
        id: 'ASCI-RULE-03',
        brandId: 'novapay',
        category: 'Tone & Style',
        regulatoryDepartment: 'asci',
        isGovernmentMandated: true,
        title: 'Prohibition on Unsafe, Offensive, or Socially Irresponsible Depictions',
        ruleStatement: 'Advertisements must not encourage hazardous practices, mock protected characteristics, or promote anti-social conduct.',
        targetPatterns: [
          'dangerous driving stunts without disclaimer',
          'derogatory gender stereotypes',
          'exploitative child marketing'
        ],
        approvedValue: 'Responsible, socially positive depictions consistent with ASCI decency guidelines',
        sourceRef: 'ASCI Code Chapter II: Non-Offensive to Public Decency §2.1',
        sourceDocumentName: 'ASCI Code for Self-Regulation in Advertising',
        sourceSection: 'Chapter 2.1',
        status: 'Approved',
        classification: 'style_tone_suggestion',
        severity: 'warning',
        severityLevel: 'Medium',
        explanation: 'Ensures advertising copy and visuals avoid unsafe behavior depictions or public decency violations.',
        updatedAt: '2026-10-24'
      }
    ],
    updates: [
      {
        id: 'ASCI-UPD-2024-08',
        departmentId: 'asci',
        departmentName: 'ASCI',
        circularNumber: 'ASCI/REP/2024/08',
        title: 'Half-Yearly Complaints Report: Surge in Deceptive Influencer Marketing',
        summary: 'Reports a 38% increase in influencer compliance violations, predominantly in healthcare, personal care, and financial services.',
        issuedDate: '2026-09-15',
        effectiveDate: '2026-09-15',
        impactLevel: 'Medium',
        relevantIndustries: ['All Consumer Brands', 'Digital Marketing', 'Fintech & Payment Processing'],
        recommendedAction: 'Verify that all brand partner influencer posts include ASCI-compliant upfront disclosure tags.',
        officialWebsite: 'https://www.ascionline.in/',
        isRead: false
      }
    ]
  }
];

export function resolveGovernmentDepartmentLabel(
  deptId?: string,
  dept?: GovernmentDepartment,
  fallbackName?: string
): string {
  const id = (deptId || dept?.id || '').toLowerCase().trim();
  if (id === 'fssai') return 'FSSAI – Food Safety';
  if (id === 'ccpa') return 'Ministry of Consumer Affairs (CCPA)';
  if (id === 'dca' || id === 'legal_metrology') return 'Legal Metrology (Consumer Affairs)';
  if (id === 'meity') return 'Ministry of Electronics and IT (MeitY)';
  if (id === 'cdsco' || id === 'mohfw') return 'Ministry of Health (CDSCO)';
  if (id === 'moefcc' || id === 'environment') return 'Ministry of Environment';
  if (id === 'sebi') return 'SEBI – Financial & Securities';
  if (id === 'asci') return 'ASCI – Advertising Standards';
  if (fallbackName && fallbackName.trim()) return fallbackName.trim();
  if (dept?.fullName) return `${dept.code} – ${dept.fullName}`;
  return id ? id.toUpperCase() : 'Regulatory Authority';
}

export function resolveComplianceCategoryLabel(rule: BrandRule, deptId?: string): string {
  if (rule.complianceCategory && rule.complianceCategory.trim()) {
    return rule.complianceCategory.trim();
  }
  const text = `${rule.title} ${rule.ruleStatement} ${rule.explanation || ''} ${rule.sourceDocumentName || ''}`.toLowerCase();
  const id = (deptId || rule.regulatoryDepartment || '').toLowerCase();

  if (text.includes('greenwash') || text.includes('environment') || text.includes('eco-friendly') || text.includes('carbon') || id === 'moefcc') {
    return 'Environmental Claims';
  }
  if (id === 'fssai' || text.includes('fssai') || text.includes('food') || text.includes('nutrition') || text.includes('allergen') || text.includes('edible')) {
    return 'Food Safety';
  }
  if (text.includes('mrp') || text.includes('price') || text.includes('pricing') || text.includes('net quantity') || text.includes('metrology') || rule.category === 'Pricing & Facts') {
    return 'Pricing & Packaging';
  }
  if (id === 'meity' || text.includes('privacy') || text.includes('dpdp') || text.includes('personal data') || text.includes('consent') || text.includes('deepfake') || text.includes('intermediary')) {
    return 'Privacy & IT Governance';
  }
  if (id === 'cdsco' || text.includes('drug') || text.includes('medical') || text.includes('therapeutic') || text.includes('magic remedies') || text.includes('clinical')) {
    return 'Health & Pharmaceuticals';
  }
  if (id === 'sebi' || text.includes('sebi') || text.includes('mutual fund') || text.includes('securities') || text.includes('market risk') || text.includes('investment')) {
    return 'Financial Disclosures';
  }
  if (text.includes('endorse') || text.includes('influencer') || text.includes('celebrity') || text.includes('paid partnership')) {
    return 'Endorsements & Disclosures';
  }
  if (text.includes('dark pattern') || text.includes('urgency') || text.includes('basket sneaking')) {
    return 'Consumer Protection';
  }
  return 'Advertising';
}

export function normalizeAndEnrichGovernmentRule(
  rule: BrandRule,
  dept?: GovernmentDepartment
): BrandRule {
  const deptId = (rule.regulatoryDepartment || dept?.id || 'ccpa') as string;
  const matchedDept =
    dept ||
    INITIAL_REGULATORY_DEPARTMENTS.find(d => d.id.toLowerCase() === deptId.toLowerCase());

  const departmentName =
    rule.departmentName ||
    resolveGovernmentDepartmentLabel(deptId, matchedDept, rule.departmentName);

  const nodalMinistry =
    rule.nodalMinistry ||
    matchedDept?.nodalMinistry ||
    (deptId === 'moefcc'
      ? 'Ministry of Environment, Forest and Climate Change'
      : 'Government of India Regulatory Authority');

  const complianceCategory = resolveComplianceCategoryLabel(rule, deptId);

  const sourceUrl =
    rule.sourceUrl ||
    (rule.sourcePage && /^https?:\/\//i.test(rule.sourcePage) ? rule.sourcePage : undefined) ||
    matchedDept?.officialWebsite ||
    'https://www.india.gov.in/';

  const sourcePageTitle =
    rule.sourcePageTitle ||
    rule.sourceDocumentName ||
    matchedDept?.actName ||
    rule.sourceRef ||
    'Official Government Gazette / Regulatory Portal';

  const extractedAt = rule.extractedAt || rule.updatedAt || '2026-10-20';

  return {
    ...rule,
    regulatoryDepartment: deptId,
    isGovernmentMandated: true,
    departmentName,
    nodalMinistry,
    complianceCategory,
    sourceUrl,
    sourcePageTitle,
    sourceDocumentName: rule.sourceDocumentName || sourcePageTitle,
    sourceSection: rule.sourceSection || 'Statutory Mandate',
    extractedAt,
    updatedAt: rule.updatedAt || extractedAt
  };
}

// Enrich initial department rules in place so all fields are populated on startup
INITIAL_REGULATORY_DEPARTMENTS.forEach(dept => {
  dept.rules = dept.rules.map(r => normalizeAndEnrichGovernmentRule(r, dept));
});

export function computeRegulatoryOverview(
  departments: GovernmentDepartment[],
  brandRules: BrandRule[]
) {
  const totalSourcesCount = departments.length;
  const connectedSourcesCount = departments.filter(d => d.monitoringStatus === 'active').length;

  // Active compliance rules: count all approved rules in both departments and active brand rules that have regulatoryDepartment or isGovernmentMandated
  const deptRules = departments.flatMap(d => d.rules.map(r => normalizeAndEnrichGovernmentRule(r, d)));
  const govBrandRules = brandRules
    .filter(r => r.isGovernmentMandated || Boolean(r.regulatoryDepartment))
    .map(r => normalizeAndEnrichGovernmentRule(r));
  const allRelevantRules = [... govBrandRules, ...deptRules];
  
  // Deduplicate by ID (preferring brandRules entry if edited)
  const uniqueRulesMap = new Map<string, BrandRule>();
  allRelevantRules.forEach(r => {
    if (!uniqueRulesMap.has(r.id)) {
      uniqueRulesMap.set(r.id, r);
    }
  });

  const uniqueRules = Array.from(uniqueRulesMap.values());
  const activeComplianceRulesCount = uniqueRules.filter(r => r.status === 'Approved').length;
  const pendingApprovalsCount = uniqueRules.filter(r => r.status === 'Draft' || r.status === 'Unverified').length;

  const totalUpdates = departments.flatMap(d => d.updates);
  const newRegulatoryUpdatesCount = totalUpdates.filter(u => !u.isRead).length;

  return {
    connectedSourcesCount,
    totalSourcesCount,
    activeComplianceRulesCount,
    pendingApprovalsCount,
    newRegulatoryUpdatesCount,
    lastGlobalSyncAt: new Date().toISOString(),
    departments
  };
}

