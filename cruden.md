# RI Cruden — Opportunity Brief

**Date:** 3 April 2026
**Status:** Pricing sent; Teams call to be scheduled; awaiting yes/no

---

## Background (for anyone unfamiliar)

RI Cruden Ltd is a mechanical, electrical and renewables contractor based in Inverness. They install and maintain heating systems, solar panels and electrical equipment. They have roughly 30 field engineers who drive vans to job sites, plus 10–20 office staff. Philip visited their office on 3 April and demonstrated a product. Rory Cruden (director) followed up the same afternoon by phone and email asking for budget costings on two things: vehicle checks and an H&S incident reporting system.

### What is simPRO?

simPRO is the software Cruden run their business on. It handles quotes, job scheduling, dispatching engineers, invoicing and asset management. Think of it as the operating system for a trades company -- expensive, complex, requires training. It has a Digital Forms feature that engineers are supposed to use on their phones. The problem is engineers have to log in, navigate the system, find the form and fill it in. Nobody does. Managers chase by phone. This is the problem Philip is solving.

---

## The Product

A WhatsApp-based field compliance bot. Engineers send a WhatsApp message ("van check" or "incident report") and a bot walks them through the questions conversationally. Photos accepted throughout. When complete, a branded PDF is generated and emailed to the relevant manager automatically.

No login. No app to download. Engineers already use WhatsApp every day.

### Workflow 1 — Weekly Van Checks

Cruden have 30 vans. Each needs a weekly inspection (tyres, lights, fluids, mileage, bodywork). Currently done on **Microsoft Forms**, results collected into an Excel sheet. The store manager reviews weekly and actions any issues.

Checks are always scheduled **Friday morning**. The store manager also monitors compliance — engineers sometimes forget and have to be chased.

**What Rory wants:**
- All submissions aggregated onto one sheet (not individual PDFs per engineer) — this is the primary output requirement
- Automatic Monday follow-up to any engineer who hasn't submitted by Friday

The bot walks the engineer through it, accepts a photo of the odometer, flags issues. On Monday morning the store manager gets a summary sheet: who submitted, who didn't, any issues flagged.

**Trigger**
The Friday check is bot-initiated, not user-initiated. At 10:00am Friday the bot pings every registered engineer. Engineers do not need to remember to start it.

**First-time registration**
New engineers hit a one-time registration gate before their first check. They receive an onboarding video walk-through at that point.

**Mileage**
Preferred capture method: photo of the odometer. Not typed.

**Unscheduled mid-week report**
Engineers can also trigger a check at any time mid-week if something goes wrong — van breaks down, bodywork damage, etc. This is separate from the scheduled Friday check.

**Non-submission chase**
On Monday, any engineer who did not submit by end of Friday receives a personalised voice message via the Mistral voice API rather than a plain text reminder.

### Workflow 2 — H&S Incident Reporting

If an engineer has an accident, near miss or spots a hazard, they report it via WhatsApp. The bot asks the same questions as Cruden's existing form. Currently: individual PDFs completed on **simPRO Digital Forms**, then **manually added to a master tracker Excel sheet** kept on SharePoint for ISO auditing.

Engineers don't submit unless managers chase them — same compliance problem as van checks.

**What Rory wants:**
- Reports captured per incident
- Output must feed a master tracker — either automatically updating a sheet, or in a format that makes manual entry trivial
- Records stored in a way that satisfies ISO audit requirements
- RIDDOR incidents flagged separately

The ISO tracker requirement is significant — the output format must match what they already record, or the tool won't survive an audit. Get a copy of the Excel tracker before building the template.

**Channel**
H&S runs in the same private WhatsApp thread as van checks. It is not in a group. The bot sits in a one-to-one conversation with each engineer.

**Activation**
The H&S workflow triggers automatically if any inbound message or voice note contains language associated with incidents. The model detects semantic intent — not just exact phrases like "accident" or "near miss" but related language (e.g. "hurt", "injury", "hazard", "something happened"). The engineer does not need to know a trigger word.

**Fields**
All fields are mandatory: reporter name, time of incident (defaults to now if not specified), what happened, how it happened, photos.

**Output**
MVP: XSL output formatted to match the existing ISO Excel master tracker exactly — engineers or managers copy-paste rows in. Individual PDFs are not the primary output.
Stretch: generate a clean HTML version as an alternative format.

### Workflow 3 — TBD

To be identified at the Cruden meeting. Candidates: **toolbox talk** (Cruden run a weekly discussion covering what went well and what went badly — this is a strong fit for the same system), risk assessments (which would replace their current RAMS App subscription), timesheet submission, job arrival/departure logging.

---

## Why Philip is Well-Placed

The WhatsApp bot, PDF generation and notification infrastructure all exist already from work on Quickler (structural engineering reports). Adapting it for Cruden is substantially less work than building from scratch. The van check workflow is already built as a demo.

---

## What Cruden Currently Pay For

- **simPRO** -- main business system. Digital forms included but unused due to friction.
- **RAMS App** -- separate compliance tool for risk assessments and method statements. Active subscription, pricing undisclosed but estimated £40–70/user/month.

Philip is not replacing simPRO. He is solving the part simPRO fails at. Longer term, the two systems can be connected via simPRO's API -- reports submitted via WhatsApp appear automatically in simPRO. That is a separate future project worth ~£500.

---

## Market Pricing Context

| Tool | Model | Cruden equivalent |
|------|-------|------------------|
| SafetyCulture (industry standard H&S app) | £24/user/month | ~£1,200/month |
| Quartix / FleetGO (vehicle check apps) | £2/van/month | £60/month |
| RAMS App (their current compliance tool) | ~£40–70/user/month est. | unknown |
| BigChange (full field service platform) | £80–100/user/month | ~£4,000/month |

---

## Proposed Pricing

**Setup fee: £600**
Covers configuration, dedicated WhatsApp number setup, engineer onboarding, on-site setup visit, handover.

**Monthly subscription: £150/month**
Covers both van checks and H&S reporting. No VAT.

**Annual commitment option:** waive the setup fee entirely (£150/month × 12 = £1,800/year)

**Year 1 total (no commitment): £2,400**
**Year 1 total (12-month commitment): £1,800**

At 30 engineers across two workflows, that is £5/person/month. Still well below SafetyCulture (£19–24/user/month).

Note: Philip offered to come on site to set everything up — this is included in the setup fee.

### Expansion Strategy

The monthly price stays flat as workflows are added. Each new workflow makes the per-workflow cost cheaper, incentivising Cruden to expand use:

| Workflows | Monthly | Per workflow |
|-----------|---------|-------------|
| 2 (van check + H&S) | £150 | £75 each |
| 3 (+ third) | £150 | £50 each |

Once embedded in three workflows, the switching cost is behavioural rather than financial. The goal is to be inside three of their regular processes within two months of launch.

---

## Technical Plan (for Philip)

### Architecture

The existing `workflow.py` is ~2000 lines. Do not extend it. New structure:

```
src/lib/workflows/
    __init__.py      -- dispatcher: maps trigger phrases to workflow module
    van_check.py     -- production rebuild of existing demo
    hs_incident.py   -- new H&S workflow
    [third].py       -- TBD after Cruden meeting
```

Each workflow is a self-contained file. New workflows = new files only.

### Per-Customer Isolation

- One shared Twilio number across customers (simpler to operate at this scale)
- Per-firm SMTP credentials (use Cruden's own mail server -- looks like it comes from them)
- Per-firm config in DB: manager email, RIDDOR contact, SMTP settings

### Build Estimate

| Component | Hours |
|-----------|-------|
| Architecture refactor + per-firm config | 8h |
| Van check production rebuild (scheduled trigger, photo OCR, self-registration, unscheduled mid-week flow) | 14h |
| H&S incident workflow (semantic keyword activation) | 8h |
| H&S XSL output (matching ISO master tracker) | 4h |
| Mistral voice API integration (Monday non-submission chase) | 4h |
| Email notifications + weekly van digest | 4h |
| CSV/JSON export endpoint | 2h |
| Deployment + end-to-end testing | 6h |
| **Total** | **~50h** |

Manager dashboard (web UI to view/filter reports) is TBD -- adds ~10h if Rory wants it.

### simPRO API (Phase 2)

simPRO has a full REST/JSON-RPC API (OAuth 1.0) supporting job creation, asset management, service records and webhooks. Could auto-create simPRO records from WhatsApp submissions. Worth mentioning as a future capability in the proposal. Quote separately (~£500).

### Files to Create / Modify

| File | Action |
|------|--------|
| `src/lib/workflows/__init__.py` | New -- dispatcher |
| `src/lib/workflows/van_check.py` | New -- production rebuild (includes scheduled trigger, unscheduled mid-week flow) |
| `src/lib/workflows/hs_incident.py` | New -- H&S workflow (semantic activation) |
| `src/lib/report_types/hs_incident.py` | New -- field schema |
| `src/templates/hs_incident.xsl` | New -- XSL output matching ISO tracker |
| `src/lib/scheduler.py` | New -- Friday auto-ping and Monday chase |
| `src/lib/voice_chase.py` | New -- Mistral voice API for non-submission reminders |
| `src/app.py` | Export endpoint; dispatcher integration |
| `src/lib/database.py` | Per-firm config (remove Twilio per-firm field) |
| `src/lib/workflow.py` | Remove van check (moved to module) |

---

## Questions to Ask Rory (Teams Meeting)

**Known from email:**
- Van checks: Friday morning, store manager reviews, currently Microsoft Forms → Excel
- H&S: simPRO Digital Forms → manual Excel tracker → SharePoint, ISO audit requirement
- Monday follow-up reminder needed if van check not submitted

**Still to ask:**

**Operational:**
1. How many engineers total? (30 vans — is that one per engineer?)
2. Is there a list of van registrations somewhere (simPRO, spreadsheet)?
3. Who is the store manager for van checks? Who receives H&S reports? Is there a designated RIDDOR person?
4. Are engineers on personal WhatsApp or company phones?

**Van check output:**
5. The summary sheet — does it need to match the current Excel format exactly, or is a clean new format fine?
6. Who does the Monday non-submission chase go to — the engineer directly, their manager, or both?

**H&S specific:**
7. Can you share the master tracker Excel? (Need to match its columns exactly for ISO compliance)
8. Does Section 4 (investigation details) need to be digital now, or paper fine for now?
9. Who adds records to the tracker currently — the H&S manager, or whoever receives the form?

**Scope:**
10. What other weekly admin tasks do engineers do that feel repetitive? (Third workflow)
11. Are you using simPRO Digital Forms for anything else that could move to WhatsApp?

---

## Next Steps

1. Chase Teams call time with Rory
2. Get copy of the H&S master tracker Excel before the call (critical — must match ISO format)
3. Confirm scope and remaining questions on the call
4. Begin build once yes received — architecture refactor first (see Technical Plan above)
