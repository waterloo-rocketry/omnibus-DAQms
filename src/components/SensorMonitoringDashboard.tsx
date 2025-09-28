import React from "react";
import { LineGraph } from "./LineGraph";

export const SensorMonitoringDashboard = () => {
  return (
    <>
      <div className="flex gap-4">
        <div className="flex-1">
          <LineGraph />
        </div>
        <div className="flex-1">
          <LineGraph />
        </div>
        <div className="flex-1">
          <LineGraph />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <LineGraph />
        </div>
        <div className="flex-1">
          <LineGraph />
        </div>
        <div className="flex-1">
          <LineGraph />
        </div>
      </div>
    </>
  );
};
