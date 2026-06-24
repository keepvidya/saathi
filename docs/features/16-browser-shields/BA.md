# BA — 16-browser-shields (M9b · Shields)

## 1. Problem & context
The browser should protect you by default: **block ads and trackers**, so pages are lighter, faster, and more private. M9b adds **Shields** to the M9a browser — request-level ad/tracker blocking on the tabs' session, a live **blocked count**, and a per-window **toggle**. Blocking decisions come from a real engine (Ghostery/adblocker) over a bundled filter list; the **Shields state + tally** is *our code*.

## 2. Users & jobs-to-be-done
- Primary: anyone browsing in Saathi. Job: "When I browse, I want ads and trackers blocked automatically — and to see it working — without setup."

## 3. User stories
- **US-1**: As a user, ad/tracker requests are **blocked** as I browse, offline, by default.
- **US-2**: As a user, I see how many requests Shields **blocked**.
- **US-3**: As a user, I can **toggle** Shields off/on (e.g. if a site breaks).

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN Shields is on WHEN a page requests a known tracker THEN the request is blocked. *(→ TC-16.1.2, TC-16.3.1)*
- **AC-2** (US-2): GIVEN blocks occur THEN the **blocked count** increases and is shown in the toolbar. *(→ TC-16.1.1, TC-16.2.1, TC-16.3.1)*
- **AC-3** (US-3): GIVEN I toggle Shields off THEN blocking stops (no new blocks) and the toggle reflects the state. *(→ TC-16.1.1, TC-16.2.2, TC-16.3.1)*
- **AC-4** (architecture): the ad-block engine is wrapped behind an `AdBlock` host module (the only file importing `@ghostery/adblocker-electron`), in the **main process**. *(→ CI hygiene)*

## 5. Scope
- **In**: a pure **Shields tally** (`enabled` + `blocked`) + a bundled **starter filter list** (`@saathi/domain/shields`); an **AdBlock** wrapper (`desktop/main`, `@ghostery/adblocker-electron`) applied to the tabs' session, counting blocked requests; the browser snapshot extended with **shields state**; a `browser:toggleShields` command; a **Shields button + blocked-count badge** in the Browser toolbar.
- **Out** (later): full/auto-updating filter lists, cosmetic (element-hiding) filters, per-site allowlist, per-tab attribution, HTTPS-upgrade, fingerprint protection.

## 6. Success metrics / done-signal
Open a page that references a known tracker → it's blocked, the count rises; toggle Shields off → blocking stops; all offline, engine wrapped behind one module.

## 7. Open questions / decisions for owner
- M9b ships a **curated starter filter list** (offline, deterministic); swapping in full EasyList/EasyPrivacy with periodic updates is a later enhancement behind the same wrapper.
