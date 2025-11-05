import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { OmnibusMessage, ConnectionStatus } from '../types/omnibus';
import { useOmnibusStore } from '../store/omnibusStore';

/**
 * Context value interface
 */
export interface OmnibusContextValue {
  connectionStatus: ConnectionStatus;
  error: string | null;
}

/**
 * Omnibus Context for global WebSocket state management
 */
export const OmnibusContext = createContext<OmnibusContextValue | undefined>(undefined);

/**
 * Configuration
 */
const SOCKET_URL = 'http://localhost:8081';

/**
 * Omnibus Provider Component
 */
export const OmnibusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[Omnibus] Provider rendering');

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse Omnibus message and update latest values in Zustand store
   */
  const parseMessage = useCallback((msg: OmnibusMessage) => {
    console.log('[Omnibus] parseMessage called');
    const { data } = msg.payload;

    // Collect latest values for all sensors in this message
    const updates: Record<string, number> = {};

    Object.entries(data).forEach(([sensorName, values]) => {
      // Take the last value from the array as the latest
      const latestValue = values[values.length - 1];
      updates[sensorName] = latestValue;
    });

    // Single batch update to Zustand store
    useOmnibusStore.getState().updateChannels(updates);
  }, []);

  // Debug: Track when parseMessage changes
  useEffect(() => {
    console.log('[Omnibus] parseMessage function changed!');
  }, [parseMessage]);

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    console.log('[Omnibus] useEffect running - creating socket');

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Force WebSocket transport
      reconnection: true, // Enable auto-reconnection
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 5000, // Max 5s delay
      reconnectionAttempts: Infinity, // Keep trying
      pingInterval: 25000, // Send ping every 25 seconds (default: 25000)
      pingTimeout: 120000, // Wait 120 seconds for pong (default: 20000) - INCREASED!
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
      console.log('[Omnibus] useEffect cleanup - disconnecting socket');
      console.trace('[Omnibus] Cleanup stack trace');
      newSocket.close();
    };
  }, [parseMessage]);

  const value: OmnibusContextValue = {
    connectionStatus,
    error,
  };

  return <OmnibusContext.Provider value={value}>{children}</OmnibusContext.Provider>;
};
