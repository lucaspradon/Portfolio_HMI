/* =========================================================
   TRIP
   Follows the active destination while the car drives:
   remaining distance, minutes left and arrival time.
   Writes into HMI.state:
     tripRemaining  km left (null when no route)
     tripMinutes    minutes left
     tripProgress   0 → 1
     tripArrived    true for a few seconds at the end
   ========================================================= */

window.HMI = window.HMI || {};

HMI.trip = (function () {
  var METRES_PER_UNIT = 3;      // 1 road unit ≈ 3 m (see js/road.js)
  var ARRIVED_DELAY = 6000;     // ms the "arrived" message stays
  var startDistance = 0;
  var arrivedTimer = null;

  function destination() {
    var id = HMI.state.get("destination");
    return HMI.data.destinations.filter(function (d) { return d.id === id; })[0] || null;
  }

  function update() {
    var dest = destination();
    if (!dest) return;
    var travelledKm = (HMI.road.distance() - startDistance) * METRES_PER_UNIT / 1000;
    var remaining = Math.max(0, dest.distance - travelledKm);
    HMI.state.set({
      tripRemaining: remaining,
      tripMinutes: Math.ceil(dest.duration * remaining / dest.distance),
      tripProgress: 1 - remaining / dest.distance
    });
    if (remaining === 0 && !HMI.state.get("tripArrived")) {
      HMI.state.set({ tripArrived: true });
      arrivedTimer = setTimeout(function () { HMI.state.set({ destination: null }); }, ARRIVED_DELAY);
    }
  }

  /* "14:32": the clock time of arrival */
  function arrivalTime(minutes) {
    var at = new Date(Date.now() + minutes * 60000);
    return (at.getHours() < 10 ? "0" : "") + at.getHours() + ":" + (at.getMinutes() < 10 ? "0" : "") + at.getMinutes();
  }

  function init() {
    HMI.state.on("destination", function (id) {
      clearTimeout(arrivedTimer);
      startDistance = HMI.road.distance();
      HMI.state.set({ tripArrived: false });
      if (!id) HMI.state.set({ tripRemaining: null, tripMinutes: null, tripProgress: 0 });
      update();
    });
    setInterval(update, 1000);
  }

  return { init: init, destination: destination, arrivalTime: arrivalTime };
})();
