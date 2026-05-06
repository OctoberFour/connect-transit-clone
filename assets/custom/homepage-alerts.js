/* Header Alert Bar
 * Renders currently active service alerts above the primary navigation and
 * rotates through them. Distinct from the site-wide notification bar (general
 * announcements). Reads alert data from window.CONNECT_ALERTS (alerts-data.js).
 *
 * Per-page filtering via the container's `data-filter-route` attribute:
 *   absent / ""       — show every active alert (homepage behavior).
 *   "<slug>"          — show only alerts whose `routeSlugs` include this slug.
 *   "auto"            — read the slug from `?route=` on the current URL.
 * If filtering yields zero alerts the bar removes itself silently.
 */
(function () {
  'use strict';

  var ROTATION_MS = 4000;
  var STORAGE_KEY = 'hpa-dismissed-v1';
  var ALERTS = (window.CONNECT_ALERTS || []);

  function getDismissed() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setDismissed(ids) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) { /* sessionStorage may be unavailable; ignore */ }
  }

  function activeAlerts(filterSlug) {
    var dismissed = getDismissed();
    return ALERTS.filter(function (a) {
      if (a.active === false) return false;
      if (dismissed.indexOf(a.id) !== -1) return false;
      if (filterSlug) {
        var slugs = a.routeSlugs || [];
        if (slugs.indexOf(filterSlug) === -1) return false;
      }
      return true;
    });
  }

  function resolveFilterSlug(container) {
    var attr = container.getAttribute('data-filter-route');
    if (!attr) return null;
    if (attr !== 'auto') return attr;
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('route') || null;
    } catch (e) {
      return null;
    }
  }

  function buildItem(alert) {
    var item = document.createElement('a');
    item.className = 'hpa-item';
    item.href = alert.href || '#';
    item.setAttribute('role', 'listitem');

    var routes = document.createElement('span');
    routes.className = 'hpa-routes';
    (alert.routes || []).forEach(function (r) {
      var pill = document.createElement('span');
      pill.className = 'hpa-route hpa-route-' + r.toLowerCase();
      pill.textContent = r;
      routes.appendChild(pill);
    });

    var text = document.createElement('span');
    text.className = 'hpa-text';
    var title = document.createElement('strong');
    title.className = 'hpa-title';
    title.textContent = alert.title;
    var body = document.createElement('span');
    body.className = 'hpa-body';
    body.textContent = alert.body;
    text.appendChild(title);
    text.appendChild(document.createTextNode(' — '));
    text.appendChild(body);

    if (alert.routes && alert.routes.length) item.appendChild(routes);
    item.appendChild(text);
    return item;
  }

  function mount(container, alerts) {
    container.innerHTML = '';

    var inner = document.createElement('div');
    inner.className = 'hpa-inner';

    var label = document.createElement('span');
    label.className = 'hpa-label';
    label.innerHTML = '<span class="fas fa-exclamation-triangle" aria-hidden="true"></span> Service Alerts';
    inner.appendChild(label);

    var stage = document.createElement('div');
    stage.className = 'hpa-stage';
    stage.setAttribute('role', 'list');
    stage.setAttribute('aria-live', 'polite');
    stage.setAttribute('aria-atomic', 'true');

    alerts.forEach(function (a, i) {
      var item = buildItem(a);
      if (i === 0) item.classList.add('is-active');
      stage.appendChild(item);
    });
    inner.appendChild(stage);

    if (alerts.length > 1) {
      var counter = document.createElement('span');
      counter.className = 'hpa-counter';
      counter.textContent = '1 / ' + alerts.length;
      inner.appendChild(counter);
    }

    var actions = document.createElement('span');
    actions.className = 'hpa-actions';

    var viewAll = document.createElement('a');
    viewAll.className = 'hpa-view-all';
    viewAll.href = '/rider-alerts/index.html';
    viewAll.textContent = 'View all';
    actions.appendChild(viewAll);

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'hpa-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss service alerts');
    dismiss.innerHTML = '&times;';
    actions.appendChild(dismiss);

    inner.appendChild(actions);
    container.appendChild(inner);

    return { stage: stage, counter: container.querySelector('.hpa-counter'), dismiss: dismiss };
  }

  function rotate(stage, counterEl, total) {
    var items = stage.querySelectorAll('.hpa-item');
    if (items.length < 2) return null;
    var idx = 0;
    return window.setInterval(function () {
      items[idx].classList.remove('is-active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('is-active');
      if (counterEl) counterEl.textContent = (idx + 1) + ' / ' + total;
    }, ROTATION_MS);
  }

  function init() {
    var container = document.getElementById('homepage-alert-bar');
    if (!container) return;
    var filterSlug = resolveFilterSlug(container);
    var alerts = activeAlerts(filterSlug);
    if (!alerts.length) {
      container.parentNode && container.parentNode.removeChild(container);
      return;
    }

    var refs = mount(container, alerts);
    var timer = rotate(refs.stage, refs.counter, alerts.length);

    // Pause rotation on hover/focus for accessibility.
    container.addEventListener('mouseenter', function () {
      if (timer) { clearInterval(timer); timer = null; }
    });
    container.addEventListener('mouseleave', function () {
      if (!timer) timer = rotate(refs.stage, refs.counter, alerts.length);
    });
    container.addEventListener('focusin', function () {
      if (timer) { clearInterval(timer); timer = null; }
    });
    container.addEventListener('focusout', function () {
      if (!timer) timer = rotate(refs.stage, refs.counter, alerts.length);
    });

    refs.dismiss.addEventListener('click', function () {
      var ids = alerts.map(function (a) { return a.id; });
      setDismissed(getDismissed().concat(ids));
      if (timer) clearInterval(timer);
      container.parentNode && container.parentNode.removeChild(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
