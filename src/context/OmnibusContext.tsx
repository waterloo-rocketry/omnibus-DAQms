import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { OmnibusMessage, ChartDataPoint, ConnectionStatus, ChannelDataMap } from '../types/omnibus';

/**
 * Context value interface
 */
interface OmnibusContextValue {
  channelData: ChannelDataMap;
  connectionStatus: ConnectionStatus;
  error: string | null;
}

/**
 * Omnibus Context for global WebSocket state management
 */
const OmnibusContext = createContext<OmnibusContextValue | undefined>(undefined);

/**
 * Configuration
 */
const SOCKET_URL = 'ws://localhost:8081';
const MAX_BUFFER_SIZE = 100; // Keep last 100 data points per channel

/**
 * Omnibus Provider Component
 */
export const OmnibusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [channelData, setChannelData] = useState<ChannelDataMap>(new Map());
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse Omnibus message and convert to chart-ready format
   */
  const parseMessage = useCallback((msg: OmnibusMessage) => {
    const { data, relative_timestamps_nanoseconds, timestamp: baseTimestamp } = msg.payload;

    // Process each sensor channel (Fake0-Fake7)
    Object.entries(data).forEach(([sensorName, values]) => {
      // Convert each sample to chart data point
      const chartPoints: ChartDataPoint[] = values.map((value, idx) => ({
        timestamp: (baseTimestamp * 1000) + (relative_timestamps_nanoseconds[idx] / 1_000_000), // Convert base to ms, add relative offset in ms
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
      console.log('[Omnibus] Connected to backend');
      setConnectionStatus('connected');
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Omnibus] Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Omnibus] Connection error:', err.message);
      setConnectionStatus('error');
      setError(err.message);
    });

    // Message handler - parse incoming Omnibus data
    newSocket.on('message', (msg: OmnibusMessage) => {
      parseMessage(msg);
    });

    // Cleanup on unmount
    return () => {
      console.log('[Omnibus] Disconnecting socket');
      newSocket.close();
    };
  }, [parseMessage]);

  const value: OmnibusContextValue = {
    channelData,
    connectionStatus,
    error,
  };

  return <OmnibusContext.Provider value={value}>{children}</OmnibusContext.Provider>;
};

/**
 * Custom hook to consume Omnibus context
 */
export const useOmnibusContext = (): OmnibusContextValue => {
  const context = useContext(OmnibusContext);
  if (context === undefined) {
    throw new Error('useOmnibusContext must be used within an OmnibusProvider');
  }
  return context;
};
