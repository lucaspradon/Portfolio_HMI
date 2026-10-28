/* =========================================================
   WELCOME SEQUENCE (Figma "WS")
   The three screens start black with a slow blend of colours.
   START wakes the car up: screens fade in, the drive begins.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.welcome = (function () {
  function start() {
    HMI.state.set({ started: true, simulationRunning: true });
  }

  function init() {
    document.getElementById("welcome-start").addEventListener("click", start);
    HMI.state.on("started", function (started) {
      document.body.classList.toggle("is-started", started);
    });
  }

  return { init: init, start: start };
})();
