/* =========================================================
   SHARED STATE
   One single source of truth for the three screens.
   A screen changes a value with HMI.state.set({...});
   every screen that listens with HMI.state.on(...) updates.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.state = (function () {
  var values = {
    started: false,       // false while the welcome sequence is shown
    mobileScreen: "center", // portrait phones: cluster | center | passenger
    theme: "blue",        // blue | rust | purple | olive | green
    wallpaper: "default", // default | mountain | paint
    easy: false,          // simplified mode
    avatar: null,         // path of the chosen profile picture (null = icon)
    voiceState: "idle",   // idle | listening | thinking | speaking
    centerView: "home",   // home | navigation | media | car | apps | profile
    selectedDestination: null,  // destination highlighted in the list
    destination: null,          // destination being guided to
    doorsLocked: true,
    cabinTemp: 21,        // °C
    simulationRunning: false,   // becomes true when START is pressed
    driveMode: "auto",    // auto | manual (keyboard)
    velocity: 0,          // km/h, negative when reversing
    lateral: 0.585,       // position across the road (0.585 = middle of the right lane)
    wheelAngle: 0,        // degrees
    speed: 0,             // km/h
    gear: "P",            // P | R | N | D
    battery: 80,          // %
    range: 312            // km
  };
  var listeners = {};

  function get(key) {
    return values[key];
  }

  function set(patch) {
    var changed = [];
    Object.keys(patch).forEach(function (key) {
      if (values[key] !== patch[key]) {
        values[key] = patch[key];
        changed.push(key);
      }
    });
    changed.forEach(function (key) {
      (listeners[key] || []).forEach(function (fn) { fn(values[key], values); });
    });
  }

  /* Calls fn now and every time "key" changes. */
  function on(key, fn) {
    (listeners[key] = listeners[key] || []).push(fn);
    fn(values[key], values);
  }

  return { get: get, set: set, on: on };
})();
