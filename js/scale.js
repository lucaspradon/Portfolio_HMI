/* =========================================================
   FIT THE CABIN TO THE WINDOW
   The stage is drawn at 4400 × 2100 and scaled with one
   transform (keeping its proportions), without scroll.
   - landscape: the whole cabin fits the window
   - portrait (phones): the "camera" zooms on one screen at a
     time, chosen with the bottom tabs (HMI.state.mobileScreen)
   ========================================================= */

window.HMI = window.HMI || {};

HMI.scale = (function () {
  var STAGE_W = 4400;
  var STAGE_H = 2100;

  /* where each screen sits on the stage (see css/base.css) */
  var SCREENS = {
    cluster:   { x: 380,  y: 640, w: 1092, h: 401 },
    center:    { x: 1900, y: 600, w: 1280, h: 1125 },
    passenger: { x: 3330, y: 700, w: 1000, h: 560 }
  };

  /* room kept for the header (top) and the tabs (bottom) in portrait */
  var PORTRAIT_TOP = 64;
  var PORTRAIT_BOTTOM = 160;
  var PORTRAIT_SIDE = 16;

  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  function fit() {
    var stage = document.getElementById("stage");
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var portrait = isPortrait();
    var scale, tx, ty;

    document.body.classList.toggle("is-portrait", portrait);

    if (portrait) {
      var box = SCREENS[HMI.state.get("mobileScreen")] || SCREENS.center;
      var availW = vw - PORTRAIT_SIDE * 2;
      var availH = vh - PORTRAIT_TOP - PORTRAIT_BOTTOM;
      scale = Math.min(availW / box.w, availH / box.h);
      tx = vw / 2 - (box.x + box.w / 2) * scale;
      ty = PORTRAIT_TOP + availH / 2 - (box.y + box.h / 2) * scale;
    } else {
      scale = Math.min(vw / STAGE_W, vh / STAGE_H);
      tx = (vw - STAGE_W * scale) / 2;
      ty = (vh - STAGE_H * scale) / 2;
    }

    stage.style.transform = "translate(" + tx.toFixed(1) + "px, " + ty.toFixed(1) + "px) scale(" + scale.toFixed(5) + ")";
  }

  function init() {
    fit();
    window.addEventListener("resize", fit);
    HMI.state.on("mobileScreen", fit);
  }

  return { init: init, fit: fit, isPortrait: isPortrait };
})();
