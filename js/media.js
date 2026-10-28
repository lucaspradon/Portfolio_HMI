/* =========================================================
   MEDIA
   One player engine per "zone" (center, and later passenger).
   Each zone keeps its own track / play state / position in
   HMI.state, so any screen can display or control it:
     <zone>Track     id of the track (see HMI.data.tracks)
     <zone>Playing   true / false
     <zone>Position  seconds
   If assets/audio/<file> exists it is played for real,
   otherwise playback is simulated (no sound).
   ========================================================= */

window.HMI = window.HMI || {};

HMI.media = (function () {
  var zones = {};

  function track(id) {
    return HMI.data.tracks.filter(function (t) { return t.id === id; })[0] || HMI.data.tracks[0];
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------- Engine ---------- */

  function createZone(name, firstTrack) {
    var key = { track: name + "Track", playing: name + "Playing", position: name + "Position" };
    var audio = new Audio();
    var realAudio = false;   // true when the current track has a playable file
    var lastTick = 0;

    var initial = {};
    initial[key.track] = firstTrack;
    initial[key.playing] = false;
    initial[key.position] = 0;
    HMI.state.set(initial);

    function set(values) {
      var patch = {};
      Object.keys(values).forEach(function (k) { patch[key[k]] = values[k]; });
      HMI.state.set(patch);
    }

    function current() {
      return track(HMI.state.get(key.track));
    }

    function duration() {
      return realAudio && isFinite(audio.duration) ? audio.duration : current().duration;
    }

    function load(id) {
      var t = track(id);
      realAudio = false;
      if (t.audio) {
        audio.src = t.audio;
        audio.load();
      } else {
        audio.removeAttribute("src");
      }
    }

    audio.addEventListener("loadedmetadata", function () {
      realAudio = true;
      audio.currentTime = 0;
      if (HMI.state.get(key.playing)) playAudio();
      set({ position: 0 });
    });
    audio.addEventListener("error", function () { realAudio = false; });
    audio.addEventListener("timeupdate", function () {
      if (realAudio) set({ position: audio.currentTime });
    });
    audio.addEventListener("ended", function () { next(); });

    /* simulated playback when there is no audio file
       (a timer rather than animation frames, so it keeps
       running like real music when the tab is in the background) */
    function tick() {
      var now = Date.now();
      var dt = lastTick ? (now - lastTick) / 1000 : 0;
      lastTick = now;
      if (HMI.state.get(key.playing) && !realAudio) {
        var pos = HMI.state.get(key.position) + dt;
        if (pos >= duration()) {
          next();
        } else {
          set({ position: pos });
        }
      }
    }
    setInterval(tick, 200);

    /* if the browser refuses to play the file, fall back to simulation */
    function playAudio() {
      audio.play().catch(function () { realAudio = false; });
    }

    function play(id) {
      if (id && id !== HMI.state.get(key.track)) {
        set({ track: id, position: 0, playing: true });
        load(id);
      } else {
        set({ playing: true });
      }
      if (realAudio) playAudio();
    }

    function pause() {
      set({ playing: false });
      audio.pause();
    }

    function toggle() {
      if (HMI.state.get(key.playing)) pause(); else play();
    }

    function step(direction) {
      var list = HMI.data.tracks;
      var index = list.indexOf(current());
      var nextTrack = list[(index + direction + list.length) % list.length];
      var wasPlaying = HMI.state.get(key.playing);
      set({ track: nextTrack.id, position: 0, playing: wasPlaying });
      load(nextTrack.id);
    }

    function next() { step(1); }

    function previous() {
      /* like most players: restart the track if we are past 3 s */
      if (HMI.state.get(key.position) > 3) seek(0); else step(-1);
    }

    function seek(seconds) {
      seconds = Math.max(0, Math.min(seconds, duration()));
      if (realAudio) audio.currentTime = seconds;
      set({ position: seconds });
    }

    load(firstTrack);

    var zone = {
      key: key, current: current, duration: duration,
      play: play, pause: pause, toggle: toggle, next: next, previous: previous, seek: seek
    };
    zones[name] = zone;
    return zone;
  }

  /* ---------- Player views ----------
     "default": Figma "lecteur"; "easy": the cream player of the simplified mode.
     Both share the same class names, so one set of code drives them. */

  /* coral icons, inlined (js/icons.js) so their colour comes from the CSS */
  function easyIcon(name) {
    return '<span class="easy-icon">' + HMI.icons[name] + "</span>";
  }

  function easyMarkup() {
    return '<div class="player player--easy">' +
        '<img class="player__album" alt="">' +
        '<div class="player__panel">' +
          '<p class="player__title"></p>' +
          '<p class="player__artist"></p>' +
          '<div class="progress">' +
            '<div class="progress__track" role="slider" tabindex="0" aria-label="' + HMI.t("media.seek") + '">' +
              '<div class="progress__fill"></div>' +
              '<div class="progress__knob"></div>' +
            "</div>" +
            '<div class="progress__times">' +
              '<span class="progress__time progress__time--elapsed"></span>' +
              '<span class="progress__time progress__time--total"></span>' +
            "</div>" +
          "</div>" +
          '<div class="player__controls">' +
            '<button class="icon-button" data-action="previous" aria-label="' + HMI.t("media.previous") + '">' + easyIcon("previous") + "</button>" +
            '<button class="icon-button" data-action="toggle">' + easyIcon("play") + "</button>" +
            '<button class="icon-button" data-action="next" aria-label="' + HMI.t("media.next") + '">' + easyIcon("next") + "</button>" +
          "</div>" +
        "</div>" +
      "</div>";
  }

  /* compact player of the passenger screen */
  function compactMarkup() {
    return '<div class="player player--compact">' +
        '<img class="player__album" alt="">' +
        '<div class="player__panel">' +
          '<p class="player__title"></p>' +
          '<p class="player__artist"></p>' +
          '<div class="progress">' +
            '<div class="progress__track" role="slider" tabindex="0" aria-label="' + HMI.t("media.seek") + '">' +
              '<div class="progress__fill"></div>' +
              '<div class="progress__knob"></div>' +
            "</div>" +
            '<div class="progress__times">' +
              '<span class="progress__time progress__time--elapsed"></span>' +
              '<span class="progress__time progress__time--total"></span>' +
            "</div>" +
          "</div>" +
          '<div class="player__controls">' +
            '<button class="icon-button" data-action="previous" aria-label="' + HMI.t("media.previous") + '"><img src="assets/icons/previous.svg" alt=""></button>' +
            '<button class="icon-button" data-action="toggle"><img alt=""></button>' +
            '<button class="icon-button" data-action="next" aria-label="' + HMI.t("media.next") + '"><img src="assets/icons/next.svg" alt=""></button>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function renderPlayer(container, zone) {
    var variant = container.getAttribute("data-variant");
    var easy = variant === "easy";
    container.innerHTML = easy ? easyMarkup() : variant === "compact" ? compactMarkup() :
      '<div class="player">' +
        '<div class="player__main">' +
          '<div class="progress">' +
            '<div class="progress__track" role="slider" tabindex="0" aria-label="' + HMI.t("media.seek") + '">' +
              '<div class="progress__fill"></div>' +
              '<div class="progress__knob"></div>' +
            "</div>" +
            '<div class="progress__times">' +
              '<span class="progress__time progress__time--elapsed"></span>' +
              '<span class="progress__time progress__time--total"></span>' +
            "</div>" +
          "</div>" +
          '<div class="player__bottom">' +
            '<div class="player__controls">' +
              '<button class="icon-button" data-action="previous" aria-label="' + HMI.t("media.previous") + '"><img src="assets/icons/previous.svg" alt=""></button>' +
              '<button class="icon-button" data-action="toggle"><img alt=""></button>' +
              '<button class="icon-button" data-action="next" aria-label="' + HMI.t("media.next") + '"><img src="assets/icons/next.svg" alt=""></button>' +
            "</div>" +
            '<div class="player__track">' +
              '<p class="player__title"></p>' +
              '<p class="player__artist"></p>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<img class="player__album" alt="">' +
      "</div>";

    var el = function (sel) { return container.querySelector(sel); };
    var bar = el(".progress__track");

    container.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () { zone[button.getAttribute("data-action")](); });
    });

    /* click or drag on the bar to move in the track */
    function seekFromPointer(event) {
      var rect = bar.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      zone.seek(ratio * zone.duration());
    }
    bar.addEventListener("pointerdown", function (event) {
      bar.setPointerCapture(event.pointerId);
      seekFromPointer(event);
      bar.addEventListener("pointermove", seekFromPointer);
    });
    bar.addEventListener("pointerup", function () {
      bar.removeEventListener("pointermove", seekFromPointer);
    });
    bar.addEventListener("keydown", function (event) {
      var pos = HMI.state.get(zone.key.position);
      if (event.key === "ArrowRight") zone.seek(pos + 10);
      if (event.key === "ArrowLeft") zone.seek(pos - 10);
    });

    HMI.state.on(zone.key.track, function () {
      var t = zone.current();
      el(".player__title").textContent = t.title;
      el(".player__artist").textContent = t.artist;
      el(".player__album").src = t.cover;
    });

    HMI.state.on(zone.key.playing, function (playing) {
      var button = el('[data-action="toggle"]');
      var icon = playing ? "pause" : "play";
      if (easy) button.querySelector(".easy-icon").innerHTML = HMI.icons[icon];
      else button.querySelector("img").src = "assets/icons/" + icon + ".svg";
      button.setAttribute("aria-label", HMI.t(playing ? "media.pause" : "media.play"));
    });

    HMI.state.on(zone.key.position, function (position) {
      var total = zone.duration();
      var ratio = total ? Math.min(1, position / total) : 0;
      var percent = (ratio * 100).toFixed(3) + "%";
      el(".progress__fill").style.width = percent;
      el(".progress__knob").style.left = percent;
      el(".progress__time--elapsed").textContent = formatTime(position);
      el(".progress__time--total").textContent = formatTime(total);
    });
  }

  /* ---------- Media screen ---------- */

  function initMediaScreen(zone) {
    var shelves = document.getElementById("media-shelves");
    shelves.innerHTML = HMI.data.shelves.map(function (shelf) {
      return '<section class="shelf">' +
        '<h3 class="shelf__title">' + HMI.t(shelf.title) + "</h3>" +
        '<div class="shelf__row">' +
          shelf.items.map(function (item) {
            return '<button class="album-tile" data-play="' + item.track + '">' +
              '<img class="album-tile__cover" src="' + item.cover + '" alt="">' +
              '<span class="album-tile__title">' + HMI.t(item.title) + "</span>" +
              '<span class="album-tile__subtitle">' + HMI.t(item.subtitle) + "</span>" +
            "</button>";
          }).join("") +
        "</div>" +
      "</section>";
    }).join("");

    /* every element with data-play="<track id>" starts that track (shelves, home shortcut) */
    document.querySelectorAll("#center [data-play]").forEach(function (button) {
      button.addEventListener("click", function () { zone.play(button.getAttribute("data-play")); });
    });

    var sources = document.getElementById("media-sources");
    sources.innerHTML = HMI.data.sources.map(function (source) {
      return '<button class="source-pill" data-source="' + source.id + '">' + HMI.t(source.name) + "</button>";
    }).join("");
    sources.querySelectorAll(".source-pill").forEach(function (pill) {
      pill.addEventListener("click", function () { HMI.state.set({ mediaSource: pill.getAttribute("data-source") }); });
    });

    HMI.state.on("mediaSource", function (id) {
      var source = HMI.data.sources.filter(function (s) { return s.id === id; })[0];
      document.getElementById("media-source-title").textContent = HMI.t(source.name);
      sources.querySelectorAll(".source-pill").forEach(function (pill) {
        pill.classList.toggle("is-active", pill.getAttribute("data-source") === id);
      });
    });

    /* the current cover, large and faded, behind the Media screen */
    HMI.state.on(zone.key.track, function () {
      document.getElementById("media-backdrop").src = zone.current().cover;
    });
  }

  function init() {
    var center = createZone("center", "a7x");
    HMI.state.set({ centerPosition: 14, mediaSource: "youtube" });  // as in Figma: 00:14

    document.querySelectorAll('[data-player="center"]').forEach(function (container) {
      renderPlayer(container, center);
    });
    initMediaScreen(center);

    /* the passenger has their own player (headphones) */
    var passenger = createZone("passenger", "pulsar");
    document.querySelectorAll('[data-player="passenger"]').forEach(function (container) {
      renderPlayer(container, passenger);
    });
  }

  return { init: init, createZone: createZone, renderPlayer: renderPlayer, zone: function (n) { return zones[n]; }, formatTime: formatTime };
})();
