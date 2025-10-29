import React from "react";
import { LineGraph } from "./LineGraph";

export const SensorMonitoringDashboard = () => {
  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <LineGraph />
        <LineGraph />
        <LineGraph />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <LineGraph />
        <LineGraph />
        <LineGraph />
      </div>
    </div>
  );
};
