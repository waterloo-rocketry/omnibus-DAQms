import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { DAQMessage, ChartDataPoint, ConnectionStatus, ChannelDataMap } from '../types/daq';

/**
 * Context value interface
 */
interface DAQContextValue {
  channelData: ChannelDataMap;
  connectionStatus: ConnectionStatus;
  error: string | null;
}

/**
 * DAQ Context for global WebSocket state management
 */
const DAQContext = createContext<DAQContextValue | undefined>(undefined);

/**
 * Configuration
 */
const SOCKET_URL = 'ws://localhost:8081';
const MAX_BUFFER_SIZE = 100; // Keep last 100 data points per channel

/**
 * DAQ Provider Component
 */
export const DAQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [channelData, setChannelData] = useState<ChannelDataMap>(new Map());
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse DAQ message and convert to chart-ready format
   */
  const parseMessage = useCallback((msg: DAQMessage) => {
    const { data, relative_timestamps_nanoseconds, timestamp: baseTimestamp } = msg.payload;

    // Process each sensor channel (Fake0-Fake7)
    Object.entries(data).forEach(([sensorName, values]) => {
      // Convert each sample to chart data point
      const chartPoints: ChartDataPoint[] = values.map((value, idx) => ({
        timestamp: baseTimestamp + (relative_timestamps_nanoseconds[idx] / 1_000_000), // ns to ms
        value: value,
      }));

      // Update channel data with buffer limit
      setChannelData((prev) => {
        const existing = prev.get(sensorName) || [];
        const updated = [...existing, ...chartPoints].slice(-MAX_BUFFER_SIZE);
        const newMap = new Map(prev);
        newMap.set(sensorName, updated);
        return newMap;
      });
    });
  }, []);

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Force WebSocket transport
      reconnection: true, // Enable auto-reconnection
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 5000, // Max 5s delay
      reconnectionAttempts: Infinity, // Keep trying
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[DAQ] Connected to backend');
      setConnectionStatus('connected');
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[DAQ] Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('[DAQ] Connection error:', err.message);
      setConnectionStatus('error');
      setError(err.message);
    });

    // Message handler - parse incoming DAQ data
    newSocket.on('message', (msg: DAQMessage) => {
      parseMessage(msg);
    });

    // Cleanup on unmount
    return () => {
      console.log('[DAQ] Disconnecting socket');
      newSocket.close();
    };
  }, [parseMessage]);

  const value: DAQContextValue = {
    channelData,
    connectionStatus,
    error,
  };

  return <DAQContext.Provider value={value}>{children}</DAQContext.Provider>;
};

/**
 * Custom hook to consume DAQ context
 */
export const useDAQContext = (): DAQContextValue => {
  const context = useContext(DAQContext);
  if (context === undefined) {
    throw new Error('useDAQContext must be used within a DAQProvider');
  }
  return context;
};
