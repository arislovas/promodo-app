// Promodo site: working demos, no libraries.
// studio  – a live mini-Promodo: drag steps, arrows re-route; tidy up; search; architect / colleague view.
// scale   – one process → one function → the whole company (sample data).
// check   – guided validation: problems are marked and fixed with one click.
// org     – company structure: pick a role, see its processes.
// share   – shared folder or .promodo file; colleagues view only.
// find    – search over every step of the sample company.
// export  – one diagram, six formats.
// rail    – the page's own sequence flow: a token marks the section you are reading.
;(function () {
  'use strict'
  var T = JSON.parse((document.getElementById('ui-text') || { textContent: '{}' }).textContent)
  var S = window.PROMODO_SAMPLE || { f: [], p: [], r: {}, s: [] }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var NS = 'http://www.w3.org/2000/svg'
  function el(name, attrs, parent, text) {
    var e = document.createElementNS(NS, name)
    for (var k in attrs) e.setAttribute(k, attrs[k])
    if (text != null) e.textContent = text
    if (parent) parent.appendChild(e)
    return e
  }
  function h(tag, cls, parent, text) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (text != null) e.textContent = text
    if (parent) parent.appendChild(e)
    return e
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3) }
  function rr(x, y, w, h2, r) { return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h2 - r) + 'Q' + (x + w) + ' ' + (y + h2) + ' ' + (x + w - r) + ' ' + (y + h2) + 'H' + (x + r) + 'Q' + x + ' ' + (y + h2) + ' ' + x + ' ' + (y + h2 - r) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z' }
  function wrapText(t, x, y, str, maxChars, lh) {
    var words = String(str).split(' '), lines = [], line = ''
    words.forEach(function (w) { if ((line + ' ' + w).trim().length > maxChars && line) { lines.push(line); line = w } else line = (line + ' ' + w).trim() })
    lines.push(line)
    lines.forEach(function (l, i) { el('tspan', { x: x, y: y + (i - (lines.length - 1) / 2) * lh }, t, l) })
  }
  function onVisible(node, fn) {
    if (!('IntersectionObserver' in window)) return fn()
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn() } }, { threshold: 0.05 })
    io.observe(node)
  }

  /* ---------------- studio: the live mini-Promodo ---------------- */
  var studio = document.querySelector('[data-demo="studio"]')
  if (studio) buildStudio(studio)

  function buildStudio(root) {
    var t = T.studio
    var svg = root.querySelector('.st-canvas svg')
    var W = 680, LANE_H = 120, TOP = 10
    var laneY = [70, 190, 310]
    var nodes = {
      s: { kind: 'start', x: 95, y: 70 },
      a: { kind: 'task', x: 190, y: 70, label: t.steps.a },
      g: { kind: 'gate', x: 292, y: 70, label: t.gate },
      n: { kind: 'task', x: 420, y: 70, label: t.steps.n },
      e2: { kind: 'end', x: 530, y: 70 },
      b: { kind: 'task', x: 390, y: 190, label: t.steps.b },
      c: { kind: 'task', x: 530, y: 190, label: t.steps.c },
      d: { kind: 'task', x: 530, y: 310, label: t.steps.d },
      e: { kind: 'end', x: 632, y: 310 }
    }
    var tidy = {}
    Object.keys(nodes).forEach(function (k) { tidy[k] = { x: nodes[k].x, y: nodes[k].y } })
    var edges = [['s', 'a'], ['a', 'g'], ['g', 'n', 'no'], ['n', 'e2'], ['g', 'b', 'yes'], ['b', 'c'], ['c', 'd'], ['d', 'e']]
    var TW = 108, TH = 54

    // Pool, lanes and labels
    var pool = el('g', { class: 'st-pool' }, svg)
    el('path', { d: 'M10 ' + TOP + 'H670V370H10Z', class: 'st-frame' }, pool)
    el('path', { d: 'M36 10V370M62 10V370M36 130H670M36 250H670', class: 'st-frame st-frame--inner' }, pool)
    var poolLabel = el('text', { class: 'st-pool-name', transform: 'rotate(-90 23 190)', x: 23, y: 194, 'text-anchor': 'middle' }, pool, t.pool)
    var laneEls = t.lanes.map(function (name, i) {
      var g = el('g', { class: 'st-lane' }, pool)
      var bg = el('rect', { x: 62, y: TOP + i * LANE_H, width: 608, height: LANE_H, class: 'st-lane-bg' }, g)
      el('text', { class: 'st-lane-name', transform: 'rotate(-90 49 ' + laneY[i] + ')', x: 49, y: laneY[i] + 4, 'text-anchor': 'middle' }, g, name)
      return { g: g, bg: bg, name: name }
    })
    var edgeLayer = el('g', { class: 'st-edges' }, svg)
    var nodeLayer = el('g', { class: 'st-nodes' }, svg)
    var edgeEls = edges.map(function (e) {
      var g = el('g', {}, edgeLayer)
      var p = el('path', { class: 'st-edge' }, g)
      var head = el('path', { class: 'st-head' }, g)
      var lbl = e[2] ? el('text', { class: 'st-edge-label' }, g, t[e[2]]) : null
      return { e: e, p: p, head: head, lbl: lbl }
    })
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k], g = el('g', { class: 'st-node st-node--' + n.kind, 'data-id': k, tabindex: n.kind === 'task' ? '0' : '-1' }, nodeLayer)
      if (n.kind === 'task') {
        el('path', { d: rr(-TW / 2, -TH / 2, TW, TH, 9), class: 'st-shape' }, g)
        var tx = el('text', { class: 'st-label', 'text-anchor': 'middle' }, g)
        wrapText(tx, 0, 4, n.label, 15, 14)
        g.setAttribute('role', 'button')
        g.setAttribute('aria-label', n.label)
      } else if (n.kind === 'gate') {
        el('path', { d: 'M0 -24L24 0L0 24L-24 0Z', class: 'st-shape' }, g)
        el('path', { d: 'M-8 -8L8 8M8 -8L-8 8', class: 'st-mark' }, g)
        el('text', { class: 'st-gate-label', x: 0, y: -33, 'text-anchor': 'middle' }, g, n.label)
      } else {
        el('circle', { r: 13, class: 'st-shape' + (n.kind === 'end' ? ' st-shape--end' : '') }, g)
      }
      n.g = g
    })

    function anchor(n, side) {
      if (n.kind === 'task') return { l: [n.x - TW / 2, n.y], r: [n.x + TW / 2, n.y], t: [n.x, n.y - TH / 2], b: [n.x, n.y + TH / 2] }[side]
      if (n.kind === 'gate') return { l: [n.x - 24, n.y], r: [n.x + 24, n.y], t: [n.x, n.y - 24], b: [n.x, n.y + 24] }[side]
      return { l: [n.x - 13, n.y], r: [n.x + 13, n.y], t: [n.x, n.y - 13], b: [n.x, n.y + 13] }[side]
    }
    // Orthogonal routing in the BPMN habit: straight when aligned; a gateway's branch leaves from a corner.
    function route(a, b, kind) {
      var pts
      if (kind === 'yes') {
        var s0 = anchor(a, b.y >= a.y ? 'b' : 't'), bl = anchor(b, 'l')
        if (bl[0] > a.x + 12) pts = [s0, [s0[0], bl[1]], bl]
        else { var t0 = anchor(b, b.y > a.y ? 't' : 'b'), my = (s0[1] + t0[1]) / 2; pts = [s0, [s0[0], my], [t0[0], my], t0] }
      } else {
        var sr = anchor(a, 'r'), tl = anchor(b, 'l')
        if (Math.abs(a.x - b.x) < TW && Math.abs(a.y - b.y) > 40) {
          var down = b.y > a.y, s1 = anchor(a, down ? 'b' : 't'), t1 = anchor(b, down ? 't' : 'b')
          pts = Math.abs(s1[0] - t1[0]) < 2 ? [s1, t1] : [s1, [s1[0], (s1[1] + t1[1]) / 2], [t1[0], (s1[1] + t1[1]) / 2], t1]
        } else if (tl[0] - sr[0] > 16) {
          if (Math.abs(sr[1] - tl[1]) < 2) pts = [sr, tl]
          else { var mx = Math.round((sr[0] + tl[0]) / 2); pts = [sr, [mx, sr[1]], [mx, tl[1]], tl] }
        } else {
          // Target behind the source: go around.
          var tr = anchor(b, 'r'), y = Math.max(a.y, b.y) + 50
          if (y > 362) y = Math.min(a.y, b.y) - 50
          pts = [sr, [sr[0] + 14, sr[1]], [sr[0] + 14, y], [tl[0] - 14, y], [tl[0] - 14, tl[1]], tl]
        }
      }
      return pts
    }
    function draw() {
      Object.keys(nodes).forEach(function (k) { var n = nodes[k]; n.g.setAttribute('transform', 'translate(' + n.x.toFixed(1) + ' ' + n.y.toFixed(1) + ')') })
      edgeEls.forEach(function (o) {
        var pts = route(nodes[o.e[0]], nodes[o.e[1]], o.e[2])
        o.p.setAttribute('d', 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join('L'))
        var p1 = pts[pts.length - 2], p2 = pts[pts.length - 1], ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
        var hx = p2[0], hy = p2[1], c = Math.cos(ang), s = Math.sin(ang)
        o.head.setAttribute('d', 'M' + hx + ' ' + hy + 'L' + (hx - 8 * c + 4 * s) + ' ' + (hy - 8 * s - 4 * c) + 'L' + (hx - 8 * c - 4 * s) + ' ' + (hy - 8 * s + 4 * c) + 'Z')
        if (o.lbl) { o.lbl.setAttribute('x', pts[0][0] + 6); o.lbl.setAttribute('y', pts[0][1] + (o.e[2] === 'yes' ? 18 : -8)) }
      })
    }
    draw()

    // Mode: architect (drag) or colleague (view only, details on click)
    var mode = 'architect'
    var modeBtns = root.querySelectorAll('[data-mode]')
    var tidyBtn = root.querySelector('[data-tidy]')
    var badge = root.querySelector('.st-badge')
    var hint = root.querySelector('.st-hint')
    function setMode(m) {
      mode = m
      root.setAttribute('data-view', m)
      modeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false') })
      hint.textContent = m === 'architect' ? t.hintArchitect : t.hintColleague
    }
    modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')) }) })
    setMode('architect')

    // Details panel
    var panel = root.querySelector('.st-panel'), panelBody = root.querySelector('.st-panel__body')
    function laneOf(n) { return clamp(Math.floor((n.y - TOP) / LANE_H), 0, 2) }
    function showDetails(k) {
      var n = nodes[k], d = t.details[k]
      if (!d) return
      Object.keys(nodes).forEach(function (q) { nodes[q].g.classList.toggle('is-selected', q === k) })
      panelBody.innerHTML = ''
      h('p', 'st-panel__title', panelBody, n.label)
      var dl = h('dl', '', panelBody)
      ;[[t.fields.who, t.lanes[laneOf(n)]], [t.fields.it, d[0]], [t.fields.doc, d[1]], [t.fields.result, d[2]]].forEach(function (row) {
        h('dt', '', dl, row[0]); h('dd', '', dl, row[1])
      })
      panel.hidden = false
    }
    root.querySelector('.st-panel-close').addEventListener('click', function () {
      panel.hidden = true
      Object.keys(nodes).forEach(function (q) { nodes[q].g.classList.remove('is-selected') })
    })

    // Dragging (architect only)
    var drag = null
    function svgPoint(ev) {
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    }
    nodeLayer.addEventListener('pointerdown', function (ev) {
      var g = ev.target.closest('.st-node--task')
      if (!g) return
      var k = g.getAttribute('data-id')
      if (mode !== 'architect') { showDetails(k); return }
      var p = svgPoint(ev)
      drag = { k: k, dx: nodes[k].x - p.x, dy: nodes[k].y - p.y, moved: false }
      g.setPointerCapture(ev.pointerId)
      g.classList.add('is-dragging')
      stopAuto()
    })
    nodeLayer.addEventListener('pointermove', function (ev) {
      if (!drag) return
      var p = svgPoint(ev), n = nodes[drag.k]
      n.x = clamp(p.x + drag.dx, 62 + TW / 2 + 4, 670 - TW / 2 - 4)
      n.y = clamp(p.y + drag.dy, TOP + TH / 2 + 4, 370 - TH / 2 - 4)
      drag.moved = true
      laneEls.forEach(function (l, i) { l.g.classList.toggle('is-target', i === laneOf(n)) })
      draw()
    })
    function endDrag() {
      if (!drag) return
      var n = nodes[drag.k]
      // Dropping into a lane makes the step that responsibility's: it snaps to the lane's middle.
      var target = laneY[laneOf(n)]
      animate([[drag.k, n.x, target]], 220)
      n.g.classList.remove('is-dragging')
      laneEls.forEach(function (l) { l.g.classList.remove('is-target') })
      if (!drag.moved) showDetails(drag.k)
      drag = null
    }
    nodeLayer.addEventListener('pointerup', endDrag)
    nodeLayer.addEventListener('pointercancel', endDrag)
    nodeLayer.addEventListener('keydown', function (ev) {
      var g = ev.target.closest('.st-node--task')
      if (!g) return
      var k = g.getAttribute('data-id'), n = nodes[k]
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); showDetails(k); return }
      if (mode !== 'architect') return
      var step = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -LANE_H], ArrowDown: [0, LANE_H] }[ev.key]
      if (!step) return
      ev.preventDefault()
      n.x = clamp(n.x + step[0], 62 + TW / 2 + 4, 670 - TW / 2 - 4)
      n.y = laneY[clamp(laneOf(n) + Math.sign(step[1]), 0, 2)]
      draw()
    })

    // Animation helper and "Tidy up arrows"
    var anim = null
    function animate(targets, ms, done) {
      var from = targets.map(function (tg) { return [tg[0], nodes[tg[0]].x, nodes[tg[0]].y] })
      var t0 = null
      if (anim) cancelAnimationFrame(anim)
      if (reduce) ms = 1
      function step(now) {
        if (t0 === null) t0 = now
        var q = easeOut(clamp((now - t0) / ms, 0, 1))
        targets.forEach(function (tg, i) { var n = nodes[tg[0]]; n.x = from[i][1] + (tg[1] - from[i][1]) * q; n.y = from[i][2] + (tg[2] - from[i][2]) * q })
        draw()
        if (q < 1) anim = requestAnimationFrame(step); else { anim = null; if (done) done() }
      }
      anim = requestAnimationFrame(step)
    }
    function doTidy() {
      animate(Object.keys(tidy).map(function (k) { return [k, tidy[k].x, tidy[k].y] }), 650, function () {
        badge.textContent = t.tidied
        badge.classList.add('is-on')
        setTimeout(function () { badge.classList.remove('is-on') }, 1600)
      })
    }
    tidyBtn.addEventListener('click', function () { stopAuto(); doTidy() })

    // Search: matching steps and lanes light up
    var search = root.querySelector('.st-search input')
    search.addEventListener('input', function () {
      var q = norm(search.value.trim())
      root.classList.toggle('is-searching', !!q)
      Object.keys(nodes).forEach(function (k) {
        var n = nodes[k]
        var hit = q && n.kind === 'task' && (norm(n.label).indexOf(q) >= 0 || norm(t.lanes[laneOf(n)]).indexOf(q) >= 0)
        n.g.classList.toggle('is-hit', !!hit)
      })
      laneEls.forEach(function (l) { l.g.classList.toggle('is-hit', !!q && norm(l.name).indexOf(q) >= 0) })
    })

    // One orchestrated moment: the diagram draws itself, a step drifts, and the arrows tidy themselves.
    var timers = []
    function stopAuto() { timers.forEach(clearTimeout); timers = [] }
    root.classList.add('is-drawing')
    onVisible(root, function () {
      root.classList.add('is-drawn')
      if (reduce) return
      timers.push(setTimeout(function () { animate([['b', 330, 250], ['c', 480, 150]], 900) }, 1900))
      timers.push(setTimeout(function () { doTidy() }, 3300))
    })
  }

  /* ---------------- scale: one process → the whole company ---------------- */
  var scale = document.querySelector('[data-demo="scale"]')
  if (scale) buildScale(scale)

  // A process drawn properly: pool, named lanes, start → steps → end, orthogonal arrows with heads.
  function processDiagram(svg, proc) {
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    var steps = proc[4], lanes = []
    steps.forEach(function (s) { if (lanes.indexOf(s[1]) < 0) lanes.push(s[1]) })
    if (!lanes.length) lanes = ['']
    // Fixed slot per step, so names keep their size; the drawing grows wider and the frame scrolls if needed.
    var SLOT = 134, LW = 30, NW = 132, X = 8, Y = 8, n = steps.length + 2
    var W = LW + NW + 16 + SLOT * n + 16, lh = 96, H = lh * lanes.length
    svg.setAttribute('viewBox', '0 0 ' + (W + 16) + ' ' + (H + 16))
    svg.style.minWidth = Math.round((W + 16) * 0.82) + 'px'
    var g = el('g', { class: 'pd' }, svg)
    el('rect', { x: X, y: Y, width: W, height: H, class: 'pd-pool' }, g)
    el('path', { d: 'M' + (X + LW) + ' ' + Y + 'V' + (Y + H) + 'M' + (X + LW + NW) + ' ' + Y + 'V' + (Y + H), class: 'pd-sep' }, g)
    el('text', { class: 'pd-pool-name', transform: 'rotate(-90 ' + (X + 19) + ' ' + (Y + H / 2) + ')', x: X + 19, y: Y + H / 2 + 4, 'text-anchor': 'middle' }, g, proc[0])
    lanes.forEach(function (l, i) {
      if (i) el('path', { d: 'M' + (X + LW) + ' ' + (Y + i * lh) + 'H' + (X + W), class: 'pd-sep' }, g)
      var t = el('text', { class: 'pd-lane', 'text-anchor': 'middle' }, g)
      wrapText(t, X + LW + NW / 2, Y + i * lh + lh / 2 + 4, l, 16, 15)
    })
    var left = X + LW + NW + 16, slot = SLOT, bw = 120, bh = 64
    function cy(i) { return Y + lh * (lanes.indexOf(steps[i][1]) + 0.5) }
    var pts = [{ x: left + slot * 0.5, y: steps.length ? cy(0) : Y + lh / 2, kind: 'start' }]
    steps.forEach(function (s, i) { pts.push({ x: left + slot * (i + 1.5), y: cy(i), kind: 'task', label: s[0] }) })
    pts.push({ x: left + slot * (n - 0.5), y: pts[pts.length - 1].y, kind: 'end' })
    function edgeR(p) { return p.kind === 'task' ? p.x + bw / 2 : p.x + 12 }
    function edgeL(p) { return p.kind === 'task' ? p.x - bw / 2 : p.x - 12 }
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b2 = pts[i], x1 = edgeR(a), x2 = edgeL(b2), mx = Math.round((x1 + x2) / 2)
      var d = a.y === b2.y ? 'M' + x1 + ' ' + a.y + 'H' + x2 : 'M' + x1 + ' ' + a.y + 'H' + mx + 'V' + b2.y + 'H' + x2
      el('path', { d: d, class: 'pd-flow' }, g)
      el('path', { d: 'M' + x2 + ' ' + b2.y + 'l-8 -4v8z', class: 'pd-head' }, g)
    }
    pts.forEach(function (p) {
      if (p.kind === 'task') {
        el('rect', { x: p.x - bw / 2, y: p.y - bh / 2, width: bw, height: bh, rx: 8, class: 'pd-task' }, g)
        var t = el('text', { class: 'pd-label', 'text-anchor': 'middle' }, g)
        wrapText(t, p.x, p.y + 4, p.label, 15, 14)
      } else el('circle', { cx: p.x, cy: p.y, r: 12, class: p.kind === 'end' ? 'pd-end' : 'pd-start' }, g)
    })
  }

  function buildScale(root) {
    var t = T.scale
    var stage = root.querySelector('.sc-stage')
    var stops = root.querySelectorAll('[data-stop]')
    var caption = root.querySelector('.sc-caption')
    var current = 0
    S.p.forEach(function (p, i) { if (p[0] === t.process) current = i })
    var level = 0
    function count(n, forms) { return n + ' ' + (n === 1 ? forms[0] : (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19)) ? forms[1] : forms[2]) }
    function open(i, lvl) { current = i; show(lvl) }

    function renderProcess() {
      var p = S.p[current]
      var head = h('div', 'sc-head', stage)
      var back = h('button', 'sc-crumb', head, S.f[p[1]]); back.type = 'button'
      back.addEventListener('click', function () { show(1) })
      h('span', 'sc-sep', head, '/')
      h('span', 'sc-here', head, p[0])
      var meta = h('p', 'sc-meta', stage)
      meta.textContent = t.owner + ': ' + p[2] + ' · ' + t.manager + ': ' + p[3] + ' · ' + count(p[4].length, t.stepForms)
      var wrap = h('div', 'sc-diagram', stage)
      var svg = el('svg', { role: 'img', 'aria-label': p[0] }, wrap)
      processDiagram(svg, p)
      // Narrow screens get the same process as a numbered list (CSS picks one).
      var ol = h('ol', 'sc-steps', stage)
      p[4].forEach(function (st) { var li = h('li', '', ol); h('b', '', li, st[0]); h('span', '', li, st[1]) })
    }
    function renderFunction() {
      var f = S.p[current][1], ps = S.p.map(function (p, i) { return [p, i] }).filter(function (x) { return x[0][1] === f })
      var head = h('div', 'sc-head', stage)
      var back = h('button', 'sc-crumb', head, t.company); back.type = 'button'
      back.addEventListener('click', function () { show(2) })
      h('span', 'sc-sep', head, '/')
      h('span', 'sc-here', head, S.f[f])
      h('p', 'sc-meta', stage, count(ps.length, t.processForms) + ' · ' + t.clickHint)
      var list = h('ol', 'sc-rows', stage)
      ps.forEach(function (x) {
        var p = x[0], li = h('li', '', list), b = h('button', 'sc-row', li); b.type = 'button'
        var top = h('span', 'sc-row__top', b)
        h('span', 'sc-row__name', top, p[0])
        h('span', 'sc-row__who', top, p[2] + ' → ' + p[3])
        var flow = h('span', 'sc-row__flow', b)
        p[4].slice(0, 5).forEach(function (s, k) { if (k) h('span', 'sc-arrow', flow, '→'); h('span', 'sc-step', flow, s[0]) })
        if (p[4].length > 5) h('span', 'sc-more', flow, '+' + (p[4].length - 5))
        b.addEventListener('click', function () { open(x[1], 0) })
      })
    }
    function renderCompany() {
      var head = h('div', 'sc-head', stage)
      h('span', 'sc-here', head, t.company)
      h('p', 'sc-meta', stage, t.totals)
      var grid = h('div', 'sc-map', stage)
      S.f.forEach(function (f, fi) {
        var ps = S.p.map(function (p, i) { return [p, i] }).filter(function (x) { return x[0][1] === fi })
        var col = h('div', 'sc-fn' + (fi === S.p[current][1] ? ' is-current' : ''), grid)
        var fb = h('button', 'sc-fn__name', col, f); fb.type = 'button'
        fb.addEventListener('click', function () { if (ps.length) open(ps[0][1], 1) })
        var ul = h('ul', 'sc-fn__list', col)
        ps.forEach(function (x) {
          var b = h('button', 'sc-proc' + (x[1] === current ? ' is-current' : ''), h('li', '', ul)); b.type = 'button'
          h('span', '', b, x[0][0]); h('span', 'sc-proc__n', b, String(x[0][4].length))
          b.addEventListener('click', function () { open(x[1], 0) })
        })
      })
    }
    function show(lvl) {
      level = lvl
      stage.innerHTML = ''
      ;[renderProcess, renderFunction, renderCompany][lvl]()
      stops.forEach(function (b, j) { b.setAttribute('aria-pressed', lvl === j ? 'true' : 'false') })
      caption.textContent = t.captions[lvl]
      stage.classList.remove('is-in'); void stage.offsetWidth; stage.classList.add('is-in')
    }
    stops.forEach(function (b, i) { b.addEventListener('click', function () { show(i) }) })
    show(0)
  }

  /* ---------------- check: guided validation ---------------- */
  var check = document.querySelector('[data-demo="check"]')
  if (check) {
    var ct = T.check, csvg = check.querySelector('svg'), list = check.querySelector('.ck-list'), state = check.querySelector('.ck-state')
    el('circle', { cx: 40, cy: 90, r: 12, class: 'd-shape' }, csvg)
    el('path', { d: 'M52 90H86', class: 'd-line' }, csvg)
    el('path', { d: rr(88, 64, 110, 52, 9), class: 'd-shape' }, csvg)
    var t1 = el('text', { class: 'd-label', 'text-anchor': 'middle' }, csvg); wrapText(t1, 143, 94, ct.step1, 16, 14)
    el('path', { d: 'M198 90H232', class: 'd-line' }, csvg)
    var unnamed = el('path', { d: rr(234, 64, 110, 52, 9), class: 'd-shape is-problem' }, csvg)
    var t2 = el('text', { class: 'd-label d-label--muted', 'text-anchor': 'middle', x: 289, y: 94 }, csvg, '?')
    el('path', { d: 'M344 90H378', class: 'd-line' }, csvg)
    var endEv = el('circle', { cx: 392, cy: 90, r: 12, class: 'd-shape d-shape--end is-missing' }, csvg)
    var warn1 = el('circle', { cx: 344, cy: 64, r: 7, class: 'd-warn' }, csvg)
    var warn2 = el('circle', { cx: 392, cy: 70, r: 7, class: 'd-warn' }, csvg)
    var fixed = 0
    function updateState() { var left = 2 - fixed; state.textContent = left === 0 ? ct.ok : (left === 1 ? ct.problem1 : ct.problems).replace('{n}', left); check.classList.toggle('is-ok', left === 0) }
    ;[[ct.issue1, function () { unnamed.classList.remove('is-problem'); t2.textContent = ''; wrapText(t2, 289, 94, ct.step2, 16, 14); t2.classList.remove('d-label--muted'); warn1.remove() }],
      [ct.issue2, function () { endEv.classList.remove('is-missing'); warn2.remove() }]].forEach(function (it) {
      var li = h('li', '', list)
      h('span', '', li, it[0])
      var b = h('button', 'btn-mini', li, ct.fix)
      b.type = 'button'
      b.addEventListener('click', function () { it[1](); li.classList.add('is-done'); b.disabled = true; b.textContent = ct.fixed; fixed++; updateState() })
    })
    updateState()
  }

  /* ---------------- org: pick a role, see its processes ---------------- */
  var org = document.querySelector('[data-demo="org"]')
  if (org) {
    var ot = T.org, chips = org.querySelector('.or-chips'), out = org.querySelector('.or-out')
    var roles = Object.keys(S.r).sort(function (a, b) { return S.r[b].length - S.r[a].length }).slice(0, 6)
    function pick(role) {
      chips.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.textContent === role ? 'true' : 'false') })
      out.innerHTML = ''
      h('p', 'or-count', out, ot.count.replace('{role}', role).replace('{n}', S.r[role].length))
      var ul = h('ul', 'or-list', out)
      S.r[role].forEach(function (p) {
        var proc = S.p.filter(function (x) { return x[0] === p })[0]
        var li = h('li', '', ul)
        h('span', 'or-proc', li, p)
        if (proc) h('span', 'or-fn', li, S.f[proc[1]])
      })
    }
    roles.forEach(function (r) { var b = h('button', 'chip', chips, r); b.type = 'button'; b.addEventListener('click', function () { pick(r) }) })
    pick(roles[0])
  }

  /* ---------------- share: shared folder or .promodo file ---------------- */
  var share = document.querySelector('[data-demo="share"]')
  if (share) {
    var stx = T.share, ssvg = share.querySelector('svg'), tabs = share.querySelectorAll('[data-share]'), note = share.querySelector('.sh-note')
    function person(x, y, cls) { var g = el('g', { class: 'sh-person ' + (cls || '') }, ssvg); el('circle', { cx: x, cy: y - 14, r: 11 }, g); el('path', { d: 'M' + (x - 19) + ' ' + (y + 18) + 'A19 19 0 0 1 ' + (x + 19) + ' ' + (y + 18) }, g); return g }
    person(70, 150, 'sh-architect')
    el('text', { x: 70, y: 196, class: 'sh-label', 'text-anchor': 'middle' }, ssvg, stx.architect)
    el('path', { d: rr(54, 86, 32, 22, 4) + 'M60 86V79A10 10 0 0 1 80 79V86', class: 'sh-lock' }, ssvg)
    var hub = el('g', { class: 'sh-hub' }, ssvg)
    var folder = el('path', { d: 'M220 122h34l10 10h46v50h-90z', class: 'sh-folder' }, hub)
    var file = el('path', { d: 'M236 112h40l14 14v58h-54zM276 112v14h14', class: 'sh-file' }, hub)
    var hubLabel = el('text', { x: 265, y: 210, class: 'sh-label', 'text-anchor': 'middle' }, hub, '')
    var links = el('path', { d: 'M100 150H214M316 150C350 150 360 70 400 70M316 150H400M316 150C350 150 360 230 400 230', class: 'sh-link' }, ssvg)
    ;[70, 150, 230].forEach(function (y) { person(430, y + 4); el('path', { d: 'M458 ' + (y - 8) + 'c6-8 18-8 24 0c-6 8-18 8-24 0z', class: 'sh-eye' }, ssvg); el('circle', { cx: 470, cy: y - 8, r: 3, class: 'sh-eye-dot' }, ssvg) })
    el('text', { x: 470, y: 290, class: 'sh-label', 'text-anchor': 'middle' }, ssvg, stx.colleagues)
    var dots = [0, 1, 2].map(function () { return el('circle', { r: 4, class: 'sh-dot' }, ssvg) })
    var paths = ['M100 150H214M316 150C350 150 360 70 400 70', 'M100 150H214M316 150H400', 'M100 150H214M316 150C350 150 360 230 400 230']
    function sendDots() {
      if (reduce) return
      dots.forEach(function (d, i) {
        var tmp = el('path', { d: paths[i].replace('M316', 'L316') }, null)
        tmp.setAttribute('d', paths[i])
        ssvg.appendChild(tmp); tmp.style.visibility = 'hidden'
        var len = tmp.getTotalLength(), t0 = null
        function step(now) {
          if (t0 === null) t0 = now
          var q = clamp((now - t0) / 1400, 0, 1), p = tmp.getPointAtLength(len * easeOut(q))
          d.setAttribute('cx', p.x); d.setAttribute('cy', p.y); d.style.opacity = q < 1 ? 1 : 0
          if (q < 1) requestAnimationFrame(step); else tmp.remove()
        }
        setTimeout(function () { requestAnimationFrame(step) }, i * 160)
      })
    }
    function setShare(k) {
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-share') === k ? 'true' : 'false') })
      folder.style.display = k === 'folder' ? '' : 'none'
      file.style.display = k === 'file' ? '' : 'none'
      hubLabel.textContent = k === 'folder' ? stx.folder : stx.file
      note.textContent = k === 'folder' ? stx.noteFolder : stx.noteFile
      sendDots()
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { setShare(b.getAttribute('data-share')) }) })
    setShare('folder')
    onVisible(share, sendDots)
  }

  /* ---------------- find: search every step ---------------- */
  var find = document.querySelector('[data-demo="find"]')
  if (find) {
    var ft = T.find, input = find.querySelector('input'), res = find.querySelector('.fd-results'), count = find.querySelector('.fd-count')
    var all = []
    S.p.forEach(function (p) { all.push({ kind: 'p', name: p[0], meta: S.f[p[1]] }); p[4].forEach(function (s) { all.push({ kind: 's', name: s[0], meta: p[0] + ' · ' + s[1] }) }) })
    Object.keys(S.r).forEach(function (r) { all.push({ kind: 'r', name: r, meta: ft.role }) })
    function run() {
      var q = norm(input.value.trim())
      res.innerHTML = ''
      if (!q) { count.textContent = ft.total.replace('{n}', all.length); return }
      var hits = all.filter(function (x) { return norm(x.name).indexOf(q) >= 0 || norm(x.meta).indexOf(q) >= 0 })
      count.textContent = ft.found.replace('{n}', hits.length)
      hits.slice(0, 6).forEach(function (x) {
        var li = h('li', 'fd-' + x.kind, res)
        var name = h('span', 'fd-name', li)
        var i = norm(x.name).indexOf(q)
        if (i >= 0) { name.appendChild(document.createTextNode(x.name.slice(0, i))); h('mark', '', name, x.name.slice(i, i + q.length)); name.appendChild(document.createTextNode(x.name.slice(i + q.length))) } else name.textContent = x.name
        h('span', 'fd-meta', li, (x.kind === 'p' ? ft.process + ' · ' : x.kind === 'r' ? '' : '') + x.meta)
      })
    }
    input.addEventListener('input', run)
    find.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-q'); run(); input.focus() }) })
    input.value = ft.start
    run()
  }

  /* ---------------- export: one diagram, six formats ---------------- */
  var exp = document.querySelector('[data-demo="export"]')
  if (exp) {
    var et = T.export, ebtns = exp.querySelectorAll('[data-format]'), view = exp.querySelector('.ex-view')
    var proc = S.p.filter(function (p) { return p[0] === T.scale.process })[0] || S.p[0]
    function diagramSvg() {
      var s = el('svg', { class: 'ex-diagram' })
      processDiagram(s, proc)
      s.style.minWidth = ''
      return s
    }
    var renders = {
      png: function () { var f = h('div', 'ex-img', view); f.appendChild(diagramSvg()); h('span', 'ex-tag', f, et.png) },
      svg: function () { var f = h('div', 'ex-img ex-img--vector', view); f.appendChild(diagramSvg()); h('span', 'ex-tag', f, et.svg) },
      pdf: function () { var f = h('div', 'ex-page', view); h('p', 'ex-h', f, proc[0]); f.appendChild(diagramSvg()); h('p', 'ex-stamp', f, et.stamp) },
      docx: function () {
        var f = h('div', 'ex-page', view); h('p', 'ex-h', f, proc[0]); h('p', 'ex-p', f, et.owner + ': ' + proc[2] + ' · ' + et.manager + ': ' + proc[3])
        var ol = h('ol', 'ex-ol', f); proc[4].slice(0, 5).forEach(function (s) { h('li', '', ol, s[0] + ' – ' + s[1]) })
      },
      xlsx: function () {
        var tb = h('table', 'ex-table', view), tr = h('tr', '', h('thead', '', tb))
        et.cols.forEach(function (c) { h('th', '', tr, c) })
        var body = h('tbody', '', tb)
        proc[4].slice(0, 6).forEach(function (s, i) { var r = h('tr', '', body); h('td', '', r, String(i + 1)); h('td', '', r, s[0]); h('td', '', r, s[1]) })
      },
      bpmn: function () {
        var pre = h('pre', 'ex-code', view)
        pre.textContent = '<bpmn:process id="kasos_uzdarymas" name="' + proc[0] + '">\n' + proc[4].slice(0, 3).map(function (s, i) { return '  <bpmn:task id="t' + (i + 1) + '" name="' + s[0] + '"/>' }).join('\n') + '\n  …\n</bpmn:process>'
      }
    }
    function setFormat(k) {
      ebtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-format') === k ? 'true' : 'false') })
      view.innerHTML = ''
      renders[k]()
      view.classList.remove('is-in'); void view.offsetWidth; view.classList.add('is-in')
    }
    ebtns.forEach(function (b) { b.addEventListener('click', function () { setFormat(b.getAttribute('data-format')) }) })
    setFormat('pdf')
  }

  /* ---------------- rail: the page's own sequence flow ---------------- */
  var rail = document.querySelector('.rail')
  if (rail) {
    var links = Array.prototype.slice.call(rail.querySelectorAll('a'))
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)) })
    var token = rail.querySelector('.rail__token')
    var ticking = false
    function update() {
      ticking = false
      var mid = window.innerHeight * 0.45, active = 0
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < mid) active = i })
      links.forEach(function (a, i) { a.classList.toggle('is-here', i === active); a.classList.toggle('is-done', i < active) })
      var a = links[active]
      if (a && token) { var li = a.parentElement; token.style.transform = 'translateY(' + (li.offsetTop + li.offsetHeight / 2 - 6) + 'px)' }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update) } }, { passive: true })
    window.addEventListener('resize', update)
    update()
  }
})()
