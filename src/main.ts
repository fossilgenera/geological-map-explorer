import "./style.css";
import { Map, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);

const map = new Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [19.0, -33.5],
  zoom: 2,
});

console.log("map object created", map);
