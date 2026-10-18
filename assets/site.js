// Promodo site, no libraries.
// 1. Background drawings: a faint layer behind the page. Each section names a scene ([data-bg]);
//    the scene draws itself as you scroll through that section and fades when you leave it.
// 2. Small line drawings ([data-draw]) draw themselves once when they come into view.
// 3. Guides: the step you are reading is highlighted; the manual index follows chapters.
// 4. Downloads: names, sizes and checksums come from versions.json.
;(function () {
  'use strict'
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var NS = 'http://www.w3.org/2000/svg'
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name)
    for (var k in attrs) e.setAttribute(k, attrs[k])
    if (parent) parent.appendChild(e)
    return e
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
  function rr(x, y, w, h, r) { r = r || 6; return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z' }
  function circ(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0' }
  function diamond(cx, cy, s) { return 'M' + cx + ' ' + (cy - s) + 'L' + (cx + s) + ' ' + cy + 'L' + cx + ' ' + (cy + s) + 'L' + (cx - s) + ' ' + cy + 'Z' }
  function arrow(x, y, dir) { var d = { r: [-8, -4, -8, 4], d: [-4, -8, 4, -8] }[dir || 'r']; return 'M' + x + ' ' + y + 'l' + d[0] + ' ' + d[1] + 'M' + x + ' ' + y + 'l' + d[2] + ' ' + d[3] }

  /* ---------- 1. Background scenes (drawn in a 1440 × 900 frame, mostly on the right) ---------- */
  // Each scene is a list of [path, kind]: 'c' construction line (pale blue), 'i' ink, 'b' bold ink.
  var golden = 'M0 309A309 309 0 0 1 309 0A191 191 0 0 1 500 191A118 118 0 0 1 382 309A72.9 72.9 0 0 1 308.9 236.1A45.1 45.1 0 0 1 354.2 191A27.9 27.9 0 0 1 381.9 218.9A17.2 17.2 0 0 1 364.7 235.9A10.6 10.6 0 0 1 354.1 225.5'
  var goldenSquares = 'M0 0h309v309h-309zM309 0h191v191h-191zM382 191h118v118h-118zM309 236.1h72.9v72.9h-72.9zM309 191h45.1v45.1h-45.1z'
  function at(d, x, y, s) { // move and scale a path drawn around 0,0
    return d.replace(/([MLHVAhvalmz])([^MLHVAhvalmz]*)/gi, function (m, c, args) {
      var n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : []
      var abs = c === c.toUpperCase()
      if (c === 'A' || c === 'a') {
        for (var i = 0; i + 6 < n.length + 1; i += 7) { n[i] *= s; n[i + 1] *= s; n[i + 5] = n[i + 5] * s + (abs ? x : 0); n[i + 6] = n[i + 6] * s + (abs ? y : 0) }
      } else if (c === 'H' || c === 'h') n = n.map(function (v) { return v * s + (abs ? x : 0) })
      else if (c === 'V' || c === 'v') n = n.map(function (v) { return v * s + (abs ? y : 0) })
      else n = n.map(function (v, i) { return v * s + (abs ? (i % 2 ? y : x) : 0) })
      return c + n.map(function (v) { return +v.toFixed(1) }).join(' ')
    })
  }
  var SCENES = {
    geometry: function () {
      var out = [[circ(1110, 470, 290), 'c'], ['M880 240h460v460h-460z', 'c'], ['M880 240L1340 700M1340 240L880 700', 'c']]
      for (var a = 0; a < 12; a++) { var t = a * Math.PI / 6; out.push(['M1110 470L' + (1110 + Math.cos(t) * 290).toFixed(1) + ' ' + (470 + Math.sin(t) * 290).toFixed(1), 'c']) }
      out.push([at(goldenSquares, 880, 330, 0.92), 'c'])
      out.push([at(golden, 880, 330, 0.92), 'i'])
      out.push([circ(1110, 470, 6), 'b'])
      out.push(['M760 790H1380', 'c'])
      out.push([circ(800, 790, 10), 'i'], ['M810 790H858' + arrow(858, 790), 'i'], [rr(860, 768, 80, 44, 6), 'i'], ['M940 790H978' + arrow(978, 790), 'i'], [diamond(1000, 790, 20), 'i'], ['M1020 790H1058' + arrow(1058, 790), 'i'], [rr(1060, 768, 80, 44, 6), 'i'], ['M1140 790H1178' + arrow(1178, 790), 'i'], [circ(1192, 790, 12), 'b'])
      return out
    },
    process: function () {
      return [
        ['M0 280H820M0 440H820M0 600H820', 'c'], [circ(1205, 440, 50), 'c'], ['M930 255h90v50h-90zM960 255v50', 'c'],
        ['M820 200H1400V680H820Z', 'i'], ['M846 200V680M846 360H1400M846 520H1400', 'i'],
        [circ(880, 280, 12), 'i'], ['M892 280H929' + arrow(929, 280), 'i'], [rr(930, 255, 90, 50, 8), 'i'],
        ['M1020 280H1045V440H1064' + arrow(1064, 440), 'i'], [rr(1065, 415, 90, 50, 8), 'i'], ['M1155 440H1184' + arrow(1184, 440), 'i'],
        [diamond(1205, 440, 21), 'i'], ['M1197 432l16 16M1213 432l-16 16', 'i'],
        ['M1205 419V280H1249' + arrow(1249, 280), 'i'], ['M1205 461V600H1249' + arrow(1249, 600), 'i'],
        [rr(1250, 255, 90, 50, 8), 'i'], [rr(1250, 575, 90, 50, 8), 'i'],
        ['M1340 280H1359' + arrow(1359, 280) + 'M1340 600H1359' + arrow(1359, 600), 'i'], [circ(1371, 280, 11), 'b'], [circ(1371, 600, 11), 'b']
      ]
    },
    org: function () {
      var out = [[circ(1120, 430, 270), 'c'], ['M1120 160V700M850 430H1390', 'c'], [rr(1040, 200, 160, 44, 8), 'i'], ['M1120 244V280H930V310M1120 280V310M1120 280H1310V310', 'i']]
      ;[930, 1120, 1310].forEach(function (x, i) {
        out.push([rr(x - 62, 310, 124, 40, 7), 'i'])
        var n = [2, 3, 2][i], prev = 350
        for (var j = 0; j < n; j++) { var y = 410 + j * 64; out.push(['M' + x + ' ' + prev + 'V' + (y - 11), 'i'], [circ(x, y, 11), 'i']); prev = y + 11 }
      })
      out.push(['M1120 222C900 300 760 520 770 760', 'c'], ['M1120 222C1340 300 1430 520 1420 760', 'c'])
      return out
    },
    library: function () {
      var out = [[circ(1110, 450, 300), 'c']]
      ;[[840, 190], [1130, 190], [840, 430], [1130, 430]].forEach(function (p, k) {
        var X = p[0], Y = p[1]
        out.push(['M' + X + ' ' + Y + 'h250v160h-250z', 'i'], ['M' + (X + 14) + ' ' + Y + 'v160M' + (X + 14) + ' ' + (Y + 53) + 'h236M' + (X + 14) + ' ' + (Y + 107) + 'h236', 'i'])
        var b = [[40, 0], [100, k % 2], [160, 1 + (k % 2)], [205, k === 2 ? 0 : 2]], prev = null, w = ''
        b.forEach(function (q) { var cy = Y + 27 + q[1] * 53; out.push([rr(X + q[0], cy - 10, 36, 20, 4), 'i']); if (prev) w += 'M' + prev[0] + ' ' + prev[1] + 'H' + (prev[0] + 8) + 'V' + cy + 'H' + (X + q[0]); prev = [X + q[0] + 36, cy] })
        out.push([w, 'i'])
      })
      out.push(['M965 590V650M965 650H1255M1110 650V700M965 650V700M1255 650V700', 'i'], [circ(965, 712, 10), 'i'], [circ(1110, 712, 10), 'i'], [circ(1255, 712, 10), 'i'])
      out.push(['M860 214C700 400 820 760 1110 712', 'c'])
      return out
    },
    polyhedron: function () {
      var f = (1 + Math.sqrt(5)) / 2, V = [], F = [], cx = 1110, cy = 460, R = 250 / Math.hypot(1, f)
      ;[-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { V.push([0, a, b * f], [a, b * f, 0], [b * f, 0, a]) }) })
      function near(a, b) { return Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 2) < 0.01 }
      for (var i = 0; i < 12; i++) for (var j = i + 1; j < 12; j++) for (var k = j + 1; k < 12; k++) if (near(V[i], V[j]) && near(V[j], V[k]) && near(V[i], V[k])) F.push([i, j, k])
      var ax = 0.42, ay = -0.55, ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay)
      var P = V.map(function (v) { var x = v[0] * cb + v[2] * sb, z = -v[0] * sb + v[2] * cb; return [x, v[1] * ca - z * sa, v[1] * sa + z * ca] })
      var out = [[circ(cx, cy, 250), 'c'], [circ(cx, cy, 200), 'c'], ['M' + cx + ' 170V750M820 ' + cy + 'H1400', 'c']]
      F.forEach(function (t) {
        var a = P[t[0]], b = P[t[1]], c = P[t[2]], m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]
        function pt(v, s) { return (cx + (m[0] + (v[0] - m[0]) * s) * R).toFixed(1) + ' ' + (cy + (m[1] + (v[1] - m[1]) * s) * R).toFixed(1) }
        var front = m[2] > 0
        out.push(['M' + pt(a, 1) + 'L' + pt(b, 1) + 'L' + pt(c, 1) + 'Z', front ? 'i' : 'c'])
        if (front) out.push(['M' + pt(a, 0.6) + 'L' + pt(b, 0.6) + 'L' + pt(c, 0.6) + 'Z', 'i'])
      })
      return out
    },
    spiral: function () {
      return [[circ(1110, 460, 280), 'c'], ['M830 460H1390M1110 180V740', 'c'], [at(goldenSquares, 860, 300, 1), 'c'], [at(golden, 860, 300, 1), 'i'], [circ(860, 609, 7), 'i'], [circ(1214, 525, 5), 'b']]
    },
    search: function () {
      var out = [[circ(1110, 450, 280), 'c'], [rr(860, 210, 500, 56, 28), 'i'], [circ(898, 238, 11) + 'M906 246L918 258', 'i'], ['M940 238H1120', 'c']]
      out.push([rr(1040, 330, 140, 40, 7), 'i'], ['M1110 370V400H960V420M1110 400V420M1110 400H1260V420', 'i'])
      ;[960, 1110, 1260].forEach(function (x) { out.push([rr(x - 55, 420, 110, 36, 6), 'i'], ['M' + x + ' 456V500', 'i'], [circ(x, 511, 11), 'i'], ['M' + x + ' 522V560', 'i'], [circ(x, 571, 11), 'i']) })
      out.push([circ(1110, 511, 40) + 'M1138 539L1180 581', 'b'])
      return out
    },
    docs: function () {
      return [
        [circ(1060, 450, 260), 'c'], ['M880 240h190l40 40v320h-230z', 'i'], ['M1070 240v40h40', 'i'],
        [circ(915, 330, 9), 'i'], [rr(940, 318, 46, 24, 4), 'i'], ['M924 330H940M986 330H1000', 'i'], [diamond(1018, 330, 14), 'i'],
        ['M910 400H1080M910 430H1060M910 460H1080M910 490H1030', 'c'],
        ['M1130 420H1210' + arrow(1210, 420), 'i'],
        ['M1230 300h70l20 20v80h-90z', 'i'], ['M1230 440h70l20 20v80h-90z', 'i'], ['M1230 580h70l20 20v80h-90z', 'i'],
        ['M1200 320L1230 330M1200 420L1230 480M1200 520L1230 620', 'c'],
        [rr(890, 560, 150, 46, 4), 'i'], ['M904 572h12v22h-12zM900 577h8M900 587h8', 'i'], ['M965 520V560', 'c']
      ]
    },
    lock: function () {
      return [[circ(1110, 470, 260), 'c'], [circ(1110, 470, 160), 'c'], ['M850 470H1370M1110 210V730', 'c'],
        ['M1050 430V380A60 60 0 0 1 1170 380V430', 'b'], [rr(1020, 430, 180, 150, 14), 'i'], [circ(1110, 490, 16), 'i'], ['M1110 506V545', 'i']]
    },
    share: function () {
      var out = [[circ(1110, 460, 240), 'c'], ['M1040 420h50l14 14h76v86h-140z', 'i']]
      for (var k = 0; k < 6; k++) {
        var t = -Math.PI / 2 + k * Math.PI / 3, x = 1110 + Math.cos(t) * 240, y = 460 + Math.sin(t) * 240
        out.push(['M1110 470L' + (1110 + Math.cos(t) * 200).toFixed(1) + ' ' + (460 + Math.sin(t) * 200).toFixed(1), 'c'])
        out.push([circ(x, y - 12, 12) + 'M' + (x - 20) + ' ' + (y + 22) + 'A20 20 0 0 1 ' + (x + 20) + ' ' + (y + 22), 'i'])
      }
      return out
    }
  }

  var bgSections = document.querySelectorAll('[data-bg]')
  if (bgSections.length) {
    var layer = document.createElement('div')
    layer.className = 'bg'
    layer.setAttribute('aria-hidden', 'true')
    var svg = el('svg', { viewBox: '0 0 1440 900', preserveAspectRatio: 'xMaxYMid slice' }, layer)
    document.body.insertBefore(layer, document.body.firstChild)
    var groups = []
    bgSections.forEach(function (sec) {
      var make = SCENES[sec.getAttribute('data-bg')]
      if (!make) return
      // Drawings sit on the right; sections whose text is on the right ask for the mirror image.
      var holder = sec.getAttribute('data-bg-side') === 'left' ? el('g', { transform: 'translate(1440 0) scale(-1 1)' }, svg) : svg
      var g = el('g', { class: 'bg-scene' }, holder), paths = []
      make().forEach(function (item) {
        var p = el('path', { d: item[0], class: 'bg-' + item[1], pathLength: '1', 'stroke-dasharray': '1 1', 'stroke-dashoffset': '1' }, g)
        paths.push(p)
      })
      // Sections whose text spans the full width get a much fainter drawing.
      groups.push({ sec: sec, g: g, paths: paths, dim: sec.hasAttribute('data-bg-dim') ? 0.3 : 1 })
    })
    var ticking = false
    function renderBg() {
      ticking = false
      var vh = window.innerHeight, mid = vh * 0.5, active = null, best = 1e9
      // Exactly one scene at a time: the section under the middle of the screen (or the nearest one).
      groups.forEach(function (o) {
        var r = o.sec.getBoundingClientRect()
        o.r = r
        var dist = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0
        if (dist < best) { best = dist; active = o }
      })
      if (best > vh * 0.6) active = null
      groups.forEach(function (o) {
        var on = o === active
        o.g.style.opacity = on ? String(o.dim) : '0'
        if (!on && !reduce) return
        var r = o.r
        // Drawing progress: complete by the time the section has mostly scrolled past the middle.
        var p = reduce ? 1 : clamp((vh * 0.95 - r.top) / (Math.min(r.height, vh * 1.2) * 0.85 + vh * 0.2), 0, 1)
        o.g.setAttribute('transform', reduce ? '' : 'translate(0 ' + ((0.5 - p) * 26).toFixed(1) + ')')
        var n = o.paths.length
        o.paths.forEach(function (path, i) {
          var a = (i / n) * 0.75, q = clamp((p - a) / 0.25, 0, 1)
          path.setAttribute('stroke-dashoffset', (1 - q).toFixed(4))
          path.style.visibility = q > 0 ? 'visible' : 'hidden'
        })
      })
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(renderBg) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    renderBg()
  }

  /* ---------- 2. Small self-drawing line drawings ---------- */
  var drawings = document.querySelectorAll('[data-draw]')
  if (reduce || !('IntersectionObserver' in window)) drawings.forEach(function (d) { d.classList.add('is-drawn') })
  else {
    var ioD = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-drawn'); ioD.unobserve(en.target) } })
    }, { threshold: 0.35 })
    drawings.forEach(function (d) { ioD.observe(d) })
  }

  /* ---------- 3. Guide steps / manual index ---------- */
  var steps = document.querySelectorAll('[data-step]')
  if (steps.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) steps.forEach(function (s) { s.classList.toggle('is-here', s === en.target) })
      })
    }, { rootMargin: '-40% 0px -55% 0px' })
    steps.forEach(function (s) { io.observe(s) })
  }
  var chapters = document.querySelectorAll('.chapter[id]')
  if (chapters.length && 'IntersectionObserver' in window) {
    var links = {}
    document.querySelectorAll('.index a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a })
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-here', k === en.target.id) })
      })
    }, { rootMargin: '-30% 0px -65% 0px' })
    chapters.forEach(function (c) { io2.observe(c) })
  }

  /* ---------- 4. Downloads from versions.json ---------- */
  var keys = document.querySelectorAll('[data-file]')
  if (!keys.length) return
  var base = document.documentElement.getAttribute('data-root') || ''
  var lang = document.documentElement.lang
  fetch(base + 'versions.json', { cache: 'no-cache' })
    .then(function (r) { return r.json() })
    .then(function (v) {
      var when = new Date(v.date + 'T12:00:00').toLocaleDateString(lang === 'lt' ? 'lt-LT' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
      document.querySelectorAll('[data-version]').forEach(function (e) { e.textContent = v.version })
      document.querySelectorAll('[data-date]').forEach(function (e) { e.textContent = when })
      keys.forEach(function (k) {
        var f = v.files[k.getAttribute('data-file')]
        if (!f) return
        k.href = /^https?:/.test(f.url) ? f.url : base + f.url
        var meta = k.querySelector('.key__meta')
        if (meta) meta.textContent = v.version + ', ' + Math.round(f.size / 1e6) + ' MB'
      })
      document.querySelectorAll('[data-sum]').forEach(function (e) { var f = v.files[e.getAttribute('data-sum')]; if (f) e.textContent = f.sha256 })
    })
    .catch(function () { /* The static links in the page still work. */ })
  // Chromium browsers can tell an Apple-chip Mac; Safari and Firefox can't, so nothing is pre-picked there.
  var uad = navigator.userAgentData
  if (uad && uad.getHighEntropyValues && /Mac/.test(navigator.platform || '')) {
    uad.getHighEntropyValues(['architecture']).then(function (h) {
      var pick = h.architecture === 'arm' ? 'mac-arm64' : h.architecture === 'x86' ? 'mac-x64' : null
      if (pick) keys.forEach(function (k) { if (k.getAttribute('data-file') === pick) k.setAttribute('data-suggested', 'true') })
    })
  } else if (/Windows/.test(navigator.userAgent)) {
    keys.forEach(function (k) { if (k.getAttribute('data-file') === 'win') k.setAttribute('data-suggested', 'true') })
  }
})()
