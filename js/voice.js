/* =========================================================
   VOICE ASSISTANT — demo scenario
   Click the mic: the VPA listens (the sentence types itself),
   thinks, then answers and really acts on the interface.
   Each click plays the next command of COMMANDS.
   Click the mic again during the scenario to cancel it.
   The VPA's look lives in js/vpa.js + css/vpa.css.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.voice = (function () {
  var LISTEN_TIME = 2200;   // ms
  var THINK_TIME = 1100;
  var TYPE_SPEED = 32;      // ms per character of the answer
  var CLOSE_DELAY = 2600;   // ms the answer stays once written

  function track(id) {
    return HMI.data.tracks.filter(function (t) { return t.id === id; })[0];
  }

  /* say: what the driver says · run: the action, returns the answer */
  var COMMANDS = [
    {
      say: "voice.say.jazz",
      run: function () {
        HMI.media.zone("center").play("vibes4");
        var t = track("vibes4");
        return HMI.t("voice.reply.jazz").replace("{title}", t.title).replace("{artist}", t.artist);
      }
    },
    {
      say: "voice.say.home",
      run: function () {
        HMI.state.set({ selectedDestination: "home", destination: "home", centerView: "navigation" });
        var home = HMI.data.destinations[0];
        return HMI.t("voice.reply.home").replace("{min}", home.duration).replace("{time}", HMI.trip.arrivalTime(home.duration));
      }
    },
    {
      say: "voice.say.temperature",
      run: function () {
        HMI.state.set({ cabinTemp: 20 });
        return HMI.t("voice.reply.temperature");
      }
    },
    {
      say: "voice.say.battery",
      run: function () {
        return HMI.t("voice.reply.battery")
          .replace("{battery}", Math.round(HMI.state.get("battery")))
          .replace("{range}", Math.round(HMI.state.get("range")));
      }
    },
    {
      say: "voice.say.easy",
      run: function () {
        var easy = !HMI.state.get("easy");
        HMI.state.set({ easy: easy });
        return HMI.t(easy ? "voice.reply.easyOn" : "voice.reply.easyOff");
      }
    }
  ];

  var next = 0;
  var timers = [];
  var levelTimer = null;
  var vpa, panel, heard, answer;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  /* types text into an element, one character at a time */
  function type(el, text, duration, done) {
    var step = Math.max(10, duration / Math.max(1, text.length));
    el.textContent = "";
    text.split("").forEach(function (char, i) {
      later(function () {
        el.textContent += char;
        if (i === text.length - 1 && done) done();
      }, i * step);
    });
  }

  /* a fake voice level, so the VPA reacts while listening / speaking */
  function animateLevel(on) {
    clearInterval(levelTimer);
    if (!on) { vpa.setLevel(0); return; }
    levelTimer = setInterval(function () { vpa.setLevel(0.25 + Math.random() * 0.75); }, 110);
  }

  function setState(state) {
    vpa.setState(state);
    HMI.state.set({ voiceState: state });
    animateLevel(state === "listening" || state === "speaking");
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    setState("idle");
    panel.classList.remove("is-open");
  }

  function run() {
    timers.forEach(clearTimeout);   // a new request cancels the closing of the previous one
    timers = [];
    var command = COMMANDS[next];
    next = (next + 1) % COMMANDS.length;

    panel.classList.add("is-open");
    answer.textContent = "";
    setState("listening");
    type(heard, "“" + HMI.t(command.say) + "”", LISTEN_TIME * 0.8);

    later(function () { setState("thinking"); }, LISTEN_TIME);

    later(function () {
      var reply = command.run();
      setState("speaking");
      type(answer, reply, reply.length * TYPE_SPEED, function () {
        later(function () { setState("idle"); }, 300);
        later(stop, CLOSE_DELAY);
      });
    }, LISTEN_TIME + THINK_TIME);
  }

  function init() {
    panel = document.getElementById("voice-panel");
    heard = document.getElementById("voice-heard");
    answer = document.getElementById("voice-answer");
    vpa = HMI.vpa.create(document.getElementById("voice-vpa"));

    document.querySelector(".round-button--voice").addEventListener("click", function () {
      if (HMI.state.get("voiceState") && HMI.state.get("voiceState") !== "idle") stop();
      else run();
    });

    HMI.state.on("voiceState", function (state) {
      document.querySelector(".round-button--voice").classList.toggle("is-active", !!state && state !== "idle");
    });
  }

  return { init: init, run: run, stop: stop };
})();
