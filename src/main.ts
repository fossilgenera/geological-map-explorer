import "./style.css";
import { Map, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);

const map = new Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [19.34, -33.42],
  zoom: 7.2,
});

map.on("load", () => {
  map.addSource("macrostrat", {
    type: "vector",
    tiles: ["https://tiles.macrostrat.org/carto/{z}/{x}/{y}.mvt"],
    minzoom: 0,
    maxzoom: 22,
    attribution:
      '<a href="https://macrostrat.org" target="_blank" rel="noopener">Macrostrat</a> ' +
      '(<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>), ' +
      "original map sources per unit",
  });

  map.addLayer({
    id: "units-fill",
    type: "fill",
    source: "macrostrat",
    "source-layer": "units",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.7,
    },
  });

  map.addLayer({
    id: "lines-stroke",
    type: "line",
    source: "macrostrat",
    "source-layer": "lines",
    paint: {
      "line-color": "#333333",
      "line-width": 1,
    },
  });

  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["units-fill"],
    });

    if (features.length === 0) {
      return;
    }

    const name = features[0].properties?.name;

    new Popup().setLngLat(e.lngLat).setText(name).addTo(map);
  });

  map.on("mouseenter", "units-fill", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "units-fill", () => {
    map.getCanvas().style.cursor = "";
  });
});
