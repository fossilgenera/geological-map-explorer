import "./style.css";
import { Map, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);

function addRow(parent: HTMLElement, label: string, value: unknown): void {
  if (value === undefined || value === null || value === "") {
    return;
  }

  const row = document.createElement("p");

  const labelElement = document.createElement("strong");
  labelElement.textContent = `${label}: `;

  row.appendChild(labelElement);
  row.appendChild(document.createTextNode(String(value)));
  parent.appendChild(row);
}

function buildPopupContent(properties: Record<string, unknown>): HTMLElement {
  const container = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = String(properties.name ?? "Unnamed unit");
  container.appendChild(title);

  addRow(container, "Age", properties.age);

  const ageTop = properties.best_age_top;
  const ageBottom = properties.best_age_bottom;
  if (typeof ageTop === "number" && typeof ageBottom === "number") {
    addRow(
      container,
      "Age range",
      `${ageBottom} to ${ageTop} million years ago`,
    );
  }

  addRow(container, "Lithology", properties.lith);
  addRow(container, "Description", properties.descrip);
  addRow(container, "Comments", properties.comments);

  return container;
}

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

    const properties = features[0].properties ?? {};

    new Popup()
      .setLngLat(e.lngLat)
      .setDOMContent(buildPopupContent(properties))
      .addTo(map);
  });

  map.on("mouseenter", "units-fill", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "units-fill", () => {
    map.getCanvas().style.cursor = "";
  });
});
