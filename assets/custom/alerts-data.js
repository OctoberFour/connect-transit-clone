/* Service-alert catalog used by the header alert bar.
 *
 * In production these would come from an alerts API (e.g. GTFS-RT Alerts or a
 * CMS feed). The shape kept simple so editors can author entries directly.
 *
 *   id          stable identifier (used for the per-session dismiss list).
 *   routes      array of human-readable route names, shown as pills.
 *   routeSlugs  array of slugs that must match the per-route page's `?route=`
 *               value for the alert to surface there. Slugs are produced by
 *               lowercasing + replacing non-alphanumerics with "-" (matches
 *               timetables-app.js#slugify), e.g. "Gold Route" → "gold-route".
 *   title       short headline.
 *   body        one-sentence summary.
 *   href        link target (defaults to the rider-alerts hub).
 *   active      omit or set true to surface; set false to hide without
 *               deleting the entry.
 */
window.CONNECT_ALERTS = [
  {
    id: 'lime-sapphire-college-detour',
    routes: ['Lime'],
    routeSlugs: ['lime-route'],
    title: 'West College Avenue Construction Detour',
    body: 'Lime route detours west of White Oak Rd. along W. College Ave.',
    href: '/rider-alerts/index.html',
    active: true
  },
  {
    id: 'gold-target-temp-stop',
    routes: ['Gold'],
    routeSlugs: ['gold-route'],
    title: 'Target Temporary Stop',
    body: 'Gold route uses a temporary stop in the NE corner of the Target lot during resurfacing.',
    href: '/rider-alerts/index.html',
    active: true
  },
  {
    id: 'downtown-summer-detour',
    routes: ['Blue', 'Green', 'Red', 'Olive'],
    routeSlugs: ['blue-route', 'green-route', 'red-route', 'olive-route'],
    title: 'Long-Term Summer Downtown Detour',
    body: 'Routes detour around the core of Downtown Bloomington for the summer season.',
    href: '/rider-alerts/index.html',
    active: true
  },
  {
    id: 'lavender-staging-change',
    routes: ['Lavender'],
    routeSlugs: ['lavender-route'],
    title: 'Lavender Staging Change',
    body: 'Lavender route now stages on the south side of the downtown transfer center.',
    href: '/rider-alerts/index.html',
    active: true
  }
];
