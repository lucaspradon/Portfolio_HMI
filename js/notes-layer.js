/* =========================================================
   DESIGN NOTES LAYER
   Shows the notes of js/notes.js as numbered dots placed on
   the prototype, and a card with the note when a dot is clicked.
   The dots follow their element (resize, screen changes, easy mode).
   ========================================================= */

window.HMI = window.HMI || {};

HMI.notesLayer = (function () {
  var STAGE_W = 4400;
  var layer, dots = [], card, active = -1, refreshTimer = null;

  function $(id) {
    return document.getElementById(id);
  }

  /* is the element really on screen? (not hidden by a screen change or easy mode) */
  function isShown(el) {
    for (var node = el; node && node !== document.body; node = node.parentElement) {
      var style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) return false;
    }
    return true;
  }

  /* position of a note on the page, in real pixels (null if hidden) */
  function position(note) {
    if (note.point) {
      /* in portrait the cabin is hidden, so are notes placed on it */
      if (document.body.classList.contains("is-portrait")) return null;
      var stage = $("stage").getBoundingClientRect();
      var scale = stage.width / STAGE_W;
      return { x: stage.left + note.point.x * scale, y: stage.top + note.point.y * scale };
    }
    var el = document.querySelector(note.target);
    if (!el || !isShown(el)) return null;
    var r = el.getBoundingClientRect();
    var a = note.anchor || { x: 0, y: 0 };
    return { x: r.left + r.width * a.x, y: r.top + r.height * a.y };
  }

  function refresh() {
    HMI.notes.forEach(function (note, i) {
      var p = position(note);
      dots[i].hidden = !p;
      if (p) {
        dots[i].style.left = p.x + "px";
        dots[i].style.top = p.y + "px";
      }
    });
    if (active >= 0) placeCard();
  }

  /* the card opens next to its dot, flipped if it would leave the window */
  function placeCard() {
    var dot = dots[active];
    if (dot.hidden) { close(); return; }
    var d = dot.getBoundingClientRect();
    var c = card.getBoundingClientRect();
    var gap = 14;
    var left = d.right + gap;
    if (left + c.width > window.innerWidth - 16) left = d.left - gap - c.width;
    left = Math.max(16, left);
    var top = Math.min(Math.max(16, d.top - 10), window.innerHeight - c.height - 64);
    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  function open(index) {
    var count = HMI.notes.length;
    active = (index + count) % count;
    var note = HMI.notes[active];
    dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === active); });
    card.querySelector(".note-card__number").textContent = (active + 1) + " / " + count;
    card.querySelector(".note-card__title").textContent = note.title;
    card.querySelector(".note-card__text").textContent = note.text;
    card.hidden = false;
    placeCard();
  }

  function close() {
    active = -1;
    card.hidden = true;
    dots.forEach(function (dot) { dot.classList.remove("is-active"); });
  }

  function toggle(on) {
    document.body.classList.toggle("notes-on", on);
    $("notes-toggle").setAttribute("aria-pressed", String(on));
    clearInterval(refreshTimer);
    if (on) {
      refresh();
      /* the interface moves (screens, easy mode…): keep the dots in place */
      refreshTimer = setInterval(refresh, 400);
    } else {
      close();
    }
  }

  function init() {
    layer = $("notes-layer");
    card = $("note-card");

    HMI.notes.forEach(function (note, i) {
      var dot = document.createElement("button");
      dot.className = "note-dot";
      dot.textContent = i + 1;
      dot.setAttribute("aria-label", HMI.t("notes.open") + " " + (i + 1) + ": " + note.title);
      dot.addEventListener("click", function () { active === i ? close() : open(i); });
      layer.appendChild(dot);
      dots.push(dot);
    });

    card.querySelector(".note-card__close").addEventListener("click", close);
    card.querySelector(".note-card__prev").addEventListener("click", function () { open(active - 1); });
    card.querySelector(".note-card__next").addEventListener("click", function () { open(active + 1); });

    $("notes-toggle").addEventListener("click", function () {
      toggle(!document.body.classList.contains("notes-on"));
    });
    window.addEventListener("resize", function () {
      if (document.body.classList.contains("notes-on")) refresh();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  return { init: init, toggle: toggle };
})();
