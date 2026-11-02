# SkyNex AI: Enterprise Brand Governance & Compliance Platform

An enterprise brand-governance system built on the **15-Layer SaaS Architecture Playbook** and **Codex 48 Specification**: content goes in, is verified against human-approved brand rules and pricing facts via a hybrid deterministic and Gemini review engine, issues are returned with evidence-linked citations, and human reviewers retain full editorial decision control. Includes the closed-loop **Brand Clarity Loop** to track recurring violations across campaigns and drive root-cause corrective actions.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and workflow decisions were confirmed in Phase 1:
> - **Multi-Brand Switcher**: Pre-configured with two distinct operational profiles (**NovaPay** for Fintech/SaaS and **AeroSip** for Consumer Tech & IoT) with instant toggle, pre-loaded test drafts, and custom rule management.
> - **Hybrid Review Engine**: Dual-stage verification combining instant deterministic rule parsing (exact prohibited terms, exact pricing mismatch, regex naming violations) with live server-side **Gemini 3.8 Flash** contextual inspection (subtle tone shifts, unverified claims, and targeted fix generation).
> - **Full Brand Clarity Loop**: Complete 6-stage lifecycle for recurring issue detection (Track Findings -> Detect Recurring Patterns -> Alert Manager -> Investigate Root Cause -> Take Corrective Action -> Track Follow-Up).

---

## 1. Overview & Core Concept

### What It Does
SkyNex AI enforces brand consistency, regulatory compliance, and factual accuracy across distributed marketing and content teams. Instead of generic AI writing assistants that hallucinate or rewrite entire documents unchecked, SkyNex AI compares inbound content against official, human-approved brand knowledge (pricing tables, prohibited phrases, approved naming, tone rules). It highlights discrepancies with verifiable evidence citations and offers targeted inline corrections that human reviewers can accept, edit, or reject.

### Target Personas
1. **Creators (Copywriters, Agency Marketers, Designers)**: Submit draft content, immediately view flagged compliance violations with citations, apply one-click approved fixes, and submit for final sign-off.
2. **Reviewers / Brand Managers**: Review flagged drafts, evaluate evidence, request revisions, and formally accept or reject suggestions without fear of unauthorized modifications.
3. **Brand Administrators**: Maintain single-source-of-truth guidelines, approved product facts, pricing tiers, and terminology dictionaries.

### Key Value Proposition
- **Zero Hallucinated Approvals**: Deterministic baseline guarantees that known prices, prohibited phrases, and naming conventions never slip through.
- **Human Authority**: AI suggestions never overwrite drafts automatically. Every modification requires explicit human approval.
- **Institutional Memory (Brand Clarity Loop)**: Detects repeated mistakes across teams and campaigns, turning recurring friction into guideline clarifications and team training rather than endless manual corrections.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Brand Context Selection**: Select between **NovaPay** (Fintech) or **AeroSip** (Consumer Tech) via the top contextual selector, immediately loading the respective approved guidelines, pricing matrix, and prohibited lexicons.
2. **Draft Submission & One-Click Test Cases**:
   - Creator enters content via a rich editor or clicks one of the pre-loaded benchmark test scenarios (e.g., *NovaPay Risk-Free Launch*, *NovaPay Price Discount Blunder*, *AeroSip Medical Claim Violation*, or *Clean Compliant Post*).
   - Creator selects Campaign (e.g., "Q4 Festive Launch", "Performance Ads") and Content Type ("Ad Copy", "Email Blast", "Landing Page", "Social Post").
3. **Hybrid Governance Audit**:
   - Deterministic check flags exact naming (`Nova Pay` -> `NovaPay`), price discrepancies (`₹499/mo` vs `₹999/mo`), and strictly prohibited terms (`guaranteed returns`, `risk-free`).
   - Server-side Gemini 3.8 Flash evaluates contextual claims and tone, outputting line-level evidence references.
4. **Interactive Decision & Diff Workspace**:
   - Split-pane review: Original Draft with highlighted violation spans on the left; Findings Inspector with Rule Citations and Gemini Fixes on the right.
   - For each finding, user can click **Accept Fix** (updates draft in place), **Edit Fix** (custom inline adjustment), or **Reject Finding** (with optional justification note).
5. **Brand Clarity Loop & Manager Alerts**:
   - Dedicated Analytics & Governance view showing violation clusters across campaigns.
   - Automated Manager Alerts (e.g. *Alert: 4 occurrences of unapproved pricing in "Festive Launch"*).
   - Root-Cause Investigation modal allowing managers to record causes (unclear guideline, outdated sheet, training gap) and log corrective actions.
6. **Brand Rulebook Manager**:
   - Tabular view and inline editor for Guidelines, Product Facts/Pricing, Preferred Terminology, Prohibited Lexicon, and Tone Directives.

### Visual Identity & Layout
- **Style Direction**: Clean, authoritative, enterprise SaaS aesthetic inspired by modern compliance and developer tooling (Stripe, Linear, Frontify). Strictly non-"vibe-coded": zero decorative pulsing dots, zero generic pill badges, zero code-comment headers (`// 01`), and zero fake innovation scores.
- **Color Palette**:
  - Background Canvas: Crisp light neutral (`#F8FAFC` slate-50) with white surface cards (`#FFFFFF`).
  - Structural Borders: Hairline dividers (`#E2E8F0` slate-200).
  - Primary Brand Accent: Deep indigo/navy (`#1E293B` to `#0F172A`) with high-intent cobalt interactive elements (`#2563EB`).
  - Semantic Status Colors:
    - Critical Conflict / Prohibited: Crimson (`#DC2626` text, `#FEF2F2` background).
    - Warning / Terminology: Amber (`#D97706` text, `#FFFBEB` background).
    - Compliant / Approved: Emerald (`#16A34A` text, `#F0FDF4` background).
    - Info / Evidence Citation: Slate/Blue (`#2563EB` text, `#EFF6FF` background).
- **Typography**: Display/Heading: *Plus Jakarta Sans* (bold, structural, modern). Body: *Public Sans* / *Inter* for dense scannability. Numbers and Prices: Strict monospace tabular numerals (`tabular-nums font-mono`).
- **Top Bar Contract**:
  - Zone 1: **SkyNex AI** wordmark + contextual Brand Switcher.
  - Zone 2: 4 single-line workspace navigation items: `Audit Studio` · `Brand Knowledge` · `Brand Clarity Loop` · `Activity History`.
  - Zone 3: Primary Action (`Run Compliance Check` / `New Submission`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Deterministic + Gemini AI Verification
- **Chosen Approach**: Two-tiered audit engine. First tier runs synchronous deterministic regex and fact-table lookups for guaranteed accuracy on numbers, product spellings, and prohibited legal words. Second tier sends the content and rules to Gemini 3.8 Flash via a server proxy (`/api/audit`) for nuanced tone analysis and smart rewrite suggestions.
- **Why**: Pure LLM evaluation is non-deterministic and can miss exact pricing errors or hallucinate rules; pure regex cannot evaluate tone, subtle promotional over-promises, or syntactic context. Combining both achieves 100% precision on hard facts plus deep semantic understanding.
- **Alternatives Considered**: Client-side only regex (too weak for brand tone); LLM-only (unreliable for strict pricing compliance).

### Decision 2: Server-Side Full-Stack Architecture with Express & TSX
- **Chosen Approach**: Express backend mounted with Vite middlewares in `server.ts`, with dedicated routes:
  - `POST /api/audit`: Hybrid deterministic + Gemini analysis.
  - `GET /api/brands`: Retrieve brand guidelines and rules.
  - `POST /api/clarity-loop/action`: Log root-cause investigations and manager resolutions.
  - `GET /api/health`: Real component-level health check.
- **Why**: Keeps the `GEMINI_API_KEY` completely confidential on the server; allows rigorous backend input validation using Zod; enables clean integration tests and reliable headless operation.

### Decision 3: Persistent Multi-Brand Knowledge Store
- **Chosen Approach**: Server-backed repository with comprehensive default presets for NovaPay and AeroSip, complete with rule IDs, severity levels, standard prices, prohibited terms, and evidence definitions, with client-side reactive state sync.
- **Why**: Allows instant testing of real-world scenarios right out of the box for hackathon evaluators without needing manual initial configuration.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SkyNex AI Web Application                       │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ Brand Switcher        │  │ Top Bar Contract (3 Zones)             │ │
│  │ [NovaPay / AeroSip]   │  │ Audit Studio | Knowledge | Loop | Log  │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│  ┌───────────▼──────────────────────────────────▼────────────────────┐ │
│  │ Workspace Views                                                   │ │
│  │                                                                   │ │
│  │  1. Audit Studio: Draft Editor, Benchmark Presets, Live Diff View │ │
│  │  2. Evidence Inspector: Findings Cards with Approved Citations    │ │
│  │  3. Human Decision Bar: Accept Change, Edit, Reject Suggestion    │ │
│  │  4. Brand Clarity Loop: Recurring Detection & Manager Actions     │ │
│  │  5. Brand Rulebook: Guideline & Pricing Fact Ledger               │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
│                                     │                                  │
│                        HTTP / JSON (REST API)                          │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│              Full-Stack Express Server (Node.js / tsx)                 │
│                                                                        │
│  ┌────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ /api/health            │  │ /api/audit (Hybrid Engine)            │ │
│  │ DB & Model status      │  │ Input Validation (Zod)                │ │
│  └────────────────────────┘  └───────────────────┬───────────────────┘ │
│                                                  │                     │
│               ┌──────────────────────────────────┴────────────────┐    │
│               │                                                   │    │
│      ┌────────▼──────────────┐                   ┌────────────────▼──┐ │
│      │ Deterministic Engine  │                   │ Gemini 3.8 Flash  │ │
│      │ - Exact Term Whitelist│                   │ - Tone Analysis   │ │
│      │ - Exact Price Matcher │                   │ - Subtle Claims   │ │
│      │ - Prohibited Regex    │                   │ - Targeted Fixes  │ │
│      └────────┬──────────────┘                   └────────────────┬──┘ │
│               │                                                   │    │
│               └──────────────────┬────────────────────────────────┘    │
│                                  ▼                                     │
│                  Structured Findings + Evidence Citations              │
│                                  │                                     │
│  ┌───────────────────────────────▼───────────────────────────────────┐ │
│  │ Persistent Store & In-Memory Database                             │ │
│  │ - Brand Profiles & Guideline Versions                             │ │
│  │ - Audit History & Human Review Decisions                          │ │
│  │ - Recurring Violation Indices & Manager Corrective Actions        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Data Schema
- **BrandProfile**:
  - `id`: string (`"novapay" | "aerosip"`)
  - `name`: string
  - `industry`: string
  - `guidelines`: Array<{ id: string; category: string; rule: string; rationale: string; severity: 'critical' | 'warning' | 'info' }>
  - `facts`: Array<{ id: string; key: string; approvedValue: string; context: string }>
  - `prohibitedTerms`: Array<{ term: string; explanation: string; replacement?: string }>
  - `requiredDisclaimers`: Array<{ trigger: string; requiredText: string }>
- **AuditFinding**:
  - `id`: string
  - `type`: `'terminology' | 'pricing' | 'claim' | 'tone' | 'disclaimer'`
  - `severity`: `'critical' | 'warning' | 'info'`
  - `originalSpan`: string
  - `startIndex`: number
  - `endIndex`: number
  - `explanation`: string
  - `ruleId`: string
  - `ruleCitation`: string
  - `suggestedReplacement`: string
  - `decision`: `'pending' | 'accepted' | 'edited' | 'rejected'`
  - `userComment`?: string
- **RecurringPattern**:
  - `id`: string
  - `brandId`: string
  - `ruleId`: string
  - `ruleName`: string
  - `count`: number
  - `affectedCampaigns`: string[]
  - `affectedDrafts`: string[]
  - `firstSeen`: string
  - `lastSeen`: string
  - `investigationState`: `'open' | 'investigating' | 'resolved'`
  - `rootCause`?: `'unclear_guideline' | 'outdated_reference' | 'training_gap' | 'tool_inaccessibility'`
  - `correctiveAction`?: string

---

## 5. Implementation Roadmap (Phases of Execution)

1. **Backend Foundation (`server.ts` & `/api/*`)**:
   - Express server with tsx and Vite middleware integration.
   - `/api/health` endpoint with component-level checks.
   - Deterministic rule engine verifying prices, prohibited words, and terminology.
   - Server-side Gemini 3.8 Flash SDK integration for contextual claim & tone review with strict JSON schemas.
   - Persistent store for brand knowledge, audit history, and clarity loop records.
2. **Frontend Design System & Brand Context**:
   - Clean, professional typography & color system in Tailwind CSS.
   - Top Bar Contract with Brand Switcher (NovaPay & AeroSip).
   - Workspace view navigation (Studio, Knowledge, Clarity Loop, History).
3. **Core Workflow: Ingestion & Hybrid Audit Studio**:
   - Draft editor with pre-loaded benchmark test scenarios.
   - Interactive live scan with loading states and instant findings display.
   - Split-pane diff view showing original draft with highlighted violation spans.
4. **Human Decision & Correction Flow**:
   - Inline interactive cards for Accept, Edit, and Reject decisions.
   - Live draft update upon accepting or editing suggestions.
   - Revision history log recording each human decision and rationale.
5. **Brand Clarity Loop & Governance Workspace**:
   - Aggregated pattern detector grouping recurring issues.
   - Manager alert panels with threshold alerts.
   - Root-cause investigation interface with corrective action execution.
6. **Brand Rulebook & Knowledge Management**:
   - Manage guidelines, facts, pricing tables, and terminology dictionaries.
7. **Verification & Quality Audit**:
   - Compilation verification (`compile_applet`), linting, and end-to-end user path testing across both brand profiles.
