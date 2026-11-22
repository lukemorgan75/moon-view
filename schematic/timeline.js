(function (root) {
  "use strict";

  var MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var HEBREW_EPOCH = -1373427;
  var SCALE_MIN = -3761;
  var SCALE_MAX = 4600;
  // Primitive calendar year, as he equates the periods: twelve months to a
  // year and thirty days to a month. A prophetic day is one historical year.
  var MONTH_DAYS = 30;
  var YEAR_DAYS = 12 * MONTH_DAYS;
  var RECKON = {
    times: 3 * YEAR_DAYS + YEAR_DAYS / 2,
    hour: YEAR_DAYS + MONTH_DAYS + 1
  };

  function div(a, b) { return Math.floor(a / b); }
  function mod(a, b) { return a - b * div(a, b); }

  function isGregLeap(year) {
    return mod(year, 4) === 0 && (mod(year, 100) !== 0 || mod(year, 400) === 0);
  }
  function isJulLeap(year) { return mod(year, 4) === 0; }

  function gregorianToFixed(year, month, day) {
    var y = year - 1;
    return 365 * y + div(y, 4) - div(y, 100) + div(y, 400)
      + div(367 * month - 362, 12)
      + (month <= 2 ? 0 : (isGregLeap(year) ? -1 : -2))
      + day;
  }
  function julianToFixed(year, month, day) {
    var y = year - 1;
    return -2 + 365 * y + div(y, 4)
      + div(367 * month - 362, 12)
      + (month <= 2 ? 0 : (isJulLeap(year) ? -1 : -2))
      + day;
  }

  function historicalToAstro(y) { return y > 0 ? y : y + 1; }

  function civilToFixed(cal, historicalYear, month, day) {
    var year = historicalToAstro(historicalYear);
    if (cal === "gregorian") return gregorianToFixed(year, month, day);
    return julianToFixed(year, month, day);
  }

  function hebrewLeap(year) { return mod(7 * year + 1, 19) < 7; }
  function hebrewDelay(year) {
    var months = div(235 * year - 234, 19);
    var parts = 12084 + 13753 * months;
    var day = 29 * months + div(parts, 25920);
    if (mod(3 * (day + 1), 7) < 3) day += 1;
    return day;
  }
  function hebrewYearLength(year) { return hebrewDelay(year + 1) - hebrewDelay(year); }
  function longHeshvan(year) { var n = hebrewYearLength(year); return n === 355 || n === 385; }
  function shortKislev(year) { var n = hebrewYearLength(year); return n === 353 || n === 383; }
  function hebrewNewYear(year) { return HEBREW_EPOCH + hebrewDelay(year); }

  function hebrewMonths(year) {
    var hesh = longHeshvan(year) ? 30 : 29;
    var kis = shortKislev(year) ? 29 : 30;
    var months = [
      ["Tishrei", 30], ["Heshvan", hesh], ["Kislev", kis], ["Tevet", 29], ["Shevat", 30]
    ];
    if (hebrewLeap(year)) months.push(["Adar I", 30], ["Adar II", 29]);
    else months.push(["Adar", 29]);
    months.push(["Nisan", 30], ["Iyar", 29], ["Sivan", 30], ["Tammuz", 29], ["Av", 30], ["Elul", 29]);
    return months;
  }

  function hebrewFromFixed(fixed) {
    var approx = div((fixed - HEBREW_EPOCH) * 98496, 35975351) + 1;
    var year = approx;
    while (hebrewNewYear(year) > fixed) year -= 1;
    while (hebrewNewYear(year + 1) <= fixed) year += 1;
    var day = fixed - hebrewNewYear(year) + 1;
    var months = hebrewMonths(year);
    var i = 0;
    while (i < months.length && day > months[i][1]) {
      day -= months[i][1];
      i += 1;
    }
    return { year: year, month: months[i][0], day: day };
  }

  function hebrewFromCivil(cal, historicalYear, month, day) {
    if (!month || !day) return null;
    return hebrewFromFixed(civilToFixed(cal, historicalYear, month, day));
  }

  function weekday(cal, historicalYear, month, day) {
    var rd = civilToFixed(cal, historicalYear, month, day);
    return WEEKDAYS[mod(rd - 1, 7)];
  }

  function coordOf(ev) {
    var astro = historicalToAstro(ev.y);
    var frac = 0.5;
    if (ev.m) {
      var md = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var doy = ev.d || Math.round(md[ev.m] / 2);
      var i;
      for (i = 1; i < ev.m; i++) doy += md[i];
      frac = (doy - 0.5) / 365.25;
    }
    return (astro - 1) + frac;
  }

  function historicalFromCoord(c) {
    var astro = Math.floor(c) + 1;
    return astro > 0 ? astro : astro - 1;
  }

  function yearLabel(y) {
    if (y < 0) return (-y) + " BC";
    return "AD " + y;
  }

  function monthLength(cal, historicalYear, month) {
    var md = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month !== 2) return md[month] || 30;
    var astro = historicalToAstro(historicalYear);
    var leap = cal === "gregorian" ? isGregLeap(astro) : isJulLeap(astro);
    return leap ? 29 : 28;
  }

  function calOf(ev) {
    if (ev.cal === "gregorian" || ev.cal === "julian") return ev.cal;
    if (ev.y > 1752) return "gregorian";
    return "julian";
  }

  function hebrewSpan(h1, h2) {
    if (h1.year === h2.year && h1.month === h2.month) {
      return h1.day + "–" + h2.day + " " + h1.month + " " + h1.year;
    }
    if (h1.year === h2.year) {
      return h1.day + " " + h1.month + " – " + h2.day + " " + h2.month + " " + h1.year;
    }
    return h1.day + " " + h1.month + " " + h1.year + " – " + h2.day + " " + h2.month + " " + h2.year;
  }

  function hebrewLabel(ev) {
    var cal = calOf(ev);
    if (ev.m && ev.d) {
      var h = hebrewFromCivil(cal, ev.y, ev.m, ev.d);
      if (!h) return "";
      return h.day + " " + h.month + " " + h.year;
    }
    if (ev.m) {
      var start = hebrewFromCivil(cal, ev.y, ev.m, 1);
      var end = hebrewFromCivil(cal, ev.y, ev.m, monthLength(cal, ev.y, ev.m));
      if (!start || !end) return "";
      return hebrewSpan(start, end);
    }
    var a = hebrewFromCivil(cal, ev.y, 1, 1);
    var b = hebrewFromCivil(cal, ev.y, 12, 31);
    if (!a || !b) return "";
    if (a.year === b.year) return "AM " + a.year;
    var lo = Math.min(a.year, b.year);
    var hi = Math.max(a.year, b.year);
    return "AM " + lo + "–" + hi;
  }

  function civilLabel(ev) {
    var era = yearLabel(ev.y);
    if (!ev.m) return era;
    var day = ev.d ? ev.d + " " : "";
    var cal = ev.cal === "gregorian" ? "Gregorian" : (ev.cal === "julian" ? "Julian" : "");
    var wd = "";
    if (ev.d) wd = weekday(ev.cal === "gregorian" ? "gregorian" : "julian", ev.y, ev.m, ev.d) + ", ";
    return wd + day + MONTHS[ev.m] + " " + era + (cal ? " · " + cal : "");
  }

  root.Hebrew = {
    fromCivil: hebrewFromCivil,
    weekday: weekday,
    label: hebrewLabel,
    civil: civilLabel,
    coordOf: coordOf
  };

  if (typeof document === "undefined") return;

  var DATA = (root.TIMELINE || []).slice();
  var today = new Date();
  DATA.push({
    id: "x-today",
    y: today.getFullYear(),
    m: today.getMonth() + 1,
    d: today.getDate(),
    cal: "gregorian",
    title: "Today.",
    detail: "The range asked for reaches the day this page is opened. Years above this card, up to 2060 and beyond, are there so an offset can land, and so the term he wrote down is on the scale.",
    origin: "axis",
    kind: "epoch",
    weight: 3,
    cite: "The clock of the machine opening the page.",
    why: ""
  });

  var CAT_LABEL = {
    church: "Church",
    chronicle: "Chronicle",
    temple: "Temple",
    passion: "Passion",
    empire: "Empire",
    invasion: "Invasion",
    kingdom: "Kingdoms",
    decree: "Decrees",
    sky: "Sky",
    japan: "Japan",
    quran: "Quran",
    knowledge: "Knowledge",
    reckoning: "Reckoning",
    public: "Public life",
    epoch: "Epoch"
  };
  var KIND_CAT = {
    chronicle: "chronicle",
    temple: "temple",
    passion: "passion",
    empire: "empire",
    council: "church",
    invasion: "invasion",
    kingdom: "kingdom",
    decree: "decree",
    reckoning: "reckoning",
    knowledge: "knowledge",
    epoch: "epoch"
  };
  var ALSO = {
    "n-378": ["church"],
    "n-607": ["church", "quran"],
    "n-609": ["quran"],
    "n-726": ["church"],
    "n-751": ["church"],
    "n-800": ["church"],
    "a-1790": ["church"],
    "a-1798": ["church"],
    "a-1870b": ["church"],
    "a-1929": ["church"]
  };

  function catsOf(ev) {
    var base = (ev.cats && ev.cats.length) ? ev.cats.slice() : [ev.cat || KIND_CAT[ev.kind] || ev.kind];
    (ALSO[ev.id] || []).forEach(function (c) {
      if (base.indexOf(c) < 0) base.push(c);
    });
    return base;
  }

  var state = {
    px: 2.2,
    split: true,
    sync: "offset",
    offset: 1260,
    q: "",
    cat: "",
    syncing: false,
    padTop: 0,
    padBottom: 0,
    anchor: { left: null, right: null },
    pinnedTop: { left: null, right: null },
    open: {},
    panes: [
      { key: "left", name: "Left", filter: "all" },
      { key: "right", name: "Right", filter: "all" }
    ]
  };

  function pxFromSlider(v) {
    var min = 0.09, max = 72;
    return min * Math.pow(max / min, v / 1000);
  }
  function sliderFromPx(px) {
    var min = 0.09, max = 72;
    return Math.round(1000 * Math.log(px / min) / Math.log(max / min));
  }
  function layoutPad() {
    var el = document.getElementById("scroll-left") || document.getElementById("scroll-right");
    var h = el ? el.clientHeight : 0;
    state.padTop = h * 0.32;
    state.padBottom = h > state.padTop ? h - state.padTop : 0;
  }
  function topOf(coord) { return state.padTop + (SCALE_MAX - coord) * state.px; }
  function coordAt(top) { return SCALE_MAX - (top - state.padTop) / state.px; }
  function sheetHeight() { return state.padTop + (SCALE_MAX - SCALE_MIN) * state.px + state.padBottom; }
  function hairCoord(scroller) {
    if (!scroller || !state.px) return SCALE_MAX;
    return SCALE_MAX - scroller.scrollTop / state.px;
  }
  function scrollTopFor(coord, viewPx) {
    var exact = state.padTop + (SCALE_MAX - coord) * state.px - viewPx;
    var want = historicalFromCoord(coord);
    var lo = Math.floor(exact);
    var hi = Math.ceil(exact);
    function at(t) { return SCALE_MAX - (t + viewPx - state.padTop) / state.px; }
    function better(t) {
      var c = at(t);
      return { t: t, err: Math.abs(c - coord), year: historicalFromCoord(c) === want };
    }
    var a = better(lo), b = better(hi);
    if (a.year !== b.year) return a.year ? lo : hi;
    return a.err <= b.err ? lo : hi;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;";
    });
  }

  function matches(ev, pane) {
    if (ev.origin !== "axis") {
      if (pane.filter === "newton" && ev.origin !== "newton") return false;
      if (pane.filter === "added" && ev.origin !== "added") return false;
      if (state.cat && catsOf(ev).indexOf(state.cat) < 0) return false;
    }
    if (!state.q) return true;
    var labels = catsOf(ev).map(function (c) { return CAT_LABEL[c] || c; }).join(" ");
    var hay = (ev.title + " " + (ev.detail || "") + " " + (ev.cite || "") + " " + (ev.why || "") + " " + ev.kind + " " + labels + " " + yearLabel(ev.y)).toLowerCase();
    return hay.indexOf(state.q) !== -1;
  }

  function cardHtml(ev) {
    var heb = hebrewLabel(ev);
    return '<article class="card origin-' + ev.origin + '" data-id="' + ev.id + '">'
      + '<p class="when"><span>' + escapeHtml(civilLabel(ev)) + '</span><span class="heb">' + escapeHtml(heb) + '</span></p>'
      + '<h3>' + escapeHtml(ev.title) + '</h3>'
      + (ev.detail ? '<p>' + escapeHtml(ev.detail) + '</p>' : '')
      + (ev.why ? '<p class="why">' + escapeHtml(ev.why) + '</p>' : '')
      + '<p class="cite">' + escapeHtml(ev.cite || '') + '</p>'
      + '</article>';
  }

  function ticks() {
    var step = state.px >= 28 ? 1 : state.px >= 8 ? 10 : state.px >= 2 ? 50 : state.px >= 0.6 ? 100 : 500;
    var html = "";
    var y;
    for (y = 4000; y >= -4000; y -= step) {
      if (y === 0) continue;
      var c = coordOf({ y: y, m: 0, d: 0 });
      if (c < SCALE_MIN || c > SCALE_MAX) continue;
      html += '<div class="tick" style="top:' + topOf(c).toFixed(1) + 'px">' + yearLabel(y) + '</div>';
    }
    return html;
  }

  function renderPane(pane) {
    var scroller = document.getElementById("scroll-" + pane.key);
    if (!scroller) return;
    layoutPad();
    var kept = scroller.scrollTop;
    var events = DATA.filter(function (ev) { return matches(ev, pane); });
    events.sort(function (a, b) { return coordOf(b) - coordOf(a); });
    var placed = events.map(function (ev) { return { ev: ev, top: topOf(coordOf(ev)) }; });
    var html = ticks();
    placed.forEach(function (p) {
      html += '<div class="slot" style="top:' + p.top.toFixed(1) + 'px">' + cardHtml(p.ev) + '</div>';
    });
    var sheet = scroller.querySelector(".sheet");
    sheet.style.height = sheetHeight().toFixed(1) + "px";
    sheet.innerHTML = html;
    scroller.scrollTop = kept;
    packLanes(sheet);
  }

  function packLanes(sheet) {
    var rowH = 240;
    var slots = Array.prototype.slice.call(sheet.querySelectorAll(".slot"));
    var items = slots.map(function (el) {
      return { el: el, top: parseFloat(el.style.top), h: el.offsetHeight };
    });
    items.sort(function (a, b) { return a.top - b.top; });
    var i = 0;
    while (i < items.length) {
      var it = items[i];
      var next = items[i + 1];
      if (!next || next.top >= it.top + Math.min(it.h, rowH) - 4) {
        i += 1;
        continue;
      }
      var rowTop = it.top;
      var members = [];
      while (i < items.length && items[i].top < rowTop + rowH) {
        members.push(items[i]);
        i += 1;
      }
      if (members.length < 2) continue;
      var lane = document.createElement("div");
      lane.className = "lane";
      lane.style.top = rowTop.toFixed(1) + "px";
      members.forEach(function (m) {
        var card = m.el.querySelector(".card");
        if (card) lane.appendChild(card);
        m.el.remove();
      });
      sheet.appendChild(lane);
    }
    var boxes = Array.prototype.slice.call(sheet.querySelectorAll(".slot, .lane"));
    boxes.sort(function (a, b) { return parseFloat(a.style.top) - parseFloat(b.style.top); });
    boxes.forEach(function (box, n) {
      var below = boxes[n + 1];
      if (!below) return;
      var limit = parseFloat(below.style.top) - parseFloat(box.style.top) - 8;
      if (limit < 64) return;
      var card = box.classList.contains("slot") ? box.querySelector(".card") : null;
      if (card && card.offsetHeight > limit) {
        card.style.maxHeight = limit.toFixed(0) + "px";
        card.style.overflow = "auto";
      }
    });
  }

  function readout(pane) {
    var scroller = document.getElementById("scroll-" + pane.key);
    if (!scroller) return;
    var c = hairCoord(scroller);
    if (state.anchor[pane.key] != null && state.pinnedTop[pane.key] != null
        && Math.abs(scroller.scrollTop - state.pinnedTop[pane.key]) <= 1) {
      c = state.anchor[pane.key];
    }
    var y = historicalFromCoord(c);
    var el = document.getElementById("read-" + pane.key);
    if (!el) return;
    var sample = { y: y, m: 0, d: 0, cal: "julian" };
    el.innerHTML = yearLabel(y) + ' <span>' + escapeHtml(hebrewLabel(sample)) + '</span>';
  }

  function scrollToCoord(pane, coord) {
    var scroller = document.getElementById("scroll-" + pane.key);
    if (!scroller) return;
    var top = scrollTopFor(coord, state.padTop);
    var max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (top < 0) top = 0;
    if (top > max) top = max;
    if (scroller.scrollTop !== top) scroller.scrollTop = top;
    state.pinnedTop[pane.key] = scroller.scrollTop;
    state.anchor[pane.key] = top === scrollTopFor(coord, state.padTop) ? coord : hairCoord(scroller);
  }

  function coordInView(pane) {
    var scroller = document.getElementById("scroll-" + pane.key);
    return hairCoord(scroller);
  }

  function place(fromKey) {
    state.syncing = true;
    var left = state.panes[0], right = state.panes[1];
    if (state.split && state.sync === "offset") {
      if (fromKey === "right") {
        scrollToCoord(right, state.anchor.right);
        scrollToCoord(left, state.anchor.right - state.offset);
      } else {
        scrollToCoord(left, state.anchor.left);
        scrollToCoord(right, state.anchor.left + state.offset);
      }
    } else if (fromKey === "right") {
      scrollToCoord(right, state.anchor.right);
    } else if (fromKey === "left") {
      scrollToCoord(left, state.anchor.left);
    } else {
      scrollToCoord(left, state.anchor.left);
      if (state.split && state.anchor.right != null) scrollToCoord(right, state.anchor.right);
    }
    state.syncing = false;
    readout(left);
    if (state.split) readout(right);
  }

  function relayout(fromKey) {
    state.syncing = true;
    state.panes.forEach(function (pane, i) {
      if (!state.split && i > 0) return;
      renderPane(pane);
    });
    state.syncing = false;
    place(fromKey);
  }

  function guessPort() {
    var el = document.getElementById("scroll-left");
    var h = el ? el.clientHeight : 0;
    if (h >= 80 && h <= window.innerHeight + 1) return h;
    var fallback = window.innerHeight - 220;
    return fallback >= 240 ? fallback : 480;
  }

  function whenReady(fn) {
    var tries = 0;
    (function attempt() {
      var el = document.getElementById("scroll-left");
      var h = el ? el.clientHeight : 0;
      if (h >= 80 && h <= window.innerHeight + 1) { fn(); return; }
      if (++tries < 40) requestAnimationFrame(attempt);
      else fn();
    })();
  }

  function zoomAt(newPx, pane, coord, viewPx) {
    state.px = Math.max(0.09, Math.min(72, newPx));
    var slider = document.getElementById("zoom");
    slider.value = String(Math.max(0, Math.min(1000, sliderFromPx(state.px))));
    state.open = {};
    state.syncing = true;
    state.panes.forEach(function (p, i) {
      if (!state.split && i > 0) return;
      renderPane(p);
    });
    var scroller = document.getElementById("scroll-" + pane.key);
    var top = scrollTopFor(coord, viewPx);
    var max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    var used = Math.max(0, Math.min(max, top));
    if (scroller.scrollTop !== used) scroller.scrollTop = used;
    var hairPx = scroller.clientHeight * 0.32;
    state.pinnedTop[pane.key] = scroller.scrollTop;
    state.anchor[pane.key] = used === top ? coord + (viewPx - hairPx) / state.px : hairCoord(scroller);
    if (state.split && state.sync === "offset") {
      var other = pane.key === "left" ? state.panes[1] : state.panes[0];
      var base = state.anchor[pane.key];
      scrollToCoord(other, pane.key === "left" ? base + state.offset : base - state.offset);
    } else if (state.split) {
      var otherPane = pane.key === "left" ? state.panes[1] : state.panes[0];
      if (state.anchor[otherPane.key] != null) scrollToCoord(otherPane, state.anchor[otherPane.key]);
    }
    state.syncing = false;
    readout(state.panes[0]);
    if (state.split) readout(state.panes[1]);
    status();
  }

  function applyOffset(fromKey) {
    if (state.sync !== "offset" || !state.split || state.syncing) return;
    state.syncing = true;
    var left = state.panes[0], right = state.panes[1];
    if (fromKey === "right") scrollToCoord(left, coordInView(right) - state.offset);
    else scrollToCoord(right, coordInView(left) + state.offset);
    readout(left); readout(right);
    state.syncing = false;
  }

  function onScroll(pane) {
    var scroller = document.getElementById("scroll-" + pane.key);
    if (!scroller || !scroller.isConnected) return;
    readout(pane);
    if (state.syncing) return;
    if (state.pinnedTop[pane.key] != null && Math.abs(scroller.scrollTop - state.pinnedTop[pane.key]) <= 1) return;
    state.anchor[pane.key] = hairCoord(scroller);
    state.pinnedTop[pane.key] = scroller.scrollTop;
    applyOffset(pane.key);
  }

  function buildPanes() {
    var rootEl = document.getElementById("panes");
    rootEl.classList.toggle("is-split", state.split);
    rootEl.innerHTML = state.panes.filter(function (p, i) { return state.split || i === 0; }).map(function (pane) {
      return '<section class="pane" id="pane-' + pane.key + '">'
        + '<div class="pane-bar">'
        + '<div><h2>' + pane.name + '</h2><p class="readout" id="read-' + pane.key + '"></p></div>'
        + '<div class="go">'
        + '<select id="filter-' + pane.key + '" aria-label="Which events, ' + pane.name + '">'
        + '<option value="all">All</option>'
        + '<option value="newton">Newton’s</option>'
        + '<option value="added">Added</option>'
        + '</select>'
        + '<input id="go-' + pane.key + '" type="text" placeholder="800 or 457 BC" aria-label="Go to a year, ' + pane.name + '">'
        + '<button type="button" class="chip" id="gobtn-' + pane.key + '">Go</button>'
        + '</div></div>'
        + '<div class="port"><div class="scroller" id="scroll-' + pane.key + '"><div class="sheet"></div></div>'
        + '<div class="hair"></div></div>'
        + '</section>';
    }).join("");
    state.panes.forEach(function (pane, i) {
      if (!state.split && i > 0) return;
      var filter = document.getElementById("filter-" + pane.key);
      filter.value = pane.filter;
      filter.addEventListener("change", function () {
        pane.filter = filter.value;
        state.syncing = true;
        renderPane(pane);
        state.syncing = false;
        readout(pane);
        status();
      });
      var go = function () {
        var y = parseYear(document.getElementById("go-" + pane.key).value);
        if (y == null) return;
        state.anchor[pane.key] = coordOf({ y: y, m: 0, d: 0 });
        place(pane.key);
      };
      document.getElementById("gobtn-" + pane.key).addEventListener("click", go);
      document.getElementById("go-" + pane.key).addEventListener("keydown", function (event) {
        if (event.key === "Enter") go();
      });
      document.getElementById("scroll-" + pane.key).addEventListener("scroll", function (event) {
        if (!event.currentTarget.isConnected) return;
        onScroll(pane);
      });
      renderPane(pane);
    });
  }

  function parseYear(s) {
    if (!s) return null;
    var t = s.trim().toLowerCase();
    if (!t) return null;
    var bc = /b\.?\s*c/.test(t);
    var n = parseInt(t.replace(/[^\d-]/g, ""), 10);
    if (!n) return null;
    if (bc) return -Math.abs(n);
    return n;
  }

  function status() {
    var nNewton = DATA.filter(function (e) { return e.origin === "newton"; }).length;
    var nAdded = DATA.filter(function (e) { return e.origin === "added"; }).length;
    var parts = state.panes.filter(function (p, i) { return state.split || i === 0; }).map(function (pane) {
      var n = DATA.filter(function (e) { return e.origin !== "axis" && matches(e, pane); }).length;
      return pane.name + " " + n;
    });
    var mid = state.cat ? " · " + (CAT_LABEL[state.cat] || state.cat) : " showing";
    document.getElementById("status").textContent = parts.join(" · ") + mid + " · " + nNewton + " dated by Newton · " + nAdded + " added · Hebrew dates are the fixed calendar";
  }

  function offsetSentence(n) {
    var abs = Math.abs(n);
    var body = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (n === 0) return "The panes show the same year.";
    var line = "The right pane is the left pane " + (n < 0 ? "minus " : "plus ") + body + " years.";
    if (abs === RECKON.times) {
      line += " Time, times, and half a time: three years and a half, twelve months of thirty days, 1,260 days, each day a year.";
    } else if (abs === RECKON.hour) {
      line += " An hour, a day, a month, and a year: 360 + 30 + 1 days, each day a year.";
    } else if (abs === 1290 || abs === 1335 || abs === 2300) {
      line += " That many prophetic days, each day a year.";
    } else if (abs === 49 || abs === 434 || abs === 490) {
      line += " Weeks of years, seven years to a week.";
    }
    return line;
  }

  function setOffset(n) {
    if (!isFinite(n)) return;
    state.offset = n;
    document.getElementById("custom-offset").value = String(n);
    document.querySelectorAll("#offset-chips .chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", Number(chip.getAttribute("data-off")) === Math.abs(n) ? "true" : "false");
    });
    document.getElementById("off-later").setAttribute("aria-pressed", n >= 0 ? "true" : "false");
    document.getElementById("off-earlier").setAttribute("aria-pressed", n < 0 ? "true" : "false");
    document.getElementById("offset-note").textContent = state.sync === "offset"
      ? offsetSentence(n)
      : "The panes scroll separately. The offset is kept for when you link them.";
    if (state.sync === "offset") applyOffset("left");
  }

  function init() {
    document.querySelectorAll("#offset-chips [data-reckon]").forEach(function (chip) {
      chip.setAttribute("data-off", String(RECKON[chip.getAttribute("data-reckon")]));
    });
    state.offset = RECKON.times;
    state.anchor.left = coordOf({ y: 800, m: 12, d: 25 });
    state.anchor.right = state.anchor.left + state.offset;
    buildPanes();
    status();
    whenReady(function () {
      var port = guessPort();
      state.px = Math.max(0.4, Math.min(72, port / 420));
      document.getElementById("zoom").value = String(Math.max(0, Math.min(1000, sliderFromPx(state.px))));
      relayout("left");
      status();
    });

    document.getElementById("zoom").addEventListener("input", function (event) {
      var scroller = document.getElementById("scroll-left");
      zoomAt(pxFromSlider(Number(event.target.value)), state.panes[0], state.anchor.left, scroller.clientHeight * 0.32);
    });
    document.getElementById("zoom-in").addEventListener("click", function () {
      var scroller = document.getElementById("scroll-left");
      zoomAt(state.px * 1.4, state.panes[0], state.anchor.left, scroller.clientHeight * 0.32);
    });
    document.getElementById("zoom-out").addEventListener("click", function () {
      var scroller = document.getElementById("scroll-left");
      zoomAt(state.px / 1.4, state.panes[0], state.anchor.left, scroller.clientHeight * 0.32);
    });
    document.getElementById("zoom-fit").addEventListener("click", function () {
      var scroller = document.getElementById("scroll-left");
      var span = coordOf({ y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() }) - SCALE_MIN;
      zoomAt(scroller.clientHeight / span, state.panes[0], coordOf({ y: -1000, m: 0, d: 0 }), scroller.clientHeight * 0.32);
    });
    document.getElementById("split").addEventListener("click", function () {
      state.anchor.left = coordInView(state.panes[0]);
      if (state.split) state.anchor.right = coordInView(state.panes[1]);
      state.split = !state.split;
      document.getElementById("split").setAttribute("aria-pressed", state.split ? "true" : "false");
      document.getElementById("split").textContent = state.split ? "Two panes" : "One pane";
      buildPanes();
      relayout(state.split && state.sync === "offset" ? "left" : (state.split ? undefined : "left"));
      status();
    });
    document.getElementById("sync").addEventListener("click", function (event) {
      var button = event.target.closest("[data-sync]");
      if (!button) return;
      state.sync = button.getAttribute("data-sync");
      document.querySelectorAll("#sync button").forEach(function (b) {
        b.setAttribute("aria-selected", b === button ? "true" : "false");
      });
      setOffset(state.offset);
    });
    document.getElementById("offset-dir").addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      var mag = Math.abs(state.offset);
      setOffset(button.id === "off-earlier" ? -mag : mag);
    });
    document.getElementById("offset-chips").addEventListener("click", function (event) {
      var chip = event.target.closest("[data-off]");
      if (!chip) return;
      var mag = Number(chip.getAttribute("data-off"));
      setOffset(state.offset < 0 ? -mag : mag);
    });
    document.getElementById("custom-offset").addEventListener("change", function (event) {
      setOffset(Number(event.target.value));
    });
    document.getElementById("q").addEventListener("input", function (event) {
      state.q = event.target.value.trim().toLowerCase();
      state.syncing = true;
      state.panes.forEach(function (pane, i) {
        if (!state.split && i > 0) return;
        renderPane(pane);
      });
      state.syncing = false;
      readout(state.panes[0]);
      if (state.split) readout(state.panes[1]);
      status();
    });
    document.getElementById("cat").addEventListener("change", function (event) {
      state.cat = event.target.value;
      state.syncing = true;
      state.panes.forEach(function (pane, i) {
        if (!state.split && i > 0) return;
        renderPane(pane);
      });
      state.syncing = false;
      readout(state.panes[0]);
      if (state.split) readout(state.panes[1]);
      status();
    });
    var fullBtn = document.getElementById("fullscreen");
    fullBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });
    document.addEventListener("fullscreenchange", function () {
      var on = !!document.fullscreenElement;
      document.body.classList.toggle("is-fullscreen", on);
      fullBtn.textContent = on ? "Exit" : "Full screen";
      fullBtn.setAttribute("aria-pressed", on ? "true" : "false");
      setTimeout(function () {
        relayout(state.split && state.sync === "offset" ? "left" : undefined);
      }, 60);
    });
    document.getElementById("sources-open").addEventListener("click", function () {
      document.getElementById("sources").showModal();
    });
    document.getElementById("panes").addEventListener("wheel", function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      var scroller = event.target.closest(".scroller") || document.getElementById("scroll-left");
      var pane = state.panes[scroller.id === "scroll-right" ? 1 : 0];
      var rect = scroller.getBoundingClientRect();
      var viewPx = event.clientY - rect.top;
      var coord = coordAt(scroller.scrollTop + viewPx);
      zoomAt(state.px * (event.deltaY > 0 ? 0.9 : 1.12), pane, coord, viewPx);
    }, { passive: false });
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        relayout(state.split && state.sync === "offset" ? "left" : undefined);
      }, 60);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : globalThis);
