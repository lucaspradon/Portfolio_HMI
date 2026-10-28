/* =========================================================
   KEYBOARD DRIVING
   Uses the PHYSICAL position of the keys (event.code), so the
   same keys work on every keyboard:
     AZERTY : Z Q S D      QWERTY : W A S D      + arrow keys
   Pressing a driving key switches the car to manual mode.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.controls = (function () {
  var KEYS = {
    KeyW: "forward", ArrowUp: "forward",
    KeyS: "backward", ArrowDown: "backward",
    KeyA: "left", ArrowLeft: "left",
    KeyD: "right", ArrowRight: "right"
  };
  var pressed = { forward: false, backward: false, left: false, right: false };

  /* keys typed in a text field or on a slider are not for driving */
  function isTyping(event) {
    var el = event.target;
    if (!el || !el.getAttribute) return false;
    return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.getAttribute("role") === "slider";
  }

  function onKey(event, down) {
    var action = KEYS[event.code];
    if (!action || isTyping(event) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!HMI.state.get("started")) return;   // the car is still asleep (welcome sequence)
    event.preventDefault();
    if (down && HMI.state.get("driveMode") !== "manual") HMI.simulation.takeControl();
    pressed[action] = down;
  }

  function input() {
    return {
      forward: pressed.forward,
      backward: pressed.backward,
      steer: (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0)
    };
  }

  /* Shows "ZQSD" or "WASD" depending on the visitor's keyboard. */
  function showHint() {
    var hint = document.getElementById("drive-hint");
    function render(letters) {
      hint.textContent = HMI.t("simulation.keysHint").replace("{keys}", letters);
    }
    render(/^fr|^be/i.test(navigator.language) ? "ZQSD" : "WASD");
    if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
      navigator.keyboard.getLayoutMap().then(function (map) {
        var letters = ["KeyW", "KeyA", "KeyS", "KeyD"].map(function (code) {
          return (map.get(code) || "").toUpperCase();
        }).join("");
        if (letters.length === 4) render(letters);
      }).catch(function () {});
    }
  }

  function init() {
    window.addEventListener("keydown", function (e) { onKey(e, true); });
    window.addEventListener("keyup", function (e) { onKey(e, false); });
    /* release everything if the window loses focus mid-press */
    window.addEventListener("blur", function () {
      Object.keys(pressed).forEach(function (k) { pressed[k] = false; });
    });
    showHint();
  }

  return { init: init, input: input };
})();
