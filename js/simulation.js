/* =========================================================
   DRIVING SIMULATION
   Two modes, stored in HMI.state.driveMode:
   - "auto"   : a loop of phases (parked → accelerate → cruise
                → slow down → city → stop)
   - "manual" : the visitor drives with the keyboard (js/controls.js)
   It writes speed, velocity (negative = reversing), gear,
   lateral position on the road, wheel angle, battery and range
   into HMI.state; the cluster, the road and the wheel read them.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.simulation = (function () {
  /* ---------- Autopilot phases: duration (s), gear, speed to reach ---------- */
  var PHASES = [
    { name: "parked",     duration: 3,  gear: "P", to: 0 },
    { name: "start",      duration: 1,  gear: "D", to: 0 },
    { name: "accelerate", duration: 12, gear: "D", to: 90 },
    { name: "cruise",     duration: 16, gear: "D", to: 90, wobble: 2.5 },
    { name: "slowDown",   duration: 5,  gear: "D", to: 50 },
    { name: "city",       duration: 9,  gear: "D", to: 50, wobble: 1.5 },
    { name: "brake",      duration: 6,  gear: "D", to: 0 },
    { name: "stopped",    duration: 2,  gear: "D", to: 0 }
  ];
  var ACCELERATE_PHASE = 2;

  /* ---------- Manual driving ---------- */
  var MAX_SPEED = 130;         // km/h
  var MAX_REVERSE = 15;        // km/h
  var THROTTLE = 14;           // km/h gained per second
  var BRAKE = 35;              // km/h lost per second
  var COAST = 4;               // km/h lost per second, no key pressed
  var STEER_RATE = 0.8;        // road units per second at full steering (a lane ≈ 1.17)
  var LANE_CENTER = 0.585;     // middle of the right lane
  var ROAD_LIMIT = 1.4;        // a little beyond the edge line, then the car stops sliding
  var MAX_WHEEL_ANGLE = 35;    // degrees
  var BEND_DRIFT = 6;          // how strongly a bend pushes the car outwards if you don't steer
  var AUTO_WHEEL = 1200;       // degrees of wheel per unit of curvature, on autopilot

  /* ---------- Energy ---------- */
  var TICK = 50;               // ms between two updates
  var CONSUMPTION = 0.001;     // % of battery per (km/h · s), exaggerated for the demo
  var REGEN = 0.006;           // % gained per second while braking
  var RANGE_PER_PERCENT = 3.9; // km
  var BATTERY_RESET = 15;      // below this, the demo refills to 80 %

  var phaseIndex = 0;
  var phaseTime = 0;
  var phaseStartSpeed = 0;
  var clock = 0;

  /* smooth start and end of each speed change */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function approach(value, target, maxStep) {
    if (value < target) return Math.min(target, value + maxStep);
    return Math.max(target, value - maxStep);
  }

  /* ---------- One step of the autopilot ---------- */
  function autoStep(dt) {
    var phase = PHASES[phaseIndex];
    phaseTime += dt;
    clock += dt;

    var t = Math.min(1, phaseTime / phase.duration);
    var velocity = phaseStartSpeed + (phase.to - phaseStartSpeed) * ease(t);
    if (phase.wobble) velocity += Math.sin(clock * 0.8) * phase.wobble;

    if (phaseTime >= phase.duration) {
      phaseStartSpeed = phase.to;
      phaseTime = 0;
      phaseIndex = (phaseIndex + 1) % PHASES.length;
    }

    /* the autopilot stays in the middle of the right lane and turns the wheel in bends */
    var lateral = approach(HMI.state.get("lateral"), LANE_CENTER, 0.4 * dt);
    var steer = HMI.road.curvature() * AUTO_WHEEL / MAX_WHEEL_ANGLE;
    return { velocity: Math.max(0, velocity), gear: phase.gear, lateral: lateral, steer: steer };
  }

  /* ---------- One step of manual driving ---------- */
  function manualStep(dt) {
    var input = HMI.controls.input();
    var v = HMI.state.get("velocity");
    var gear = HMI.state.get("gear");

    if (input.forward) {
      v = v < 0 ? approach(v, 0, BRAKE * dt) : Math.min(MAX_SPEED, v + THROTTLE * dt);
    } else if (input.backward) {
      v = v > 0 ? Math.max(0, v - BRAKE * dt) : Math.max(-MAX_REVERSE, v - THROTTLE * 0.5 * dt);
    } else {
      v = approach(v, 0, COAST * dt);
    }

    if (v > 0.3) gear = "D";
    else if (v < -0.3) gear = "R";
    else if (gear === "P" && input.forward) gear = "D";

    /* steering only moves the car when it is rolling;
       in a bend, the car drifts outwards unless you steer */
    var grip = Math.min(1, Math.abs(v) / 40) * (v < 0 ? -1 : 1);
    var drift = -HMI.road.curvature() * (v / 3.6 / 3) * BEND_DRIFT;
    var lateral = HMI.state.get("lateral") + (input.steer * STEER_RATE * grip + drift) * dt;
    lateral = Math.max(-ROAD_LIMIT, Math.min(ROAD_LIMIT, lateral));

    return { velocity: v, gear: gear, lateral: lateral, steer: input.steer };
  }

  function step() {
    if (!HMI.state.get("simulationRunning")) return;
    var dt = TICK / 1000;
    var previous = HMI.state.get("velocity");
    var next = HMI.state.get("driveMode") === "manual" ? manualStep(dt) : autoStep(dt);

    var battery = HMI.state.get("battery");
    var speed = Math.abs(next.velocity);
    battery -= speed * dt * CONSUMPTION;
    if (speed < Math.abs(previous) - 0.01) battery += REGEN * dt;
    if (battery < BATTERY_RESET) battery = 80;

    var angle = approach(HMI.state.get("wheelAngle"), next.steer * MAX_WHEEL_ANGLE, 200 * dt);
    HMI.road.advance(next.velocity * HMI.road.unitsPerKmh * dt);

    HMI.state.set({
      velocity: next.velocity,
      speed: speed,
      gear: next.gear,
      lateral: next.lateral,
      wheelAngle: angle,
      battery: battery,
      range: battery * RANGE_PER_PERCENT
    });
  }

  /* ---------- Modes ---------- */

  function takeControl() {
    HMI.state.set({ driveMode: "manual", simulationRunning: true });
  }

  /* hand back to the autopilot, which speeds up from the current speed */
  function autopilot() {
    phaseIndex = ACCELERATE_PHASE;
    phaseTime = 0;
    phaseStartSpeed = Math.max(0, HMI.state.get("velocity"));
    HMI.state.set({ driveMode: "auto", simulationRunning: true });
  }

  function toggle() {
    if (HMI.state.get("driveMode") === "manual") {
      autopilot();
    } else {
      HMI.state.set({ simulationRunning: !HMI.state.get("simulationRunning") });
    }
  }

  function updateButton() {
    var button = document.getElementById("simulation-toggle");
    var manual = HMI.state.get("driveMode") === "manual";
    var running = HMI.state.get("simulationRunning");
    var icon = manual ? "play" : (running ? "pause" : "play");
    var label = manual ? "simulation.autopilot" : (running ? "simulation.pause" : "simulation.resume");
    button.querySelector("img").src = "assets/icons/" + icon + ".svg";
    button.querySelector("span").textContent = HMI.t(label);
  }

  function init() {
    setInterval(step, TICK);
    document.getElementById("simulation-toggle").addEventListener("click", toggle);
    HMI.state.on("simulationRunning", updateButton);
    HMI.state.on("driveMode", updateButton);
  }

  return { init: init, toggle: toggle, takeControl: takeControl, autopilot: autopilot };
})();
