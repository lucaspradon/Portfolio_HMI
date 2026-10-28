/* =========================================================
   SUGGESTIONS FROM THE PASSENGER
   The passenger never takes control of the driver's screen:
   what they send appears as a banner on the center screen,
   which the driver accepts or ignores (it fades out by itself).
   HMI.suggestion.send({ type: "track" | "destination", id })
   ========================================================= */

window.HMI = window.HMI || {};

HMI.suggestion = (function () {
  var TIMEOUT = 10000;   // ms before the banner hides itself
  var current = null;
  var timer = null;
  var banner;

  function describe(s) {
    if (s.type === "track") {
      var t = HMI.data.tracks.filter(function (x) { return x.id === s.id; })[0];
      return { image: t.cover, title: t.title, subtitle: t.artist, action: "suggestion.play" };
    }
    var d = HMI.data.destinations.filter(function (x) { return x.id === s.id; })[0];
    return { icon: d.icon, title: HMI.t(d.name), subtitle: d.distance + " km · " + d.duration + " min", action: "suggestion.go" };
  }

  function hide() {
    clearTimeout(timer);
    current = null;
    banner.classList.remove("is-visible");
  }

  function send(s) {
    current = s;
    var info = describe(s);
    banner.querySelector(".suggestion__media").innerHTML = info.image
      ? '<img class="suggestion__cover" src="' + info.image + '" alt="">'
      : '<span class="suggestion__icon"><img src="' + info.icon + '" alt=""></span>';
    banner.querySelector(".suggestion__title").textContent = info.title;
    banner.querySelector(".suggestion__subtitle").textContent = info.subtitle;
    banner.querySelector(".suggestion__accept").textContent = HMI.t(info.action);
    banner.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(hide, TIMEOUT);
  }

  function accept() {
    if (!current) return;
    if (current.type === "track") {
      HMI.media.zone("center").play(current.id);
    } else {
      HMI.state.set({ selectedDestination: current.id, destination: current.id });
    }
    hide();
  }

  function init() {
    banner = document.getElementById("suggestion");
    banner.querySelector(".suggestion__accept").addEventListener("click", accept);
    banner.querySelector(".suggestion__dismiss").addEventListener("click", hide);
  }

  return { init: init, send: send };
})();
