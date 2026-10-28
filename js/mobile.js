/* =========================================================
   PORTRAIT PHONES
   One screen at a time: the bottom tabs (or the mini map of
   the dashboard) choose HMI.state.mobileScreen; js/scale.js
   moves the "camera" onto that screen. The shared state is
   untouched, so the three screens stay in sync.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.mobile = (function () {
  var SCREEN_IDS = { cluster: "cluster", center: "center", passenger: "passenger" };

  function init() {
    var nav = document.getElementById("mobile-nav");

    nav.querySelectorAll("[data-screen]").forEach(function (el) {
      el.addEventListener("click", function () {
        HMI.state.set({ mobileScreen: el.getAttribute("data-screen") });
      });
    });

    HMI.state.on("mobileScreen", function (screen) {
      nav.querySelectorAll("[data-screen]").forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-screen") === screen);
      });
      /* only the chosen screen is shown in portrait (see css/mobile.css) */
      Object.keys(SCREEN_IDS).forEach(function (key) {
        document.getElementById(SCREEN_IDS[key]).classList.toggle("is-focused", key === screen);
      });
    });
  }

  return { init: init };
})();
