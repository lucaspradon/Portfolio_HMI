/* =========================================================
   PASSENGER SCREEN
   - own music (zone "passenger" in js/media.js)
   - send a track or a destination to the driver (js/suggestion.js)
   - trip summary: destination, arrival time, distance left (js/trip.js)
   ========================================================= */

window.HMI = window.HMI || {};

HMI.passenger = (function () {
  function $(id) {
    return document.getElementById(id);
  }

  /* a button briefly says "Sent" to confirm the action */
  function confirmSent(button) {
    var label = button.querySelector("span");
    if (!label) return;
    var original = label.textContent;
    button.classList.add("is-sent");
    label.textContent = HMI.t("passenger.sent");
    setTimeout(function () {
      button.classList.remove("is-sent");
      label.textContent = original;
    }, 1600);
  }

  function initMusic() {
    var zone = HMI.media.zone("passenger");

    $("passenger-send-track").addEventListener("click", function () {
      HMI.suggestion.send({ type: "track", id: HMI.state.get("passengerTrack") });
      confirmSent(this);
    });

    var list = $("passenger-tracks");
    list.innerHTML = HMI.data.tracks.slice(0, 4).map(function (t) {
      return '<button class="mini-track" data-track="' + t.id + '">' +
        '<img src="' + t.cover + '" alt="">' +
        '<span class="mini-track__title">' + t.title + "</span>" +
        '<span class="mini-track__artist">' + t.artist + "</span>" +
      "</button>";
    }).join("");
    list.querySelectorAll("[data-track]").forEach(function (button) {
      button.addEventListener("click", function () { zone.play(button.getAttribute("data-track")); });
    });

    HMI.state.on("passengerTrack", function (id) {
      list.querySelectorAll("[data-track]").forEach(function (button) {
        button.classList.toggle("is-current", button.getAttribute("data-track") === id);
      });
    });
  }

  function initTrip() {
    var card = $("passenger-trip");

    var list = $("passenger-destinations");
    list.innerHTML = HMI.data.destinations.map(function (d) {
      return '<li><button class="trip__suggestion" data-destination="' + d.id + '" aria-label="' + HMI.t("passenger.send") + " · " + HMI.t(d.name) + '">' +
        '<img src="' + d.icon + '" alt="">' +
        '<span class="trip__suggestion-name">' + HMI.t(d.name) + "</span>" +
        '<span class="trip__suggestion-send"><img src="assets/icons/navigate.svg" alt=""></span>' +
      "</button></li>";
    }).join("");
    list.querySelectorAll("[data-destination]").forEach(function (button) {
      button.addEventListener("click", function () {
        HMI.suggestion.send({ type: "destination", id: button.getAttribute("data-destination") });
        button.classList.add("is-sent");
        setTimeout(function () { button.classList.remove("is-sent"); }, 1600);
      });
    });

    HMI.state.on("destination", function () {
      var dest = HMI.trip.destination();
      card.classList.toggle("has-route", !!dest);
      $("trip-destination").textContent = dest ? HMI.t(dest.name) : "";
    });

    HMI.state.on("tripRemaining", function (km) {
      if (km === null || km === undefined) return;
      $("trip-remaining").textContent = km < 10 ? km.toFixed(1) : Math.round(km);
    });
    HMI.state.on("tripMinutes", function (minutes) {
      if (minutes === null || minutes === undefined) return;
      $("trip-minutes").textContent = minutes;
      $("trip-eta").textContent = HMI.trip.arrivalTime(minutes);
    });
    HMI.state.on("tripProgress", function (p) {
      $("trip-bar").style.width = Math.round((p || 0) * 100) + "%";
    });
    HMI.state.on("tripArrived", function (arrived) {
      card.classList.toggle("is-arrived", !!arrived);
    });
  }

  function updateClock() {
    var now = new Date();
    $("passenger-clock").textContent = (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
  }

  function init() {
    initMusic();
    initTrip();
    updateClock();
    setInterval(updateClock, 10000);
  }

  return { init: init };
})();
