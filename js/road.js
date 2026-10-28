/* =========================================================
   ROAD SEEN THROUGH THE WINDSHIELD
   A simple perspective: things far away sit near the horizon,
   things close to the car sit lower and are drawn larger.
   - the road follows a looping track of straights and bends (TRACK)
   - the markings scroll at HMI.state.velocity
   - the car's position across the road is HMI.state.lateral
   1 road unit ≈ 3 m.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.road = (function () {
  var NS = "http://www.w3.org/2000/svg";

  var HORIZON = 360;      // y of the horizon on the stage
  var DEPTH = 420;        // vertical spread of the ground (y = HORIZON + DEPTH / z)
  var SPREAD = 1900;      // horizontal spread (x = VP + X * SPREAD / z)
  var VP = 1700;          // vanishing point, towards the middle of the windshield
  var Z_NEAR = 0.3;
  var Z_FAR = 90;
  var SAMPLES = 70;       // points used to draw the bends

  var LANE = 1.17;              // one lane ≈ 3.5 m
  var ROAD_EDGE = LANE;         // two lanes, from -LANE to +LANE
  var POST_X = LANE + 0.9;

  var DASH_PERIOD = 4;    // distance between two dash starts (≈ 12 m)
  var DASH_LENGTH = 1.6;
  var POST_PERIOD = 7;

  /* The track loops forever. length in road units, curve > 0 bends right.
     Each change of curve is blended over BLEND units for smooth bends. */
  var TRACK = [
    { length: 140, curve: 0 },
    { length: 90,  curve: 0.012 },
    { length: 60,  curve: 0 },
    { length: 110, curve: -0.010 },
    { length: 150, curve: 0 },
    { length: 70,  curve: -0.016 },
    { length: 50,  curve: 0 },
    { length: 100, curve: 0.008 },
    { length: 60,  curve: 0 }
  ];
  var BLEND = 30;
  var TRACK_LENGTH = TRACK.reduce(function (sum, s) { return sum + s.length; }, 0);

  var HILLS_WIDTH = 4400;
  var HILLS_SHIFT = 900;  // how much the horizon slides in a bend

  var distance = 0;       // distance travelled, in road units (advanced by js/simulation.js)
  var lastAdvance = 0;    // time of the last advance, to smooth the display between two
  var offset = 0;         // distance actually drawn
  var camera = 0;         // HMI.state.lateral
  var hillsX = 0;
  var drawn = { offset: null, camera: null };
  var zs = [];            // sample depths, dense near the car
  var centers = [];       // road centre offset at each sample depth
  var hills, asphalt, edges, dashes, posts;

  for (var i = 0; i < SAMPLES; i++) {
    zs.push(Z_NEAR * Math.pow(Z_FAR / Z_NEAR, i / (SAMPLES - 1)));
  }

  /* ---------- Track ---------- */

  function curvatureAt(distance) {
    var s = ((distance % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
    for (var i = 0; i < TRACK.length; i++) {
      if (s < TRACK[i].length) {
        var previous = TRACK[(i - 1 + TRACK.length) % TRACK.length].curve;
        var t = Math.min(1, s / BLEND);
        return previous + (TRACK[i].curve - previous) * t;
      }
      s -= TRACK[i].length;
    }
    return 0;
  }

  /* Bends: integrate the curvature ahead of the car to find
     how far the road centre drifts sideways at each depth. */
  function computeCenters() {
    var slope = 0, center = 0, previousZ = 0;
    for (var i = 0; i < zs.length; i++) {
      var dz = zs[i] - previousZ;
      slope += curvatureAt(offset + zs[i]) * dz;
      center += slope * dz;
      centers[i] = center;
      previousZ = zs[i];
    }
  }

  function centerAt(z) {
    if (z <= zs[0]) return centers[0];
    for (var i = 1; i < zs.length; i++) {
      if (z <= zs[i]) {
        var t = (z - zs[i - 1]) / (zs[i] - zs[i - 1]);
        return centers[i - 1] + (centers[i] - centers[i - 1]) * t;
      }
    }
    return centers[centers.length - 1];
  }

  /* ---------- Projection ---------- */

  function y(z) { return HORIZON + DEPTH / z; }
  function x(X, z) { return VP + (X + centerAt(z) - camera) * SPREAD / z; }

  function pt(X, z) {
    return x(X, z).toFixed(1) + " " + y(z).toFixed(1);
  }

  /* A strip on the ground between lateral X1..X2 and depths z1..z2,
     following the bends. */
  function strip(X1, X2, z1, z2) {
    var depths = [z1];
    zs.forEach(function (z) { if (z > z1 && z < z2) depths.push(z); });
    depths.push(z2);
    var left = depths.map(function (z) { return pt(X1, z); });
    var right = depths.slice().reverse().map(function (z) { return pt(X2, z); });
    return "M" + left.join(" L") + " L" + right.join(" L") + " Z";
  }

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function build(group) {
    var defs = el("defs", {});
    defs.innerHTML =
      '<linearGradient id="road-sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" style="stop-color:var(--road-sky-top)"/>' +
        '<stop offset="1" style="stop-color:var(--road-sky-horizon)"/>' +
      "</linearGradient>";
    group.appendChild(defs);

    group.appendChild(el("rect", { x: 0, y: 0, width: 4400, height: HORIZON + 1, fill: "url(#road-sky)" }));

    /* distant hills: drawn twice side by side so they can slide endlessly in bends */
    var hillsPath = "C400 300 700 320 1000 335 C1400 300 1800 280 2300 330 C2800 290 3300 300 3700 320 C4000 300 4200 320 4400 330 L4400 " + (HORIZON + 1) + " L0 " + (HORIZON + 1) + " Z";
    hills = el("g", { style: "fill:var(--road-verge)", opacity: "0.55" });
    [-HILLS_WIDTH, 0, HILLS_WIDTH].forEach(function (dx) {
      hills.appendChild(el("path", { d: "M0 330 " + hillsPath, transform: "translate(" + dx + " 0)" }));
    });
    group.appendChild(hills);

    group.appendChild(el("rect", { x: 0, y: HORIZON, width: 4400, height: 800, style: "fill:var(--road-ground)" }));

    asphalt = el("path", { style: "fill:var(--road-asphalt)" });
    edges = el("path", { style: "fill:var(--road-marking)", opacity: "0.85" });
    dashes = el("path", { style: "fill:var(--road-marking)" });
    posts = el("path", { style: "fill:var(--road-marking)", opacity: "0.9" });
    [asphalt, edges, dashes, posts].forEach(function (p) { group.appendChild(p); });
  }

  function draw() {
    computeCenters();
    var E = ROAD_EDGE;
    asphalt.setAttribute("d", strip(-E - 0.08, E + 0.08, Z_NEAR, Z_FAR));
    edges.setAttribute("d", strip(-E + 0.01, -E + 0.05, Z_NEAR, Z_FAR) + strip(E - 0.05, E - 0.01, Z_NEAR, Z_FAR));

    /* ((a % n) + n) % n keeps the result positive when reversing */
    var d = "";
    var start = DASH_PERIOD - (((offset % DASH_PERIOD) + DASH_PERIOD) % DASH_PERIOD);
    for (var z = start - DASH_PERIOD; z < Z_FAR; z += DASH_PERIOD) {
      var z1 = Math.max(z, Z_NEAR);
      var z2 = Math.min(z + DASH_LENGTH, Z_FAR);
      if (z2 > z1) d += strip(-0.02, 0.02, z1, z2);
    }
    dashes.setAttribute("d", d);

    /* roadside posts: thin vertical bars standing on the verge */
    var p = "";
    var pStart = POST_PERIOD - (((offset % POST_PERIOD) + POST_PERIOD) % POST_PERIOD);
    for (var zp = pStart; zp < Z_FAR; zp += POST_PERIOD) {
      [-POST_X, POST_X].forEach(function (X) {
        var base = y(zp);
        var width = 0.05 * SPREAD / zp;
        var height = 0.45 * SPREAD / zp;
        var left = x(X, zp) - width / 2;
        p += "M" + left.toFixed(1) + " " + base.toFixed(1) +
          " h" + width.toFixed(1) + " v" + (-height).toFixed(1) +
          " h" + (-width).toFixed(1) + " Z";
      });
    }
    posts.setAttribute("d", p);

    var shift = ((hillsX % HILLS_WIDTH) + HILLS_WIDTH) % HILLS_WIDTH;
    hills.setAttribute("transform", "translate(" + shift.toFixed(1) + " 0)");
  }

  /* Called by the simulation at each step: the car moved by "units". */
  function advance(units) {
    distance += units;
    hillsX -= curvatureAt(distance) * units * HILLS_SHIFT;
    lastAdvance = Date.now();
  }

  function unitsPerSecond() {
    return (HMI.state.get("velocity") || 0) / 3.6 / 3;   // km/h → m/s → units
  }

  /* Each frame: draw where the car should be right now, extrapolating
     a few milliseconds past the last simulation step for a smooth motion. */
  function tick() {
    var ahead = 0;
    if (HMI.state.get("simulationRunning")) {
      ahead = unitsPerSecond() * Math.min((Date.now() - lastAdvance) / 1000, 0.05);
    }
    offset = distance + ahead;
    camera = HMI.state.get("lateral");
    if (offset !== drawn.offset || camera !== drawn.camera) {
      draw();
      drawn.offset = offset;
      drawn.camera = camera;
    }
    requestAnimationFrame(tick);
  }

  function init() {
    var group = document.getElementById("road");
    if (!group) return;
    build(group);
    camera = HMI.state.get("lateral");
    draw();
    requestAnimationFrame(tick);
  }

  return {
    init: init,
    lane: LANE,
    advance: advance,
    unitsPerKmh: 1 / 3.6 / 3,
    /* curvature of the road where the car is (used by js/simulation.js) */
    curvature: function () { return curvatureAt(distance); },
    distance: function () { return distance; }
  };
})();
