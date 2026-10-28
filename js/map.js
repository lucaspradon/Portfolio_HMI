/* =========================================================
   VECTOR MAP
   A fictional city drawn in SVG, so routes and pins can be
   animated. Colors come from the --map-* tokens.
   - HMI.map.create(options) returns a new <svg> element
   - HMI.map.showRoute(destination) draws the route on every map
   ========================================================= */

window.HMI = window.HMI || {};

HMI.map = (function () {
  var VIEW_W = 1200;
  var VIEW_H = 1000;
  var maps = [];

  /* Main roads (yellow). Routes in js/data.js follow them. */
  var MAJOR_ROADS = [
    "M-300 315 L1500 205",
    "M125 -300 L285 1300",
    "M760 -50 C720 400 820 700 900 1050 L957 1300",
    "M760 -50 L782 -300",
    "M-300 783.1 L1500 616.9",
    "M100 1252.8 L1500 239"
  ];

  var LABELS = [
    { key: "map.downtown", x: 620, y: 560, size: 40, weight: 600 },
    { key: "map.northPark", x: 955, y: 200, size: 28, weight: 500 },
    { key: "map.riverside", x: 300, y: 250, size: 28, weight: 500 },
    { key: "map.oldTown", x: 170, y: 700, size: 30, weight: 500 },
    { key: "map.harbor", x: 1100, y: 900, size: 28, weight: 500 }
  ];

  function minorGrid() {
    var out = "";
    for (var gx = -500; gx <= 1700; gx += 92) {
      out += "M" + gx + " -500 L" + gx + " 1500 ";
    }
    for (var gy = -500; gy <= 1500; gy += 92) {
      out += "M-500 " + gy + " L1700 " + gy + " ";
    }
    return out;
  }

  function pinMarkup() {
    return '<path d="M0 0 C-6 -18 -30 -32 -30 -56 A30 30 0 1 1 30 -56 C30 -32 6 -18 0 0 Z" style="fill:var(--map-pin)"/>' +
      '<circle cx="0" cy="-56" r="11" fill="#9e2a20"/>';
  }

  /* options.view = the part of the city to show: { x, y, w, h } */
  function create(options) {
    options = options || {};
    var view = options.view || { x: 0, y: 0, w: VIEW_W, h: VIEW_H };
    var car = HMI.data.carPosition;

    var labels = LABELS.map(function (l) {
      return '<text x="' + l.x + '" y="' + l.y + '" text-anchor="middle" font-size="' + l.size +
        '" font-weight="' + l.weight + '" style="fill:var(--map-label);font-family:var(--font-family)" ' +
        'paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">' + HMI.t(l.key) + "</text>";
    }).join("");

    var major = MAJOR_ROADS.map(function (d) {
      return '<path d="' + d + '" fill="none" style="stroke:var(--map-road-major-edge)" stroke-width="26" stroke-linecap="round"/>' +
        '<path d="' + d + '" fill="none" style="stroke:var(--map-road-major)" stroke-width="18" stroke-linecap="round"/>';
    }).join("");

    var markup =
      '<rect x="-500" y="-500" width="2200" height="2000" style="fill:var(--map-land)"/>' +
      /* city blocks: a slightly rotated street grid */
      '<g transform="rotate(-8 600 500)"><path d="' + minorGrid() + '" style="stroke:var(--map-road)" stroke-width="9" fill="none"/></g>' +
      /* parks */
      '<rect x="840" y="90" width="230" height="190" rx="18" style="fill:var(--map-park)"/>' +
      '<rect x="110" y="470" width="150" height="120" rx="14" style="fill:var(--map-park)"/>' +
      '<ellipse cx="620" cy="830" rx="90" ry="60" style="fill:var(--map-park)"/>' +
      '<rect x="-200" y="-150" width="260" height="200" rx="20" style="fill:var(--map-park)"/>' +
      /* river and harbor */
      '<path d="M440 -400 C420 -150 400 -100 420 -60 C380 200 520 360 470 560 C430 760 560 900 540 1080 C520 1250 560 1350 560 1500" fill="none" style="stroke:var(--map-water)" stroke-width="110"/>' +
      '<path d="M1600 740 C1300 760 1100 780 1000 880 C960 960 980 1100 960 1500 L1600 1500 Z" style="fill:var(--map-water)"/>' +
      /* main roads cross the river on bridges */
      major +
      /* route (filled by showRoute) */
      '<path class="map__route-casing" d="" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="map__route" d="" fill="none" style="stroke:var(--color-accent)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' +
      labels +
      /* destination pin, hidden until a destination is chosen */
      '<g class="map__pin" style="display:none">' + pinMarkup() + "</g>" +
      /* the car */
      '<g transform="translate(' + car.x + " " + car.y + ')">' +
        '<circle r="34" style="fill:var(--color-accent)" opacity="0.25"/>' +
        '<circle r="18" style="fill:var(--color-accent)" stroke="#fff" stroke-width="6"/>' +
      "</g>";

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = markup;
    maps.push(svg);
    return svg;
  }

  /* Draws the route to a destination on every map (null = clear). */
  function showRoute(destination) {
    maps.forEach(function (svg) {
      var route = svg.querySelector(".map__route");
      var casing = svg.querySelector(".map__route-casing");
      var pin = svg.querySelector(".map__pin");

      if (!destination) {
        route.setAttribute("d", "");
        casing.setAttribute("d", "");
        pin.style.display = "none";
        return;
      }

      route.setAttribute("d", destination.route);
      casing.setAttribute("d", destination.route);
      pin.setAttribute("transform", "translate(" + destination.pin.x + " " + destination.pin.y + ")");
      pin.style.display = "";

      /* "drawing" animation: the line grows from the car to the pin */
      [casing, route].forEach(function (path) {
        var length = path.getTotalLength();
        path.style.transition = "none";
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.getBoundingClientRect();
        path.style.transition = "stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)";
        path.style.strokeDashoffset = 0;
      });
    });
  }

  return { create: create, showRoute: showRoute };
})();
