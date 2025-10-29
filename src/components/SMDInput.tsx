"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { LineGraphInput } from "./LineGraphInput";

const socket = io("http://localhost:3000"); // your backend socket endpoint

export default function Dashboard() {
  const [pressureData, setPressureData] = useState<{ time: string; value: number }[]>([]);
  const [temperatureData, setTemperatureData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    socket.on("pressure_update", (msg) => {
      // msg has structure: { timestamp, data, relative_timestamps_nanoseconds, ... }

      const formattedTime = new Date(msg.timestamp * 1000)
        .toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

      setPressureData((prev) => [
        ...prev.slice(-20), // keep last 20 points (optional)
        { time: formattedTime, value: msg.data },
      ]);
    });

    socket.on("temperature_update", (msg) => {
      const formattedTime = new Date(msg.timestamp * 1000)
        .toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

      setTemperatureData((prev) => [
        ...prev.slice(-20),
        { time: formattedTime, value: msg.data },
      ]);
    });

    return () => {
      socket.off("pressure_update");
      socket.off("temperature_update");
    };
  }, []);

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <LineGraphInput
        title="Pressure Sensor"
        unit="hPa"
        yDomain={[1010, 1016]}
        color="black"
        data={pressureData}
      />
      <LineGraphInput
        title="Temperature Sensor"
        unit="°C"
        yDomain={[20, 30]}
        color="red"
        data={temperatureData}
      />
    </div>
  );
}
