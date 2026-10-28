/* =========================================================
   CABIN ILLUSTRATION
   A neutral, unbranded car interior drawn in SVG.
   Coordinates are in stage pixels (stage = 4400 × 2100).
   - back layer : windshield (with the road), dashboard, vents
   - front layer: steering wheel, drawn over the cluster
   ========================================================= */

window.HMI = window.HMI || {};

HMI.cabin = (function () {
  var W = 4400;
  var H = 2100;

  /* Steering wheel centre, aligned on the cluster centre (380 + 1092 / 2). */
  var WHEEL_X = 926;
  var WHEEL_Y = 1330;

  function svg(content) {
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + content + "</svg>";
  }

  function back() {
    return svg(
      "<defs>" +
        '<linearGradient id="cabin-dash-grad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" style="stop-color:var(--cabin-dash-light)"/>' +
          '<stop offset="0.25" style="stop-color:var(--cabin-dash)"/>' +
          '<stop offset="1" style="stop-color:var(--cabin-bg)"/>' +
        "</linearGradient>" +
        '<linearGradient id="cabin-roof-grad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" style="stop-color:var(--cabin-headliner)"/>' +
          '<stop offset="1" style="stop-color:var(--cabin-dash-light)"/>' +
        "</linearGradient>" +
        '<clipPath id="cabin-windshield"><path d="M380 70 L4020 70 L4400 780 L0 780 Z"/></clipPath>' +
      "</defs>" +

      /* Outside world, seen through the windshield (filled by js/road.js) */
      '<g id="road" clip-path="url(#cabin-windshield)"></g>' +

      /* Roof and A-pillars */
      '<path d="M0 0 H4400 V70 H0 Z" fill="url(#cabin-roof-grad)"/>' +
      '<path d="M0 0 H380 L380 70 L0 780 Z" style="fill:var(--cabin-dash)"/>' +
      '<path d="M4400 0 H4020 L4020 70 L4400 780 Z" style="fill:var(--cabin-dash)"/>' +
      '<path d="M380 70 L0 780" style="stroke:var(--cabin-dash-light)" stroke-width="10"/>' +
      '<path d="M4020 70 L4400 780" style="stroke:var(--cabin-dash-light)" stroke-width="10"/>' +

      /* Rear-view mirror */
      '<rect x="2525" y="60" width="30" height="80" style="fill:var(--cabin-dash)"/>' +
      '<rect x="2340" y="120" width="400" height="120" rx="56" style="fill:var(--cabin-dash);stroke:var(--cabin-dash-light)" stroke-width="6"/>' +

      /* Dashboard */
      '<path d="M0 660 C700 590 1500 560 2200 560 C2900 560 3700 590 4400 660 L4400 2100 L0 2100 Z" fill="url(#cabin-dash-grad)"/>' +
      '<path d="M0 660 C700 590 1500 560 2200 560 C2900 560 3700 590 4400 660" fill="none" style="stroke:var(--cabin-dash-light)" stroke-width="8"/>' +

      /* Cluster hood */
      '<rect x="320" y="585" width="1212" height="480" rx="240" style="fill:var(--cabin-bezel);stroke:var(--cabin-dash-light)" stroke-width="6"/>' +

      /* Left air vent */
      '<rect x="60" y="880" width="200" height="190" rx="44" style="fill:var(--cabin-bezel);stroke:var(--cabin-dash-light)" stroke-width="6"/>' +
      vents(80, 920, 160, 4, 36) +

      /* Passenger air vent, under the passenger screen */
      '<rect x="3480" y="1390" width="700" height="96" rx="48" style="fill:var(--cabin-bezel);stroke:var(--cabin-dash-light)" stroke-width="6"/>' +
      vents(3520, 1420, 620, 2, 36) +

      /* Center console strip, under the center screen */
      '<rect x="2010" y="1800" width="1060" height="110" rx="55" style="fill:var(--cabin-bezel);stroke:var(--cabin-trim)" stroke-width="6"/>' +
      consoleButtons() +
      '<circle cx="2540" cy="1855" r="78" style="fill:var(--cabin-dash);stroke:var(--cabin-trim)" stroke-width="10"/>' +
      '<circle cx="2540" cy="1855" r="44" style="fill:var(--cabin-bezel)"/>'
    );
  }

  function vents(x, y, width, count, step) {
    var out = "";
    for (var i = 0; i < count; i++) {
      out += '<rect x="' + x + '" y="' + (y + i * step) + '" width="' + width + '" height="8" rx="4" style="fill:var(--cabin-dash-light)"/>';
    }
    return out;
  }

  function consoleButtons() {
    var out = "";
    var xs = [2100, 2210, 2320, 2700, 2810, 2920];
    xs.forEach(function (x, i) {
      out += '<rect x="' + x + '" y="1835" width="80" height="40" rx="12" style="fill:var(--cabin-dash)"/>';
      if (i === 0) {
        /* hazard button */
        out += '<path d="M' + (x + 40) + ' 1843 L' + (x + 54) + ' 1867 L' + (x + 26) + ' 1867 Z" fill="none" stroke="#e5483c" stroke-width="4"/>';
      } else {
        out += '<rect x="' + (x + 26) + '" y="1851" width="28" height="8" rx="4" style="fill:var(--cabin-trim)" opacity="0.6"/>';
      }
    });
    return out;
  }

  /* Mirrors an x coordinate around the wheel axis. */
  function mx(x) {
    return 2 * WHEEL_X - x;
  }

  function spoke(sign) {
    var f = sign < 0 ? function (x) { return x; } : mx;
    return (
      '<path d="M' + f(110) + " 1230 L" + f(660) + " 1190 L" + f(660) + " 1490 L" + f(140) + " 1480 Q" + f(96) + " 1360 " + f(110) + ' 1230 Z" fill="url(#wheel-leather)"/>' +
      /* chrome loop around the thumb controls */
      '<rect x="' + Math.min(f(240), f(580)) + '" y="1250" width="340" height="180" rx="80" style="fill:var(--cabin-leather);stroke:var(--cabin-trim)" stroke-width="12"/>' +
      '<circle cx="' + f(410) + '" cy="1340" r="34" style="fill:var(--cabin-bezel);stroke:var(--cabin-leather-light)" stroke-width="4"/>' +
      '<circle cx="' + f(320) + '" cy="1340" r="12" style="fill:var(--cabin-leather-light)"/>' +
      '<circle cx="' + f(500) + '" cy="1340" r="12" style="fill:var(--cabin-leather-light)"/>'
    );
  }

  function front() {
    return svg(
      "<defs>" +
        '<radialGradient id="wheel-leather" cx="0.5" cy="0.35" r="0.7">' +
          '<stop offset="0" style="stop-color:var(--cabin-leather-light)"/>' +
          '<stop offset="1" style="stop-color:var(--cabin-leather)"/>' +
        "</radialGradient>" +
        '<linearGradient id="cabin-fade" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" style="stop-color:var(--cabin-bg)" stop-opacity="0"/>' +
          '<stop offset="1" style="stop-color:var(--cabin-bg)"/>' +
        "</linearGradient>" +
      "</defs>" +

      /* the whole wheel turns with HMI.state.wheelAngle */
      '<g class="steering-wheel" id="steering-wheel">' +

      /* Rim */
      '<circle cx="' + WHEEL_X + '" cy="' + WHEEL_Y + '" r="830" fill="none" style="stroke:var(--cabin-leather)" stroke-width="100"/>' +
      '<circle cx="' + WHEEL_X + '" cy="' + WHEEL_Y + '" r="868" fill="none" style="stroke:var(--cabin-leather-light)" stroke-width="6" opacity="0.8"/>' +
      '<circle cx="' + WHEEL_X + '" cy="' + WHEEL_Y + '" r="784" fill="none" style="stroke:var(--cabin-leather-light)" stroke-width="4" opacity="0.6"/>' +

      /* Spokes */
      spoke(-1) +
      spoke(1) +
      '<path d="M800 1600 L1052 1600 L1110 2150 L742 2150 Z" fill="url(#wheel-leather)"/>' +

      /* Hub */
      '<path d="M640 1090 Q926 980 1212 1090 Q1260 1300 1220 1460 Q926 1640 632 1460 Q592 1300 640 1090 Z" fill="url(#wheel-leather)"/>' +
      '<path d="M700 1130 Q926 1050 1152 1130" fill="none" style="stroke:var(--cabin-leather-light)" stroke-width="6" opacity="0.7"/>' +
      "</g>" +

      /* Soft fade at the bottom edge of the stage */
      '<rect x="0" y="1800" width="' + W + '" height="300" fill="url(#cabin-fade)"/>'
    );
  }

  function init() {
    document.getElementById("cabin-back").innerHTML = back();
    document.getElementById("cabin-front").innerHTML = front();

    var wheel = document.getElementById("steering-wheel");
    wheel.style.transformOrigin = WHEEL_X + "px " + WHEEL_Y + "px";
    HMI.state.on("wheelAngle", function (angle) {
      wheel.style.transform = "rotate(" + angle.toFixed(1) + "deg)";
    });
  }

  return { init: init, width: W, height: H };
})();
