import "./style.css";
import { Map, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { PERIODS } from "./timescale";

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
  const sourceHeading = document.createElement("h4");
  sourceHeading.textContent = "Source map";
  container.appendChild(sourceHeading);

  addRow(container, "Title", properties.ref_title);
  addRow(container, "Author", properties.ref_authors);
  addRow(container, "Year", properties.ref_year);
  addRow(container, "Reference source", properties.ref_source);

  return container;
}

function applyAgeFilter(map: Map, minMa: number, maxMa: number): void {
  map.setFilter("units-fill", [
    "all",
    ["==", ["typeof", ["get", "best_age_top"]], "number"],
    ["==", ["typeof", ["get", "best_age_bottom"]], "number"],
    ["<=", ["get", "best_age_top"], maxMa],
    [">=", ["get", "best_age_bottom"], minMa],
  ]);
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

  const minInput = document.getElementById("age-min") as HTMLInputElement;
  const maxInput = document.getElementById("age-max") as HTMLInputElement;
  const applyButton = document.getElementById("age-apply") as HTMLButtonElement;
  const status = document.getElementById("age-status") as HTMLParagraphElement;

  const applyFromInputs = (): void => {
    const minMa = minInput.valueAsNumber;
    const maxMa = maxInput.valueAsNumber;

    if (Number.isNaN(minMa) || Number.isNaN(maxMa)) {
      status.textContent = "Enter a number in both boxes. Filter unchanged.";
      return;
    }
    if (minMa > maxMa) {
      status.textContent =
        "The younger limit must not be larger than the older limit. Filter unchanged.";
      return;
    }

    applyAgeFilter(map, minMa, maxMa);
    status.textContent = `Showing units whose age overlaps ${minMa} to ${maxMa} Ma. Units with no age are hidden.`;
  };

  applyButton.addEventListener("click", applyFromInputs);
  applyFromInputs();

  const clearButton = document.getElementById("age-clear") as HTMLButtonElement;

  clearButton.addEventListener("click", () => {
    map.setFilter("units-fill", null);
    status.textContent = "Showing all units, including units with no age.";
  });

  const periodSelect = document.getElementById(
    "age-period",
  ) as HTMLSelectElement;

  const customOption = document.createElement("option");
  customOption.value = "";
  customOption.textContent = "Custom range";
  periodSelect.appendChild(customOption);

  PERIODS.forEach((period) => {
    const option = document.createElement("option");
    option.value = period.name;
    option.textContent = period.name;
    periodSelect.appendChild(option);
  });

  periodSelect.addEventListener("change", () => {
    const period = PERIODS.find((p) => p.name === periodSelect.value);
    if (period === undefined) {
      return;
    }
    minInput.value = String(period.youngerMa);
    maxInput.value = String(period.olderMa);
    applyFromInputs();
  });

  const markCustomRange = (): void => {
    periodSelect.value = "";
  };
  minInput.addEventListener("input", markCustomRange);
  maxInput.addEventListener("input", markCustomRange);

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
