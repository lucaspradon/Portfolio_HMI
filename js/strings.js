/* =========================================================
   INTERFACE TEXTS
   Every word shown in the interface lives here.
   To add French later: copy the "en" block, rename it "fr",
   translate the values, then call HMI.setLanguage("fr").
   ========================================================= */

window.HMI = window.HMI || {};

HMI.strings = {
  en: {
    "home.shortcuts": "Shortcuts",
    "home.addShortcut": "Add a shortcut",

    "shortcut.rugby": "Rugby",
    "shortcut.simon": "Simon",
    "shortcut.a7x": "Avenged Sevenfold",

    "nav.home": "Home",
    "nav.navigation": "Navigation",
    "nav.media": "Media",
    "nav.car": "Car",
    "nav.apps": "Apps",
    "nav.profile": "Profile",
    "nav.voice": "Voice assistant",

    "media.previous": "Previous track",
    "media.play": "Play",
    "media.pause": "Pause",
    "media.next": "Next track",

    "cluster.speedUnit": "km/h",
    "cluster.rangeUnit": "km",

    "navigation.title": "Navigation",
    "navigation.search": "Enter an address",
    "navigation.start": "Start navigation",
    "navigation.stop": "Stop navigation",
    "navigation.noResult": "No destination found",

    "dest.home": "Home",
    "dest.work": "Work",
    "dest.rugby": "Rugby",
    "dest.drums": "Drum lessons",
    "dest.beach": "Quiberon Beach",
    "dest.beachAddress": "24 Quai de Belle Île, 56170 Quiberon",

    "street.riverside": "Riverside Avenue",
    "street.parkLane": "Park Lane",
    "street.central": "Central Avenue",
    "street.northAvenue": "North Avenue",
    "street.stadium": "Stadium Road",
    "street.harbor": "Harbor Road",
    "street.coast": "Coast Highway",

    "guidance.right": "Turn right",
    "guidance.left": "Turn left",
    "guidance.straight": "Continue",
    "guidance.arrive": "Arrive",
    "guidance.arrived": "You have arrived",

    "media.title": "Media",
    "media.sources": "Sources",
    "media.favorites": "Favorites",
    "media.goodVibes": "Good vibes",
    "media.liked": "Liked music",
    "media.autoPlaylist": "Auto playlist",
    "media.radio": "Radio",
    "media.bluetooth": "Bluetooth",
    "media.seek": "Track position",

    "car.doors": "Doors",
    "car.locked": "Locked",
    "car.unlocked": "Unlocked",
    "car.lock": "Lock",
    "car.unlock": "Unlock",
    "car.climate": "Climate",
    "car.warmer": "Warmer",
    "car.cooler": "Cooler",
    "car.tyres": "Tyres",
    "car.tyresOk": "All good",
    "car.battery": "Battery",

    "apps.favorites": "Favorites",
    "apps.all": "Applications",
    "apps.addFavorite": "Add to favorites",
    "apps.removeFavorite": "Remove from favorites",

    "profile.title": "Profile",
    "profile.colour": "Interface colour",
    "profile.wallpaper": "Wallpaper",
    "profile.easyTitle": "Simplified mode",
    "profile.easyText": "Reduces distractions and the number of menus for a more intuitive use.",
    "profile.activate": "Activate",
    "profile.deactivate": "Deactivate",
    "profile.chooseAvatar": "Choose a profile picture",
    "profile.addAvatar": "Add a picture",
    "profile.cancel": "Cancel",
    "profile.validate": "Confirm",
    "profile.editAvatar": "Change profile picture",
    "profile.you": "You",

    "theme.blue": "Blue",
    "theme.rust": "Rust",
    "theme.purple": "Purple",
    "theme.olive": "Olive",
    "theme.green": "Green",

    "wallpaper.default": "Waves",
    "wallpaper.mountain": "Mountain",
    "wallpaper.paint": "Paint",

    "carEasy.lights": "Headlights",
    "carEasy.lightsValue": "Automatic",
    "carEasy.doors": "Doors",
    "carEasy.tyreFront": "Front tyre",
    "carEasy.tyreRear": "Rear tyre",
    "carEasy.tyreValue": "2.4 bar · OK",
    "carEasy.battery": "Battery",

    "welcome.start": "START",

    "voice.say.jazz": "Play some jazz",
    "voice.say.home": "Take me home",
    "voice.say.temperature": "Set the temperature to 20 degrees",
    "voice.say.battery": "How much battery do I have?",
    "voice.say.easy": "Switch to simplified mode",
    "voice.reply.jazz": "Here is some jazz: {title} by {artist}.",
    "voice.reply.home": "Let's go home. {min} minutes, arriving at {time}.",
    "voice.reply.temperature": "Done, the cabin is set to 20°C.",
    "voice.reply.battery": "You have {battery}% left, about {range} km.",
    "voice.reply.easyOn": "Simplified mode is on. Fewer menus, bigger buttons.",
    "voice.reply.easyOff": "Back to the full interface.",

    "map.downtown": "Downtown",
    "map.riverside": "Riverside",
    "map.northPark": "North Park",
    "map.harbor": "Harbor",
    "map.oldTown": "Old Town",

    "passenger.title": "Passenger",
    "passenger.sendTrack": "Send to driver",
    "passenger.send": "Send to driver",
    "passenger.library": "Your music",
    "passenger.trip": "Trip",
    "passenger.arrival": "Arrival",
    "passenger.kmLeft": "km left",
    "passenger.minLeft": "min",
    "passenger.arrived": "You have arrived",
    "passenger.whereTo": "Where to? Suggest a destination",
    "passenger.sent": "Sent",

    "suggestion.label": "Passenger suggests",
    "suggestion.play": "Play",
    "suggestion.go": "Go",
    "suggestion.dismiss": "Dismiss",

    "portfolio.name": "Lucas Pradon",
    "portfolio.title": "In-car HMI prototype",

    "mobile.cluster": "Cluster",
    "mobile.center": "Center",
    "mobile.passenger": "Passenger",
    "mobile.rotate": "Turn your phone to see the whole cabin",

    "notes.toggle": "Design notes",
    "notes.open": "Design note",
    "notes.prev": "Previous",
    "notes.next": "Next",
    "notes.close": "Close",

    "simulation.pause": "Pause drive",
    "simulation.resume": "Resume drive",
    "simulation.autopilot": "Autopilot",
    "simulation.keysHint": "{keys} or arrow keys to drive"
  }
};

HMI.language = "en";

/* Returns the text for a key in the current language. */
HMI.t = function (key) {
  var table = HMI.strings[HMI.language] || HMI.strings.en;
  return table[key] !== undefined ? table[key] : (HMI.strings.en[key] || key);
};

/* Fills every element that has data-i18n="key" (text),
   data-i18n-placeholder="key" (input hint)
   or data-i18n-label="key" (accessible label). */
HMI.applyStrings = function (root) {
  root = root || document;
  root.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = HMI.t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.setAttribute("placeholder", HMI.t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-label]").forEach(function (el) {
    var label = HMI.t(el.getAttribute("data-i18n-label"));
    el.setAttribute("aria-label", label);
    el.setAttribute("title", label);
  });
};

HMI.setLanguage = function (lang) {
  HMI.language = lang;
  HMI.applyStrings();
};
