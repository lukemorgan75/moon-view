(function () {
  var data = window.GUIDE;
  var figures = document.getElementById("figures");
  var treatise = document.getElementById("treatise");
  var note = document.getElementById("page-note");
  if (!data || !figures || !treatise) return;

  var langButtons = document.querySelectorAll("[data-lang]");

  function setLang(lang) {
    document.body.dataset.lang = lang;
    langButtons.forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.dataset.lang === lang ? "true" : "false");
    });
    try { localStorage.setItem("guide-lang", lang); } catch (e) {}
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
  });

  var saved = "both";
  try { saved = localStorage.getItem("guide-lang") || "both"; } catch (e) {}
  if (saved !== "his" && saved !== "today" && saved !== "both") saved = "both";
  setLang(saved);

  var stats = data.voiceStats || {};
  if (stats.voice && stats.plain) {
    note.textContent += " " + stats.voice + " paragraphs carry the paraphrase. The other " + stats.plain + " stay in his sentences.";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function peek(text) {
    var parts = String(text || "").split(/\s+/).filter(Boolean);
    if (parts.length <= 14) return parts.join(" ");
    return parts.slice(0, 14).join(" ") + "…";
  }

  function wordings(text) {
    var value = String(text || "");
    if (value.indexOf(" ‖ ") === -1) return [value];
    return value.split(" ‖ ").map(function (part) { return part.trim(); }).filter(Boolean);
  }

  function addReading(parent, original, modern, kindLabel, heading) {
    var block = el("div", "wording");
    if (heading) block.appendChild(el("p", "reading-label", heading));
    block.appendChild(el("p", "col-original", original));
    var modernP = el("p", "col-modern");
    modernP.appendChild(el("span", "kind", kindLabel));
    modernP.appendChild(document.createTextNode(modern));
    block.appendChild(modernP);
    parent.appendChild(block);
  }

  var figuresHead = el("h2", null, "Figures");
  figuresHead.id = "figures-title";
  figures.appendChild(figuresHead);
  figures.appendChild(el(
    "p",
    "section-lead",
    "The Definitions, in his order. A closed card shows the figure. Open it for his full sentence, and for that sentence in today’s words. Show the proof for the scriptures he brings for that figure. Where the two copies of the Proof differ, both are there."
  ));

  var find = document.createElement("input");
  find.type = "search";
  find.id = "figure-find";
  find.placeholder = "Find a figure";
  find.setAttribute("aria-label", "Find a figure");
  figures.appendChild(find);

  var deck = el("div", "deck");
  figures.appendChild(deck);

  var cards = [];
  var lastGroup = "";
  (data.cards || []).forEach(function (card) {
    if (card.group !== lastGroup) {
      lastGroup = card.group;
      var group = el("h3", "card-group", card.group);
      group.dataset.group = card.group || "";
      deck.appendChild(group);
    }
    var article = el("article", "card");
    article.dataset.figure = String(card.figure || "").toLowerCase();
    article.dataset.group = card.group || "";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "card-face";
    button.setAttribute("aria-expanded", "false");
    if (card.n) button.appendChild(el("span", "card-n", card.n));
    button.appendChild(el("span", "card-figure", card.figure));

    var back = el("div", "card-back");
    back.hidden = true;
    var readings = card.readings || [];
    readings.forEach(function (reading) {
      addReading(
        back,
        reading.original,
        reading.modern,
        "In today’s words",
        readings.length > 1 ? reading.label : ""
      );
    });

    if (card.proof && card.proof.length) {
      var proofBtn = document.createElement("button");
      proofBtn.type = "button";
      proofBtn.className = "proof-btn";
      proofBtn.textContent = "Show the proof";
      proofBtn.setAttribute("aria-expanded", "false");
      var proof = el("div", "proof");
      proof.hidden = true;
      proof.appendChild(el(
        "p",
        "proof-cap",
        "His proof of this figure. Where the two copies of the Proof agree, the fuller wording is shown once. Where they differ, both are shown, and he does not mark which is last. Each copy is named on the proof."
      ));
      card.proof.forEach(function (item) {
        if (item.note) proof.appendChild(el("p", "para-note", item.note));
        var sources = (item.sources || []).join(" · ");
        if (sources) proof.appendChild(el("p", "proof-src", sources));
        var proofOriginals = wordings(item.original);
        var proofModerns = wordings(item.modern);
        var proofKind = item.kind === "voice"
          ? "In today’s words"
          : "His sentences, with modern spelling";
        proofOriginals.forEach(function (original, index) {
          var modern = proofOriginals.length > 1 ? (proofModerns[index] || "") : item.modern;
          var heading = proofOriginals.length > 1
            ? (index === 0 ? "One wording" : "The other wording")
            : "";
          addReading(proof, original, modern, proofKind, heading);
        });
      });
      proofBtn.addEventListener("click", function () {
        var open = proofBtn.getAttribute("aria-expanded") === "true";
        proofBtn.setAttribute("aria-expanded", open ? "false" : "true");
        proof.hidden = open;
        proofBtn.textContent = open ? "Show the proof" : "Hide the proof";
      });
      back.appendChild(proofBtn);
      back.appendChild(proof);
    }

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      back.hidden = open;
      article.classList.toggle("is-open", !open);
    });

    article.appendChild(button);
    article.appendChild(back);
    deck.appendChild(article);
    cards.push(article);
  });

  find.addEventListener("input", function () {
    var query = find.value.trim().toLowerCase();
    var visible = {};
    cards.forEach(function (article) {
      var show = !query || article.dataset.figure.indexOf(query) !== -1;
      article.hidden = !show;
      if (show) visible[article.dataset.group] = true;
    });
    deck.querySelectorAll(".card-group").forEach(function (group) {
      group.hidden = !!query && !visible[group.dataset.group];
    });
  });

  var treatiseHead = el("h2", null, "Treatise");
  treatiseHead.id = "treatise-title";
  treatise.appendChild(treatiseHead);
  treatise.appendChild(el(
    "p",
    "section-lead",
    "From THEM00135 through THEM00215. A later copy replaces an earlier one when the words are the same. When the words differ and the manuscript does not say which he kept, both stay."
  ));

  (data.books || []).forEach(function (book) {
    var bookDetails = document.createElement("details");
    bookDetails.className = "book";
    bookDetails.id = book.id;
    var bookSummary = document.createElement("summary");
    bookSummary.appendChild(el("span", "book-id", book.id));
    bookSummary.appendChild(el("span", "book-sec", book.section));
    bookSummary.appendChild(el("span", "book-blurb", book.blurb));
    bookDetails.appendChild(bookSummary);

    var body = el("div", "book-body");
    if (book.title) body.appendChild(el("p", "book-title", book.title));
    if (book.url) {
      var link = el("a", "book-link", "Newton Project text");
      link.href = book.url;
      link.target = "_blank";
      link.rel = "noopener";
      body.appendChild(link);
    }

    (book.sections || []).forEach(function (section) {
      var items = section.items || [];
      var sectionDetails = document.createElement("details");
      sectionDetails.className = "section";
      var sectionSummary = document.createElement("summary");
      sectionSummary.appendChild(document.createTextNode(section.title || "Section"));
      if (items.length) {
        sectionSummary.appendChild(el("span", "section-count", String(items.length)));
      }
      sectionDetails.appendChild(sectionSummary);
      if (section.note) sectionDetails.appendChild(el("p", "section-note", section.note));

      items.forEach(function (item) {
        var para = document.createElement("details");
        para.className = "para";
        var summary = document.createElement("summary");
        var originalPeek = peek(wordings(item.original)[0]);
        var modernPeek = peek(wordings(item.modern)[0]);
        summary.appendChild(el("span", "col-original", originalPeek));
        summary.appendChild(el("span", "col-modern", modernPeek));
        para.appendChild(summary);

        var paraBody = el("div", "para-body");
        if (item.note) paraBody.appendChild(el("p", "para-note", item.note));
        var originals = wordings(item.original);
        var moderns = wordings(item.modern);
        var kindLabel = item.kind === "voice"
          ? "In today’s words"
          : "His sentences, with modern spelling";
        originals.forEach(function (original, index) {
          var modern = originals.length > 1 ? (moderns[index] || "") : item.modern;
          var heading = originals.length > 1
            ? (index === 0 ? "One wording" : "The other wording")
            : "";
          addReading(paraBody, original, modern, kindLabel, heading);
        });
        para.appendChild(paraBody);
        sectionDetails.appendChild(para);
      });
      body.appendChild(sectionDetails);
    });

    bookDetails.appendChild(body);
    treatise.appendChild(bookDetails);
  });
})();
