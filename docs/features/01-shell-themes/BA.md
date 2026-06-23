# BA — 01-shell-themes

## 1. Problem & context
Saathi must look unmistakably **Keepvidya**. The brand colour system is **LOCKED** (`Parent/keepvidya/keepvidya-theme.css` + `KEEPVIDYA-color-system.md`): two hues — **ink + copper** — with **copper as the one and only accent**. The shipped themes are **Light · Medium · Dark** (the Knovex set), all copper-accented. This slice wires those exact tokens, a picker, and persistence — and **forbids inventing colours**.

> Correction baked in: an earlier draft invented off-brand themes (Nebula/Ocean/Forest/gradients). Removed. Brand colours come only from the locked source.

## 2. Users & jobs-to-be-done
- Primary: every end user. Job: "When I open Saathi, I want light or dark (or a softer light) — and it should clearly feel like Keepvidya."

## 3. User stories
- **US-1**: As a user, I want **Light, Medium, and Dark** themes, so I can match my environment while staying on-brand.
- **US-2**: As a user, I want a quick light/dark toggle that remembers my preferred light skin (Light vs Medium).
- **US-3**: As a user, I want my theme to persist across restarts.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the theme gallery WHEN I pick Light, Medium, or Dark THEN its exact locked token set applies and the active theme is marked. *(→ TC-01.1.1, TC-01.2.1)*
- **AC-2** (brand lock): EVERY theme uses **copper** (`#C0703C` light / `#D98E5A` dark) as `--primary`; NO theme introduces a non-brand hue or a decorative background image. *(→ TC-01.1.2)*
- **AC-3** (US-2): GIVEN a dark theme WHEN I click the quick toggle THEN it returns to the **remembered** light skin (Light or Medium), default Light first time. *(→ TC-01.1.3)*
- **AC-4** (US-3): GIVEN I selected a theme WHEN the app relaunches THEN that theme is restored. *(→ TC-01.3.1)*
- **AC-5**: The gallery shows the 3 brand swatches grouped Light/Dark with the active one marked. *(→ TC-01.2.1)*

## 5. Scope
- **In**: Light/Medium/Dark on the locked copper tokens (full semantic set + status + shadows, vendored from the brand source); topbar theme gallery popover; quick toggle with per-base memory; persistence; visual parity.
- **Out**: any new/invented theme or accent; gradient "wallpapers"; the full Settings pane.

## 6. Success metrics / done-signal
The app renders in Light/Medium/Dark using the exact locked tokens; copper is the only accent; persists; visual review confirms it reads as Keepvidya.

## 7. Open questions
- None. If the locked system later adds themes, they come from the brand source — never invented here.
