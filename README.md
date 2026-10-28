# In-car HMI prototype — Lucas Pradon

An interactive, playable car cabin built from my Figma design: driver cluster, center touchscreen and a passenger screen, sharing one state.

**Live demo:** https://lucaspradon.github.io/Portfolio_HMI/

- Driving simulation with a road that follows the cluster speed (take the wheel with ZQSD / WASD or the arrow keys)
- Center screen: home, navigation, media, car, apps, profile, plus a simplified "easy" mode
- Passenger screen: own music, trip summary, suggestions sent to the driver
- Voice assistant demo (VPA) with real actions
- "Design notes" layer explaining the design choices

Plain HTML / CSS / JavaScript, no build step: open `index.html` to run it locally.

## Where to change things

| What | File |
|---|---|
| Colours, type, spacing, radii, themes | `css/tokens.css` |
| Interface texts | `js/strings.js` |
| Destinations, apps, tracks | `js/data.js` |
| Design notes | `js/notes.js` |
| VPA look | `js/vpa.js` + `css/vpa.css` |
| Driving feel | top of `js/simulation.js` and `js/road.js` |
