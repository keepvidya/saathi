# DEV — <NN-slice-name>

> Technical design. Written before code. Must satisfy ENGINEERING-PROTOCOL §1 (SOLID, hexagonal, Wrapper Rule, DSA).

## 1. Approach (think-first)
2–5 sentences: how we'll build it and why this way.

## 2. Ports touched
- Inbound: `…Port` (driven by which UI/agent)
- Outbound: `…Port` (implemented by which adapter)

## 3. Domain model
Entities / value objects / services added or changed. Keep it pure (no vendor/DOM/Electron).

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why / budget |
|---|---|---|---|---|
| … | … | O(…) | O(…) | … |

## 5. Design patterns used
Adapter / Strategy / Factory / Command / Observer / State / Facade / Repository — name each + reason.

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by (adapter) | Port it implements | Vendor types leak? (must be "no") |
|---|---|---|---|
| … | `adapters/…` | `…Port` | no |

## 7. Flow / sequence
UI → inbound port → use-case → domain → outbound port → adapter → world. (diagram or steps)

## 8. Error handling
`Result<T,E>` usage, validation points (preload + main for IPC), failure surfacing (never silent).

## 9. Risks & mitigations
- …

## 10. ADRs
Links to any decision records this slice introduces.
