export interface GeologicPeriod {
  name: string;
  youngerMa: number;
  olderMa: number;
}

export const PERIODS: GeologicPeriod[] = [
  { name: "Quaternary", youngerMa: 0, olderMa: 2.58 },
  { name: "Neogene", youngerMa: 2.58, olderMa: 23.03 },
  { name: "Paleogene", youngerMa: 23.03, olderMa: 66.0 },
  { name: "Cretaceous", youngerMa: 66.0, olderMa: 145.0 },
  { name: "Jurassic", youngerMa: 145.0, olderMa: 201.3 },
  { name: "Triassic", youngerMa: 201.3, olderMa: 251.902 },
  { name: "Permian", youngerMa: 251.902, olderMa: 298.9 },
  { name: "Carboniferous", youngerMa: 298.9, olderMa: 358.9 },
  { name: "Devonian", youngerMa: 358.9, olderMa: 419.2 },
  { name: "Silurian", youngerMa: 419.2, olderMa: 443.8 },
  { name: "Ordovician", youngerMa: 443.8, olderMa: 485.4 },
  { name: "Cambrian", youngerMa: 485.4, olderMa: 541.0 },
];
