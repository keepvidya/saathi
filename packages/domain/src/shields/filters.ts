/**
 * Saathi Shields — a curated starter filter list (network rules only).
 * Bundled (offline, deterministic). The host engine
 * (`@ghostery/adblocker-electron`) parses this; the same string is verified in a
 * unit test against the core engine. A later enhancement swaps in full,
 * auto-updating lists (EasyList / EasyPrivacy) behind the same wrapper.
 */
export const STARTER_FILTERS = [
  '! Saathi Shields — starter ad/tracker rules',
  '||doubleclick.net^',
  '||googlesyndication.com^',
  '||google-analytics.com^',
  '||googletagmanager.com^',
  '||adservice.google.com^',
  '||pagead2.googlesyndication.com^',
  '||connect.facebook.net^',
  '||facebook.net^',
  '||scorecardresearch.com^',
  '||amazon-adsystem.com^',
  '||adnxs.com^',
  '||criteo.com^',
  '||criteo.net^',
  '||taboola.com^',
  '||outbrain.com^',
  '||quantserve.com^',
  '||moatads.com^',
  '||pubmatic.com^',
  '||rubiconproject.com^',
  '||casalemedia.com^',
  '||hotjar.com^',
  '||mixpanel.com^',
  '||segment.io^',
  '||segment.com^',
  '||fullstory.com^',
  '||bat.bing.com^',
  '||ads.youtube.com^',
  '||analytics.tiktok.com^',
].join('\n')
