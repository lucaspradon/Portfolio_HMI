/* =========================================================
   CENTER TOUCHSCREEN
   - clock
   - switching between screens (navbar + profile button)
   - Navigation: search, destinations, route on the map
   - Car: doors and climate
   - Apps: favorites
   ========================================================= */

window.HMI = window.HMI || {};

HMI.center = (function () {
  var NAVBAR_STEP = 108;   // icon width (68) + gap (40)

  function $(id) {
    return document.getElementById(id);
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function findDestination(id) {
    return HMI.data.destinations.filter(function (d) { return d.id === id; })[0] || null;
  }

  /* ---------- Clock ---------- */

  function updateClock() {
    var now = new Date();
    $("clock-date").textContent = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear();
    $("clock-time").textContent = pad(now.getHours()) + ":" + pad(now.getMinutes());
  }

  /* ---------- Screen switching ---------- */

  function initNavigationBar() {
    var center = $("center");
    var navItems = Array.prototype.slice.call(center.querySelectorAll(".navbar__item"));
    var select = $("navbar-select");
    var profile = center.querySelector(".round-button--profile");

    var easyItems = Array.prototype.slice.call(center.querySelectorAll(".navbar-easy__item"));

    center.querySelectorAll("[data-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        HMI.state.set({ centerView: button.getAttribute("data-target") });
      });
    });

    /* Simplified mode has no Navigation or Media screen: fall back to Home. */
    HMI.state.on("easy", function (easy) {
      var view = HMI.state.get("centerView");
      if (easy && (view === "navigation" || view === "media")) HMI.state.set({ centerView: "home" });
      else showView(view);
    });
    HMI.state.on("centerView", showView);

    function showView(view) {
      var mode = HMI.state.get("easy") ? "easy" : "normal";
      if (mode === "easy" && (view === "navigation" || view === "media")) {
        HMI.state.set({ centerView: "home" });
        return;
      }
      center.querySelectorAll(".view").forEach(function (section) {
        var sectionMode = section.getAttribute("data-mode");
        section.classList.toggle("is-active",
          section.getAttribute("data-view") === view && (sectionMode === "both" || sectionMode === mode));
      });
      easyItems.forEach(function (item) {
        item.classList.toggle("is-active", item.getAttribute("data-target") === view);
      });

      var index = -1;
      navItems.forEach(function (item, i) {
        var active = item.getAttribute("data-target") === view;
        item.classList.toggle("is-active", active);
        if (active) index = i;
      });

      /* the blue square slides under the active icon */
      if (index >= 0) select.style.transform = "translateX(" + index * NAVBAR_STEP + "px)";
      select.classList.toggle("is-hidden", index < 0);
      profile.classList.toggle("is-active", view === "profile");
    }
  }

  /* ---------- Navigation screen ---------- */

  function renderDestinations(filter) {
    var list = $("nav-destinations");
    var query = (filter || "").trim().toLowerCase();
    var selected = HMI.state.get("selectedDestination");
    list.innerHTML = "";

    var matches = HMI.data.destinations.filter(function (d) {
      var text = (HMI.t(d.name) + " " + (d.address ? HMI.t(d.address) : "")).toLowerCase();
      return !query || text.indexOf(query) >= 0;
    });

    if (!matches.length) {
      list.innerHTML = '<li class="destinations__empty">' + HMI.t("navigation.noResult") + "</li>";
      return;
    }

    matches.forEach(function (d) {
      var li = document.createElement("li");
      li.innerHTML =
        '<button class="destination' + (d.id === selected ? " is-selected" : "") + '" data-id="' + d.id + '">' +
          '<img src="' + d.icon + '" alt="">' +
          '<span class="destination__text">' +
            '<span class="destination__name">' + HMI.t(d.name) + "</span>" +
            (d.address ? '<span class="destination__address">' + HMI.t(d.address) + "</span>" : "") +
          "</span>" +
        "</button>";
      li.firstChild.addEventListener("click", function () {
        HMI.state.set({ selectedDestination: d.id });
      });
      list.appendChild(li);
    });
  }

  function initNavigation() {
    var search = $("nav-search");
    var start = $("nav-start");

    $("nav-map").appendChild(HMI.map.create({ view: { x: 160, y: -100, w: 1095, h: 1200 } }));

    search.addEventListener("input", function () {
      renderDestinations(search.value);
    });

    HMI.state.on("selectedDestination", function () {
      renderDestinations(search.value);
      updateStartButton();
    });

    /* Start → the route is drawn on every map. Pressing again stops it. */
    start.addEventListener("click", function () {
      var active = HMI.state.get("destination");
      var selected = HMI.state.get("selectedDestination");
      if (active && active === selected) {
        HMI.state.set({ destination: null });
      } else if (selected) {
        HMI.state.set({ destination: selected });
      }
    });

    HMI.state.on("destination", function (id) {
      HMI.map.showRoute(findDestination(id));
      updateStartButton();
    });
  }

  function updateStartButton() {
    var selected = HMI.state.get("selectedDestination");
    var active = HMI.state.get("destination");
    var label = $("nav-start-label");
    var key = active && active === selected ? "navigation.stop" : "navigation.start";
    label.setAttribute("data-i18n", key);
    label.textContent = HMI.t(key);
    $("nav-start").disabled = !selected;
  }

  /* ---------- Car screen ---------- */

  function initCar() {
    HMI.state.on("doorsLocked", function (locked) {
      $("car-doors-value").textContent = HMI.t(locked ? "car.locked" : "car.unlocked");
      $("car-doors-toggle").textContent = HMI.t(locked ? "car.unlock" : "car.lock");
    });
    $("car-doors-toggle").addEventListener("click", function () {
      HMI.state.set({ doorsLocked: !HMI.state.get("doorsLocked") });
    });

    HMI.state.on("cabinTemp", function (t) {
      $("car-temp").textContent = t.toFixed(1).replace(".0", "");
    });
    $("car-temp-down").addEventListener("click", function () {
      HMI.state.set({ cabinTemp: Math.max(16, HMI.state.get("cabinTemp") - 0.5) });
    });
    $("car-temp-up").addEventListener("click", function () {
      HMI.state.set({ cabinTemp: Math.min(28, HMI.state.get("cabinTemp") + 0.5) });
    });

    HMI.state.on("battery", function (v) { $("car-battery").textContent = Math.round(v); });
    HMI.state.on("range", function (v) { $("car-range").textContent = Math.round(v); });
  }

  /* ---------- Apps screen ---------- */

  var lastMovedApp = null;   // the tile that just moved gets a small pop-in

  function appTile(app) {
    var favorite = !!app.favorite;
    var full = countFavorites() >= HMI.data.maxFavorites;
    var tile = document.createElement("div");
    tile.className = "app" + (app.id === lastMovedApp ? " is-new" : "");
    tile.innerHTML =
      '<img class="app__icon" src="' + app.icon + '" alt="">' +
      '<span class="app__name">' + app.name + "</span>" +
      '<button class="app__star" aria-label="' + HMI.t(favorite ? "apps.removeFavorite" : "apps.addFavorite") + '"' +
        (!favorite && full ? " disabled" : "") + ">" +
        '<img src="assets/icons/' + (favorite ? "star-filled" : "star") + '.svg" alt="">' +
      "</button>";
    tile.querySelector(".app__star").addEventListener("click", function () {
      app.favorite = !favorite;
      lastMovedApp = app.id;
      renderApps();
    });
    return tile;
  }

  function countFavorites() {
    return HMI.data.apps.filter(function (a) { return a.favorite; }).length;
  }

  function renderApps() {
    var favorites = $("apps-favorites");
    var all = $("apps-all");
    favorites.innerHTML = "";
    all.innerHTML = "";
    HMI.data.apps.forEach(function (app) {
      (app.favorite ? favorites : all).appendChild(appTile(app));
    });

    /* Simplified mode: only the favourites, as big tiles */
    $("easy-apps").innerHTML = HMI.data.apps.filter(function (a) { return a.favorite; }).map(function (app) {
      return '<button class="easy-app"><img src="' + app.icon + '" alt=""><span>' + app.name + "</span></button>";
    }).join("");
  }

  /* ---------- Car screen, simplified mode: tap a dot on the car ---------- */

  function initCarEasy() {
    var spots = $("car-easy-spots");
    var open = null;

    function value(spot) {
      if (spot.id === "battery") return Math.round(HMI.state.get("battery")) + "% · " + Math.round(HMI.state.get("range")) + " km";
      if (spot.id === "doors") return HMI.t(HMI.state.get("doorsLocked") ? "car.locked" : "car.unlocked");
      return HMI.t(spot.value);
    }

    function render() {
      spots.innerHTML = HMI.data.carSpots.map(function (spot) {
        var bubble = spot.id === open
          ? '<span class="car-spot__bubble"><strong>' + HMI.t(spot.label) + "</strong>" + value(spot) +
            (spot.id === "doors" ? '<span class="car-spot__action" data-action="doors">' +
              HMI.t(HMI.state.get("doorsLocked") ? "car.unlock" : "car.lock") + "</span>" : "") + "</span>"
          : "";
        /* spots use Figma screen coordinates; the view starts at (40, 149) */
        return '<button class="car-spot' + (spot.id === open ? " is-open" : "") + '" data-spot="' + spot.id + '" ' +
          'style="left:' + (spot.x - 40) + "px;top:" + (spot.y - 149) + 'px" aria-label="' + HMI.t(spot.label) + '">' + bubble + "</button>";
      }).join("");
    }

    spots.addEventListener("click", function (event) {
      if (event.target.closest("[data-action='doors']")) {
        HMI.state.set({ doorsLocked: !HMI.state.get("doorsLocked") });
        return;
      }
      var spot = event.target.closest("[data-spot]");
      if (!spot) return;
      var id = spot.getAttribute("data-spot");
      open = open === id ? null : id;
      render();
    });

    HMI.state.on("doorsLocked", render);
    HMI.state.on("centerView", function () { open = null; render(); });
  }

  /* ---------- Start ---------- */

  function init() {
    document.getElementById("home-map").appendChild(HMI.map.create({ view: { x: 180, y: 160, w: 900, h: 755 } }));
    document.getElementById("home-easy-map").appendChild(HMI.map.create({ view: { x: 150, y: 120, w: 820, h: 820 } }));
    updateClock();
    setInterval(updateClock, 10000);

    initNavigationBar();
    initNavigation();
    initCar();
    initCarEasy();
    renderApps();
  }

  return { init: init };
})();
