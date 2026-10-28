/* =========================================================
   VPA — VIRTUAL PERSONAL ASSISTANT (appearance only)
   A self-contained visual component with four states:
     idle · listening · thinking · speaking
   It knows nothing about the scenario (that is js/voice.js).

   TO REPLACE THE LOOK: rewrite markup() below and css/vpa.css.
   Keep the same API and the rest of the prototype keeps working:
     var vpa = HMI.vpa.create(containerElement);
     vpa.setState("listening");   // idle | listening | thinking | speaking
     vpa.setLevel(0.6);           // 0 → 1, voice loudness (listening / speaking)
   ========================================================= */

window.HMI = window.HMI || {};

HMI.vpa = (function () {
  var STATES = ["idle", "listening", "thinking", "speaking"];

  function markup() {
    return '<div class="vpa__glow"></div>' +
      '<div class="vpa__orb">' +
        '<span class="vpa__blob vpa__blob--1"></span>' +
        '<span class="vpa__blob vpa__blob--2"></span>' +
        '<span class="vpa__blob vpa__blob--3"></span>' +
      "</div>" +
      '<div class="vpa__ring"></div>';
  }

  function create(container) {
    var root = document.createElement("div");
    root.className = "vpa";
    root.setAttribute("data-state", "idle");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = markup();
    container.appendChild(root);

    return {
      element: root,
      setState: function (state) {
        if (STATES.indexOf(state) >= 0) root.setAttribute("data-state", state);
      },
      setLevel: function (level) {
        root.style.setProperty("--vpa-level", Math.max(0, Math.min(1, level)).toFixed(2));
      }
    };
  }

  return { create: create, states: STATES };
})();
