/* =========================================================
   CONTENT DATA
   Destinations, apps… everything that is "content" rather
   than interface text. Names that appear on screen point
   to keys in js/strings.js.
   Map coordinates are in the vector map space (1200 × 1000).
   ========================================================= */

window.HMI = window.HMI || {};

HMI.data = {
  /* Where the car is on the map */
  carPosition: { x: 230, y: 734 },

  destinations: [
    {
      id: "home",
      name: "dest.home",
      icon: "assets/icons/house.svg",
      pin: { x: 1000, y: 235 },
      route: "M230 734 L183.6 286 L1000 235.4",
      distance: 6.2,   // km
      duration: 14,    // min
      /* turn-by-turn guidance shown on the cluster: at = km from the start */
      steps: [
        { at: 2.4, turn: "right", street: "street.riverside" },
        { at: 4.9, turn: "straight", street: "street.parkLane" },
        { at: 6.2, turn: "arrive", street: "dest.home" }
      ]
    },
    {
      id: "work",
      name: "dest.work",
      icon: "assets/icons/work.svg",
      pin: { x: 785, y: 537 },
      route: "M230 734 L813 676 L804.6 641.2 L794.5 589.7 L785 537.5",
      distance: 4.8,
      duration: 11,
      steps: [
        { at: 2.9, turn: "left", street: "street.central" },
        { at: 4.8, turn: "arrive", street: "dest.work" }
      ]
    },
    {
      id: "rugby",
      name: "dest.rugby",
      icon: "assets/icons/bookmark.svg",
      pin: { x: 950, y: 238 },
      route: "M230 734 L813 676 L804.6 641.2 L794.5 589.7 L785 537.5 L776.4 484.7 L762.6 376 L753 250 L950 238.5",
      distance: 7.5,
      duration: 17,
      steps: [
        { at: 2.9, turn: "left", street: "street.central" },
        { at: 5.6, turn: "straight", street: "street.northAvenue" },
        { at: 6.9, turn: "right", street: "street.stadium" },
        { at: 7.5, turn: "arrive", street: "dest.rugby" }
      ]
    },
    {
      id: "drums",
      name: "dest.drums",
      icon: "assets/icons/bookmark.svg",
      pin: { x: 1100, y: 528 },
      route: "M230 734 L902 672 L1100 528.6",
      distance: 5.9,
      duration: 13,
      steps: [
        { at: 3.6, turn: "left", street: "street.harbor" },
        { at: 5.9, turn: "arrive", street: "dest.drums" }
      ]
    },
    {
      id: "beach",
      name: "dest.beach",
      address: "dest.beachAddress",
      icon: "assets/icons/history.svg",
      pin: { x: 1190, y: 463 },
      route: "M230 734 L902 672 L1190 463.5",
      distance: 142,
      duration: 108,
      steps: [
        { at: 3.6, turn: "left", street: "street.harbor" },
        { at: 9.0, turn: "straight", street: "street.coast" },
        { at: 142, turn: "arrive", street: "dest.beach" }
      ]
    }
  ],

  apps: [
    { id: "waze", name: "Waze", icon: "assets/images/apps/waze.png", favorite: true },
    { id: "playstore", name: "Play Store", icon: "assets/images/apps/playstore.png", favorite: true },
    { id: "androidauto", name: "Android Auto", icon: "assets/images/apps/androidauto.png", favorite: true },
    { id: "netflix", name: "Netflix", icon: "assets/images/apps/netflix.png" },
    { id: "youtube", name: "YouTube", icon: "assets/images/apps/youtube.png" },
    { id: "music", name: "Music", icon: "assets/images/apps/music.jpg" },
    { id: "firetv", name: "Fire TV", icon: "assets/images/apps/firetv.png" },
    { id: "nvidia", name: "Nvidia", icon: "assets/images/apps/nvidia.png" },
    { id: "karaoke", name: "Karaoke", icon: "assets/images/apps/karaoke.png" },
    { id: "asphalt", name: "Asphalt", icon: "assets/images/apps/asphalt.png" },
    { id: "stars", name: "Stars", icon: "assets/images/apps/stars.png" },
    { id: "zenzone", name: "ZenZone", icon: "assets/images/apps/zenzone.png" },
    { id: "teams", name: "Teams", icon: "assets/images/apps/teams.png" }
  ],

  maxFavorites: 5,

  /* ---------- Profile ---------- */
  themes: ["blue", "rust", "purple", "olive", "green"],   // see --theme-* in css/tokens.css

  wallpapers: [
    { id: "default", thumb: "assets/images/thumbs/default.jpg" },
    { id: "mountain", thumb: "assets/images/thumbs/mountain.jpg" },
    { id: "paint", thumb: "assets/images/thumbs/paint.jpg" }
  ],

  avatars: [
    "assets/images/avatars/user-1.jpg",
    "assets/images/avatars/user-2.jpg",
    "assets/images/avatars/user-3.jpg",
    "assets/images/avatars/user-4.jpg",
    "assets/images/avatars/user-5.jpg"
  ],

  /* Hotspots on the easy-mode car (screen coordinates from Figma) */
  carSpots: [
    { id: "battery", x: 520, y: 487, label: "carEasy.battery" },
    { id: "doors", x: 720, y: 481, label: "carEasy.doors" },
    { id: "tyreRear", x: 751, y: 567, label: "carEasy.tyreRear", value: "carEasy.tyreValue" },
    { id: "lights", x: 558, y: 576, label: "carEasy.lights", value: "carEasy.lightsValue" },
    { id: "tyreFront", x: 660, y: 647, label: "carEasy.tyreFront", value: "carEasy.tyreValue" }
  ],

  /* ---------- Media ----------
     audio: optional file in assets/audio/. If it is missing,
     the player simply simulates playback (no sound). */
  tracks: [
    { id: "a7x", title: "A Little Piece of Heaven", artist: "Avenged Sevenfold", cover: "assets/images/covers/a7x.jpg", duration: 481, audio: "assets/audio/a7x.mp3" },
    { id: "pulsar", title: "Pulsar", artist: "L’Impératrice", cover: "assets/images/covers/pulsar.jpg", duration: 236, audio: "assets/audio/pulsar.mp3" },
    { id: "thrill", title: "Thrill of the Arts", artist: "Vulfpeck", cover: "assets/images/covers/vulfpeck.jpg", duration: 245, audio: "assets/audio/thrill.mp3" },
    { id: "vibes1", title: "Golden Hour", artist: "Good Vibes", cover: "assets/images/covers/vibes-1.jpg", duration: 198, audio: "assets/audio/vibes1.mp3" },
    { id: "vibes2", title: "Balloon Day", artist: "Good Vibes", cover: "assets/images/covers/vibes-2.jpg", duration: 214, audio: "assets/audio/vibes2.mp3" },
    { id: "vibes3", title: "Bubbles", artist: "Good Vibes", cover: "assets/images/covers/vibes-3.jpg", duration: 187, audio: "assets/audio/vibes3.mp3" },
    { id: "vibes4", title: "Night Drive", artist: "Jazz Café", cover: "assets/images/covers/vibes-4.jpg", duration: 226, audio: "assets/audio/vibes4.mp3" }
  ],

  /* Rows of the Media screen. Each item starts a track. */
  shelves: [
    {
      title: "media.favorites",
      items: [
        { title: "media.liked", subtitle: "media.autoPlaylist", cover: "assets/images/covers/liked.jpg", track: "a7x" },
        { title: "Avenged Sevenfold", subtitle: "Album · Avenged Sevenfold", cover: "assets/images/covers/a7x.jpg", track: "a7x" },
        { title: "Pulsar", subtitle: "Album · L’Impératrice", cover: "assets/images/covers/pulsar.jpg", track: "pulsar" },
        { title: "Thrill of the Arts", subtitle: "Album · Vulfpeck", cover: "assets/images/covers/vulfpeck.jpg", track: "thrill" }
      ]
    },
    {
      title: "media.goodVibes",
      items: [
        { title: "Golden Hour", subtitle: "Playlist", cover: "assets/images/covers/vibes-1.jpg", track: "vibes1" },
        { title: "Balloon Day", subtitle: "Playlist", cover: "assets/images/covers/vibes-2.jpg", track: "vibes2" },
        { title: "Bubbles", subtitle: "Playlist", cover: "assets/images/covers/vibes-3.jpg", track: "vibes3" },
        { title: "Night Drive", subtitle: "Playlist", cover: "assets/images/covers/vibes-4.jpg", track: "vibes4" }
      ]
    }
  ],

  sources: [
    { id: "radio", name: "media.radio" },
    { id: "youtube", name: "YouTube Music" },
    { id: "bluetooth", name: "media.bluetooth" }
  ]
};
