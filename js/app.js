/* =========================================================
   START-UP — wires every part together, in order.
   ========================================================= */

(function () {
  /* no animations while the page sets itself up */
  document.body.classList.add("is-loading");

  HMI.applyStrings();
  HMI.scale.init();
  HMI.cabin.init();
  HMI.road.init();
  HMI.cluster.init();
  HMI.simulation.init();
  HMI.controls.init();
  HMI.media.init();
  HMI.cluster.initTrack();
  HMI.center.init();
  HMI.profile.init();
  HMI.trip.init();
  HMI.suggestion.init();
  HMI.passenger.init();
  HMI.voice.init();
  HMI.notesLayer.init();
  HMI.mobile.init();
  HMI.welcome.init();

  /* Deep links, handy to share a precise screen:
     index.html?view=navigation&destination=work */
  var params = new URLSearchParams(window.location.search);
  var patch = {};
  /* any deep link skips the welcome sequence */
  if (params.toString()) { patch.started = true; patch.simulationRunning = true; }
  if (params.get("view")) patch.centerView = params.get("view");
  if (params.get("theme")) patch.theme = params.get("theme");
  if (params.get("wallpaper")) patch.wallpaper = params.get("wallpaper");
  if (params.get("easy")) patch.easy = params.get("easy") === "1";
  if (params.get("screen")) patch.mobileScreen = params.get("screen");   // portrait phones
  if (params.get("destination")) {
    patch.selectedDestination = params.get("destination");
    patch.destination = params.get("destination");
  }
  HMI.state.set(patch);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.remove("is-loading");
    });
  });
})();
