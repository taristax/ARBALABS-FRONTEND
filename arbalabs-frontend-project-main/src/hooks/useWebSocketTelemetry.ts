import { useState, useEffect } from "react";

export interface TelemetryMetrics {
  radiation: number;
  temp: number;
  power: number;
  inferenceRate: number;
  aiMemory: number;
  aiLoad: number;
  alt: number;
  vel: number;
}

export interface WSEventLog {
  id: string;
  time: string;
  category: "info" | "warning" | "critical" | "milestone";
  message: string;
  details?: string;
}

export function useWebSocketTelemetry() {
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    radiation: 0.15,
    temp: 23.8,
    power: 96,
    inferenceRate: 15.4,
    aiMemory: 42,
    aiLoad: 68,
    alt: 550,
    vel: 27500,
  });

  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<WSEventLog | null>(null);

  useEffect(() => {
    setConnected(true);

    // Simulated WebSocket connection streaming data at 1Hz (every second)
    const interval = setInterval(() => {
      const timeSec = Date.now() / 1000;

      // Realistic telemetry drift using sine/cosine configurations
      const nextMetrics: TelemetryMetrics = {
        radiation: Math.round((0.15 + Math.sin(timeSec / 8) * 0.04 + (Math.random() - 0.5) * 0.008) * 100) / 100,
        temp: Math.round((23.8 + Math.cos(timeSec / 12) * 0.3 + (Math.random() - 0.5) * 0.04) * 10) / 10,
        power: Math.min(100, Math.max(80, Math.round(96 + Math.sin(timeSec / 20) * 3))),
        inferenceRate: Math.round((14.8 + Math.random() * 1.5) * 10) / 10,
        aiMemory: 42,
        aiLoad: Math.min(100, Math.max(30, Math.round(68 + Math.sin(timeSec / 5) * 8 + (Math.random() - 0.5) * 3))),
        alt: Math.round(550 + Math.sin(timeSec / 10) * 10),
        vel: Math.round(27500 + Math.cos(timeSec / 10) * 15),
      };

      setMetrics(nextMetrics);

      // ~12% probability of generating a new event log over the WebSocket stream per second
      if (Math.random() < 0.12) {
        const timeNow = new Date().toISOString().substring(11, 19);
        const categories: Array<"info" | "warning" | "milestone"> = ["info", "warning", "milestone"];
        const selectedCat = categories[Math.floor(Math.random() * categories.length)];

        let newMsg = "";
        let newDetails = "";

        if (selectedCat === "info") {
          newMsg = `WS TELEMETRY BLOCK SYNCED (${Math.floor(10 + Math.random() * 40)} CHUNKS)`;
          newDetails = "Real-time Copernicus telemetry telemetry frame successfully compiled. Checksum valid.";
        } else if (selectedCat === "warning") {
          newMsg = "LEO PROPULSION CARRIER DRIFT";
          newDetails = "Minor guidance path alignment drift identified. Safe correction parameters nominal.";
        } else {
          newMsg = "ARBAEDGE EDGE MODEL CLASSIFICATION NOMINAL";
          newDetails = "Inference accuracy averages at 96.9% across current orbit sector grid.";
        }

        setLog({
          id: `ws-${Date.now()}`,
          time: timeNow,
          category: selectedCat,
          message: newMsg,
          details: newDetails,
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  return { metrics, connected, log };
}
