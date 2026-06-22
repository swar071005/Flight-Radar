// 🔑 IMPORTANT: Paste your token here
Cesium.Ion.defaultAccessToken = "PASTE_YOUR_TOKEN_HERE";

// Create viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
  animation: false,
  timeline: false
});

// Make it look real
viewer.scene.globe.enableLighting = true;
viewer.scene.skyAtmosphere.show = true;

// Move camera to India
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(78, 22, 2000000)
});

// Test point (IMPORTANT - to check if working)
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(77, 28, 100000),
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED
  }
});

// Flight API (India region)
const url = "https://opensky-network.org/api/states/all?lamin=5&lomin=65&lamax=35&lomax=95";

// Load flights
async function loadFlights() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    viewer.entities.removeAll();

    data.states.forEach(flight => {
      let lat = flight[6];
      let lon = flight[5];
      let altitude = flight[7] || 10000;
      let callsign = (flight[1] || "").trim();

      if (!lat || !lon) return;

      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),

        billboard: {
          image: "https://cdn-icons-png.flaticon.com/512/34/34627.png",
          scale: 0.05
        },

        label: {
          text: callsign || "Flight",
          font: "12px sans-serif",
          fillColor: Cesium.Color.CYAN,
          showBackground: true
        }
      });
    });

  } catch (error) {
    console.log("Error:", error);
  }
}

// Load flights
loadFlights();

// Refresh every 15 sec
setInterval(loadFlights, 15000);
