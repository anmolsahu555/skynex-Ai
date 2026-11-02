# SkyNex AI — Product Requirements Document (PRD)

**Version:** 1.0  
**Stage:** Inkloom AI Hackathon, Round 2 — The Build  
**Product Status:** Production-Ready Brand Governance Workspace  
**Primary Audience:** Content creators, brand reviewers, marketing managers, brand administrators  
**Core Principle:** Approved brand knowledge is the single source of truth; AI assists, explains, and suggests, while humans retain absolute decision authority.

---

## 1. Executive Summary

SkyNex AI is an AI-assisted brand-governance workspace designed for organisations that produce high-volume marketing content across distributed employees, agencies, freelancers, and generative AI tools. It reviews inbound content against human-approved brand guidelines, pricing facts, prohibited claims, and terminology before publication. It explains each finding with evidence citations, suggests targeted corrections, records human decisions, and detects recurring issue patterns across drafts.

### The Core User Journey
$$\text{Approved Brand Knowledge} \longrightarrow \text{Submit / Upload Content} \longrightarrow \text{Text Extraction} \longrightarrow \text{Deterministic + Contextual Review} \longrightarrow \text{Evidence Findings} \longrightarrow \text{Human Decides} \longrightarrow \text{Persist Revision History} \longrightarrow \text{Manager Recurrence Alert}$$

---

## 2. Product Goals & Measurable Outcomes

1. **Immediate Utility for Judges**: The first screen is immediately functional. No empty dashboards or mandatory walkthroughs.
2. **Deterministic-First Accuracy**: Known terminology mismatches, price conflicts, and explicit prohibited phrases are caught by deterministic Python/TypeScript logic. Gemini is not permitted to override approved facts.
3. **Evidence-Linked Findings**: Every finding references a real, active approved rule or commercial fact.
4. **Unsupported Claims Categorization**: An unverified claim is labeled *unsupported / needs human verification*, never automatically declared false.
5. **Human Decision Control**: Suggestions are never applied automatically. Users can Accept, Edit, or Reject suggestions, keeping original drafts intact.
6. **Brand Clarity Loop (Recurrence Alerts)**: Groups confirmed matching findings across distinct drafts and triggers alerts at a threshold of $\ge 3$ occurrences across $\ge 2$ drafts within 7 days.
7. **Document Ingestion**: Supports direct text paste and upload of `.txt`, `.md`, `.pdf`, and `.docx` files with client/server validation up to 10 MB.
8. **Graceful Fault Tolerance**: If Gemini API is rate-limited, timed out, or unavailable, deterministic checks execute with 100% precision, marking contextual review as incomplete rather than failing silently.

---

## 3. Information Architecture & Navigation

The primary navigation consists of 5 dedicated workspaces:
1. **Review Content**: Primary entry point. Includes preset benchmark test scenarios (including the canonical AeroSip demo and NovaPay scenarios), document upload, draft editor, live check, visual text map, and human decision workspace.
2. **Brand Knowledge**: Inspect and manage approved guidelines, commercial rate cards, product facts, prohibited lexicons, and terminology whitelist. Includes interactive rule creation form.
3. **Review History**: Persistent records of all submitted drafts, revision timelines, before/after diffs, and audit trail of human actions.
4. **Manager Insights**: Active recurring pattern detection, manager alerts, root-cause investigation diagnosis, and corrective action tracking.
5. **Help & Privacy**: Technical architecture specifications, supported upload formats, disclosure on external AI processing, and one-click demo data reset.

---

## 4. Brand Review Logic & Dual-Engine Architecture

### 4.1 Deterministic Engine
- Exact product name verification (e.g. `Aero Sip` $\to$ `AeroSip`, `Nova Pay` $\to$ `NovaPay`).
- Price integrity verification against approved structured facts (e.g. `₹899` vs approved `₹999` for AeroSip; `₹499/mo` vs approved `₹999/mo` for NovaPay).
- Prohibited claim identification (e.g. `cures dehydration migraines`, `risk-free profits`, `guaranteed returns`).
- Required regulatory disclaimers for specific triggers.

### 4.2 Gemini Contextual Analysis
- Evaluates nuanced voice and tone against brand style guides.
- Identifies unverified claims lacking supporting documentation (e.g. *“keeps drinks cold for 48 hours”*).
- Generates targeted replacement suggestions that preserve the creator's voice without adding unapproved claims.

---

## 5. Finding Classifications & Severity
1. **Confirmed Rule Conflict**: Direct violation of an active brand rule.
2. **Approved-Fact Conflict**: Mismatch with structured price, SLA, or technical spec.
3. **Unsupported / Unverified Claim**: Claim not substantiated by brand facts; flagged for human verification.
4. **Style or Tone Suggestion**: Nuanced voice alignment recommendation.
5. **Needs Human Verification**: Ambiguous statement requiring subject-matter expert review.

**Severities:** `Critical` (regulatory/legal/price breach), `Warning` (tone/terminology), `Info` (style/suggestion).
