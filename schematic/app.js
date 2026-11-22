(function () {
  const KJV = window.KJV;
  let D = window.DIAGRAM;
  const TOTAL = KJV.reduce(function (n, ch) { return n + ch.length; }, 0);

  const COLS = {};
  const meta = new Map();
  const moments = [];
  const homeOf = new Map();

  function parseRange(spec) {
    const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(spec);
    if (!m) throw new Error("Bad range " + spec);
    const c = +m[1], a = +m[2], b = m[3] ? +m[3] : a;
    const verses = [];
    for (let v = a; v <= b; v++) verses.push({ c: c, v: v, id: c + ":" + v });
    return verses;
  }

  function addMoment(row, kind) {
    const idx = moments.length;
    const covers = (addMoment.active || []).filter(function (item) { return item.until > idx; }).map(function (item) { return item.cell; });
    const moment = {
      id: row.id,
      year: row.year || "",
      era: row.era || "",
      kicker: row.kicker || "",
      tone: row.tone || "",
      kind: kind,
      cells: row.cells,
      covers: covers
    };
    moments.push(moment);
    row.cells.forEach(function (cell) {
      meta.set(cell.id, { cell: cell, moment: moment, col: cell.col ? COLS[cell.col] : null });
      (cell.home || []).forEach(function (spec) {
        parseRange(spec).forEach(function (verse) { homeOf.set(verse.id, cell.id); });
      });
      const span = cell.span || 1;
      if (span > 1) {
        addMoment.active = addMoment.active || [];
        addMoment.active.push({ cell: cell, until: idx + span });
      }
    });
  }

  function indexDiagram() {
    Object.keys(COLS).forEach(function (key) { delete COLS[key]; });
    meta.clear();
    moments.length = 0;
    homeOf.clear();
    addMoment.active = [];
    D.upperColumns.forEach(function (c, i) { COLS[c.id] = Object.assign({ index: i, half: c.id === "drag" ? "eat" : c.id === "ch" ? "church" : "open" }, c); });
    D.lowerColumns.forEach(function (c, i) { COLS[c.id] = Object.assign({ index: i }, c); });
    addMoment(D.bands.prologue, "band");
    addMoment(D.bands.throne, "band");
    addMoment(D.bands.hinge, "band");
    D.upper.forEach(function (row) { addMoment(row, "upper"); });
    D.lower.forEach(function (row) { addMoment(row, "lower"); });
    addMoment(D.bands.epilogue, "band");
  }

  const state = { view: "diagram", chart: "his", selected: null, reader: false, hover: null };
  indexDiagram();

  const stage = document.getElementById("stage");
  const reader = document.getElementById("reader");
  const status = document.getElementById("status");
  const mapBody = document.getElementById("map-body");
  const about = document.getElementById("about");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* Church of each citation on the Yahuda synopsis. The colors are the
     seven he names, in the order of the letters. A cell he leaves outside
     those columns keeps a white chip. Two chips mean he splits the verse. */
  const CHURCHES = {
    Ephesus: "#C00000",
    Smyrna: "#FFBE00",
    Pergamos: "#FFFF00",
    Thyatira: "#5DFF00",
    Sardis: "#00A9FF",
    Philadelphia: "#0028FF",
    Laodicea: "#8200B4"
  };
  const CELL_CHURCH = {
    ephesus: ["Ephesus"], "seal-1": ["Ephesus"], "seal-2": ["Ephesus"],
    "seal-3": ["Ephesus"], "seal-4": ["Ephesus"], "drag-1": ["Ephesus"],
    "winds-held": ["Ephesus"], "t1-wind": ["Ephesus"], "t2-wind": ["Ephesus"],
    "t3-wind": ["Ephesus"], "t4-wind": ["Ephesus"], "fire-cast": ["Ephesus"],
    "t1-trump": ["Ephesus"], "t2-trump": ["Ephesus"], "t3-trump": ["Ephesus"],
    "t4-trump": ["Ephesus"], "t5-trump": ["Ephesus"], "t6-trump": ["Ephesus"],
    "t7-palm": ["Ephesus"],
    smyrna: ["Smyrna"], "seal-5": ["Smyrna"], "drag-2": ["Smyrna"],
    "angel-stands": ["Smyrna"], lion: ["Smyrna"],
    "t1-thun": ["Smyrna"], "t2-thun": ["Smyrna"], "t3-thun": ["Smyrna"],
    "t4-thun": ["Smyrna"], "t5-thun": ["Smyrna"], "t6-thun": ["Smyrna"],
    silence: ["Smyrna", "Philadelphia"],
    pergamum: ["Pergamos"], "seal-6": ["Pergamos"], "drag-3": ["Pergamos"],
    "t7-time": ["Pergamos"],
    rev10: ["Smyrna", "Pergamos"],
    thyatira: ["Thyatira"], "drag-4": ["Thyatira"], measure: ["Thyatira"],
    "sack-wit": ["Thyatira"], "t1-wit": ["Thyatira"], "t2-wit": ["Thyatira"],
    "cry-city": ["Thyatira"], "t7-trump": ["Thyatira"],
    "turn-wit": ["Laodicea", "Thyatira"],
    sardis: ["Sardis"], "drag-5": ["Sardis"], "beast-rises": ["Sardis"],
    zion: ["Sardis"], "t1-throne": ["Sardis"], "turn-gospel": ["Sardis"],
    "cry-bab": ["Sardis"], "t7-harvest": ["Sardis"],
    "sack-woman": ["Sardis", "Thyatira"],
    philadelphia: ["Philadelphia"], "drag-6": ["Philadelphia"],
    "vials-appear": ["Philadelphia"], "sea-glass": ["Philadelphia"],
    "t1-vial": ["Philadelphia"], "t2-vial": ["Philadelphia"],
    "t3-vial": ["Philadelphia"], "t4-vial": ["Philadelphia"],
    "t5-vial": ["Philadelphia"], "t6-vial": ["Philadelphia"],
    "turn-frogs": ["Philadelphia"],
    laodicea: ["Laodicea"], "drag-7": ["Laodicea"],
    "beast-ascends": ["Laodicea"], "t1-eighth": ["Laodicea"],
    "sack-whore": ["Laodicea"], "turn-eat": ["Laodicea"],
    "cry-fall": ["Laodicea"], "t7-vial": ["Laodicea"], "t7-end": ["Laodicea"],
    "seal-rest": ["Thyatira", "Sardis", "Philadelphia", "Laodicea"]
  };

  function churchNames(id) {
    return CELL_CHURCH[id] || [];
  }

  function churchChip(name, hex) {
    const chip = el("span", "church-ref", name);
    const swatch = el("i");
    swatch.style.background = hex;
    chip.insertBefore(swatch, chip.firstChild);
    return chip;
  }

  function churchRefs(id) {
    const row = el("span", "church-refs");
    const names = churchNames(id);
    if (!names.length) {
      row.appendChild(churchChip("Not in a church column", "#FFFFFF"));
      return row;
    }
    names.forEach(function (name) { row.appendChild(churchChip(name, CHURCHES[name])); });
    return row;
  }

  function versePos(c, v) {
    let n = v;
    for (let i = 0; i < c - 1; i++) n += KJV[i].length;
    return n;
  }

  function halfClass(cell) {
    if (cell.half) return "half-" + cell.half;
    const info = meta.get(cell.id);
    if (!info || !info.col) return "half-open";
    return "half-" + (info.col.half || "open");
  }

  function cellLabel(id) {
    const info = meta.get(id);
    if (!info) return id;
    const col = info.col ? info.col.title : info.cell.ref;
    const when = info.moment.era || info.moment.kicker || info.moment.year;
    return when ? when + " · " + col : col;
  }

  function kinIds(id) {
    const ids = new Set();
    moments.forEach(function (moment) {
      const hit = moment.cells.some(function (c) { return c.id === id; })
        || moment.covers.some(function (c) { return c.id === id; });
      if (!hit) return;
      moment.cells.forEach(function (c) { ids.add(c.id); });
      moment.covers.forEach(function (c) { ids.add(c.id); });
    });
    return ids;
  }

  function rangesOf(cell, key) {
    const out = [];
    (cell[key] || []).forEach(function (spec) { parseRange(spec).forEach(function (v) { out.push(v); }); });
    return out;
  }

  function readingOf(id) {
    const reading = (window.READINGS && window.READINGS[id]) || null;
    if (!reading || state.chart !== "adjusted" || id !== "t7-end") return reading;
    const copy = { state: reading.state, text: reading.text.slice() };
    copy.text[0] = "This station is the millennium day. In the Observations he calls it the millennium, or thousand years, which are with God but as a day. It is the eighth part of the seventh seal: the silence was the first part, and the seventh trumpet is the eighth. He gives that trumpet no year-length. " + copy.text[0];
    return copy;
  }

  function readingLabel(reading) {
    if (reading.state === "ahead") return "His reading · not yet fulfilled";
    if (reading.state === "open") return "His reading · unfinished when he wrote";
    return "His reading";
  }

  function stateTag(id) {
    const reading = readingOf(id);
    if (!reading || reading.state === "past") return null;
    if (reading.state === "ahead") return el("span", "tag ahead", "Not yet fulfilled");
    return el("span", "tag open", "Unfinished when he wrote");
  }

  function makeCellButton(cell) {
    const btn = el("button", "cell " + halfClass(cell));
    btn.type = "button";
    btn.dataset.cell = cell.id;
    btn.id = "cell-" + cell.id;
    if (!(cell.home && cell.home.length)) btn.classList.add("marker");
    const tag = stateTag(cell.id);
    if (tag) btn.appendChild(tag);
    btn.appendChild(churchRefs(cell.id));
    const ref = el("span", "ref", cell.ref);
    const excerpt = el("span", "ex", cell.excerpt);
    const when = cell.when ? el("span", "when", cell.when) : null;
    const names = churchNames(cell.id);
    if (names.length === 1) {
      const hex = CHURCHES[names[0]];
      ref.style.color = hex;
      excerpt.style.color = hex;
      if (when) when.style.color = hex;
    }
    btn.appendChild(ref);
    btn.appendChild(excerpt);
    if (when) btn.appendChild(when);
    btn.addEventListener("click", function () {
      if (state.selected === cell.id && state.reader) closeReader();
      else select(cell.id, { reader: true });
    });
    return btn;
  }

  function renderYear(row) {
    const y = el("div", "year");
    y.appendChild(el("b", null, row.year || ""));
    if (row.era) y.appendChild(el("span", null, row.era));
    return y;
  }

  function renderBand(row) {
    const band = el("section", "band");
    band.dataset.moment = row.id;
    const year = renderYear(row);
    year.style.gridRow = row.kicker ? "1 / span 2" : "1";
    band.appendChild(year);
    if (row.kicker) band.appendChild(el("p", "kicker", row.kicker));
    const cells = el("div", "band-cells");
    row.cells.forEach(function (cell) { cells.appendChild(makeCellButton(cell)); });
    band.appendChild(cells);
    return band;
  }

  function renderGrid(title, note, columns, rows) {
    const wrap = el("section", "");
    const h = el("h2", "section-title");
    h.textContent = title + " ";
    if (note) h.appendChild(el("span", null, note));
    wrap.appendChild(h);
    const grid = el("div", "grid " + (columns === D.upperColumns ? "upper" : "lower"));
    const freeze = el("div", "freeze");
    const headRow = 2;

    if (columns === D.lowerColumns) {
      const left = el("div", "super open", "By opening the seals · Rev 7–11");
      left.style.gridColumn = "2 / span 4";
      left.style.gridRow = "1";
      const right = el("div", "super eat", "By eating the book · the same years, from 11:19");
      right.style.gridColumn = "6 / span 3";
      right.style.gridRow = "1";
      freeze.appendChild(left);
      freeze.appendChild(right);
    } else {
      const left = el("div", "super open", "The prophecy by opening the seals");
      left.style.gridColumn = "2 / span 2";
      left.style.gridRow = "1";
      const right = el("div", "super eat", "The other telling · Rev 12, in these same years");
      right.style.gridColumn = "4";
      right.style.gridRow = "1";
      freeze.appendChild(left);
      freeze.appendChild(right);
    }

    const corner = el("div", "colhead");
    corner.style.gridColumn = "1";
    corner.style.gridRow = String(headRow);
    corner.appendChild(el("strong", null, "When"));
    corner.appendChild(el("em", null, "Not a scale of years"));
    freeze.appendChild(corner);

    columns.forEach(function (col, i) {
      const head = el("div", "colhead " + (col.half === "eat" ? "eat" : "open"));
      head.style.gridColumn = String(i + 2);
      head.style.gridRow = String(headRow);
      head.appendChild(el("strong", null, col.title));
      head.appendChild(el("em", null, col.sub));
      freeze.appendChild(head);
    });
    if (state.chart === "adjusted" && columns === D.lowerColumns) {
      const counts = el("div", "colhead");
      counts.style.gridColumn = "9";
      counts.style.gridRow = String(headRow);
      counts.appendChild(el("strong", null, "Counts"));
      counts.appendChild(el("em", null, "1,260"));
      counts.appendChild(el("em", null, "then 1,290"));
      counts.appendChild(el("em", null, "then 1,335"));
      freeze.appendChild(counts);
    }
    grid.appendChild(freeze);

    rows.forEach(function (row, r) {
      const gridRow = String(r + 2);
      if (row.tone) {
        const wash = el("div", "wash " + row.tone);
        wash.style.gridColumn = state.chart === "adjusted" && columns === D.lowerColumns ? "1 / 10" : "1 / -1";
        wash.style.gridRow = gridRow;
        grid.appendChild(wash);
      }
      const year = renderYear(row);
      year.style.gridColumn = "1";
      year.style.gridRow = gridRow;
      grid.appendChild(year);
      row.cells.forEach(function (cell) {
        const col = COLS[cell.col];
        if (!col) return;
        const btn = makeCellButton(cell);
        const start = r + 2;
        const span = cell.span || 1;
        btn.style.gridColumn = String(col.index + 2);
        btn.style.gridRow = span > 1 ? start + " / span " + span : String(start);
        grid.appendChild(btn);
      });
    });

    if (state.chart === "adjusted" && columns === D.lowerColumns) {
      const ids = rows.map(function (row) { return row.id; });
      const from = ids.indexOf("t5");
      const to = ids.indexOf("turn");
      if (from >= 0 && to >= from) {
        const body = to - from + 1;
        const rail = el("div", "rail");
        rail.style.gridColumn = "9";
        rail.style.gridRow = (from + 2) + " / span " + (body + 2);
        rail.appendChild(bar("y1260", "1,260", "Rev 10", "1", body));
        rail.appendChild(bar("y1290", "1,290", "+30", "2", body + 1));
        rail.appendChild(bar("y1335", "1,335", "+45", "3", body + 2));
        grid.appendChild(rail);
      }
    }

    wrap.appendChild(grid);
    if (state.chart === "adjusted" && columns === D.lowerColumns) {
      wrap.appendChild(el("p", "range-note", "The 1,260 bar runs from the first woe to Revelation 10, which is the mark of its end. The 1,290 and the 1,335 are drawn longer by thirty years, then forty-five, wide enough to read. They are not further wars. Yahuda MS 7.3, after 1705. The time, times, and half a time did not commence before 800, nor after Gregory VII, 1084, and do not end before 2060, nor after the damaged figure printed as [2344]. The 1,290 days did not commence before 842, nor after that reign. Their difference from the 1,335 days is a part of the seven weeks. The slip says the 1,290 days do not begin before 2090 nor after 1374. Snobelen reads that as an end, and 1374 as 2374. The sentence stays as written."));
    }
    return wrap;
  }

  function bar(className, count, tail, column, span) {
    const node = el("div", "bar " + className);
    node.style.gridColumn = column;
    node.style.gridRow = "1 / span " + span;
    node.appendChild(el("b", null, count));
    node.appendChild(el("span", null, tail));
    return node;
  }

  function scriptureNodes(verses) {
    const frag = document.createDocumentFragment();
    let lastC = 0;
    let block = null;
    verses.forEach(function (verse) {
      if (verse.c !== lastC) {
        block = el("div", "");
        block.appendChild(el("h3", null, "Revelation " + verse.c));
        frag.appendChild(block);
        lastC = verse.c;
      }
      const p = el("p");
      p.appendChild(el("sup", null, String(verse.v)));
      p.appendChild(document.createTextNode(KJV[verse.c - 1][verse.v - 1]));
      block.appendChild(p);
    });
    return frag;
  }

  function fillReader(id) {
    const info = meta.get(id);
    reader.replaceChildren();
    if (!info) return;
    const cell = info.cell;
    const top = el("div", "reader-top");
    const eye = el("p", "eyebrow", cellLabel(id));
    const close = el("button", "text-btn", "Close");
    close.type = "button";
    close.addEventListener("click", closeReader);
    top.appendChild(eye);
    top.appendChild(close);
    reader.appendChild(top);
    reader.appendChild(churchRefs(id));
    const heading = el("h2", null, cell.excerpt);
    const whenLine = cell.when ? el("p", "when", cell.when) : null;
    const names = churchNames(id);
    if (names.length === 1) {
      const hex = CHURCHES[names[0]];
      heading.style.color = hex;
      if (whenLine) whenLine.style.color = hex;
    }
    reader.appendChild(heading);
    if (whenLine) reader.appendChild(whenLine);

    const home = rangesOf(cell, "home");
    const also = rangesOf(cell, "also");
    const script = el("div", "scripture");
    if (names.length === 1) script.style.color = CHURCHES[names[0]];
    if (home.length) {
      script.appendChild(scriptureNodes(home));
    } else if (also.length) {
      script.appendChild(el("p", "note", "He gives this station no words of its own. The line he is pointing at stays where his order already read it."));
      script.appendChild(scriptureNodes(also));
    } else {
      script.appendChild(el("p", "note", "A mark on the chart, not a new passage."));
    }
    reader.appendChild(script);

    if (home.length && also.length) {
      const cross = el("p", "cross");
      cross.appendChild(document.createTextNode("Also points at "));
      also.forEach(function (verse, i) {
        if (i) cross.appendChild(document.createTextNode(", "));
        const b = el("button", null, verse.id);
        b.type = "button";
        b.addEventListener("click", function () { goToVerse(verse.c, verse.v); });
        cross.appendChild(b);
      });
      cross.appendChild(document.createTextNode(" in the scroll."));
      reader.appendChild(cross);
    }

    const reading = readingOf(id);
    if (reading) {
      const block = el("section", "reading" + (reading.state && reading.state !== "past" ? " " + reading.state : ""));
      block.appendChild(el("p", "eyebrow", readingLabel(reading)));
      reading.text.forEach(function (para) { block.appendChild(el("p", null, para)); });
      reader.appendChild(block);
    }

    reader.appendChild(el("p", "eyebrow section-label", "On the chart"));
    const gloss = el("div", "gloss");
    const glossText = el("p", null, cell.gloss);
    if (churchNames(id).length === 1) glossText.style.color = CHURCHES[churchNames(id)[0]];
    gloss.appendChild(glossText);
    reader.appendChild(gloss);

    const kin = Array.from(kinIds(id)).filter(function (other) { return other !== id; });
    if (kin.length) {
      reader.appendChild(el("p", "eyebrow", "In this same moment"));
      const row = el("div", "siblings");
      kin.forEach(function (other) {
        const b = el("button", null, meta.get(other).cell.ref);
        b.type = "button";
        b.title = meta.get(other).cell.excerpt;
        b.addEventListener("click", function () { select(other, { reader: true }); });
        row.appendChild(b);
      });
      reader.appendChild(row);
    }

    const index = moments.findIndex(function (m) { return m.cells.some(function (c) { return c.id === id; }) || m.covers.some(function (c) { return c.id === id; }); });
    const nav = el("div", "nav-row");
    const prev = el("button", null, "Earlier");
    const next = el("button", null, "Later");
    prev.type = "button";
    next.type = "button";
    prev.disabled = index <= 0;
    next.disabled = index < 0 || index >= moments.length - 1;
    prev.addEventListener("click", function () { stepMoment(index, -1); });
    next.addEventListener("click", function () { stepMoment(index, 1); });
    nav.appendChild(prev);
    nav.appendChild(next);
    reader.appendChild(nav);
    reader.scrollTop = 0;
  }

  function stepMoment(index, dir) {
    const moment = moments[index + dir];
    if (!moment || !moment.cells.length) return;
    select(moment.cells[0].id, { reader: true });
  }

  function renderDiagram() {
    stage.replaceChildren();
    stage.appendChild(el("p", "hint", "Open a panel for the passage and his reading of it. Where he said it had not yet happened, the panel says so. The strip at the right lights every line the passage occupies in the scroll, including lines far apart."));
    stage.appendChild(renderBand(D.bands.prologue));
    stage.appendChild(renderBand(D.bands.throne));
    stage.appendChild(renderBand(D.bands.hinge));
    stage.appendChild(renderGrid("The seals, and the dragon beside them", "Seven churches as seven states. Four horsemen, then the persecution, then the Christian empire.", D.upperColumns, D.upper));
    const lowerNote = state.chart === "adjusted"
      ? "Eight successive parts: the half hour of silence, then seven trumpets. The eighth part is the seventh trumpet, and that trumpet is the millennium day. Revelation 10 marks the end of the 1,260."
      : "One silence, then seven wars. A trumpet, a thunder, and a vial are the same war.";
    stage.appendChild(renderGrid("The seventh seal", lowerNote, D.lowerColumns, D.lower));
    stage.appendChild(renderBand(D.bands.epilogue));
  }

  function renderOrder() {
    stage.replaceChildren();
    const article = el("article", "order");
    const intro = el("p", "hint", "Read down for time. Read across a band for the passages he treats as one moment. A chapter that stands late in the scroll can appear here at the top. Panels with nothing new to read point back at a line already passed.");
    article.appendChild(intro);
    moments.forEach(function (moment) {
      const sec = el("section", "moment");
      sec.id = "moment-" + moment.id;
      sec.dataset.moment = moment.id;
      const head = el("header");
      head.appendChild(el("div", "yr", moment.year || "·"));
      head.appendChild(el("h2", null, moment.era || moment.kicker || moment.year || "The book"));
      sec.appendChild(head);
      if (moment.kicker && moment.era) sec.appendChild(el("p", "lead", moment.kicker));
      const sync = el("div", "sync");
      const shown = moment.cells.concat(moment.covers.filter(function (c) {
        return !moment.cells.some(function (own) { return own.id === c.id; });
      }));
      shown.forEach(function (cell) {
        const card = el("button", "passage " + halfClass(cell));
        card.type = "button";
        card.dataset.cell = cell.id;
        card.appendChild(el("h3", null, (meta.get(cell.id).col ? meta.get(cell.id).col.title + " · " : "") + cell.ref));
        const tag = stateTag(cell.id);
        if (tag && !moment.covers.includes(cell)) card.appendChild(tag);
        const home = rangesOf(cell, "home");
        if (home.length && !moment.covers.includes(cell)) {
          card.appendChild(scriptureNodes(home));
        } else if (moment.covers.includes(cell)) {
          card.appendChild(el("p", "marker-line", "Still open from above. " + cell.excerpt));
        } else {
          card.appendChild(el("p", "marker-line", cell.excerpt));
        }
        card.addEventListener("click", function () { select(cell.id, { reader: true }); });
        sync.appendChild(card);
      });
      sec.appendChild(sync);
      article.appendChild(sec);
    });
    stage.appendChild(article);
  }

  function renderBook() {
    stage.replaceChildren();
    const article = el("article", "book");
    article.appendChild(el("p", "hint", "Revelation in its own order. The small heading above a group of verses is the moment of the diagram where Newton reads them. Click a heading, or a line in the strip."));
    for (let c = 1; c <= 22; c++) {
      const sec = el("section", "chapter");
      sec.id = "chapter-" + c;
      sec.appendChild(el("h2", null, "Chapter " + c));
      let run = null;
      let runId = null;
      KJV[c - 1].forEach(function (text, i) {
        const v = i + 1;
        const id = c + ":" + v;
        const cellId = homeOf.get(id) || "";
        if (cellId !== runId) {
          run = el("div", "run");
          run.dataset.cell = cellId;
          if (cellId) {
            const head = el("button", "runhead", cellLabel(cellId));
            head.type = "button";
            head.addEventListener("click", function () { select(cellId, { reader: true, scroll: false }); });
            run.appendChild(head);
          }
          sec.appendChild(run);
          runId = cellId;
        }
        const p = el("p", "verse");
        p.dataset.verse = id;
        p.appendChild(el("sup", null, String(v)));
        p.appendChild(document.createTextNode(text));
        run.appendChild(p);
      });
      article.appendChild(sec);
    }
    stage.appendChild(article);
  }

  const lineOf = new Map();

  function renderMap() {
    mapBody.replaceChildren();
    const cap = mapBody.parentElement.querySelector(".map-cap");
    if (cap) cap.textContent = "The book";
    for (let c = 1; c <= 22; c++) {
      const block = el("div", "ch");
      block.style.setProperty("--n", String(KJV[c - 1].length));
      block.appendChild(el("i", null, String(c)));
      KJV[c - 1].forEach(function (_, i) {
        const v = i + 1;
        const line = el("div", "ln");
        line.dataset.verse = c + ":" + v;
        lineOf.set(c + ":" + v, line);
        block.appendChild(line);
      });
      mapBody.appendChild(block);
    }
  }

  function verseAt(event) {
    const blocks = mapBody.querySelectorAll(".ch");
    for (let c = 0; c < blocks.length; c++) {
      const rect = blocks[c].getBoundingClientRect();
      if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
        const n = KJV[c].length;
        const t = Math.min(n - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * n)));
        return { c: c + 1, v: t + 1, id: (c + 1) + ":" + (t + 1) };
      }
    }
    return null;
  }

  function paintMap() {
    lineOf.forEach(function (line) { line.className = "ln"; });
    if (state.view === "book" && state.bookChapter) {
      const ch = KJV[state.bookChapter - 1];
      for (let v = 1; v <= ch.length; v++) {
        const line = lineOf.get(state.bookChapter + ":" + v);
        if (line) line.classList.add("view");
      }
    }
    if (!state.selected) return;
    const info = meta.get(state.selected);
    if (!info) return;
    const kin = kinIds(state.selected);
    kin.forEach(function (id) {
      if (id === state.selected) return;
      rangesOf(meta.get(id).cell, "home").forEach(function (verse) {
        const line = lineOf.get(verse.id);
        if (line) line.classList.add("kin");
      });
    });
    const home = rangesOf(info.cell, "home");
    const also = rangesOf(info.cell, "also");
    const bright = home.length ? home : also;
    bright.forEach(function (verse) {
      const line = lineOf.get(verse.id);
      if (line) line.classList.add("lit");
    });
    if (home.length) {
      also.forEach(function (verse) {
        const line = lineOf.get(verse.id);
        if (line && !line.classList.contains("lit")) line.classList.add("also");
      });
    }
  }

  function paintSelection() {
    document.querySelectorAll("[data-cell]").forEach(function (node) {
      node.classList.toggle("is-on", node.dataset.cell === state.selected);
      node.classList.toggle("is-kin", !!state.selected && node.dataset.cell !== state.selected && kinIds(state.selected).has(node.dataset.cell));
    });
    document.querySelectorAll(".run").forEach(function (node) {
      node.classList.toggle("is-on", !!state.selected && node.dataset.cell === state.selected);
    });
    paintMap();
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function describeVerse(c, v) {
    const id = c + ":" + v;
    const cellId = homeOf.get(id);
    const where = cellId ? cellLabel(cellId) : "not placed";
    return "Revelation " + id + " · verse " + versePos(c, v) + " of " + TOTAL + " · " + where;
  }

  function select(id, opts) {
    opts = opts || {};
    if (!meta.has(id)) return;
    state.selected = id;
    if (opts.reader) {
      state.reader = true;
      document.body.classList.add("reader-open");
      reader.hidden = false;
      fillReader(id);
    }
    paintSelection();
    const info = meta.get(id);
    const home = rangesOf(info.cell, "home");
    const focus = home[0] || rangesOf(info.cell, "also")[0];
    if (focus) setStatus(describeVerse(focus.c, focus.v) + " · " + info.cell.ref);
    else setStatus(cellLabel(id));
    if (opts.scroll !== false) {
      const target = document.getElementById("cell-" + id)
        || document.querySelector('.passage[data-cell="' + id + '"]')
        || document.querySelector('.run[data-cell="' + id + '"]')
        || document.getElementById("moment-" + info.moment.id);
      reveal(target);
    }
    const hash = state.view === "diagram" ? "#" + id : "#" + state.view + "/" + id;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function closeReader() {
    state.reader = false;
    reader.hidden = true;
    document.body.classList.remove("reader-open");
  }

  function goToVerse(c, v) {
    const id = c + ":" + v;
    const cellId = homeOf.get(id);
    if (state.view === "book") {
      const chapter = document.getElementById("chapter-" + c);
      if (chapter) chapter.scrollIntoView({ block: "start" });
      const verse = stage.querySelector('[data-verse="' + id + '"]');
      if (verse) verse.scrollIntoView({ block: "center" });
    }
    if (cellId) select(cellId, { reader: true, scroll: state.view !== "book" });
    setStatus(describeVerse(c, v));
  }

  function paintChartButtons() {
    const his = document.getElementById("chart-his");
    const adjusted = document.getElementById("chart-adjusted");
    if (his) his.setAttribute("aria-selected", state.chart === "his" ? "true" : "false");
    if (adjusted) adjusted.setAttribute("aria-selected", state.chart === "adjusted" ? "true" : "false");
    document.body.classList.toggle("chart-adjusted", state.chart === "adjusted");
    const sw = document.getElementById("chart-switch");
    if (sw) sw.hidden = state.view === "book";
  }

  function setChart(next) {
    const incoming = next === "adjusted" ? "adjusted" : "his";
    if (incoming === state.chart) return;
    const x = window.scrollX;
    const y = window.scrollY;
    state.chart = incoming;
    D = incoming === "adjusted" ? window.DIAGRAM_ADJUSTED : window.DIAGRAM;
    const prev = state.selected;
    indexDiagram();
    if (prev && !meta.has(prev)) {
      const pair = incoming === "adjusted"
        ? { "hinge-eat": "rev10", "angel-stands": "rev10", "lion": "rev10", "t7-time": "rev10" }
        : { rev10: "hinge-eat" };
      state.selected = pair[prev] && meta.has(pair[prev]) ? pair[prev] : null;
      if (!state.selected) state.reader = false;
    }
    try { localStorage.setItem("newton-chart", state.chart); } catch (e) {}
    paintChartButtons();
    setView(state.view, { scroll: false });
    if (state.reader && state.selected) fillReader(state.selected);
    else if (!state.selected) closeReader();
    window.scrollTo(x, y);
  }

  function setView(view, opts) {
    opts = opts || {};
    state.view = view;
    state.bookChapter = view === "book" ? (state.bookChapter || 1) : null;
    paintChartButtons();
    document.getElementById("view-diagram").setAttribute("aria-selected", view === "diagram" ? "true" : "false");
    document.getElementById("view-order").setAttribute("aria-selected", view === "order" ? "true" : "false");
    document.getElementById("view-book").setAttribute("aria-selected", view === "book" ? "true" : "false");
    if (view === "diagram") renderDiagram();
    else if (view === "order") renderOrder();
    else renderBook();
    paintSelection();
    if (!opts.keepHash) {
      let hash = "#" + view;
      if (state.selected && view === "diagram") hash = "#" + state.selected;
      else if (state.selected) hash = "#" + view + "/" + state.selected;
      else if (view === "diagram") hash = "#" + state.chart;
      if (location.hash !== hash) history.replaceState(null, "", hash);
    }
    if (state.selected && opts.scroll !== false) {
      const info = meta.get(state.selected);
      const target = document.getElementById("cell-" + state.selected)
        || document.querySelector('.passage[data-cell="' + state.selected + '"]')
        || document.querySelector('.run[data-cell="' + state.selected + '"]')
        || (info && document.getElementById("moment-" + info.moment.id));
      reveal(target);
    }
    measure();
  }

  function parseJump(raw) {
    const m = /(\d{1,2})\s*[:.]\s*(\d{1,2})/.exec(raw);
    if (!m) return null;
    const c = +m[1], v = +m[2];
    if (c < 1 || c > 22 || v < 1 || v > KJV[c - 1].length) return null;
    return { c: c, v: v };
  }

  function reveal(target) {
    if (!target) return;
    requestAnimationFrame(function () {
      const rect = target.getBoundingClientRect();
      const topH = document.body.classList.contains("is-fullscreen") ? 0 : document.querySelector(".top").offsetHeight;
      const freezeH = document.querySelector(".freeze") ? document.querySelector(".freeze").offsetHeight : 0;
      const readerW = document.body.classList.contains("reader-open") ? reader.getBoundingClientRect().width : 0;
      const visibleRight = window.innerWidth - readerW - 86 - 16;
      let dy = 0;
      const stick = topH + freezeH;
      if (rect.top < stick + 8) dy = rect.top - stick - 12;
      else if (rect.bottom > window.innerHeight - 48) dy = Math.min(rect.top - stick - 12, rect.bottom - (window.innerHeight - 56));
      let dx = 0;
      if (rect.right > visibleRight) dx = rect.right - visibleRight + 12;
      else if (rect.left < 12) dx = rect.left - 16;
      if (dx || dy) window.scrollBy(dx, dy);
    });
  }

  function measure() {
    const full = document.body.classList.contains("is-fullscreen");
    const h = full ? 0 : document.querySelector(".top").offsetHeight;
    document.documentElement.style.setProperty("--top-h", h + "px");
    const freeze = document.querySelector(".freeze");
    document.documentElement.style.setProperty("--freeze-h", (freeze ? freeze.offsetHeight : 0) + "px");
  }

  function move(dir) {
    if (!state.selected) {
      select(moments[0].cells[0].id, { reader: true });
      return;
    }
    const info = meta.get(state.selected);
    const rowIndex = moments.indexOf(info.moment);
    const colIndex = info.col ? info.col.index : info.moment.cells.indexOf(info.cell);
    if (dir === "left" || dir === "right") {
      const list = info.moment.cells;
      let i = list.indexOf(info.cell);
      if (i < 0) i = 0;
      i += dir === "right" ? 1 : -1;
      if (list[i]) select(list[i].id, { reader: state.reader });
      return;
    }
    const nextRow = moments[rowIndex + (dir === "down" ? 1 : -1)];
    if (!nextRow) return;
    let pick = nextRow.cells[0];
    if (info.col) {
      const same = nextRow.cells.find(function (c) { return c.col === info.col.id; });
      if (same) pick = same;
    } else if (nextRow.cells[colIndex]) pick = nextRow.cells[colIndex];
    if (pick) select(pick.id, { reader: state.reader });
  }

  document.getElementById("chart-his").addEventListener("click", function () { setChart("his"); });
  document.getElementById("chart-adjusted").addEventListener("click", function () { setChart("adjusted"); });
  document.getElementById("view-diagram").addEventListener("click", function () { setView("diagram"); });
  document.getElementById("view-order").addEventListener("click", function () { setView("order"); });
  document.getElementById("view-book").addEventListener("click", function () { setView("book"); });
  document.getElementById("about-open").addEventListener("click", function () { about.showModal(); });
  const fullscreenBtn = document.getElementById("fullscreen");
  fullscreenBtn.addEventListener("click", function () {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
  document.addEventListener("fullscreenchange", function () {
    const on = !!document.fullscreenElement;
    document.body.classList.toggle("is-fullscreen", on);
    fullscreenBtn.textContent = on ? "Exit" : "Full screen";
    fullscreenBtn.setAttribute("aria-pressed", on ? "true" : "false");
    measure();
  });
  document.getElementById("jump-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const found = parseJump(document.getElementById("jump").value);
    if (!found) {
      setStatus("Use a verse such as 12:6 or 11:19.");
      return;
    }
    if (state.view !== "book" && state.view !== "diagram" && state.view !== "order") setView("diagram");
    goToVerse(found.c, found.v);
  });

  mapBody.addEventListener("mousemove", function (event) {
    const verse = verseAt(event);
    if (!verse) return;
    state.hover = verse.id;
    setStatus(describeVerse(verse.c, verse.v));
  });
  mapBody.addEventListener("mouseleave", function () {
    if (!state.selected) setStatus("Click a panel, or a line in the scroll.");
  });
  mapBody.addEventListener("click", function (event) {
    const verse = verseAt(event);
    if (!verse) return;
    goToVerse(verse.c, verse.v);
  });

  document.addEventListener("keydown", function (event) {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "Escape") {
      if (about.open) return;
      closeReader();
    } else if (event.key === "ArrowDown") { event.preventDefault(); move("down"); }
    else if (event.key === "ArrowUp") { event.preventDefault(); move("up"); }
    else if (event.key === "ArrowRight") { event.preventDefault(); move("right"); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); move("left"); }
  });

  window.addEventListener("resize", measure);

  window.addEventListener("scroll", function () {
    if (state.view !== "book") return;
    const chapters = stage.querySelectorAll(".chapter");
    let current = 1;
    chapters.forEach(function (sec) {
      const rect = sec.getBoundingClientRect();
      if (rect.top < 160) current = +sec.id.replace("chapter-", "");
    });
    if (current !== state.bookChapter) {
      state.bookChapter = current;
      paintMap();
    }
  }, { passive: true });

  window.addEventListener("error", function (event) {
    const statusNode = document.getElementById("status");
    if (statusNode) statusNode.textContent = "Something broke: " + (event.message || "unknown error");
  });

  function boot() {
    renderMap();
    measure();
    const hash = location.hash.replace(/^#/, "");
    let view = "diagram";
    let selected = null;
    let chart = "his";
    try {
      const saved = localStorage.getItem("newton-chart");
      if (saved === "his" || saved === "adjusted") chart = saved;
    } catch (e) {}
    if (hash === "his" || hash === "adjusted") chart = hash;
    else if (hash === "book" || hash === "order" || hash === "diagram") view = hash;
    else if (/^(book|order|diagram)\//.test(hash)) {
      view = hash.split("/")[0];
      selected = hash.split("/")[1];
    } else if (hash === "rev10") {
      chart = "adjusted";
      selected = hash;
    } else if (hash === "hinge-eat" || hash === "angel-stands" || hash === "lion" || hash === "t7-time") {
      chart = "his";
      selected = hash;
    } else if (hash) selected = hash;
    state.chart = chart;
    state.view = view;
    D = chart === "adjusted" ? window.DIAGRAM_ADJUSTED : window.DIAGRAM;
    indexDiagram();
    setView(view, { keepHash: true, scroll: false });
    if (selected && meta.has(selected)) select(selected, { reader: true });
    else setStatus("Revelation, " + TOTAL + " verses. Click a panel. Arrow keys move through the diagram.");
  }

  boot();
})();
