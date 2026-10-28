/* =========================================================
   CLUSTER — shows the shared values:
   speed, gear, battery and range (js/simulation.js),
   turn-by-turn guidance (js/trip.js) and the center screen's track.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.cluster = (function () {
  function $(id) {
    return document.getElementById(id);
  }

  function initDriving() {
    var speed = $("cluster-speed");
    var gear = $("cluster-gear");
    var battery = $("cluster-battery");
    var batteryBar = $("cluster-battery-bar");
    var range = $("cluster-range");

    HMI.state.on("speed", function (v) { speed.textContent = Math.round(v); });
    HMI.state.on("gear", function (v) { gear.textContent = v; });
    HMI.state.on("battery", function (v) {
      battery.textContent = Math.round(v);
      batteryBar.style.height = Math.round(v * 0.975) + "%";  // 80 % → 63 px of 81, as in Figma
    });
    HMI.state.on("range", function (v) { range.textContent = Math.round(v); });
  }

  /* ---------- Guidance ---------- */

  function formatDistance(km) {
    if (km < 1) return Math.max(10, Math.round(km * 1000 / 10) * 10) + " m";
    return (km < 10 ? km.toFixed(1) : Math.round(km)) + " km";
  }

  function initGuidance() {
    var box = $("cluster-guidance");
    var lastTurn = null;

    function update() {
      var dest = HMI.trip.destination();
      var remaining = HMI.state.get("tripRemaining");
      box.classList.toggle("is-visible", !!dest);
      if (!dest || remaining === null || remaining === undefined) return;

      if (HMI.state.get("tripArrived")) {
        render("arrive", HMI.t("guidance.arrived"), HMI.t(dest.name));
        return;
      }

      /* the next step is the first one we have not reached yet */
      var travelled = dest.distance - remaining;
      var step = dest.steps.filter(function (s) { return s.at > travelled; })[0] || dest.steps[dest.steps.length - 1];
      render(step.turn, formatDistance(step.at - travelled), HMI.t(step.street));
    }

    function render(turn, distance, street) {
      if (turn !== lastTurn) {
        $("cluster-turn").innerHTML = HMI.icons[turn];
        $("cluster-turn").setAttribute("aria-label", HMI.t("guidance." + turn));
        lastTurn = turn;
      }
      $("cluster-distance").textContent = distance;
      $("cluster-street").textContent = street;
    }

    HMI.state.on("destination", update);
    HMI.state.on("tripRemaining", update);
    HMI.state.on("tripArrived", update);
  }

  /* ---------- Track playing on the center screen ---------- */

  function initTrack() {
    var box = $("cluster-track");
    var first = true;

    HMI.state.on("centerTrack", function (id) {
      var t = HMI.data.tracks.filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      $("cluster-track-cover").src = t.cover;
      $("cluster-track-title").textContent = t.title;
      $("cluster-track-artist").textContent = t.artist;
      if (!first) {
        box.classList.remove("is-new");
        void box.offsetWidth;           // restart the animation
        box.classList.add("is-new");
      }
      first = false;
    });

    HMI.state.on("centerPlaying", function (playing) {
      box.classList.toggle("is-paused", !playing);
    });
  }

  function init() {
    initDriving();
    initGuidance();
  }

  /* the track needs the media zones, created after the cluster */
  return { init: init, initTrack: initTrack };
})();
