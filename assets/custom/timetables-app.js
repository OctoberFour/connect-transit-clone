/* Connect Transit timetable — overview + route page logic.
   Renders into elements with [data-tt-*] hooks injected by the page templates.
   Class names are namespaced under `.tt` so styles never leak. */
(function () {
  'use strict';

  var routes = window.CONNECT_ROUTES || [];

  // --- Helpers --------------------------------------------------------------

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function isLightHex(hex) {
    var m = /^#?([a-f\d]{6})$/i.exec(hex || '');
    if (!m) return false;
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L > 0.7;
  }

  function dayLabel(key) {
    return { weekday: 'Weekdays', saturday: 'Saturday', sunday: 'Sunday' }[key] || key;
  }

  // Build an iframe URL for the GMV live tracker.
  //   routeId: string | null — when null, no route filter is applied
  //   embed:   boolean       — true => add showHeader=0 + disable_scroll_wheel=1
  // The "open in new tab" link should NOT use showHeader=0 (full GMV chrome
  // is what the user expects when leaving the site).
  function buildTrackerUrl(routeId, embed) {
    var qs = [];
    if (routeId) qs.push('route=' + encodeURIComponent(routeId));
    if (embed) {
      qs.push('showHeader=0');
      qs.push('disable_scroll_wheel=1');
    }
    return 'https://rideconnecttransit.com/map' + (qs.length ? '?' + qs.join('&') : '');
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v == null) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v === true) node.setAttribute(k, '');
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  // --- Overview page --------------------------------------------------------

  function renderOverview() {
    var grid = document.querySelector('[data-tt-grid]');
    if (!grid) return;
    var search = document.querySelector('[data-tt-search]');
    var counter = document.querySelector('[data-tt-count]');

    function paint(query) {
      grid.innerHTML = '';
      var q = (query || '').trim().toLowerCase();
      var filtered = routes.filter(function (r) {
        if (!q) return true;
        return (
          r.name.toLowerCase().indexOf(q) !== -1 ||
          r.number.toLowerCase().indexOf(q) !== -1 ||
          r.summary.toLowerCase().indexOf(q) !== -1 ||
          (r.id || '').indexOf(q) !== -1
        );
      });

      if (counter) {
        counter.textContent = filtered.length + (filtered.length === 1 ? ' route' : ' routes');
      }

      if (filtered.length === 0) {
        grid.appendChild(el('div', { class: 'tt-empty', text: 'No routes match that search.' }));
        return;
      }

      filtered.forEach(function (r) {
        var slug = slugify(r.name);
        var hasAlert = r.serviceAlert && r.serviceAlert.active;
        var card = el('a', {
          class: 'tt-card',
          href: 'route.html?route=' + encodeURIComponent(slug),
          style: '--tt-route-color:' + r.color,
          'aria-label': 'Route ' + r.number + ', ' + r.name + (hasAlert ? ', service alert in effect' : '')
        }, [
          el('div', { class: 'tt-card__stripe' }),
          el('div', { class: 'tt-card__body' }, [
            el('div', { class: 'tt-card__header' }, [
              el('div', {
                class: 'tt-badge',
                'data-light': isLightHex(r.color) ? 'true' : 'false',
                text: r.number
              }),
              el('div', { class: 'tt-card__title', text: r.name })
            ]),
            el('div', { class: 'tt-card__summary', text: r.summary }),
            el('div', { class: 'tt-card__footer' }, [
              hasAlert ? el('span', { class: 'tt-card__alert', text: 'Service alert' }) : el('span'),
              el('span', { class: 'tt-card__cta', text: 'View timetable →' })
            ])
          ])
        ]);
        grid.appendChild(card);
      });
    }

    paint('');
    if (search) {
      search.addEventListener('input', function (e) { paint(e.target.value); });
    }
  }

  // --- Route page -----------------------------------------------------------

  function renderRoute() {
    var page = document.querySelector('[data-tt-route-page]');
    if (!page) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('route');
    var route = routes.filter(function (r) { return slugify(r.name) === slug; })[0] || routes[0];
    if (!route) {
      page.innerHTML = '<p class="tt-empty">Route not found.</p>';
      return;
    }

    document.title = route.name + ' Timetable | Connect Transit';
    page.style.setProperty('--tt-route-color', route.color);

    // Header
    var header = page.querySelector('[data-tt-route-header]');
    if (header) {
      header.style.setProperty('--tt-route-color', route.color);
      header.innerHTML = '';
      header.appendChild(el('div', {
        class: 'tt-badge',
        'data-light': isLightHex(route.color) ? 'true' : 'false',
        text: route.number
      }));
      header.appendChild(el('div', { class: 'tt-route-header__text' }, [
        el('h2', { text: route.name }),
        el('p', { text: route.summary })
      ]));
      header.appendChild(el('div', { class: 'tt-route-header__meta' }, [
        el('div', { text: 'GMV Route ID' }),
        el('div', {}, [el('span', { class: 'tt-route-header__id', text: route.id })])
      ]));
    }

    // Crumb
    var crumb = page.querySelector('[data-tt-crumb]');
    if (crumb) crumb.textContent = route.name;

    // Service alert
    var alertBox = page.querySelector('[data-tt-alert]');
    if (alertBox) {
      if (route.serviceAlert && route.serviceAlert.active) {
        alertBox.hidden = false;
        alertBox.querySelector('[data-tt-alert-headline]').textContent = route.serviceAlert.headline;
        alertBox.querySelector('[data-tt-alert-body]').textContent = route.serviceAlert.body;
        var closeBtn = alertBox.querySelector('[data-tt-alert-close]');
        if (closeBtn) closeBtn.addEventListener('click', function () { alertBox.hidden = true; });
      } else {
        alertBox.hidden = true;
      }
    }

    // Map iframe — strip the GMV header chrome and disable scroll-wheel zoom
    // so the embed feels native to our page.
    var mapFrame = page.querySelector('[data-tt-map]');
    var mapLink = page.querySelector('[data-tt-maplink]');
    var embedUrl = buildTrackerUrl(route.id, true);
    var openUrl = 'https://rideconnecttransit.com/map?route=' + encodeURIComponent(route.id);
    if (mapFrame) {
      mapFrame.src = embedUrl;
      mapFrame.title = 'Live map of ' + route.name;
    }
    if (mapLink) mapLink.href = openUrl;

    // Filters + table
    setupTimetable(page, route);
  }

  function setupTimetable(page, route) {
    var dayBar = page.querySelector('[data-tt-day-toggle]');
    var dirBar = page.querySelector('[data-tt-direction-toggle]');
    var tableHost = page.querySelector('[data-tt-table]');
    if (!dayBar || !dirBar || !tableHost) return;

    var days = Object.keys(route.schedules);
    var initialDay = days[0];

    dayBar.innerHTML = '';
    ['weekday', 'saturday', 'sunday'].forEach(function (d) {
      var enabled = days.indexOf(d) !== -1;
      var id = 'tt-day-' + d;
      var input = el('input', {
        type: 'radio',
        name: 'tt-day',
        id: id,
        value: d,
        class: 'tt-toggle',
        checked: d === initialDay,
        disabled: !enabled
      });
      var label = el('label', { for: id, text: dayLabel(d) });
      dayBar.appendChild(input);
      dayBar.appendChild(label);
    });

    function buildDirectionToggle(day) {
      var directions = route.schedules[day] || [];
      dirBar.innerHTML = '';
      directions.forEach(function (dir, i) {
        var id = 'tt-dir-' + slugify(dir.name);
        var input = el('input', {
          type: 'radio',
          name: 'tt-direction',
          id: id,
          value: String(i),
          class: 'tt-toggle',
          checked: i === 0
        });
        var label = el('label', { for: id, text: dir.name });
        dirBar.appendChild(input);
        dirBar.appendChild(label);
        input.addEventListener('change', function () { renderTable(day, i); });
      });
    }

    function renderTable(day, dirIndex) {
      var directions = route.schedules[day] || [];
      var direction = directions[dirIndex] || directions[0];
      tableHost.innerHTML = '';
      if (!direction || !direction.trips || direction.trips.length === 0) {
        tableHost.appendChild(el('div', { class: 'tt-table-empty', text: 'No service on this day.' }));
        return;
      }
      var wrap = el('div', { class: 'tt-table-scroll' });
      var table = el('table', { class: 'tt-table', 'aria-describedby': 'tt-caption' });
      table.appendChild(el('caption', {
        id: 'tt-caption',
        text: route.name + ' · ' + direction.name + ' · ' + dayLabel(day) + ' · times shown are when buses depart each stop'
      }));
      var thead = el('thead');
      var headRow = el('tr');
      headRow.appendChild(el('th', { scope: 'col', text: 'Trip' }));
      direction.stops.forEach(function (s) { headRow.appendChild(el('th', { scope: 'col', text: s })); });
      thead.appendChild(headRow);
      table.appendChild(thead);
      var tbody = el('tbody');
      direction.trips.forEach(function (trip, i) {
        var row = el('tr');
        row.appendChild(el('th', { scope: 'row', text: '#' + (i + 1) }));
        trip.forEach(function (time) {
          var skip = !time || time === '—' || time === '-';
          row.appendChild(el('td', {
            class: skip ? 'is-skip' : '',
            'aria-label': skip ? 'Does not stop' : null,
            text: skip ? '—' : time
          }));
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      tableHost.appendChild(wrap);
    }

    function selectDay(day) {
      buildDirectionToggle(day);
      renderTable(day, 0);
    }

    dayBar.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'tt-day') selectDay(e.target.value);
    });

    selectDay(initialDay);
  }

  // --- Live Bus Tracker page ------------------------------------------------

  function renderTracker() {
    var page = document.querySelector('[data-tt-tracker-page]');
    if (!page) return;

    var iframe = page.querySelector('[data-tt-tracker-iframe]');
    var openLink = page.querySelector('[data-tt-tracker-open]');
    var chipBar = page.querySelector('[data-tt-tracker-chips]');
    var select = page.querySelector('[data-tt-tracker-select]');
    if (!iframe) return;

    // Initial state from URL (?route=<slug-or-id>) so links can deep-link.
    var params = new URLSearchParams(window.location.search);
    var initialParam = params.get('route');
    var initial = null;
    if (initialParam) {
      var match = routes.filter(function (r) {
        return r.id === initialParam || slugify(r.name) === initialParam;
      })[0];
      if (match) initial = match;
    }
    var current = initial; // null = "All routes"

    function applyState() {
      var routeId = current ? current.id : null;
      iframe.src = buildTrackerUrl(routeId, true);
      iframe.title = current ? 'Live map of ' + current.name : 'Live map of all Connect Transit routes';
      if (openLink) openLink.href = buildTrackerUrl(routeId, false);

      // Sync chip pressed-state.
      if (chipBar) {
        Array.prototype.forEach.call(chipBar.querySelectorAll('[data-route]'), function (btn) {
          var slug = btn.getAttribute('data-route');
          var on = (slug === '' && !current) || (current && slugify(current.name) === slug);
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
      if (select) {
        select.value = current ? current.id : '';
      }
    }

    // Build chips (All + every route, color-coded).
    if (chipBar) {
      chipBar.innerHTML = '';
      var allBtn = el('button', {
        type: 'button',
        class: 'tt-chip tt-chip--all',
        'data-route': '',
        'aria-pressed': 'false',
        text: 'All routes'
      });
      allBtn.addEventListener('click', function () { current = null; applyState(); });
      chipBar.appendChild(allBtn);

      routes.forEach(function (r) {
        var slug = slugify(r.name);
        var btn = el('button', {
          type: 'button',
          class: 'tt-chip',
          'data-route': slug,
          'aria-pressed': 'false',
          style: '--tt-route-color:' + r.color
        }, [
          el('span', { class: 'tt-chip__dot', 'aria-hidden': 'true' }),
          el('span', { class: 'tt-chip__num', text: r.number }),
          el('span', { class: 'tt-chip__name', text: r.name })
        ]);
        btn.addEventListener('click', function () { current = r; applyState(); });
        chipBar.appendChild(btn);
      });
    }

    // Build accessible <select> fallback (also used as primary control on small screens).
    if (select) {
      select.innerHTML = '';
      select.appendChild(el('option', { value: '', text: 'All routes' }));
      routes.forEach(function (r) {
        select.appendChild(el('option', { value: r.id, text: 'Route ' + r.number + ' — ' + r.name }));
      });
      select.addEventListener('change', function () {
        var val = select.value;
        current = val ? routes.filter(function (r) { return r.id === val; })[0] || null : null;
        applyState();
      });
    }

    applyState();
  }

  // --- Bootstrap ------------------------------------------------------------

  function init() {
    renderOverview();
    renderRoute();
    renderTracker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
