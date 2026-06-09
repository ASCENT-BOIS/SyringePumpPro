export interface PumpConfig {
  address: string;
  volume: number;
  volumeUnit: string;
  rate: number;
  rateUnit: string;
  diameter: number;
  diameterUnit: string;
  mode: "inflow" | "withdraw";
}

export const defaultConfig: Omit<PumpConfig, "address"> = {
  volume: 0,
  volumeUnit: "mL",
  rate: 0,
  rateUnit: "mL/min",
  diameter: 20.0,
  diameterUnit: "mm",
  mode: "inflow",
};
