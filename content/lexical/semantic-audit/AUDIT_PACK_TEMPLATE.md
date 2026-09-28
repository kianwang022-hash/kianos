# Lexical Independent Semantic Audit — oXXXX–oYYYY

- **Status:** PASS | PASS_WITH_CORRECTIONS | HOLD_FOR_SOL
- **Scope:** `oXXXX–oYYYY`
- **Production handoff:** `content/lexical/semantic-review/oXXXX-oYYYY.md`
- **Production semantic baseline SHA:** `<sha>`
- **Owner-read HEAD:** `<sha>`
- **Pre-write HEAD:** `<sha>`
- **Content contract blob SHA:** `<sha>`
- **Audit contract blob SHA:** `<sha>`
- **Router spec blob SHA / router version:** `<sha-or-N/A>` / `<version-or-N/A>`
- **Production handoff blob SHA:** `<sha>`
- **Calibration:** PASS | CALIBRATION_FAIL
- **Blind-first:** ENFORCED | BLIND_FIRST_NOT_ENFORCED
- **Audit mode:** STRICT

## Coverage

```text
scope owners: X/X
production UPGRADE reverse-reviewed: X/X
mandatory Form/identity cases reviewed: X/X
mandatory Relation/anchor/Core↔sense cases reviewed: X/X
complex NO_CHANGE reviewed: X/X
simple NO_CHANGE fast-gated: X/X
simple NO_CHANGE deep-sampled: X/Y
unique mandatory owners reviewed: X/X
```

## Rates

```text
complex NO_CHANGE false-pass: A/X = B%
simple sampled NO_CHANGE false-pass: C/Y = D%
UPGRADE flipped to NO_CHANGE: E/X = F%
UPGRADE refined: G/X = H%
LOCAL findings: L
MATERIAL findings: M
IDENTITY findings: N
identity risk: I/unique-mandatory-reviewed = J%
blocked: K
```

## Expansion triggers

- `<risk family>` — `<trigger>` → `<resulting coverage>`

## Risk-family summary

| Risk family | Reviewed / total | Findings | Severity mix |
|---|---:|---:|---|
| | | | |

## Delta-only findings

For each non-PASS owner record:

```text
ordinal:
word:
production operation:
audit verdict:
risk_family:
severity: LOCAL | MATERIAL | IDENTITY
observed Current issue:
exact desired semantic state:
identity / owner boundary:
```

## Final summary

- Canonical drift in relevant read/write sets: none | `<details>`
- Unresolved `IDENTITY_RISK`: `<count + ordinals>`
- `BLOCKED`: `<count + ordinals>`
- Final result: PASS | PASS_WITH_CORRECTIONS | HOLD_FOR_SOL
- Scale-up evidence eligible: YES | NO
