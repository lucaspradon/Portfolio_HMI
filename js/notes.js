/* =========================================================
   DESIGN NOTES — rewrite freely
   Each note becomes a numbered dot on the prototype.
     target : CSS selector of the element the dot sits on
              (or point: { x, y } in cabin coordinates, 4400 × 2100)
     anchor : where on the element, 0 → 1 ({ x: 0, y: 0 } = top-left)
     title  : one short line
     text   : two or three sentences
   The order of the list is the order of the guided tour.
   ========================================================= */

window.HMI = window.HMI || {};

HMI.notes = [
  {
    target: "#cluster .cluster__speed",
    anchor: { x: 0.1, y: 0.1 },
    title: "Speed first, everything else second",
    text: "The cluster keeps a strict hierarchy: speed is the biggest element, the gear sits in a calm pill, energy is a single bar. Nothing competes with the road for the driver's attention."
  },
  {
    target: "#cluster .cluster__gear",
    anchor: { x: 1, y: 0.1 },
    title: "Guidance and music where the eyes already are",
    text: "When a route starts, the next turn appears above the gear; the track playing sits below it. Both stay inside the opening of the steering wheel, so the driver never has to look at the center screen to know where to turn."
  },
  {
    point: { x: 2300, y: 300 },
    title: "A prototype you drive",
    text: "The road follows the speed shown on the cluster and has real bends. Take the wheel (ZQSD / WASD or arrows) and try to stay in your lane while using the screens: it turns glanceability into something you can feel."
  },
  {
    target: "#home-map",
    anchor: { x: 0, y: 0 },
    title: "Three glanceable blocks",
    text: "Home only shows what matters on the road: where I am going, my shortcuts and what I am listening to. Each block is a large, rounded glass card readable in under two seconds."
  },
  {
    target: ".navbar",
    anchor: { x: 0.5, y: 0 },
    title: "A fixed, thumb-friendly navigation",
    text: "Five destinations, always at the same place at the bottom of the screen, within reach of the driver's hand. The selected square slides rather than jumps, to confirm the action without demanding a look."
  },
  {
    target: ".round-button--voice",
    anchor: { x: 0.85, y: 0.15 },
    title: "Voice, always one tap away",
    text: "The assistant sits on the driver's side and answers with real actions: music, navigation, climate. Talking is the safest way to interact while driving, so it never hides behind a menu."
  },
  {
    target: ".round-button--profile",
    anchor: { x: 0.15, y: 0.15 },
    title: "Personal, and simpler on demand",
    text: "The profile sets the interface colour and wallpaper on all three screens. It also hosts the simplified mode: fewer screens, bigger targets and a warmer palette for drivers who want less on their plate."
  },
  {
    target: "#passenger-trip",
    anchor: { x: 0, y: 0 },
    title: "The passenger as a co-pilot",
    text: "The passenger screen answers the passenger's questions (when do we arrive, how far is it) so the driver is not asked them. Its own music plays on headphones, independently from the cabin."
  },
  {
    target: "#passenger-send-track",
    anchor: { x: 0.1, y: 0.2 },
    title: "Suggest, never take over",
    text: "A track or a destination sent by the passenger appears as a banner on the center screen. The driver accepts with one tap or simply ignores it: the banner disappears by itself. The driver stays in control."
  }
];
